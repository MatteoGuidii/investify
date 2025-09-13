'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../lib/store';
import { apiService } from '../lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  PlusCircle,
  RefreshCw,
  BarChart3,
  Wallet
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Portfolio, SimulationResult } from '../lib/types';
import { getStrategyDisplayName } from '../lib/goals-data';

export function Dashboard() {
  const { 
    user,
    currentClient,
    userGoals, 
    setCurrentView,
    isLoading,
    setLoading,
    setError
  } = useAppStore();
  
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);

  const loadPortfoliosAndSimulations = async () => {
    if (!currentClient) return;

    setLoading(true);
    try {
      // Get all portfolios for the client
      const portfolioResponse = await apiService.getClientPortfolios(currentClient.id);
      if (portfolioResponse.success && portfolioResponse.data) {
        setPortfolios(portfolioResponse.data);

        // Run simulations for all portfolios
        if (portfolioResponse.data.length > 0) {
          const simulationResponse = await apiService.simulateClientPortfolios(currentClient.id, {
            months: 12
          });

          if (simulationResponse.success && simulationResponse.data?.results) {
            setSimulationResults(simulationResponse.data.results);
          }
        }
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentClient) {
      loadPortfoliosAndSimulations();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentClient]); // loadPortfoliosAndSimulations is defined above, not in dependency

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`;
  };

  const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const totalPortfolioValue = portfolios.reduce((sum, p) => sum + p.current_value, 0);
  const totalInvested = portfolios.reduce((sum, p) => sum + p.invested_amount, 0);
  const totalReturns = totalPortfolioValue - totalInvested;
  const totalReturnPercent = totalInvested > 0 ? (totalReturns / totalInvested) : 0;

  const getPortfolioChartData = (portfolio: Portfolio) => {
    return portfolio.growth_trend.map(point => ({
      date: point.date,
      value: point.value,
    }));
  };

  const getSimulationForPortfolio = (portfolioId: string) => {
    return simulationResults.find(s => s.portfolioId === portfolioId);
  };

  if (!currentClient || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">Please log in to view your dashboard</p>
          <Button onClick={() => setCurrentView('auth')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-gray-900"
          >
            Welcome back, {currentClient.name.split(' ')[0]}! 👋
          </motion.h1>
          <p className="text-gray-600 mt-2">
            Track your goal-based investments and watch your dreams become reality
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={loadPortfoliosAndSimulations}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setCurrentView('catalogue')}>
            <PlusCircle className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </div>

      {/* Portfolio Overview */}
      <div className="grid md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Portfolio Value</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(totalPortfolioValue)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Returns</p>
                  <p className={`text-2xl font-bold ${totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(totalReturns)}
                  </p>
                  <p className={`text-sm ${totalReturns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercent(totalReturnPercent)}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  totalReturns >= 0 ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {totalReturns >= 0 ? (
                    <TrendingUp className="w-5 h-5 text-green-600" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-red-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Goals</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userGoals.filter(g => g.status === 'active').length}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Cash</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {formatCurrency(currentClient.cash)}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Portfolios and Goals */}
      <Tabs defaultValue="portfolios" className="space-y-4">
        <TabsList>
          <TabsTrigger value="portfolios">Portfolios</TabsTrigger>
          <TabsTrigger value="goals">Goals</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="portfolios" className="space-y-4">
          {portfolios.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Portfolios Yet</h3>
                <p className="text-gray-600 mb-4">
                  Start your goal-based investing journey by creating your first investment goal.
                </p>
                <Button onClick={() => setCurrentView('catalogue')}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Your First Goal
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {portfolios.map((portfolio) => {
                const simulation = getSimulationForPortfolio(portfolio.id);
                const returns = portfolio.current_value - portfolio.invested_amount;
                const returnPercent = portfolio.invested_amount > 0 ? (returns / portfolio.invested_amount) : 0;

                return (
                  <motion.div
                    key={portfolio.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {getStrategyDisplayName(portfolio.type)} Portfolio
                            </h3>
                            <p className="text-sm text-gray-600">
                              Created {new Date(portfolio.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline">
                            {portfolio.type.replace('_', ' ')}
                          </Badge>
                        </div>

                        <div className="grid md:grid-cols-3 gap-4 mb-4">
                          <div>
                            <p className="text-sm font-medium text-gray-600">Current Value</p>
                            <p className="text-xl font-bold text-gray-900">
                              {formatCurrency(portfolio.current_value)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Invested</p>
                            <p className="text-lg text-gray-700">
                              {formatCurrency(portfolio.invested_amount)}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">Returns</p>
                            <p className={`text-lg font-semibold ${returns >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(returns)} ({formatPercent(returnPercent)})
                            </p>
                          </div>
                        </div>

                        {simulation && (
                          <div className="bg-blue-50 rounded-lg p-4 mb-4">
                            <h4 className="font-medium text-blue-900 mb-2">12-Month Projection</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-blue-700">Projected Value</p>
                                <p className="font-semibold text-blue-900">
                                  {formatCurrency(simulation.projectedValue)}
                                </p>
                              </div>
                              <div>
                                <p className="text-blue-700">Projected Growth</p>
                                <p className="font-semibold text-blue-900">
                                  {formatCurrency(simulation.projectedValue - simulation.initialValue)}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {portfolio.growth_trend.length > 0 && (
                          <div className="h-32">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={getPortfolioChartData(portfolio)}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis 
                                  dataKey="date" 
                                  tick={{ fontSize: 12 }}
                                  tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                />
                                <YAxis 
                                  tick={{ fontSize: 12 }}
                                  tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                                />
                                <Tooltip 
                                  formatter={(value: number) => [formatCurrency(value), 'Value']}
                                  labelFormatter={(label) => new Date(label).toLocaleDateString()}
                                />
                                <Line 
                                  type="monotone" 
                                  dataKey="value" 
                                  stroke="#2563eb" 
                                  strokeWidth={2}
                                  dot={false}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="goals" className="space-y-4">
          {userGoals.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Set Yet</h3>
                <p className="text-gray-600 mb-4">
                  Transform your dreams into achievable investment goals.
                </p>
                <Button onClick={() => setCurrentView('catalogue')}>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Browse Goal Catalogue
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {userGoals.map((userGoal) => (
                <motion.div
                  key={userGoal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {userGoal.goal.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {userGoal.goal.description}
                          </p>
                        </div>
                        <Badge 
                          variant={userGoal.status === 'active' ? 'default' : 'outline'}
                        >
                          {userGoal.status}
                        </Badge>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{formatPercent(userGoal.progressPercent / 100)}</span>
                        </div>
                        <Progress value={userGoal.progressPercent} className="mb-2" />
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {formatCurrency(userGoal.currentAmount)} saved
                          </span>
                          <span className="text-gray-600">
                            {formatCurrency(userGoal.targetAmount)} goal
                          </span>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Monthly Investment</p>
                          <p className="font-semibold">
                            {formatCurrency(userGoal.monthlyContribution)}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Target Date</p>
                          <p className="font-semibold">
                            {userGoal.targetDate.toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-600">Partner Discount</p>
                          <p className="font-semibold text-green-600">
                            {userGoal.goal.discountPercent}% off
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Portfolio Performance Overview</CardTitle>
              <CardDescription>
                Track your investment performance across all portfolios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {portfolios.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No portfolio data available yet.</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first investment goal to see performance metrics.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-green-50 rounded-lg p-4">
                      <h4 className="font-medium text-green-900 mb-2">Best Performing</h4>
                      {(() => {
                        const best = portfolios.reduce((prev, curr) => {
                          const prevReturn = (prev.current_value - prev.invested_amount) / prev.invested_amount;
                          const currReturn = (curr.current_value - curr.invested_amount) / curr.invested_amount;
                          return currReturn > prevReturn ? curr : prev;
                        });
                        const returns = best.current_value - best.invested_amount;
                        const returnPercent = (returns / best.invested_amount);
                        return (
                          <div>
                            <p className="font-semibold text-green-900">
                              {getStrategyDisplayName(best.type)}
                            </p>
                            <p className="text-green-700">
                              {formatCurrency(returns)} ({formatPercent(returnPercent)})
                            </p>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Total Growth</h4>
                      <p className="font-semibold text-blue-900">
                        {formatCurrency(totalReturns)}
                      </p>
                      <p className="text-blue-700">
                        {formatPercent(totalReturnPercent)} overall return
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 text-center">
                      Last updated: {formatTime(new Date())} UTC
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
