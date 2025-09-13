'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../lib/store';
import { calculateRequiredMonthly, getStrategyDisplayName, getStrategyDescription } from '../lib/goals-data';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Progress } from './ui/progress';
import { ArrowLeft, TrendingUp, Calendar, DollarSign, Target, Shield, Zap } from 'lucide-react';
import { PortfolioType } from '../lib/types';

// Debounce hook for performance optimization
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function GoalSetup() {
  const { selectedGoal, setCurrentView, createGoalBasedInvestment, isLoading, currentClient } = useAppStore();
  const [setupMode, setSetupMode] = useState<'monthly' | 'timeline'>('monthly');
  const [monthlyAmount, setMonthlyAmount] = useState(200);
  const [targetMonths, setTargetMonths] = useState(24);
  const [selectedStrategy, setSelectedStrategy] = useState<PortfolioType>('balanced');
  const [projection, setProjection] = useState<{
    monthsToGoal: number;
    totalContributions: number;
    projectedReturns: number;
    futureValue: number;
    confidence: number;
  } | null>(null);

  // Debounce expensive calculation inputs to prevent lag on every keystroke
  const debouncedMonthlyAmount = useDebounce(monthlyAmount, 300);
  const debouncedTargetMonths = useDebounce(targetMonths, 300);

  useEffect(() => {
    if (selectedGoal) {
      setMonthlyAmount(selectedGoal.minMonthlyInvestment);
      setTargetMonths(selectedGoal.estimatedMonths);
      setSelectedStrategy(selectedGoal.recommendedStrategy);
    }
  }, [selectedGoal]);

  const calculateProjection = useCallback(() => {
    if (!selectedGoal) return;

    const actualMonthly = setupMode === 'monthly' 
      ? debouncedMonthlyAmount 
      : calculateRequiredMonthly(selectedGoal.finalPrice, debouncedTargetMonths, selectedStrategy);
    
    const actualMonths = setupMode === 'monthly'
      ? Math.ceil(selectedGoal.finalPrice / debouncedMonthlyAmount)
      : debouncedTargetMonths;

    const totalContributions = actualMonthly * actualMonths;
    
    // Simple projection based on strategy
    const expectedReturns: Record<PortfolioType, number> = {
      very_conservative: 0.03,
      conservative: 0.05,
      balanced: 0.07,
      growth: 0.09,
      aggressive_growth: 0.12,
    };

    const annualReturn = expectedReturns[selectedStrategy];
    const monthlyReturn = annualReturn / 12;
    
    let futureValue = 0;
    for (let month = 1; month <= actualMonths; month++) {
      futureValue = (futureValue + actualMonthly) * (1 + monthlyReturn);
    }

    const projectedReturns = futureValue - totalContributions;
    const confidence = selectedStrategy === 'very_conservative' ? 90 :
                      selectedStrategy === 'conservative' ? 85 :
                      selectedStrategy === 'balanced' ? 80 :
                      selectedStrategy === 'growth' ? 75 : 70;

    setProjection({
      monthsToGoal: actualMonths,
      totalContributions,
      projectedReturns,
      futureValue,
      confidence,
    });
  }, [selectedGoal, setupMode, debouncedMonthlyAmount, debouncedTargetMonths, selectedStrategy]);

  useEffect(() => {
    if (selectedGoal) {
      calculateProjection();
    }
  }, [selectedGoal, calculateProjection]);

  const handleCreateGoal = async () => {
    if (!selectedGoal || !currentClient) return;

    const actualMonthly = setupMode === 'monthly' 
      ? monthlyAmount 
      : calculateRequiredMonthly(selectedGoal.finalPrice, targetMonths, selectedStrategy);
    
    const actualMonths = setupMode === 'monthly'
      ? Math.ceil(selectedGoal.finalPrice / monthlyAmount)
      : targetMonths;

    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + actualMonths);

    const success = await createGoalBasedInvestment(
      selectedGoal.id,
      actualMonthly,
      targetDate
    );

    if (success) {
      setCurrentView('dashboard');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStrategyIcon = (strategy: PortfolioType) => {
    switch (strategy) {
      case 'very_conservative':
        return <Shield className="w-4 h-4" />;
      case 'conservative':
        return <Shield className="w-4 h-4" />;
      case 'balanced':
        return <Target className="w-4 h-4" />;
      case 'growth':
        return <TrendingUp className="w-4 h-4" />;
      case 'aggressive_growth':
        return <Zap className="w-4 h-4" />;
      default:
        return <Target className="w-4 h-4" />;
    }
  };

  const getStrategyColor = (strategy: PortfolioType) => {
    switch (strategy) {
      case 'very_conservative':
        return 'bg-gray-100 text-gray-800';
      case 'conservative':
        return 'bg-blue-100 text-blue-800';
      case 'balanced':
        return 'bg-green-100 text-green-800';
      case 'growth':
        return 'bg-orange-100 text-orange-800';
      case 'aggressive_growth':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!selectedGoal) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-600">No goal selected</p>
          <Button onClick={() => setCurrentView('catalogue')} className="mt-4">
            Browse Goals
          </Button>
        </div>
      </div>
    );
  }

  const requiredMonthly = setupMode === 'timeline' 
    ? calculateRequiredMonthly(selectedGoal.finalPrice, targetMonths, selectedStrategy)
    : 0;

  const estimatedMonths = setupMode === 'monthly'
    ? Math.ceil(selectedGoal.finalPrice / monthlyAmount)
    : 0;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => setCurrentView('catalogue')}
          className="shrink-0"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Set Up Your Investment</h1>
          <p className="text-gray-600">Configure your goal-based investment strategy</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Goal Summary */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>Your Goal</span>
                <Badge variant="outline">{selectedGoal.category}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedGoal.title}</h3>
                <p className="text-sm text-gray-600">{selectedGoal.description}</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="line-through">{formatCurrency(selectedGoal.basePrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">RBC Discount</span>
                  <span className="text-green-600">-{selectedGoal.discountPercent}%</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Your Price</span>
                  <span className="text-blue-600">{formatCurrency(selectedGoal.finalPrice)}</span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="flex items-center gap-2 mb-2">
                  {getStrategyIcon(selectedStrategy)}
                  <span className="font-medium">Recommended Strategy</span>
                </div>
                <Badge className={getStrategyColor(selectedStrategy)}>
                  {getStrategyDisplayName(selectedStrategy)}
                </Badge>
                <p className="text-xs text-gray-600 mt-1">
                  {getStrategyDescription(selectedStrategy)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-xs text-gray-600 mb-1">Partner</p>
                <p className="font-medium">{selectedGoal.partnerName}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Setup Configuration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader>
              <CardTitle>Investment Configuration</CardTitle>
              <CardDescription>
                Choose how you want to structure your goal-based investment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={setupMode} onValueChange={(value) => setSetupMode(value as 'monthly' | 'timeline')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="monthly" className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Set Monthly Amount
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Set Timeline
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="monthly" className="space-y-6 mt-6">
                  <div>
                    <Label htmlFor="monthly-amount">Monthly Investment Amount</Label>
                    <div className="mt-2">
                      <Input
                        id="monthly-amount"
                        type="number"
                        value={monthlyAmount}
                        onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                        min={selectedGoal.minMonthlyInvestment}
                        max={selectedGoal.maxMonthlyInvestment}
                        step="50"
                      />
                      <div className="mt-2">
                        <Slider
                          value={[monthlyAmount]}
                          onValueChange={(value) => setMonthlyAmount(value[0])}
                          min={selectedGoal.minMonthlyInvestment}
                          max={selectedGoal.maxMonthlyInvestment}
                          step={50}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>{formatCurrency(selectedGoal.minMonthlyInvestment)}</span>
                        <span>{formatCurrency(selectedGoal.maxMonthlyInvestment)}</span>
                      </div>
                    </div>
                  </div>

                  {estimatedMonths > 0 && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-900">Estimated Timeline</span>
                      </div>
                      <p className="text-blue-800">
                        <span className="text-2xl font-bold">{estimatedMonths}</span> months to reach your goal
                      </p>
                      <p className="text-sm text-blue-700">
                        Target completion: {new Date(Date.now() + estimatedMonths * 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="timeline" className="space-y-6 mt-6">
                  <div>
                    <Label htmlFor="target-months">Target Timeline (months)</Label>
                    <div className="mt-2">
                      <Input
                        id="target-months"
                        type="number"
                        value={targetMonths}
                        onChange={(e) => setTargetMonths(Number(e.target.value))}
                        min={6}
                        max={60}
                        step="1"
                      />
                      <div className="mt-2">
                        <Slider
                          value={[targetMonths]}
                          onValueChange={(value) => setTargetMonths(value[0])}
                          min={6}
                          max={60}
                          step={1}
                          className="w-full"
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>6 months</span>
                        <span>5 years</span>
                      </div>
                    </div>
                  </div>

                  {requiredMonthly > 0 && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <DollarSign className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-green-900">Required Monthly Investment</span>
                      </div>
                      <p className="text-green-800">
                        <span className="text-2xl font-bold">{formatCurrency(requiredMonthly)}</span> per month
                      </p>
                      <p className="text-sm text-green-700">
                        Based on {getStrategyDisplayName(selectedStrategy)} strategy
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Investment Strategy Selection */}
              <div className="mt-8">
                <Label>Investment Strategy</Label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                  {(['very_conservative', 'conservative', 'balanced', 'growth', 'aggressive_growth'] as PortfolioType[]).map((strategy) => (
                    <motion.button
                      key={strategy}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedStrategy(strategy)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        selectedStrategy === strategy
                          ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        {getStrategyIcon(strategy)}
                        <span className="font-medium text-sm">{getStrategyDisplayName(strategy)}</span>
                      </div>
                      <p className="text-xs text-gray-600">{getStrategyDescription(strategy)}</p>
                    </motion.button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Projection Results */}
      {projection && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Investment Projection
              </CardTitle>
              <CardDescription>
                Based on historical performance and {getStrategyDisplayName(selectedStrategy)} strategy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Timeline</p>
                  <p className="text-2xl font-bold text-gray-900">{projection.monthsToGoal}</p>
                  <p className="text-xs text-gray-500">months</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Total Contributions</p>
                  <p className="text-2xl font-bold text-blue-600">{formatCurrency(projection.totalContributions)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Projected Returns</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(projection.projectedReturns)}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-1">Final Value</p>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(projection.futureValue)}</p>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">Confidence Level</span>
                  <span className="text-sm font-medium">{projection.confidence}%</span>
                </div>
                <Progress value={projection.confidence} className="h-2" />
                <p className="text-xs text-gray-500 mt-2">
                  Based on {getStrategyDisplayName(selectedStrategy)} historical performance
                </p>
              </div>

              <div className="flex gap-3 mt-6">
                <Button 
                  onClick={handleCreateGoal}
                  disabled={isLoading || !currentClient}
                  className="flex-1"
                >
                  {isLoading ? 'Creating Investment...' : 'Start Investing'}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentView('catalogue')}
                >
                  Choose Different Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
