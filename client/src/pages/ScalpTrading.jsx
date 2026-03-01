import { useState, useRef, useEffect } from 'react';
import {
  Zap,
  AlertTriangle,
  Upload,
  Loader2,
  Calculator,
  Brain,
  Target,
  Cpu,
  Activity,
  Percent,
  DollarSign,
  Timer,
  Flame,
  TrendingUp,
  Gauge,
  Radio,
  Shield
} from 'lucide-react';
import { AnalysisResult } from '../components/analysis/AnalysisResult';

// Volatility Indicator Component
const VolatilityIndicator = ({ level = 65 }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-300 ${
              i <= Math.ceil(level / 20)
                ? i <= 2 ? 'bg-emerald-500 h-3' : i <= 4 ? 'bg-amber-500 h-4' : 'bg-rose-500 h-5'
                : 'bg-white/10 h-2'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-amber-400 font-semibold">{level}%</span>
    </div>
  );
};

// Live Pulse Component
const LivePulse = () => (
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
    <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500" />
  </span>
);

// Efficiency Score Gauge
const EfficiencyGauge = ({ score }) => {
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="relative w-24 h-24">
      <svg className="w-full h-full -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="6"
        />
        <circle
          cx="48"
          cy="48"
          r={radius}
          fill="none"
          stroke="url(#gaugeGradient)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          className="transition-all duration-1000"
        />
        <defs>
          <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F97316" />
            <stop offset="100%" stopColor="#FBBF24" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-black text-white">{score}</span>
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">Score</span>
      </div>
    </div>
  );
};

export function ScalpTrading() {
  const [activeTab, setActiveTab] = useState('setup');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [isHovering, setIsHovering] = useState(false);
  const [efficiencyScore, setEfficiencyScore] = useState(0);
  const fileInputRef = useRef(null);

  // Risk parameters
  const [accountBalance, setAccountBalance] = useState('10000');
  const [riskPerTrade, setRiskPerTrade] = useState('0.25');
  const [stopLoss, setStopLoss] = useState('6.00');
  const [takeProfit, setTakeProfit] = useState('7.80');

  // Animate efficiency score on mount
  useEffect(() => {
    const timer = setTimeout(() => setEfficiencyScore(87), 500);
    return () => clearTimeout(timer);
  }, []);

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
      'Scanning price action...',
      'Detecting momentum signals...',
      'Identifying scalp entries...',
      'Calculating optimal exits...'
    ];

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      setLoadingStep(steps[stepIndex % steps.length]);
      stepIndex++;
    }, 1500);

    setLoadingStep(steps[0]);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('chart', imageFile);
      formData.append('timeframe', '1m');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
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
    return (tp / sl).toFixed(2);
  };

  const riskAmount = ((parseFloat(accountBalance) || 0) * (parseFloat(riskPerTrade) || 0) / 100).toFixed(2);

  return (
    <div className="min-h-screen px-6 py-6 fade-in">
      <div className="max-w-7xl mx-auto">

        {/* HEADER SECTION */}
        <div className="relative mb-8">
          {/* Electric Glow Effect */}
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/20 via-amber-500/20 to-yellow-500/20 rounded-3xl blur-2xl opacity-60 animate-pulse" />

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl blur-lg opacity-60 animate-pulse" />
                <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-2xl">
                  <Zap className="w-8 h-8 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-black text-white tracking-tight">Scalp Trading</h1>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/40 flex items-center gap-1.5 animate-pulse">
                    <LivePulse />
                    1-Min Active
                  </span>
                </div>
                <p className="text-gray-400 text-sm flex items-center gap-2">
                  Rapid AI pattern detection for quick scalp entries
                  <VolatilityIndicator level={72} />
                </p>
              </div>
            </div>

            {/* Speed Indicator */}
            <div className="hidden lg:flex items-center gap-4 px-5 py-3 rounded-2xl bg-white/5 border border-white/10">
              <Timer className="w-5 h-5 text-orange-400" />
              <div>
                <p className="text-xs text-gray-500">Avg. Analysis Time</p>
                <p className="text-lg font-bold text-orange-400">&lt;5 sec</p>
              </div>
            </div>
          </div>
        </div>

        {/* DISCLAIMER BAR */}
        <div className="mb-6 relative">
          <div className="glass-card p-3 border-amber-500/20 bg-amber-500/5 flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-300/70 flex-1">
              <span className="font-semibold text-amber-400">High-Risk Trading:</span> Scalping involves rapid decisions and significant risk. For educational purposes only.
            </p>
            <Shield className="w-4 h-4 text-amber-500/30" />
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex flex-col lg:flex-row gap-6">

          {/* LEFT COLUMN - Upload Section */}
          <div className="flex-1">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500 rounded-xl blur-md opacity-30 animate-pulse" />
                    <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                      <Zap className="w-5 h-5 text-orange-400" />
                    </div>
                  </div>
                  <div>
                    <h2 className="font-bold text-white">Instant AI Scanner</h2>
                    <p className="text-xs text-gray-500">Lightning-fast pattern recognition</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-orange-500 animate-pulse" />
                  <span className="text-xs font-semibold text-orange-400">LIVE</span>
                </div>
              </div>

              {/* Upload Area */}
              {!imagePreview ? (
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsHovering(true); }}
                  onDragLeave={() => setIsHovering(false)}
                  onClick={() => fileInputRef.current?.click()}
                  className={`relative rounded-2xl p-10 text-center cursor-pointer transition-all duration-200 overflow-hidden group ${
                    isHovering ? 'scale-[1.02]' : ''
                  }`}
                  style={{
                    border: '2px dashed',
                    borderColor: isHovering ? '#F97316' : 'rgba(255,255,255,0.1)',
                    background: isHovering ? 'rgba(249, 115, 22, 0.1)' : 'transparent'
                  }}
                >
                  {/* Animated Pulse Border */}
                  <div className="absolute inset-0 rounded-2xl border-2 border-orange-500/30 animate-pulse opacity-50" />

                  <div className="relative">
                    <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center mb-6 transition-all duration-200 ${
                      isHovering ? 'scale-110 shadow-lg shadow-orange-500/40' : 'group-hover:scale-105'
                    }`}>
                      <div className="relative">
                        <Zap className={`w-10 h-10 transition-colors ${isHovering ? 'text-orange-400' : 'text-orange-500/70'}`} />
                        {isHovering && (
                          <div className="absolute inset-0 bg-orange-500 blur-xl opacity-50" />
                        )}
                      </div>
                    </div>
                    <p className="text-xl font-bold text-white mb-2">Drop Chart Here</p>
                    <p className="text-gray-500 text-sm mb-4">
                      Drag & drop or click to select
                    </p>
                    <p className="text-xs text-orange-400 font-semibold mb-6 flex items-center justify-center gap-2">
                      <Zap className="w-3 h-3" />
                      Instant AI pattern detection in under 5 seconds
                    </p>
                    <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105">
                      <span className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Quick Upload
                      </span>
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
                          <div className="w-20 h-20 rounded-full border-4 border-orange-500/20" />
                          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-transparent border-t-orange-500 animate-spin" style={{ animationDuration: '0.6s' }} />
                          <Zap className="absolute inset-0 m-auto w-8 h-8 text-orange-400" />
                        </div>
                        <p className="text-white font-bold text-lg mb-2">Scanning Chart</p>
                        <p className="text-orange-400 text-sm font-medium">{loadingStep}</p>
                        <div className="flex items-center gap-2 mt-4">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <div
                                key={i}
                                className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"
                                style={{ animationDelay: `${i * 0.1}s` }}
                              />
                            ))}
                          </div>
                          <p className="text-gray-500 text-xs">Processing at high speed</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 disabled:opacity-50 text-white font-bold rounded-2xl transition-all duration-200 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-[1.02] flex items-center justify-center gap-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5" />
                        Instant Scan
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
                className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'setup'
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Scalp Engine
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-3 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  activeTab === 'history'
                    ? 'bg-gradient-to-r from-orange-500/20 to-amber-500/20 text-orange-400 border border-orange-500/30'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                History
              </button>
            </div>

            {activeTab === 'setup' ? (
              <div className="glass-card p-5 space-y-4">
                {/* Header with Efficiency Score */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center">
                      <Gauge className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white">Scalp Engine</h3>
                      <p className="text-xs text-gray-500">Precision position sizing</p>
                    </div>
                  </div>
                  <EfficiencyGauge score={efficiencyScore} />
                </div>

                {/* Risk Slider with Glow */}
                <div className="p-4 rounded-xl bg-white/5 border border-orange-500/20 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-transparent" />
                  <div className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-400">Risk Per Scalp</span>
                      <span className="text-lg font-bold text-orange-400">{riskPerTrade}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1"
                      step="0.05"
                      value={riskPerTrade}
                      onChange={(e) => setRiskPerTrade(e.target.value)}
                      className="w-full h-2 bg-white/10 rounded-full appearance-none cursor-pointer range-slider-orange"
                      style={{
                        background: `linear-gradient(to right, #F97316 0%, #F97316 ${(parseFloat(riskPerTrade) / 1) * 100}%, rgba(255,255,255,0.1) ${(parseFloat(riskPerTrade) / 1) * 100}%, rgba(255,255,255,0.1) 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-600 mt-1">
                      <span>0.1%</span>
                      <span className="text-orange-400">Recommended: 0.25%</span>
                      <span>1%</span>
                    </div>
                  </div>
                </div>

                {/* Compact Input Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Balance ($)</label>
                    <input
                      type="number"
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(e.target.value)}
                      className="input-premium text-sm py-2"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 mb-1.5 block">Stop Loss</label>
                    <input
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="input-premium text-sm py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-500 mb-1.5 block">Take Profit (auto: 1.3x SL)</label>
                  <input
                    type="number"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="input-premium text-sm py-2"
                  />
                </div>

                {/* Animated R:R Gauge */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Risk : Reward</span>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-black text-orange-400">1:{calculateRR()}</span>
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden">
                    <div className="bg-rose-500 rounded-l-full animate-pulse" style={{ flex: 1 }} />
                    <div className="bg-emerald-500 rounded-r-full" style={{ flex: parseFloat(calculateRR()) }} />
                  </div>
                </div>

                {/* Position Size Output */}
                <div className="relative p-5 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-amber-500/20" />
                  <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/20 rounded-full blur-3xl" />
                  </div>
                  <div className="relative">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-orange-300/70">Position Size</span>
                      <span className="text-xs text-orange-400/50 flex items-center gap-1">
                        <Cpu className="w-3 h-3" />
                        AI Optimized
                      </span>
                    </div>
                    <p className="text-5xl font-black text-white tracking-tight">
                      {calculatePositionSize()}
                    </p>
                    <p className="text-sm text-orange-400 mt-1">contracts @ ${riskAmount} risk</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-card p-6">
                <div className="text-center py-8">
                  <Activity className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">No scalp history yet</p>
                </div>
              </div>
            )}

            {/* Scalp Execution Rules */}
            <div className="glass-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-orange-400" />
                <h4 className="font-bold text-white">Scalp Execution Rules</h4>
              </div>

              <div className="space-y-3">
                {[
                  { icon: Zap, text: 'Enter within 2 seconds of signal', color: 'orange' },
                  { icon: Target, text: 'Hard stop loss - no exceptions', color: 'rose' },
                  { icon: Timer, text: 'Max hold time: 5 minutes', color: 'amber' },
                  { icon: Flame, text: 'Only trade high volume periods', color: 'emerald' }
                ].map((rule, i) => (
                  <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                    <rule.icon className={`w-4 h-4 text-${rule.color}-400`} />
                    <span className="text-sm text-gray-300">{rule.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="mt-8">
            <AnalysisResult analysis={analysis} />
          </div>
        )}
      </div>

    </div>
  );
}
