import { Bell, Moon, Sun, Search, Command, Menu, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { useSidebar } from './Layout';
import { useState } from 'react';

export function Header() {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { sidebarOpen, setSidebarOpen } = useSidebar();
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="h-16 bg-white/80 dark:bg-[#0d1321]/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
      {/* Left side - Menu button & Search */}
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Search Bar - Hidden on small screens */}
        <div className={`relative transition-all duration-300 hidden sm:block ${searchFocused ? 'w-80 md:w-96' : 'w-64 md:w-80'}`}>
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search trades, analytics..."
            className="w-full pl-11 pr-4 md:pr-20 py-2.5 bg-gray-100 dark:bg-gray-800/50 border border-transparent focus:border-indigo-500/50 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none transition-all duration-300"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <Command className="w-3 h-3 text-gray-500" />
            <span className="text-xs text-gray-500 font-medium">K</span>
          </div>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Mobile search button */}
        <button className="sm:hidden p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all">
          <Search className="w-5 h-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 group"
        >
          <div className="relative w-5 h-5">
            <Sun className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'dark' ? 'opacity-100 rotate-0' : 'opacity-0 rotate-90'}`} />
            <Moon className={`absolute inset-0 w-5 h-5 transition-all duration-300 ${theme === 'light' ? 'opacity-100 rotate-0' : 'opacity-0 -rotate-90'}`} />
          </div>
        </button>

        {/* Notifications */}
        <button className="relative p-2.5 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full" />
        </button>

        {/* Divider - Hidden on mobile */}
        <div className="hidden sm:block w-px h-8 bg-gray-200 dark:bg-gray-700 mx-2" />

        {/* Market Status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-green-50 dark:bg-green-900/20 rounded-xl">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </span>
          <span className="text-xs font-semibold text-green-600 dark:text-green-400">Market Open</span>
        </div>
      </div>
    </header>
  );
}
