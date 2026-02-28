import { useState, useEffect } from 'react';
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Target,
  Zap,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  BarChart3,
  Flame,
  Shield,
  Calendar
} from 'lucide-react';
import { api } from '../utils/api';

export function AIInsights() {
  const [activeTab, setActiveTab] = useState('signals');
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);

  // Signals state
  const [signalSymbol, setSignalSymbol] = useState('SPY');
  const [signalPrice, setSignalPrice] = useState('');
  const [signals, setSignals] = useState(null);

  // Market Summary state
  const [marketSummary, setMarketSummary] = useState(null);

  useEffect(() => {
    checkApiStatus();
  }, []);

  const checkApiStatus = async () => {
    try {
      const response = await api.get('/ai/status');
      setApiStatus(response.data);
    } catch {
      setApiStatus({ configured: false });
    }
  };

  const fetchSignals = async () => {
    if (!signalSymbol || !signalPrice) {
      alert('Enter symbol and current price');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/ai/signals', {
        symbol: signalSymbol,
        currentPrice: parseFloat(signalPrice)
      });
      setSignals(response.data);
    } catch (error) {
      console.error('Signals error:', error);
      alert(error.response?.data?.error || 'Failed to generate signals');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketSummary = async () => {
    setLoading(true);
    try {
      const response = await api.get('/ai/market-summary');
      setMarketSummary(response.data);
    } catch (error) {
      console.error('Market summary error:', error);
      alert(error.response?.data?.error || 'Failed to get market summary');
    } finally {
      setLoading(false);
    }
  };

  if (!apiStatus?.configured) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-8 text-white mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
              <Brain className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">AI Trading Assistant</h1>
              <p className="text-white/80">Powered by Claude AI</p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Claude AI Not Configured</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            To use AI features, you need an Anthropic API key.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-w-md mx-auto text-left">
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
              <li>Go to <a href="https://console.anthropic.com/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">console.anthropic.com</a></li>
              <li>Create an API key</li>
              <li>Add to <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">server/.env</code>:</li>
            </ol>
            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs">
              ANTHROPIC_API_KEY=your-api-key-here
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-500 rounded-3xl p-8 text-white mb-6 relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Brain className="w-9 h-9" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">AI Trading Assistant</h1>
                <p className="text-white/80 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Powered by Claude AI - Your Personal Trading Coach
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-white/20 rounded-xl">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-sm font-medium">AI Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { id: 'signals', label: 'Smart Signals', icon: Target },
          { id: 'market', label: 'Market Summary', icon: BarChart3 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-lg'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Smart Signals Tab */}
      {activeTab === 'signals' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-indigo-500" />
              Generate Smart Signals
            </h3>
            <div className="flex gap-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Symbol</label>
                <input
                  type="text"
                  value={signalSymbol}
                  onChange={(e) => setSignalSymbol(e.target.value.toUpperCase())}
                  placeholder="SPY, AAPL, BTC..."
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Price</label>
                <input
                  type="number"
                  value={signalPrice}
                  onChange={(e) => setSignalPrice(e.target.value)}
                  placeholder="Enter current price"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchSignals}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : 'Generate'}
                </button>
              </div>
            </div>
          </div>

          {signals && (
            <>
              {/* Recommendation */}
              <div className={`rounded-2xl p-6 ${
                signals.signals.recommendation === 'LONG' ? 'bg-green-500' :
                signals.signals.recommendation === 'SHORT' ? 'bg-red-500' :
                'bg-gray-500'
              } text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/80 text-sm">AI Recommendation</p>
                    <p className="text-3xl font-bold">{signals.signals.recommendation}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white/80 text-sm">Confidence</p>
                    <p className="text-3xl font-bold">{signals.signals.confidence}%</p>
                  </div>
                </div>
                <p className="mt-4 text-white/90">{signals.signals.summary}</p>
              </div>

              {/* Long & Short Signals */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-green-200 dark:border-green-800">
                  <h3 className="font-bold text-green-600 dark:text-green-400 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Long Setup
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Entry</span>
                      <span className="font-bold text-gray-900 dark:text-white">${signals.signals.signals.long.entry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Stop Loss</span>
                      <span className="font-bold text-red-500">${signals.signals.signals.long.stopLoss}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">TP1</span>
                      <span className="font-bold text-green-500">${signals.signals.signals.long.takeProfit1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">TP2</span>
                      <span className="font-bold text-green-500">${signals.signals.signals.long.takeProfit2}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">R:R</span>
                      <span className="font-bold text-gray-900 dark:text-white">{signals.signals.signals.long.riskReward}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">{signals.signals.signals.long.reasoning}</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800">
                  <h3 className="font-bold text-red-600 dark:text-red-400 mb-4 flex items-center gap-2">
                    <TrendingDown className="w-5 h-5" />
                    Short Setup
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Entry</span>
                      <span className="font-bold text-gray-900 dark:text-white">${signals.signals.signals.short.entry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Stop Loss</span>
                      <span className="font-bold text-red-500">${signals.signals.signals.short.stopLoss}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">TP1</span>
                      <span className="font-bold text-green-500">${signals.signals.signals.short.takeProfit1}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">TP2</span>
                      <span className="font-bold text-green-500">${signals.signals.signals.short.takeProfit2}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">R:R</span>
                      <span className="font-bold text-gray-900 dark:text-white">{signals.signals.signals.short.riskReward}</span>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-gray-500">{signals.signals.signals.short.reasoning}</p>
                </div>
              </div>

              {/* Key Levels */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Key Levels</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Strong Resistance</p>
                    {signals.signals.keyLevels.strongResistance?.map((lvl, i) => (
                      <p key={i} className="font-mono text-red-600 font-bold">${lvl}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Resistance</p>
                    {signals.signals.keyLevels.resistance?.map((lvl, i) => (
                      <p key={i} className="font-mono text-red-400">${lvl}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Support</p>
                    {signals.signals.keyLevels.support?.map((lvl, i) => (
                      <p key={i} className="font-mono text-green-400">${lvl}</p>
                    ))}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Strong Support</p>
                    {signals.signals.keyLevels.strongSupport?.map((lvl, i) => (
                      <p key={i} className="font-mono text-green-600 font-bold">${lvl}</p>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Market Summary Tab */}
      {activeTab === 'market' && (
        <div className="space-y-6">
          {!marketSummary ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 text-center border border-gray-200/50 dark:border-gray-700/50">
              <BarChart3 className="w-16 h-16 text-cyan-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Daily Market Summary</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Get AI-generated market analysis, sector insights, and trading ideas for today.
              </p>
              <button
                onClick={fetchMarketSummary}
                disabled={loading}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2 mx-auto"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    Generate Market Summary
                  </>
                )}
              </button>
            </div>
          ) : (
            <>
              {/* Outlook Header */}
              <div className={`rounded-2xl p-6 ${
                marketSummary.summary.marketOutlook === 'Bullish' ? 'bg-green-500' :
                marketSummary.summary.marketOutlook === 'Bearish' ? 'bg-red-500' :
                marketSummary.summary.marketOutlook === 'Cautious' ? 'bg-amber-500' :
                'bg-gray-500'
              } text-white`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-6 h-6" />
                    <div>
                      <p className="text-white/80 text-sm">{marketSummary.dayOfWeek}</p>
                      <p className="font-bold">{marketSummary.date}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-4xl font-bold">{marketSummary.summary.marketOutlook}</p>
                    <p className="text-white/80">Confidence: {marketSummary.summary.confidenceLevel}%</p>
                  </div>
                </div>
                <p className="text-lg">{marketSummary.summary.summary}</p>
              </div>

              {/* Indices */}
              <div className="grid grid-cols-3 gap-4">
                {Object.entries(marketSummary.summary.indices).map(([symbol, data]) => (
                  <div key={symbol} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-gray-900 dark:text-white">{symbol}</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        data.outlook === 'Bullish' ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' :
                        data.outlook === 'Bearish' ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' :
                        'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>{data.outlook}</span>
                    </div>
                    <p className="text-sm text-gray-500">{data.keyLevel}</p>
                  </div>
                ))}
              </div>

              {/* Sectors */}
              <div className="grid grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="font-bold text-green-600 mb-3 flex items-center gap-2">
                    <Flame className="w-5 h-5" />
                    Hot Sectors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {marketSummary.summary.sectors.hot.map((sector, i) => (
                      <span key={i} className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                  <h3 className="font-bold text-blue-600 mb-3 flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Cold Sectors
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {marketSummary.summary.sectors.cold.map((sector, i) => (
                      <span key={i} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
                        {sector}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Watchlist */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-500" />
                  AI Watchlist
                </h3>
                <div className="space-y-3">
                  {marketSummary.summary.watchlist.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          item.direction === 'Long' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                        }`}>{item.direction}</span>
                        <span className="font-bold text-gray-900 dark:text-white">{item.symbol}</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trading Plan */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-5 text-white">
                  <Zap className="w-6 h-6 mb-2" />
                  <h4 className="font-bold mb-2">Scalping</h4>
                  <p className="text-sm text-white/90">{marketSummary.summary.tradingPlan.scalping}</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl p-5 text-white">
                  <TrendingUp className="w-6 h-6 mb-2" />
                  <h4 className="font-bold mb-2">Swing Trading</h4>
                  <p className="text-sm text-white/90">{marketSummary.summary.tradingPlan.swingTrading}</p>
                </div>

                <div className="bg-gradient-to-br from-red-500 to-rose-500 rounded-2xl p-5 text-white">
                  <AlertTriangle className="w-6 h-6 mb-2" />
                  <h4 className="font-bold mb-2">Avoid Today</h4>
                  <p className="text-sm text-white/90">{marketSummary.summary.tradingPlan.avoidToday}</p>
                </div>
              </div>

              {/* Quote */}
              <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl p-6 text-center">
                <p className="text-lg italic text-gray-600 dark:text-gray-300">"{marketSummary.summary.quote}"</p>
              </div>

              <button
                onClick={fetchMarketSummary}
                className="w-full py-3 bg-gray-100 dark:bg-gray-700 rounded-xl text-gray-600 dark:text-gray-300 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh Summary
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
