import { useState, useEffect } from 'react';
import { BarChart3, AlertCircle, CheckCircle } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { ChartAnalyzer } from '../components/analysis/ChartAnalyzer';

export function Analysis() {
  const [aiStatus, setAiStatus] = useState({ configured: false, loading: true });

  useEffect(() => {
    const checkAIStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('/api/analyze/status', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        setAiStatus({ configured: data.configured, loading: false, message: data.message });
      } catch (error) {
        setAiStatus({ configured: false, loading: false, message: 'Failed to check AI status' });
      }
    };

    checkAIStatus();
  }, []);

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <BarChart3 className="w-7 h-7 text-indigo-500" />
          AI Chart Analysis
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">
          Upload a chart image or paste OHLC data for AI-powered technical analysis
        </p>
      </div>

      {/* AI Status Banner */}
      {!aiStatus.loading && (
        <Card className={`mb-6 ${
          aiStatus.configured
            ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
            : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
        }`}>
          <div className="flex items-start gap-3">
            {aiStatus.configured ? (
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className={`font-medium ${
                aiStatus.configured
                  ? 'text-green-700 dark:text-green-400'
                  : 'text-yellow-700 dark:text-yellow-400'
              }`}>
                {aiStatus.configured ? 'AI Vision Enabled' : 'AI Vision Not Configured'}
              </p>
              <p className={`text-sm ${
                aiStatus.configured
                  ? 'text-green-600 dark:text-green-300'
                  : 'text-yellow-600 dark:text-yellow-300'
              }`}>
                {aiStatus.message}
              </p>
              {!aiStatus.configured && (
                <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded-lg text-sm">
                  <p className="font-medium text-gray-700 dark:text-gray-300 mb-2">Setup Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1 text-gray-600 dark:text-gray-400">
                    <li>Get an API key from <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-indigo-500 hover:underline">platform.openai.com/api-keys</a></li>
                    <li>Create a <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">.env</code> file in the <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">server/</code> folder</li>
                    <li>Add: <code className="bg-gray-100 dark:bg-gray-700 px-1 rounded">OPENAI_API_KEY=sk-your-key-here</code></li>
                    <li>Restart the server</li>
                  </ol>
                  <p className="mt-3 text-xs text-gray-500">
                    Note: OHLC data analysis works without AI (uses technical indicators), but image analysis requires OpenAI Vision.
                  </p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      <ChartAnalyzer tradeType="swing" />
    </div>
  );
}
