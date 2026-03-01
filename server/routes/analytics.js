import express from 'express';
import { getDb } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

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

// Summary statistics
router.get('/summary', authenticateToken, (req, res) => {
  try {
    const db = getDb();

    const closedResult = db.exec(
      "SELECT * FROM trades WHERE user_id = ? AND status = 'closed'",
      [req.user.id]
    );
    const closedTrades = rowsToObjects(closedResult);

    const openResult = db.exec(
      "SELECT * FROM trades WHERE user_id = ? AND status = 'open'",
      [req.user.id]
    );
    const openTrades = rowsToObjects(openResult);

    const totalTrades = closedTrades.length;
    const winningTrades = closedTrades.filter(t => t.profit_loss > 0);
    const losingTrades = closedTrades.filter(t => t.profit_loss < 0);

    const winRate = totalTrades > 0
      ? ((winningTrades.length / totalTrades) * 100).toFixed(1)
      : 80;

    const totalProfit = closedTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0);

    const grossProfit = winningTrades.reduce((sum, t) => sum + t.profit_loss, 0);
    const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profit_loss, 0));

    const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : grossProfit > 0 ? 'Infinity' : 0;

    const avgWin = winningTrades.length > 0
      ? (grossProfit / winningTrades.length).toFixed(2)
      : 0;

    const avgLoss = losingTrades.length > 0
      ? (grossLoss / losingTrades.length).toFixed(2)
      : 0;

    const largestWin = winningTrades.length > 0
      ? Math.max(...winningTrades.map(t => t.profit_loss))
      : 0;

    const largestLoss = losingTrades.length > 0
      ? Math.min(...losingTrades.map(t => t.profit_loss))
      : 0;

    const swingTrades = closedTrades.filter(t => t.type === 'swing');
    const scalpTrades = closedTrades.filter(t => t.type === 'scalp');

    // Calculate expectancy
    const expectancy = totalTrades > 0
      ? ((parseFloat(winRate) / 100 * parseFloat(avgWin)) - ((100 - parseFloat(winRate)) / 100 * parseFloat(avgLoss))).toFixed(2)
      : 0;

    // Calculate consecutive wins/losses
    let maxConsecWins = 0, maxConsecLosses = 0;
    let currentConsecWins = 0, currentConsecLosses = 0;

    closedTrades.sort((a, b) => new Date(a.closed_at) - new Date(b.closed_at)).forEach(t => {
      if (t.profit_loss > 0) {
        currentConsecWins++;
        currentConsecLosses = 0;
        maxConsecWins = Math.max(maxConsecWins, currentConsecWins);
      } else if (t.profit_loss < 0) {
        currentConsecLosses++;
        currentConsecWins = 0;
        maxConsecLosses = Math.max(maxConsecLosses, currentConsecLosses);
      }
    });

    res.json({
      totalTrades,
      openTrades: openTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: parseFloat(winRate),
      totalProfit: parseFloat(totalProfit.toFixed(2)),
      profitFactor: parseFloat(profitFactor) || 0,
      avgWin: parseFloat(avgWin),
      avgLoss: parseFloat(avgLoss),
      largestWin,
      largestLoss,
      swingTrades: swingTrades.length,
      scalpTrades: scalpTrades.length,
      swingProfit: swingTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0).toFixed(2),
      scalpProfit: scalpTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0).toFixed(2),
      expectancy: parseFloat(expectancy),
      maxConsecutiveWins: maxConsecWins,
      maxConsecutiveLosses: maxConsecLosses,
      averageHoldTime: calculateAverageHoldTime(closedTrades)
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Calculate average hold time in hours
function calculateAverageHoldTime(trades) {
  const tradesWithTime = trades.filter(t => t.entry_date && t.closed_at);
  if (tradesWithTime.length === 0) return 0;

  const totalHours = tradesWithTime.reduce((sum, t) => {
    const entry = new Date(t.entry_date);
    const exit = new Date(t.closed_at);
    return sum + (exit - entry) / (1000 * 60 * 60);
  }, 0);

  return (totalHours / tradesWithTime.length).toFixed(1);
}

// Equity curve with drawdown
router.get('/equity', authenticateToken, (req, res) => {
  try {
    const db = getDb();

    const result = db.exec(`
      SELECT profit_loss, closed_at
      FROM trades
      WHERE user_id = ? AND status = 'closed' AND profit_loss IS NOT NULL
      ORDER BY closed_at ASC
    `, [req.user.id]);

    const trades = rowsToObjects(result);

    let runningTotal = 0;
    let peak = 0;
    const equityData = trades.map(trade => {
      runningTotal += trade.profit_loss;
      peak = Math.max(peak, runningTotal);
      const drawdown = peak > 0 ? ((peak - runningTotal) / peak * 100) : 0;

      return {
        date: trade.closed_at,
        equity: parseFloat(runningTotal.toFixed(2)),
        peak: parseFloat(peak.toFixed(2)),
        drawdown: parseFloat(drawdown.toFixed(2))
      };
    });

    equityData.unshift({ date: null, equity: 0, peak: 0, drawdown: 0 });

    // Calculate max drawdown
    const maxDrawdown = Math.max(...equityData.map(d => d.drawdown));

    res.json({
      curve: equityData,
      maxDrawdown: parseFloat(maxDrawdown.toFixed(2)),
      currentEquity: equityData[equityData.length - 1]?.equity || 0
    });
  } catch (error) {
    console.error('Equity curve error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Monthly performance
router.get('/monthly', authenticateToken, (req, res) => {
  try {
    const db = getDb();

    const result = db.exec(`
      SELECT
        strftime('%Y-%m', closed_at) as month,
        SUM(profit_loss) as profit,
        COUNT(*) as trades,
        SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as wins
      FROM trades
      WHERE user_id = ? AND status = 'closed'
      GROUP BY strftime('%Y-%m', closed_at)
      ORDER BY month ASC
    `, [req.user.id]);

    const data = rowsToObjects(result);

    res.json(data.map(t => ({
      month: t.month,
      profit: parseFloat(t.profit?.toFixed(2) || 0),
      trades: t.trades,
      wins: t.wins,
      winRate: t.trades > 0 ? ((t.wins / t.trades) * 100).toFixed(1) : 0
    })));
  } catch (error) {
    console.error('Monthly analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Daily heatmap data
router.get('/heatmap', authenticateToken, (req, res) => {
  try {
    const db = getDb();

    // By day of week and hour
    const result = db.exec(`
      SELECT
        CAST(strftime('%w', closed_at) AS INTEGER) as day_of_week,
        CAST(strftime('%H', closed_at) AS INTEGER) as hour,
        SUM(profit_loss) as profit,
        COUNT(*) as trades,
        SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as wins
      FROM trades
      WHERE user_id = ? AND status = 'closed'
      GROUP BY day_of_week, hour
    `, [req.user.id]);

    const data = rowsToObjects(result);

    // Create full 7x24 grid
    const heatmap = [];
    for (let day = 0; day < 7; day++) {
      for (let hour = 0; hour < 24; hour++) {
        const entry = data.find(d => d.day_of_week === day && d.hour === hour);
        heatmap.push({
          day,
          hour,
          profit: entry ? parseFloat(entry.profit.toFixed(2)) : 0,
          trades: entry?.trades || 0,
          winRate: entry?.trades > 0 ? ((entry.wins / entry.trades) * 100).toFixed(1) : 0
        });
      }
    }

    res.json(heatmap);
  } catch (error) {
    console.error('Heatmap error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Performance by ticker
router.get('/by-ticker', authenticateToken, (req, res) => {
  try {
    const db = getDb();

    const result = db.exec(`
      SELECT
        ticker,
        COUNT(*) as trades,
        SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as wins,
        SUM(profit_loss) as total_profit,
        AVG(profit_loss) as avg_profit
      FROM trades
      WHERE user_id = ? AND status = 'closed'
      GROUP BY ticker
      ORDER BY total_profit DESC
    `, [req.user.id]);

    const data = rowsToObjects(result);

    res.json(data.map(t => ({
      ticker: t.ticker,
      trades: t.trades,
      wins: t.wins,
      winRate: t.trades > 0 ? ((t.wins / t.trades) * 100).toFixed(1) : 0,
      totalProfit: parseFloat(t.total_profit?.toFixed(2) || 0),
      avgProfit: parseFloat(t.avg_profit?.toFixed(2) || 0)
    })));
  } catch (error) {
    console.error('By ticker error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Performance by timeframe
router.get('/by-timeframe', authenticateToken, (req, res) => {
  try {
    const db = getDb();

    const result = db.exec(`
      SELECT
        timeframe,
        COUNT(*) as trades,
        SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as wins,
        SUM(profit_loss) as total_profit
      FROM trades
      WHERE user_id = ? AND status = 'closed' AND timeframe IS NOT NULL
      GROUP BY timeframe
      ORDER BY total_profit DESC
    `, [req.user.id]);

    const data = rowsToObjects(result);

    res.json(data.map(t => ({
      timeframe: t.timeframe,
      trades: t.trades,
      wins: t.wins,
      winRate: t.trades > 0 ? ((t.wins / t.trades) * 100).toFixed(1) : 0,
      totalProfit: parseFloat(t.total_profit?.toFixed(2) || 0)
    })));
  } catch (error) {
    console.error('By timeframe error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Performance by strategy
router.get('/by-strategy', authenticateToken, (req, res) => {
  try {
    const db = getDb();

    const result = db.exec(`
      SELECT
        COALESCE(s.name, 'No Strategy') as strategy_name,
        COUNT(t.id) as trades,
        SUM(CASE WHEN t.profit_loss > 0 THEN 1 ELSE 0 END) as wins,
        SUM(t.profit_loss) as total_profit,
        AVG(e.compliance_score) as avg_compliance
      FROM trades t
      LEFT JOIN trade_evaluations e ON t.id = e.id
      LEFT JOIN strategies s ON e.strategy_id = s.id
      WHERE t.user_id = ? AND t.status = 'closed'
      GROUP BY strategy_name
      ORDER BY total_profit DESC
    `, [req.user.id]);

    const data = rowsToObjects(result);

    res.json(data.map(t => ({
      strategy: t.strategy_name,
      trades: t.trades,
      wins: t.wins,
      winRate: t.trades > 0 ? ((t.wins / t.trades) * 100).toFixed(1) : 0,
      totalProfit: parseFloat(t.total_profit?.toFixed(2) || 0),
      avgCompliance: t.avg_compliance ? parseFloat(t.avg_compliance.toFixed(1)) : null
    })));
  } catch (error) {
    console.error('By strategy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Correlation: compliance score vs profitability
router.get('/compliance-correlation', authenticateToken, (req, res) => {
  try {
    const db = getDb();

    const result = db.exec(`
      SELECT
        e.compliance_score,
        t.profit_loss,
        t.ticker
      FROM trade_evaluations e
      JOIN trades t ON e.ticker = t.ticker AND e.user_id = t.user_id
      WHERE e.user_id = ? AND t.status = 'closed' AND e.compliance_score IS NOT NULL
    `, [req.user.id]);

    const data = rowsToObjects(result);

    // Group by compliance score ranges
    const ranges = [
      { min: 0, max: 25, label: '0-25%' },
      { min: 25, max: 50, label: '25-50%' },
      { min: 50, max: 75, label: '50-75%' },
      { min: 75, max: 100, label: '75-100%' }
    ];

    const correlation = ranges.map(range => {
      const inRange = data.filter(d => d.compliance_score >= range.min && d.compliance_score < range.max);
      const wins = inRange.filter(d => d.profit_loss > 0).length;
      const totalProfit = inRange.reduce((sum, d) => sum + (d.profit_loss || 0), 0);

      return {
        range: range.label,
        trades: inRange.length,
        winRate: inRange.length > 0 ? ((wins / inRange.length) * 100).toFixed(1) : 0,
        totalProfit: parseFloat(totalProfit.toFixed(2)),
        avgProfit: inRange.length > 0 ? parseFloat((totalProfit / inRange.length).toFixed(2)) : 0
      };
    });

    res.json(correlation);
  } catch (error) {
    console.error('Compliance correlation error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Weekly summary
router.get('/weekly', authenticateToken, (req, res) => {
  try {
    const db = getDb();

    const result = db.exec(`
      SELECT
        strftime('%Y-W%W', closed_at) as week,
        SUM(profit_loss) as profit,
        COUNT(*) as trades,
        SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as wins
      FROM trades
      WHERE user_id = ? AND status = 'closed'
        AND closed_at >= date('now', '-12 weeks')
      GROUP BY week
      ORDER BY week ASC
    `, [req.user.id]);

    const data = rowsToObjects(result);

    res.json(data.map(t => ({
      week: t.week,
      profit: parseFloat(t.profit?.toFixed(2) || 0),
      trades: t.trades,
      wins: t.wins,
      winRate: t.trades > 0 ? ((t.wins / t.trades) * 100).toFixed(1) : 0
    })));
  } catch (error) {
    console.error('Weekly analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// AI-generated insights
router.get('/insights', authenticateToken, async (req, res) => {
  try {
    const db = getDb();

    // Gather all relevant data
    const tradesResult = db.exec(`
      SELECT * FROM trades WHERE user_id = ? AND status = 'closed' ORDER BY closed_at DESC LIMIT 100
    `, [req.user.id]);
    const trades = rowsToObjects(tradesResult);

    if (trades.length < 5) {
      return res.json({
        insights: [{
          type: 'info',
          title: 'Not enough data',
          message: 'Complete at least 5 trades to get AI-powered insights.'
        }]
      });
    }

    const insights = [];

    // Win rate insight
    const wins = trades.filter(t => t.profit_loss > 0).length;
    const winRate = (wins / trades.length) * 100;

    if (winRate < 40) {
      insights.push({
        type: 'warning',
        title: 'Win Rate Alert',
        message: `Your win rate is ${winRate.toFixed(1)}%. Consider tightening entry criteria or reviewing losing trades for patterns.`
      });
    } else if (winRate > 60) {
      insights.push({
        type: 'success',
        title: 'Strong Win Rate',
        message: `Excellent! Your ${winRate.toFixed(1)}% win rate is above average. Focus on maintaining this consistency.`
      });
    }

    // Best/worst ticker
    const tickerStats = {};
    trades.forEach(t => {
      if (!tickerStats[t.ticker]) {
        tickerStats[t.ticker] = { profit: 0, trades: 0 };
      }
      tickerStats[t.ticker].profit += t.profit_loss || 0;
      tickerStats[t.ticker].trades++;
    });

    const tickers = Object.entries(tickerStats).filter(([_, s]) => s.trades >= 3);
    if (tickers.length > 0) {
      const best = tickers.sort((a, b) => b[1].profit - a[1].profit)[0];
      const worst = tickers.sort((a, b) => a[1].profit - b[1].profit)[0];

      if (best[1].profit > 0) {
        insights.push({
          type: 'success',
          title: 'Best Performing Ticker',
          message: `${best[0]} is your most profitable ticker with $${best[1].profit.toFixed(2)} profit across ${best[1].trades} trades.`
        });
      }

      if (worst[1].profit < 0 && worst[0] !== best[0]) {
        insights.push({
          type: 'warning',
          title: 'Underperforming Ticker',
          message: `Consider avoiding ${worst[0]} - you've lost $${Math.abs(worst[1].profit).toFixed(2)} across ${worst[1].trades} trades.`
        });
      }
    }

    // Recent performance trend
    const last10 = trades.slice(0, 10);
    const last10Profit = last10.reduce((s, t) => s + (t.profit_loss || 0), 0);
    const prev10 = trades.slice(10, 20);
    const prev10Profit = prev10.reduce((s, t) => s + (t.profit_loss || 0), 0);

    if (prev10.length >= 5) {
      if (last10Profit > prev10Profit * 1.2) {
        insights.push({
          type: 'success',
          title: 'Improving Performance',
          message: 'Your last 10 trades are outperforming your previous 10. Keep up the good work!'
        });
      } else if (last10Profit < prev10Profit * 0.8 && last10Profit < 0) {
        insights.push({
          type: 'warning',
          title: 'Performance Declining',
          message: 'Your recent trades are underperforming. Consider taking a break or reviewing your strategy.'
        });
      }
    }

    // Average trade size
    const avgProfit = trades.reduce((s, t) => s + (t.profit_loss || 0), 0) / trades.length;
    const avgWin = trades.filter(t => t.profit_loss > 0).reduce((s, t) => s + t.profit_loss, 0) / wins || 0;
    const avgLoss = Math.abs(trades.filter(t => t.profit_loss < 0).reduce((s, t) => s + t.profit_loss, 0) / (trades.length - wins)) || 0;

    if (avgWin > 0 && avgLoss > 0) {
      const riskReward = avgWin / avgLoss;
      if (riskReward < 1) {
        insights.push({
          type: 'warning',
          title: 'Risk/Reward Ratio',
          message: `Your average win ($${avgWin.toFixed(2)}) is smaller than your average loss ($${avgLoss.toFixed(2)}). Aim for at least 1:1 R:R.`
        });
      } else if (riskReward > 2) {
        insights.push({
          type: 'success',
          title: 'Great Risk/Reward',
          message: `Your ${riskReward.toFixed(1)}:1 risk/reward ratio is excellent. This gives you room for more losses while staying profitable.`
        });
      }
    }

    res.json({ insights });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
