import { useState, useEffect } from 'react';
import {
  Users,
  Trophy,
  Share2,
  Globe,
  Lock,
  Copy,
  Check,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Award,
  Star,
  Download,
  Upload,
  MessageSquare,
  Twitter,
  Link2
} from 'lucide-react';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export function Social() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('leaderboard');
  const [leaderboard, setLeaderboard] = useState([]);
  const [period, setPeriod] = useState('all');
  const [metric, setMetric] = useState('profit');
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [exportCode, setExportCode] = useState('');
  const [importCode, setImportCode] = useState('');
  const [strategies, setStrategies] = useState([]);
  const [discordWebhook, setDiscordWebhook] = useState('');

  useEffect(() => {
    fetchLeaderboard();
    fetchStrategies();
    fetchSettings();
  }, [period, metric]);

  const fetchLeaderboard = async () => {
    try {
      const response = await api.get(`/social/leaderboard?period=${period}&metric=${metric}`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStrategies = async () => {
    try {
      const response = await api.get('/strategies');
      setStrategies(response.data);
    } catch (error) {
      console.error('Failed to fetch strategies:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await api.get('/alerts/settings');
      setDiscordWebhook(response.data.discordWebhook || '');
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const toggleProfileVisibility = async () => {
    try {
      await api.post('/social/profile/visibility', { isPublic: !isPublic });
      setIsPublic(!isPublic);
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportStrategy = async (strategyId) => {
    try {
      const response = await api.get(`/social/strategies/export/${strategyId}`);
      setExportCode(response.data.exportCode);
    } catch (error) {
      console.error('Failed to export strategy:', error);
    }
  };

  const importStrategy = async () => {
    if (!importCode.trim()) return;

    try {
      const response = await api.post('/social/strategies/import', { exportCode: importCode });
      alert(`Successfully imported: ${response.data.name} with ${response.data.rulesCount} rules`);
      setImportCode('');
      fetchStrategies();
    } catch (error) {
      alert('Failed to import strategy. Invalid code.');
    }
  };

  const saveDiscordWebhook = async () => {
    try {
      await api.put('/alerts/settings', { discordWebhook });
      alert('Discord webhook saved!');
    } catch (error) {
      alert('Failed to save webhook');
    }
  };

  const testDiscordWebhook = async () => {
    if (!discordWebhook) return;

    try {
      await api.post('/social/webhook/discord', {
        webhookUrl: discordWebhook,
        message: 'Test notification from TradeSync!'
      });
      alert('Test message sent to Discord!');
    } catch (error) {
      alert('Failed to send test message');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSA2MCAwIEwgMCAwIDAgNjAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjA1KSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-30" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-white/10 rounded-full blur-3xl" />

        <div className="relative p-8">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl animate-pulse" />
              <div className="relative w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-sm border border-white/30 flex items-center justify-center">
                <Users className="w-10 h-10 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Social Hub</h1>
              <p className="text-white/80 text-lg">Leaderboards, sharing, and community features</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass-card p-2 flex gap-2 overflow-x-auto">
        {[
          { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          { id: 'profile', label: 'My Profile', icon: Globe },
          { id: 'share', label: 'Share', icon: Share2 },
          { id: 'integrations', label: 'Integrations', icon: Link2 }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-6 fade-in">
          {/* Filters */}
          <div className="glass-card">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Time Period</label>
                <div className="flex gap-2">
                  {[
                    { id: 'week', label: 'This Week' },
                    { id: 'month', label: 'This Month' },
                    { id: 'all', label: 'All Time' }
                  ].map(p => (
                    <button
                      key={p.id}
                      onClick={() => setPeriod(p.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        period === p.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Rank By</label>
                <div className="flex gap-2">
                  {[
                    { id: 'profit', label: 'Total Profit' },
                    { id: 'winrate', label: 'Win Rate' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setMetric(m.id)}
                      className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                        metric === m.id
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/5 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-6 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" />
              Top Traders
            </h3>

            {leaderboard.length > 0 ? (
              <div className="space-y-3">
                {leaderboard.map((trader, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${
                      trader.rank <= 3
                        ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${
                        trader.rank === 1 ? 'bg-amber-500 text-black' :
                        trader.rank === 2 ? 'bg-gray-400 text-black' :
                        trader.rank === 3 ? 'bg-amber-700 text-white' :
                        'bg-white/10 text-gray-400'
                      }`}>
                        {trader.rank}
                      </div>
                      <div>
                        <p className="font-bold text-white">{trader.username}</p>
                        <p className="text-sm text-gray-500">{trader.totalTrades} trades</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Win Rate</p>
                        <p className={`font-bold ${parseFloat(trader.winRate) >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {trader.winRate}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total P&L</p>
                        <p className={`font-bold text-xl ${parseFloat(trader.totalProfit) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ${trader.totalProfit}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-400">No traders on the leaderboard yet</p>
                <p className="text-sm text-gray-500">Make your profile public to appear here</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6 fade-in">
          <div className="glass-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl font-black text-white">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{user?.username}</h3>
                  <p className="text-gray-400">{user?.email}</p>
                </div>
              </div>

              <button
                onClick={toggleProfileVisibility}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
                  isPublic
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-white/5 text-gray-400 border border-white/10'
                }`}
              >
                {isPublic ? <Globe className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                {isPublic ? 'Public Profile' : 'Private Profile'}
              </button>
            </div>

            <div className="p-4 bg-white/5 rounded-xl">
              <p className="text-sm text-gray-400 mb-2">Your Profile URL</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 px-4 py-2 bg-black/30 rounded-lg text-gray-300 text-sm">
                  {window.location.origin}/trader/{user?.username}
                </code>
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/trader/${user?.username}`)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-gray-400" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {isPublic ? 'Anyone can view your stats' : 'Only you can see your profile'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Share Tab */}
      {activeTab === 'share' && (
        <div className="space-y-6 fade-in">
          {/* Export Strategy */}
          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <Download className="w-5 h-5 text-emerald-400" />
              Export Strategy
            </h3>
            <p className="text-gray-400 mb-4">Share your strategy with other traders</p>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              {strategies.map(s => (
                <button
                  key={s.id}
                  onClick={() => exportStrategy(s.id)}
                  className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-left transition-all border border-white/10 hover:border-emerald-500/30"
                >
                  <p className="font-bold text-white">{s.name}</p>
                  <p className="text-sm text-gray-500">{s.rules?.length || 0} rules</p>
                </button>
              ))}
            </div>

            {exportCode && (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl">
                <p className="text-sm text-emerald-400 mb-2">Export Code (copy & share):</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 px-4 py-2 bg-black/30 rounded-lg text-gray-300 text-sm overflow-x-auto">
                    {exportCode}
                  </code>
                  <button
                    onClick={() => copyToClipboard(exportCode)}
                    className="p-2 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-emerald-400" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Import Strategy */}
          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-400" />
              Import Strategy
            </h3>
            <p className="text-gray-400 mb-4">Paste an export code to import a strategy</p>

            <div className="flex gap-2">
              <input
                type="text"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="Paste export code here..."
                className="input-premium flex-1"
              />
              <button
                onClick={importStrategy}
                className="btn-glow px-6"
              >
                Import
              </button>
            </div>
          </div>

          {/* Share to Social */}
          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <Share2 className="w-5 h-5 text-pink-400" />
              Share Your Success
            </h3>
            <p className="text-gray-400 mb-4">Coming soon: Share trade cards to social media</p>

            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 py-2 bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-xl font-medium opacity-50 cursor-not-allowed">
                <Twitter className="w-5 h-5" />
                Twitter
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-[#5865F2]/20 text-[#5865F2] rounded-xl font-medium opacity-50 cursor-not-allowed">
                <MessageSquare className="w-5 h-5" />
                Discord
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 fade-in">
          {/* Discord Webhook */}
          <div className="glass-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-[#5865F2]" />
              </div>
              <div>
                <h3 className="font-bold text-white text-lg">Discord Notifications</h3>
                <p className="text-gray-400 text-sm">Get trade alerts in your Discord server</p>
              </div>
            </div>

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

              <div className="flex gap-3">
                <button onClick={saveDiscordWebhook} className="btn-glow">
                  Save Webhook
                </button>
                <button
                  onClick={testDiscordWebhook}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-medium transition-all"
                >
                  Send Test
                </button>
              </div>

              <div className="p-4 bg-white/5 rounded-xl">
                <p className="text-sm text-gray-400 mb-2">How to get a webhook URL:</p>
                <ol className="text-sm text-gray-500 space-y-1 list-decimal list-inside">
                  <li>Open Discord and go to your server settings</li>
                  <li>Go to Integrations {'->'} Webhooks</li>
                  <li>Create a new webhook and copy the URL</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Coming Soon */}
          <div className="glass-card">
            <h3 className="font-bold text-white text-lg mb-4">Coming Soon</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-white/5 rounded-xl opacity-60">
                <p className="font-medium text-white mb-1">TradingView Integration</p>
                <p className="text-sm text-gray-500">Import charts and sync watchlists</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl opacity-60">
                <p className="font-medium text-white mb-1">Broker Connections</p>
                <p className="text-sm text-gray-500">Auto-import trades from TD, IBKR</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl opacity-60">
                <p className="font-medium text-white mb-1">Email Alerts</p>
                <p className="text-sm text-gray-500">Daily summaries and price alerts</p>
              </div>
              <div className="p-4 bg-white/5 rounded-xl opacity-60">
                <p className="font-medium text-white mb-1">Telegram Bot</p>
                <p className="text-sm text-gray-500">Manage trades via Telegram</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
