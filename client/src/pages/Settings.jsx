import { useState } from 'react';
import { User, Palette, Bell, Shield, Save } from 'lucide-react';
import { Card, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { api } from '../utils/api';

export function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();

  const [username, setUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSaveProfile = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await api.put('/user/profile', { username, theme });
      updateUser(response.data);
      setMessage('Settings saved successfully!');
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-500 dark:text-gray-400">Manage your account preferences</p>
      </div>

      <div className="space-y-6">
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
              <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <CardTitle>Profile Settings</CardTitle>
          </div>

          <div className="space-y-4">
            <Input
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Your username"
            />

            <Input
              label="Email"
              value={user?.email || ''}
              disabled
              className="opacity-60"
            />
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle>Appearance</CardTitle>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setTheme('light')}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme === 'light'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="w-full h-20 rounded-lg bg-white border border-gray-200 mb-3" />
              <p className="font-medium text-gray-900 dark:text-white">Light Mode</p>
            </button>

            <button
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-xl border-2 transition-all ${
                theme === 'dark'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="w-full h-20 rounded-lg bg-gray-800 border border-gray-700 mb-3" />
              <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            </button>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle>Notifications</CardTitle>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Email Notifications</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Receive updates via email</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded text-indigo-600" defaultChecked />
            </label>

            <label className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Trade Alerts</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified about your trades</p>
              </div>
              <input type="checkbox" className="w-5 h-5 rounded text-indigo-600" defaultChecked />
            </label>
          </div>
        </Card>

        <Card>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <CardTitle>Security</CardTitle>
          </div>

          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Your data is stored locally and securely encrypted.
          </p>

          <Button variant="secondary">Change Password</Button>
        </Card>

        {message && (
          <p className={`text-center ${message.includes('success') ? 'text-green-500' : 'text-red-500'}`}>
            {message}
          </p>
        )}

        <Button onClick={handleSaveProfile} disabled={loading} className="w-full">
          <Save className="w-4 h-4 mr-2" />
          {loading ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </div>
  );
}
