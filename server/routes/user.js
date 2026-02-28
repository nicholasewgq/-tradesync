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

router.get('/profile', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const result = db.exec(
      'SELECT id, username, email, theme, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rowToObject(result[0].columns, result[0].values[0]);
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.put('/profile', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const { username, theme } = req.body;
    const updates = [];
    const values = [];

    if (username) {
      const existing = db.exec(
        'SELECT id FROM users WHERE username = ? AND id != ?',
        [username, req.user.id]
      );

      if (existing.length > 0 && existing[0].values.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
      updates.push('username = ?');
      values.push(username);
    }

    if (theme && ['light', 'dark'].includes(theme)) {
      updates.push('theme = ?');
      values.push(theme);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    values.push(req.user.id);

    db.run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
    saveDatabase();

    const result = db.exec(
      'SELECT id, username, email, theme, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    const updatedUser = rowToObject(result[0].columns, result[0].values[0]);
    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
