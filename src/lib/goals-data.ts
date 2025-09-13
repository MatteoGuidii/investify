import { Goal, PortfolioType } from './types';

export const GOAL_CATALOGUE: Goal[] = [
  {
    id: 'vacation-europe',
    title: 'European Vacation',
    category: 'travel',
    description: 'A 2-week trip across Europe',
    basePrice: 4500,
    discountPercent: 10,
    finalPrice: 4000,
    partnerName: 'RBC Travel',
    image: '/goals/europe.jpg',
    features: ['Flights included', 'Hotels', 'Travel insurance'],
    estimatedMonths: 20,
    minMonthlyInvestment: 200,
    maxMonthlyInvestment: 500,
    recommendedStrategy: 'balanced',
  },
  {
    id: 'new-laptop',
    title: 'New Laptop',
    category: 'tech',
    description: 'High-performance laptop for work and study',
    basePrice: 2200,
    discountPercent: 8,
    finalPrice: 2000,
    partnerName: 'Best Buy',
    image: '/goals/laptop.jpg',
    features: ['Latest specs', 'Extended warranty'],
    estimatedMonths: 10,
    minMonthlyInvestment: 200,
    maxMonthlyInvestment: 400,
    recommendedStrategy: 'growth',
  },
  {
    id: 'car-downpayment',
    title: 'Car Down Payment',
    category: 'car',
    description: 'Save for a down payment on your first car',
    basePrice: 6000,
    discountPercent: 0,
    finalPrice: 6000,
    partnerName: 'RBC Auto Finance',
    image: '/goals/car.jpg',
    features: ['Pre-approved financing'],
    estimatedMonths: 24,
    minMonthlyInvestment: 250,
    maxMonthlyInvestment: 600,
    recommendedStrategy: 'conservative',
  },
  {
    id: 'emergency-fund',
    title: 'Emergency Fund',
    category: 'lifestyle',
    description: 'Build a safety net for unexpected expenses',
    basePrice: 5000,
    discountPercent: 0,
    finalPrice: 5000,
    partnerName: 'RBC Direct Investing',
    image: '/goals/emergency.jpg',
    features: ['High-interest savings', 'Quick access'],
    estimatedMonths: 20,
    minMonthlyInvestment: 200,
    maxMonthlyInvestment: 500,
    recommendedStrategy: 'conservative',
  },
  {
    id: 'concert-tickets',
    title: 'Concert & Festival Season',
    category: 'experience',
    description: 'Save for multiple concerts and music festivals',
    basePrice: 1200,
    discountPercent: 15,
    finalPrice: 1000,
    partnerName: 'Ticketmaster',
    image: '/goals/concert.jpg',
    features: ['VIP access', 'Early bird pricing'],
    estimatedMonths: 8,
    minMonthlyInvestment: 125,
    maxMonthlyInvestment: 300,
    recommendedStrategy: 'growth',
  },
  {
    id: 'home-deposit',
    title: 'Home Down Payment',
    category: 'home',
    description: 'Start saving for your first home purchase',
    basePrice: 25000,
    discountPercent: 0,
    finalPrice: 25000,
    partnerName: 'RBC Mortgages',
    image: '/goals/home.jpg',
    features: ['First-time buyer program', 'Mortgage pre-approval'],
    estimatedMonths: 60,
    minMonthlyInvestment: 400,
    maxMonthlyInvestment: 1000,
    recommendedStrategy: 'balanced',
  },
];

// Helper functions
export function calculateRequiredMonthly(targetAmount: number, months: number): number {
  return Math.ceil(targetAmount / months);
}

export function getStrategyDisplayName(strategy: PortfolioType): string {
  switch (strategy) {
    case 'conservative': return 'Conservative';
    case 'balanced': return 'Balanced';
    case 'growth': return 'Growth';
    default: return 'Balanced';
  }
}

export function getStrategyDescription(strategy: PortfolioType): string {
  switch (strategy) {
    case 'conservative': return 'Lower risk, steady growth';
    case 'balanced': return 'Moderate risk, balanced returns';
    case 'growth': return 'Higher risk, higher potential returns';
    default: return 'Moderate risk, balanced returns';
  }
}