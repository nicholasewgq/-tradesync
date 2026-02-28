import { TrendingUp, TrendingDown, Target, Percent } from 'lucide-react';
import { Card } from '../ui/Card';

export function MetricsCards({ analytics }) {
  const metrics = [
    {
      icon: TrendingUp,
      label: 'Total Profit',
      value: analytics?.totalProfit >= 0
        ? `+$${analytics?.totalProfit?.toFixed(2) || '0.00'}`
        : `-$${Math.abs(analytics?.totalProfit || 0).toFixed(2)}`,
      change: analytics?.totalProfit >= 0 ? 'positive' : 'negative',
      color: analytics?.totalProfit >= 0 ? 'text-green-500' : 'text-red-500'
    },
    {
      icon: Percent,
      label: 'Win Rate',
      value: `${analytics?.winRate || 0}%`,
      subtitle: `${analytics?.winningTrades || 0}W / ${analytics?.losingTrades || 0}L`,
      color: 'text-blue-500'
    },
    {
      icon: Target,
      label: 'Profit Factor',
      value: analytics?.profitFactor || '0.00',
      subtitle: 'Risk-adjusted return',
      color: 'text-purple-500'
    },
    {
      icon: TrendingDown,
      label: 'Total Trades',
      value: analytics?.totalTrades || 0,
      subtitle: `${analytics?.openTrades || 0} open`,
      color: 'text-indigo-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {metrics.map(({ icon: Icon, label, value, subtitle, color, change }) => (
        <Card key={label}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
              <p className={`text-2xl font-bold ${color}`}>{value}</p>
              {subtitle && (
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
            <div className={`w-10 h-10 rounded-lg ${color} bg-opacity-10 flex items-center justify-center`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
