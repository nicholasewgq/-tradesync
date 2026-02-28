import { TrendingUp, Zap, Clock, Target } from 'lucide-react';
import { Card } from '../ui/Card';

const features = [
  {
    icon: TrendingUp,
    title: 'Swing Trading',
    description: 'Track multi-day positions',
    color: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20'
  },
  {
    icon: Zap,
    title: 'Scalp Trading',
    description: 'Log quick intraday trades',
    color: 'from-orange-500 to-yellow-500',
    bg: 'bg-orange-50 dark:bg-orange-900/20'
  },
  {
    icon: Clock,
    title: 'Real-time Tracking',
    description: 'Monitor open positions',
    color: 'from-green-500 to-emerald-500',
    bg: 'bg-green-50 dark:bg-green-900/20'
  },
  {
    icon: Target,
    title: 'Goal Setting',
    description: 'Set and track targets',
    color: 'from-purple-500 to-pink-500',
    bg: 'bg-purple-50 dark:bg-purple-900/20'
  }
];

export function FeatureCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {features.map(({ icon: Icon, title, description, color, bg }) => (
        <Card key={title} hover className={bg}>
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </Card>
      ))}
    </div>
  );
}
