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
      : 0;

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
      scalpProfit: scalpTrades.reduce((sum, t) => sum + (t.profit_loss || 0), 0).toFixed(2)
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

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
    const equityData = trades.map(trade => {
      runningTotal += trade.profit_loss;
      return {
        date: trade.closed_at,
        equity: parseFloat(runningTotal.toFixed(2))
      };
    });

    equityData.unshift({ date: null, equity: 0 });

    res.json(equityData);
  } catch (error) {
    console.error('Equity curve error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/monthly', authenticateToken, (req, res) => {
  try {
    const db = getDb();

    const result = db.exec(`
      SELECT
        strftime('%Y-%m', closed_at) as month,
        SUM(profit_loss) as profit,
        COUNT(*) as trades
      FROM trades
      WHERE user_id = ? AND status = 'closed'
      GROUP BY strftime('%Y-%m', closed_at)
      ORDER BY month ASC
    `, [req.user.id]);

    const data = rowsToObjects(result);

    res.json(data.map(t => ({
      month: t.month,
      profit: parseFloat(t.profit?.toFixed(2) || 0),
      trades: t.trades
    })));
  } catch (error) {
    console.error('Monthly analytics error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
