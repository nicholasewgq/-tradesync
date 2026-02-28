import express from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Anthropic from '@anthropic-ai/sdk';
import { getDb, saveDatabase } from '../config/database.js';
import { authenticateToken } from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for image uploads
const uploadDir = path.join(__dirname, '..', 'uploads', 'evaluations');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'eval-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PNG, JPG, and WebP are allowed.'));
    }
  }
});

function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is not configured');
  }
  return new Anthropic({ apiKey });
}

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

// ============================================
// STRATEGY CRUD
// ============================================

// Create strategy
router.post('/', authenticateToken, (req, res) => {
  try {
    const { name, description, rules } = req.body;
    const db = getDb();

    if (!name) {
      return res.status(400).json({ error: 'Strategy name is required' });
    }

    db.run(
      'INSERT INTO strategies (user_id, name, description) VALUES (?, ?, ?)',
      [req.user.id, name, description || '']
    );

    const strategyResult = db.exec('SELECT last_insert_rowid() as id');
    const strategyId = strategyResult[0].values[0][0];

    // Add rules if provided
    if (rules && Array.isArray(rules)) {
      rules.forEach(rule => {
        db.run(
          'INSERT INTO strategy_rules (strategy_id, rule_name, rule_description, rule_type) VALUES (?, ?, ?, ?)',
          [strategyId, rule.name, rule.description || '', rule.type || 'boolean']
        );
      });
    }

    saveDatabase();

    res.json({
      success: true,
      strategy: { id: strategyId, name, description, rules: rules || [] }
    });
  } catch (error) {
    console.error('Create strategy error:', error);
    res.status(500).json({ error: 'Failed to create strategy' });
  }
});

// List user's strategies
router.get('/', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const strategiesResult = db.exec(
      'SELECT * FROM strategies WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    const strategies = rowsToObjects(strategiesResult);

    // Get rules for each strategy
    strategies.forEach(strategy => {
      const rulesResult = db.exec(
        'SELECT * FROM strategy_rules WHERE strategy_id = ?',
        [strategy.id]
      );
      strategy.rules = rowsToObjects(rulesResult);
    });

    res.json(strategies);
  } catch (error) {
    console.error('List strategies error:', error);
    res.status(500).json({ error: 'Failed to list strategies' });
  }
});

// Get single strategy with rules
router.get('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    const strategyResult = db.exec(
      'SELECT * FROM strategies WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    const strategies = rowsToObjects(strategyResult);

    if (strategies.length === 0) {
      return res.status(404).json({ error: 'Strategy not found' });
    }

    const strategy = strategies[0];
    const rulesResult = db.exec(
      'SELECT * FROM strategy_rules WHERE strategy_id = ?',
      [strategy.id]
    );
    strategy.rules = rowsToObjects(rulesResult);

    res.json(strategy);
  } catch (error) {
    console.error('Get strategy error:', error);
    res.status(500).json({ error: 'Failed to get strategy' });
  }
});

// Update strategy
router.put('/:id', authenticateToken, (req, res) => {
  try {
    const { name, description } = req.body;
    const db = getDb();

    db.run(
      'UPDATE strategies SET name = ?, description = ? WHERE id = ? AND user_id = ?',
      [name, description || '', req.params.id, req.user.id]
    );
    saveDatabase();

    res.json({ success: true });
  } catch (error) {
    console.error('Update strategy error:', error);
    res.status(500).json({ error: 'Failed to update strategy' });
  }
});

// Delete strategy
router.delete('/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM strategy_rules WHERE strategy_id = ?', [req.params.id]);
    db.run('DELETE FROM strategies WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    saveDatabase();

    res.json({ success: true });
  } catch (error) {
    console.error('Delete strategy error:', error);
    res.status(500).json({ error: 'Failed to delete strategy' });
  }
});

// Add rule to strategy
router.post('/:id/rules', authenticateToken, (req, res) => {
  try {
    const { name, description, type } = req.body;
    const db = getDb();

    if (!name) {
      return res.status(400).json({ error: 'Rule name is required' });
    }

    db.run(
      'INSERT INTO strategy_rules (strategy_id, rule_name, rule_description, rule_type) VALUES (?, ?, ?, ?)',
      [req.params.id, name, description || '', type || 'boolean']
    );
    saveDatabase();

    const ruleResult = db.exec('SELECT last_insert_rowid() as id');
    const ruleId = ruleResult[0].values[0][0];

    res.json({ success: true, rule: { id: ruleId, rule_name: name, rule_description: description, rule_type: type } });
  } catch (error) {
    console.error('Add rule error:', error);
    res.status(500).json({ error: 'Failed to add rule' });
  }
});

// Delete rule
router.delete('/:id/rules/:ruleId', authenticateToken, (req, res) => {
  try {
    const db = getDb();
    db.run('DELETE FROM strategy_rules WHERE id = ? AND strategy_id = ?', [req.params.ruleId, req.params.id]);
    saveDatabase();

    res.json({ success: true });
  } catch (error) {
    console.error('Delete rule error:', error);
    res.status(500).json({ error: 'Failed to delete rule' });
  }
});

// ============================================
// AI TRADE EVALUATION
// ============================================

router.post('/evaluate', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { strategyId } = req.body;
    const db = getDb();

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a trade screenshot' });
    }

    // Get strategy and rules
    let strategy = null;
    let rules = [];
    if (strategyId) {
      const strategyResult = db.exec(
        'SELECT * FROM strategies WHERE id = ? AND user_id = ?',
        [strategyId, req.user.id]
      );
      const strategies = rowsToObjects(strategyResult);
      if (strategies.length > 0) {
        strategy = strategies[0];
        const rulesResult = db.exec('SELECT * FROM strategy_rules WHERE strategy_id = ?', [strategyId]);
        rules = rowsToObjects(rulesResult);
      }
    }

    const anthropic = getAnthropicClient();

    const imageBuffer = fs.readFileSync(req.file.path);
    const base64Image = imageBuffer.toString('base64');

    const ext = path.extname(req.file.path).toLowerCase();
    let mimeType = 'image/jpeg';
    if (ext === '.png') mimeType = 'image/png';
    else if (ext === '.webp') mimeType = 'image/webp';

    const rulesPrompt = rules.length > 0
      ? `\n\nSTRATEGY RULES TO EVALUATE:\n${rules.map((r, i) => `${i + 1}. ${r.rule_name}: ${r.rule_description || 'No description'}`).join('\n')}`
      : '';

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: mimeType,
                data: base64Image
              }
            },
            {
              type: 'text',
              text: `You are an expert trade analyst. Analyze this trading screenshot and extract all visible trade details.
${rulesPrompt}

Extract the following information from the image (use null if not visible):
- ticker/pair (the trading symbol)
- direction (long/short)
- entry price
- stop loss price
- target prices (as array)
- timeframe
- trade date/time
- P&L if visible (in dollars and/or R multiple)
- any setup notes or annotations visible

${rules.length > 0 ? `Then evaluate the trade against each strategy rule and determine if it passes or fails.` : ''}

Respond in this exact JSON format:
{
  "extracted": {
    "ticker": "string or null",
    "direction": "long" | "short" | null,
    "entry_price": number or null,
    "stop_loss": number or null,
    "targets": [array of numbers] or [],
    "timeframe": "string or null",
    "trade_date": "string or null",
    "pnl": number or null,
    "pnl_r": number or null,
    "setup_notes": "string or null",
    "confidence": number between 0-100 (how confident you are in the extraction)
  },
  "rule_results": [
    {
      "rule_id": number,
      "rule_name": "string",
      "passed": boolean,
      "reasoning": "brief explanation"
    }
  ],
  "compliance_score": number between 0-100 (percentage of rules passed),
  "improvements": ["suggestion 1", "suggestion 2"],
  "suggested_tags": ["tag1", "tag2", "tag3"],
  "overall_feedback": "brief overall assessment of the trade"
}

If you cannot read the image clearly, set confidence to a low number and explain in overall_feedback what you couldn't read.`
            }
          ]
        }
      ]
    });

    const content = response.content[0].text;

    // Extract JSON from response
    let jsonStr = null;
    let braceCount = 0;
    let startIndex = -1;

    for (let i = 0; i < content.length; i++) {
      if (content[i] === '{') {
        if (braceCount === 0) startIndex = i;
        braceCount++;
      } else if (content[i] === '}') {
        braceCount--;
        if (braceCount === 0 && startIndex !== -1) {
          jsonStr = content.substring(startIndex, i + 1);
        }
      }
    }

    if (!jsonStr) {
      // Clean up file on error
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        error: 'Could not analyze the image. Please try a clearer screenshot.',
        details: 'AI could not extract valid data from the image.'
      });
    }

    let analysis;
    try {
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        error: 'Could not parse AI response. Please try again.',
        details: parseError.message
      });
    }

    // Check confidence level
    if (analysis.extracted?.confidence < 30) {
      fs.unlink(req.file.path, () => {});
      return res.status(400).json({
        error: 'Image quality too low or trade details not visible.',
        details: analysis.overall_feedback || 'Please upload a clearer screenshot with visible entry, stop loss, and targets.',
        partial_data: analysis.extracted
      });
    }

    res.json({
      success: true,
      analysis,
      strategy: strategy ? { id: strategy.id, name: strategy.name } : null,
      imagePath: req.file.filename,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Evaluation error:', error);
    console.error('Error details:', JSON.stringify({
      message: error.message,
      status: error.status,
      code: error.code,
      type: error.type,
      error: error.error
    }, null, 2));

    if (req.file) {
      fs.unlink(req.file.path, () => {});
    }

    if (error.message?.includes('ANTHROPIC_API_KEY')) {
      return res.status(503).json({ error: 'AI service not configured. Please set ANTHROPIC_API_KEY.' });
    }

    // Handle Anthropic API errors
    if (error.status === 401 || error.message?.includes('authentication') || error.message?.includes('invalid_api_key') || error.error?.type === 'authentication_error') {
      return res.status(503).json({
        error: 'Invalid API key. Please check your ANTHROPIC_API_KEY.',
        details: error.message
      });
    }

    if (error.status === 400 || error.message?.includes('invalid_request') || error.error?.type === 'invalid_request_error') {
      return res.status(400).json({
        error: 'Invalid request to AI service. Please try a different image.',
        details: error.message || error.error?.message
      });
    }

    if (error.status === 429 || error.error?.type === 'rate_limit_error') {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please wait a moment and try again.',
        details: error.message
      });
    }

    // Handle model not found errors
    if (error.status === 404 || error.message?.includes('model') || error.error?.type === 'not_found_error') {
      return res.status(400).json({
        error: 'AI model not found. The model may have been deprecated.',
        details: error.message || error.error?.message
      });
    }

    // Handle network/connection errors
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return res.status(503).json({
        error: 'Unable to connect to AI service. Please check your internet connection.'
      });
    }

    res.status(500).json({
      error: 'Failed to analyze image. Please try again.',
      details: error.message || error.error?.message || 'Unknown error occurred'
    });
  }
});

// Save confirmed evaluation
router.post('/save-evaluation', authenticateToken, (req, res) => {
  try {
    const {
      strategyId,
      ticker,
      direction,
      entry_price,
      stop_loss,
      targets,
      timeframe,
      trade_date,
      pnl,
      pnl_r,
      setup_notes,
      compliance_score,
      rule_results,
      tags,
      ai_feedback,
      imagePath,
      outcome
    } = req.body;

    const db = getDb();

    db.run(`
      INSERT INTO trade_evaluations (
        user_id, strategy_id, ticker, direction, entry_price, stop_loss, targets,
        timeframe, trade_date, pnl, pnl_r, setup_notes, compliance_score,
        rule_results, tags, ai_feedback, image_path, outcome
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      req.user.id,
      strategyId || null,
      ticker,
      direction,
      entry_price,
      stop_loss,
      JSON.stringify(targets || []),
      timeframe,
      trade_date,
      pnl,
      pnl_r,
      setup_notes,
      compliance_score,
      JSON.stringify(rule_results || []),
      JSON.stringify(tags || []),
      ai_feedback,
      imagePath,
      outcome
    ]);

    saveDatabase();

    const evalResult = db.exec('SELECT last_insert_rowid() as id');
    const evalId = evalResult[0].values[0][0];

    res.json({ success: true, evaluationId: evalId });
  } catch (error) {
    console.error('Save evaluation error:', error);
    res.status(500).json({ error: 'Failed to save evaluation' });
  }
});

// Get evaluation history
router.get('/evaluations', authenticateToken, (req, res) => {
  try {
    const { strategyId, limit = 50 } = req.query;
    const db = getDb();

    let query = `
      SELECT te.*, s.name as strategy_name
      FROM trade_evaluations te
      LEFT JOIN strategies s ON te.strategy_id = s.id
      WHERE te.user_id = ?
    `;
    const params = [req.user.id];

    if (strategyId) {
      query += ' AND te.strategy_id = ?';
      params.push(strategyId);
    }

    query += ` ORDER BY te.created_at DESC LIMIT ?`;
    params.push(parseInt(limit));

    const result = db.exec(query, params);
    const evaluations = rowsToObjects(result);

    // Parse JSON fields
    evaluations.forEach(e => {
      try { e.targets = JSON.parse(e.targets || '[]'); } catch { e.targets = []; }
      try { e.rule_results = JSON.parse(e.rule_results || '[]'); } catch { e.rule_results = []; }
      try { e.tags = JSON.parse(e.tags || '[]'); } catch { e.tags = []; }
    });

    res.json(evaluations);
  } catch (error) {
    console.error('Get evaluations error:', error);
    res.status(500).json({ error: 'Failed to get evaluations' });
  }
});

// Get strategy performance stats
router.get('/performance', authenticateToken, (req, res) => {
  try {
    const { strategyId } = req.query;
    const db = getDb();

    let query = `
      SELECT
        te.strategy_id,
        s.name as strategy_name,
        COUNT(*) as total_trades,
        SUM(CASE WHEN te.outcome = 'win' THEN 1 ELSE 0 END) as wins,
        SUM(CASE WHEN te.outcome = 'loss' THEN 1 ELSE 0 END) as losses,
        SUM(CASE WHEN te.outcome = 'breakeven' THEN 1 ELSE 0 END) as breakeven,
        AVG(te.pnl_r) as avg_r,
        SUM(te.pnl_r) as total_r,
        AVG(te.compliance_score) as avg_compliance,
        SUM(te.pnl) as total_pnl
      FROM trade_evaluations te
      LEFT JOIN strategies s ON te.strategy_id = s.id
      WHERE te.user_id = ?
    `;
    const params = [req.user.id];

    if (strategyId) {
      query += ' AND te.strategy_id = ?';
      params.push(strategyId);
    }

    query += ' GROUP BY te.strategy_id';

    const result = db.exec(query, params);
    const stats = rowsToObjects(result);

    // Calculate additional metrics
    stats.forEach(s => {
      s.win_rate = s.total_trades > 0 ? ((s.wins / s.total_trades) * 100).toFixed(1) : 0;
      const avgWin = s.wins > 0 ? (s.total_r / s.wins) : 0;
      const avgLoss = s.losses > 0 ? Math.abs(s.total_r / s.losses) : 1;
      s.expectancy = s.total_trades > 0
        ? ((s.win_rate / 100) * avgWin - ((100 - s.win_rate) / 100) * avgLoss).toFixed(2)
        : 0;
    });

    // Get rule-break frequency
    const ruleBreaksQuery = `
      SELECT te.rule_results, te.strategy_id
      FROM trade_evaluations te
      WHERE te.user_id = ? ${strategyId ? 'AND te.strategy_id = ?' : ''}
    `;
    const ruleParams = strategyId ? [req.user.id, strategyId] : [req.user.id];
    const ruleResult = db.exec(ruleBreaksQuery, ruleParams);
    const allEvals = rowsToObjects(ruleResult);

    const ruleBreakFrequency = {};
    allEvals.forEach(e => {
      try {
        const rules = JSON.parse(e.rule_results || '[]');
        rules.forEach(r => {
          if (!r.passed) {
            const key = r.rule_name;
            ruleBreakFrequency[key] = (ruleBreakFrequency[key] || 0) + 1;
          }
        });
      } catch {}
    });

    res.json({
      strategies: stats,
      ruleBreakFrequency: Object.entries(ruleBreakFrequency)
        .sort((a, b) => b[1] - a[1])
        .map(([rule, count]) => ({ rule, count }))
    });
  } catch (error) {
    console.error('Performance stats error:', error);
    res.status(500).json({ error: 'Failed to get performance stats' });
  }
});

// Delete evaluation
router.delete('/evaluations/:id', authenticateToken, (req, res) => {
  try {
    const db = getDb();

    // Get image path first
    const evalResult = db.exec(
      'SELECT image_path FROM trade_evaluations WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    const evals = rowsToObjects(evalResult);

    if (evals.length > 0 && evals[0].image_path) {
      const imagePath = path.join(uploadDir, evals[0].image_path);
      fs.unlink(imagePath, () => {});
    }

    db.run('DELETE FROM trade_evaluations WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
    saveDatabase();

    res.json({ success: true });
  } catch (error) {
    console.error('Delete evaluation error:', error);
    res.status(500).json({ error: 'Failed to delete evaluation' });
  }
});

export default router;
