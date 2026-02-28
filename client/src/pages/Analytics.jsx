import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import { Card, CardTitle } from '../components/ui/Card';
import { EquityCurve } from '../components/analytics/EquityCurve';
import { WinLossChart } from '../components/analytics/WinLossChart';
import { MonthlyPerformance } from '../components/analytics/MonthlyPerformance';
import { TrendingUp, TrendingDown, Target, Percent, DollarSign, BarChart2, Activity, Award, Zap } from 'lucide-react';

export function Analytics() {
  const [summary, setSummary] = useState(null);
  const [equity, setEquity] = useState([]);
  const [monthly, setMonthly] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, equityRes, monthlyRes] = await Promise.all([
          api.get('/analytics/summary'),
          api.get('/analytics/equity'),
          api.get('/analytics/monthly')
        ]);

        setSummary(summaryRes.data);
        setEquity(equityRes.data);
        setMonthly(monthlyRes.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-10 w-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
            <div className="h-80 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      icon: DollarSign,
      label: 'Total P/L',
      value: summary?.totalProfit >= 0
        ? `+$${summary?.totalProfit?.toFixed(2)}`
        : `-$${Math.abs(summary?.totalProfit || 0).toFixed(2)}`,
      color: summary?.totalProfit >= 0 ? 'emerald' : 'red',
      gradient: summary?.totalProfit >= 0 ? 'from-emerald-500 to-teal-500' : 'from-red-500 to-rose-500'
    },
    {
      icon: Percent,
      label: 'Win Rate',
      value: `${summary?.winRate || 0}%`,
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Target,
      label: 'Profit Factor',
      value: summary?.profitFactor || '0.00',
      color: 'violet',
      gradient: 'from-violet-500 to-purple-500'
    },
    {
      icon: TrendingUp,
      label: 'Average Win',
      value: `$${summary?.avgWin || '0.00'}`,
      color: 'green',
      gradient: 'from-green-500 to-emerald-500'
    },
    {
      icon: TrendingDown,
      label: 'Average Loss',
      value: `$${summary?.avgLoss || '0.00'}`,
      color: 'red',
      gradient: 'from-red-500 to-orange-500'
    },
    {
      icon: Activity,
      label: 'Total Trades',
      value: summary?.totalTrades || 0,
      color: 'indigo',
      gradient: 'from-indigo-500 to-blue-500'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <BarChart2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
            <p className="text-gray-500 dark:text-gray-400">Track your trading performance over time</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map(({ icon: Icon, label, value, color, gradient }) => (
          <div key={label} className="relative group overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-200/50 dark:border-gray-700/50 hover:shadow-lg transition-all duration-300">
            <div className={`absolute top-0 right-0 w-20 h-20 bg-gradient-to-br ${gradient} opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500`} />

            <div className="relative">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <p className={`text-2xl font-bold text-${color}-500`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <EquityCurve data={equity} />
        <WinLossChart wins={summary?.winningTrades || 0} losses={summary?.losingTrades || 0} />
      </div>

      {/* Monthly Performance */}
      <MonthlyPerformance data={monthly} />

      {/* Trading Style Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Swing Trading</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Multi-day positions</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Trades</span>
                <span className="font-bold text-gray-900 dark:text-white">{summary?.swingTrades || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Profit</span>
                <span className={`font-bold ${parseFloat(summary?.swingProfit) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${summary?.swingProfit || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />

          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 dark:text-white">Scalp Trading</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Quick intraday trades</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Trades</span>
                <span className="font-bold text-gray-900 dark:text-white">{summary?.scalpTrades || 0}</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                <span className="text-sm text-gray-500 dark:text-gray-400">Total Profit</span>
                <span className={`font-bold ${parseFloat(summary?.scalpProfit) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  ${summary?.scalpProfit || '0.00'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
