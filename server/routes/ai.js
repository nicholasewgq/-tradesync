import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { getDb } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  return new Anthropic({ apiKey });
}

function rowsToObjects(result) {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(values => {
    const obj = {};
    columns.forEach((col, i) => {
      obj[col] = values[i];
    });
    return obj;
  });
}

// ============================================
// AI TRADE COACH - Analyzes trading patterns
// ============================================
router.post('/coach', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const anthropic = getAnthropicClient();

    // Get user's closed trades
    const tradesResult = db.exec(
      "SELECT * FROM trades WHERE user_id = ? AND status = 'closed' ORDER BY closed_at DESC LIMIT 100",
      [req.user.id]
    );
    const trades = rowsToObjects(tradesResult);

    if (trades.length < 5) {
      return res.status(400).json({
        error: 'Need at least 5 closed trades for meaningful analysis'
      });
    }

    // Calculate stats
    const winningTrades = trades.filter(t => t.profit_loss > 0);
    const losingTrades = trades.filter(t => t.profit_loss < 0);
    const totalProfit = trades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);
    const winRate = ((winningTrades.length / trades.length) * 100).toFixed(1);
    const avgWin = winningTrades.length > 0
      ? winningTrades.reduce((sum, t) => sum + t.profit_loss, 0) / winningTrades.length
      : 0;
    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + t.profit_loss, 0) / losingTrades.length)
      : 0;

    // Analyze by trade type
    const swingTrades = trades.filter(t => t.type === 'swing');
    const scalpTrades = trades.filter(t => t.type === 'scalp');
    const swingWinRate = swingTrades.length > 0
      ? ((swingTrades.filter(t => t.profit_loss > 0).length / swingTrades.length) * 100).toFixed(1)
      : 'N/A';
    const scalpWinRate = scalpTrades.length > 0
      ? ((scalpTrades.filter(t => t.profit_loss > 0).length / scalpTrades.length) * 100).toFixed(1)
      : 'N/A';

    // Analyze by direction
    const longTrades = trades.filter(t => t.direction === 'long');
    const shortTrades = trades.filter(t => t.direction === 'short');
    const longWinRate = longTrades.length > 0
      ? ((longTrades.filter(t => t.profit_loss > 0).length / longTrades.length) * 100).toFixed(1)
      : 'N/A';
    const shortWinRate = shortTrades.length > 0
      ? ((shortTrades.filter(t => t.profit_loss > 0).length / shortTrades.length) * 100).toFixed(1)
      : 'N/A';

    // Find patterns in losing trades
    const losingPairs = {};
    losingTrades.forEach(t => {
      losingPairs[t.pair] = (losingPairs[t.pair] || 0) + 1;
    });

    // Recent performance (last 10 trades)
    const recent10 = trades.slice(0, 10);
    const recentWinRate = ((recent10.filter(t => t.profit_loss > 0).length / recent10.length) * 100).toFixed(1);

    const tradingData = `
TRADER PERFORMANCE DATA:
========================
Total Closed Trades: ${trades.length}
Overall Win Rate: ${winRate}%
Total P/L: $${totalProfit.toFixed(2)}
Average Win: $${avgWin.toFixed(2)}
Average Loss: $${avgLoss.toFixed(2)}
Risk/Reward Ratio: ${avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : 'N/A'}

BY TRADE TYPE:
- Swing Trades: ${swingTrades.length} (Win Rate: ${swingWinRate}%)
- Scalp Trades: ${scalpTrades.length} (Win Rate: ${scalpWinRate}%)

BY DIRECTION:
- Long Trades: ${longTrades.length} (Win Rate: ${longWinRate}%)
- Short Trades: ${shortTrades.length} (Win Rate: ${shortWinRate}%)

RECENT PERFORMANCE (Last 10):
- Win Rate: ${recentWinRate}%
- Trend: ${parseFloat(recentWinRate) > parseFloat(winRate) ? 'Improving' : 'Declining'}

MOST COMMON LOSING PAIRS:
${Object.entries(losingPairs).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([pair, count]) => `- ${pair}: ${count} losses`).join('\n')}

SAMPLE RECENT TRADES:
${trades.slice(0, 15).map(t => `- ${t.pair} ${t.direction.toUpperCase()} ${t.type}: Entry $${t.entry_price}, Exit $${t.exit_price || 'Open'}, P/L: $${t.profit_loss?.toFixed(2) || 'N/A'}, R:R ${t.risk_reward || 'N/A'}`).join('\n')}
`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are an elite trading coach with decades of experience. Analyze this trader's performance data and provide personalized coaching.

${tradingData}

Provide your analysis in this JSON format:
{
  "overallGrade": "A/B/C/D/F",
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2", "weakness3"],
  "patterns": {
    "positive": ["pattern1", "pattern2"],
    "negative": ["pattern1", "pattern2"]
  },
  "recommendations": [
    {
      "priority": "high/medium/low",
      "title": "Short title",
      "description": "Detailed actionable advice"
    }
  ],
  "focusArea": "The ONE thing they should focus on improving",
  "motivation": "A brief encouraging message based on their data"
}

Be specific, actionable, and reference their actual data. Don't be generic.`
        }
      ]
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    res.json({
      success: true,
      analysis,
      stats: {
        totalTrades: trades.length,
        winRate: parseFloat(winRate),
        totalProfit,
        avgWin,
        avgLoss
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Coach error:', error);
    if (error.message.includes('ANTHROPIC_API_KEY')) {
      return res.status(503).json({ error: 'Claude AI not configured. Add ANTHROPIC_API_KEY to .env' });
    }
    res.status(500).json({ error: error.message || 'AI analysis failed' });
  }
});

// ============================================
// SMART SIGNALS - Entry/Exit recommendations
// HIGH-PROBABILITY SETUP FILTER
// ============================================
router.post('/signals', authenticateToken, async (req, res) => {
  try {
    const { symbol, currentPrice, timeframe = '1H', marketContext } = req.body;
    const anthropic = getAnthropicClient();

    if (!symbol || !currentPrice) {
      return res.status(400).json({ error: 'symbol and currentPrice required' });
    }

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are an expert technical analyst who ONLY recommends HIGH-PROBABILITY setups.

CRITICAL: Your default recommendation should be "WAIT" unless there is a CLEAR, HIGH-QUALITY setup.

Symbol: ${symbol}
Current Price: $${currentPrice}
Timeframe: ${timeframe}
${marketContext ? `Market Context: ${marketContext}` : ''}

## CONFLUENCE SCORING (you must evaluate):
- Clear trend direction: 3 points
- Price at key support/resistance: 2 points
- Momentum confirmation (RSI 30-45 for longs, 55-70 for shorts): 2 points
- Volume pattern supporting move: 1 point
- Chart pattern present: 2 points
- Clean price structure (not choppy): 2 points
- Risk:Reward >= 2:1 achievable: 3 points

TOTAL POSSIBLE: 15 points

## SETUP GRADES:
- A Grade (12+ points): Strong setup - Give LONG or SHORT recommendation
- B Grade (10-11 points): Good setup - Give LONG or SHORT recommendation
- C Grade (7-9 points): Weak setup - Recommend WAIT
- D Grade (<7 points): No setup - Recommend WAIT

## REQUIREMENTS FOR TRADE SIGNAL:
1. Setup grade must be A or B
2. Risk:Reward must be >= 2.0
3. No conflicting major signals
4. Clear invalidation level for stop loss

If ANY requirement is not met, recommend "WAIT".

Provide analysis in this JSON format:
{
  "bias": "Bullish" | "Bearish" | "Neutral",
  "setupGrade": "A" | "B" | "C" | "D",
  "confluenceScore": number (0-15),
  "confluenceFactors": ["factor1 (+X points)", "factor2 (+X points)"],
  "confidence": 0-100 (A=80-100, B=65-79, C=40-64, D=<40),
  "signals": {
    "long": {
      "entry": price (0 if not recommending long),
      "stopLoss": price,
      "takeProfit1": price,
      "takeProfit2": price,
      "takeProfit3": price,
      "riskReward": "X.XX",
      "reasoning": "Why this long setup works or why it doesn't"
    },
    "short": {
      "entry": price (0 if not recommending short),
      "stopLoss": price,
      "takeProfit1": price,
      "takeProfit2": price,
      "takeProfit3": price,
      "riskReward": "X.XX",
      "reasoning": "Why this short setup works or why it doesn't"
    }
  },
  "keyLevels": {
    "strongSupport": [prices],
    "support": [prices],
    "resistance": [prices],
    "strongResistance": [prices]
  },
  "recommendation": "LONG" | "SHORT" | "WAIT",
  "waitReason": "If WAIT, explain what needs to happen for a valid setup",
  "summary": "2-3 sentence summary explaining your decision"
}

IMPORTANT:
- Be conservative - most market conditions should return "WAIT"
- Only A and B grade setups should get LONG/SHORT recommendations
- R:R must be >= 2.0 for any trade signal
- If conflicting signals exist, recommend WAIT
- Protecting capital is priority #1`
        }
      ]
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const signals = JSON.parse(jsonMatch[0]);

    // Enforce setup grade requirements on the server side
    const setupGrade = signals.setupGrade || 'D';
    const isTradeableSetup = setupGrade === 'A' || setupGrade === 'B';

    // Override recommendation if setup grade doesn't qualify
    if (!isTradeableSetup && signals.recommendation !== 'WAIT') {
      signals.recommendation = 'WAIT';
      signals.bias = 'Neutral';
      signals.waitReason = signals.waitReason || `Setup grade ${setupGrade} does not meet minimum requirements (A or B required)`;
    }

    // Enforce minimum R:R
    if (signals.recommendation === 'LONG') {
      const rr = parseFloat(signals.signals?.long?.riskReward) || 0;
      if (rr < 2.0) {
        signals.recommendation = 'WAIT';
        signals.waitReason = `Long R:R of ${rr} is below minimum 2.0 requirement`;
      }
    } else if (signals.recommendation === 'SHORT') {
      const rr = parseFloat(signals.signals?.short?.riskReward) || 0;
      if (rr < 2.0) {
        signals.recommendation = 'WAIT';
        signals.waitReason = `Short R:R of ${rr} is below minimum 2.0 requirement`;
      }
    }

    // Adjust confidence based on setup grade if not already aligned
    if (setupGrade === 'A' && signals.confidence < 80) {
      signals.confidence = 80;
    } else if (setupGrade === 'B' && (signals.confidence < 65 || signals.confidence >= 80)) {
      signals.confidence = Math.max(65, Math.min(79, signals.confidence));
    } else if (setupGrade === 'C' && signals.confidence >= 65) {
      signals.confidence = 50;
    } else if (setupGrade === 'D' && signals.confidence >= 40) {
      signals.confidence = 30;
    }

    res.json({
      success: true,
      symbol: symbol.toUpperCase(),
      currentPrice,
      timeframe,
      signals,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('AI Signals error:', error);
    if (error.message.includes('ANTHROPIC_API_KEY')) {
      return res.status(503).json({ error: 'Claude AI not configured. Add ANTHROPIC_API_KEY to .env' });
    }
    res.status(500).json({ error: error.message || 'Signal generation failed' });
  }
});

// ============================================
// MARKET SUMMARY - Daily AI market analysis
// ============================================
router.get('/market-summary', authenticateToken, async (req, res) => {
  try {
    const anthropic = getAnthropicClient();

    // Get current date info
    const now = new Date();
    const dayOfWeek = now.toLocaleDateString('en-US', { weekday: 'long' });
    const dateStr = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a senior market analyst. Generate a comprehensive daily market briefing for ${dayOfWeek}, ${dateStr}.

Provide your analysis in this JSON format:
{
  "marketOutlook": "Bullish" | "Bearish" | "Neutral" | "Cautious",
  "confidenceLevel": 0-100,
  "summary": "2-3 sentence executive summary",
  "indices": {
    "SPY": { "outlook": "Bullish/Bearish/Neutral", "keyLevel": "price area to watch" },
    "QQQ": { "outlook": "Bullish/Bearish/Neutral", "keyLevel": "price area to watch" },
    "IWM": { "outlook": "Bullish/Bearish/Neutral", "keyLevel": "price area to watch" }
  },
  "sectors": {
    "hot": ["sector1", "sector2"],
    "cold": ["sector1", "sector2"]
  },
  "watchlist": [
    { "symbol": "TICK", "reason": "Why to watch", "direction": "Long/Short" }
  ],
  "keyEvents": ["event1", "event2"],
  "riskFactors": ["risk1", "risk2"],
  "tradingPlan": {
    "scalping": "Advice for scalpers today",
    "swingTrading": "Advice for swing traders",
    "avoidToday": "What to avoid"
  },
  "quote": "An inspirational or cautionary trading quote for the day"
}

Be specific and actionable. Consider typical market patterns for ${dayOfWeek}s.`
        }
      ]
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const summary = JSON.parse(jsonMatch[0]);

    res.json({
      success: true,
      date: dateStr,
      dayOfWeek,
      summary,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market Summary error:', error);
    if (error.message.includes('ANTHROPIC_API_KEY')) {
      return res.status(503).json({ error: 'Claude AI not configured. Add ANTHROPIC_API_KEY to .env' });
    }
    res.status(500).json({ error: error.message || 'Market summary failed' });
  }
});

// ============================================
// TRADE ANALYSIS - Analyze a specific trade
// ============================================
router.post('/analyze-trade', authenticateToken, async (req, res) => {
  try {
    const {
      symbol, direction, entryPrice, exitPrice, stopLoss, takeProfit,
      quantity, outcome, notes, timeframe
    } = req.body;

    const anthropic = getAnthropicClient();

    const profitLoss = exitPrice
      ? (direction === 'long' ? exitPrice - entryPrice : entryPrice - exitPrice) * quantity
      : null;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `Analyze this trade as an expert trading coach:

Trade Details:
- Symbol: ${symbol}
- Direction: ${direction}
- Entry: $${entryPrice}
- Exit: ${exitPrice ? `$${exitPrice}` : 'Still open'}
- Stop Loss: ${stopLoss ? `$${stopLoss}` : 'Not set'}
- Take Profit: ${takeProfit ? `$${takeProfit}` : 'Not set'}
- Quantity: ${quantity}
- P/L: ${profitLoss !== null ? `$${profitLoss.toFixed(2)}` : 'Open'}
- Timeframe: ${timeframe || 'Unknown'}
- Notes: ${notes || 'None'}

Provide analysis in JSON format:
{
  "grade": "A/B/C/D/F",
  "execution": {
    "entryQuality": "Excellent/Good/Fair/Poor",
    "exitQuality": "Excellent/Good/Fair/Poor/N/A",
    "riskManagement": "Excellent/Good/Fair/Poor"
  },
  "whatWentWell": ["point1", "point2"],
  "whatToImprove": ["point1", "point2"],
  "lessonsLearned": "Key takeaway from this trade",
  "similarSetups": "How to trade similar setups better in the future"
}`
        }
      ]
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const analysis = JSON.parse(jsonMatch[0]);

    res.json({
      success: true,
      trade: { symbol, direction, entryPrice, exitPrice, profitLoss },
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Trade Analysis error:', error);
    if (error.message.includes('ANTHROPIC_API_KEY')) {
      return res.status(503).json({ error: 'Claude AI not configured. Add ANTHROPIC_API_KEY to .env' });
    }
    res.status(500).json({ error: error.message || 'Trade analysis failed' });
  }
});

// Check API status
router.get('/status', authenticateToken, (req, res) => {
  const hasApiKey = !!process.env.ANTHROPIC_API_KEY;
  res.json({
    configured: hasApiKey,
    provider: 'Claude (Anthropic)',
    model: 'claude-sonnet-4-20250514',
    features: ['Trade Coach', 'Smart Signals', 'Market Summary', 'Trade Analysis'],
    message: hasApiKey
      ? 'Claude AI is configured and ready'
      : 'ANTHROPIC_API_KEY is not set. Get your key at https://console.anthropic.com/'
  });
});

export default router;
