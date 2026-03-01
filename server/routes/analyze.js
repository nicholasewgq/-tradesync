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

// Vision analysis prompt - HIGH WIN RATE FILTER
const VISION_ANALYSIS_PROMPT = `You are an elite technical analyst. Your job is to find ONLY the highest probability setups that have 80%+ historical win rates.

## STRICT ENTRY CRITERIA - ALL MUST BE MET FOR A SIGNAL:
1. Clear trend direction (price making higher highs/lows OR lower highs/lows)
2. Price respecting key moving average (bouncing off or breaking through with momentum)
3. RSI/MACD confirming the move (not diverging against price)
4. Clean price structure (NOT choppy, ranging, or consolidating)
5. Clear entry at support/resistance with tight stop loss
6. Minimum 2:1 reward-to-risk ratio

## AUTOMATIC WAIT CONDITIONS:
- Price is choppy or ranging sideways
- Mixed signals (bullish price but bearish indicators)
- No clear support/resistance for stop placement
- Middle of a range (not at key level)
- Overextended move (RSI >75 for longs, <25 for shorts)
- Low volume or unclear candles

## SETUP QUALITY GRADES
- A Grade: 5+ factors aligned, clear trend, perfect entry = SIGNAL (80%+ confidence)
- B Grade: 4 factors aligned, good setup = SIGNAL (70-79% confidence)
- C Grade: 3 factors, decent but risky = WAIT (be patient)
- D Grade: Less than 3 factors = WAIT (no trade)

Provide your analysis in this exact JSON format:
{
  "bias": "Bullish" | "Bearish" | "Neutral",
  "setupGrade": "A" | "B" | "C" | "D",
  "confluenceScore": number (0-10),
  "confluenceFactors": ["list each confirming factor"],
  "trendStrength": "Weak" | "Moderate" | "Strong",
  "priceStructure": "Clean" | "Choppy" | "Ranging",
  "support": [price levels],
  "resistance": [price levels],
  "patterns": [pattern names],
  "entry": entry price (0 if WAIT),
  "stopLoss": stop loss price (0 if WAIT),
  "takeProfit": take profit price (0 if WAIT),
  "riskRewardRatio": "X.XX" string,
  "confidence": number 0-100,
  "recommendation": "LONG" | "SHORT" | "WAIT",
  "reasoning": "Why this is or isn't a high-probability setup"
}

CRITICAL: Only give LONG/SHORT for A or B grade setups. Your signals should win 80% of the time - if unsure, output WAIT. Patience beats overtrading.`;

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
