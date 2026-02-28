import { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  Calendar,
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Brain,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Shield,
  PieChart,
  LineChart
} from 'lucide-react';
import { api } from '../utils/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function AdvancedAnalytics() {
  const [summary, setSummary] = useState(null);
  const [equityData, setEquityData] = useState(null);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [tickerData, setTickerData] = useState([]);
  const [timeframeData, setTimeframeData] = useState([]);
  const [strategyData, setStrategyData] = useState([]);
  const [correlationData, setCorrelationData] = useState([]);
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [
        summaryRes,
        equityRes,
        monthlyRes,
        weeklyRes,
        heatmapRes,
        tickerRes,
        timeframeRes,
        strategyRes,
        correlationRes,
        insightsRes
      ] = await Promise.allSettled([
        api.get('/analytics/summary'),
        api.get('/analytics/equity'),
        api.get('/analytics/monthly'),
        api.get('/analytics/weekly'),
        api.get('/analytics/heatmap'),
        api.get('/analytics/by-ticker'),
        api.get('/analytics/by-timeframe'),
        api.get('/analytics/by-strategy'),
        api.get('/analytics/compliance-correlation'),
        api.get('/analytics/insights')
      ]);

      if (summaryRes.status === 'fulfilled') setSummary(summaryRes.value.data);
      if (equityRes.status === 'fulfilled') setEquityData(equityRes.value.data);
      if (monthlyRes.status === 'fulfilled') setMonthlyData(monthlyRes.value.data);
      if (weeklyRes.status === 'fulfilled') setWeeklyData(weeklyRes.value.data);
      if (heatmapRes.status === 'fulfilled') setHeatmapData(heatmapRes.value.data);
      if (tickerRes.status === 'fulfilled') setTickerData(tickerRes.value.data);
      if (timeframeRes.status === 'fulfilled') setTimeframeData(timeframeRes.value.data);
      if (strategyRes.status === 'fulfilled') setStrategyData(strategyRes.value.data);
      if (correlationRes.status === 'fulfilled') setCorrelationData(correlationRes.value.data);
      if (insightsRes.status === 'fulfilled') setInsights(insightsRes.value.data.insights || []);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Equity curve chart config
  const equityChartData = {
    labels: equityData?.curve?.map(d => d.date ? new Date(d.date).toLocaleDateString() : 'Start') || [],
    datasets: [
      {
        label: 'Equity',
        data: equityData?.curve?.map(d => d.equity) || [],
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6
      },
      {
        label: 'Peak',
        data: equityData?.curve?.map(d => d.peak) || [],
        borderColor: 'rgba(99, 102, 241, 0.5)',
        borderDash: [5, 5],
        fill: false,
        tension: 0.4,
        pointRadius: 0
      }
    ]
  };

  const equityChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#9ca3af' }
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#9ca3af', maxTicksLimit: 10 }
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.05)' },
        ticks: { color: '#9ca3af', callback: v => `$${v}` }
      }
    }
  };

  // Monthly P&L chart
  const monthlyChartData = {
    labels: monthlyData.map(d => d.month),
    datasets: [{
      label: 'P&L',
      data: monthlyData.map(d => d.profit),
      backgroundColor: monthlyData.map(d => d.profit >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(244, 63, 94, 0.8)'),
      borderRadius: 8
    }]
  };

  // Weekly chart
  const weeklyChartData = {
    labels: weeklyData.map(d => d.week),
    datasets: [{
      label: 'P&L',
      data: weeklyData.map(d => d.profit),
      backgroundColor: weeklyData.map(d => d.profit >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(244, 63, 94, 0.8)'),
      borderRadius: 6
    }]
  };

  // Win/Loss distribution
  const winLossData = {
    labels: ['Wins', 'Losses', 'Breakeven'],
    datasets: [{
      data: [
        summary?.winningTrades || 0,
        summary?.losingTrades || 0,
        (summary?.totalTrades || 0) - (summary?.winningTrades || 0) - (summary?.losingTrades || 0)
      ],
      backgroundColor: ['#10b981', '#f43f5e', '#6b7280'],
      borderWidth: 0
    }]
  };

  // Get heatmap cell color
  const getHeatmapColor = (profit, trades) => {
    if (trades === 0) return 'bg-white/5';
    if (profit > 100) return 'bg-emerald-500/80';
    if (profit > 50) return 'bg-emerald-500/60';
    if (profit > 0) return 'bg-emerald-500/40';
    if (profit > -50) return 'bg-rose-500/40';
    if (profit > -100) return 'bg-rose-500/60';
    return 'bg-rose-500/80';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-indigo-500/30 rounded-full" />
            <div className="absolute inset-0 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative p-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <BarChart3 className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Advanced Analytics</h1>
              <p className="text-white/80 text-lg">Deep insights into your trading performance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-2 flex gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: Activity },
          { id: 'equity', label: 'Equity Curve', icon: LineChart },
          { id: 'breakdown', label: 'Breakdown', icon: PieChart },
          { id: 'heatmap', label: 'Time Analysis', icon: Calendar },
          { id: 'insights', label: 'AI Insights', icon: Brain }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 fade-in">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="text-gray-400 text-sm">Total P&L</span>
              </div>
              <p className={`text-3xl font-black ${summary?.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${summary?.totalProfit?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="glass-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                  <Target className="w-5 h-5 text-blue-400" />
                </div>
                <span className="text-gray-400 text-sm">Win Rate</span>
              </div>
              <p className="text-3xl font-black text-white">{summary?.winRate || 0}%</p>
            </div>

            <div className="glass-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <span className="text-gray-400 text-sm">Profit Factor</span>
              </div>
              <p className="text-3xl font-black text-white">{summary?.profitFactor || '0'}</p>
            </div>

            <div className="glass-card">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
                  <Award className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-gray-400 text-sm">Expectancy</span>
              </div>
              <p className={`text-3xl font-black ${summary?.expectancy >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${summary?.expectancy || '0'}
              </p>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="glass-card text-center">
              <p className="text-gray-500 text-xs mb-1">Total Trades</p>
              <p className="text-2xl font-bold text-white">{summary?.totalTrades || 0}</p>
            </div>
            <div className="glass-card text-center">
              <p className="text-gray-500 text-xs mb-1">Avg Win</p>
              <p className="text-2xl font-bold text-emerald-400">${summary?.avgWin || 0}</p>
            </div>
            <div className="glass-card text-center">
              <p className="text-gray-500 text-xs mb-1">Avg Loss</p>
              <p className="text-2xl font-bold text-rose-400">${summary?.avgLoss || 0}</p>
            </div>
            <div className="glass-card text-center">
              <p className="text-gray-500 text-xs mb-1">Largest Win</p>
              <p className="text-2xl font-bold text-emerald-400">${summary?.largestWin || 0}</p>
            </div>
            <div className="glass-card text-center">
              <p className="text-gray-500 text-xs mb-1">Largest Loss</p>
              <p className="text-2xl font-bold text-rose-400">${summary?.largestLoss || 0}</p>
            </div>
            <div className="glass-card text-center">
              <p className="text-gray-500 text-xs mb-1">Avg Hold Time</p>
              <p className="text-2xl font-bold text-white">{summary?.averageHoldTime || 0}h</p>
            </div>
          </div>

          {/* Streaks */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                <Flame className="w-8 h-8 text-emerald-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Max Consecutive Wins</p>
                <p className="text-4xl font-black text-emerald-400">{summary?.maxConsecutiveWins || 0}</p>
              </div>
            </div>
            <div className="glass-card flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-rose-400" />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Max Consecutive Losses</p>
                <p className="text-4xl font-black text-rose-400">{summary?.maxConsecutiveLosses || 0}</p>
              </div>
            </div>
          </div>

          {/* Win/Loss Distribution */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card">
              <h3 className="font-bold text-white mb-4">Win/Loss Distribution</h3>
              <div className="h-64">
                <Doughnut
                  data={winLossData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: { color: '#9ca3af' }
                      }
                    }
                  }}
                />
              </div>
            </div>

            <div className="glass-card">
              <h3 className="font-bold text-white mb-4">Monthly Performance</h3>
              <div className="h-64">
                <Bar
                  data={monthlyChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                      x: {
                        grid: { display: false },
                        ticks: { color: '#9ca3af' }
                      },
                      y: {
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        ticks: { color: '#9ca3af', callback: v => `$${v}` }
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Equity Curve Tab */}
      {activeTab === 'equity' && (
        <div className="space-y-6 fade-in">
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-lg">Equity Curve</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-sm text-gray-400">Equity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-indigo-500" />
                  <span className="text-sm text-gray-400">Peak</span>
                </div>
              </div>
            </div>
            <div className="h-80">
              <Line data={equityChartData} options={equityChartOptions} />
            </div>
          </div>

          {/* Drawdown Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="glass-card">
              <p className="text-gray-400 text-sm mb-2">Current Equity</p>
              <p className={`text-3xl font-black ${equityData?.currentEquity >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                ${equityData?.currentEquity?.toLocaleString() || '0'}
              </p>
            </div>
            <div className="glass-card">
              <p className="text-gray-400 text-sm mb-2">Max Drawdown</p>
              <p className="text-3xl font-black text-rose-400">
                {equityData?.maxDrawdown || 0}%
              </p>
            </div>
            <div className="glass-card">
              <p className="text-gray-400 text-sm mb-2">Recovery Factor</p>
              <p className="text-3xl font-black text-white">
                {equityData?.maxDrawdown > 0
                  ? (equityData.currentEquity / (equityData.currentEquity * equityData.maxDrawdown / 100)).toFixed(2)
                  : '∞'}
              </p>
            </div>
          </div>

          {/* Weekly Performance */}
          <div className="glass-card">
            <h3 className="font-bold text-white mb-4">Weekly Performance (Last 12 Weeks)</h3>
            <div className="h-64">
              <Bar
                data={weeklyChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: {
                      grid: { display: false },
                      ticks: { color: '#9ca3af' }
                    },
                    y: {
                      grid: { color: 'rgba(255,255,255,0.05)' },
                      ticks: { color: '#9ca3af', callback: v => `$${v}` }
                    }
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Breakdown Tab */}
      {activeTab === 'breakdown' && (
        <div className="space-y-6 fade-in">
          {/* By Ticker */}
          <div className="glass-card">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              Performance by Ticker
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium">Ticker</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Trades</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Win Rate</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Total P&L</th>
                    <th className="text-right py-3 px-4 text-gray-400 font-medium">Avg P&L</th>
                  </tr>
                </thead>
                <tbody>
                  {tickerData.map((t, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5">
                      <td className="py-3 px-4 font-bold text-white">{t.ticker}</td>
                      <td className="py-3 px-4 text-right text-gray-300">{t.trades}</td>
                      <td className="py-3 px-4 text-right">
                        <span className={`px-2 py-1 rounded-lg text-sm font-medium ${
                          parseFloat(t.winRate) >= 50
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-rose-500/20 text-rose-400'
                        }`}>
                          {t.winRate}%
                        </span>
                      </td>
                      <td className={`py-3 px-4 text-right font-bold ${t.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${t.totalProfit}
                      </td>
                      <td className={`py-3 px-4 text-right ${t.avgProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${t.avgProfit}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* By Timeframe & Strategy */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-purple-400" />
                By Timeframe
              </h3>
              <div className="space-y-3">
                {timeframeData.map((t, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <p className="font-bold text-white">{t.timeframe || 'Unknown'}</p>
                      <p className="text-sm text-gray-500">{t.trades} trades</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${t.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${t.totalProfit}
                      </p>
                      <p className="text-sm text-gray-500">{t.winRate}% win</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                By Strategy
              </h3>
              <div className="space-y-3">
                {strategyData.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl">
                    <div>
                      <p className="font-bold text-white">{s.strategy}</p>
                      <p className="text-sm text-gray-500">{s.trades} trades</p>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${s.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        ${s.totalProfit}
                      </p>
                      <p className="text-sm text-gray-500">{s.winRate}% win</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Compliance Correlation */}
          <div className="glass-card">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Brain className="w-5 h-5 text-amber-400" />
              Strategy Compliance vs Profitability
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {correlationData.map((c, i) => (
                <div key={i} className="p-4 bg-white/5 rounded-xl text-center">
                  <p className="text-gray-400 text-sm mb-2">{c.range}</p>
                  <p className={`text-2xl font-bold ${c.totalProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${c.totalProfit}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{c.trades} trades • {c.winRate}%</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Heatmap Tab */}
      {activeTab === 'heatmap' && (
        <div className="space-y-6 fade-in">
          <div className="glass-card">
            <h3 className="font-bold text-white mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cyan-400" />
              Trading Heatmap (Day & Hour)
            </h3>

            <div className="overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Hour labels */}
                <div className="flex mb-2">
                  <div className="w-16" />
                  {Array.from({ length: 24 }, (_, i) => (
                    <div key={i} className="flex-1 text-center text-xs text-gray-500">
                      {i.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>

                {/* Grid */}
                {days.map((day, dayIndex) => (
                  <div key={day} className="flex items-center mb-1">
                    <div className="w-16 text-sm text-gray-400">{day}</div>
                    {Array.from({ length: 24 }, (_, hour) => {
                      const cell = heatmapData.find(
                        d => d.day === dayIndex && d.hour === hour
                      );
                      return (
                        <div
                          key={hour}
                          className={`flex-1 h-8 mx-0.5 rounded-sm ${getHeatmapColor(cell?.profit || 0, cell?.trades || 0)} cursor-pointer transition-all hover:scale-110`}
                          title={`${day} ${hour}:00 - P&L: $${cell?.profit || 0} (${cell?.trades || 0} trades)`}
                        />
                      );
                    })}
                  </div>
                ))}

                {/* Legend */}
                <div className="flex items-center justify-center gap-4 mt-6">
                  <span className="text-xs text-gray-500">Loss</span>
                  <div className="flex gap-1">
                    <div className="w-6 h-4 rounded bg-rose-500/80" />
                    <div className="w-6 h-4 rounded bg-rose-500/60" />
                    <div className="w-6 h-4 rounded bg-rose-500/40" />
                    <div className="w-6 h-4 rounded bg-white/5" />
                    <div className="w-6 h-4 rounded bg-emerald-500/40" />
                    <div className="w-6 h-4 rounded bg-emerald-500/60" />
                    <div className="w-6 h-4 rounded bg-emerald-500/80" />
                  </div>
                  <span className="text-xs text-gray-500">Profit</span>
                </div>
              </div>
            </div>
          </div>

          {/* Best/Worst Times */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-card">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Best Trading Times
              </h3>
              <div className="space-y-2">
                {heatmapData
                  .filter(d => d.trades > 0)
                  .sort((a, b) => b.profit - a.profit)
                  .slice(0, 5)
                  .map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                      <span className="text-white">
                        {days[d.day]} {d.hour.toString().padStart(2, '0')}:00
                      </span>
                      <span className="text-emerald-400 font-bold">${d.profit.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="glass-card">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-400" />
                Worst Trading Times
              </h3>
              <div className="space-y-2">
                {heatmapData
                  .filter(d => d.trades > 0)
                  .sort((a, b) => a.profit - b.profit)
                  .slice(0, 5)
                  .map((d, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl">
                      <span className="text-white">
                        {days[d.day]} {d.hour.toString().padStart(2, '0')}:00
                      </span>
                      <span className="text-rose-400 font-bold">${d.profit.toFixed(2)}</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-6 fade-in">
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center">
                <Brain className="w-6 h-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">AI-Powered Insights</h3>
                <p className="text-gray-400 text-sm">Personalized recommendations based on your trading data</p>
              </div>
            </div>

            <div className="space-y-4">
              {insights.length > 0 ? insights.map((insight, i) => (
                <div
                  key={i}
                  className={`p-5 rounded-xl border ${
                    insight.type === 'success'
                      ? 'bg-emerald-500/10 border-emerald-500/30'
                      : insight.type === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/30'
                      : 'bg-blue-500/10 border-blue-500/30'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      insight.type === 'success'
                        ? 'bg-emerald-500/30'
                        : insight.type === 'warning'
                        ? 'bg-amber-500/30'
                        : 'bg-blue-500/30'
                    }`}>
                      {insight.type === 'success' ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : insight.type === 'warning' ? (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      ) : (
                        <Zap className="w-5 h-5 text-blue-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">{insight.title}</h4>
                      <p className="text-gray-300">{insight.message}</p>
                    </div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-10">
                  <Brain className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">Complete more trades to get AI insights</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
