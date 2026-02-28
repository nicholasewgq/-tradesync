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

// Get all alerts for user
router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const result = db.exec(
      "SELECT * FROM price_alerts WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    const alerts = rowsToObjects(result);
    res.json(alerts);
  } catch (error) {
    console.error('Get alerts error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Create price alert
router.post('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { symbol, condition, targetPrice, note } = req.body;

    if (!symbol || !condition || !targetPrice) {
      return res.status(400).json({ error: 'Symbol, condition, and target price required' });
    }

    db.run(`
      INSERT INTO price_alerts (user_id, symbol, condition, target_price, note, triggered, created_at)
      VALUES (?, ?, ?, ?, ?, 0, datetime('now'))
    `, [req.user.id, symbol.toUpperCase(), condition, targetPrice, note || '']);

    const idResult = db.exec("SELECT last_insert_rowid() as id");
    const alertId = rowsToObjects(idResult)[0].id;

    res.json({
      id: alertId,
      symbol: symbol.toUpperCase(),
      condition,
      targetPrice,
      note,
      triggered: false
    });
  } catch (error) {
    console.error('Create alert error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete alert
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    db.run("DELETE FROM price_alerts WHERE id = ? AND user_id = ?", [req.params.id, req.user.id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete alert error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get notification settings
router.get('/settings', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const result = db.exec(
      "SELECT notification_settings FROM users WHERE id = ?",
      [req.user.id]
    );
    const users = rowsToObjects(result);

    let settings = {
      priceAlerts: true,
      tradeUpdates: true,
      dailySummary: false,
      discordWebhook: '',
      emailNotifications: false
    };

    if (users[0]?.notification_settings) {
      try {
        settings = { ...settings, ...JSON.parse(users[0].notification_settings) };
      } catch (e) {}
    }

    res.json(settings);
  } catch (error) {
    console.error('Get notification settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update notification settings
router.put('/settings', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const settings = JSON.stringify(req.body);

    db.run("UPDATE users SET notification_settings = ? WHERE id = ?", [settings, req.user.id]);

    res.json({ success: true, settings: req.body });
  } catch (error) {
    console.error('Update notification settings error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
