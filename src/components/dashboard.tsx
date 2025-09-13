'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { apiService } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { PlusCircle, RefreshCw, Wallet } from 'lucide-react';
import { Portfolio } from '../lib/types';
import { AiCoach } from './ai-coach';

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
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <div className="text-6xl mb-4">🔐</div>
        <h2 className="text-xl font-semibold mb-2">Authentication Required</h2>
        <p className="text-gray-600 mb-4">Please log in to view your dashboard.</p>
        <Button onClick={() => setCurrentView('auth')}>
          Go to Login
        </Button>
      </div>
    );
  }

  if ((isRefreshing || isLoading) && portfolios.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin rbc-blue" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-4xl mx-auto">
          <div className="flex items-center">
            <div className="text-red-600">⚠️</div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Welcome Section with Blue Gradient */}
      <div className="bg-gradient-to-br from-blue-600 via-rbc-blue to-blue-800 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2 text-white drop-shadow-sm">Welcome back, {currentClient.name}!</h1>
              <p className="text-white/90 drop-shadow-sm">You&apos;re making great progress! Keep up the consistency.</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => { setError(null); loadData(); }} disabled={isRefreshing} className="border-white/40 text-white hover:bg-white/20 hover:border-white/60">
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Loading...' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Summary Cards in Blue Header */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-white/15 border-white/30 text-white backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-white/90 font-medium">Total Saved</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-white drop-shadow-sm">
                  ${Math.round(portfolios.reduce((sum, p) => sum + p.current_value, 0)).toLocaleString()}
                </span>
              </CardContent>
            </Card>

            <Card className="bg-white/15 border-white/30 text-white backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-white/90 font-medium">Monthly Contribution</CardTitle>
              </CardHeader>
              <CardContent>
                <span className="text-3xl font-bold text-white drop-shadow-sm">
                  ${Math.round(userGoals.reduce((sum, g) => sum + g.monthlyContribution, 0)).toLocaleString()}
                </span>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Your Goals Section */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Your Goals</h2>
          {userGoals.length > 2 ? (
            <Button 
              onClick={() => setShowAllGoals(!showAllGoals)} 
              disabled={isRefreshing} 
              className="bg-rbc-blue hover:bg-rbc-blue/90 text-white"
            >
              {showAllGoals ? 'Show less' : `View all (${userGoals.length})`}
            </Button>
          ) : (
            <Button onClick={() => setCurrentView('catalogue')} disabled={isRefreshing} className="bg-rbc-blue hover:bg-rbc-blue/90 text-white">
              Add Goal +
            </Button>
          )}
        </div>

        {/* Goal Cards with Images and Progress */}
        {userGoals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {(showAllGoals ? userGoals : userGoals.slice(0, 2)).map((userGoal, index) => {
              const portfolio = portfolios.find(p => p.id === userGoal.portfolioId);
              const progress = portfolio ? (portfolio.current_value / userGoal.targetAmount) * 100 : 0;
              const progressClamped = Math.min(progress, 100);
              
              return (
                <Card key={`${userGoal.id}-${index}`} className="overflow-hidden">
                  {/* Goal Image */}
                  <div className="h-32 bg-gradient-to-br from-gray-800 to-gray-600 relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-4xl">{getCategoryIcon(userGoal.goal.category)}</span>
                    </div>
                  </div>
                  
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-1">{userGoal.goal.title}</h3>
                    <p className="text-sm text-gray-600 mb-3">{formatCurrency(userGoal.targetAmount)}</p>
                    
                    <div className="space-y-2">
                      <Progress value={progressClamped} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-600 font-medium">{Math.round(progressClamped)}% complete</span>
                        <span className="text-gray-600">
                          Saved: {portfolio ? formatCurrency(portfolio.current_value) : formatCurrency(userGoal.currentAmount)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Goal: {formatCurrency(userGoal.targetAmount)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Add Goal Button when showing all goals */}
        {showAllGoals && userGoals.length > 0 && (
          <div className="text-center mb-8">
            <Button onClick={() => setCurrentView('catalogue')} className="bg-rbc-blue hover:bg-rbc-blue/90 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              Add Another Goal
            </Button>
          </div>
        )}

        {userGoals.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold mb-2">No Goals Yet</h3>
            <p className="text-gray-600 mb-6">Start your savings journey by creating your first goal.</p>
            <Button onClick={() => setCurrentView('catalogue')} className="bg-rbc-blue hover:bg-rbc-blue/90 text-white">
              <PlusCircle className="w-4 h-4 mr-2" />
              Create Your First Goal
            </Button>
          </div>
        )}

        {/* Account Summary */}
        {portfolios.length > 0 && (
          <div className="mt-12">
            <h3 className="text-lg font-semibold mb-4">Account Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="border-gray-200 hover:border-rbc-blue/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Available Cash</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <Wallet className="w-5 h-5 mr-2 rbc-yellow" />
                    <span className="text-2xl font-bold rbc-blue">{formatCurrency(currentClient?.cash || 0)}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 hover:border-rbc-blue/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Total Invested</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold rbc-blue">
                      {formatCurrency(portfolios.reduce((sum, p) => sum + p.invested_amount, 0))}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {portfolios.length} {portfolios.length === 1 ? 'portfolio' : 'portfolios'}
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200 hover:border-rbc-blue/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Current Value</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold rbc-blue">
                      {formatCurrency(portfolios.reduce((sum, p) => sum + p.current_value, 0))}
                    </span>
                  </div>
                  {portfolios.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      {portfolios.reduce((sum, p) => sum + p.total_months_simulated, 0) > 0 
                        ? `${Math.max(...portfolios.map(p => p.total_months_simulated))} months simulated`
                        : 'No simulations yet'}
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="border-gray-200 hover:border-rbc-blue/30 transition-colors">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">Active Goals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold rbc-blue">{userGoals.length}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {userGoals.filter(g => g.status === 'active').length} active
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Portfolio Performance Details */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Portfolio Performance</h3>
              <div className="grid gap-4">
                {portfolios.map((portfolio) => {
                  const totalReturn = portfolio.current_value - portfolio.invested_amount;
                  const returnPercent = portfolio.invested_amount > 0 
                    ? ((totalReturn / portfolio.invested_amount) * 100).toFixed(2)
                    : '0.00';
                  const isPositive = totalReturn >= 0;

                  return (
                    <Card key={portfolio.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-lg capitalize">
                              {portfolio.type.replace('_', ' ')} Portfolio
                            </CardTitle>
                            <p className="text-sm text-gray-600">
                              Created {new Date(portfolio.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total Return</p>
                            <p className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                              {isPositive ? '+' : ''}{formatCurrency(totalReturn)} ({returnPercent}%)
                            </p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Invested Amount</p>
                            <p className="font-medium">{formatCurrency(portfolio.invested_amount)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Current Value</p>
                            <p className="font-medium">{formatCurrency(portfolio.current_value)}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Transactions</p>
                            <p className="font-medium">{portfolio.transactions.length}</p>
                          </div>
                          <div>
                            <p className="text-gray-500">Growth Data Points</p>
                            <p className="font-medium">{portfolio.growth_trend.length}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Coach floating assistant */}
      <AiCoach />
    </div>
  );
}
