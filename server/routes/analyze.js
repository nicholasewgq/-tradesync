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

// Configure multer for image uploads - use memory storage for Railway compatibility
const upload = multer({
  storage: multer.memoryStorage(),
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

// Vision analysis prompt - PRECISION TRADING ANALYSIS
const VISION_ANALYSIS_PROMPT = `You are a professional trader analyzing charts. Be PRECISE and ACCURATE.

## STEP 1: READ THE CHART CAREFULLY
- What is the current price shown?
- What timeframe is displayed?
- What indicators are visible (EMAs, RSI, MACD, Bollinger Bands, etc.)?
- Read the ACTUAL indicator values from the chart

## STEP 2: DETERMINE TREND
Look at price structure:
- UPTREND: Higher highs AND higher lows, price above major MAs
- DOWNTREND: Lower highs AND lower lows, price below major MAs
- SIDEWAYS: No clear direction, price oscillating in range

## STEP 3: FIND KEY LEVELS (read from chart)
- Support: Recent swing lows, areas where price bounced UP
- Resistance: Recent swing highs, areas where price rejected DOWN
- Round numbers (1.1800, 1.1900, etc.)

## STEP 4: CHECK INDICATORS
- RSI: Below 30 = oversold (look for longs), Above 70 = overbought (look for shorts), 40-60 = neutral
- MACD: Histogram positive = bullish momentum, negative = bearish
- Moving Averages: Price above = bullish, below = bearish

## STEP 5: IDENTIFY PATTERNS
Look for: Double top/bottom, head & shoulders, triangles, flags, channels, trendlines

## STEP 6: CALCULATE ENTRY/STOP/TARGET
- LONG entry: At support or breakout above resistance
- SHORT entry: At resistance or breakdown below support
- Stop loss: Below support for longs, above resistance for shorts
- Take profit: Next resistance for longs, next support for shorts
- R:R = (Target - Entry) / (Entry - Stop)

## OUTPUT FORMAT (JSON):
{
  "bias": "Bullish" | "Bearish" | "Neutral",
  "setupGrade": "A" | "B" | "C" | "D",
  "confluenceScore": 0-10,
  "confluenceFactors": ["specific factors from the chart"],
  "trendStrength": "Weak" | "Moderate" | "Strong",
  "priceStructure": "Clean" | "Choppy" | "Ranging",
  "support": [exact price levels from chart],
  "resistance": [exact price levels from chart],
  "patterns": ["patterns you see"],
  "entry": exact entry price,
  "stopLoss": exact stop price,
  "takeProfit": exact target price,
  "riskRewardRatio": "X.XX",
  "confidence": 0-100,
  "recommendation": "LONG" | "SHORT" | "WAIT",
  "reasoning": "Specific explanation referencing what you see on the chart"
}

## GRADING:
- A (80-100% conf): Strong trend + indicator confirmation + at key level + pattern
- B (65-79% conf): Clear trend + 2 confirmations
- C (50-64% conf): Weak setup, mixed signals
- D (below 50%): No clear setup, choppy, conflicting signals

Give LONG/SHORT for A or B grades. Give WAIT for C or D. Be specific with price levels!`;

// Analyze chart image using Claude Vision
async function analyzeChartImage(fileBuffer, mimeType, timeframe) {
  const anthropic = getAnthropicClient();

  // Validate buffer has content
  if (!fileBuffer || fileBuffer.length === 0) {
    throw new Error('Image buffer is empty');
  }

  console.log(`Processing image buffer, size: ${fileBuffer.length} bytes, type: ${mimeType}`);

  const base64Image = fileBuffer.toString('base64');

  if (!base64Image || base64Image.length === 0) {
    throw new Error('Failed to encode image to base64');
  }

  console.log(`Base64 encoded, length: ${base64Image.length} chars`);

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
  // Validate setup grade - ONLY A and B grades get signals for high win rate
  const setupGrade = analysis.setupGrade || 'D';
  const isTradeableSetup = setupGrade === 'A' || setupGrade === 'B';

  let finalBias = analysis.bias || 'Neutral';
  let finalRecommendation = analysis.recommendation || 'WAIT';

  // Force WAIT for C and D grades
  if (!isTradeableSetup) {
    finalBias = 'Neutral';
    finalRecommendation = 'WAIT';
  }

  // Require 2:1 R:R minimum for high win rate
  const rr = parseFloat(analysis.riskRewardRatio) || 0;
  if (rr < 2.0 && finalRecommendation !== 'WAIT') {
    finalRecommendation = 'WAIT';
    finalBias = 'Neutral';
    analysis.reasoning = (analysis.reasoning || '') + ' (R:R below 2:1 - waiting for better entry)';
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
    confidence: analysis.confidence || (setupGrade === 'A' ? 85 : setupGrade === 'B' ? 65 : setupGrade === 'C' ? 45 : 20),
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
      // Image analysis - using memory storage, file data is in req.file.buffer
      const mimeType = req.file.mimetype || 'image/jpeg';
      analysis = await analyzeChartImage(req.file.buffer, mimeType, timeframe);
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
