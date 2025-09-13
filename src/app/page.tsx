'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { GoalCatalogue } from '@/components/goal-catalogue';
import { GoalSetup } from '@/components/goal-setup';
import { Dashboard } from '@/components/dashboard';
import { Header } from '@/components/header';
import { AuthForm } from '@/components/auth-form';

export default function Home() {
  const { currentView, initializeFromStorage } = useAppStore();

  useEffect(() => {
    initializeFromStorage();
  }, [initializeFromStorage]);

  const renderCurrentView = () => {
    switch (currentView) {
      case 'auth':
        return <AuthForm />;
      case 'catalogue':
        return <GoalCatalogue />;
      case 'setup':
        return <GoalSetup />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <AuthForm />;
    }
  };

  // Don't show header for auth view
  if (currentView === 'auth') {
    return renderCurrentView();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />
      
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="pt-20"
      >
        {renderCurrentView()}
      </motion.main>
      
      {/* Background decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-4 w-72 h-72 bg-blue-100 rounded-full opacity-20 blur-3xl" />
        <div className="absolute bottom-1/4 -right-4 w-72 h-72 bg-purple-100 rounded-full opacity-20 blur-3xl" />
      </div>
    </div>
  );
}
