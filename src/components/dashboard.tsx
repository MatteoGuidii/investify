'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAppStore } from '../lib/store';
import { apiService } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { PlusCircle, RefreshCw, Wallet } from 'lucide-react';
import { Portfolio } from '../lib/types';

export function Dashboard() {
  const { 
    currentClient,
    userGoals, 
    setCurrentView,
    isLoading,
    setLoading
  } = useAppStore();
  
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [clientCash, setClientCash] = useState(0);

  const loadData = useCallback(async () => {
    if (!currentClient) return;

    setLoading(true);
    try {
      // Get client data
      const clientResponse = await apiService.getClient(currentClient.id);
      if (clientResponse.success && clientResponse.data) {
        setClientCash(clientResponse.data.cash);
      }

      // Get portfolios
      const portfolioResponse = await apiService.getClientPortfolios(currentClient.id);
      if (portfolioResponse.success && portfolioResponse.data) {
        setPortfolios(portfolioResponse.data);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [currentClient, setLoading]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        <p>Please log in to view your dashboard.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {currentClient.name}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setCurrentView('catalogue')}>
            <PlusCircle className="w-4 h-4 mr-2" />
            New Goal
          </Button>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Available Cash</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wallet className="w-5 h-5 mr-2 text-green-600" />
              <span className="text-2xl font-bold">{formatCurrency(clientCash)}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Invested</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold">
                {formatCurrency(portfolios.reduce((sum, p) => sum + p.current_value, 0))}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <span className="text-2xl font-bold">{userGoals.length}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Your Goals</h2>
        
        {userGoals.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-gray-600 mb-4">
              Start your investment journey by choosing your first goal
            </p>
            <Button onClick={() => setCurrentView('catalogue')}>
              <PlusCircle className="w-4 h-4 mr-2" />
              Choose Your First Goal
            </Button>
          </Card>
        ) : (
          <div className="grid gap-4">
            {userGoals.map((userGoal, index) => {
              const portfolio = portfolios.find(p => p.id === userGoal.portfolioId);
              const progress = portfolio 
                ? Math.round((portfolio.current_value / userGoal.targetAmount) * 100)
                : userGoal.progressPercent;

              return (
                <Card key={`${userGoal.id}-${userGoal.goalId}-${index}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCategoryIcon(userGoal.goal.category)}</span>
                        <div>
                          <CardTitle className="text-lg">{userGoal.goal.title}</CardTitle>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(userGoal.monthlyContribution)}/month
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Target</p>
                        <p className="font-semibold">{formatCurrency(userGoal.targetAmount)}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span className="font-medium">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="flex justify-between text-sm">
                        <span>Current Value</span>
                        <span className="font-medium">
                          {formatCurrency(portfolio?.current_value || userGoal.currentAmount)}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
