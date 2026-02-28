import { useState, useEffect } from 'react';
import {
  User,
  Palette,
  Bell,
  Shield,
  Save,
  Moon,
  Sun,
  Monitor,
  Keyboard,
  Globe,
  Lock,
  Eye,
  EyeOff,
  Check,
  RefreshCw,
  Download,
  Trash2,
  AlertTriangle,
  ChevronRight,
  Zap,
  Layout,
  BarChart3,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';

export function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('profile');
  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Notification settings
  const [notifications, setNotifications] = useState({
    priceAlerts: true,
    tradeUpdates: true,
    dailySummary: false,
    weeklyReport: true,
    sound: true
  });

  // Display settings
  const [displaySettings, setDisplaySettings] = useState({
    compactMode: false,
    showPnL: true,
    defaultTimeframe: '1D',
    currency: 'USD'
  });

  // Privacy settings
  const [isPublic, setIsPublic] = useState(false);
  const [discordWebhook, setDiscordWebhook] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/alerts/settings');
      setNotifications(prev => ({ ...prev, ...response.data }));
      setDiscordWebhook(response.data.discordWebhook || '');
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put('/user/profile', { username, theme });
      updateUser(response.data);
      setMessage({ type: 'success', text: 'Profile saved successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match' });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      await api.put('/user/password', { currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.error || 'Failed to change password' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await api.put('/alerts/settings', { ...notifications, discordWebhook });
      setMessage({ type: 'success', text: 'Notification settings saved!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    try {
      const response = await api.get('/user/export');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tradesync-export-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setMessage({ type: 'success', text: 'Data exported successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to export data' });
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'data', label: 'Data & Export', icon: Download }
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-800 to-gray-900" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-50" />

        <div className="relative p-8">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-3xl font-black text-white shadow-xl">
              {user?.username?.[0]?.toUpperCase() || 'T'}
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">{user?.username || 'Trader'}</h1>
              <p className="text-gray-400">{user?.email}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-semibold text-indigo-400">
                  Pro Account
                </span>
                <span className="px-3 py-1 bg-emerald-500/20 border border-emerald-500/30 rounded-full text-xs font-semibold text-emerald-400">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-2 flex gap-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Message */}
      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-3 ${
          message.type === 'success'
            ? 'bg-emerald-500/20 border border-emerald-500/30 text-emerald-400'
            : 'bg-rose-500/20 border border-rose-500/30 text-rose-400'
        }`}>
          {message.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          {message.text}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6 fade-in">
          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-indigo-400" />
              Profile Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-premium opacity-60 cursor-not-allowed"
                />
              </div>

              <button
                onClick={handleSaveProfile}
                disabled={loading}
                className="btn-glow w-full flex items-center justify-center gap-2"
              >
                {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Save Profile
              </button>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <Lock className="w-5 h-5 text-rose-400" />
              Change Password
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="input-premium pr-12"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-premium"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-premium"
                />
              </div>

              <button
                onClick={handleChangePassword}
                disabled={loading || !currentPassword || !newPassword}
                className="w-full py-3 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-400 rounded-xl font-medium transition-all disabled:opacity-50"
              >
                Change Password
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Appearance Tab */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 fade-in">
          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <Palette className="w-5 h-5 text-purple-400" />
              Theme
            </h3>

            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-full h-16 rounded-lg bg-white border border-gray-200 mb-3 flex items-center justify-center">
                  <Sun className="w-6 h-6 text-amber-500" />
                </div>
                <p className="font-medium text-white">Light</p>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-full h-16 rounded-lg bg-gray-900 border border-gray-700 mb-3 flex items-center justify-center">
                  <Moon className="w-6 h-6 text-indigo-400" />
                </div>
                <p className="font-medium text-white">Dark</p>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-4 rounded-xl border-2 transition-all ${
                  theme === 'system'
                    ? 'border-indigo-500 bg-indigo-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <div className="w-full h-16 rounded-lg bg-gradient-to-r from-white to-gray-900 border border-gray-500 mb-3 flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-gray-400" />
                </div>
                <p className="font-medium text-white">System</p>
              </button>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <Layout className="w-5 h-5 text-cyan-400" />
              Display Options
            </h3>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-medium text-white">Compact Mode</p>
                  <p className="text-sm text-gray-500">Reduce spacing for more content</p>
                </div>
                <button
                  onClick={() => setDisplaySettings(s => ({ ...s, compactMode: !s.compactMode }))}
                  className={`w-12 h-7 rounded-full transition-all ${
                    displaySettings.compactMode ? 'bg-indigo-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                    displaySettings.compactMode ? 'ml-6' : 'ml-1'
                  }`} />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                <div>
                  <p className="font-medium text-white">Show P&L</p>
                  <p className="text-sm text-gray-500">Display profit/loss values</p>
                </div>
                <button
                  onClick={() => setDisplaySettings(s => ({ ...s, showPnL: !s.showPnL }))}
                  className={`w-12 h-7 rounded-full transition-all ${
                    displaySettings.showPnL ? 'bg-indigo-500' : 'bg-gray-600'
                  }`}
                >
                  <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                    displaySettings.showPnL ? 'ml-6' : 'ml-1'
                  }`} />
                </button>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Default Timeframe</label>
                <select
                  value={displaySettings.defaultTimeframe}
                  onChange={(e) => setDisplaySettings(s => ({ ...s, defaultTimeframe: e.target.value }))}
                  className="input-premium"
                >
                  <option value="1m">1 Minute</option>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="1H">1 Hour</option>
                  <option value="4H">4 Hours</option>
                  <option value="1D">1 Day</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6 fade-in">
          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Notification Preferences
            </h3>

            <div className="space-y-4">
              {[
                { key: 'priceAlerts', label: 'Price Alerts', desc: 'When prices hit your targets', icon: Zap },
                { key: 'tradeUpdates', label: 'Trade Updates', desc: 'When trades are opened/closed', icon: BarChart3 },
                { key: 'dailySummary', label: 'Daily Summary', desc: 'End of day performance report', icon: Sun },
                { key: 'weeklyReport', label: 'Weekly Report', desc: 'Weekly trading analytics', icon: BarChart3 },
                { key: 'sound', label: 'Sound Effects', desc: 'Play sounds for notifications', icon: Bell }
              ].map(item => (
                <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-white">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setNotifications(n => ({ ...n, [item.key]: !n[item.key] }))}
                    className={`w-12 h-7 rounded-full transition-all ${
                      notifications[item.key] ? 'bg-emerald-500' : 'bg-gray-600'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                      notifications[item.key] ? 'ml-6' : 'ml-1'
                    }`} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-[#5865F2]" />
              Discord Integration
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Webhook URL</label>
                <input
                  type="text"
                  value={discordWebhook}
                  onChange={(e) => setDiscordWebhook(e.target.value)}
                  placeholder="https://discord.com/api/webhooks/..."
                  className="input-premium"
                />
              </div>
              <p className="text-sm text-gray-500">
                Get trade alerts and summaries sent to your Discord server
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveNotifications}
            disabled={loading}
            className="btn-glow w-full flex items-center justify-center gap-2"
          >
            {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            Save Notification Settings
          </button>
        </div>
      )}

      {/* Privacy Tab */}
      {activeTab === 'privacy' && (
        <div className="space-y-6 fade-in">
          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <Globe className="w-5 h-5 text-cyan-400" />
              Profile Visibility
            </h3>

            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl">
              <div>
                <p className="font-medium text-white">Public Profile</p>
                <p className="text-sm text-gray-500">Allow others to view your stats and appear on leaderboard</p>
              </div>
              <button
                onClick={() => setIsPublic(!isPublic)}
                className={`w-12 h-7 rounded-full transition-all ${
                  isPublic ? 'bg-emerald-500' : 'bg-gray-600'
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-all ${
                  isPublic ? 'ml-6' : 'ml-1'
                }`} />
              </button>
            </div>
          </div>

          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Data Security
            </h3>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <p className="font-medium text-emerald-400">End-to-End Encryption</p>
                </div>
                <p className="text-sm text-gray-400 ml-8">Your trading data is encrypted in transit and at rest</p>
              </div>

              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Check className="w-5 h-5 text-emerald-400" />
                  <p className="font-medium text-emerald-400">Secure Authentication</p>
                </div>
                <p className="text-sm text-gray-400 ml-8">JWT-based authentication with secure session management</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Data & Export Tab */}
      {activeTab === 'data' && (
        <div className="space-y-6 fade-in">
          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-400" />
              Export Your Data
            </h3>

            <p className="text-gray-400 mb-4">
              Download all your trading data including trades, strategies, and analytics.
            </p>

            <button
              onClick={handleExportData}
              className="flex items-center gap-2 px-6 py-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-xl font-medium transition-all"
            >
              <Download className="w-5 h-5" />
              Export All Data (JSON)
            </button>
          </div>

          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <Trash2 className="w-5 h-5 text-rose-400" />
              Danger Zone
            </h3>

            <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl">
              <p className="text-rose-400 font-medium mb-2">Delete Account</p>
              <p className="text-sm text-gray-400 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button className="flex items-center gap-2 px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/50 text-rose-400 rounded-lg font-medium transition-all">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
