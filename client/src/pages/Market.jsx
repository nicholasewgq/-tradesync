import { useState, useEffect } from 'react';
import {
  Search,
  TrendingUp,
  TrendingDown,
  Newspaper,
  BarChart3,
  Globe,
  Clock,
  ExternalLink,
  AlertCircle,
  Zap,
  RefreshCw,
  Star,
  Plus,
  X,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Eye,
  ChevronRight,
  Brain
} from 'lucide-react';
import { api } from '../utils/api';

const DEFAULT_WATCHLIST = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'SPY', 'QQQ', 'NVDA'];

export function Market() {
  const [searchSymbol, setSearchSymbol] = useState('');
  const [selectedSymbol, setSelectedSymbol] = useState('SPY');
  const [quote, setQuote] = useState(null);
  const [news, setNews] = useState([]);
  const [marketNews, setMarketNews] = useState([]);
  const [sentiment, setSentiment] = useState(null);
  const [profile, setProfile] = useState(null);
  const [watchlist, setWatchlist] = useState(DEFAULT_WATCHLIST);
  const [watchlistQuotes, setWatchlistQuotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState(null);
  const [error, setError] = useState('');

  // Check API status on mount
  useEffect(() => {
    checkApiStatus();
    fetchMarketNews();
  }, []);

  // Fetch data when symbol changes
  useEffect(() => {
    if (selectedSymbol && apiStatus?.configured) {
      fetchSymbolData(selectedSymbol);
    }
  }, [selectedSymbol, apiStatus]);

  // Fetch watchlist quotes
  useEffect(() => {
    if (apiStatus?.configured) {
      fetchWatchlistQuotes();
    }
  }, [watchlist, apiStatus]);

  const checkApiStatus = async () => {
    try {
      const response = await api.get('/market/status');
      setApiStatus(response.data);
    } catch (err) {
      setApiStatus({ configured: false, message: 'Failed to check API status' });
    }
  };

  const fetchSymbolData = async (symbol) => {
    setLoading(true);
    setError('');

    try {
      const [quoteRes, newsRes, profileRes] = await Promise.allSettled([
        api.get(`/market/quote/${symbol}`),
        api.get(`/market/news/${symbol}`),
        api.get(`/market/profile/${symbol}`)
      ]);

      if (quoteRes.status === 'fulfilled') setQuote(quoteRes.value.data);
      if (newsRes.status === 'fulfilled') setNews(newsRes.value.data);
      if (profileRes.status === 'fulfilled') setProfile(profileRes.value.data);

      // Try to get sentiment (may fail for some symbols)
      try {
        const sentimentRes = await api.get(`/market/sentiment/${symbol}`);
        setSentiment(sentimentRes.data);
      } catch {
        setSentiment(null);
      }
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchMarketNews = async () => {
    try {
      const response = await api.get('/market/news');
      setMarketNews(response.data);
    } catch (err) {
      console.error('Failed to fetch market news');
    }
  };

  const fetchWatchlistQuotes = async () => {
    try {
      const response = await api.post('/market/quotes', { symbols: watchlist });
      setWatchlistQuotes(response.data);
    } catch (err) {
      console.error('Failed to fetch watchlist quotes');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchSymbol.trim()) {
      setSelectedSymbol(searchSymbol.toUpperCase().trim());
      setSearchSymbol('');
    }
  };

  const addToWatchlist = (symbol) => {
    if (!watchlist.includes(symbol)) {
      setWatchlist([...watchlist, symbol]);
    }
  };

  const removeFromWatchlist = (symbol) => {
    setWatchlist(watchlist.filter(s => s !== symbol));
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp * 1000);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMarketCap = (cap) => {
    if (!cap) return 'N/A';
    if (cap >= 1000) return `$${(cap / 1000).toFixed(2)}T`;
    return `$${cap.toFixed(2)}B`;
  };

  // Generate mini sparkline path
  const generateSparkline = () => {
    const points = Array.from({ length: 20 }, (_, i) => ({
      x: i * 5,
      y: 20 + Math.sin(i * 0.5) * 10 + Math.random() * 5
    }));
    return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  };

  if (!apiStatus?.configured) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="glass-card text-center py-16">
          <div className="relative w-24 h-24 mx-auto mb-6">
            <div className="absolute inset-0 bg-amber-500/20 rounded-2xl blur-xl animate-pulse" />
            <div className="relative w-full h-full rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-amber-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-3">Finnhub API Not Configured</h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            To use Market Intelligence features, you need a Finnhub API key for real-time market data.
          </p>
          <div className="glass-card max-w-lg mx-auto text-left">
            <p className="text-sm font-semibold text-white mb-4">Setup Instructions:</p>
            <ol className="text-sm text-gray-400 space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">1</span>
                <span>Go to <a href="https://finnhub.io/" target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline">finnhub.io</a> and create a free account</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">2</span>
                <span>Copy your API key from the dashboard</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold flex-shrink-0">3</span>
                <span>Add to <code className="bg-white/10 px-2 py-0.5 rounded text-emerald-400">server/.env</code></span>
              </li>
            </ol>
            <pre className="mt-4 p-4 bg-black/30 rounded-xl text-sm overflow-x-auto text-gray-300 border border-white/10">
              FINNHUB_API_KEY=your-api-key-here
            </pre>
            <p className="text-xs text-gray-500 mt-4">Then restart the server to apply changes.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-cyan-500/30 rounded-2xl blur-xl" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
              <Globe className="w-7 h-7 text-white" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white tracking-tight">Market Intelligence</h1>
              <span className="flex items-center gap-1 px-2 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                LIVE
              </span>
            </div>
            <p className="text-gray-400">Real-time quotes, news & AI sentiment analysis</p>
          </div>
        </div>

        {/* Premium Search */}
        <form onSubmit={handleSearch} className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
            <input
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
              placeholder="Search ticker..."
              className="input-premium pl-12 w-56"
            />
          </div>
          <button
            type="submit"
            className="btn-glow px-6"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Watchlist Sidebar - Premium Vertical Card */}
        <div className="col-span-12 md:col-span-3">
          <div className="glass-card sticky top-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Star className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="font-bold text-white">Watchlist</h3>
              </div>
              <button
                onClick={fetchWatchlistQuotes}
                className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
              >
                <RefreshCw className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
              </button>
            </div>

            <div className="space-y-2">
              {watchlistQuotes.map((item) => {
                const isSelected = selectedSymbol === item.symbol;
                const isPositive = item.changePercent >= 0;

                return (
                  <button
                    key={item.symbol}
                    onClick={() => setSelectedSymbol(item.symbol)}
                    className={`group w-full flex items-center justify-between p-3 rounded-xl transition-all duration-300 ${
                      isSelected
                        ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 shadow-lg shadow-indigo-500/10'
                        : 'hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <div className="text-left">
                      <p className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                        {item.symbol}
                      </p>
                      <p className="text-xs text-gray-500">${item.current?.toFixed(2) || '—'}</p>
                    </div>

                    {item.changePercent !== undefined && (
                      <div className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                        isPositive
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      }`}>
                        {isPositive ? (
                          <ArrowUpRight className="w-3 h-3" />
                        ) : (
                          <ArrowDownRight className="w-3 h-3" />
                        )}
                        {isPositive ? '+' : ''}{item.changePercent?.toFixed(2)}%
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-12 md:col-span-9 space-y-6">
          {/* Dominant Price Panel */}
          {quote && (
            <div className="glass-card relative overflow-hidden">
              {/* Background glow effect */}
              <div className={`absolute -top-20 -right-20 w-60 h-60 rounded-full blur-3xl ${
                quote.change >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'
              }`} />
              <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl ${
                quote.change >= 0 ? 'bg-teal-500/10' : 'bg-pink-500/10'
              }`} />

              <div className="relative">
                <div className="flex items-start justify-between">
                  {/* Left - Symbol & Company Info */}
                  <div className="flex items-start gap-5">
                    {profile?.logo ? (
                      <div className="relative">
                        <div className="absolute inset-0 bg-white/10 rounded-2xl blur-xl" />
                        <img src={profile.logo} alt={profile.name} className="relative w-20 h-20 rounded-2xl object-contain bg-white/10 p-2 border border-white/20" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/20 flex items-center justify-center">
                        <BarChart3 className="w-10 h-10 text-indigo-400" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-black text-white">{selectedSymbol}</h2>
                        {!watchlist.includes(selectedSymbol) && (
                          <button
                            onClick={() => addToWatchlist(selectedSymbol)}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors group"
                            title="Add to watchlist"
                          >
                            <Plus className="w-5 h-5 text-gray-500 group-hover:text-amber-400 transition-colors" />
                          </button>
                        )}
                      </div>
                      {profile && (
                        <p className="text-gray-400 text-lg">{profile.name}</p>
                      )}
                      {profile?.finnhubIndustry && (
                        <span className="inline-block mt-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
                          {profile.finnhubIndustry}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Right - Price with Glow */}
                  <div className="text-right">
                    <div className="relative inline-block">
                      {/* Price glow */}
                      <div className={`absolute inset-0 blur-2xl opacity-50 ${
                        quote.change >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />
                      <p className="relative text-5xl font-black text-white tracking-tight">
                        ${quote.current?.toFixed(2)}
                      </p>
                    </div>
                    <div className={`flex items-center justify-end gap-2 mt-2 ${
                      quote.change >= 0 ? 'text-emerald-400' : 'text-rose-400'
                    }`}>
                      <div className={`p-1.5 rounded-lg ${
                        quote.change >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'
                      }`}>
                        {quote.change >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                      </div>
                      <span className="text-xl font-bold">
                        {quote.change >= 0 ? '+' : ''}{quote.change?.toFixed(2)}
                      </span>
                      <span className={`px-3 py-1 rounded-lg font-bold ${
                        quote.change >= 0
                          ? 'bg-emerald-500/20 border border-emerald-500/30'
                          : 'bg-rose-500/20 border border-rose-500/30'
                      }`}>
                        {quote.changePercent >= 0 ? '+' : ''}{quote.changePercent?.toFixed(2)}%
                      </span>
                    </div>

                    {/* Mini Sparkline */}
                    <div className="mt-4 h-10 w-48 ml-auto">
                      <svg width="100%" height="100%" viewBox="0 0 100 40" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id={`sparkGrad-${quote.change >= 0 ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stopColor={quote.change >= 0 ? '#10b981' : '#f43f5e'} stopOpacity="0.3" />
                            <stop offset="100%" stopColor={quote.change >= 0 ? '#10b981' : '#f43f5e'} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path
                          d={generateSparkline()}
                          fill="none"
                          stroke={quote.change >= 0 ? '#10b981' : '#f43f5e'}
                          strokeWidth="2"
                          strokeLinecap="round"
                        />
                        <path
                          d={`${generateSparkline()} L 100 40 L 0 40 Z`}
                          fill={`url(#sparkGrad-${quote.change >= 0 ? 'up' : 'down'})`}
                        />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-8 pt-6 border-t border-white/10">
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 mb-1">Open</p>
                    <p className="font-bold text-white text-lg">${quote.open?.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-emerald-400 mb-1">High</p>
                    <p className="font-bold text-emerald-400 text-lg">${quote.high?.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                    <p className="text-xs text-rose-400 mb-1">Low</p>
                    <p className="font-bold text-rose-400 text-lg">${quote.low?.toFixed(2)}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <p className="text-xs text-gray-500 mb-1">Prev Close</p>
                    <p className="font-bold text-white text-lg">${quote.previousClose?.toFixed(2)}</p>
                  </div>
                  {profile?.marketCap && (
                    <div className="p-3 rounded-xl bg-white/5">
                      <p className="text-xs text-gray-500 mb-1">Market Cap</p>
                      <p className="font-bold text-white text-lg">{formatMarketCap(profile.marketCap)}</p>
                    </div>
                  )}
                </div>

                {/* AI Sentiment Section */}
                {sentiment?.sentiment && (
                  <div className="mt-6 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                        <Brain className="w-4 h-4 text-amber-400" />
                      </div>
                      <h3 className="font-bold text-white">AI Sentiment Analysis</h3>
                      <span className="px-2 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-medium text-indigo-400">
                        Powered by Finnhub
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="relative overflow-hidden rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-5 text-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-emerald-500/10 to-transparent" />
                        <p className="relative text-4xl font-black text-emerald-400">{(sentiment.sentiment.bullishPercent * 100).toFixed(0)}%</p>
                        <p className="relative text-xs text-emerald-400 font-semibold mt-1">Bullish</p>
                      </div>
                      <div className="relative overflow-hidden rounded-xl bg-rose-500/10 border border-rose-500/30 p-5 text-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-rose-500/10 to-transparent" />
                        <p className="relative text-4xl font-black text-rose-400">{(sentiment.sentiment.bearishPercent * 100).toFixed(0)}%</p>
                        <p className="relative text-xs text-rose-400 font-semibold mt-1">Bearish</p>
                      </div>
                      <div className="relative overflow-hidden rounded-xl bg-blue-500/10 border border-blue-500/30 p-5 text-center">
                        <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent" />
                        <p className="relative text-4xl font-black text-blue-400">{sentiment.companyNewsScore?.toFixed(2) || 'N/A'}</p>
                        <p className="relative text-xs text-blue-400 font-semibold mt-1">News Score</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && !quote && (
            <div className="glass-card flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-4">
                  <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full" />
                  <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-gray-400">Loading market data...</p>
              </div>
            </div>
          )}

          {/* News Section - 2 Column Glass Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Symbol News */}
            <div className="glass-card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center">
                  <Newspaper className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">{selectedSymbol} News</h3>
                  <p className="text-xs text-gray-500">Latest headlines</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {news.length > 0 ? news.slice(0, 8).map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 group-hover:text-white line-clamp-2 transition-colors">
                          {item.headline}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span className="font-medium text-gray-400">{item.source}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(item.datetime)}</span>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-indigo-400 flex-shrink-0 transition-colors" />
                    </div>
                  </a>
                )) : (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                      <Newspaper className="w-6 h-6 text-gray-600" />
                    </div>
                    <p className="text-sm text-gray-500">No recent news</p>
                  </div>
                )}
              </div>
            </div>

            {/* Market News */}
            <div className="glass-card">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white">Market News</h3>
                  <p className="text-xs text-gray-500">General market updates</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {marketNews.slice(0, 8).map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group block p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 group-hover:text-white line-clamp-2 transition-colors">
                          {item.headline}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <span className="font-medium text-gray-400">{item.source}</span>
                          <span>•</span>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatTime(item.datetime)}</span>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-cyan-400 flex-shrink-0 transition-colors" />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
