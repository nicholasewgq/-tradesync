import { useState, useRef } from 'react';
import { Upload, FileText, BarChart3, Loader2, AlertCircle, X, Sparkles } from 'lucide-react';
import { AnalysisResult } from './AnalysisResult';

const TIMEFRAMES = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '30m', label: '30 Minutes' },
  { value: '1H', label: '1 Hour' },
  { value: '4H', label: '4 Hours' },
  { value: '1D', label: '1 Day' },
  { value: '1W', label: '1 Week' },
];

export function ChartAnalyzer({ tradeType = 'swing' }) {
  const [mode, setMode] = useState('image');
  const [timeframe, setTimeframe] = useState(tradeType === 'scalp' ? '15m' : '4H');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [ohlcData, setOhlcData] = useState('');
  const [dataFormat, setDataFormat] = useState('json');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const fileInputRef = useRef(null);

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

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const token = localStorage.getItem('token');
      let response;

      if (mode === 'image' && imageFile) {
        const formData = new FormData();
        formData.append('chart', imageFile);
        formData.append('timeframe', timeframe);

        response = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: formData
        });
      } else if (mode === 'data' && ohlcData.trim()) {
        response = await fetch('/api/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ ohlcData, timeframe, dataFormat })
        });
      } else {
        throw new Error('Please provide a chart image or OHLC data');
      }

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Analysis failed');
      setAnalysis(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const sampleJSON = `[
  {"open": 100.50, "high": 101.20, "low": 100.10, "close": 100.80, "volume": 15000},
  {"open": 100.80, "high": 102.00, "low": 100.60, "close": 101.50, "volume": 18000}
]`;

  const sampleCSV = `open,high,low,close,volume
100.50,101.20,100.10,100.80,15000
100.80,102.00,100.60,101.50,18000`;

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">AI Chart Analysis</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">Upload or paste data to analyze</p>
            </div>
          </div>

          <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
            <button
              onClick={() => setMode('image')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'image'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <Upload className="w-4 h-4" />
              Upload
            </button>
            <button
              onClick={() => setMode('data')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'data'
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400'
              }`}
            >
              <FileText className="w-4 h-4" />
              OHLC Data
            </button>
          </div>
        </div>

        {mode === 'image' ? (
          <div className="space-y-4">
            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-10 text-center cursor-pointer hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors bg-gray-50 dark:bg-gray-700/30"
              >
                <Upload className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Drag & drop your chart image here
                </p>
                <p className="text-sm text-gray-400 mt-1">or click to browse</p>
                <p className="text-xs text-gray-400 mt-3">PNG, JPG, WebP up to 10MB</p>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Chart preview"
                  className="w-full max-h-72 object-contain rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"
                />
                <button
                  onClick={clearImage}
                  className="absolute top-3 right-3 p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <X className="w-4 h-4" />
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
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div>
                <label className="label">Format</label>
                <select
                  value={dataFormat}
                  onChange={(e) => setDataFormat(e.target.value)}
                  className="input w-28"
                >
                  <option value="json">JSON</option>
                  <option value="csv">CSV</option>
                </select>
              </div>
              <button
                onClick={() => setOhlcData(dataFormat === 'json' ? sampleJSON : sampleCSV)}
                className="mt-6 text-sm text-indigo-500 hover:text-indigo-600 font-medium"
              >
                Load sample data
              </button>
            </div>

            <div>
              <label className="label">OHLC Data (minimum 20 candles)</label>
              <textarea
                value={ohlcData}
                onChange={(e) => setOhlcData(e.target.value)}
                placeholder={dataFormat === 'json'
                  ? 'Paste JSON: [{"open": 100, "high": 102, "low": 99, "close": 101}, ...]'
                  : 'Paste CSV: open,high,low,close,volume\n100,102,99,101,1000'}
                className="input min-h-[160px] font-mono text-sm"
              />
            </div>
          </div>
        )}

        <div className="flex items-end gap-4 mt-6">
          <div>
            <label className="label">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="input w-36"
            >
              {TIMEFRAMES.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>
          </div>

          <div className="flex-1" />

          <button
            onClick={handleAnalyze}
            disabled={loading || (mode === 'image' ? !imageFile : !ohlcData.trim())}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <BarChart3 className="w-5 h-5" />
                Analyze Chart
              </>
            )}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-700 dark:text-red-400 font-medium">Analysis Failed</p>
              <p className="text-sm text-red-600 dark:text-red-300">{error}</p>
            </div>
          </div>
        )}
      </div>

      {analysis && <AnalysisResult analysis={analysis} />}
    </div>
  );
}
