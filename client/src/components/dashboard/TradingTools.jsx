import { Calculator, LineChart, FileText, Download } from 'lucide-react';
import { Card } from '../ui/Card';
import { useNavigate } from 'react-router-dom';

const tools = [
  {
    icon: Calculator,
    title: 'Position Calculator',
    description: 'Calculate optimal position size',
    action: 'journal'
  },
  {
    icon: LineChart,
    title: 'Performance Charts',
    description: 'Visualize your trading stats',
    action: 'analytics'
  },
  {
    icon: FileText,
    title: 'Trade Journal',
    description: 'Log and review your trades',
    action: 'journal'
  },
  {
    icon: Download,
    title: 'Export Data',
    description: 'Download your trade history',
    action: 'history'
  }
];

export function TradingTools() {
  const navigate = useNavigate();

  return (
    <Card className="mb-8">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Trading Tools
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {tools.map(({ icon: Icon, title, description, action }) => (
          <button
            key={title}
            onClick={() => navigate(`/${action}`)}
            className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Icon className="w-5 h-5 text-white" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white text-sm">{title}</h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
          </button>
        ))}
      </div>
    </Card>
  );
}
