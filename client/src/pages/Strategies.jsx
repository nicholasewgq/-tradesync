import { useState, useEffect, useRef } from 'react';
import {
  Target,
  Plus,
  Trash2,
  Edit3,
  Upload,
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  BarChart3,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Save,
  ChevronRight,
  Filter,
  Award,
  Percent,
  DollarSign,
  Activity,
  Tag,
  Image,
  X,
  Check,
  ListChecks,
  Zap,
  BookOpen,
  Shield,
  Layers,
  ArrowRight,
  Star,
  Download
} from 'lucide-react';
import { api } from '../utils/api';

// Pre-built trading strategies
const PRESET_STRATEGIES = [
  {
    id: 'ict',
    name: 'ICT (Inner Circle Trader)',
    description: 'Smart money concepts focusing on institutional order flow, liquidity, and market structure.',
    icon: '🏦',
    color: 'from-blue-500 to-indigo-600',
    difficulty: 'Advanced',
    rules: [
      { name: 'Order Block Entry', description: 'Enter at a valid bullish/bearish order block with displacement' },
      { name: 'Fair Value Gap', description: 'Price should fill into a fair value gap (FVG) before entry' },
      { name: 'Liquidity Sweep', description: 'Wait for liquidity grab (stop hunt) before entering' },
      { name: 'Market Structure Shift', description: 'Confirm break of structure (BOS) or change of character (CHoCH)' },
      { name: 'Kill Zone Entry', description: 'Trade during high-probability times (London/NY sessions)' },
      { name: 'Premium/Discount Zone', description: 'Buy in discount zone, sell in premium zone (use Fib)' }
    ]
  },
  {
    id: 'smc',
    name: 'SMC (Smart Money Concepts)',
    description: 'Identify and trade with institutional money flow using structure and order flow analysis.',
    icon: '💎',
    color: 'from-purple-500 to-pink-600',
    difficulty: 'Advanced',
    rules: [
      { name: 'Break of Structure', description: 'Confirm BOS with strong momentum candle' },
      { name: 'Order Block Mitigation', description: 'Enter at unmitigated order block' },
      { name: 'Imbalance Fill', description: 'Look for price to fill imbalances before continuation' },
      { name: 'Equal Highs/Lows Sweep', description: 'Wait for liquidity sweep of equal levels' },
      { name: 'Inducement Recognition', description: 'Identify and avoid inducement traps' },
      { name: 'Risk to Reward 1:3+', description: 'Minimum 1:3 risk to reward ratio' }
    ]
  },
  {
    id: 'supply-demand',
    name: 'Supply & Demand',
    description: 'Trade based on institutional supply and demand zones where price is likely to react.',
    icon: '⚖️',
    color: 'from-emerald-500 to-teal-600',
    difficulty: 'Intermediate',
    rules: [
      { name: 'Fresh Zone Entry', description: 'Only trade fresh (untested) supply/demand zones' },
      { name: 'Strong Departure', description: 'Zone must have strong departure move (3+ candles)' },
      { name: 'Base Formation', description: 'Look for consolidation base before the move' },
      { name: 'Time at Level', description: 'Less time spent at zone = stronger zone' },
      { name: 'Drop-Base-Rally/Rally-Base-Drop', description: 'Identify proper zone formation pattern' },
      { name: 'Zone Confluence', description: 'Multiple timeframe zone alignment' }
    ]
  },
  {
    id: 'price-action',
    name: 'Price Action Trading',
    description: 'Pure price movement analysis using candlestick patterns and key levels.',
    icon: '📊',
    color: 'from-amber-500 to-orange-600',
    difficulty: 'Intermediate',
    rules: [
      { name: 'Key Level Reaction', description: 'Trade reactions at support/resistance levels' },
      { name: 'Candlestick Confirmation', description: 'Wait for reversal candle pattern (engulfing, pin bar, etc.)' },
      { name: 'Trend Alignment', description: 'Trade in direction of higher timeframe trend' },
      { name: 'Clean Price Structure', description: 'Clear higher highs/lows or lower highs/lows' },
      { name: 'Volume Confirmation', description: 'Higher volume on breakout/reversal candles' },
      { name: 'No Trading in Chop', description: 'Avoid ranging/consolidating markets' }
    ]
  },
  {
    id: 'breakout',
    name: 'Breakout Trading',
    description: 'Trade explosive moves when price breaks out of consolidation or key levels.',
    icon: '🚀',
    color: 'from-red-500 to-rose-600',
    difficulty: 'Beginner',
    rules: [
      { name: 'Consolidation Period', description: 'Minimum 5+ candles of consolidation before breakout' },
      { name: 'Volume Spike', description: 'Breakout candle must have above-average volume' },
      { name: 'Clean Break', description: 'Full candle close beyond the level, not just a wick' },
      { name: 'Retest Entry', description: 'Wait for retest of broken level when possible' },
      { name: 'Momentum Confirmation', description: 'RSI/MACD confirming direction' },
      { name: 'Stop Below Structure', description: 'Place stop below consolidation low/high' }
    ]
  },
  {
    id: 'trend-following',
    name: 'Trend Following',
    description: 'Ride the trend with pullback entries using moving averages and momentum.',
    icon: '📈',
    color: 'from-cyan-500 to-blue-600',
    difficulty: 'Beginner',
    rules: [
      { name: 'Trend Confirmation', description: 'Price above/below 20 & 50 EMA for trend direction' },
      { name: 'Pullback to MA', description: 'Enter on pullback to 20 EMA or 50 EMA' },
      { name: 'Higher Timeframe Alignment', description: 'Daily/4H trend matches entry timeframe' },
      { name: 'Momentum Filter', description: 'RSI between 40-60 on pullback (not overbought/oversold)' },
      { name: 'Structure Intact', description: 'Trend structure (HH/HL or LH/LL) still intact' },
      { name: 'Trail Stop with MA', description: 'Use moving average as trailing stop' }
    ]
  },
  {
    id: 'scalping',
    name: 'Scalping Strategy',
    description: 'Quick in-and-out trades capturing small moves with tight risk management.',
    icon: '⚡',
    color: 'from-yellow-500 to-amber-600',
    difficulty: 'Advanced',
    rules: [
      { name: 'High Liquidity Sessions', description: 'Only trade during London/NY overlap' },
      { name: 'Tight Spread', description: 'Spread must be less than 2 pips' },
      { name: 'Quick Target', description: 'Target 5-15 pips, stop 5-10 pips' },
      { name: 'No News Trading', description: 'Avoid trading 30 min before/after major news' },
      { name: 'Order Flow Reading', description: 'Use DOM/tape reading for entry timing' },
      { name: 'Max 3 Losses', description: 'Stop trading after 3 consecutive losses' }
    ]
  },
  {
    id: 'swing',
    name: 'Swing Trading',
    description: 'Capture multi-day moves by trading major swing points and trends.',
    icon: '🌊',
    color: 'from-indigo-500 to-violet-600',
    difficulty: 'Intermediate',
    rules: [
      { name: 'Daily Chart Setup', description: 'Primary analysis on daily timeframe' },
      { name: 'Swing Point Entry', description: 'Enter at swing high/low with confirmation' },
      { name: 'Multi-Day Hold', description: 'Hold positions for 2-10 days minimum' },
      { name: 'Wide Stop Loss', description: 'Stop loss beyond daily ATR' },
      { name: 'Partial Profit Taking', description: 'Take partials at 1:1 and 1:2 R:R' },
      { name: 'Fundamental Alignment', description: 'Check news/fundamentals support the direction' }
    ]
  }
];

export function Strategies() {
  const [activeTab, setActiveTab] = useState('evaluate');
  const [strategies, setStrategies] = useState([]);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [loading, setLoading] = useState(false);
  const [evaluations, setEvaluations] = useState([]);
  const [performance, setPerformance] = useState(null);

  // Strategy form
  const [showStrategyForm, setShowStrategyForm] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState(null);
  const [strategyName, setStrategyName] = useState('');
  const [strategyDesc, setStrategyDesc] = useState('');
  const [newRules, setNewRules] = useState([{ name: '', description: '' }]);

  // Preset strategy modal
  const [showPresetModal, setShowPresetModal] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState(null);

  // Evaluation state
  const [evalResult, setEvalResult] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedData, setEditedData] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchStrategies();
    fetchEvaluations();
    fetchPerformance();
  }, []);

  const fetchStrategies = async () => {
    try {
      const response = await api.get('/strategies');
      setStrategies(response.data);
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
    }
  };

  const fetchEvaluations = async (strategyId = null) => {
    try {
      const url = strategyId ? `/strategies/evaluations?strategyId=${strategyId}` : '/strategies/evaluations';
      const response = await api.get(url);
      setEvaluations(response.data);
    } catch (error) {
      console.error('Failed to fetch evaluations:', error);
    }
  };

  const fetchPerformance = async (strategyId = null) => {
    try {
      const url = strategyId ? `/strategies/performance?strategyId=${strategyId}` : '/strategies/performance';
      const response = await api.get(url);
      setPerformance(response.data);
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    }
  };

  const handleCreateStrategy = async () => {
    if (!strategyName.trim()) {
      alert('Strategy name is required');
      return;
    }

    try {
      const rules = newRules.filter(r => r.name.trim());
      await api.post('/strategies', {
        name: strategyName,
        description: strategyDesc,
        rules: rules.map(r => ({ name: r.name, description: r.description }))
      });

      setShowStrategyForm(false);
      setStrategyName('');
      setStrategyDesc('');
      setNewRules([{ name: '', description: '' }]);
      fetchStrategies();
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to create strategy');
    }
  };

  const handleDeleteStrategy = async (id) => {
    if (!confirm('Delete this strategy? This cannot be undone.')) return;

    try {
      await api.delete(`/strategies/${id}`);
      fetchStrategies();
      if (selectedStrategy?.id === id) {
        setSelectedStrategy(null);
      }
    } catch (error) {
      alert('Failed to delete strategy');
    }
  };

  const handleInstallPreset = async (preset) => {
    try {
      setLoading(true);
      await api.post('/strategies', {
        name: preset.name,
        description: preset.description,
        rules: preset.rules.map(r => ({ name: r.name, description: r.description }))
      });

      setShowPresetModal(false);
      setSelectedPreset(null);
      fetchStrategies();
      alert(`${preset.name} strategy installed successfully!`);
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to install strategy');
    } finally {
      setLoading(false);
    }
  };

  const handleAddRule = async (strategyId, ruleName, ruleDesc) => {
    try {
      await api.post(`/strategies/${strategyId}/rules`, {
        name: ruleName,
        description: ruleDesc
      });
      fetchStrategies();
    } catch (error) {
      alert('Failed to add rule');
    }
  };

  const handleDeleteRule = async (strategyId, ruleId) => {
    try {
      await api.delete(`/strategies/${strategyId}/rules/${ruleId}`);
      fetchStrategies();
    } catch (error) {
      alert('Failed to delete rule');
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setEvalResult(null);

    try {
      const formData = new FormData();
      formData.append('image', file);
      if (selectedStrategy) {
        formData.append('strategyId', selectedStrategy.id);
      }

      const response = await api.post('/strategies/evaluate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setEvalResult(response.data);
      setEditedData({
        ...response.data.analysis.extracted,
        outcome: null,
        rule_results: response.data.analysis.rule_results || [],
        compliance_score: response.data.analysis.compliance_score || 0,
        improvements: response.data.analysis.improvements || [],
        suggested_tags: response.data.analysis.suggested_tags || [],
        overall_feedback: response.data.analysis.overall_feedback || ''
      });
      setEditMode(true);
    } catch (error) {
      const errorData = error.response?.data;
      if (errorData?.partial_data) {
        alert(`${errorData.error}\n\n${errorData.details}`);
      } else {
        alert(errorData?.error || 'Failed to analyze image');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEvaluation = async () => {
    if (!editedData.outcome) {
      alert('Please select trade outcome (Win/Loss/Breakeven)');
      return;
    }

    setLoading(true);
    try {
      await api.post('/strategies/save-evaluation', {
        strategyId: selectedStrategy?.id,
        ticker: editedData.ticker,
        direction: editedData.direction,
        entry_price: editedData.entry_price,
        stop_loss: editedData.stop_loss,
        targets: editedData.targets,
        timeframe: editedData.timeframe,
        trade_date: editedData.trade_date,
        pnl: editedData.pnl,
        pnl_r: editedData.pnl_r,
        setup_notes: editedData.setup_notes,
        compliance_score: editedData.compliance_score,
        rule_results: editedData.rule_results,
        tags: editedData.suggested_tags,
        ai_feedback: editedData.overall_feedback,
        imagePath: evalResult.imagePath,
        outcome: editedData.outcome
      });

      setEvalResult(null);
      setEditedData(null);
      setEditMode(false);
      fetchEvaluations();
      fetchPerformance();
      alert('Trade evaluation saved successfully!');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to save evaluation');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEvaluation = async (id) => {
    if (!confirm('Delete this evaluation?')) return;

    try {
      await api.delete(`/strategies/evaluations/${id}`);
      fetchEvaluations();
      fetchPerformance();
    } catch (error) {
      alert('Failed to delete evaluation');
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl p-8 text-white mb-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-emerald-300/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Target className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Strategy Evaluator</h1>
                <p className="text-white/80">Track trades against your strategy rules with AI analysis</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'evaluate', label: 'Evaluate Trade', icon: Upload },
          { id: 'strategies', label: 'My Strategies', icon: ListChecks },
          { id: 'history', label: 'History', icon: Activity },
          { id: 'performance', label: 'Performance', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Evaluate Tab */}
      {activeTab === 'evaluate' && (
        <div className="space-y-6">
          {/* Strategy Selector */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Select Strategy</h3>
                <p className="text-sm text-gray-500">AI will evaluate your trade against the selected strategy's rules</p>
              </div>
              {strategies.length === 0 && (
                <button
                  onClick={() => setActiveTab('strategies')}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all"
                >
                  <Download className="w-4 h-4" />
                  Install Strategies
                </button>
              )}
            </div>

            {strategies.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <Target className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">No strategies installed yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Go to the Strategies tab to install pro trading strategies or create your own
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => setSelectedStrategy(null)}
                    className={`p-4 rounded-xl font-medium transition-all text-center border-2 ${
                      !selectedStrategy
                        ? 'bg-gray-100 dark:bg-gray-700 border-gray-400 dark:border-gray-500'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                    }`}
                  >
                    <XCircle className={`w-6 h-6 mx-auto mb-2 ${!selectedStrategy ? 'text-gray-600 dark:text-gray-300' : 'text-gray-400'}`} />
                    <span className={!selectedStrategy ? 'text-gray-900 dark:text-white' : 'text-gray-500'}>General Analysis</span>
                    <p className="text-xs text-gray-400 mt-1">No specific rules</p>
                  </button>

                  {strategies.map(s => {
                    const preset = PRESET_STRATEGIES.find(p => p.name === s.name);
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStrategy(s)}
                        className={`p-4 rounded-xl font-medium transition-all text-center border-2 ${
                          selectedStrategy?.id === s.id
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500'
                            : 'bg-gray-50 dark:bg-gray-700/50 border-transparent hover:border-gray-200 dark:hover:border-gray-600'
                        }`}
                      >
                        <span className="text-2xl block mb-2">{preset?.icon || '📋'}</span>
                        <span className={`block truncate ${selectedStrategy?.id === s.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-gray-700 dark:text-gray-300'}`}>
                          {s.name.split('(')[0].trim()}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{s.rules?.length || 0} rules</p>
                      </button>
                    );
                  })}
                </div>

                {selectedStrategy && selectedStrategy.rules?.length > 0 && (
                  <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Rules AI will evaluate:
                    </p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {selectedStrategy.rules.map((r, i) => (
                        <div key={r.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <div className="w-5 h-5 rounded-full bg-emerald-200 dark:bg-emerald-800 flex items-center justify-center text-xs font-bold text-emerald-700 dark:text-emerald-400">
                            {i + 1}
                          </div>
                          {r.rule_name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Upload Section */}
          {!editMode && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="bg-white dark:bg-gray-800 rounded-2xl p-12 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-all text-center"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              {loading ? (
                <div className="flex flex-col items-center">
                  <RefreshCw className="w-16 h-16 text-emerald-500 animate-spin mb-4" />
                  <p className="text-gray-600 dark:text-gray-300 font-medium">Analyzing trade...</p>
                </div>
              ) : (
                <>
                  <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-10 h-10 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Upload Trade Screenshot</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Click or drag to upload a screenshot of your trade
                  </p>
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Camera className="w-4 h-4" />
                      <span>PNG, JPG, WebP</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Image className="w-4 h-4" />
                      <span>Max 10MB</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Edit/Confirm Section - Analysis Results */}
          {editMode && editedData && (
            <div className="space-y-6">
              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => { setEditMode(false); setEvalResult(null); setEditedData(null); }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>

              {/* Pattern Analysis Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-6">
                  <BarChart3 className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Pattern Analysis</h3>
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <span className="px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-lg text-sm font-medium">
                    {editedData.timeframe || '1H'} Timeframe
                  </span>
                  <input
                    type="text"
                    value={editedData.timeframe || ''}
                    onChange={e => setEditedData({ ...editedData, timeframe: e.target.value })}
                    placeholder="e.g., 1H, 4H, D"
                    className="px-3 py-1.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm w-24"
                  />
                </div>

                <div className="grid grid-cols-2 gap-8">
                  {/* Current Price / Entry */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Entry Price</p>
                    <input
                      type="number"
                      step="any"
                      value={editedData.entry_price || ''}
                      onChange={e => setEditedData({ ...editedData, entry_price: parseFloat(e.target.value) || null })}
                      className="text-4xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-indigo-500 outline-none w-full"
                    />
                  </div>

                  {/* Trade Direction */}
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Trade Direction</p>
                    <div className="flex items-center gap-4">
                      <div className={`w-1.5 h-12 rounded-full ${editedData.direction === 'long' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <button
                          onClick={() => setEditedData({ ...editedData, direction: editedData.direction === 'long' ? 'short' : 'long' })}
                          className={`text-3xl font-bold ${editedData.direction === 'long' ? 'text-green-500' : 'text-red-500'}`}
                        >
                          {editedData.direction === 'long' ? 'Buy' : 'Sell'}
                        </button>
                        <p className="text-sm text-gray-500">
                          {editedData.direction === 'long' ? 'Enter long position' : 'Enter short position'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticker Input */}
                <div className="mt-6 flex items-center gap-4">
                  <label className="text-sm text-gray-500">Ticker/Pair:</label>
                  <input
                    type="text"
                    value={editedData.ticker || ''}
                    onChange={e => setEditedData({ ...editedData, ticker: e.target.value.toUpperCase() })}
                    className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl font-bold text-lg"
                    placeholder="SPY, BTC, etc."
                  />
                </div>
              </div>

              {/* Risk Management Section */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center gap-2 mb-6">
                  <Target className="w-5 h-5 text-indigo-500" />
                  <h3 className="font-bold text-gray-900 dark:text-white">Risk Management</h3>
                </div>

                {/* Active Risk Parameters */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Risk Parameters</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Risk %</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {editedData.entry_price && editedData.stop_loss
                          ? `${Math.abs(((editedData.stop_loss - editedData.entry_price) / editedData.entry_price) * 100).toFixed(2)}%`
                          : '0.00%'}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">R:R Ratio</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {editedData.entry_price && editedData.stop_loss && editedData.targets?.[0]
                          ? `1:${Math.abs((editedData.targets[0] - editedData.entry_price) / (editedData.entry_price - editedData.stop_loss)).toFixed(1)}`
                          : '1:0'}
                      </p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-3">
                      <p className="text-xs text-gray-500 mb-1">Entry</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{editedData.entry_price || '-'}</p>
                    </div>
                  </div>
                </div>

                {/* Visual Price Levels */}
                <div className="relative py-8 mb-6">
                  <div className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-green-400 via-blue-400 to-red-400 rounded-full" />

                  <div className="relative flex justify-between items-center">
                    {/* Take Profit */}
                    {editedData.targets?.[0] && (
                      <div className="flex flex-col items-center">
                        <span className="px-2 py-1 bg-green-500 text-white text-xs font-bold rounded mb-2">TP1</span>
                        <div className="w-4 h-4 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg" />
                        <div className="w-0.5 h-6 bg-green-500" />
                      </div>
                    )}

                    {/* Entry */}
                    <div className="flex flex-col items-center">
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-bold rounded mb-2">ENT</span>
                      <div className="w-4 h-4 bg-blue-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg" />
                      <div className="w-0.5 h-6 bg-blue-500" />
                    </div>

                    {/* Stop Loss */}
                    <div className="flex flex-col items-center">
                      <span className="px-2 py-1 bg-red-500 text-white text-xs font-bold rounded mb-2">SL</span>
                      <div className="w-4 h-4 bg-red-500 rounded-full border-4 border-white dark:border-gray-800 shadow-lg" />
                      <div className="w-0.5 h-6 bg-red-500" />
                    </div>
                  </div>
                </div>

                {/* Price Level Cards */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Stop Loss Card */}
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Stop Loss</p>
                    <input
                      type="number"
                      step="any"
                      value={editedData.stop_loss || ''}
                      onChange={e => setEditedData({ ...editedData, stop_loss: parseFloat(e.target.value) || null })}
                      className="text-2xl font-bold text-red-600 bg-transparent w-full outline-none"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Risk: {editedData.entry_price && editedData.stop_loss
                        ? `${Math.abs(((editedData.stop_loss - editedData.entry_price) / editedData.entry_price) * 100).toFixed(2)}%`
                        : '0%'}
                    </p>
                  </div>

                  {/* R:R Card */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Risk : Reward</p>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-blue-600">
                        1:{editedData.entry_price && editedData.stop_loss && editedData.targets?.[0]
                          ? Math.abs((editedData.targets[0] - editedData.entry_price) / (editedData.entry_price - editedData.stop_loss)).toFixed(1)
                          : '0'}
                      </span>
                      {editedData.entry_price && editedData.stop_loss && editedData.targets?.[0] &&
                        Math.abs((editedData.targets[0] - editedData.entry_price) / (editedData.entry_price - editedData.stop_loss)) >= 2 && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Reward: {editedData.entry_price && editedData.targets?.[0]
                        ? `${Math.abs(((editedData.targets[0] - editedData.entry_price) / editedData.entry_price) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>

                  {/* Take Profit Card */}
                  <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 border border-green-100 dark:border-green-800">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Take Profit</p>
                    <input
                      type="number"
                      step="any"
                      value={editedData.targets?.[0] || ''}
                      onChange={e => setEditedData({ ...editedData, targets: [parseFloat(e.target.value) || null] })}
                      className="text-2xl font-bold text-green-600 bg-transparent w-full outline-none"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Reward: {editedData.entry_price && editedData.targets?.[0]
                        ? `${Math.abs(((editedData.targets[0] - editedData.entry_price) / editedData.entry_price) * 100).toFixed(1)}%`
                        : '0%'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Additional Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Trade Date</label>
                    <input
                      type="text"
                      value={editedData.trade_date || ''}
                      onChange={e => setEditedData({ ...editedData, trade_date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                      placeholder="MM/DD/YYYY"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">P&L ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={editedData.pnl || ''}
                      onChange={e => setEditedData({ ...editedData, pnl: parseFloat(e.target.value) || null })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">P&L (R)</label>
                    <input
                      type="number"
                      step="any"
                      value={editedData.pnl_r || ''}
                      onChange={e => setEditedData({ ...editedData, pnl_r: parseFloat(e.target.value) || null })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Confidence</label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                          style={{ width: `${editedData.confidence || 0}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{editedData.confidence || 0}%</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">Setup Notes</label>
                  <textarea
                    value={editedData.setup_notes || ''}
                    onChange={e => setEditedData({ ...editedData, setup_notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    placeholder="Add any notes about this setup..."
                  />
                </div>
              </div>

              {/* Trade Outcome */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Trade Outcome *</h3>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'win', label: 'Winner', icon: TrendingUp, color: 'green', bg: 'bg-green-500' },
                    { id: 'loss', label: 'Loser', icon: TrendingDown, color: 'red', bg: 'bg-red-500' },
                    { id: 'breakeven', label: 'Breakeven', icon: Activity, color: 'gray', bg: 'bg-gray-500' }
                  ].map(outcome => (
                    <button
                      key={outcome.id}
                      onClick={() => setEditedData({ ...editedData, outcome: outcome.id })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        editedData.outcome === outcome.id
                          ? `${outcome.bg} border-transparent text-white shadow-lg`
                          : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <outcome.icon className={`w-8 h-8 mx-auto mb-2 ${editedData.outcome === outcome.id ? 'text-white' : `text-${outcome.color}-500`}`} />
                      <p className={`font-bold ${editedData.outcome === outcome.id ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                        {outcome.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rule Results */}
              {editedData.rule_results?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <ListChecks className="w-5 h-5 text-indigo-500" />
                      <h3 className="font-bold text-gray-900 dark:text-white">Strategy Compliance</h3>
                    </div>
                    <div className={`px-4 py-2 rounded-xl font-bold text-lg ${
                      editedData.compliance_score >= 80 ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                      editedData.compliance_score >= 50 ? 'bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400' :
                      'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                    }`}>
                      {editedData.compliance_score}% Score
                    </div>
                  </div>
                  <div className="space-y-3">
                    {editedData.rule_results.map((rule, i) => (
                      <div
                        key={i}
                        onClick={() => {
                          const updated = [...editedData.rule_results];
                          updated[i].passed = !updated[i].passed;
                          const passedCount = updated.filter(r => r.passed).length;
                          setEditedData({
                            ...editedData,
                            rule_results: updated,
                            compliance_score: Math.round((passedCount / updated.length) * 100)
                          });
                        }}
                        className={`flex items-center justify-between p-4 rounded-xl cursor-pointer transition-all ${
                          rule.passed
                            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                            : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {rule.passed ? (
                            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                              <X className="w-5 h-5 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{rule.rule_name}</p>
                            <p className="text-sm text-gray-500">{rule.reasoning}</p>
                          </div>
                        </div>
                        <span className={`text-sm font-medium ${rule.passed ? 'text-green-600' : 'text-red-600'}`}>
                          {rule.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Feedback & Tags */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
                  <h3 className="font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5" />
                    AI Analysis
                  </h3>
                  <p className="text-white/90 mb-4">{editedData.overall_feedback}</p>
                  {editedData.improvements?.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-white/70">Suggestions:</p>
                      {editedData.improvements.map((imp, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm text-white/80">
                          <ChevronRight className="w-4 h-4 mt-0.5 flex-shrink-0" />
                          {imp}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-emerald-500" />
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {editedData.suggested_tags?.map((tag, i) => (
                      <span key={i} className="px-4 py-2 bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 text-emerald-700 dark:text-emerald-400 rounded-xl text-sm font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveEvaluation}
                disabled={loading || !editedData.outcome}
                className="w-full py-5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-lg hover:shadow-xl hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-3"
              >
                {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                Save Trade Evaluation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Strategies Tab */}
      {activeTab === 'strategies' && (
        <div className="space-y-6">
          {/* Preset Strategies Section */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Pro Trading Strategies</h2>
                  <p className="text-white/80 text-sm">Install proven strategies used by professional traders</p>
                </div>
              </div>
              <button
                onClick={() => setShowPresetModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-xl font-medium transition-all"
              >
                <Layers className="w-5 h-5" />
                Browse All
              </button>
            </div>

            {/* Quick preset cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {PRESET_STRATEGIES.slice(0, 4).map(preset => (
                <button
                  key={preset.id}
                  onClick={() => { setSelectedPreset(preset); setShowPresetModal(true); }}
                  className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-xl text-left transition-all group"
                >
                  <span className="text-2xl mb-2 block">{preset.icon}</span>
                  <p className="font-semibold text-sm">{preset.name.split('(')[0].trim()}</p>
                  <p className="text-xs text-white/60 mt-1">{preset.rules.length} rules</p>
                </button>
              ))}
            </div>
          </div>

          {/* Preset Strategy Modal */}
          {showPresetModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">Pro Trading Strategies</h3>
                      <p className="text-gray-500 text-sm">Select a strategy to install and use for trade evaluation</p>
                    </div>
                    <button
                      onClick={() => { setShowPresetModal(false); setSelectedPreset(null); }}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl"
                    >
                      <X className="w-5 h-5 text-gray-500" />
                    </button>
                  </div>
                </div>

                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {!selectedPreset ? (
                    <div className="grid md:grid-cols-2 gap-4">
                      {PRESET_STRATEGIES.map(preset => (
                        <button
                          key={preset.id}
                          onClick={() => setSelectedPreset(preset)}
                          className="p-5 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl text-left transition-all group border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${preset.color} flex items-center justify-center text-2xl shadow-lg`}>
                              {preset.icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-900 dark:text-white">{preset.name}</h4>
                              </div>
                              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{preset.description}</p>
                              <div className="flex items-center gap-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  preset.difficulty === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                  preset.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                                }`}>
                                  {preset.difficulty}
                                </span>
                                <span className="text-xs text-gray-400">{preset.rules.length} rules</span>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => setSelectedPreset(null)}
                        className="flex items-center gap-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 mb-4"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        Back to all strategies
                      </button>

                      <div className={`p-6 rounded-2xl bg-gradient-to-br ${selectedPreset.color} text-white mb-6`}>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-4xl">{selectedPreset.icon}</span>
                          <div>
                            <h3 className="text-2xl font-bold">{selectedPreset.name}</h3>
                            <p className="text-white/80">{selectedPreset.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{selectedPreset.difficulty}</span>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm">{selectedPreset.rules.length} Rules</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-gray-900 dark:text-white mb-4">Strategy Rules</h4>
                      <div className="space-y-3 mb-6">
                        {selectedPreset.rules.map((rule, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 dark:text-white">{rule.name}</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">{rule.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleInstallPreset(selectedPreset)}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {loading ? (
                          <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : (
                          <Download className="w-5 h-5" />
                        )}
                        Install Strategy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* My Strategies Header */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Trading Strategies</h2>
            <button
              onClick={() => setShowStrategyForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600"
            >
              <Plus className="w-5 h-5" />
              Custom Strategy
            </button>
          </div>

          {/* Strategy Form Modal */}
          {showStrategyForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Create Strategy</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Strategy Name</label>
                    <input
                      type="text"
                      value={strategyName}
                      onChange={e => setStrategyName(e.target.value)}
                      placeholder="e.g., Breakout Strategy"
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      value={strategyDesc}
                      onChange={e => setStrategyDesc(e.target.value)}
                      placeholder="Describe your strategy..."
                      rows={2}
                      className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rules</label>
                    {newRules.map((rule, i) => (
                      <div key={i} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={rule.name}
                          onChange={e => {
                            const updated = [...newRules];
                            updated[i].name = e.target.value;
                            setNewRules(updated);
                          }}
                          placeholder="Rule name"
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                        />
                        <input
                          type="text"
                          value={rule.description}
                          onChange={e => {
                            const updated = [...newRules];
                            updated[i].description = e.target.value;
                            setNewRules(updated);
                          }}
                          placeholder="Description (optional)"
                          className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm"
                        />
                        {newRules.length > 1 && (
                          <button
                            onClick={() => setNewRules(newRules.filter((_, j) => j !== i))}
                            className="text-red-500 hover:text-red-600"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setNewRules([...newRules, { name: '', description: '' }])}
                      className="text-sm text-emerald-500 hover:text-emerald-600 font-medium"
                    >
                      + Add Rule
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => { setShowStrategyForm(false); setNewRules([{ name: '', description: '' }]); }}
                    className="flex-1 py-3 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-xl font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateStrategy}
                    className="flex-1 py-3 bg-emerald-500 text-white rounded-xl font-medium"
                  >
                    Create Strategy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Strategy List */}
          {strategies.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
              <Target className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Strategies Yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Create your first strategy to start tracking rule compliance.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {strategies.map(strategy => (
                <div key={strategy.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">{strategy.name}</h3>
                      {strategy.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{strategy.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleDeleteStrategy(strategy.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Rules ({strategy.rules?.length || 0}):</p>
                    {strategy.rules?.map(rule => (
                      <div key={rule.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{rule.rule_name}</span>
                          {rule.rule_description && (
                            <p className="text-xs text-gray-500">{rule.rule_description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteRule(strategy.id, rule.id)}
                          className="text-gray-400 hover:text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Evaluation History</h2>
            <select
              onChange={e => fetchEvaluations(e.target.value || null)}
              className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl"
            >
              <option value="">All Strategies</option>
              {strategies.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {evaluations.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
              <Activity className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Evaluations Yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Upload your first trade screenshot to start tracking.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluations.map(evaluation => (
                <div key={evaluation.id} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        evaluation.outcome === 'win' ? 'bg-green-100 dark:bg-green-900/30' :
                        evaluation.outcome === 'loss' ? 'bg-red-100 dark:bg-red-900/30' :
                        'bg-gray-100 dark:bg-gray-700'
                      }`}>
                        {evaluation.outcome === 'win' ? (
                          <TrendingUp className="w-6 h-6 text-green-500" />
                        ) : evaluation.outcome === 'loss' ? (
                          <TrendingDown className="w-6 h-6 text-red-500" />
                        ) : (
                          <Activity className="w-6 h-6 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white">
                          {evaluation.ticker} - {evaluation.direction?.toUpperCase()}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {evaluation.strategy_name || 'No Strategy'} • {new Date(evaluation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {evaluation.compliance_score !== null && (
                        <div className={`px-3 py-1 rounded-full text-sm font-bold ${
                          evaluation.compliance_score >= 80 ? 'bg-green-100 text-green-600' :
                          evaluation.compliance_score >= 50 ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {evaluation.compliance_score}% Compliant
                        </div>
                      )}
                      {evaluation.pnl_r && (
                        <span className={`font-bold ${evaluation.pnl_r >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {evaluation.pnl_r >= 0 ? '+' : ''}{evaluation.pnl_r}R
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteEvaluation(evaluation.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Entry</span>
                      <p className="font-medium text-gray-900 dark:text-white">${evaluation.entry_price}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Stop Loss</span>
                      <p className="font-medium text-gray-900 dark:text-white">${evaluation.stop_loss}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Timeframe</span>
                      <p className="font-medium text-gray-900 dark:text-white">{evaluation.timeframe || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">P&L</span>
                      <p className={`font-medium ${evaluation.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {evaluation.pnl ? `$${evaluation.pnl}` : '-'}
                      </p>
                    </div>
                  </div>

                  {evaluation.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {evaluation.tags.map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Strategy Performance</h2>

          {!performance || performance.strategies?.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200/50 dark:border-gray-700/50">
              <BarChart3 className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Performance Data</h3>
              <p className="text-gray-500 dark:text-gray-400">Evaluate some trades to see performance metrics.</p>
            </div>
          ) : (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {performance.strategies.map(s => (
                  <div key={s.strategy_id || 'none'} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                    <h4 className="font-bold text-gray-900 dark:text-white mb-4">{s.strategy_name || 'No Strategy'}</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Win Rate</span>
                        <span className="font-bold text-green-500">{s.win_rate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Total Trades</span>
                        <span className="font-bold text-gray-900 dark:text-white">{s.total_trades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Avg R</span>
                        <span className={`font-bold ${s.avg_r >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {s.avg_r?.toFixed(2) || '0'}R
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Total R</span>
                        <span className={`font-bold ${s.total_r >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {s.total_r?.toFixed(2) || '0'}R
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Expectancy</span>
                        <span className={`font-bold ${s.expectancy >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                          {s.expectancy}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Avg Compliance</span>
                        <span className="font-bold text-gray-900 dark:text-white">{s.avg_compliance?.toFixed(0) || '0'}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rule Break Frequency */}
              {performance.ruleBreakFrequency?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                    Most Broken Rules
                  </h3>
                  <div className="space-y-3">
                    {performance.ruleBreakFrequency.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <span className="text-gray-900 dark:text-white font-medium">{item.rule}</span>
                        <span className="text-red-600 font-bold">{item.count} breaks</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
