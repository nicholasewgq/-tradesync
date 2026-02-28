import { TradeCard } from './TradeCard';

export function TradeList({ trades, onEdit, onDelete, loading }) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="card animate-pulse">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gray-200 dark:bg-gray-700" />
              <div className="space-y-2">
                <div className="w-24 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-32 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(j => (
                <div key={j} className="space-y-2">
                  <div className="w-12 h-3 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (trades.length === 0) {
    return (
      <div className="card text-center py-12">
        <p className="text-gray-500 dark:text-gray-400 mb-2">No trades yet</p>
        <p className="text-sm text-gray-400">Add your first trade to get started!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {trades.map(trade => (
        <TradeCard
          key={trade.id}
          trade={trade}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
