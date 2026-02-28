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
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `You are a professional technical analyst. Generate smart trading signals for:

Symbol: ${symbol}
Current Price: $${currentPrice}
Timeframe: ${timeframe}
${marketContext ? `Market Context: ${marketContext}` : ''}

Provide analysis in this JSON format:
{
  "bias": "Bullish" | "Bearish" | "Neutral",
  "confidence": 0-100,
  "signals": {
    "long": {
      "entry": price,
      "stopLoss": price,
      "takeProfit1": price,
      "takeProfit2": price,
      "takeProfit3": price,
      "riskReward": "X.XX",
      "reasoning": "Why this long setup"
    },
    "short": {
      "entry": price,
      "stopLoss": price,
      "takeProfit1": price,
      "takeProfit2": price,
      "takeProfit3": price,
      "riskReward": "X.XX",
      "reasoning": "Why this short setup"
    }
  },
  "keyLevels": {
    "strongSupport": [prices],
    "support": [prices],
    "resistance": [prices],
    "strongResistance": [prices]
  },
  "recommendation": "LONG" | "SHORT" | "WAIT",
  "summary": "2-3 sentence summary of the setup"
}

Use realistic price levels based on the current price. Calculate proper risk/reward ratios.`
        }
      ]
    });

    const content = message.content[0].text;
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      throw new Error('Failed to parse AI response');
    }

    const signals = JSON.parse(jsonMatch[0]);

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
