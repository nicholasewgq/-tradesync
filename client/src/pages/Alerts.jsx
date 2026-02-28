import { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Trash2,
  TrendingUp,
  TrendingDown,
  Check,
  X,
  AlertTriangle,
  Zap,
  Volume2,
  VolumeX,
  Settings,
  Clock
} from 'lucide-react';
import { api } from '../utils/api';
import { useWebSocket } from '../hooks/useWebSocket';
import { useAuth } from '../context/AuthContext';

export function Alerts() {
  const { user } = useAuth();
  const { alerts: wsAlerts, setAlert, removeAlert, getAlerts, isConnected } = useWebSocket(user?.id);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [notificationSettings, setNotificationSettings] = useState({
    priceAlerts: true,
    tradeUpdates: true,
    dailySummary: false,
    sound: true
  });

  // Form state
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState('above');
  const [targetPrice, setTargetPrice] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchAlerts();
    fetchSettings();
    getAlerts();
  }, []);

  useEffect(() => {
    // Merge WebSocket alerts with database alerts
    if (wsAlerts.length > 0) {
      setAlerts(prev => {
        const combined = [...prev];
        wsAlerts.forEach(wa => {
          if (!combined.find(a => a.id === wa.id)) {
            combined.push(wa);
          }
        });
        return combined;
      });
    }
  }, [wsAlerts]);

  const fetchAlerts = async () => {
    try {
      const response = await api.get('/alerts');
      setAlerts(response.data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/alerts/settings');
      setNotificationSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const createAlert = async () => {
    if (!symbol || !targetPrice) return;

    try {
      const response = await api.post('/alerts', {
        symbol: symbol.toUpperCase(),
        condition,
        targetPrice: parseFloat(targetPrice),
        note
      });

      setAlerts([response.data, ...alerts]);

      // Also set via WebSocket for real-time tracking
      setAlert(symbol.toUpperCase(), condition, parseFloat(targetPrice));

      // Reset form
      setSymbol('');
      setTargetPrice('');
      setNote('');
      setShowForm(false);
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const deleteAlert = async (id) => {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(alerts.filter(a => a.id !== id));
      removeAlert(id);
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  const updateSettings = async (newSettings) => {
    try {
      setNotificationSettings(newSettings);
      await api.put('/alerts/settings', newSettings);
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  };

  const triggeredAlerts = alerts.filter(a => a.triggered);
  const activeAlerts = alerts.filter(a => !a.triggered);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-600 via-orange-500 to-red-500" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl animate-pulse" />
                <div className="relative w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                  <Bell className="w-10 h-10 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Price Alerts</h1>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                    isConnected
                      ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
                      : 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'}`} />
                    {isConnected ? 'Live' : 'Offline'}
                  </span>
                </div>
                <p className="text-white/80 text-lg">Get notified when prices hit your targets</p>
              </div>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm border border-white/30 rounded-xl font-semibold text-white transition-all"
            >
              <Plus className="w-5 h-5" />
              New Alert
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card text-center">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-white">{activeAlerts.length}</p>
          <p className="text-gray-400 text-sm">Active Alerts</p>
        </div>
        <div className="glass-card text-center">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
            <Check className="w-6 h-6 text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-white">{triggeredAlerts.length}</p>
          <p className="text-gray-400 text-sm">Triggered</p>
        </div>
        <div className="glass-card text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mx-auto mb-3">
            <Zap className="w-6 h-6 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">{alerts.length}</p>
          <p className="text-gray-400 text-sm">Total</p>
        </div>
      </div>

      {/* Create Alert Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Create Price Alert</h3>
              <button
                onClick={() => setShowForm(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Symbol</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                  placeholder="SPY, AAPL, BTC..."
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Condition</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCondition('above')}
                    className={`p-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      condition === 'above'
                        ? 'bg-emerald-500/20 border-2 border-emerald-500/50 text-emerald-400'
                        : 'bg-white/5 border-2 border-white/10 text-gray-400'
                    }`}
                  >
                    <TrendingUp className="w-5 h-5" />
                    Price Above
                  </button>
                  <button
                    onClick={() => setCondition('below')}
                    className={`p-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      condition === 'below'
                        ? 'bg-rose-500/20 border-2 border-rose-500/50 text-rose-400'
                        : 'bg-white/5 border-2 border-white/10 text-gray-400'
                    }`}
                  >
                    <TrendingDown className="w-5 h-5" />
                    Price Below
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Target Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={targetPrice}
                  onChange={(e) => setTargetPrice(e.target.value)}
                  placeholder="0.00"
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Note (optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g., Support level"
                  className="input-premium"
                />
              </div>

              <button
                onClick={createAlert}
                disabled={!symbol || !targetPrice}
                className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50"
              >
                Create Alert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Active Alerts */}
      <div className="glass-card">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <Bell className="w-5 h-5 text-amber-400" />
          Active Alerts
        </h3>

        {activeAlerts.length > 0 ? (
          <div className="space-y-3">
            {activeAlerts.map(alert => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    alert.condition === 'above'
                      ? 'bg-emerald-500/20 border border-emerald-500/30'
                      : 'bg-rose-500/20 border border-rose-500/30'
                  }`}>
                    {alert.condition === 'above' ? (
                      <TrendingUp className="w-6 h-6 text-emerald-400" />
                    ) : (
                      <TrendingDown className="w-6 h-6 text-rose-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{alert.symbol}</p>
                    <p className="text-sm text-gray-400">
                      {alert.condition === 'above' ? 'Above' : 'Below'} ${alert.target_price}
                    </p>
                    {alert.note && (
                      <p className="text-xs text-gray-500 mt-1">{alert.note}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="text-sm text-gray-400">
                      {new Date(alert.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteAlert(alert.id)}
                    className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No active alerts</p>
            <p className="text-sm text-gray-500">Create an alert to get notified</p>
          </div>
        )}
      </div>

      {/* Triggered Alerts */}
      {triggeredAlerts.length > 0 && (
        <div className="glass-card">
          <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
            <Check className="w-5 h-5 text-emerald-400" />
            Triggered Alerts
          </h3>

          <div className="space-y-3">
            {triggeredAlerts.map(alert => (
              <div
                key={alert.id}
                className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                    <Check className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <p className="font-bold text-white text-lg">{alert.symbol}</p>
                    <p className="text-sm text-emerald-400">
                      Triggered at ${alert.triggered_price}
                    </p>
                    <p className="text-xs text-gray-500">
                      {alert.triggered_at && new Date(alert.triggered_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => deleteAlert(alert.id)}
                  className="p-2 text-gray-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification Settings */}
      <div className="glass-card">
        <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-400" />
          Notification Settings
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-amber-400" />
              <div>
                <p className="font-medium text-white">Price Alerts</p>
                <p className="text-sm text-gray-500">Get notified when prices hit targets</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ ...notificationSettings, priceAlerts: !notificationSettings.priceAlerts })}
              className={`w-12 h-7 rounded-full transition-all ${
                notificationSettings.priceAlerts ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                notificationSettings.priceAlerts ? 'ml-6' : 'ml-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              {notificationSettings.sound ? (
                <Volume2 className="w-5 h-5 text-blue-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-gray-500" />
              )}
              <div>
                <p className="font-medium text-white">Sound Notifications</p>
                <p className="text-sm text-gray-500">Play sound when alerts trigger</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ ...notificationSettings, sound: !notificationSettings.sound })}
              className={`w-12 h-7 rounded-full transition-all ${
                notificationSettings.sound ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                notificationSettings.sound ? 'ml-6' : 'ml-1'
              }`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-purple-400" />
              <div>
                <p className="font-medium text-white">Daily Summary</p>
                <p className="text-sm text-gray-500">Receive daily performance summary</p>
              </div>
            </div>
            <button
              onClick={() => updateSettings({ ...notificationSettings, dailySummary: !notificationSettings.dailySummary })}
              className={`w-12 h-7 rounded-full transition-all ${
                notificationSettings.dailySummary ? 'bg-emerald-500' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                notificationSettings.dailySummary ? 'ml-6' : 'ml-1'
              }`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
