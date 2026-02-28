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

  // Strategies tables
  db.run(`
    CREATE TABLE IF NOT EXISTS strategies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS strategy_rules (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      strategy_id INTEGER NOT NULL,
      rule_name TEXT NOT NULL,
      rule_description TEXT,
      rule_type TEXT DEFAULT 'boolean',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (strategy_id) REFERENCES strategies(id) ON DELETE CASCADE
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS trade_evaluations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      strategy_id INTEGER,
      ticker TEXT,
      direction TEXT,
      entry_price REAL,
      stop_loss REAL,
      targets TEXT,
      timeframe TEXT,
      trade_date TEXT,
      pnl REAL,
      pnl_r REAL,
      setup_notes TEXT,
      compliance_score REAL,
      rule_results TEXT,
      tags TEXT,
      ai_feedback TEXT,
      image_path TEXT,
      outcome TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (strategy_id) REFERENCES strategies(id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_evaluations_user_id ON trade_evaluations(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_evaluations_strategy_id ON trade_evaluations(strategy_id)`);

  saveDatabase();
  console.log('Database initialized successfully');
}
