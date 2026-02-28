import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Card, CardTitle } from '../ui/Card';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

export function WinLossChart({ wins, losses }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const total = wins + losses;

  const data = {
    labels: ['Wins', 'Losses'],
    datasets: [
      {
        data: [wins, losses],
        backgroundColor: ['#10b981', '#ef4444'],
        borderColor: isDark ? '#1f2937' : '#ffffff',
        borderWidth: 3,
        hoverOffset: 4
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '70%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: isDark ? '#d1d5db' : '#4b5563',
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#374151' : '#ffffff',
        titleColor: isDark ? '#f9fafb' : '#111827',
        bodyColor: isDark ? '#d1d5db' : '#4b5563',
        borderColor: isDark ? '#4b5563' : '#e5e7eb',
        borderWidth: 1,
        callbacks: {
          label: (context) => {
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `${context.label}: ${context.parsed} (${percentage}%)`;
          }
        }
      }
    }
  };

  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : 0;

  return (
    <Card>
      <CardTitle>Win/Loss Ratio</CardTitle>
      <div className="h-64 mt-4 relative">
        {total > 0 ? (
          <>
            <Doughnut data={data} options={options} />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="text-center -mt-8">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{winRate}%</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Win Rate</p>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 dark:text-gray-400">
            No closed trades yet
          </div>
        )}
      </div>
    </Card>
  );
}
