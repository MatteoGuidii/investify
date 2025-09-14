'use client';

import { useAppStore } from '../lib/store';

export function Header() {
  const { user, currentClient, currentView, setCurrentView, logout } = useAppStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50">
      <div className="neo-glass backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-2xl bg-neo-primary flex items-center justify-center">
                  <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center">
                    <div className="w-3 h-3 rounded bg-white"></div>
                  </div>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-neo-accent rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Investify</h1>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-1 bg-white/5 rounded-2xl p-1 border border-white/10">
              {[
                { key: 'dashboard', label: 'Dashboard', icon: '📊' },
                { key: 'catalogue', label: 'Goals', icon: '🎯' },
                { key: 'rewards', label: 'Rewards', icon: '🏆' },
              ].map(({ key, label, icon }) => (
                <button
                  key={key}
                  onClick={() => setCurrentView(key as 'dashboard' | 'catalogue' | 'rewards')}
                  className={`
                    flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                    ${currentView === key 
                      ? 'bg-white/20 text-white shadow-lg border border-white/20' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                    }
                  `}
                >
                  <span className="text-base">{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-3.5-3.5a8.38 8.38 0 0 0 1.5-4.5A8 8 0 1 0 8 16a8.38 8.38 0 0 0 4.5-1.5L17 19l-2-2Z" />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-neo-accent rounded-full"></div>
              </button>

              {/* Settings */}
              <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-sm font-semibold text-white">
                    {currentClient?.name || user?.teamName || 'User'}
                  </div>
                  <div className="text-xs text-green-400">Pro Member</div>
                </div>
                <button 
                  onClick={logout}
                  className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <span className="text-sm font-bold text-white">
                    {(currentClient?.name || user?.teamName || 'User').charAt(0).toUpperCase()}
                  </span>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-neo-accent rounded-full border-2 border-slate-900"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}