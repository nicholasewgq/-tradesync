import { getDb, saveDatabase } from '../config/database.js';

export function initializeDatabase() {
  const db = getDb();

  // Users table with extended fields
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      theme TEXT DEFAULT 'dark',
      is_public INTEGER DEFAULT 0,
      notification_settings TEXT,
      dashboard_layout TEXT,
      discord_webhook TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add new columns if they don't exist (migration)
  try {
    db.run(`ALTER TABLE users ADD COLUMN is_public INTEGER DEFAULT 0`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE users ADD COLUMN notification_settings TEXT`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE users ADD COLUMN dashboard_layout TEXT`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE users ADD COLUMN discord_webhook TEXT`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE users ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
  } catch (e) {}

  // Trades table with extended fields
  db.run(`
    CREATE TABLE IF NOT EXISTS trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      ticker TEXT NOT NULL,
      pair TEXT,
      type TEXT NOT NULL,
      direction TEXT NOT NULL,
      entry_price REAL NOT NULL,
      exit_price REAL,
      stop_loss REAL,
      take_profit REAL,
      quantity REAL DEFAULT 1,
      position_size REAL,
      status TEXT DEFAULT 'open',
      notes TEXT,
      profit_loss REAL,
      profit_loss_percent REAL,
      risk_reward REAL,
      timeframe TEXT,
      setup_type TEXT,
      entry_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      closed_at DATETIME,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Add new columns if they don't exist (migration)
  try {
    db.run(`ALTER TABLE trades ADD COLUMN ticker TEXT`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE trades ADD COLUMN timeframe TEXT`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE trades ADD COLUMN setup_type TEXT`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE trades ADD COLUMN entry_date DATETIME`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE trades ADD COLUMN profit_loss_percent REAL`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE trades ADD COLUMN position_size REAL`);
  } catch (e) {}

  db.run(`CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_trades_ticker ON trades(ticker)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_trades_closed_at ON trades(closed_at)`);

  // Strategies tables
  db.run(`
    CREATE TABLE IF NOT EXISTS strategies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      is_public INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  try {
    db.run(`ALTER TABLE strategies ADD COLUMN is_public INTEGER DEFAULT 0`);
  } catch (e) {}
  try {
    db.run(`ALTER TABLE strategies ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP`);
  } catch (e) {}

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

  // Price alerts table
  db.run(`
    CREATE TABLE IF NOT EXISTS price_alerts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      condition TEXT NOT NULL,
      target_price REAL NOT NULL,
      note TEXT,
      triggered INTEGER DEFAULT 0,
      triggered_at DATETIME,
      triggered_price REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON price_alerts(user_id)`);
  db.run(`CREATE INDEX IF NOT EXISTS idx_alerts_symbol ON price_alerts(symbol)`);

  // Shared trades table
  db.run(`
    CREATE TABLE IF NOT EXISTS shared_trades (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trade_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      share_token TEXT UNIQUE NOT NULL,
      views INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (trade_id) REFERENCES trades(id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_shared_token ON shared_trades(share_token)`);

  // User watchlist table
  db.run(`
    CREATE TABLE IF NOT EXISTS watchlist (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      symbol TEXT NOT NULL,
      added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, symbol)
    )
  `);

  // Journal entries table (separate from trade notes)
  db.run(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT,
      content TEXT NOT NULL,
      mood TEXT,
      tags TEXT,
      trade_ids TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  db.run(`CREATE INDEX IF NOT EXISTS idx_journal_user_id ON journal_entries(user_id)`);

  // User goals table
  db.run(`
    CREATE TABLE IF NOT EXISTS trading_goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      goal_type TEXT NOT NULL,
      target_value REAL NOT NULL,
      current_value REAL DEFAULT 0,
      period TEXT,
      start_date DATETIME,
      end_date DATETIME,
      completed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  // Trading sessions table (for tracking active trading time)
  db.run(`
    CREATE TABLE IF NOT EXISTS trading_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      started_at DATETIME NOT NULL,
      ended_at DATETIME,
      trades_count INTEGER DEFAULT 0,
      pnl REAL DEFAULT 0,
      notes TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id)
    )
  `);

  saveDatabase();
  console.log('Database initialized successfully with all tables');
}
