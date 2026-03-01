import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  Award,
  BookOpen,
  BarChart3,
  ArrowUpRight,
  Flame,
  Trophy,
  ChevronRight,
  Sparkles,
  Activity,
  Brain,
  Shield,
  Users,
  AlertTriangle,
  Cpu,
  LineChart,
  Percent
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../utils/api';
import { TradingViewTicker, TradingViewAdvancedChart, TradingViewMarketOverview } from '../components/TradingViewChart';

// Mini Sparkline Component
const MiniSparkline = ({ data, color = '#6366F1', height = 32 }) => {
  const points = data || [40, 45, 35, 50, 49, 60, 70, 65, 80, 75, 90, 85];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const pathData = points.map((point, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - ((point - min) / range) * 100;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  return (
    <svg className="w-full" height={height} viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`gradient-${color.replace('#', '')}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathData} L 100 100 L 0 100 Z`}
        fill={`url(#gradient-${color.replace('#', '')})`}
      />
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

// Equity Curve Component
const EquityCurve = ({ data }) => {
  const points = data || [1000, 1050, 980, 1100, 1080, 1200, 1350, 1280, 1450, 1520, 1480, 1650];
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;

  const pathData = points.map((point, i) => {
    const x = (i / (points.length - 1)) * 100;
    const y = 100 - ((point - min) / range) * 80;
    return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
  }).join(' ');

  const isPositive = points[points.length - 1] >= points[0];
  const color = isPositive ? '#00FF9C' : '#FF4D6D';

  return (
    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="equityGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.4" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={`${pathData} L 100 100 L 0 100 Z`}
        fill="url(#equityGradient)"
      />
      <path
        d={pathData}
        fill="none"
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
};

export function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [aiInsight, setAiInsight] = useState(0);
  const [tradersOnline] = useState(Math.floor(Math.random() * 200) + 250);

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

    // Rotate AI insights
    const interval = setInterval(() => {
      setAiInsight(prev => (prev + 1) % 3);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  const aiInsights = [
    {
      title: 'Strong Buy Signal Detected',
      description: 'EURUSD showing bullish divergence on 4H timeframe with institutional volume accumulation.',
      confidence: 87,
      risk: 35,
      type: 'bullish'
    },
    {
      title: 'Risk Alert: High Volatility',
      description: 'Market volatility index elevated. Consider reducing position sizes by 20-30%.',
      confidence: 92,
      risk: 75,
      type: 'warning'
    },
    {
      title: 'Pattern Recognition',
      description: 'Double bottom formation completing on SPY. Potential breakout above $485 resistance.',
      confidence: 78,
      risk: 45,
      type: 'neutral'
    }
  ];

  const currentInsight = aiInsights[aiInsight];
  const weeklyChange = analytics?.weeklyChange || 3.2;
  const isPositive = weeklyChange >= 0;

  return (
    <div className="min-h-screen px-6 py-6 fade-in">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* HERO SECTION */}
        <div className="relative overflow-hidden rounded-3xl hero-gradient border border-white/10">
          {/* Animated Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px]" />
          </div>

          {/* Grid Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03]" style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }} />

          <div className="relative z-10 p-8 pb-32">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                    isPositive
                      ? 'bg-emerald-500/20 border border-emerald-500/30'
                      : 'bg-rose-500/20 border border-rose-500/30'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-rose-400" />
                    )}
                    <span className={`text-lg font-bold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{weeklyChange}% This Week
                    </span>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10">
                    <Cpu className="w-4 h-4 text-indigo-400" />
                    <span className="text-sm text-gray-300">AI-Powered</span>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                  Welcome back, <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">{user?.username || 'Trader'}</span>
                </h1>
                <p className="text-sm text-gray-400 max-w-xl mb-5">
                  Your portfolio is performing above market average. Keep the momentum going.
                </p>

                <div className="flex gap-4">
                  <button
                    onClick={() => navigate('/strategies')}
                    className="btn-glow flex items-center gap-2 text-white"
                  >
                    <Sparkles className="w-5 h-5" />
                    AI Analysis
                  </button>
                  <button
                    onClick={() => navigate('/analytics')}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white font-semibold hover:bg-white/20 transition-all duration-300"
                  >
                    <BarChart3 className="w-5 h-5" />
                    View Analytics
                  </button>
                </div>
              </div>

              {/* Mini Equity Chart */}
              <div className="hidden lg:block w-80 h-40">
                <div className="text-xs text-gray-500 mb-2 flex items-center justify-between">
                  <span>EQUITY CURVE</span>
                  <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                    ${analytics?.totalProfit >= 0 ? '+' : ''}{(analytics?.totalProfit || 1240).toFixed(0)} today
                  </span>
                </div>
                <EquityCurve />
              </div>
            </div>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-4 gap-4 -mt-20 relative z-20 stagger-children">
          {/* Total Trades */}
          <div className="glass-card group cursor-pointer" onClick={() => navigate('/trade-history')}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Trades</p>
                <p className="stat-number text-white">{analytics?.totalTrades || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-6 h-6 text-indigo-400" />
              </div>
            </div>
            <div className="h-8 -mx-2 -mb-2">
              <MiniSparkline color="#6366F1" data={[20, 25, 22, 30, 28, 35, 40, 38, 45, 42, 50, 48]} />
            </div>
          </div>

          {/* Win Rate */}
          <div className="glass-card glass-card-glow group cursor-pointer" onClick={() => navigate('/analytics')}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Win Rate</p>
                <p className="stat-number-profit">{analytics?.winRate || 0}%</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div className="h-8 -mx-2 -mb-2">
              <MiniSparkline color="#00FF9C" data={[60, 58, 65, 62, 68, 70, 67, 72, 75, 73, 78, 76]} />
            </div>
          </div>

          {/* Profit Factor */}
          <div className="glass-card group cursor-pointer" onClick={() => navigate('/analytics')}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Profit Factor</p>
                <p className="stat-number text-cyan-400">{analytics?.profitFactor || '0.00'}</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Award className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
            <div className="h-8 -mx-2 -mb-2">
              <MiniSparkline color="#06B6D4" data={[1.2, 1.3, 1.1, 1.4, 1.5, 1.3, 1.6, 1.8, 1.7, 1.9, 2.0, 1.95]} />
            </div>
          </div>

          {/* Total P/L */}
          <div className="glass-card group cursor-pointer" onClick={() => navigate('/analytics')}>
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total P/L</p>
                <p className={analytics?.totalProfit >= 0 ? 'stat-number-profit' : 'stat-number-loss'}>
                  {analytics?.totalProfit >= 0 ? '+' : '-'}${Math.abs(analytics?.totalProfit || 0).toFixed(0)}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${
                analytics?.totalProfit >= 0 ? 'bg-emerald-500/20' : 'bg-rose-500/20'
              }`}>
                <TrendingUp className={`w-6 h-6 ${analytics?.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`} />
              </div>
            </div>
            <div className="h-8 -mx-2 -mb-2">
              <MiniSparkline
                color={analytics?.totalProfit >= 0 ? '#00FF9C' : '#FF4D6D'}
                data={[100, 120, 90, 150, 140, 180, 220, 200, 280, 260, 320, 300]}
              />
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-3 gap-6">
          {/* Trading Mode Cards - Left 2 columns */}
          <div className="col-span-2 space-y-6">
            {/* Trading Modes */}
            <div className="grid grid-cols-2 gap-4">
              {/* Swing Trading */}
              <div
                onClick={() => navigate('/swing-trading')}
                className="group relative glass-card cursor-pointer overflow-hidden"
              >
                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-2xl" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(16, 185, 129, 0.3), transparent)',
                    animation: 'shimmer 2s infinite'
                  }} />
                </div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30 group-hover:scale-110 group-hover:shadow-emerald-500/50 transition-all duration-300">
                      <TrendingUp className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="badge-success flex items-center gap-1.5">
                        <Cpu className="w-3 h-3" />
                        AI Ready
                      </span>
                      <span className="text-xs text-gray-500">89% confidence</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 drop-shadow-lg">Swing Trading</h3>
                  <p className="text-gray-300 text-sm mb-6">Multi-day positions with AI-optimized entries</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-emerald-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                      Start Analysis
                      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
                      <div className="w-6 h-6 rounded-full bg-emerald-500/30 border border-emerald-500/50" />
                      <div className="w-6 h-6 rounded-full bg-emerald-500/30 border border-emerald-500/50 flex items-center justify-center text-[10px] text-emerald-400">+2k</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scalp Trading */}
              <div
                onClick={() => navigate('/scalp-trading')}
                className="group relative glass-card cursor-pointer overflow-hidden"
              >
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 rounded-2xl" style={{
                    background: 'linear-gradient(90deg, transparent, rgba(249, 115, 22, 0.3), transparent)',
                    animation: 'shimmer 2s infinite'
                  }} />
                </div>

                <div className="relative">
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30 group-hover:scale-110 group-hover:shadow-orange-500/50 transition-all duration-300">
                      <Zap className="w-8 h-8 text-white" />
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center gap-1">
                        <Flame className="w-3 h-3" />
                        Hot
                      </span>
                      <span className="text-xs text-gray-500">Quick profits</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-2 drop-shadow-lg">Scalp Trading</h3>
                  <p className="text-gray-300 text-sm mb-6">Rapid execution with real-time AI signals</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-orange-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                      Start Scalping
                      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      Live
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics & Journal */}
            <div className="grid grid-cols-2 gap-4">
              {/* Analytics Card */}
              <div
                onClick={() => navigate('/analytics')}
                className="group glass-card cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30 group-hover:scale-110 transition-transform duration-300">
                    <BarChart3 className="w-7 h-7 text-white" />
                  </div>
                  <span className="badge-info flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Insights
                  </span>
                </div>

                {/* Mini Chart Preview */}
                <div className="h-20 mb-4 rounded-xl bg-white/5 overflow-hidden">
                  <MiniSparkline color="#8B5CF6" height={80} data={[30, 45, 35, 55, 40, 60, 50, 70, 65, 80, 75, 90]} />
                </div>

                <h3 className="text-base font-bold text-white mb-1 drop-shadow-lg">Analytics</h3>
                <p className="text-gray-300 text-sm mb-4">Deep performance insights</p>

                <div className="flex items-center text-violet-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                  View Analytics
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>

              {/* Journal Card */}
              <div
                onClick={() => navigate('/journal')}
                className="group glass-card cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform duration-300">
                    <BookOpen className="w-7 h-7 text-white" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-pink-500/20 text-pink-400 border border-pink-500/30 flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Essential
                  </span>
                </div>

                {/* Recent Trades Preview */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-xs text-gray-400">EURUSD</span>
                    <span className="text-xs text-emerald-400">+$124</span>
                  </div>
                  <div className="flex items-center justify-between p-2 rounded-lg bg-white/5">
                    <span className="text-xs text-gray-400">BTCUSD</span>
                    <span className="text-xs text-rose-400">-$45</span>
                  </div>
                </div>

                <h3 className="text-base font-bold text-white mb-1 drop-shadow-lg">Trade Journal</h3>
                <p className="text-gray-300 text-sm mb-4">Log and review trades</p>

                <div className="flex items-center text-pink-400 font-semibold group-hover:gap-3 gap-2 transition-all">
                  Open Journal
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* AI Market Insight */}
            <div className="glass-card relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-full blur-3xl" />

              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-white">AI Market Insight</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          i === aiInsight ? 'bg-indigo-400 w-4' : 'bg-white/20'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    {currentInsight.type === 'bullish' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                    {currentInsight.type === 'warning' && <AlertTriangle className="w-4 h-4 text-amber-400" />}
                    {currentInsight.type === 'neutral' && <LineChart className="w-4 h-4 text-blue-400" />}
                    <h4 className="font-bold text-white">{currentInsight.title}</h4>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{currentInsight.description}</p>
                </div>

                {/* Confidence & Risk */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Confidence</span>
                      <span className="text-sm font-bold text-emerald-400">{currentInsight.confidence}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-500"
                        style={{ width: `${currentInsight.confidence}%` }}
                      />
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Risk Level</span>
                      <span className={`text-sm font-bold ${
                        currentInsight.risk > 60 ? 'text-rose-400' : currentInsight.risk > 40 ? 'text-amber-400' : 'text-emerald-400'
                      }`}>{currentInsight.risk}%</span>
                    </div>
                    <div className="risk-bar">
                      <div
                        className="risk-bar-fill"
                        style={{ width: `${currentInsight.risk}%` }}
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => navigate('/strategies')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400 font-semibold hover:from-indigo-500/30 hover:to-purple-500/30 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  Get Full Analysis
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Community Panel */}
            <div className="glass-card">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-white">Community</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-green-400">{tradersOnline} online</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-white">Market Sentiment</span>
                    <span className="text-xs text-emerald-400 ml-2">Bullish</span>
                  </div>
                  <Percent className="w-4 h-4 text-gray-500" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-violet-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-white">New pattern guide</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors cursor-pointer">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <span className="text-sm text-white">Weekly challenge</span>
                    <span className="text-xs text-amber-400 ml-2">Live</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </div>
              </div>

              <button
                onClick={() => navigate('/learning')}
                className="w-full mt-4 py-3 rounded-xl border border-white/10 text-gray-400 text-sm font-medium hover:bg-white/5 hover:border-white/20 hover:text-white transition-all duration-300"
              >
                Explore Community
              </button>
            </div>
          </div>
        </div>
      </div>

        {/* LIVE CHARTS SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="lg:col-span-2 glass-card p-0 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <LineChart className="w-4 h-4 text-indigo-400" />
                Live Chart
              </h3>
            </div>
            <TradingViewAdvancedChart
              symbol="NASDAQ:SPY"
              theme="dark"
              height={400}
            />
          </div>

          {/* Market Overview */}
          <div className="glass-card p-0 overflow-hidden">
            <div className="p-4 border-b border-white/10">
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Markets
              </h3>
            </div>
            <TradingViewMarketOverview
              theme="dark"
              height={400}
              showChart={true}
            />
          </div>
        </div>

        {/* Ticker Tape */}
        <div className="glass-card p-2 overflow-hidden">
          <TradingViewTicker theme="dark" />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      ` }} />
    </div>
  );
}
