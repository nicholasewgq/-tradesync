import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Card, CardTitle } from '../ui/Card';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function MonthlyPerformance({ data }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const formatMonth = (monthStr) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  };

  const chartData = {
    labels: data.map(d => formatMonth(d.month)),
    datasets: [
      {
        label: 'Profit/Loss',
        data: data.map(d => d.profit),
        backgroundColor: data.map(d =>
          d.profit >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'
        ),
        borderRadius: 6,
        borderSkipped: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDark ? '#374151' : '#ffffff',
        titleColor: isDark ? '#f9fafb' : '#111827',
        bodyColor: isDark ? '#d1d5db' : '#4b5563',
        borderColor: isDark ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const value = context.parsed.y;
            const prefix = value >= 0 ? '+' : '';
            const monthData = data[context.dataIndex];
            return [
              `P/L: ${prefix}$${value.toFixed(2)}`,
              `Trades: ${monthData.trades}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280'
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)'
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          callback: (value) => `$${value}`
        }
      }
    }
  };

  return (
    <Card>
      <CardTitle>Monthly Performance</CardTitle>
      <div className="h-64 mt-4">
        {data.length > 0 ? (
          <Bar data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            No monthly data yet
          </div>
        )}
      </div>
    </Card>
  );
}
