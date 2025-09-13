'use client';

import { useAppStore } from '@/lib/store';
import { GOAL_CATALOGUE } from '@/lib/goals-data';
import { Goal } from '@/lib/types';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

export function GoalCatalogue() {
  const { setSelectedGoal, setCurrentView, userGoals } = useAppStore();

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
      {/* Existing Goals Banner */}
      {userGoals.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium rbc-blue">
                You have {userGoals.length} active goal{userGoals.length !== 1 ? 's' : ''}
              </h3>
              <p className="text-sm text-gray-600">
                View your progress or add another goal below
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => setCurrentView('dashboard')}
              className="border-gray-300 text-gray-700 hover:border-rbc-blue hover:text-rbc-blue"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      )}

      {/* Simple Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold rbc-blue mb-2">
          {userGoals.length > 0 ? 'Add Another Goal' : 'Choose Your Goal'}
        </h1>
        <p className="text-gray-600">
          Select what you want to save for
        </p>
      </div>

      {/* Simple Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GOAL_CATALOGUE.map((goal) => (
          <Card key={goal.id} className="hover:shadow-md transition-all border-gray-200 hover:border-rbc-blue/30">
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
                  <span className="font-semibold rbc-blue">{formatCurrency(goal.finalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Monthly from</span>
                  <span className="text-sm text-gray-700">{formatCurrency(goal.minMonthlyInvestment)}</span>
                </div>
              </div>
            </CardContent>

            <CardFooter>
              <Button 
                onClick={() => handleSelectGoal(goal)}
                className="w-full bg-rbc-blue hover:bg-rbc-blue/90 text-white"
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