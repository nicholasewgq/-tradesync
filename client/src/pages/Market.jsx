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
  X
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

  if (!apiStatus?.configured) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Finnhub API Not Configured</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            To use Market Intelligence features, you need a Finnhub API key.
          </p>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 max-w-md mx-auto text-left">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Setup Instructions:</p>
            <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-2 list-decimal list-inside">
              <li>Go to <a href="https://finnhub.io/" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">finnhub.io</a> and create a free account</li>
              <li>Copy your API key from the dashboard</li>
              <li>Add to <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">server/.env</code>:</li>
            </ol>
            <pre className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded text-xs overflow-x-auto">
              FINNHUB_API_KEY=your-api-key-here
            </pre>
            <p className="text-xs text-gray-500 mt-2">Then restart the server.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Market Intelligence</h1>
            <p className="text-gray-500 dark:text-gray-400">Real-time quotes, news & sentiment powered by Finnhub</p>
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchSymbol}
              onChange={(e) => setSearchSymbol(e.target.value.toUpperCase())}
              placeholder="Search symbol..."
              className="pl-10 pr-4 py-2.5 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Search
          </button>
        </form>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {/* Watchlist Sidebar */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" />
                Watchlist
              </h3>
              <button
                onClick={fetchWatchlistQuotes}
                className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="space-y-2">
              {watchlistQuotes.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => setSelectedSymbol(item.symbol)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                    selectedSymbol === item.symbol
                      ? 'bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-200 dark:border-indigo-800'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  }`}
                >
                  <div className="text-left">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.symbol}</p>
                    <p className="text-xs text-gray-500">${item.current?.toFixed(2) || '—'}</p>
                  </div>
                  {item.changePercent !== undefined && (
                    <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${
                      item.changePercent >= 0
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                    }`}>
                      {item.changePercent >= 0 ? '+' : ''}{item.changePercent?.toFixed(2)}%
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="col-span-3 space-y-6">
          {/* Quote Card */}
          {quote && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  {profile?.logo && (
                    <img src={profile.logo} alt={profile.name} className="w-14 h-14 rounded-xl object-contain bg-white p-1" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedSymbol}</h2>
                      {!watchlist.includes(selectedSymbol) && (
                        <button
                          onClick={() => addToWatchlist(selectedSymbol)}
                          className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          <Plus className="w-4 h-4 text-gray-400" />
                        </button>
                      )}
                    </div>
                    {profile && (
                      <p className="text-gray-500 dark:text-gray-400">{profile.name}</p>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white">
                    ${quote.current?.toFixed(2)}
                  </p>
                  <div className={`flex items-center justify-end gap-1 ${
                    quote.change >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {quote.change >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                    <span className="font-semibold">
                      {quote.change >= 0 ? '+' : ''}{quote.change?.toFixed(2)} ({quote.changePercent?.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-5 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Open</p>
                  <p className="font-semibold text-gray-900 dark:text-white">${quote.open?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">High</p>
                  <p className="font-semibold text-green-500">${quote.high?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Low</p>
                  <p className="font-semibold text-red-500">${quote.low?.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Prev Close</p>
                  <p className="font-semibold text-gray-900 dark:text-white">${quote.previousClose?.toFixed(2)}</p>
                </div>
                {profile?.marketCap && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Market Cap</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatMarketCap(profile.marketCap)}</p>
                  </div>
                )}
              </div>

              {/* Sentiment */}
              {sentiment?.sentiment && (
                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-amber-500" />
                    AI Sentiment Analysis
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-green-600">{(sentiment.sentiment.bullishPercent * 100).toFixed(0)}%</p>
                      <p className="text-xs text-green-600">Bullish</p>
                    </div>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-red-600">{(sentiment.sentiment.bearishPercent * 100).toFixed(0)}%</p>
                      <p className="text-xs text-red-600">Bearish</p>
                    </div>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center">
                      <p className="text-2xl font-bold text-blue-600">{sentiment.companyNewsScore?.toFixed(2) || 'N/A'}</p>
                      <p className="text-xs text-blue-600">News Score</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* News Grid */}
          <div className="grid grid-cols-2 gap-6">
            {/* Symbol News */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-indigo-500" />
                {selectedSymbol} News
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {news.length > 0 ? news.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{item.headline}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>{item.source}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(item.datetime)}</span>
                    </div>
                  </a>
                )) : (
                  <p className="text-sm text-gray-500 text-center py-4">No recent news</p>
                )}
              </div>
            </div>

            {/* Market News */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Globe className="w-4 h-4 text-cyan-500" />
                Market News
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {marketNews.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{item.headline}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                      <span>{item.source}</span>
                      <span>•</span>
                      <Clock className="w-3 h-3" />
                      <span>{formatTime(item.datetime)}</span>
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
