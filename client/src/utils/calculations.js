export function calculateProfitLoss(trade) {
  if (!trade.exit_price) return null;

  const diff = trade.direction === 'long'
    ? trade.exit_price - trade.entry_price
    : trade.entry_price - trade.exit_price;

  return diff * (trade.quantity || 1);
}

export function calculateRiskReward(trade) {
  if (!trade.stop_loss || !trade.take_profit) return null;

  const risk = Math.abs(trade.entry_price - trade.stop_loss);
  const reward = Math.abs(trade.take_profit - trade.entry_price);

  return risk > 0 ? (reward / risk).toFixed(2) : null;
}

export function formatCurrency(value, decimals = 2) {
  if (value === null || value === undefined) return '-';
  const num = parseFloat(value);
  const prefix = num >= 0 ? '+' : '';
  return `${prefix}$${num.toFixed(decimals)}`;
}

export function formatPercentage(value, decimals = 1) {
  if (value === null || value === undefined) return '-';
  return `${parseFloat(value).toFixed(decimals)}%`;
}

export function formatDate(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(dateString) {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}
