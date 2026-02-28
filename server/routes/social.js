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

// Get public profile
router.get('/profile/:username', async (req, res) => {
  try {
    const db = getDb();
    const { username } = req.params;

    const userResult = db.exec(
      "SELECT id, username, created_at FROM users WHERE username = ? AND is_public = 1",
      [username]
    );
    const users = rowsToObjects(userResult);

    if (users.length === 0) {
      return res.status(404).json({ error: 'Profile not found or private' });
    }

    const user = users[0];

    // Get user stats
    const statsResult = db.exec(`
      SELECT
        COUNT(*) as total_trades,
        SUM(CASE WHEN profit_loss > 0 THEN 1 ELSE 0 END) as winning_trades,
        SUM(profit_loss) as total_profit,
        AVG(profit_loss) as avg_profit
      FROM trades
      WHERE user_id = ? AND status = 'closed'
    `, [user.id]);
    const stats = rowsToObjects(statsResult)[0] || {};

    res.json({
      username: user.username,
      joinedAt: user.created_at,
      stats: {
        totalTrades: stats.total_trades || 0,
        winRate: stats.total_trades > 0
          ? ((stats.winning_trades / stats.total_trades) * 100).toFixed(1)
          : 0,
        totalProfit: parseFloat(stats.total_profit || 0).toFixed(2),
        avgProfit: parseFloat(stats.avg_profit || 0).toFixed(2)
      }
    });
  } catch (error) {
    console.error('Public profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Toggle profile visibility
router.post('/profile/visibility', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { isPublic } = req.body;

    db.run("UPDATE users SET is_public = ? WHERE id = ?", [isPublic ? 1 : 0, req.user.id]);

    res.json({ success: true, isPublic });
  } catch (error) {
    console.error('Toggle visibility error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const db = getDb();
    const { period = 'all', metric = 'profit' } = req.query;

    let dateFilter = '';
    if (period === 'week') {
      dateFilter = "AND t.closed_at >= date('now', '-7 days')";
    } else if (period === 'month') {
      dateFilter = "AND t.closed_at >= date('now', '-30 days')";
    }

    const result = db.exec(`
      SELECT
        u.username,
        COUNT(t.id) as total_trades,
        SUM(CASE WHEN t.profit_loss > 0 THEN 1 ELSE 0 END) as wins,
        SUM(t.profit_loss) as total_profit,
        ROUND(CAST(SUM(CASE WHEN t.profit_loss > 0 THEN 1 ELSE 0 END) AS FLOAT) / COUNT(t.id) * 100, 1) as win_rate
      FROM users u
      JOIN trades t ON u.id = t.user_id
      WHERE u.is_public = 1 AND t.status = 'closed' ${dateFilter}
      GROUP BY u.id
      HAVING COUNT(t.id) >= 5
      ORDER BY ${metric === 'winrate' ? 'win_rate' : 'total_profit'} DESC
      LIMIT 50
    `);

    const leaderboard = rowsToObjects(result);

    res.json(leaderboard.map((entry, index) => ({
      rank: index + 1,
      username: entry.username,
      totalTrades: entry.total_trades,
      wins: entry.wins,
      winRate: entry.win_rate,
      totalProfit: parseFloat(entry.total_profit).toFixed(2)
    })));
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Generate shareable trade card
router.post('/share/trade/:tradeId', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { tradeId } = req.params;

    const tradeResult = db.exec(
      "SELECT * FROM trades WHERE id = ? AND user_id = ?",
      [tradeId, req.user.id]
    );
    const trades = rowsToObjects(tradeResult);

    if (trades.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    const trade = trades[0];

    // Generate share token
    const shareToken = Buffer.from(`${tradeId}-${Date.now()}`).toString('base64url');

    // Store share token
    db.run(`
      INSERT OR REPLACE INTO shared_trades (trade_id, share_token, user_id, created_at)
      VALUES (?, ?, ?, datetime('now'))
    `, [tradeId, shareToken, req.user.id]);

    res.json({
      shareUrl: `/share/${shareToken}`,
      shareToken,
      trade: {
        ticker: trade.ticker,
        type: trade.type,
        direction: trade.direction,
        profitLoss: trade.profit_loss,
        entryPrice: trade.entry_price,
        exitPrice: trade.exit_price
      }
    });
  } catch (error) {
    console.error('Share trade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get shared trade
router.get('/share/:token', async (req, res) => {
  try {
    const db = getDb();
    const { token } = req.params;

    const result = db.exec(`
      SELECT t.*, u.username
      FROM shared_trades st
      JOIN trades t ON st.trade_id = t.id
      JOIN users u ON t.user_id = u.id
      WHERE st.share_token = ?
    `, [token]);

    const trades = rowsToObjects(result);

    if (trades.length === 0) {
      return res.status(404).json({ error: 'Shared trade not found' });
    }

    const trade = trades[0];

    res.json({
      trader: trade.username,
      ticker: trade.ticker,
      type: trade.type,
      direction: trade.direction,
      profitLoss: trade.profit_loss,
      profitLossPercent: trade.profit_loss_percent,
      entryPrice: trade.entry_price,
      exitPrice: trade.exit_price,
      entryDate: trade.entry_date,
      closedAt: trade.closed_at,
      notes: trade.notes
    });
  } catch (error) {
    console.error('Get shared trade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Export strategy
router.get('/strategies/export/:strategyId', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { strategyId } = req.params;

    const strategyResult = db.exec(
      "SELECT * FROM strategies WHERE id = ? AND user_id = ?",
      [strategyId, req.user.id]
    );
    const strategies = rowsToObjects(strategyResult);

    if (strategies.length === 0) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    const strategy = strategies[0];

    const rulesResult = db.exec(
      "SELECT rule_name, rule_description FROM strategy_rules WHERE strategy_id = ?",
      [strategyId]
    );
    const rules = rowsToObjects(rulesResult);

    const exportData = {
      name: strategy.name,
      description: strategy.description,
      rules: rules.map(r => ({
        name: r.rule_name,
        description: r.rule_description
      })),
      exportedAt: new Date().toISOString(),
      version: '1.0'
    };

    res.json({
      exportCode: Buffer.from(JSON.stringify(exportData)).toString('base64'),
      strategy: exportData
    });
  } catch (error) {
    console.error('Export strategy error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Import strategy
router.post('/strategies/import', authenticateToken, async (req, res) => {
  try {
    const db = getDb();
    const { exportCode } = req.body;

    const strategyData = JSON.parse(Buffer.from(exportCode, 'base64').toString('utf-8'));

    if (!strategyData.name || !strategyData.rules) {
      return res.status(400).json({ error: 'Invalid strategy format' });
    }

    // Create strategy
    db.run(`
      INSERT INTO strategies (user_id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `, [req.user.id, `${strategyData.name} (Imported)`, strategyData.description || '']);

    const idResult = db.exec("SELECT last_insert_rowid() as id");
    const strategyId = rowsToObjects(idResult)[0].id;

    // Add rules
    strategyData.rules.forEach(rule => {
      db.run(`
        INSERT INTO strategy_rules (strategy_id, rule_name, rule_description)
        VALUES (?, ?, ?)
      `, [strategyId, rule.name, rule.description || '']);
    });

    res.json({
      success: true,
      strategyId,
      name: strategyData.name,
      rulesCount: strategyData.rules.length
    });
  } catch (error) {
    console.error('Import strategy error:', error);
    res.status(500).json({ error: 'Invalid import code' });
  }
});

// Discord webhook notification
router.post('/webhook/discord', authenticateToken, async (req, res) => {
  try {
    const { webhookUrl, tradeId, message } = req.body;

    if (!webhookUrl) {
      return res.status(400).json({ error: 'Webhook URL required' });
    }

    const db = getDb();
    let content = message || '';

    if (tradeId) {
      const tradeResult = db.exec(
        "SELECT * FROM trades WHERE id = ? AND user_id = ?",
        [tradeId, req.user.id]
      );
      const trades = rowsToObjects(tradeResult);

      if (trades.length > 0) {
        const trade = trades[0];
        const emoji = trade.profit_loss >= 0 ? '🟢' : '🔴';
        content = `${emoji} **${trade.ticker}** ${trade.direction.toUpperCase()}\n` +
          `P/L: $${trade.profit_loss?.toFixed(2) || 0}\n` +
          `Entry: $${trade.entry_price} → Exit: $${trade.exit_price || 'Open'}`;
      }
    }

    // Send to Discord
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'TradeSync',
        avatar_url: 'https://tradesync.solutions/logo.png',
        embeds: [{
          title: 'Trade Update',
          description: content,
          color: 0x6366f1,
          timestamp: new Date().toISOString()
        }]
      })
    });

    if (!response.ok) {
      throw new Error('Discord webhook failed');
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Discord webhook error:', error);
    res.status(500).json({ error: 'Failed to send webhook' });
  }
});

export default router;
