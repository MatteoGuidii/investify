'use client';

import { useAppStore } from '../lib/store';

export function Header() {
  const { user, currentClient, currentView, setCurrentView, logout } = useAppStore();

  return (
    <header className="bg-rbc-blue text-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold text-white">RBC InvestEase</h1>
            <span className="bg-yellow-400 text-rbc-blue px-2 py-1 rounded text-xs font-semibold">
              Student
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-0 bg-white/10 rounded-lg p-1">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`${currentView === 'dashboard' ? 'bg-white/30 text-white border border-white/40' : 'text-white hover:bg-white/20'} px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('catalogue')}
              className={`${currentView === 'catalogue' ? 'bg-white/30 text-white border border-white/40' : 'text-white hover:bg-white/20'} px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50`}
            >
              Goals
            </button>
            <button
              onClick={() => setCurrentView('rewards')}
              className={`${currentView === 'rewards' ? 'bg-white/30 text-white border border-white/40' : 'text-white hover:bg-white/20'} px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50`}
            >
              Rewards
            </button>
            <button
              className="text-white hover:bg-white/20 px-4 py-2 rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
            >
              Wrapped
            </button>
          </nav>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <button className="text-white hover:bg-white/20 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white/50">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L13 14l-3-1-3 1 3-12z"/>
              </svg>
            </button>
            <button className="text-white hover:bg-white/20 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white/50">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
            <button onClick={logout} className="text-white hover:bg-white/20 p-2 rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-white/50">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {(currentClient?.name || user?.teamName || 'User').charAt(0).toUpperCase()}
                </span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}