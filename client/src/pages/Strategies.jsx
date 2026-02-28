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
  ListChecks
} from 'lucide-react';
import { api } from '../utils/api';

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
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">Select Strategy (Optional)</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedStrategy(null)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  !selectedStrategy
                    ? 'bg-emerald-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                }`}
              >
                No Strategy
              </button>
              {strategies.map(s => (
                <button
                  key={s.id}
                  onClick={() => setSelectedStrategy(s)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all ${
                    selectedStrategy?.id === s.id
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                  }`}
                >
                  {s.name}
                </button>
              ))}
            </div>
            {selectedStrategy && selectedStrategy.rules?.length > 0 && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Rules to evaluate:</p>
                <ul className="text-sm space-y-1">
                  {selectedStrategy.rules.map((r, i) => (
                    <li key={r.id} className="text-gray-700 dark:text-gray-300">
                      {i + 1}. {r.rule_name}
                    </li>
                  ))}
                </ul>
              </div>
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

          {/* Edit/Confirm Section */}
          {editMode && editedData && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Edit3 className="w-5 h-5 text-emerald-500" />
                    Confirm Extracted Data
                  </h3>
                  <button
                    onClick={() => { setEditMode(false); setEvalResult(null); setEditedData(null); }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ticker/Pair</label>
                    <input
                      type="text"
                      value={editedData.ticker || ''}
                      onChange={e => setEditedData({ ...editedData, ticker: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Direction</label>
                    <select
                      value={editedData.direction || ''}
                      onChange={e => setEditedData({ ...editedData, direction: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    >
                      <option value="">Select</option>
                      <option value="long">Long</option>
                      <option value="short">Short</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Entry Price</label>
                    <input
                      type="number"
                      step="any"
                      value={editedData.entry_price || ''}
                      onChange={e => setEditedData({ ...editedData, entry_price: parseFloat(e.target.value) || null })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Stop Loss</label>
                    <input
                      type="number"
                      step="any"
                      value={editedData.stop_loss || ''}
                      onChange={e => setEditedData({ ...editedData, stop_loss: parseFloat(e.target.value) || null })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Timeframe</label>
                    <input
                      type="text"
                      value={editedData.timeframe || ''}
                      onChange={e => setEditedData({ ...editedData, timeframe: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trade Date</label>
                    <input
                      type="text"
                      value={editedData.trade_date || ''}
                      onChange={e => setEditedData({ ...editedData, trade_date: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">P&L ($)</label>
                    <input
                      type="number"
                      step="any"
                      value={editedData.pnl || ''}
                      onChange={e => setEditedData({ ...editedData, pnl: parseFloat(e.target.value) || null })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">P&L (R)</label>
                    <input
                      type="number"
                      step="any"
                      value={editedData.pnl_r || ''}
                      onChange={e => setEditedData({ ...editedData, pnl_r: parseFloat(e.target.value) || null })}
                      className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Setup Notes</label>
                  <textarea
                    value={editedData.setup_notes || ''}
                    onChange={e => setEditedData({ ...editedData, setup_notes: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg"
                  />
                </div>

                {/* Trade Outcome */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Trade Outcome *</label>
                  <div className="flex gap-3">
                    {['win', 'loss', 'breakeven'].map(outcome => (
                      <button
                        key={outcome}
                        onClick={() => setEditedData({ ...editedData, outcome })}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                          editedData.outcome === outcome
                            ? outcome === 'win' ? 'bg-green-500 text-white' :
                              outcome === 'loss' ? 'bg-red-500 text-white' :
                              'bg-gray-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {outcome === 'win' && <TrendingUp className="w-4 h-4 inline mr-2" />}
                        {outcome === 'loss' && <TrendingDown className="w-4 h-4 inline mr-2" />}
                        {outcome.charAt(0).toUpperCase() + outcome.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Rule Results */}
              {editedData.rule_results?.length > 0 && (
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <ListChecks className="w-5 h-5 text-emerald-500" />
                    Rule Compliance
                    <span className={`ml-auto px-3 py-1 rounded-full text-sm font-bold ${
                      editedData.compliance_score >= 80 ? 'bg-green-100 text-green-600' :
                      editedData.compliance_score >= 50 ? 'bg-yellow-100 text-yellow-600' :
                      'bg-red-100 text-red-600'
                    }`}>
                      {editedData.compliance_score}%
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {editedData.rule_results.map((rule, i) => (
                      <div key={i} className={`flex items-center justify-between p-4 rounded-xl ${
                        rule.passed ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
                      }`}>
                        <div className="flex items-center gap-3">
                          {rule.passed ? (
                            <CheckCircle className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{rule.rule_name}</p>
                            <p className="text-sm text-gray-500">{rule.reasoning}</p>
                          </div>
                        </div>
                        <button
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
                          className="text-sm text-gray-500 hover:text-gray-700"
                        >
                          Toggle
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Feedback & Tags */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">AI Feedback</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">{editedData.overall_feedback}</p>
                  {editedData.improvements?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Improvements:</p>
                      <ul className="text-sm text-gray-500 space-y-1">
                        {editedData.improvements.map((imp, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            {imp}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="w-5 h-5 text-emerald-500" />
                    Suggested Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {editedData.suggested_tags?.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <button
                onClick={handleSaveEvaluation}
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Evaluation
              </button>
            </div>
          )}
        </div>
      )}

      {/* Strategies Tab */}
      {activeTab === 'strategies' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Trading Strategies</h2>
            <button
              onClick={() => setShowStrategyForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600"
            >
              <Plus className="w-5 h-5" />
              New Strategy
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
