import { useState, useRef } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Upload,
  Loader2,
  Calculator,
  Brain,
  Shield,
  Target,
  Cpu,
  ChevronRight,
  Activity,
  Percent,
  DollarSign,
  BarChart3
} from 'lucide-react';
import { AnalysisResult } from '../components/analysis/AnalysisResult';
import { TradingViewAdvancedChart } from '../components/TradingViewChart';

// Mini Equity Chart Component
const MiniEquityChart = () => {
  const points = [40, 45, 42, 50, 48, 55, 60, 58, 65, 70, 68, 75];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const pathData = points.map((point, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - ((point - min) / range) * 80;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="swingGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${pathData} L 100 100 L 0 100 Z`} fill="url(#swingGradient)" />
      <path d={pathData} fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

export function SwingTrading() {
  const [activeTab, setActiveTab] = useState('setup');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef(null);

  // Risk parameters
  const [accountBalance, setAccountBalance] = useState('10000');
  const [riskPerTrade, setRiskPerTrade] = useState('1.00');
  const [stopLoss, setStopLoss] = useState('50.00');
  const [takeProfit, setTakeProfit] = useState('100.00');

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovering(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    const steps = [
      'Analyzing market structure...',
      'Identifying key support & resistance...',
      'Detecting chart patterns...',
      'Calculating optimal entry zones...'
    ];

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      setLoadingStep(steps[stepIndex % steps.length]);
      stepIndex++;
    }, 2000);

    setLoadingStep(steps[0]);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('chart', imageFile);
      formData.append('timeframe', '4H');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (text.includes('timeout') || text.includes('Timeout')) {
          throw new Error('Request timed out. Try a smaller image.');
        }
        throw new Error('Server error. Please try again.');
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep('');
    }
  };

  const calculatePositionSize = () => {
    const balance = parseFloat(accountBalance) || 0;
    const risk = parseFloat(riskPerTrade) || 0;
    const sl = parseFloat(stopLoss) || 1;
    return ((balance * (risk / 100)) / sl).toFixed(2);
  };

  const calculateRR = () => {
    const sl = parseFloat(stopLoss) || 1;
    const tp = parseFloat(takeProfit) || 0;
    return (tp / sl).toFixed(1);
  };

  const riskAmount = ((parseFloat(accountBalance) || 0) * (parseFloat(riskPerTrade) || 0) / 100).toFixed(2);

  return (
    <div className="min-h-screen px-6 py-6 fade-in">
      <div className="max-w-7xl mx-auto">

        {/* HEADER SECTION */}
        <div className="relative mb-8">
          {/* Animated Gradient Glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-cyan-500/20 rounded-3xl blur-2xl opacity-50" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl blur-lg opacity-50" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-2xl">
                  <TrendingUp className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black text-white tracking-tight">Swing Trading</h1>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    4H/Daily Active
                  </span>
                </div>
                <p className="text-gray-400 text-sm">
                  AI-powered analysis for multi-day to multi-week positions
                </p>
              </div>
            </div>

            {/* Mini Equity Preview */}
            <div className="hidden lg:block w-48 h-16">
              <MiniEquityChart />
            </div>
          </div>
        </div>

        {/* DISCLAIMER BAR */}
        <div className="mb-6 relative">
          <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur-xl" />
          <div className="relative glass-card p-4 border-amber-500/30 bg-amber-500/5">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-amber-500 rounded-xl blur-md opacity-30" />
                <div className="relative w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
              </div>
              <div className="flex-1">
                <p className="font-semibold text-amber-400 text-sm">Educational Purposes Only</p>
                <p className="text-xs text-amber-300/70">
                  All analysis is for informational purposes. Trading involves significant risk. Past performance does not guarantee future results.
                </p>
              </div>
              <Shield className="w-5 h-5 text-amber-500/50" />
            </div>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT COLUMN - Upload Section */}
          <div className="flex-1">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                    <Brain className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="font-bold text-white">AI Chart Analysis</h2>
                    <p className="text-xs text-gray-500">Powered by advanced pattern recognition</p>
                  </div>
                </div>
                <span className="badge-info flex items-center gap-1.5">
                  <Cpu className="w-3 h-3" />
                  AI Ready
                </span>
              </div>

              {/* Upload Area */}
              {!imagePreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                  onDragLeave={() => setIsHovering(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 overflow-hidden group ${
                    isHovering
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-white/10 hover:border-emerald-500/50'
                  }`}
                  style={{
                    border: '2px dashed',
                    borderColor: isHovering ? '#10B981' : 'rgba(255,255,255,0.1)'
                  }}
                >
                  {/* Animated Border */}
                  <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="absolute inset-0" style={{
                      background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.1), transparent)',
                      animation: 'shimmer 2s infinite'
                    }} />
                  </div>

                  <div className="relative">
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6 transition-all duration-300 ${
                      isHovering ? 'scale-110 shadow-lg shadow-emerald-500/30' : 'group-hover:scale-105'
                    }`}>
                      <Upload className={`w-10 h-10 transition-colors ${isHovering ? 'text-emerald-400' : 'text-emerald-500/70'}`} />
                    </div>
                    <p className="text-xl font-bold text-white mb-2">Upload Chart Image</p>
                    <p className="text-gray-500 text-sm mb-6">
                      Drag & drop or click to browse
                    </p>
                    <p className="text-xs text-emerald-400/70 mb-6">
                      AI will analyze structure, trend, and key levels
                    </p>
                    <button className="btn-glow inline-flex items-center gap-2 text-white">
                      <Upload className="w-4 h-4" />
                      Select Image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative rounded-2xl overflow-hidden bg-gray-900/50 border border-white/10">
                    <img
                      src={imagePreview}
                      alt="Chart preview"
                      className="w-full max-h-96 object-contain"
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview(null);
                        setAnalysis(null);
                      }}
                      className="absolute top-4 right-4 px-4 py-2 bg-rose-500/80 hover:bg-rose-500 text-white text-sm font-medium rounded-xl transition-all backdrop-blur-sm"
                    >
                      Remove
                    </button>

                    {loading && (
                      <div className="absolute inset-0 bg-gray-900/90 backdrop-blur-sm flex flex-col items-center justify-center">
                        <div className="relative mb-6">
                          <div className="w-20 h-20 rounded-full border-4 border-emerald-500/20" />
                          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-emerald-500 animate-spin" />
                          <Brain className="absolute inset-0 m-auto w-8 h-8 text-emerald-400" />
                        </div>
                        <p className="text-white font-bold text-lg mb-2">AI Analyzing Chart</p>
                        <p className="text-emerald-400 text-sm">{loadingStep}</p>
                        <div className="flex items-center gap-2 mt-4">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <p className="text-gray-500 text-xs">This may take 15-30 seconds</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Brain className="w-5 h-5" />
                        Analyze with AI
                      </>
                    )}
                  </button>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/jpg,image/webp"
                onChange={handleImageSelect}
                className="hidden"
              />

              {error && (
                <div className="mt-4 p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                  <p className="text-rose-400 font-medium text-sm">{error}</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN - Calculator */}
          <div className="w-full lg:w-96 space-y-4">
            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 border border-white/10">
              <button
                onClick={() => setActiveTab('setup')}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  activeTab === 'setup'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Risk Engine
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-300 ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                History
              </button>
            </div>

            {activeTab === 'setup' ? (
              <div className="glass-card p-5 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Risk Engine</h3>
                      <p className="text-xs text-gray-500">Professional position sizing</p>
                    </div>
                  </div>
                </div>

                {/* Risk Slider */}
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Risk Per Trade</span>
                    <span className="text-lg font-bold text-emerald-400">{riskPerTrade}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.25"
                    max="3"
                    step="0.25"
                    value={riskPerTrade}
                    onChange={(e) => setRiskPerTrade(e.target.value)}
                    className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    style={{
                      background: `linear-gradient(to right, #10B981 0%, #10B981 ${(parseFloat(riskPerTrade) / 3) * 100}%, rgba(255,255,255,0.1) ${(parseFloat(riskPerTrade) / 3) * 100}%, rgba(255,255,255,0.1) 100%)`
                    }}
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>0.25%</span>
                    <span>3%</span>
                  </div>
                </div>

                {/* Input Fields */}
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                      <DollarSign className="w-4 h-4" />
                      Account Balance
                    </label>
                    <input
                      type="number"
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(e.target.value)}
                      className="input-premium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Stop Loss (pts)</label>
                      <input
                        type="number"
                        value={stopLoss}
                        onChange={(e) => setStopLoss(e.target.value)}
                        className="input-premium"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400 mb-2 block">Take Profit (pts)</label>
                      <input
                        type="number"
                        value={takeProfit}
                        onChange={(e) => setTakeProfit(e.target.value)}
                        className="input-premium"
                      />
                    </div>
                  </div>
                </div>

                {/* R:R Visual */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-gray-400">Risk : Reward</span>
                    <span className="text-2xl font-black text-indigo-400">1:{calculateRR()}</span>
                  </div>
                  <div className="flex gap-1 h-3">
                    <div className="flex-1 bg-rose-500 rounded-l-full" style={{ flex: 1 }} />
                    <div className="bg-emerald-500 rounded-r-full" style={{ flex: parseFloat(calculateRR()) }} />
                  </div>
                  <div className="flex justify-between text-xs mt-2">
                    <span className="text-rose-400">Risk: ${riskAmount}</span>
                    <span className="text-emerald-400">Reward: ${(parseFloat(riskAmount) * parseFloat(calculateRR())).toFixed(2)}</span>
                  </div>
                </div>

                {/* Position Size Output */}
                <div className="relative p-5 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20" />
                  <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(16,185,129,0.3),_transparent_70%)]" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-emerald-300/70">Calculated Position Size</span>
                      <span className="text-xs text-emerald-400/50 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        AI Optimized
                      </span>
                    </div>
                    <p className="text-4xl font-black text-white tracking-tight">
                      {calculatePositionSize()}
                      <span className="text-lg font-medium text-emerald-400 ml-2">contracts</span>
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6">
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No analysis history yet</p>
                </div>
              </div>
            )}

            {/* AI Strategy Guide */}
            <div className="relative rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.1),_transparent_60%)]" />

              <div className="relative p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-white" />
                    <h4 className="font-bold text-white">AI Swing Strategy</h4>
                  </div>
                  <span className="px-2 py-1 rounded-full text-xs font-semibold bg-white/20 text-white">
                    78% Confidence
                  </span>
                </div>

                <div className="space-y-4">
                  {[
                    { step: 1, title: 'Define Risk Parameters', desc: 'Set your position size limits' },
                    { step: 2, title: 'Upload Chart', desc: 'Clear 4H or Daily timeframe' },
                    { step: 3, title: 'AI Analysis', desc: 'Pattern & level detection' },
                    { step: 4, title: 'Execute Trade', desc: 'Follow the AI recommendations' }
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-3">
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/30 rounded-full blur-md" />
                        <div className="relative w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white border border-white/30">
                          {item.step}
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold text-white text-sm">{item.title}</p>
                        <p className="text-xs text-emerald-100/70">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* TradingView Chart */}
        <div className="mt-8 glass-card p-0 overflow-hidden">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              Live Chart - Swing Analysis
            </h3>
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              Daily
            </span>
          </div>
          <TradingViewAdvancedChart
            symbol="NASDAQ:SPY"
            theme="dark"
            height={450}
          />
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="mt-8">
            <AnalysisResult analysis={analysis} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: linear-gradient(135deg, #10B981, #059669);
          border-radius: 50%;
          cursor: pointer;
          box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
        }
      `}</style>
    </div>
  );
}
