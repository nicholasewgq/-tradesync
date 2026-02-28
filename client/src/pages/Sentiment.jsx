import { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  RefreshCw,
  Newspaper,
  Twitter,
  Calendar,
  AlertTriangle,
  Zap,
  BarChart3,
  Globe,
  Clock,
  ExternalLink,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  MessageSquare,
  Users,
  Activity
} from 'lucide-react';

export function Sentiment() {
  const [searchTicker, setSearchTicker] = useState('');
  const [selectedTicker, setSelectedTicker] = useState('SPY');
  const [loading, setLoading] = useState(false);
  const [marketSentiment, setMarketSentiment] = useState(null);
  const [tickerSentiment, setTickerSentiment] = useState(null);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [socialBuzz, setSocialBuzz] = useState([]);

  // Simulated sentiment data - in production, this would come from APIs
  useEffect(() => {
    loadSentimentData(selectedTicker);
  }, [selectedTicker]);

  const loadSentimentData = async (ticker) => {
    setLoading(true);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Market-wide sentiment
    setMarketSentiment({
      overall: 65, // 0-100, 50 is neutral
      fearGreed: 58,
      vix: 18.5,
      putCallRatio: 0.85,
      breadth: 62,
      trend: 'bullish'
    });

    // Ticker-specific sentiment
    const sentiments = {
      'SPY': { score: 68, news: 72, social: 65, institutional: 70, trend: 'bullish', mentions: 15420 },
      'AAPL': { score: 71, news: 75, social: 68, institutional: 72, trend: 'bullish', mentions: 28340 },
      'TSLA': { score: 45, news: 42, social: 55, institutional: 38, trend: 'bearish', mentions: 45230 },
      'NVDA': { score: 78, news: 82, social: 75, institutional: 80, trend: 'bullish', mentions: 32150 },
      'AMD': { score: 62, news: 58, social: 68, institutional: 60, trend: 'neutral', mentions: 12450 },
      'MSFT': { score: 69, news: 70, social: 65, institutional: 74, trend: 'bullish', mentions: 18920 },
      'META': { score: 55, news: 52, social: 60, institutional: 53, trend: 'neutral', mentions: 22100 },
      'GOOGL': { score: 64, news: 66, social: 62, institutional: 65, trend: 'bullish', mentions: 14500 },
    };

    setTickerSentiment(sentiments[ticker.toUpperCase()] || {
      score: Math.floor(Math.random() * 40) + 30,
      news: Math.floor(Math.random() * 40) + 30,
      social: Math.floor(Math.random() * 40) + 30,
      institutional: Math.floor(Math.random() * 40) + 30,
      trend: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)],
      mentions: Math.floor(Math.random() * 10000) + 1000
    });

    // News headlines
    setNews([
      {
        title: `${ticker} Shows Strong Technical Setup Ahead of Earnings`,
        source: 'MarketWatch',
        time: '2 hours ago',
        sentiment: 'bullish',
        impact: 'high'
      },
      {
        title: `Analysts Upgrade ${ticker} Price Target by 15%`,
        source: 'Bloomberg',
        time: '4 hours ago',
        sentiment: 'bullish',
        impact: 'high'
      },
      {
        title: `Sector Rotation May Impact ${ticker} Short-Term`,
        source: 'Reuters',
        time: '6 hours ago',
        sentiment: 'neutral',
        impact: 'medium'
      },
      {
        title: `Options Flow Shows Unusual Activity in ${ticker}`,
        source: 'Benzinga',
        time: '8 hours ago',
        sentiment: 'bullish',
        impact: 'medium'
      },
      {
        title: `Fed Comments Could Affect Tech Stocks Including ${ticker}`,
        source: 'CNBC',
        time: '12 hours ago',
        sentiment: 'neutral',
        impact: 'high'
      },
    ]);

    // Upcoming events
    setEvents([
      {
        ticker: ticker,
        event: 'Earnings Report',
        date: 'Mar 15, 2024',
        time: 'After Hours',
        impact: 'high',
        expectedMove: '±5.2%'
      },
      {
        ticker: 'FOMC',
        event: 'Fed Interest Rate Decision',
        date: 'Mar 20, 2024',
        time: '2:00 PM ET',
        impact: 'high',
        expectedMove: 'Market-wide'
      },
      {
        ticker: ticker,
        event: 'Ex-Dividend Date',
        date: 'Mar 22, 2024',
        time: 'Market Open',
        impact: 'low',
        expectedMove: '-0.5%'
      },
      {
        ticker: 'CPI',
        event: 'Inflation Data Release',
        date: 'Mar 12, 2024',
        time: '8:30 AM ET',
        impact: 'high',
        expectedMove: 'Market-wide'
      },
    ]);

    // Social buzz
    setSocialBuzz([
      { platform: 'Twitter/X', mentions: 8420, sentiment: 68, change: +12 },
      { platform: 'Reddit', mentions: 3250, sentiment: 72, change: +25 },
      { platform: 'StockTwits', mentions: 2100, sentiment: 65, change: +8 },
      { platform: 'Discord', mentions: 1580, sentiment: 70, change: +15 },
    ]);

    setLoading(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTicker.trim()) {
      setSelectedTicker(searchTicker.toUpperCase());
      setSearchTicker('');
    }
  };

  const getSentimentColor = (score) => {
    if (score >= 65) return 'text-emerald-500';
    if (score >= 45) return 'text-amber-500';
    return 'text-red-500';
  };

  const getSentimentBg = (score) => {
    if (score >= 65) return 'from-emerald-500/20 to-emerald-500/5';
    if (score >= 45) return 'from-amber-500/20 to-amber-500/5';
    return 'from-red-500/20 to-red-500/5';
  };

  const getSentimentLabel = (score) => {
    if (score >= 75) return 'Very Bullish';
    if (score >= 60) return 'Bullish';
    if (score >= 45) return 'Neutral';
    if (score >= 30) return 'Bearish';
    return 'Very Bearish';
  };

  const getSentimentIcon = (trend) => {
    if (trend === 'bullish') return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    if (trend === 'bearish') return <TrendingDown className="w-5 h-5 text-red-500" />;
    return <Minus className="w-5 h-5 text-amber-500" />;
  };

  const quickTickers = ['SPY', 'QQQ', 'AAPL', 'TSLA', 'NVDA', 'AMD', 'MSFT', 'META'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            AI Sentiment Scanner
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Real-time market sentiment analysis powered by AI</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchTicker}
              onChange={(e) => setSearchTicker(e.target.value.toUpperCase())}
              placeholder="Enter ticker..."
              className="pl-10 pr-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-40"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-cyan-500/30 transition-all"
          >
            Analyze
          </button>
        </form>
      </div>

      {/* Quick Tickers */}
      <div className="flex flex-wrap gap-2">
        {quickTickers.map((ticker) => (
          <button
            key={ticker}
            onClick={() => setSelectedTicker(ticker)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedTicker === ticker
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
            }`}
          >
            {ticker}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <RefreshCw className="w-8 h-8 text-cyan-500 animate-spin" />
        </div>
      ) : (
        <>
          {/* Main Sentiment Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ticker Sentiment */}
            <div className="lg:col-span-2 bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-cyan-500" />
                  {selectedTicker} Sentiment Analysis
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  tickerSentiment?.trend === 'bullish' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                  tickerSentiment?.trend === 'bearish' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                }`}>
                  {tickerSentiment?.trend?.toUpperCase()}
                </span>
              </div>

              {/* Overall Score */}
              <div className="flex items-center gap-8 mb-8">
                <div className={`relative w-32 h-32 rounded-full bg-gradient-to-br ${getSentimentBg(tickerSentiment?.score)} flex items-center justify-center`}>
                  <div className="text-center">
                    <div className={`text-4xl font-bold ${getSentimentColor(tickerSentiment?.score)}`}>
                      {tickerSentiment?.score}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">/ 100</div>
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">AI Verdict</span>
                    <span className={`font-semibold ${getSentimentColor(tickerSentiment?.score)}`}>
                      {getSentimentLabel(tickerSentiment?.score)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">24h Mentions</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {tickerSentiment?.mentions?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600 dark:text-gray-400 text-sm">Recommendation</span>
                    <span className={`font-semibold ${
                      tickerSentiment?.score >= 65 ? 'text-emerald-500' :
                      tickerSentiment?.score >= 45 ? 'text-amber-500' : 'text-red-500'
                    }`}>
                      {tickerSentiment?.score >= 70 ? 'Strong Buy Signal' :
                       tickerSentiment?.score >= 60 ? 'Consider Long' :
                       tickerSentiment?.score >= 45 ? 'Wait for Confirmation' :
                       tickerSentiment?.score >= 35 ? 'Consider Short' : 'Strong Sell Signal'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'News Sentiment', value: tickerSentiment?.news, icon: Newspaper },
                  { label: 'Social Sentiment', value: tickerSentiment?.social, icon: MessageSquare },
                  { label: 'Institutional', value: tickerSentiment?.institutional, icon: Users },
                  { label: 'Technical', value: Math.floor((tickerSentiment?.score + tickerSentiment?.institutional) / 2), icon: Activity },
                ].map((item, idx) => (
                  <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <item.icon className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500 dark:text-gray-400">{item.label}</span>
                    </div>
                    <div className={`text-2xl font-bold ${getSentimentColor(item.value)}`}>
                      {item.value}
                    </div>
                    <div className="mt-2 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          item.value >= 65 ? 'bg-emerald-500' :
                          item.value >= 45 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Market Overview */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-6">
                <Globe className="w-5 h-5 text-cyan-500" />
                Market Sentiment
              </h2>

              <div className="space-y-4">
                {/* Fear & Greed */}
                <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Fear & Greed Index</span>
                    <span className={`font-bold ${getSentimentColor(marketSentiment?.fearGreed)}`}>
                      {marketSentiment?.fearGreed}
                    </span>
                  </div>
                  <div className="h-2 bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 rounded-full relative">
                    <div
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-gray-900"
                      style={{ left: `${marketSentiment?.fearGreed}%`, transform: 'translate(-50%, -50%)' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-400">
                    <span>Fear</span>
                    <span>Greed</span>
                  </div>
                </div>

                {/* VIX */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">VIX (Volatility)</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{marketSentiment?.vix}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    marketSentiment?.vix < 20 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                    marketSentiment?.vix < 30 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                    'bg-red-100 dark:bg-red-900/30 text-red-600'
                  }`}>
                    {marketSentiment?.vix < 20 ? 'Low' : marketSentiment?.vix < 30 ? 'Elevated' : 'High'}
                  </div>
                </div>

                {/* Put/Call Ratio */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Put/Call Ratio</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{marketSentiment?.putCallRatio}</p>
                  </div>
                  <div className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    marketSentiment?.putCallRatio < 0.9 ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                    marketSentiment?.putCallRatio < 1.1 ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' :
                    'bg-red-100 dark:bg-red-900/30 text-red-600'
                  }`}>
                    {marketSentiment?.putCallRatio < 0.9 ? 'Bullish' : marketSentiment?.putCallRatio < 1.1 ? 'Neutral' : 'Bearish'}
                  </div>
                </div>

                {/* Market Breadth */}
                <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Market Breadth</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">{marketSentiment?.breadth}%</p>
                  </div>
                  {getSentimentIcon(marketSentiment?.trend)}
                </div>
              </div>
            </div>
          </div>

          {/* News & Events */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* News */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Newspaper className="w-5 h-5 text-cyan-500" />
                Latest News & Sentiment
              </h2>

              <div className="space-y-3">
                {news.map((item, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors cursor-pointer">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm leading-snug">
                          {item.title}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs text-gray-500">{item.source}</span>
                          <span className="text-xs text-gray-400">•</span>
                          <span className="text-xs text-gray-500">{item.time}</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          item.sentiment === 'bullish' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' :
                          item.sentiment === 'bearish' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' :
                          'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                        }`}>
                          {item.sentiment}
                        </span>
                        {item.impact === 'high' && (
                          <span className="flex items-center gap-1 text-xs text-amber-500">
                            <Zap className="w-3 h-3" /> High Impact
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Events Calendar */}
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-cyan-500" />
                Upcoming Events & Catalysts
              </h2>

              <div className="space-y-3">
                {events.map((event, idx) => (
                  <div key={idx} className="p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-cyan-100 dark:bg-cyan-900/30 text-cyan-600 dark:text-cyan-400 rounded text-xs font-bold">
                          {event.ticker}
                        </span>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">
                          {event.event}
                        </span>
                      </div>
                      {event.impact === 'high' && (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {event.date} • {event.time}
                      </div>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
                        Expected: {event.expectedMove}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Social Buzz */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4">
              <MessageSquare className="w-5 h-5 text-cyan-500" />
              Social Media Buzz - {selectedTicker}
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {socialBuzz.map((platform, idx) => (
                <div key={idx} className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{platform.platform}</span>
                    <span className={`flex items-center gap-1 text-xs font-medium ${
                      platform.change > 0 ? 'text-emerald-500' : 'text-red-500'
                    }`}>
                      {platform.change > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {platform.change > 0 ? '+' : ''}{platform.change}%
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                    {platform.mentions.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          platform.sentiment >= 65 ? 'bg-emerald-500' :
                          platform.sentiment >= 45 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${platform.sentiment}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">{platform.sentiment}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary */}
          <div className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 dark:from-cyan-500/20 dark:via-blue-500/20 dark:to-purple-500/20 rounded-2xl border border-cyan-500/20 p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">AI Trading Insight</h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {tickerSentiment?.score >= 70 ? (
                    <>
                      <strong className="text-emerald-500">{selectedTicker}</strong> is showing strong bullish sentiment across all indicators.
                      News coverage is overwhelmingly positive with institutional interest increasing. Social media buzz is elevated with
                      predominantly bullish discussions. Consider this a <strong className="text-emerald-500">favorable entry point</strong> for
                      long positions, but always use proper risk management with stop-losses.
                    </>
                  ) : tickerSentiment?.score >= 55 ? (
                    <>
                      <strong className="text-amber-500">{selectedTicker}</strong> sentiment is moderately positive but showing mixed signals.
                      While news sentiment leans bullish, social media shows some uncertainty. This suggests
                      <strong className="text-amber-500"> waiting for confirmation</strong> before entering. Watch for a breakout above
                      key resistance levels or clearer directional momentum before committing capital.
                    </>
                  ) : (
                    <>
                      <strong className="text-red-500">{selectedTicker}</strong> is displaying bearish sentiment indicators.
                      News coverage has turned negative and institutional selling pressure is evident. Social sentiment
                      shows concern among retail traders. Consider <strong className="text-red-500">avoiding long positions</strong> or
                      look for short opportunities with tight risk controls. Wait for sentiment reversal before considering bullish trades.
                    </>
                  )}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
