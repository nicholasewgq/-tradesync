import { Calendar, TrendingUp } from 'lucide-react';

export function GreetingSection() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-2">
        <Calendar className="w-4 h-4" />
        <span className="text-sm">{today}</span>
      </div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
        Welcome to your Trading Dashboard
      </h2>
      <p className="text-gray-600 dark:text-gray-400">
        Track your trades, analyze performance, and improve your strategy.
      </p>
    </div>
  );
}
