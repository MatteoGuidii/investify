"use client";

import { useAppStore } from "../lib/store";
import { BarChart3, Target, Trophy } from "lucide-react";

export function Header() {
  const { user, currentClient, currentView, setCurrentView, logout } =
    useAppStore();

  const navigationItems = [
    { key: "dashboard", label: "Dashboard", icon: BarChart3 },
    { key: "catalogue", label: "Goals", icon: Target },
    { key: "rewards", label: "Rewards", icon: Trophy },
  ];

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
                {/* Removed decorative accent circle */}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Investify</h1>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex items-center space-x-1 bg-white/5 rounded-2xl p-1 border border-white/10">
              {navigationItems.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() =>
                    setCurrentView(key as "dashboard" | "catalogue" | "rewards")
                  }
                  className={`
                    flex items-center space-x-2 px-4 py-2.5 rounded-xl text-base font-medium transition-all duration-300
                    ${
                      currentView === key
                        ? "bg-white/20 text-white shadow-lg border border-white/20"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }
                  `}
                >
                  <Icon className="w-4 h-4 text-green-400" />
                  <span>{label}</span>
                </button>
              ))}
            </nav>

            {/* User Info & Actions */}
            <div className="flex items-center space-x-4">
              {/* User Avatar */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-base font-semibold text-white">
                    {currentClient?.name || user?.teamName || "Test User"}
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center hover:scale-105 transition-transform"
                >
                  <span className="text-base font-bold text-white">
                    {(currentClient?.name || user?.teamName || "Test User")
                      .charAt(0)
                      .toUpperCase()}
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
