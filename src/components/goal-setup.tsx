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
  const [targetMonths, setTargetMonths] = useState(24);

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

  const handleCreateGoal = async () => {
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + targetMonths);
    
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
            <Label htmlFor="targetMonths">Target Timeline (Months)</Label>
            <Input
              id="targetMonths"
              type="number"
              value={targetMonths}
              onChange={(e) => setTargetMonths(Number(e.target.value))}
              min="3"
              max="120"
            />
          </div>

          {/* Simple Projection */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Projection</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Total contributions:</span>
                <span>{formatCurrency(monthlyAmount * targetMonths)}</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated growth (6% annual):</span>
                <span>{formatCurrency((monthlyAmount * targetMonths) * 0.06 * (targetMonths / 12))}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Projected total:</span>
                <span>{formatCurrency((monthlyAmount * targetMonths) * 1.06)}</span>
              </div>
            </div>
          </div>

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