import { getDb, saveDatabase } from '../config/database.js';

export function initializeDatabase() {
  const db = getDb();

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      theme TEXT DEFAULT 'light',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      pair TEXT NOT NULL,
      type TEXT NOT NULL,
      direction TEXT NOT NULL,
      entry_price REAL NOT NULL,
      exit_price REAL,
      stop_loss REAL,
      take_profit REAL,
      quantity REAL DEFAULT 1,
      status TEXT DEFAULT 'open',
      notes TEXT,
      profit_loss REAL,
      risk_reward REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status)`);

  saveDatabase();
  console.log('Database initialized successfully');
}
