'use client';

import { useAppStore } from '../lib/store';
import { Button } from './ui/button';

export function Header() {
  const { user, currentClient, currentView, setCurrentView, userGoals, logout } = useAppStore();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <h1 className="text-xl font-bold rbc-blue">RBC Goals</h1>
          </div>

          {/* Navigation */}
          <nav className="flex items-center space-x-4">
            <Button
              variant={currentView === 'catalogue' ? "default" : "ghost"}
              onClick={() => setCurrentView('catalogue')}
              size="sm"
              className={currentView === 'catalogue' ? 'bg-rbc-blue hover:bg-rbc-blue/90' : 'text-gray-700 hover:text-rbc-blue hover:bg-gray-50'}
            >
              Goals
            </Button>
            <Button
              variant={currentView === 'dashboard' ? "default" : "ghost"}
              onClick={() => setCurrentView('dashboard')}
              size="sm"
              className={currentView === 'dashboard' ? 'bg-rbc-blue hover:bg-rbc-blue/90' : 'text-gray-700 hover:text-rbc-blue hover:bg-gray-50'}
            >
              Dashboard ({userGoals.length})
            </Button>
          </nav>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {currentClient?.name || user?.teamName || 'User'}
            </span>
            <Button variant="outline" size="sm" onClick={logout} className="border-gray-300 text-gray-700 hover:border-rbc-blue hover:text-rbc-blue">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}