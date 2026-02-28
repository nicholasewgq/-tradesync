import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Zap,
  GraduationCap,
  BookOpen,
  History,
  CreditCard,
  Settings,
  LogOut,
  ChevronRight,
  Activity,
  Globe,
  Brain,
  Target,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const navGroups = [
  {
    title: 'MAIN',
    items: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', gradient: 'from-blue-500 to-cyan-500' },
      { path: '/swing-trading', icon: TrendingUp, label: 'Swing Trading', gradient: 'from-emerald-500 to-teal-500' },
      { path: '/scalp-trading', icon: Zap, label: 'Scalp Trading', gradient: 'from-amber-500 to-orange-500' },
    ]
  },
  {
    title: 'AI POWERED',
    items: [
      { path: '/strategies', icon: Target, label: 'Strategies', badge: 'New', gradient: 'from-emerald-500 to-teal-500' },
      { path: '/ai-insights', icon: Brain, label: 'AI Signals', gradient: 'from-purple-500 to-pink-500' },
      { path: '/market', icon: Globe, label: 'Market Intel', gradient: 'from-cyan-500 to-blue-500' },
    ]
  },
  {
    title: 'ANALYSIS',
    items: [
      { path: '/analytics', icon: Activity, label: 'Analytics', gradient: 'from-violet-500 to-purple-500' },
      { path: '/journal', icon: BookOpen, label: 'Journal', gradient: 'from-pink-500 to-rose-500' },
      { path: '/history', icon: History, label: 'Trade History', gradient: 'from-indigo-500 to-blue-500' },
    ]
  },
  {
    title: 'LEARN',
    items: [
      { path: '/learning', icon: GraduationCap, label: 'Learning', gradient: 'from-cyan-500 to-blue-500' },
    ]
  },
  {
    title: 'ACCOUNT',
    items: [
      { path: '/plans', icon: CreditCard, label: 'Plans', gradient: 'from-slate-500 to-gray-500' },
      { path: '/settings', icon: Settings, label: 'Settings', gradient: 'from-gray-500 to-slate-500' },
    ]
  }
];

export function Sidebar({ onClose }) {
  const { user, logout } = useAuth();

  const handleNavClick = () => {
    // Close sidebar on mobile when nav item is clicked
    if (onClose) onClose();
  };

  return (
    <aside className="w-72 lg:w-64 bg-white/80 dark:bg-[#0d1321]/90 backdrop-blur-xl border-r border-gray-200/50 dark:border-gray-800/50 min-h-screen flex flex-col">
      {/* Logo */}
      <div className="p-4 lg:p-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900" />
          </div>
          <div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              TradeSync
            </span>
            <p className="text-[10px] text-gray-400 font-medium">PRO TRADER</p>
          </div>
        </div>

        {/* Close button for mobile */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-xl text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.title} className="mb-6">
            <h3 className="px-4 mb-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 tracking-widest">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map(({ path, icon: Icon, label, badge, gradient }) => (
                <li key={path}>
                  <NavLink
                    to={path}
                    onClick={handleNavClick}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                        isActive
                          ? `bg-gradient-to-r ${gradient} text-white shadow-lg`
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                            isActive
                              ? 'bg-white/20'
                              : 'bg-gray-100 dark:bg-gray-800 group-hover:scale-110'
                          }`}>
                            <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-500 dark:text-gray-400'}`} />
                          </div>
                          <span className="text-sm font-medium">{label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {badge && !isActive && (
                            <span className="px-2 py-0.5 text-[10px] font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white rounded-full shadow-sm">
                              {badge}
                            </span>
                          )}
                          {isActive && <ChevronRight className="w-4 h-4 opacity-70" />}
                        </div>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-200/50 dark:border-gray-800/50">
        <div className="flex items-center gap-3 px-3 py-3 mb-2 rounded-xl bg-gray-50 dark:bg-gray-800/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
            {user?.username?.charAt(0).toUpperCase() || 'T'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
              {user?.username || 'Trader'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Pro Account</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-all duration-200 text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
