import {
  TrendingUp,
  TrendingDown,
  Minus,
  Target,
  Shield,
  Award,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Zap,
  BarChart3
} from 'lucide-react';

export function AnalysisResult({ analysis }) {
  const getBiasGradient = () => {
    switch (analysis.bias) {
      case 'Bullish': return 'from-emerald-500 via-green-500 to-teal-500';
      case 'Bearish': return 'from-red-500 via-rose-500 to-pink-500';
      default: return 'from-slate-500 via-gray-500 to-zinc-500';
    }
  };

  const getBiasIcon = () => {
    switch (analysis.bias) {
      case 'Bullish': return TrendingUp;
      case 'Bearish': return TrendingDown;
      default: return Minus;
    }
  };

  const BiasIcon = getBiasIcon();

  const getStrengthWidth = () => {
    switch (analysis.trendStrength) {
      case 'Strong': return '100%';
      case 'Moderate': return '66%';
      default: return '33%';
    }
  };

  const getStrengthColor = () => {
    switch (analysis.trendStrength) {
      case 'Strong': return 'from-emerald-500 to-green-500';
      case 'Moderate': return 'from-amber-500 to-yellow-500';
      default: return 'from-red-500 to-orange-500';
    }
  };

  const getRRColor = () => {
    const rr = parseFloat(analysis.riskRewardRatio);
    if (rr >= 2) return { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-600 dark:text-emerald-400', label: 'Excellent' };
    if (rr >= 1.5) return { bg: 'bg-amber-100 dark:bg-amber-900/30', text: 'text-amber-600 dark:text-amber-400', label: 'Good' };
    return { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-600 dark:text-red-400', label: 'Poor' };
  };

  const rrStyle = getRRColor();

  // Calculate price level positions for visual chart
  const getPriceLevelPositions = () => {
    const entry = analysis.entry || 0;
    const sl = analysis.stopLoss || 0;
    const tp = analysis.takeProfit || 0;

    if (!entry || !sl || !tp) return null;

    const prices = [sl, entry, tp];
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const range = max - min;

    if (range === 0) return null;

    const getPosition = (price) => ((price - min) / range) * 100;

    return {
      entry: getPosition(entry),
      sl: getPosition(sl),
      tp: getPosition(tp),
      isBullish: tp > entry
    };
  };

  const positions = getPriceLevelPositions();

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Main Bias Card */}
      <div className={`relative overflow-hidden rounded-2xl md:rounded-3xl bg-gradient-to-r ${getBiasGradient()} p-4 md:p-6 shadow-2xl`}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 md:w-48 h-32 md:h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-white/70 text-xs md:text-sm font-medium mb-1 md:mb-2">Market Bias</p>
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <BiasIcon className="w-6 h-6 md:w-8 md:h-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl md:text-4xl font-bold text-white tracking-tight">{analysis.bias}</h2>
                <p className="text-white/70 font-medium text-sm md:text-base">{analysis.trendStrength} Trend</p>
              </div>
            </div>
          </div>

          <div className="relative w-20 h-20 md:w-28 md:h-28">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="rgba(255,255,255,0.2)"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="white"
                strokeWidth="8"
                fill="none"
                strokeDasharray={`${analysis.confidence * 2.64} 264`}
                strokeLinecap="round"
                className="drop-shadow-lg"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xl md:text-3xl font-bold text-white">{analysis.confidence}%</span>
              <span className="text-[10px] md:text-xs text-white/70 font-medium">Confidence</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pattern Analysis & Risk Management Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Pattern Analysis Section */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6 shadow-xl shadow-gray-200/20 dark:shadow-none">
          <div className="flex items-center gap-2 mb-4 md:mb-5">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <BarChart3 className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">Pattern Analysis</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">AI detected setup</p>
            </div>
          </div>

          {/* Large Entry Price Display */}
          <div className="mb-6 p-4 md:p-5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Entry Price</span>
              <div className="flex items-center gap-1.5">
                <Target className="w-4 h-4 text-blue-500" />
              </div>
            </div>
            <p className="text-3xl md:text-4xl font-bold text-blue-600 dark:text-blue-400">
              ${analysis.entry?.toFixed(4) || '—'}
            </p>
          </div>

          {/* Detected Patterns */}
          {analysis.patterns && analysis.patterns.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">Detected Patterns</p>
              {analysis.patterns.map((pattern, index) => {
                const isBullish = pattern.toLowerCase().includes('bull') || pattern.toLowerCase().includes('bottom') || pattern.toLowerCase().includes('higher') || pattern.toLowerCase().includes('uptrend');
                const isBearish = pattern.toLowerCase().includes('bear') || pattern.toLowerCase().includes('top') || pattern.toLowerCase().includes('lower') || pattern.toLowerCase().includes('downtrend') || pattern.toLowerCase().includes('descending');

                return (
                  <div
                    key={index}
                    className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl transition-all ${
                      isBullish ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200/50 dark:border-emerald-800/50' :
                      isBearish ? 'bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/50 dark:border-red-800/50' :
                      'bg-gradient-to-r from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-200/50 dark:border-gray-700/50'
                    }`}
                  >
                    <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isBullish ? 'bg-emerald-100 dark:bg-emerald-900/50' :
                      isBearish ? 'bg-red-100 dark:bg-red-900/50' :
                      'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {isBullish ? (
                        <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5 text-emerald-600 dark:text-emerald-400" />
                      ) : isBearish ? (
                        <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5 text-red-600 dark:text-red-400" />
                      ) : (
                        <Activity className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-400" />
                      )}
                    </div>
                    <span className={`font-semibold text-sm md:text-base ${
                      isBullish ? 'text-emerald-700 dark:text-emerald-400' :
                      isBearish ? 'text-red-700 dark:text-red-400' :
                      'text-gray-700 dark:text-gray-300'
                    }`}>{pattern}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 md:py-8 text-gray-400">
              <Layers className="w-10 h-10 md:w-12 md:h-12 mb-3 opacity-50" />
              <p className="text-sm">No specific patterns detected</p>
            </div>
          )}
        </div>

        {/* Risk Management Section */}
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6 shadow-xl shadow-gray-200/20 dark:shadow-none">
          <div className="flex items-center gap-2 mb-4 md:mb-5">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
              <Shield className="w-4 h-4 md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-base md:text-lg">Risk Management</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Price levels & R:R</p>
            </div>
          </div>

          {/* Visual Price Level Chart */}
          {positions && (
            <div className="mb-6 p-4 md:p-5 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-stretch gap-4">
                {/* Vertical price chart */}
                <div className="relative w-3 flex-shrink-0" style={{ height: '180px' }}>
                  {/* Background bar */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-b from-emerald-200 via-blue-200 to-red-200 dark:from-emerald-900/50 dark:via-blue-900/50 dark:to-red-900/50" />

                  {/* TP marker */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white dark:border-gray-800 shadow-lg z-10"
                    style={{ bottom: `${positions.tp}%`, transform: 'translate(-50%, 50%)' }}
                  />

                  {/* Entry marker */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-800 shadow-lg z-10"
                    style={{ bottom: `${positions.entry}%`, transform: 'translate(-50%, 50%)' }}
                  />

                  {/* SL marker */}
                  <div
                    className="absolute left-1/2 -translate-x-1/2 w-5 h-5 rounded-full bg-red-500 border-2 border-white dark:border-gray-800 shadow-lg z-10"
                    style={{ bottom: `${positions.sl}%`, transform: 'translate(-50%, 50%)' }}
                  />
                </div>

                {/* Price labels */}
                <div className="flex-1 flex flex-col justify-between py-1">
                  {/* Take Profit */}
                  <div className={`p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800/50 ${positions.tp === 100 ? '' : 'order-2'}`}
                       style={{ order: positions.tp === 100 ? 1 : positions.tp === 0 ? 3 : 2 }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Take Profit</span>
                      </div>
                      <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                        ${analysis.takeProfit?.toFixed(4) || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Entry */}
                  <div className="p-3 rounded-xl bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800/50"
                       style={{ order: 2 }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Entry</span>
                      </div>
                      <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                        ${analysis.entry?.toFixed(4) || '—'}
                      </span>
                    </div>
                  </div>

                  {/* Stop Loss */}
                  <div className={`p-3 rounded-xl bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800/50`}
                       style={{ order: positions.sl === 0 ? 3 : positions.sl === 100 ? 1 : 2 }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-600 dark:text-red-400" />
                        <span className="text-xs font-medium text-red-600 dark:text-red-400">Stop Loss</span>
                      </div>
                      <span className="text-lg font-bold text-red-600 dark:text-red-400">
                        ${analysis.stopLoss?.toFixed(4) || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* If no positions, show simple cards */}
          {!positions && (
            <div className="grid grid-cols-1 gap-3 mb-6">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/50 dark:border-emerald-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium text-emerald-700 dark:text-emerald-400">Take Profit</span>
                  </div>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                    ${analysis.takeProfit?.toFixed(4) || '—'}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200/50 dark:border-blue-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium text-blue-700 dark:text-blue-400">Entry</span>
                  </div>
                  <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                    ${analysis.entry?.toFixed(4) || '—'}
                  </span>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200/50 dark:border-red-800/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
                    <span className="font-medium text-red-700 dark:text-red-400">Stop Loss</span>
                  </div>
                  <span className="text-xl font-bold text-red-600 dark:text-red-400">
                    ${analysis.stopLoss?.toFixed(4) || '—'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Risk/Reward Ratio */}
          <div className="p-4 md:p-5 rounded-xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-200/50 dark:border-violet-800/30">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                <span className="font-semibold text-violet-700 dark:text-violet-400">Risk : Reward</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${rrStyle.bg} ${rrStyle.text}`}>
                {rrStyle.label}
              </span>
            </div>
            <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
              1 : {analysis.riskRewardRatio}
            </p>
          </div>
        </div>
      </div>

      {/* Support & Resistance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6 shadow-xl shadow-gray-200/20 dark:shadow-none">
          <div className="flex items-center gap-2 mb-4 md:mb-5">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg shadow-red-500/25">
              <TrendingUp className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">Resistance Levels</h3>
          </div>

          {analysis.resistance && analysis.resistance.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {analysis.resistance.map((level, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/50 dark:border-red-800/50"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center text-xs md:text-sm font-bold text-red-600 dark:text-red-400">
                      R{index + 1}
                    </span>
                    <div className="w-16 md:w-24 h-1.5 bg-red-200 dark:bg-red-800/50 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-gradient-to-r from-red-500 to-rose-500 rounded-full" style={{ width: `${100 - index * 20}%` }} />
                    </div>
                  </div>
                  <span className="text-base md:text-lg font-bold text-red-600 dark:text-red-400">${level}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 md:py-8 text-gray-400">
              <TrendingUp className="w-10 h-10 md:w-12 md:h-12 mb-3 opacity-50" />
              <p className="text-sm">No resistance levels identified</p>
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6 shadow-xl shadow-gray-200/20 dark:shadow-none">
          <div className="flex items-center gap-2 mb-4 md:mb-5">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <TrendingDown className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">Support Levels</h3>
          </div>

          {analysis.support && analysis.support.length > 0 ? (
            <div className="space-y-2 md:space-y-3">
              {analysis.support.map((level, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/50"
                >
                  <div className="flex items-center gap-2 md:gap-3">
                    <span className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      S{index + 1}
                    </span>
                    <div className="w-16 md:w-24 h-1.5 bg-emerald-200 dark:bg-emerald-800/50 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" style={{ width: `${100 - index * 20}%` }} />
                    </div>
                  </div>
                  <span className="text-base md:text-lg font-bold text-emerald-600 dark:text-emerald-400">${level}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 md:py-8 text-gray-400">
              <TrendingDown className="w-10 h-10 md:w-12 md:h-12 mb-3 opacity-50" />
              <p className="text-sm">No support levels identified</p>
            </div>
          )}
        </div>
      </div>

      {/* Trend Strength & Confidence */}
      <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6 shadow-xl shadow-gray-200/20 dark:shadow-none">
        <div className="flex items-center gap-2 mb-4 md:mb-5">
          <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">Signal Strength</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex justify-between text-xs md:text-sm mb-2">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Trend Strength</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analysis.trendStrength}</span>
            </div>
            <div className="h-3 md:h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${getStrengthColor()} rounded-full transition-all duration-700 ease-out`}
                style={{ width: getStrengthWidth() }}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs md:text-sm mb-2">
              <span className="text-gray-500 dark:text-gray-400 font-medium">Confidence Score</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analysis.confidence}%</span>
            </div>
            <div className="h-3 md:h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  analysis.confidence >= 70 ? 'bg-gradient-to-r from-emerald-500 to-green-500' :
                  analysis.confidence >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-500' :
                  'bg-gradient-to-r from-red-500 to-orange-500'
                }`}
                style={{ width: `${analysis.confidence}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* AI Reasoning */}
      {analysis.reasoning && (
        <div className="relative overflow-hidden bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6 shadow-xl shadow-gray-200/20 dark:shadow-none">
          <div className="absolute top-0 right-0 w-48 md:w-64 h-48 md:h-64 bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">AI Analysis</h3>
            </div>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm md:text-base">
              {analysis.reasoning}
            </p>

            {analysis.source && (
              <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-700">
                <p className="text-xs md:text-sm text-gray-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Analysis source: {analysis.source === 'vision' ? 'AI Vision' : analysis.source === 'ohlc_ai_enhanced' ? 'Indicators + AI' : 'Technical Indicators'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Indicators (if from OHLC data) */}
      {analysis.indicators && (
        <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6 shadow-xl shadow-gray-200/20 dark:shadow-none">
          <div className="flex items-center gap-2 mb-4 md:mb-5">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Activity className="w-3.5 h-3.5 md:w-4 md:h-4 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">Technical Indicators</h3>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-4">
            <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">RSI (14)</p>
              <p className={`text-lg md:text-2xl font-bold ${
                analysis.indicators.rsi > 70 ? 'text-red-500' :
                analysis.indicators.rsi < 30 ? 'text-emerald-500' : 'text-gray-900 dark:text-white'
              }`}>
                {analysis.indicators.rsi}
              </p>
            </div>
            <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">MACD</p>
              <p className={`text-lg md:text-2xl font-bold ${
                analysis.indicators.macd > 0 ? 'text-emerald-500' : 'text-red-500'
              }`}>
                {analysis.indicators.macd}
              </p>
            </div>
            <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">EMA 20</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                {analysis.indicators.ema20}
              </p>
            </div>
            <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">EMA 50</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                {analysis.indicators.ema50}
              </p>
            </div>
            <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">EMA 200</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                {analysis.indicators.ema200}
              </p>
            </div>
            <div className="text-center p-3 md:p-4 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border border-gray-200/50 dark:border-gray-700/50">
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-gray-400 mb-1 font-medium">Volume</p>
              <p className={`text-lg md:text-2xl font-bold ${
                analysis.indicators.volumeTrend === 'increasing' ? 'text-emerald-500' :
                analysis.indicators.volumeTrend === 'decreasing' ? 'text-red-500' : 'text-gray-500'
              }`}>
                {analysis.indicators.volumeTrend?.slice(0, 3)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
