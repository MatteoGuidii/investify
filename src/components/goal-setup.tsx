'use client';

import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft } from 'lucide-react';

export function GoalSetup() {
  const { selectedGoal, setCurrentView, createGoalBasedInvestment, isLoading } = useAppStore();
  const [monthlyAmount, setMonthlyAmount] = useState(200);
  const [targetYears, setTargetYears] = useState(2);

  if (!selectedGoal) {
    setCurrentView('catalogue');
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
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

  // Enhanced projection calculation using compound interest
  const calculateProjection = () => {
    const annualRate = 0.07; // 7% annual return (more realistic for balanced portfolio)
    const monthlyRate = annualRate / 12;
    const totalMonths = targetYears * 12;
    
    // Future value of annuity formula: PMT * [((1 + r)^n - 1) / r]
    const futureValue = monthlyAmount * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
    const totalContributions = monthlyAmount * totalMonths;
    const totalGrowth = futureValue - totalContributions;
    
    return {
      totalContributions,
      totalGrowth,
      futureValue,
      monthsToGoal: Math.ceil(selectedGoal.finalPrice / monthlyAmount) // Simple estimate
    };
  };

  const projection = calculateProjection();
  const willReachGoal = projection.futureValue >= selectedGoal.finalPrice;

  const handleCreateGoal = async () => {
    const targetDate = new Date();
    targetDate.setFullYear(targetDate.getFullYear() + targetYears);
    
    const success = await createGoalBasedInvestment(
      selectedGoal.id,
      monthlyAmount,
      targetDate
    );
    
    if (success) {
      setCurrentView('dashboard');
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Back Button */}
      <Button 
        variant="ghost" 
        onClick={() => setCurrentView('catalogue')} 
        className="mb-6"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Goals
      </Button>

      {/* Goal Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-3xl">
              {getCategoryIcon(selectedGoal.category)}
            </span>
            {selectedGoal.title}
          </CardTitle>
          <p className="text-gray-600">{selectedGoal.description}</p>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(selectedGoal.finalPrice)}
          </p>
        </CardHeader>
      </Card>

      {/* Setup Form */}
      <Card>
        <CardHeader>
          <CardTitle>Set Up Your Investment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="monthlyAmount">Monthly Investment</Label>
            <Input
              id="monthlyAmount"
              type="number"
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value))}
              min={selectedGoal.minMonthlyInvestment}
              step="25"
            />
            <p className="text-sm text-gray-500 mt-1">
              Minimum: {formatCurrency(selectedGoal.minMonthlyInvestment)}
            </p>
          </div>

          <div>
            <Label htmlFor="targetYears">Investment Timeline (Years)</Label>
            <Input
              id="targetYears"
              type="number"
              value={targetYears}
              onChange={(e) => setTargetYears(Number(e.target.value))}
              min="1"
              max="30"
              step="0.5"
            />
            <p className="text-sm text-gray-500 mt-1">
              How many years do you want to invest?
            </p>
          </div>

          {/* Enhanced Projection */}
          <div className={`p-4 rounded-lg ${willReachGoal ? 'bg-green-50 border border-green-200' : 'bg-blue-50'}`}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Investment Projection</h3>
              {willReachGoal && (
                <span className="text-green-600 text-sm font-medium">✓ Goal Achievable!</span>
              )}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Total contributions:</span>
                <span className="font-medium">{formatCurrency(projection.totalContributions)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated growth (7% annually):</span>
                <span className="font-medium text-green-600">+{formatCurrency(projection.totalGrowth)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base pt-2 border-t">
                <span>Projected total in {targetYears} years:</span>
                <span className="text-blue-600">{formatCurrency(projection.futureValue)}</span>
              </div>
              <div className="text-xs text-gray-500 pt-1">
                * Assumes 7% annual return with monthly compounding
              </div>
            </div>
          </div>

          {!willReachGoal && (
            <div className="bg-orange-50 border border-orange-200 p-3 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>Tip:</strong> To reach your goal of {formatCurrency(selectedGoal.finalPrice)}, 
                consider increasing your monthly investment or extending your timeline.
              </p>
            </div>
          )}

          <Button 
            onClick={handleCreateGoal} 
            className="w-full" 
            disabled={isLoading || monthlyAmount < selectedGoal.minMonthlyInvestment}
          >
            {isLoading ? 'Creating Investment...' : 'Start Investing'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}