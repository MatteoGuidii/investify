import { UserGoal } from './types';

// Demo user goals to populate the dashboard
export const DEMO_USER_GOALS: UserGoal[] = [
  {
    id: 'demo-goal-1',
    goalId: 'grad-trip-europe',
    clientId: 'demo-client-1',
    portfolioId: 'demo-portfolio-1',
    goal: {
      id: 'grad-trip-europe',
      title: 'European Graduation Trip',
      category: 'travel',
      description: 'Explore 5 cities across Europe for 2 weeks',
      basePrice: 4000,
      discountPercent: 8,
      finalPrice: 3680,
      partnerName: 'RBC Travel',
      image: '/goals/europe-trip.jpg',
      features: ['Flight included', 'Hotels booked', 'City passes', 'Travel insurance'],
      estimatedMonths: 24,
      minMonthlyInvestment: 100,
      maxMonthlyInvestment: 500,
      recommendedStrategy: 'balanced',
    },
    targetAmount: 3680,
    monthlyContribution: 150,
    targetDate: new Date('2026-06-01'),
    currentAmount: 1250,
    progressPercent: 34,
    projectedCompletion: new Date('2026-05-15'),
    status: 'active',
    createdAt: new Date('2024-01-15'),
    milestones: [
      {
        id: 'milestone-1',
        title: 'First Steps',
        targetPercent: 10,
        targetAmount: 368,
        achieved: true,
        achievedDate: new Date('2024-03-01'),
        reward: '500 Avion Points',
      },
      {
        id: 'milestone-2',
        title: 'Quarter Way',
        targetPercent: 25,
        targetAmount: 920,
        achieved: true,
        achievedDate: new Date('2024-06-15'),
        reward: '1,000 Avion Points',
      },
      {
        id: 'milestone-3',
        title: 'Halfway Hero',
        targetPercent: 50,
        targetAmount: 1840,
        achieved: false,
        reward: '2,500 Avion Points + $25 Gift Card',
      },
      {
        id: 'milestone-4',
        title: 'Almost There',
        targetPercent: 75,
        targetAmount: 2760,
        achieved: false,
        reward: '5,000 Avion Points',
      },
      {
        id: 'milestone-5',
        title: 'Goal Achieved!',
        targetPercent: 100,
        targetAmount: 3680,
        achieved: false,
        reward: 'Goal Discount (8%) + 10,000 Avion Points',
      },
    ],
  },
];

// Function to populate demo data
export const loadDemoData = () => {
  return {
    userGoals: DEMO_USER_GOALS,
    user: {
      id: 'demo-user',
      name: 'Alex Chen',
      email: 'alex.chen@student.ca',
      totalInvested: 2450,
      totalReturns: 187.50,
      avionPoints: 3250,
    },
    marketPerformance: {
      currentReturn: 0.072,
      yearToDate: 0.045,
      allTime: 0.072,
      lastUpdated: new Date(),
    },
  };
};
