'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '@/lib/store';
import { GOAL_CATALOGUE, GOAL_CATEGORIES } from '@/lib/goals-data';
import { Goal } from '@/lib/types';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

export function GoalCatalogue() {
  const { setSelectedGoal, setCurrentView } = useAppStore();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filteredGoals, setFilteredGoals] = useState<Goal[]>(GOAL_CATALOGUE);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredGoals(GOAL_CATALOGUE);
    } else {
      setFilteredGoals(GOAL_CATALOGUE.filter(goal => goal.category === selectedCategory));
    }
  }, [selectedCategory]);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
          What&apos;s Your Next Big Goal?
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Transform your dreams into achievable financial goals. Choose from our curated catalogue 
          of experiences and products, each with exclusive RBC member benefits.
        </p>
      </motion.div>

      {/* Category Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap justify-center gap-2 mb-8"
      >
        {GOAL_CATEGORIES.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="flex items-center gap-2"
          >
            <span className="text-base">{category.icon}</span>
            {category.name}
          </Button>
        ))}
      </motion.div>

      {/* Goals Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredGoals.map((goal, index) => (
          <motion.div
            key={goal.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * index }}
            whileHover={{ y: -5 }}
          >
            <Card className="h-full hover:shadow-lg transition-all duration-300 group">
              <CardHeader className="pb-4">
                <div className="aspect-video bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg mb-4 flex items-center justify-center text-4xl">
                  {GOAL_CATEGORIES.find(cat => cat.id === goal.category)?.icon || '🎯'}
                </div>
                <CardTitle className="group-hover:text-blue-600 transition-colors">
                  {goal.title}
                </CardTitle>
                <CardDescription>{goal.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Regular Price</span>
                  <span className="line-through text-gray-400">{formatCurrency(goal.basePrice)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">RBC Member Price</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-700">
                      {goal.discountPercent}% OFF
                    </Badge>
                    <span className="text-lg font-bold text-green-600">
                      {formatCurrency(goal.finalPrice)}
                    </span>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span>Estimated Timeline</span>
                    <span className="font-medium">{goal.estimatedMonths} months</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Monthly from</span>
                    <span className="font-medium">{formatCurrency(goal.minMonthlyInvestment)}</span>
                  </div>
                </div>

                <div className="pt-2">
                  <p className="text-xs text-gray-500 mb-2">Partner: {goal.partnerName}</p>
                  <div className="flex flex-wrap gap-1">
                    {goal.features.slice(0, 2).map((feature: string, idx: number) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {goal.features.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{goal.features.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>

              <CardFooter>
                <Button 
                  onClick={() => handleSelectGoal(goal)}
                  className="w-full group-hover:bg-blue-600 group-hover:text-white transition-all"
                >
                  Start Investing
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredGoals.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <p className="text-gray-500">No goals found in this category.</p>
        </motion.div>
      )}
    </div>
  );
}
