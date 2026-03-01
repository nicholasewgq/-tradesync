import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { authenticateToken } from '../middleware/auth.js';
import { generateAnalysis } from '../utils/indicators.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for image uploads
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'chart-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, and WebP are allowed.'));
    }
  }
});

// Initialize Anthropic client
function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  return new Anthropic({ apiKey });
}

// Vision analysis prompt - HIGH-PROBABILITY SETUP FILTER
const VISION_ANALYSIS_PROMPT = `You are an expert technical analyst specializing in HIGH-PROBABILITY trade setups only.

CRITICAL: Your default response should be "Neutral" with recommendation "WAIT" unless you identify a CLEAR, HIGH-QUALITY setup with multiple confirming factors.

## CONFLUENCE SCORING SYSTEM
Score each factor present in the chart (you MUST count these):
- Price clearly above/below EMA200 (or major MA): 3 points
- Price clearly above/below EMA50 (or medium MA): 2 points
- Price clearly above/below EMA20 (or short MA): 1 point
- RSI confirmation (visibly overbought >70 for bear, oversold <30 for bull, OR trending with price): 2 points
- MACD/momentum indicator confirming direction: 2 points
- Volume confirming move (higher on direction candles): 1 point
- Clear chart pattern (double top/bottom, H&S, triangle breakout, etc.): 2 points
- Clean price structure (not choppy/ranging sideways): 2 points

TOTAL POSSIBLE: 15 points

## SETUP QUALITY GRADES
- A Grade (12+ points): Strong confluence, clear structure - TRADE SIGNAL
- B Grade (10-11 points): Good setup, proceed with caution - TRADE SIGNAL
- C Grade (7-9 points): Weak setup - OUTPUT "Neutral" with "WAIT"
- D Grade (<7 points): No clear setup - OUTPUT "Neutral" with "WAIT"

## AVOID CONDITIONS (Auto-downgrade to WAIT):
- Choppy, sideways, ranging price action
- Price stuck between major MAs with no clear direction
- Conflicting signals (bullish price, bearish indicators or vice versa)
- Near major news events visible on chart
- Very low volume/thin candles
- Middle of a range (not at support/resistance)

## REQUIREMENTS FOR BULLISH/BEARISH BIAS:
You MUST have AT LEAST 3 of these confirming:
1. Price above/below key moving averages
2. Momentum indicator (RSI/MACD) confirming
3. Clear pattern or structure
4. Volume confirmation
5. Clean trend (not choppy)

If you cannot identify 3+ confirming factors, output "Neutral" bias.

Provide your analysis in this exact JSON format:
{
  "bias": "Bullish" | "Bearish" | "Neutral",
  "setupGrade": "A" | "B" | "C" | "D",
  "confluenceScore": number (0-15 based on scoring above),
  "confluenceFactors": ["list each factor you counted and its points"],
  "trendStrength": "Weak" | "Moderate" | "Strong",
  "priceStructure": "Clean" | "Choppy" | "Ranging",
  "support": [array of price levels as numbers, or empty if not visible],
  "resistance": [array of price levels as numbers, or empty if not visible],
  "patterns": [array of pattern names detected],
  "entry": suggested entry price as number (0 if WAIT),
  "stopLoss": suggested stop loss as number (0 if WAIT),
  "takeProfit": suggested take profit as number (0 if WAIT),
  "riskRewardRatio": "X.XX" as string ("0.00" if WAIT),
  "confidence": number between 0-100 (based on: A=80-100, B=65-79, C=40-64, D=0-39),
  "recommendation": "LONG" | "SHORT" | "WAIT",
  "reasoning": "Brief explanation including why this IS or IS NOT a tradeable setup"
}

IMPORTANT:
- Only output "Bullish"/"Bearish" bias AND "LONG"/"SHORT" recommendation for A or B grade setups
- R:R must be >= 2.0 for a trade signal, otherwise output WAIT
- When in doubt, output WAIT - protecting capital is priority #1
- Be brutally honest about setup quality - most charts should return WAIT`;

// Analyze chart image using Claude Vision
async function analyzeChartImage(imagePath, timeframe) {
  const anthropic = getAnthropicClient();

  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');

  // Properly detect mime type
  const ext = path.extname(imagePath).toLowerCase();
  let mimeType = 'image/jpeg';
  if (ext === '.png') mimeType = 'image/png';
  else if (ext === '.webp') mimeType = 'image/webp';
  else if (ext === '.gif') mimeType = 'image/gif';
  else if (ext === '.jpg' || ext === '.jpeg') mimeType = 'image/jpeg';

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mimeType,
              data: base64Image
            }
          },
          {
            type: 'text',
            text: `${VISION_ANALYSIS_PROMPT}\n\nTimeframe: ${timeframe || 'Unknown'}`
          }
        ]
      }
    ]
  });

  const content = response.content[0].text;

  // Extract JSON from response - find the last complete JSON object
  let jsonStr = null;
  let braceCount = 0;
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < content.length; i++) {
    if (content[i] === '{') {
      if (braceCount === 0) startIndex = i;
      braceCount++;
    } else if (content[i] === '}') {
      braceCount--;
      if (braceCount === 0 && startIndex !== -1) {
        endIndex = i;
        jsonStr = content.substring(startIndex, endIndex + 1);
      }
    }
  }

  if (!jsonStr) {
    console.error('Failed to extract JSON from response:', content);
    throw new Error('Failed to parse AI response - no valid JSON found');
  }

  let analysis;
  try {
    analysis = JSON.parse(jsonStr);
  } catch (parseError) {
    console.error('JSON parse error:', parseError.message);
    console.error('Attempted to parse:', jsonStr);
    throw new Error('Failed to parse AI response - invalid JSON format');
  }

  // Ensure all required fields exist
  // Validate setup grade and enforce WAIT for low-quality setups
  const setupGrade = analysis.setupGrade || 'D';
  const isTradeableSetup = setupGrade === 'A' || setupGrade === 'B';

  // Override bias to Neutral if setup grade is C or D
  let finalBias = analysis.bias || 'Neutral';
  let finalRecommendation = analysis.recommendation || 'WAIT';

  if (!isTradeableSetup) {
    finalBias = 'Neutral';
    finalRecommendation = 'WAIT';
  }

  // Ensure R:R >= 2.0 for trade signals
  const rr = parseFloat(analysis.riskRewardRatio) || 0;
  if (rr < 2.0 && finalRecommendation !== 'WAIT') {
    finalRecommendation = 'WAIT';
    finalBias = 'Neutral';
  }

  return {
    bias: finalBias,
    setupGrade,
    confluenceScore: analysis.confluenceScore || 0,
    confluenceFactors: Array.isArray(analysis.confluenceFactors) ? analysis.confluenceFactors : [],
    trendStrength: analysis.trendStrength || 'Moderate',
    priceStructure: analysis.priceStructure || 'Choppy',
    support: Array.isArray(analysis.support) ? analysis.support : [],
    resistance: Array.isArray(analysis.resistance) ? analysis.resistance : [],
    patterns: Array.isArray(analysis.patterns) ? analysis.patterns : [],
    entry: isTradeableSetup ? (analysis.entry || 0) : 0,
    stopLoss: isTradeableSetup ? (analysis.stopLoss || 0) : 0,
    takeProfit: isTradeableSetup ? (analysis.takeProfit || 0) : 0,
    riskRewardRatio: isTradeableSetup ? (analysis.riskRewardRatio || '0.00') : '0.00',
    confidence: analysis.confidence || (setupGrade === 'A' ? 85 : setupGrade === 'B' ? 70 : setupGrade === 'C' ? 50 : 25),
    recommendation: finalRecommendation,
    reasoning: analysis.reasoning || '',
    source: 'vision'
  };
}

// Analyze OHLC data using indicators + AI reasoning
async function analyzeOHLCData(candles, timeframe) {
  // First, generate technical analysis from indicators
  const technicalAnalysis = generateAnalysis(candles);

  // If Claude is available, enhance with AI reasoning
  try {
    const anthropic = getAnthropicClient();

    const analysisContext = `
Technical Analysis Data:
- Current Price: ${candles[candles.length - 1].close}
- Bias from indicators: ${technicalAnalysis.bias}
- Trend Strength: ${technicalAnalysis.trendStrength}
- RSI(14): ${technicalAnalysis.indicators.rsi}
- MACD Histogram: ${technicalAnalysis.indicators.macd}
- EMA20: ${technicalAnalysis.indicators.ema20}
- EMA50: ${technicalAnalysis.indicators.ema50}
- EMA200: ${technicalAnalysis.indicators.ema200}
- Volume Trend: ${technicalAnalysis.indicators.volumeTrend}
- Support Levels: ${technicalAnalysis.support.join(', ') || 'None identified'}
- Resistance Levels: ${technicalAnalysis.resistance.join(', ') || 'None identified'}
- Patterns Detected: ${technicalAnalysis.patterns.join(', ') || 'None'}
- Timeframe: ${timeframe}

Recent OHLC (last 10 candles):
${candles.slice(-10).map((c, i) => `${i + 1}. O:${c.open} H:${c.high} L:${c.low} C:${c.close}`).join('\n')}
`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: 'You are an expert technical analyst. Provide trading insights based on the technical data provided. Be concise and actionable.',
      messages: [
        {
          role: 'user',
          content: `${analysisContext}\n\nProvide a brief trading reasoning (2-3 sentences) explaining the setup and any additional pattern insights not captured by the indicators. Focus on actionable entry/exit logic.`
        }
      ]
    });

    technicalAnalysis.reasoning = response.content[0].text;
    technicalAnalysis.source = 'ohlc_ai_enhanced';
  } catch (error) {
    // If AI enhancement fails, use basic reasoning
    technicalAnalysis.reasoning = generateBasicReasoning(technicalAnalysis);
    technicalAnalysis.source = 'ohlc_indicators';
  }

  return technicalAnalysis;
}

function generateBasicReasoning(analysis) {
  const parts = [];

  if (analysis.bias === 'Bullish') {
    parts.push('Price action shows bullish momentum with price above key moving averages.');
  } else if (analysis.bias === 'Bearish') {
    parts.push('Price action shows bearish pressure with price below key moving averages.');
  } else {
    parts.push('Market is consolidating with mixed signals from indicators.');
  }

  if (analysis.indicators.rsi > 70) {
    parts.push('RSI is in overbought territory, suggesting potential pullback.');
  } else if (analysis.indicators.rsi < 30) {
    parts.push('RSI is in oversold territory, suggesting potential bounce.');
  }

  if (analysis.patterns.length > 0) {
    parts.push(`Detected patterns: ${analysis.patterns.join(', ')}.`);
  }

  return parts.join(' ');
}

// Parse CSV OHLC data
function parseCSV(csvString) {
  const lines = csvString.trim().split('\n');
  const candles = [];

  // Skip header if present
  const startIndex = lines[0].toLowerCase().includes('open') ? 1 : 0;

  for (let i = startIndex; i < lines.length; i++) {
    const values = lines[i].split(',').map(v => v.trim());

    if (values.length >= 4) {
      const candle = {
        open: parseFloat(values[0]) || parseFloat(values[1]),
        high: parseFloat(values[1]) || parseFloat(values[2]),
        low: parseFloat(values[2]) || parseFloat(values[3]),
        close: parseFloat(values[3]) || parseFloat(values[4]),
        volume: parseFloat(values[4]) || parseFloat(values[5]) || 0
      };

      if (!isNaN(candle.open) && !isNaN(candle.close)) {
        candles.push(candle);
      }
    }
  }

  return candles;
}

// Parse JSON OHLC data
function parseOHLCJSON(data) {
  if (Array.isArray(data)) {
    return data.map(item => ({
      open: parseFloat(item.open || item.o || item.Open || 0),
      high: parseFloat(item.high || item.h || item.High || 0),
      low: parseFloat(item.low || item.l || item.Low || 0),
      close: parseFloat(item.close || item.c || item.Close || 0),
      volume: parseFloat(item.volume || item.v || item.Volume || 0)
    }));
  }
  return [];
}

// Main analyze endpoint
router.post('/', authenticateToken, upload.single('chart'), async (req, res) => {
  try {
    const { ohlcData, timeframe = '1H', dataFormat = 'json' } = req.body;

    let analysis;

    if (req.file) {
      // Image analysis
      try {
        analysis = await analyzeChartImage(req.file.path, timeframe);
      } finally {
        // Clean up uploaded file
        fs.unlink(req.file.path, () => {});
      }
    } else if (ohlcData) {
      // OHLC data analysis
      let candles;

      if (dataFormat === 'csv') {
        candles = parseCSV(ohlcData);
      } else {
        const jsonData = typeof ohlcData === 'string' ? JSON.parse(ohlcData) : ohlcData;
        candles = parseOHLCJSON(jsonData);
      }

      if (candles.length < 20) {
        return res.status(400).json({
          error: 'Insufficient data. Please provide at least 20 candles for accurate analysis.'
        });
      }

      analysis = await analyzeOHLCData(candles, timeframe);
    } else {
      return res.status(400).json({
        error: 'Please provide either a chart image or OHLC data'
      });
    }

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Analysis error:', error);

    // Handle specific error types
    if (error.message.includes('ANTHROPIC_API_KEY')) {
      return res.status(503).json({
        error: 'AI service not configured. Please set ANTHROPIC_API_KEY in .env file.'
      });
    }

    // Handle Anthropic API errors
    if (error.status === 401 || error.message.includes('authentication') || error.message.includes('invalid_api_key')) {
      return res.status(503).json({
        error: 'Invalid API key. Please check your ANTHROPIC_API_KEY in the .env file.'
      });
    }

    if (error.status === 400 || error.message.includes('invalid_request')) {
      return res.status(400).json({
        error: 'Invalid request to AI service. Please try a different image.'
      });
    }

    if (error.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait a moment and try again.'
      });
    }

    // Handle network/connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'Unable to connect to AI service. Please check your internet connection.'
      });
    }

    res.status(500).json({
      error: error.message || 'Analysis failed. Please try again.'
    });
  }
});

// Health check for AI service
router.get('/status', authenticateToken, (req, res) => {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    configured: hasApiKey,
    message: hasApiKey
      ? 'AI service is configured and ready'
      : 'ANTHROPIC_API_KEY is not set. Add it to server/.env file.'
  });
});

export default router;
