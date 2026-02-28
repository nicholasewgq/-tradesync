import express from 'express';
import bcrypt from 'bcryptjs';
import { getDb, saveDatabase } from '../config/database.js';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const db = getDb();

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const existingUser = db.exec('SELECT id FROM users WHERE email = ? OR username = ?', [email, username]);
    if (existingUser.length > 0 && existingUser[0].values.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    saveDatabase();

    const result = db.exec('SELECT last_insert_rowid() as id');
    const userId = result[0].values[0][0];

    const user = { id: userId, username, email };
    const token = generateToken(user);

    res.status(201).json({ user, token });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = getDb();

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = db.exec('SELECT * FROM users WHERE email = ?', [email]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const columns = result[0].columns;
    const values = result[0].values[0];
    const user = {};
    columns.forEach((col, i) => {
      user[col] = values[i];
    });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user);

    res.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        theme: user.theme
      },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

export default router;
