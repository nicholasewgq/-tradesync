export function exportTradesToCSV(trades) {
  const headers = [
    'ID',
    'Pair',
    'Type',
    'Direction',
    'Entry Price',
    'Exit Price',
    'Stop Loss',
    'Take Profit',
    'Quantity',
    'Status',
    'Profit/Loss',
    'Risk:Reward',
    'Notes',
    'Created At',
    'Closed At'
  ];

  const rows = trades.map(trade => [
    trade.id,
    trade.pair,
    trade.type,
    trade.direction,
    trade.entry_price,
    trade.exit_price || '',
    trade.stop_loss || '',
    trade.take_profit || '',
    trade.quantity,
    trade.status,
    trade.profit_loss || '',
    trade.risk_reward || '',
    `"${(trade.notes || '').replace(/"/g, '""')}"`,
    trade.created_at,
    trade.closed_at || ''
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `trades_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
