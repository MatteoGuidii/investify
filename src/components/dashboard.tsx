'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { apiService } from '../lib/api';
import { Button } from './ui/button';
import { PlusCircle, RefreshCw, Wallet } from 'lucide-react';
import { Portfolio } from '../lib/types';
import { AiCoach } from './ai-coach';
import { EpicWrapCard } from './wrap/EpicWrapCard';
import { EpicWrapSlideOver } from './wrap/EpicWrapSlideOver';
import { useLocalDismiss } from '../hooks/useLocalDismiss';
import { EpicWrap } from '../lib/wrap/types';

export function Dashboard() {
  const { 
    currentClient,
    userGoals, 
    setCurrentView,
    setCurrentClient,
    isLoading,
    setError,
    error
  } = useAppStore();
  
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAllGoals, setShowAllGoals] = useState(false);
  
  // Epic Wrap state
  const [wrapData, setWrapData] = useState<EpicWrap | null>(null);
  const [showWrapSlideOver, setShowWrapSlideOver] = useState(false);
  const [wrapDismissed, dismissWrap] = useLocalDismiss('wrap_2025_dismissed');

  // Load Epic Wrap data
  const loadWrapData = async () => {
    try {
      const response = await fetch('/api/wrap');
      if (response.ok) {
        const data = await response.json();
        setWrapData(data);
      }
    } catch (error) {
      console.warn('Failed to load wrap data:', error);
    }
  };

  // Epic Wrap handlers
  const handleViewWrapDetails = () => {
    setShowWrapSlideOver(true);
  };

  const handleDismissWrap = () => {
    dismissWrap();
  };

  const handleShareWrap = () => {
    // Copy link to clipboard
    const url = `${window.location.origin}/wrap/2025`;
    navigator.clipboard.writeText(url).then(() => {
      console.log('Wrap link copied to clipboard');
    }).catch(() => {
      console.warn('Failed to copy wrap link');
    });
  };

  const handleDownloadWrap = () => {
    // TODO: Implement image download functionality
    console.log('Download wrap image - TODO: implement');
  };

  const loadData = async () => {
    if (!currentClient) {
      console.warn('Cannot load data: no current client');
      return;
    }

    // Check if we have authentication
    const token = localStorage.getItem('rbc_jwt_token');
    if (!token) {
      console.error('No JWT token found');
      setError('Authentication required. Please log in again.');
      setCurrentView('auth');
      return;
    }

    setIsRefreshing(true);
    setError(null);
    
    try {
      console.log(`Loading data for client: ${currentClient.id}`);
      
      // Load Epic Wrap data (don't block on this)
      loadWrapData();
      
      // Get updated client data with current cash balance
      const clientResponse = await apiService.getClient(currentClient.id);
      if (clientResponse.success && clientResponse.data) {
        console.log('Client data loaded successfully');
        setCurrentClient(clientResponse.data);
      } else {
        console.warn('Failed to load client data:', clientResponse.message);
        if (clientResponse.message?.includes('Unauthorized')) {
          setError('Session expired. Please log in again.');
          setCurrentView('auth');
          return;
        }
      }

      // Get portfolios with full data including transactions and growth trends
      const portfolioResponse = await apiService.getClientPortfolios(currentClient.id);
      if (portfolioResponse.success && portfolioResponse.data) {
        console.log(`Loaded ${portfolioResponse.data.length} portfolios`);
        setPortfolios(portfolioResponse.data);
        
        // If any portfolios exist but haven't been simulated, offer simulation
        const unSimulatedPortfolios = portfolioResponse.data.filter(p => p.total_months_simulated === 0);
        if (unSimulatedPortfolios.length > 0) {
          console.info(`${unSimulatedPortfolios.length} portfolios available for simulation`);
        }
      } else {
        console.warn('Failed to load portfolios:', portfolioResponse.message);
        if (portfolioResponse.message?.includes('Unauthorized')) {
          setError('Session expired. Please log in again.');
          setCurrentView('auth');
          return;
        }
        setPortfolios([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Call loadData only once on mount if we have a current client
    if (currentClient) {
      loadData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClient?.id]); // Only re-run if client ID changes

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel': return '✈️';
      case 'education': return '🎓';
      case 'tech': return '📱';
      case 'car': return '🚗';
      case 'home': return '🏠';
      case 'experience': return '🎵';
      case 'lifestyle': return '💰';
      default: return '🎯';
    }
  };

  if (!currentClient) {
    return (
      <div className="min-h-screen bg-neo-dark flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neo-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neo-accent/10 rounded-full blur-3xl animate-pulse delay-700"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400/5 rounded-full blur-2xl"></div>
        </div>
        
        <div className="neo-card p-8 text-center max-w-md relative z-10">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-xl font-semibold text-white mb-2">Authentication Required</h2>
          <p className="text-gray-400 mb-6">Please log in to view your dashboard.</p>
          <Button onClick={() => setCurrentView('auth')} className="neo-button">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if ((isRefreshing || isLoading) && portfolios.length === 0) {
    return (
      <div className="min-h-screen bg-neo-dark flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neo-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neo-accent/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="neo-card p-8 text-center relative z-10">
          <RefreshCw className="w-12 h-12 mx-auto mb-4 animate-spin text-green-400" />
          <p className="text-white text-lg">Loading your dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching your latest portfolio data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neo-dark relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neo-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neo-accent/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-green-400/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 px-6 py-8">
        {/* Error Display */}
        {error && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="neo-glass-strong border-red-400/30 p-4 rounded-2xl">
              <div className="flex items-center">
                <div className="text-red-400 text-xl">⚠️</div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-medium text-red-300">Error</h3>
                  <p className="text-sm text-red-200 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300 text-xl"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Welcome Section */}
        <div className="max-w-6xl mx-auto mb-6">
          <div className="neo-card p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h1 className="text-2xl font-semibold mb-2 text-white">
                  Welcome back, {currentClient.name}!
                </h1>
                <p className="text-gray-400 text-sm">You&apos;re making great progress! Keep up the consistency.</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => { setError(null); loadWrapData(); setShowWrapSlideOver(true); }} 
                  className="neo-button-secondary text-xs px-3 py-1.5"
                >
                  <span className="mr-1.5">🎉</span>
                  View Wrap
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => { setError(null); loadData(); }} 
                  disabled={isRefreshing} 
                  className="neo-button-secondary text-xs px-3 py-1.5"
                >
                  <RefreshCw className={`w-3 h-3 mr-1.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {isRefreshing ? 'Loading...' : 'Refresh'}
                </Button>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="neo-glass p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-400/20 flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-green-400" />
                  </div>
                  <h3 className="text-white/90 font-medium text-sm">Total Saved</h3>
                </div>
                <span className="text-2xl font-semibold text-white">
                  ${Math.round(portfolios.reduce((sum, p) => sum + p.current_value, 0)).toLocaleString()}
                </span>
              </div>

              <div className="neo-glass p-4 rounded-xl">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-400/20 flex items-center justify-center">
                    <RefreshCw className="w-4 h-4 text-green-400" />
                  </div>
                  <h3 className="text-white/90 font-medium text-sm">Monthly Contribution</h3>
                </div>
                <span className="text-2xl font-semibold text-white">
                  ${Math.round(userGoals.reduce((sum, g) => sum + g.monthlyContribution, 0)).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Epic Wrap Section */}
        {wrapData && !wrapDismissed && (
          <div className="max-w-6xl mx-auto mb-6">
            <EpicWrapCard
              wrap={wrapData}
              onViewDetails={handleViewWrapDetails}
              onDismiss={handleDismissWrap}
              onShare={handleShareWrap}
            />
          </div>
        )}

        {/* Your Goals Section */}
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">Your Goals</h2>
            {userGoals.length > 2 ? (
              <Button 
                variant="ghost"
                onClick={() => setShowAllGoals(!showAllGoals)}
                className="text-white hover:text-green-400 transition-colors text-xs"
              >
                {showAllGoals ? 'Show less' : `View all (${userGoals.length})`}
              </Button>
            ) : (
              <Button 
                onClick={() => setCurrentView('catalogue')} 
                disabled={isRefreshing} 
                className="neo-button text-xs px-3 py-1.5"
              >
                Add Goal +
              </Button>
            )}
          </div>

          {/* Goal Cards */}
          {userGoals.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {(showAllGoals ? userGoals : userGoals.slice(0, 2)).map((userGoal, index) => {
                const portfolio = portfolios.find(p => p.id === userGoal.portfolioId);
                const progress = portfolio ? (portfolio.current_value / userGoal.targetAmount) * 100 : 0;
                const progressClamped = Math.min(progress, 100);
                
                return (
                  <div key={`${userGoal.id}-${index}`} className="neo-card p-4 hover:scale-[1.02] transition-transform">
                    {/* Goal Image */}
                    <div className="h-20 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-xl relative mb-4 neo-glass">
                      <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-xl">
                        <span className="text-3xl">{getCategoryIcon(userGoal.goal.category)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-semibold text-base mb-1 text-white">{userGoal.goal.title}</h3>
                      <p className="text-sm text-green-400 font-medium mb-3">{formatCurrency(userGoal.targetAmount)}</p>
                      
                      <div className="space-y-2">
                        <div className="relative">
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                              style={{ width: `${progressClamped}%` }}
                            ></div>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-400 font-medium">{Math.round(progressClamped)}% complete</span>
                          <span className="text-gray-400">
                            {portfolio ? formatCurrency(portfolio.current_value) : formatCurrency(userGoal.currentAmount)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* No Goals State */}
          {userGoals.length === 0 && (
            <div className="text-center py-12">
              <div className="neo-card p-8 max-w-md mx-auto">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-lg font-semibold mb-2 text-white">No Goals Yet</h3>
                <p className="text-gray-400 text-sm mb-6">Start your savings journey by creating your first goal.</p>
                <Button onClick={() => setCurrentView('catalogue')} className="neo-button">
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </div>
            </div>
          )}

          {/* Account Summary */}
          {portfolios.length > 0 && (
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-white">Account Overview</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="neo-glass p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-400/20 flex items-center justify-center">
                      <Wallet className="w-4 h-4 text-yellow-400" />
                    </div>
                    <h4 className="text-white/90 font-medium text-sm">Available Cash</h4>
                  </div>
                  <span className="text-lg font-semibold text-white">{formatCurrency(currentClient?.cash || 0)}</span>
                </div>

                <div className="neo-glass p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-green-400/20 flex items-center justify-center">
                      <span className="text-green-400">💰</span>
                    </div>
                    <h4 className="text-white/90 font-medium text-sm">Total Invested</h4>
                  </div>
                  <span className="text-lg font-semibold text-white">
                    {formatCurrency(portfolios.reduce((sum, p) => sum + p.invested_amount, 0))}
                  </span>
                </div>

                <div className="neo-glass p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-400/20 flex items-center justify-center">
                      <span className="text-blue-400">📈</span>
                    </div>
                    <h4 className="text-white/90 font-medium text-sm">Current Value</h4>
                  </div>
                  <span className="text-lg font-semibold text-white">
                    {formatCurrency(portfolios.reduce((sum, p) => sum + p.current_value, 0))}
                  </span>
                </div>

                <div className="neo-glass p-4 rounded-xl">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-purple-400/20 flex items-center justify-center">
                      <span className="text-purple-400">🎯</span>
                    </div>
                    <h4 className="text-white/90 font-medium text-sm">Active Goals</h4>
                  </div>
                  <span className="text-lg font-semibold text-white">{userGoals.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Coach floating assistant */}
      <AiCoach />

      {/* Epic Wrap Slide Over */}
      {wrapData && (
        <EpicWrapSlideOver
          wrap={wrapData}
          isOpen={showWrapSlideOver}
          onClose={() => setShowWrapSlideOver(false)}
          onShare={handleShareWrap}
          onDownload={handleDownloadWrap}
        />
      )}
    </div>
  );
}
