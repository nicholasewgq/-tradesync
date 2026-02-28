import express from 'express';
import { getDb, saveDatabase } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

function rowToObject(columns, values) {
  const obj = {};
  columns.forEach((col, i) => {
    obj[col] = values[i];
  });
  return obj;
}

function rowsToObjects(result) {
  if (!result || result.length === 0) return [];
  const columns = result[0].columns;
  return result[0].values.map(values => rowToObject(columns, values));
}

function calculateProfitLoss(trade) {
  if (!trade.exit_price) return null;

  const diff = trade.direction === 'long'
    ? trade.exit_price - trade.entry_price
    : trade.entry_price - trade.exit_price;

  return diff * trade.quantity;
}

function calculateRiskReward(trade) {
  if (!trade.stop_loss || !trade.take_profit) return null;

  const risk = Math.abs(trade.entry_price - trade.stop_loss);
  const reward = Math.abs(trade.take_profit - trade.entry_price);

  return risk > 0 ? parseFloat((reward / risk).toFixed(2)) : null;
}

router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { status, type, limit = 50, offset = 0 } = req.query;

    let query = 'SELECT * FROM trades WHERE user_id = ?';
    const params = [req.user.id];

    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const result = db.exec(query, params);
    const trades = rowsToObjects(result);

    const countResult = db.exec('SELECT COUNT(*) as total FROM trades WHERE user_id = ?', [req.user.id]);
    const total = countResult.length > 0 ? countResult[0].values[0][0] : 0;

    res.json({ trades, total });
  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const {
      pair,
      type,
      direction,
      entry_price,
      exit_price,
      stop_loss,
      take_profit,
      quantity = 1,
      status = 'open',
      notes
    } = req.body;

    if (!pair || !type || !direction || !entry_price) {
      return res.status(400).json({ error: 'Required fields: pair, type, direction, entry_price' });
    }

    const trade = {
      user_id: req.user.id,
      pair,
      type,
      direction,
      entry_price: parseFloat(entry_price),
      exit_price: exit_price ? parseFloat(exit_price) : null,
      stop_loss: stop_loss ? parseFloat(stop_loss) : null,
      take_profit: take_profit ? parseFloat(take_profit) : null,
      quantity: parseFloat(quantity),
      status,
      notes: notes || null
    };

    trade.profit_loss = calculateProfitLoss(trade);
    trade.risk_reward = calculateRiskReward(trade);

    const closedAt = status === 'closed' ? new Date().toISOString() : null;

    db.run(`
      INSERT INTO trades (user_id, pair, type, direction, entry_price, exit_price, stop_loss, take_profit, quantity, status, notes, profit_loss, risk_reward, closed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      trade.user_id,
      trade.pair,
      trade.type,
      trade.direction,
      trade.entry_price,
      trade.exit_price,
      trade.stop_loss,
      trade.take_profit,
      trade.quantity,
      trade.status,
      trade.notes,
      trade.profit_loss,
      trade.risk_reward,
      closedAt
    ]);
    saveDatabase();

    const idResult = db.exec('SELECT last_insert_rowid() as id');
    const newId = idResult[0].values[0][0];

    const result = db.exec('SELECT * FROM trades WHERE id = ?', [newId]);
    const newTrade = rowToObject(result[0].columns, result[0].values[0]);

    res.status(201).json(newTrade);
  } catch (error) {
    console.error('Create trade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const existingResult = db.exec(
      'SELECT * FROM trades WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existingResult.length === 0 || existingResult[0].values.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    const existingTrade = rowToObject(existingResult[0].columns, existingResult[0].values[0]);

    const {
      pair,
      type,
      direction,
      entry_price,
      exit_price,
      stop_loss,
      take_profit,
      quantity,
      status,
      notes
    } = req.body;

    const updatedTrade = {
      ...existingTrade,
      pair: pair ?? existingTrade.pair,
      type: type ?? existingTrade.type,
      direction: direction ?? existingTrade.direction,
      entry_price: entry_price ? parseFloat(entry_price) : existingTrade.entry_price,
      exit_price: exit_price ? parseFloat(exit_price) : existingTrade.exit_price,
      stop_loss: stop_loss ? parseFloat(stop_loss) : existingTrade.stop_loss,
      take_profit: take_profit ? parseFloat(take_profit) : existingTrade.take_profit,
      quantity: quantity ? parseFloat(quantity) : existingTrade.quantity,
      status: status ?? existingTrade.status,
      notes: notes ?? existingTrade.notes
    };

    updatedTrade.profit_loss = calculateProfitLoss(updatedTrade);
    updatedTrade.risk_reward = calculateRiskReward(updatedTrade);

    const closedAt = status === 'closed' && existingTrade.status !== 'closed'
      ? new Date().toISOString()
      : existingTrade.closed_at;

    db.run(`
      UPDATE trades
      SET pair = ?, type = ?, direction = ?, entry_price = ?, exit_price = ?,
          stop_loss = ?, take_profit = ?, quantity = ?, status = ?, notes = ?,
          profit_loss = ?, risk_reward = ?, closed_at = ?
      WHERE id = ? AND user_id = ?
    `, [
      updatedTrade.pair,
      updatedTrade.type,
      updatedTrade.direction,
      updatedTrade.entry_price,
      updatedTrade.exit_price,
      updatedTrade.stop_loss,
      updatedTrade.take_profit,
      updatedTrade.quantity,
      updatedTrade.status,
      updatedTrade.notes,
      updatedTrade.profit_loss,
      updatedTrade.risk_reward,
      closedAt,
      id,
      req.user.id
    ]);
    saveDatabase();

    const result = db.exec('SELECT * FROM trades WHERE id = ?', [id]);
    const finalTrade = rowToObject(result[0].columns, result[0].values[0]);

    res.json(finalTrade);
  } catch (error) {
    console.error('Update trade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { id } = req.params;

    const existing = db.exec(
      'SELECT id FROM trades WHERE id = ? AND user_id = ?',
      [id, req.user.id]
    );

    if (existing.length === 0 || existing[0].values.length === 0) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    db.run('DELETE FROM trades WHERE id = ?', [id]);
    saveDatabase();

    res.json({ message: 'Trade deleted successfully' });
  } catch (error) {
    console.error('Delete trade error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/export', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const result = db.exec(
      'SELECT * FROM trades WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    const trades = rowsToObjects(result);

    const headers = ['ID', 'Pair', 'Type', 'Direction', 'Entry Price', 'Exit Price', 'Stop Loss', 'Take Profit', 'Quantity', 'Status', 'P/L', 'R:R', 'Notes', 'Created At', 'Closed At'];

    const csvRows = [headers.join(',')];

    for (const trade of trades) {
      const row = [
        trade.id,
        trade.pair,
        trade.type,
        trade.direction,
        trade.entry_price,
        trade.exit_price || '',
        trade.stop_loss || '',
        trade.take_profit || '',
        trade.quantity,
        trade.status,
        trade.profit_loss || '',
        trade.risk_reward || '',
        `"${(trade.notes || '').replace(/"/g, '""')}"`,
        trade.created_at,
        trade.closed_at || ''
      ];
      csvRows.push(row.join(','));
    }

    const csv = csvRows.join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=trades.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
