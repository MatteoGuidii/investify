'use client';

import { motion } from 'framer-motion';
import { useAppStore } from '../lib/store';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';

export function Header() {
  const { user, currentClient, currentView, setCurrentView, userGoals, logout } = useAppStore();

  const navItems = [
    { id: 'catalogue', label: 'Explore Goals', active: currentView === 'catalogue' },
    { id: 'dashboard', label: 'My Progress', active: currentView === 'dashboard', badge: userGoals.length },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-3"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">🎯</span>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                RBC Goals
              </h1>
              <p className="text-xs text-gray-500">Smart Investing</p>
            </div>
          </motion.div>

          {/* Navigation */}
          <nav className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant={item.active ? "default" : "ghost"}
                onClick={() => setCurrentView(item.id as 'auth' | 'catalogue' | 'setup' | 'dashboard')}
                className="relative"
              >
                {item.label}
                {item.badge && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </Button>
            ))}
          </nav>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            {user && currentClient && (
              <>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{currentClient.name.split(' ')[0]}</p>
                  <p className="text-xs text-gray-500">{user.teamName}</p>
                </div>
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    {currentClient.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Logout
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
