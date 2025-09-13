'use client';

import { useAppStore } from '../lib/store';
import { Button } from './ui/button';

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
            <Button
              variant="ghost"
              onClick={() => setCurrentView('dashboard')}
              size="sm"
              className={`${currentView === 'dashboard' ? 'bg-white text-rbc-blue' : 'text-white hover:bg-white/20'} px-4 py-2 rounded-md`}
            >
              Dashboard
            </Button>
            <Button
              variant="ghost"
              onClick={() => setCurrentView('catalogue')}
              size="sm"
              className={`${currentView === 'catalogue' ? 'bg-white text-rbc-blue' : 'text-white hover:bg-white/20'} px-4 py-2 rounded-md`}
            >
              Goals
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 px-4 py-2 rounded-md"
            >
              Rewards
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 px-4 py-2 rounded-md"
            >
              Wrapped
            </Button>
          </nav>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2L13 14l-3-1-3 1 3-12z"/>
              </svg>
            </Button>
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 p-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </Button>
            <Button variant="ghost" size="sm" onClick={logout} className="text-white hover:bg-white/20 p-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {(currentClient?.name || user?.teamName || 'User').charAt(0).toUpperCase()}
                </span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}