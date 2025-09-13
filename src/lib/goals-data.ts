import { Goal, PortfolioType } from './types';

export const GOAL_CATEGORIES = [
  { id: 'travel', name: 'Travel & Adventure', icon: '✈️' },
  { id: 'education', name: 'Education', icon: '🎓' },
  { id: 'home', name: 'Home & Living', icon: '🏠' },
  { id: 'car', name: 'Transportation', icon: '🚗' },
  { id: 'tech', name: 'Technology', icon: '💻' },
  { id: 'experience', name: 'Experiences', icon: '🎪' },
  { id: 'lifestyle', name: 'Lifestyle', icon: '⭐' },
] as const;

export const GOAL_CATALOGUE: Goal[] = [
  {
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
  {
    id: 'macbook-pro',
    title: 'MacBook Pro M4',
    category: 'tech',
    description: 'Latest MacBook Pro with M4 chip for your studies and career',
    basePrice: 2499,
    discountPercent: 12,
    finalPrice: 2199,
    partnerName: 'Apple Store',
    image: '/goals/macbook-pro.jpg',
    features: ['M4 Pro chip', '18GB RAM', '512GB SSD', 'Student discount eligible'],
    estimatedMonths: 12,
    minMonthlyInvestment: 150,
    maxMonthlyInvestment: 400,
    recommendedStrategy: 'growth',
  },
  {
    id: 'first-car',
    title: 'First Car',
    category: 'car',
    description: 'Reliable used car for getting around campus and work',
    basePrice: 15000,
    discountPercent: 5,
    finalPrice: 14250,
    partnerName: 'RBC Auto Finance',
    image: '/goals/first-car.jpg',
    features: ['Pre-approved financing', 'Extended warranty', 'Free CarProof report', 'Insurance discounts'],
    estimatedMonths: 36,
    minMonthlyInvestment: 250,
    maxMonthlyInvestment: 800,
    recommendedStrategy: 'conservative',
  },
  {
    id: 'apartment-deposit',
    title: 'First Apartment',
    category: 'home',
    description: 'Security deposit and first month for your first apartment',
    basePrice: 3500,
    discountPercent: 0,
    finalPrice: 3500,
    partnerName: 'RBC Mortgage Specialists',
    image: '/goals/apartment.jpg',
    features: ['Moving assistance', 'Tenant insurance discount', 'Credit building tips', 'Budgeting tools'],
    estimatedMonths: 18,
    minMonthlyInvestment: 120,
    maxMonthlyInvestment: 350,
    recommendedStrategy: 'conservative',
  },
  {
    id: 'concert-festival',
    title: 'Music Festival Season',
    category: 'experience',
    description: 'VIP passes to 3 major music festivals this summer',
    basePrice: 1200,
    discountPercent: 15,
    finalPrice: 1020,
    partnerName: 'Ticketmaster',
    image: '/goals/music-festival.jpg',
    features: ['VIP access', 'Skip the line', 'Exclusive merchandise', 'Meet & greet opportunities'],
    estimatedMonths: 8,
    minMonthlyInvestment: 80,
    maxMonthlyInvestment: 200,
    recommendedStrategy: 'aggressive_growth',
  },
  {
    id: 'gaming-setup',
    title: 'Ultimate Gaming Setup',
    category: 'tech',
    description: 'High-end gaming PC and accessories for streaming/esports',
    basePrice: 3200,
    discountPercent: 10,
    finalPrice: 2880,
    partnerName: 'Best Buy',
    image: '/goals/gaming-setup.jpg',
    features: ['RTX 4070 GPU', '32GB RAM', '4K monitor', 'Mechanical keyboard'],
    estimatedMonths: 15,
    minMonthlyInvestment: 130,
    maxMonthlyInvestment: 350,
    recommendedStrategy: 'growth',
  },
  {
    id: 'emergency-fund',
    title: 'Emergency Fund',
    category: 'lifestyle',
    description: '6 months of expenses saved for financial security',
    basePrice: 6000,
    discountPercent: 0,
    finalPrice: 6000,
    partnerName: 'RBC Savings Builder',
    image: '/goals/emergency-fund.jpg',
    features: ['High interest savings', 'No monthly fees', 'Easy access', 'Financial planning tools'],
    estimatedMonths: 30,
    minMonthlyInvestment: 150,
    maxMonthlyInvestment: 500,
    recommendedStrategy: 'very_conservative',
  },
];

// Helper function to calculate required monthly investment
export function calculateRequiredMonthly(
  targetAmount: number,
  months: number,
  strategy: PortfolioType = 'balanced'
): number {
  // Expected annual returns by strategy
  const expectedReturns: Record<PortfolioType, number> = {
    very_conservative: 0.03, // 3%
    conservative: 0.05, // 5%
    balanced: 0.07, // 7%
    growth: 0.09, // 9%
    aggressive_growth: 0.12, // 12%
  };

  const annualReturn = expectedReturns[strategy];
  const monthlyReturn = annualReturn / 12;

  if (monthlyReturn === 0) {
    return targetAmount / months;
  }

  // Future value of annuity formula: FV = PMT * [((1 + r)^n - 1) / r]
  // Solving for PMT: PMT = FV / [((1 + r)^n - 1) / r]
  const futureValueFactor = (Math.pow(1 + monthlyReturn, months) - 1) / monthlyReturn;
  return targetAmount / futureValueFactor;
}

// Helper function to get strategy display name
export function getStrategyDisplayName(strategy: PortfolioType): string {
  const names: Record<PortfolioType, string> = {
    very_conservative: 'Very Conservative',
    conservative: 'Conservative',
    balanced: 'Balanced',
    growth: 'Growth',
    aggressive_growth: 'Aggressive Growth',
  };
  return names[strategy];
}

// Helper function to get strategy description
export function getStrategyDescription(strategy: PortfolioType): string {
  const descriptions: Record<PortfolioType, string> = {
    very_conservative: 'Low risk, capital preservation focused (2-5% annually)',
    conservative: 'Low-medium risk, steady growth (4-7% annually)',
    balanced: 'Medium risk, balanced growth and stability (6-10% annually)',
    growth: 'Medium-high risk, good growth potential (8-12% annually)',
    aggressive_growth: 'High risk, high potential return (10-15% annually)',
  };
  return descriptions[strategy];
}
