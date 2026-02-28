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
  Download,
  Sparkles,
  Brain,
  ChevronDown
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
  const [riskSlider, setRiskSlider] = useState(1);
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
        overall_feedback: response.data.analysis.overall_feedback || '',
        trade_recommendation: response.data.analysis.trade_recommendation || null,
        key_levels: response.data.analysis.key_levels || null
      });
      setEditMode(true);
    } catch (error) {
      const errorData = error.response?.data;
      console.error('Evaluation error:', error.response || error);
      if (errorData?.partial_data) {
        alert(`${errorData.error}\n\n${errorData.details}`);
      } else if (errorData?.details) {
        alert(`${errorData.error}\n\nDetails: ${errorData.details}`);
      } else {
        alert(errorData?.error || 'Failed to analyze image. Please try again.');
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
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Premium Hero Header */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />

        {/* Radial glow effects */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-emerald-300/30 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-400/10 rounded-full blur-3xl" />

        <div className="relative z-10 p-8 md:p-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex items-center gap-5">
              {/* Glowing icon container */}
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center shadow-2xl">
                  <Target className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Strategy Evaluator</h1>
                  {/* AI Powered badge with pulse */}
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/30 rounded-full blur-md animate-pulse" />
                    <span className="relative flex items-center gap-1.5 px-3 py-1.5 bg-white/20 backdrop-blur-sm border border-white/30 rounded-full text-xs font-bold text-white">
                      <Brain className="w-3.5 h-3.5" />
                      AI Powered
                    </span>
                  </div>
                </div>
                <p className="text-white/80 text-lg">Upload trades and get instant AI analysis with buy/sell recommendations</p>
              </div>
            </div>

            {/* Stats pills */}
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl">
                <p className="text-white/70 text-xs">Strategies</p>
                <p className="text-white font-bold text-lg">{strategies.length}</p>
              </div>
              <div className="px-4 py-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl">
                <p className="text-white/70 text-xs">Evaluations</p>
                <p className="text-white font-bold text-lg">{evaluations.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Glass Tabs */}
      <div className="glass-card p-2 flex gap-2">
        {[
          { id: 'evaluate', label: 'Evaluate Trade', icon: Upload, desc: 'AI Analysis' },
          { id: 'strategies', label: 'My Strategies', icon: ListChecks, desc: 'Manage Rules' },
          { id: 'history', label: 'History', icon: Activity, desc: 'Past Trades' },
          { id: 'performance', label: 'Performance', icon: BarChart3, desc: 'Analytics' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-3 px-5 py-4 rounded-xl font-medium transition-all duration-300 ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            <div className="text-left hidden md:block">
              <p className="font-semibold">{tab.label}</p>
              <p className={`text-xs ${activeTab === tab.id ? 'text-white/70' : 'text-gray-500'}`}>{tab.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* Evaluate Tab */}
      {activeTab === 'evaluate' && (
        <div className="space-y-6 fade-in">
          {/* Strategy Selector - Glass Panel */}
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg">Select Strategy</h3>
                  <p className="text-sm text-gray-400">AI will evaluate your trade against the selected rules</p>
                </div>
              </div>
              {strategies.length === 0 && (
                <button
                  onClick={() => setActiveTab('strategies')}
                  className="btn-glow flex items-center gap-2 text-sm"
                >
                  <Download className="w-4 h-4" />
                  Install Strategies
                </button>
              )}
            </div>

            {strategies.length === 0 ? (
              /* Premium Empty State */
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-12 text-center">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)]" />
                <div className="relative">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl animate-pulse" />
                    <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Target className="w-12 h-12 text-emerald-400/50" />
                    </div>
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2">No Strategies Installed</h4>
                  <p className="text-gray-400 mb-6 max-w-md mx-auto">
                    Install professional trading strategies or create your own to start tracking rule compliance
                  </p>
                  <button
                    onClick={() => setActiveTab('strategies')}
                    className="btn-glow inline-flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    Browse Pro Strategies
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  <button
                    onClick={() => setSelectedStrategy(null)}
                    className={`group relative p-5 rounded-xl font-medium transition-all duration-300 text-center border-2 overflow-hidden ${
                      !selectedStrategy
                        ? 'bg-gradient-to-br from-gray-500/20 to-gray-600/20 border-gray-500/50 shadow-lg shadow-gray-500/10'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/10'
                    }`}
                  >
                    <XCircle className={`w-8 h-8 mx-auto mb-3 transition-colors ${!selectedStrategy ? 'text-gray-300' : 'text-gray-500 group-hover:text-gray-400'}`} />
                    <span className={`block font-semibold ${!selectedStrategy ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'}`}>General</span>
                    <p className="text-xs text-gray-500 mt-1">No specific rules</p>
                  </button>

                  {strategies.map(s => {
                    const preset = PRESET_STRATEGIES.find(p => p.name === s.name);
                    const isSelected = selectedStrategy?.id === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => setSelectedStrategy(s)}
                        className={`group relative p-5 rounded-xl font-medium transition-all duration-300 text-center border-2 overflow-hidden ${
                          isSelected
                            ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-emerald-500/50 shadow-lg shadow-emerald-500/20'
                            : 'bg-white/5 border-white/10 hover:border-emerald-500/30 hover:bg-emerald-500/5'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.15),transparent_70%)]" />
                        )}
                        <span className="text-3xl block mb-3 relative">{preset?.icon || '📋'}</span>
                        <span className={`block font-semibold truncate relative ${isSelected ? 'text-emerald-400' : 'text-gray-300 group-hover:text-white'}`}>
                          {s.name.split('(')[0].trim()}
                        </span>
                        <p className="text-xs text-gray-500 mt-1 relative">{s.rules?.length || 0} rules</p>
                      </button>
                    );
                  })}
                </div>

                {selectedStrategy && selectedStrategy.rules?.length > 0 && (
                  <div className="mt-6 p-5 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border border-emerald-500/30">
                    <p className="text-sm font-semibold text-emerald-400 mb-4 flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Rules AI will evaluate:
                    </p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {selectedStrategy.rules.map((r, i) => (
                        <div key={r.id} className="flex items-center gap-3 text-sm text-gray-300 p-2 rounded-lg bg-white/5">
                          <div className="w-6 h-6 rounded-full bg-emerald-500/30 flex items-center justify-center text-xs font-bold text-emerald-400 flex-shrink-0">
                            {i + 1}
                          </div>
                          <span className="truncate">{r.rule_name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Premium Upload Zone */}
          {!editMode && (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="group relative cursor-pointer"
            >
              {/* Animated dashed border */}
              <div className="absolute inset-0 rounded-2xl border-2 border-dashed border-white/20 group-hover:border-emerald-500/50 transition-colors duration-500" />

              {/* Inner frosted glass content */}
              <div className="relative glass-card m-0.5 p-16 text-center overflow-hidden">
                {/* Background glow on hover */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.1),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                {loading ? (
                  <div className="flex flex-col items-center relative">
                    <div className="relative w-24 h-24 mb-6">
                      <div className="absolute inset-0 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
                      <div className="relative w-full h-full rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin" />
                      <Brain className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 text-emerald-400" />
                    </div>
                    <p className="text-white font-semibold text-lg mb-2">Analyzing trade...</p>
                    <p className="text-gray-400 text-sm">AI is extracting data and generating recommendations</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <div className="absolute inset-0 bg-emerald-500/20 rounded-2xl blur-xl group-hover:bg-emerald-500/30 transition-colors" />
                      <div className="relative w-full h-full rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                        <Upload className="w-12 h-12 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">Upload Trade Screenshot</h3>
                    <p className="text-gray-400 mb-6 max-w-md mx-auto">
                      Drop your chart screenshot here or click to browse. AI will analyze patterns and provide recommendations.
                    </p>
                    <div className="flex items-center justify-center gap-6">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Camera className="w-4 h-4" />
                        <span>PNG, JPG, WebP</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Image className="w-4 h-4" />
                        <span>Max 10MB</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analysis Results - Premium Layout */}
          {editMode && editedData && (
            <div className="space-y-6 fade-in">
              {/* Close Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => { setEditMode(false); setEvalResult(null); setEditedData(null); }}
                  className="flex items-center gap-2 px-4 py-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-4 h-4" />
                  Cancel Analysis
                </button>
              </div>

              {/* AI Trade Recommendation - Hero Card */}
              {editedData.trade_recommendation && (
                <div className="glass-card overflow-hidden">
                  {/* Action header with gradient */}
                  <div className={`-m-6 mb-6 p-6 ${
                    editedData.trade_recommendation.action === 'BUY'
                      ? 'bg-gradient-to-r from-emerald-500/20 via-emerald-500/10 to-transparent border-b border-emerald-500/30'
                      : editedData.trade_recommendation.action === 'SELL'
                      ? 'bg-gradient-to-r from-rose-500/20 via-rose-500/10 to-transparent border-b border-rose-500/30'
                      : 'bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent border-b border-amber-500/30'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {/* Large action badge */}
                        <div className={`relative ${
                          editedData.trade_recommendation.action === 'BUY' ? 'text-emerald-500' :
                          editedData.trade_recommendation.action === 'SELL' ? 'text-rose-500' :
                          'text-amber-500'
                        }`}>
                          <div className="absolute inset-0 blur-xl opacity-50 bg-current rounded-2xl" />
                          <div className={`relative px-6 py-3 rounded-2xl font-black text-2xl flex items-center gap-3 border-2 ${
                            editedData.trade_recommendation.action === 'BUY'
                              ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                              : editedData.trade_recommendation.action === 'SELL'
                              ? 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                              : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          }`}>
                            {editedData.trade_recommendation.action === 'BUY' ? (
                              <TrendingUp className="w-7 h-7" />
                            ) : editedData.trade_recommendation.action === 'SELL' ? (
                              <TrendingDown className="w-7 h-7" />
                            ) : (
                              <AlertTriangle className="w-7 h-7" />
                            )}
                            {editedData.trade_recommendation.action}
                          </div>
                        </div>

                        {/* Bias badge */}
                        <div className={`px-4 py-2 rounded-xl text-sm font-semibold border ${
                          editedData.trade_recommendation.bias === 'bullish'
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : editedData.trade_recommendation.bias === 'bearish'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                            : 'bg-gray-500/10 border-gray-500/30 text-gray-400'
                        }`}>
                          {editedData.trade_recommendation.bias?.charAt(0).toUpperCase() + editedData.trade_recommendation.bias?.slice(1)}
                          <span className="text-gray-500 mx-1">•</span>
                          {editedData.trade_recommendation.bias_strength}
                        </div>
                      </div>

                      {/* Quality & R:R */}
                      <div className="flex items-center gap-4">
                        <div className="px-4 py-2 bg-indigo-500/20 border border-indigo-500/30 rounded-xl text-indigo-400 font-bold">
                          R:R {editedData.trade_recommendation.risk_reward_ratio}
                        </div>
                        <div className={`relative w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black border-2 ${
                          editedData.trade_recommendation.trade_quality === 'A+' || editedData.trade_recommendation.trade_quality === 'A'
                            ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                            : editedData.trade_recommendation.trade_quality === 'B'
                            ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                            : editedData.trade_recommendation.trade_quality === 'C'
                            ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                            : 'bg-rose-500/20 border-rose-500/50 text-rose-400'
                        }`}>
                          <div className="absolute inset-0 blur-lg opacity-30 bg-current rounded-2xl" />
                          <span className="relative">{editedData.trade_recommendation.trade_quality}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* AI Suggested Levels */}
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <Zap className="w-4 h-4 text-amber-400" />
                      </div>
                      <h4 className="font-bold text-white">AI Suggested Levels</h4>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="relative overflow-hidden rounded-xl bg-blue-500/10 border border-blue-500/30 p-5 text-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent" />
                        <p className="relative text-xs text-blue-400 font-semibold mb-2 uppercase tracking-wider">Entry</p>
                        <p className="relative text-3xl font-black text-blue-400">
                          {editedData.trade_recommendation.recommended_entry ? `$${editedData.trade_recommendation.recommended_entry}` : '-'}
                        </p>
                      </div>
                      <div className="relative overflow-hidden rounded-xl bg-rose-500/10 border border-rose-500/30 p-5 text-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent" />
                        <p className="relative text-xs text-rose-400 font-semibold mb-2 uppercase tracking-wider">Stop Loss</p>
                        <p className="relative text-3xl font-black text-rose-400">
                          {editedData.trade_recommendation.recommended_stop_loss ? `$${editedData.trade_recommendation.recommended_stop_loss}` : '-'}
                        </p>
                      </div>
                      <div className="relative overflow-hidden rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-5 text-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent" />
                        <p className="relative text-xs text-emerald-400 font-semibold mb-2 uppercase tracking-wider">Target</p>
                        <p className="relative text-3xl font-black text-emerald-400">
                          {editedData.trade_recommendation.recommended_targets?.[0] ? `$${editedData.trade_recommendation.recommended_targets[0]}` : '-'}
                        </p>
                      </div>
                    </div>
                    {editedData.trade_recommendation.recommended_targets?.length > 1 && (
                      <div className="mt-4 flex items-center gap-2 text-sm text-gray-400">
                        <span>All targets:</span>
                        {editedData.trade_recommendation.recommended_targets.map((t, i) => (
                          <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-emerald-400 font-semibold">
                            ${t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Key Levels */}
                  {editedData.key_levels && (editedData.key_levels.resistance?.length > 0 || editedData.key_levels.support?.length > 0) && (
                    <div className="p-5 rounded-xl bg-white/5 border border-white/10 mb-6">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-indigo-400" />
                        </div>
                        <h4 className="font-bold text-white">Key Price Levels</h4>
                      </div>
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <p className="text-xs text-rose-400 font-semibold mb-3 uppercase tracking-wider">Resistance</p>
                          <div className="flex flex-wrap gap-2">
                            {editedData.key_levels.resistance?.map((level, i) => (
                              <span key={i} className="px-4 py-2 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-sm font-bold">
                                ${level}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-emerald-400 font-semibold mb-3 uppercase tracking-wider">Support</p>
                          <div className="flex flex-wrap gap-2">
                            {editedData.key_levels.support?.map((level, i) => (
                              <span key={i} className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold">
                                ${level}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* AI Reasoning */}
                  <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 p-6">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl" />
                    <div className="relative flex items-start gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white mb-2">AI Analysis</h4>
                        <p className="text-gray-300 leading-relaxed">{editedData.trade_recommendation.reasoning}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Trade Details Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Pattern Analysis Card */}
                <div className="glass-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg">Pattern Analysis</h3>
                  </div>

                  <div className="space-y-5">
                    {/* Ticker & Direction Row */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Ticker</label>
                        <input
                          type="text"
                          value={editedData.ticker || ''}
                          onChange={e => setEditedData({ ...editedData, ticker: e.target.value.toUpperCase() })}
                          className="input-premium text-xl font-bold"
                          placeholder="SPY"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Timeframe</label>
                        <input
                          type="text"
                          value={editedData.timeframe || ''}
                          onChange={e => setEditedData({ ...editedData, timeframe: e.target.value })}
                          className="input-premium"
                          placeholder="1H, 4H, D"
                        />
                      </div>
                    </div>

                    {/* Direction Toggle */}
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Direction</label>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setEditedData({ ...editedData, direction: 'long' })}
                          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                            editedData.direction === 'long'
                              ? 'bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400 shadow-lg shadow-emerald-500/20'
                              : 'bg-white/5 border-2 border-white/10 text-gray-400 hover:border-emerald-500/30'
                          }`}
                        >
                          <TrendingUp className="w-5 h-5" />
                          LONG
                        </button>
                        <button
                          onClick={() => setEditedData({ ...editedData, direction: 'short' })}
                          className={`flex-1 py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-2 ${
                            editedData.direction === 'short'
                              ? 'bg-rose-500/20 border-2 border-rose-500/50 text-rose-400 shadow-lg shadow-rose-500/20'
                              : 'bg-white/5 border-2 border-white/10 text-gray-400 hover:border-rose-500/30'
                          }`}
                        >
                          <TrendingDown className="w-5 h-5" />
                          SHORT
                        </button>
                      </div>
                    </div>

                    {/* Entry Price */}
                    <div>
                      <label className="block text-xs text-gray-500 uppercase tracking-wider mb-2">Entry Price</label>
                      <div className="relative">
                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                          type="number"
                          step="any"
                          value={editedData.entry_price || ''}
                          onChange={e => setEditedData({ ...editedData, entry_price: parseFloat(e.target.value) || null })}
                          className="input-premium pl-12 text-2xl font-bold"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Management Card */}
                <div className="glass-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                      <Target className="w-5 h-5 text-rose-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg">Risk Management</h3>
                  </div>

                  {/* R:R Visual Slider */}
                  <div className="mb-6 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Risk : Reward Ratio</span>
                      <span className="text-2xl font-black text-white">
                        1:{editedData.entry_price && editedData.stop_loss && editedData.targets?.[0]
                          ? Math.abs((editedData.targets[0] - editedData.entry_price) / (editedData.entry_price - editedData.stop_loss)).toFixed(1)
                          : '0'}
                      </span>
                    </div>
                    <div className="h-3 rounded-full bg-gradient-to-r from-rose-500 via-amber-500 to-emerald-500 relative">
                      <div
                        className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white border-4 border-gray-900 shadow-lg"
                        style={{
                          left: `${Math.min(Math.max(
                            editedData.entry_price && editedData.stop_loss && editedData.targets?.[0]
                              ? (Math.abs((editedData.targets[0] - editedData.entry_price) / (editedData.entry_price - editedData.stop_loss)) / 5) * 100
                              : 0
                          , 0), 100)}%`
                        }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-500">
                      <span>1:0</span>
                      <span>1:2.5</span>
                      <span>1:5+</span>
                    </div>
                  </div>

                  {/* Stop Loss & Take Profit */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-rose-400 uppercase tracking-wider mb-2">Stop Loss</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={editedData.stop_loss || ''}
                          onChange={e => setEditedData({ ...editedData, stop_loss: parseFloat(e.target.value) || null })}
                          className="w-full px-4 py-3 rounded-xl bg-rose-500/10 border-2 border-rose-500/30 text-rose-400 font-bold text-xl placeholder-rose-400/30 focus:border-rose-500/50 outline-none transition-all"
                          placeholder="0.00"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-rose-400/50">
                          {editedData.entry_price && editedData.stop_loss
                            ? `-${Math.abs(((editedData.stop_loss - editedData.entry_price) / editedData.entry_price) * 100).toFixed(1)}%`
                            : '0%'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-emerald-400 uppercase tracking-wider mb-2">Take Profit</label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          value={editedData.targets?.[0] || ''}
                          onChange={e => setEditedData({ ...editedData, targets: [parseFloat(e.target.value) || null] })}
                          className="w-full px-4 py-3 rounded-xl bg-emerald-500/10 border-2 border-emerald-500/30 text-emerald-400 font-bold text-xl placeholder-emerald-400/30 focus:border-emerald-500/50 outline-none transition-all"
                          placeholder="0.00"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-emerald-400/50">
                          {editedData.entry_price && editedData.targets?.[0]
                            ? `+${Math.abs(((editedData.targets[0] - editedData.entry_price) / editedData.entry_price) * 100).toFixed(1)}%`
                            : '0%'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Trade Outcome Selection */}
              <div className="glass-card">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                    <Award className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-lg">Trade Outcome</h3>
                    <p className="text-sm text-gray-400">Required to save evaluation</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'win', label: 'Winner', icon: TrendingUp, color: 'emerald', gradient: 'from-emerald-500 to-green-500' },
                    { id: 'loss', label: 'Loser', icon: TrendingDown, color: 'rose', gradient: 'from-rose-500 to-red-500' },
                    { id: 'breakeven', label: 'Breakeven', icon: Activity, color: 'gray', gradient: 'from-gray-500 to-gray-600' }
                  ].map(outcome => (
                    <button
                      key={outcome.id}
                      onClick={() => setEditedData({ ...editedData, outcome: outcome.id })}
                      className={`relative p-6 rounded-2xl border-2 transition-all duration-300 overflow-hidden group ${
                        editedData.outcome === outcome.id
                          ? `bg-${outcome.color}-500/20 border-${outcome.color}-500/50 shadow-lg shadow-${outcome.color}-500/20`
                          : 'bg-white/5 border-white/10 hover:border-white/20'
                      }`}
                    >
                      {editedData.outcome === outcome.id && (
                        <div className={`absolute inset-0 bg-gradient-to-br ${outcome.gradient} opacity-10`} />
                      )}
                      <div className="relative flex flex-col items-center gap-3">
                        <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                          editedData.outcome === outcome.id
                            ? `bg-${outcome.color}-500/30`
                            : 'bg-white/5 group-hover:bg-white/10'
                        }`}>
                          <outcome.icon className={`w-7 h-7 ${
                            editedData.outcome === outcome.id
                              ? `text-${outcome.color}-400`
                              : 'text-gray-400 group-hover:text-gray-300'
                          }`} />
                        </div>
                        <p className={`font-bold text-lg ${
                          editedData.outcome === outcome.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                        }`}>
                          {outcome.label}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Rule Compliance - Clean Visual Summary */}
              {editedData.rule_results?.length > 0 && (
                <div className="glass-card">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                        <ListChecks className="w-5 h-5 text-indigo-400" />
                      </div>
                      <h3 className="font-bold text-white text-lg">Strategy Compliance</h3>
                    </div>
                    {/* Compliance Score Badge */}
                    <div className="relative">
                      <div className={`absolute inset-0 blur-lg opacity-50 ${
                        editedData.compliance_score >= 80 ? 'bg-emerald-500' :
                        editedData.compliance_score >= 50 ? 'bg-amber-500' :
                        'bg-rose-500'
                      }`} />
                      <div className={`relative px-5 py-2 rounded-xl font-black text-xl border-2 ${
                        editedData.compliance_score >= 80 ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' :
                        editedData.compliance_score >= 50 ? 'bg-amber-500/20 border-amber-500/50 text-amber-400' :
                        'bg-rose-500/20 border-rose-500/50 text-rose-400'
                      }`}>
                        {editedData.compliance_score}%
                      </div>
                    </div>
                  </div>

                  {/* Rule Results Grid */}
                  <div className="grid md:grid-cols-2 gap-3">
                    {editedData.rule_results.map((rule, i) => (
                      <button
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
                        className={`flex items-center gap-4 p-4 rounded-xl transition-all border ${
                          rule.passed
                            ? 'bg-emerald-500/10 border-emerald-500/30 hover:border-emerald-500/50'
                            : 'bg-rose-500/10 border-rose-500/30 hover:border-rose-500/50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          rule.passed ? 'bg-emerald-500/30' : 'bg-rose-500/30'
                        }`}>
                          {rule.passed ? (
                            <Check className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <X className="w-5 h-5 text-rose-400" />
                          )}
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <p className="font-semibold text-white truncate">{rule.rule_name}</p>
                          <p className="text-xs text-gray-400 truncate">{rule.reasoning}</p>
                        </div>
                        <span className={`text-xs font-bold px-2 py-1 rounded-lg flex-shrink-0 ${
                          rule.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {rule.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Feedback & Tags Row */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* AI Feedback */}
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 p-6">
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
                  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />

                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-indigo-400" />
                      </div>
                      <h3 className="font-bold text-white">AI Feedback</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed mb-4">{editedData.overall_feedback}</p>
                    {editedData.improvements?.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Suggestions</p>
                        {editedData.improvements.map((imp, i) => (
                          <div key={i} className="flex items-start gap-2 text-sm text-gray-300">
                            <ChevronRight className="w-4 h-4 mt-0.5 text-indigo-400 flex-shrink-0" />
                            <span>{imp}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div className="glass-card">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                      <Tag className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="font-bold text-white">Tags</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {editedData.suggested_tags?.map((tag, i) => (
                      <span key={i} className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-semibold">
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
                className="w-full py-6 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-2xl font-bold text-xl hover:shadow-2xl hover:shadow-emerald-500/30 hover:scale-[1.01] transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none flex items-center justify-center gap-3"
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
        <div className="space-y-6 fade-in">
          {/* Pro Strategies Banner */}
          <div className="relative overflow-hidden rounded-2xl">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />

            <div className="relative p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Pro Trading Strategies</h2>
                    <p className="text-white/70">Install battle-tested strategies used by professional traders</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPresetModal(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl font-semibold text-white transition-all"
                >
                  <Layers className="w-5 h-5" />
                  Browse All
                </button>
              </div>

              {/* Quick preset cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
                {PRESET_STRATEGIES.slice(0, 4).map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => { setSelectedPreset(preset); setShowPresetModal(true); }}
                    className="p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-left transition-all group"
                  >
                    <span className="text-3xl mb-2 block">{preset.icon}</span>
                    <p className="font-semibold text-white text-sm">{preset.name.split('(')[0].trim()}</p>
                    <p className="text-xs text-white/50 mt-1">{preset.rules.length} rules</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Preset Strategy Modal */}
          {showPresetModal && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="glass-card max-w-4xl w-full max-h-[90vh] overflow-hidden">
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-white">Pro Trading Strategies</h3>
                      <p className="text-gray-400 text-sm">Select a strategy to install and use for trade evaluation</p>
                    </div>
                    <button
                      onClick={() => { setShowPresetModal(false); setSelectedPreset(null); }}
                      className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                    >
                      <X className="w-5 h-5 text-gray-400" />
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
                          className="p-5 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-all group border border-white/10 hover:border-white/20"
                        >
                          <div className="flex items-start gap-4">
                            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${preset.color} flex items-center justify-center text-2xl shadow-lg`}>
                              {preset.icon}
                            </div>
                            <div className="flex-1">
                              <h4 className="font-bold text-white">{preset.name}</h4>
                              <p className="text-sm text-gray-400 mt-1 line-clamp-2">{preset.description}</p>
                              <div className="flex items-center gap-3 mt-3">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  preset.difficulty === 'Beginner' ? 'bg-emerald-500/20 text-emerald-400' :
                                  preset.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-400' :
                                  'bg-rose-500/20 text-rose-400'
                                }`}>
                                  {preset.difficulty}
                                </span>
                                <span className="text-xs text-gray-500">{preset.rules.length} rules</span>
                              </div>
                            </div>
                            <ArrowRight className="w-5 h-5 text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={() => setSelectedPreset(null)}
                        className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors"
                      >
                        <ChevronRight className="w-4 h-4 rotate-180" />
                        Back to all strategies
                      </button>

                      <div className={`p-6 rounded-2xl bg-gradient-to-br ${selectedPreset.color} mb-6`}>
                        <div className="flex items-center gap-4 mb-4">
                          <span className="text-5xl">{selectedPreset.icon}</span>
                          <div>
                            <h3 className="text-2xl font-bold text-white">{selectedPreset.name}</h3>
                            <p className="text-white/80">{selectedPreset.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">{selectedPreset.difficulty}</span>
                          <span className="px-3 py-1 bg-white/20 rounded-full text-sm text-white">{selectedPreset.rules.length} Rules</span>
                        </div>
                      </div>

                      <h4 className="font-bold text-white mb-4">Strategy Rules</h4>
                      <div className="space-y-3 mb-6">
                        {selectedPreset.rules.map((rule, i) => (
                          <div key={i} className="flex items-start gap-3 p-4 bg-white/5 rounded-xl border border-white/10">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                              <Check className="w-4 h-4 text-emerald-400" />
                            </div>
                            <div>
                              <p className="font-semibold text-white">{rule.name}</p>
                              <p className="text-sm text-gray-400">{rule.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => handleInstallPreset(selectedPreset)}
                        disabled={loading}
                        className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
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
            <h2 className="text-xl font-bold text-white">My Trading Strategies</h2>
            <button
              onClick={() => setShowStrategyForm(true)}
              className="btn-glow flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Custom Strategy
            </button>
          </div>

          {/* Strategy Form Modal */}
          {showStrategyForm && (
            <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <div className="glass-card max-w-lg w-full max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold text-white mb-6">Create Custom Strategy</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Strategy Name</label>
                    <input
                      type="text"
                      value={strategyName}
                      onChange={e => setStrategyName(e.target.value)}
                      placeholder="e.g., My Breakout Strategy"
                      className="input-premium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
                    <textarea
                      value={strategyDesc}
                      onChange={e => setStrategyDesc(e.target.value)}
                      placeholder="Describe your strategy..."
                      rows={2}
                      className="input-premium"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Rules</label>
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
                          className="input-premium flex-1"
                        />
                        <input
                          type="text"
                          value={rule.description}
                          onChange={e => {
                            const updated = [...newRules];
                            updated[i].description = e.target.value;
                            setNewRules(updated);
                          }}
                          placeholder="Description"
                          className="input-premium flex-1"
                        />
                        {newRules.length > 1 && (
                          <button
                            onClick={() => setNewRules(newRules.filter((_, j) => j !== i))}
                            className="text-rose-400 hover:text-rose-300 p-2"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => setNewRules([...newRules, { name: '', description: '' }])}
                      className="text-sm text-emerald-400 hover:text-emerald-300 font-medium"
                    >
                      + Add Rule
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => { setShowStrategyForm(false); setNewRules([{ name: '', description: '' }]); }}
                    className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateStrategy}
                    className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium"
                  >
                    Create Strategy
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Strategy List */}
          {strategies.length === 0 ? (
            <div className="glass-card text-center py-12">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gray-500/20 rounded-2xl blur-xl" />
                <div className="relative w-full h-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Target className="w-10 h-10 text-gray-500" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Strategies Yet</h3>
              <p className="text-gray-400">Install pro strategies or create your own to start tracking.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {strategies.map(strategy => (
                <div key={strategy.id} className="glass-card">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{PRESET_STRATEGIES.find(p => p.name === strategy.name)?.icon || '📋'}</div>
                      <div>
                        <h3 className="text-lg font-bold text-white">{strategy.name}</h3>
                        {strategy.description && (
                          <p className="text-sm text-gray-400">{strategy.description}</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteStrategy(strategy.id)}
                      className="text-gray-500 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg transition-all"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-400">Rules ({strategy.rules?.length || 0})</p>
                    <div className="grid md:grid-cols-2 gap-2">
                      {strategy.rules?.map(rule => (
                        <div key={rule.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl group">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded bg-emerald-500/20 flex items-center justify-center">
                              <Check className="w-3 h-3 text-emerald-400" />
                            </div>
                            <div>
                              <span className="text-sm font-medium text-white">{rule.rule_name}</span>
                              {rule.rule_description && (
                                <p className="text-xs text-gray-500">{rule.rule_description}</p>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteRule(strategy.id, rule.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-rose-400 transition-all"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6 fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Evaluation History</h2>
            <select
              onChange={e => fetchEvaluations(e.target.value || null)}
              className="input-premium w-auto"
            >
              <option value="">All Strategies</option>
              {strategies.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {evaluations.length === 0 ? (
            <div className="glass-card text-center py-12">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl" />
                <div className="relative w-full h-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Activity className="w-10 h-10 text-indigo-400/50" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Evaluations Yet</h3>
              <p className="text-gray-400">Upload your first trade screenshot to start tracking.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {evaluations.map(evaluation => (
                <div key={evaluation.id} className="glass-card hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                        evaluation.outcome === 'win' ? 'bg-emerald-500/20 border border-emerald-500/30' :
                        evaluation.outcome === 'loss' ? 'bg-rose-500/20 border border-rose-500/30' :
                        'bg-gray-500/20 border border-gray-500/30'
                      }`}>
                        {evaluation.outcome === 'win' ? (
                          <TrendingUp className="w-7 h-7 text-emerald-400" />
                        ) : evaluation.outcome === 'loss' ? (
                          <TrendingDown className="w-7 h-7 text-rose-400" />
                        ) : (
                          <Activity className="w-7 h-7 text-gray-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-lg">
                          {evaluation.ticker} <span className={evaluation.direction === 'long' ? 'text-emerald-400' : 'text-rose-400'}>{evaluation.direction?.toUpperCase()}</span>
                        </h4>
                        <p className="text-sm text-gray-400">
                          {evaluation.strategy_name || 'No Strategy'} • {new Date(evaluation.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {evaluation.compliance_score !== null && (
                        <div className={`px-4 py-2 rounded-xl text-sm font-bold ${
                          evaluation.compliance_score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
                          evaluation.compliance_score >= 50 ? 'bg-amber-500/20 text-amber-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {evaluation.compliance_score}%
                        </div>
                      )}
                      {evaluation.pnl_r && (
                        <span className={`text-xl font-bold ${evaluation.pnl_r >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {evaluation.pnl_r >= 0 ? '+' : ''}{evaluation.pnl_r}R
                        </span>
                      )}
                      <button
                        onClick={() => handleDeleteEvaluation(evaluation.id)}
                        className="text-gray-500 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-lg transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-sm p-4 bg-white/5 rounded-xl">
                    <div>
                      <span className="text-gray-500 block mb-1">Entry</span>
                      <p className="font-semibold text-white">${evaluation.entry_price}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Stop Loss</span>
                      <p className="font-semibold text-rose-400">${evaluation.stop_loss}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">Timeframe</span>
                      <p className="font-semibold text-white">{evaluation.timeframe || '-'}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 block mb-1">P&L</span>
                      <p className={`font-semibold ${evaluation.pnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {evaluation.pnl ? `$${evaluation.pnl}` : '-'}
                      </p>
                    </div>
                  </div>

                  {evaluation.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {evaluation.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-xs">
                          #{tag}
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
        <div className="space-y-6 fade-in">
          <h2 className="text-xl font-bold text-white">Strategy Performance</h2>

          {!performance || performance.strategies?.length === 0 ? (
            <div className="glass-card text-center py-12">
              <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-2xl blur-xl" />
                <div className="relative w-full h-full rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <BarChart3 className="w-10 h-10 text-indigo-400/50" />
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">No Performance Data</h3>
              <p className="text-gray-400">Evaluate some trades to see performance metrics.</p>
            </div>
          ) : (
            <>
              {/* Performance Cards */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {performance.strategies.map(s => (
                  <div key={s.strategy_id || 'none'} className="glass-card">
                    <h4 className="font-bold text-white mb-6">{s.strategy_name || 'No Strategy'}</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Win Rate</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-emerald-500 to-green-500 rounded-full" style={{ width: `${s.win_rate}%` }} />
                          </div>
                          <span className="font-bold text-emerald-400 w-12 text-right">{s.win_rate}%</span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total Trades</span>
                        <span className="font-bold text-white">{s.total_trades}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Avg R</span>
                        <span className={`font-bold ${s.avg_r >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {s.avg_r?.toFixed(2) || '0'}R
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Total R</span>
                        <span className={`font-bold ${s.total_r >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {s.total_r?.toFixed(2) || '0'}R
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Expectancy</span>
                        <span className={`font-bold ${s.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {s.expectancy}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-400">Avg Compliance</span>
                        <span className="font-bold text-white">{s.avg_compliance?.toFixed(0) || '0'}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Rule Break Frequency */}
              {performance.ruleBreakFrequency?.length > 0 && (
                <div className="glass-card">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="font-bold text-white text-lg">Most Broken Rules</h3>
                  </div>
                  <div className="space-y-3">
                    {performance.ruleBreakFrequency.slice(0, 5).map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                        <span className="text-white font-medium">{item.rule}</span>
                        <span className="text-rose-400 font-bold">{item.count} breaks</span>
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
