import { Edit2, Trash2, TrendingUp, TrendingDown } from 'lucide-react';
import { Card } from '../ui/Card';
import { formatCurrency, formatDateTime } from '../../utils/calculations';

export function TradeCard({ trade, onEdit, onDelete }) {
  const isProfit = trade.profit_loss > 0;
  const isLoss = trade.profit_loss < 0;
  const isLong = trade.direction === 'long';

  return (
    <Card className="relative overflow-hidden">
      {trade.status === 'closed' && (
        <div
          className={`absolute top-0 left-0 w-1 h-full ${
            isProfit ? 'bg-green-500' : isLoss ? 'bg-red-500' : 'bg-gray-400'
          }`}
        />
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              isLong
                ? 'bg-green-100 dark:bg-green-900/30 text-green-600'
                : 'bg-red-100 dark:bg-red-900/30 text-red-600'
            }`}
          >
            {isLong ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">{trade.pair}</h4>
            <div className="flex items-center gap-2 text-sm">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  isLong
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                    : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                }`}
              >
                {trade.direction.toUpperCase()}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  trade.type === 'swing'
                    ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    : 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400'
                }`}
              >
                {trade.type.toUpperCase()}
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  trade.status === 'open'
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400'
                }`}
              >
                {trade.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(trade)}
            className="p-2 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(trade.id)}
            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Entry</p>
          <p className="font-medium text-gray-900 dark:text-white">${trade.entry_price}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">Exit</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {trade.exit_price ? `$${trade.exit_price}` : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">R:R</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {trade.risk_reward ? `1:${trade.risk_reward}` : '-'}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-500 dark:text-gray-400">P/L</p>
          <p
            className={`font-bold ${
              isProfit ? 'text-green-500' : isLoss ? 'text-red-500' : 'text-gray-500'
            }`}
          >
            {trade.profit_loss ? formatCurrency(trade.profit_loss) : '-'}
          </p>
        </div>
      </div>

      {trade.notes && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">{trade.notes}</p>
      )}

      <div className="text-xs text-gray-400">
        {formatDateTime(trade.created_at)}
      </div>
    </Card>
  );
}
