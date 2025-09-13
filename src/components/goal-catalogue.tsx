'use client';

import { useAppStore } from '@/lib/store';
import { GOAL_CATALOGUE } from '@/lib/goals-data';
import { Goal } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

export function GoalCatalogue() {
  const { setSelectedGoal, setCurrentView } = useAppStore();

  const handleSelectGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setCurrentView('setup');
  };

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Simple Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Choose Your Goal
        </h1>
        <p className="text-gray-600">
          Select what you want to save for
        </p>
      </div>

      {/* Simple Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GOAL_CATALOGUE.map((goal) => (
          <Card key={goal.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="text-4xl mb-2">
                {getCategoryIcon(goal.category)}
              </div>
              <CardTitle className="text-lg">{goal.title}</CardTitle>
              <CardDescription className="text-sm">{goal.description}</CardDescription>
            </CardHeader>
            
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Target</span>
                  <span className="font-semibold">{formatCurrency(goal.finalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Monthly from</span>
                  <span className="text-sm">{formatCurrency(goal.minMonthlyInvestment)}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                onClick={() => handleSelectGoal(goal)}
                className="w-full"
                variant="outline"
              >
                Start Saving
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}