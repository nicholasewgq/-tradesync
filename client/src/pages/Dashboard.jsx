import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  TrendingUp,
  Zap,
  Target,
  Award,
  BookOpen,
  GraduationCap,
  BarChart3,
  Lightbulb,
  RefreshCw,
  ArrowUpRight,
  Flame,
  Trophy,
  Clock,
  ChevronRight,
  Sparkles,
  Activity
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';

const tips = [
  {
    title: 'Risk Management',
    content: 'Never risk more than 1-2% of your account on a single trade. This helps preserve capital during losing streaks.',
    icon: Target
  },
  {
    title: 'Entry Timing',
    content: 'Wait for confirmation before entering. A setup that looks good might need one more candle to validate the move.',
    icon: Clock
  },
  {
    title: 'Journal Review',
    content: 'Review your trades weekly. Look for patterns in your winners and losers to refine your strategy.',
    icon: BookOpen
  }
];

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [currentTip, setCurrentTip] = useState(0);
  const [tradersOnline] = useState(Math.floor(Math.random() * 200) + 250);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await api.get('/analytics/summary');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      }
    };
    fetchAnalytics();
  }, []);

  const refreshTip = () => {
    setCurrentTip((prev) => (prev + 1) % tips.length);
  };

  const CurrentTipIcon = tips[currentTip].icon;

  return (
    <div className="max-w-7xl mx-auto px-4 py-2">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-3xl p-8 pb-24 mb-4 shadow-2xl shadow-indigo-500/20">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl" />

        <div className="relative z-10 flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white/90 text-sm mb-4">
              <Calendar className="w-4 h-4" />
              {formatDate()}
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {getGreeting()}, {user?.username || 'Trader'}!
            </h1>
            <p className="text-white/80 text-lg max-w-xl">
              Your trading command center is ready. Let's make today profitable.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate('/swing-trading')}
              className="flex items-center gap-2 px-5 py-3 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white rounded-xl font-medium transition-all duration-200"
            >
              <TrendingUp className="w-5 h-5" />
              Swing Trade
            </button>
            <button
              onClick={() => navigate('/scalp-trading')}
              className="flex items-center gap-2 px-5 py-3 bg-white hover:bg-white/90 text-indigo-600 rounded-xl font-semibold transition-all duration-200 shadow-lg"
            >
              <Zap className="w-5 h-5" />
              Scalp Trade
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards - Below Hero */}
      <div className="grid grid-cols-4 gap-4 mb-6 -mt-16 relative z-10 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Trades</span>
            <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Activity className="w-4 h-4 text-blue-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.totalTrades || 0}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Win Rate</span>
            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Target className="w-4 h-4 text-green-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-green-500">{analytics?.winRate || 0}%</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Profit Factor</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Award className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{analytics?.profitFactor || '0.00'}</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Total P/L</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold ${analytics?.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {analytics?.totalProfit >= 0 ? '+' : '-'}${Math.abs(analytics?.totalProfit || 0).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {/* Quick Actions */}
        <div className="col-span-2 grid grid-cols-2 gap-4">
          {/* Swing Trading Card */}
          <div
            onClick={() => navigate('/swing-trading')}
            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-semibold rounded-full">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  2.4k active
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Swing Trading</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Multi-day to multi-week opportunities</p>

              <div className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                Start Analysis
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Scalp Trading Card */}
          <div
            onClick={() => navigate('/scalp-trading')}
            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Zap className="w-7 h-7 text-white" />
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-xs font-semibold rounded-full">
                  <Flame className="w-3 h-3" />
                  Hot
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Scalp Trading</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Quick profits from small moves</p>

              <div className="flex items-center text-orange-600 dark:text-orange-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                Start Scalping
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Analytics Card */}
          <div
            onClick={() => navigate('/analytics')}
            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:shadow-xl hover:shadow-violet-500/10 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-purple-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                  <BarChart3 className="w-7 h-7 text-white" />
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-semibold rounded-full">
                  <Sparkles className="w-3 h-3" />
                  Insights
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Analytics</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Deep dive into your performance</p>

              <div className="flex items-center text-violet-600 dark:text-violet-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                View Analytics
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Journal Card */}
          <div
            onClick={() => navigate('/journal')}
            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50 cursor-pointer hover:shadow-xl hover:shadow-pink-500/10 transition-all duration-300"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/10 to-rose-500/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />

            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                  <BookOpen className="w-7 h-7 text-white" />
                </div>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-xs font-semibold rounded-full">
                  <Trophy className="w-3 h-3" />
                  Essential
                </span>
              </div>

              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Trade Journal</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">Log and review your trades</p>

              <div className="flex items-center text-pink-600 dark:text-pink-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                Open Journal
                <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Trading Tip Card */}
          <div className="relative overflow-hidden bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-2xl p-6 text-white">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                    <Lightbulb className="w-5 h-5" />
                  </div>
                  <span className="font-semibold">Pro Tip</span>
                </div>
                <button
                  onClick={refreshTip}
                  className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  <CurrentTipIcon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold mb-1">{tips[currentTip].title}</h4>
                  <p className="text-sm text-white/80 leading-relaxed">{tips[currentTip].content}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <span className="text-xs text-white/60">Tip {currentTip + 1} of {tips.length}</span>
                <button
                  onClick={() => navigate('/learning')}
                  className="flex items-center gap-1 text-xs font-medium hover:gap-2 transition-all"
                >
                  More Tips <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Community Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 dark:text-white">Community</h3>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <span className="text-xs font-semibold text-green-600 dark:text-green-400">{tradersOnline} online</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <span className="text-lg">📈</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">Market sentiment: Bullish</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <span className="text-lg">🎯</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">New pattern guide available</span>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <span className="text-lg">🏆</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">Weekly challenge started</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/learning')}
              className="w-full mt-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            >
              Explore Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
