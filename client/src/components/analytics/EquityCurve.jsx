import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Card, CardTitle } from '../ui/Card';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function EquityCurve({ data }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const chartData = {
    labels: data.map((_, i) => i === 0 ? 'Start' : `Trade ${i}`),
    datasets: [
      {
        label: 'Equity',
        data: data.map(d => d.equity),
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#6366f1',
        pointBorderColor: isDark ? '#1f2937' : '#ffffff',
        pointBorderWidth: 2
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
        padding: 12,
        displayColors: false,
        callbacks: {
          label: (context) => `Equity: $${context.parsed.y.toFixed(2)}`
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.8)'
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
      <CardTitle>Equity Curve</CardTitle>
      <div className="h-64 mt-4">
        {data.length > 1 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            Complete more trades to see your equity curve
          </div>
        )}
      </div>
    </Card>
  );
}
