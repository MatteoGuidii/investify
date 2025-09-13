'use client';

import { useEffect } from 'react';
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
    <div className="min-h-screen">
      <Header />
      <main>
        {renderCurrentView()}
      </main>
    </div>
  );
}
