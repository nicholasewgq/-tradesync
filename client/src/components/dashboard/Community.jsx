import { Users, MessageSquare, Award, Star } from 'lucide-react';
import { Card } from '../ui/Card';

const communityStats = [
  { icon: Users, label: 'Active Traders', value: '2,847' },
  { icon: MessageSquare, label: 'Discussions', value: '1,234' },
  { icon: Award, label: 'Top Performers', value: '156' },
  { icon: Star, label: 'Rating', value: '4.9' }
];

const recentActivity = [
  { user: 'Alex T.', action: 'shared a winning strategy', time: '2h ago' },
  { user: 'Sarah M.', action: 'hit 70% win rate milestone', time: '4h ago' },
  { user: 'Mike R.', action: 'posted market analysis', time: '6h ago' }
];

export function Community() {
  return (
    <Card className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Community Highlights
      </h3>

      <div className="grid grid-cols-4 gap-4 mb-6">
        {communityStats.map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mx-auto mb-2">
              <Icon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Recent Activity</h4>
        {recentActivity.map(({ user, action, time }, index) => (
          <div
            key={index}
            className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
              {user.charAt(0)}
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 dark:text-white">
                <span className="font-medium">{user}</span> {action}
              </p>
            </div>
            <span className="text-xs text-gray-400">{time}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
