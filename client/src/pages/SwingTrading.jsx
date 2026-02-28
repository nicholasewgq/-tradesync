import { useState, useRef } from 'react';
import { TrendingUp, AlertCircle, Info, Upload, Loader2, Calculator, Lightbulb } from 'lucide-react';
import { AnalysisResult } from '../components/analysis/AnalysisResult';

export function SwingTrading() {
  const [activeTab, setActiveTab] = useState('setup');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);

  // Risk parameters
  const [accountBalance, setAccountBalance] = useState('10000');
  const [riskPerTrade, setRiskPerTrade] = useState('1.00');
  const [stopLoss, setStopLoss] = useState('50.00');
  const [takeProfit, setTakeProfit] = useState('100.00');

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
      setError(null);
      const reader = new FileReader();
      reader.onload = (e) => setImagePreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;

    setLoading(true);
    setError(null);
    setAnalysis(null);

    const steps = [
      'Analyzing chart patterns...',
      'Identifying support and resistance...',
      'Determining take profit targets...',
      'Calculating risk metrics...'
    ];

    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      setLoadingStep(steps[stepIndex % steps.length]);
      stepIndex++;
    }, 2000);

    setLoadingStep(steps[0]);

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('chart', imageFile);
      formData.append('timeframe', '4H');

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      // Handle non-JSON responses (e.g., proxy errors, server crashes)
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        // Check if it's a timeout or tunnel error
        if (text.includes('timeout') || text.includes('Timeout')) {
          throw new Error('Request timed out. Try a smaller image.');
        }
        if (text.includes('502') || text.includes('504') || text.includes('Bad Gateway')) {
          throw new Error('Connection error. Please try again.');
        }
        throw new Error('Server error: ' + (text.substring(0, 100) || 'Unknown error'));
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysis(data.analysis);
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Analysis failed. Please try again.');
    } finally {
      clearInterval(stepInterval);
      setLoading(false);
      setLoadingStep('');
    }
  };

  const calculatePositionSize = () => {
    const balance = parseFloat(accountBalance) || 0;
    const risk = parseFloat(riskPerTrade) || 0;
    const sl = parseFloat(stopLoss) || 1;
    return ((balance * (risk / 100)) / sl).toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">Swing Trading</h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm">
              Analyze charts for multi-day to multi-week trade opportunities
            </p>
          </div>
        </div>
      </div>

      {/* Disclaimer Banner */}
      <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800/50 rounded-xl md:rounded-2xl">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-400 text-sm md:text-base">Important: Not Financial Advice</p>
            <p className="text-xs md:text-sm text-amber-600/80 dark:text-amber-300/80 mt-0.5">
              All analysis provided is for educational and informational purposes only. Trading involves risk.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Responsive Layout */}
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
        {/* Left Column - Upload Section */}
        <div className="flex-1 order-1">
          <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6 shadow-xl shadow-gray-200/20 dark:shadow-none">
            <div className="flex items-center gap-3 mb-1">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Swing Trading</h2>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 md:mb-6 ml-11">
              Identify high-probability setups for multi-day positions
            </p>

            {/* Info Box */}
            <div className="mb-4 md:mb-6 p-3 md:p-4 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/50 rounded-xl">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center flex-shrink-0">
                  <Info className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <p className="font-medium text-emerald-700 dark:text-emerald-400 text-sm">Chart Analysis Information</p>
                  <p className="text-xs md:text-sm text-emerald-600/80 dark:text-emerald-300/80 mt-0.5">
                    Upload clear images with visible price action and indicators for best results.
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Area */}
            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl md:rounded-2xl p-6 md:p-10 text-center cursor-pointer hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-300 bg-gradient-to-br from-gray-50 to-gray-100/50 dark:from-gray-800/50 dark:to-gray-900/50 group"
              >
                <div className="w-14 h-14 md:w-16 md:h-16 mx-auto rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Upload className="w-6 h-6 md:w-7 md:h-7 text-emerald-500 dark:text-emerald-400" />
                </div>
                <p className="text-base md:text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Upload Chart Image
                </p>
                <p className="text-gray-400 dark:text-gray-500 mb-4 md:mb-6 text-xs md:text-sm">
                  Drag & drop or tap to browse
                </p>
                <button className="inline-flex items-center gap-2 px-5 md:px-6 py-2.5 md:py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-medium rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 text-sm md:text-base">
                  <Upload className="w-4 h-4" />
                  Select Image
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="relative rounded-xl md:rounded-2xl overflow-hidden bg-gray-900">
                  <img
                    src={imagePreview}
                    alt="Chart preview"
                    className="w-full max-h-64 md:max-h-96 object-contain"
                  />
                  <button
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                      setAnalysis(null);
                    }}
                    className="absolute top-3 right-3 px-3 md:px-4 py-1.5 md:py-2 bg-red-500 hover:bg-red-600 text-white text-xs md:text-sm font-medium rounded-lg transition-colors shadow-lg"
                  >
                    Remove
                  </button>

                  {/* Loading Overlay */}
                  {loading && (
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-sm flex flex-col items-center justify-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-4 border-emerald-500/30 border-t-emerald-500 animate-spin mb-4" />
                      <p className="text-white font-semibold text-base md:text-lg">Analyzing Chart</p>
                      <p className="text-emerald-400 text-xs md:text-sm mt-1">{loadingStep}</p>
                      <p className="text-gray-400 text-xs mt-2">Analysis takes 15-30 seconds</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="w-full py-3 md:py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 flex items-center justify-center gap-2 text-sm md:text-base"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Chart'
                  )}
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              onChange={handleImageSelect}
              className="hidden"
            />

            {error && (
              <div className="mt-4 p-3 md:p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl">
                <p className="text-red-600 dark:text-red-400 font-medium text-sm">{error}</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Trade Setup Calculator */}
        <div className="w-full lg:w-80 order-2">
          {/* Tabs */}
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-4">
            <button
              onClick={() => setActiveTab('setup')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'setup'
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              Trade Setup
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-white dark:bg-gray-700 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              History
            </button>
          </div>

          {activeTab === 'setup' ? (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-5 shadow-xl shadow-gray-200/20 dark:shadow-none">
              <div className="flex items-center gap-2 mb-1">
                <Calculator className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">Pre-Trade Setup Calculator</h3>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                Set your risk parameters for trade analysis
              </p>
              <p className="text-xs text-emerald-500 dark:text-emerald-400 font-medium mb-4 md:mb-5">
                Using 4-hour/daily timeframe settings
              </p>

              <div className="space-y-3 md:space-y-4">
                <p className="text-xs font-semibold text-gray-400 tracking-wider">RISK PARAMETERS</p>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Account Balance ($)
                  </label>
                  <input
                    type="number"
                    value={accountBalance}
                    onChange={(e) => setAccountBalance(e.target.value)}
                    className="w-full px-3 md:px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Risk Per Trade (%)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={riskPerTrade}
                    onChange={(e) => setRiskPerTrade(e.target.value)}
                    className="w-full px-3 md:px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                  <p className="text-xs text-gray-400 mt-1">Recommended: 1-2% for swing trades</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Stop Loss (Points)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={stopLoss}
                    onChange={(e) => setStopLoss(e.target.value)}
                    className="w-full px-3 md:px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Take Profit (Points)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={takeProfit}
                    onChange={(e) => setTakeProfit(e.target.value)}
                    className="w-full px-3 md:px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all text-sm"
                  />
                </div>

                <div className="pt-3 md:pt-4 border-t border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">Position Size:</span>
                    <span className="text-lg md:text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      {calculatePositionSize()} contracts
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-200/50 dark:border-gray-700/50 p-4 md:p-6 shadow-xl shadow-gray-200/20 dark:shadow-none">
              <p className="text-gray-500 dark:text-gray-400 text-center py-8 text-sm">
                No analysis history yet. Upload a chart to get started.
              </p>
            </div>
          )}

          {/* Chart Analysis Guide */}
          <div className="mt-4 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl md:rounded-2xl p-4 md:p-5 text-white shadow-lg shadow-emerald-500/25">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-5 h-5" />
              <h4 className="font-semibold text-sm md:text-base">Chart Analysis Guide</h4>
            </div>
            <div className="space-y-2 md:space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</div>
                <div>
                  <p className="font-medium text-xs md:text-sm">Set Your Parameters</p>
                  <p className="text-xs text-emerald-100 hidden md:block">Use the calculator above to define your risk.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</div>
                <div>
                  <p className="font-medium text-xs md:text-sm">Upload Your Chart</p>
                  <p className="text-xs text-emerald-100 hidden md:block">Select a clear chart with visible price action.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</div>
                <div>
                  <p className="font-medium text-xs md:text-sm">Review Analysis</p>
                  <p className="text-xs text-emerald-100 hidden md:block">Get AI insights on patterns and levels.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Analysis Results */}
      {analysis && (
        <div className="mt-6 md:mt-8">
          <AnalysisResult analysis={analysis} />
        </div>
      )}
    </div>
  );
}
