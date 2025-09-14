import { Goal, PortfolioType } from './types';

export const GOAL_CATALOGUE: Goal[] = [
  // Tech: Apple Ecosystem
  {
    id: 'iphone-17',
    title: 'iPhone 16 Pro Max',
    category: 'tech',
    description: 'Latest iPhone with Pro camera system, titanium design, and A18 Pro chip',
    basePrice: 1129,
    discountPercent: 0,
    finalPrice: 1129,
    partnerName: 'Apple Store',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=2560&q=80',
    features: ['Earn Avion points on Apple products', 'Latest iOS features', 'Premium design'],
    estimatedMonths: 12,
    minMonthlyInvestment: 95,
    maxMonthlyInvestment: 200,
    recommendedStrategy: 'balanced',
  },
  {
    id: 'macbook-pro-m3',
    title: 'MacBook Pro 14" M4 Pro',
    category: 'tech',
    description: 'Professional laptop with M4 Pro chip, 18GB RAM, 512GB storage',
    basePrice: 2527,
    discountPercent: 5,
    finalPrice: 2400,
    partnerName: 'Best Buy',
    image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=2560&q=80',
    features: ['5% off at Best Buy with RBC', 'M4 Pro chip', 'Professional grade'],
    estimatedMonths: 18,
    minMonthlyInvestment: 135,
    maxMonthlyInvestment: 300,
    recommendedStrategy: 'growth',
  },
  {
    id: 'ipad-air-2024',
    title: 'iPad Pro 11" M4',
    category: 'tech',
    description: 'Ultra-thin iPad Pro with M4 chip, OLED display, and Apple Pencil Pro support',
    basePrice: 1000,
    discountPercent: 5,
    finalPrice: 950,
    partnerName: 'Best Buy',
    image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=2560&q=80',
    features: ['5% off at Best Buy with RBC', 'Apple Pencil Pro compatible', 'All-day battery'],
    estimatedMonths: 10,
    minMonthlyInvestment: 95,
    maxMonthlyInvestment: 200,
    recommendedStrategy: 'balanced',
  },
  {
    id: 'airpods-pro-2',
    title: 'AirPods Pro (2nd Generation)',
    category: 'tech',
    description: 'Premium wireless earbuds with Active Noise Cancellation and Spatial Audio',
    basePrice: 329,
    discountPercent: 0,
    finalPrice: 329,
    partnerName: 'Apple Store',
    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?auto=format&fit=crop&w=2560&q=80',
    features: ['Avion points eligible', 'Active noise cancellation', 'Spatial audio'],
    estimatedMonths: 6,
    minMonthlyInvestment: 55,
    maxMonthlyInvestment: 100,
    recommendedStrategy: 'conservative',
  },
  
  // Instruments & Creativity
  {
    id: 'acoustic-guitar',
    title: 'Yamaha FG830 Acoustic Guitar',
    category: 'experience',
    description: 'Solid spruce top acoustic guitar with rosewood back and sides',
    basePrice: 500,
    discountPercent: 0,
    finalPrice: 500,
    partnerName: 'Long & McQuade',
    image: 'https://images.unsplash.com/photo-1556449895-a33c9dba33dd?auto=format&fit=crop&w=2560&q=80',
    features: ['Partner music store discounts', 'Professional sound', 'Beginner friendly'],
    estimatedMonths: 8,
    minMonthlyInvestment: 75,
    maxMonthlyInvestment: 150,
    recommendedStrategy: 'balanced',
  },
  {
    id: 'digital-piano',
    title: 'Roland FP-30X Digital Piano',
    category: 'experience',
    description: 'Portable digital piano with 88-key weighted hammer action and Roland sound',
    basePrice: 1200,
    discountPercent: 0,
    finalPrice: 1200,
    partnerName: 'Music Retailers',
    image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=2560&q=80',
    features: ['Music retailer RBC offers', '88 weighted keys', 'Multiple voices'],
    estimatedMonths: 12,
    minMonthlyInvestment: 100,
    maxMonthlyInvestment: 200,
    recommendedStrategy: 'balanced',
  },

  // Travel & Experiences
  {
    id: 'graduation-trip-france',
    title: 'Paris & French Riviera - 10 Days',
    category: 'travel',
    description: 'Luxury graduation trip featuring Paris, Nice, and Cannes with first-class accommodations',
    basePrice: 4444,
    discountPercent: 10,
    finalPrice: 4000,
    partnerName: 'RBC Travel',
    image: 'https://images.unsplash.com/photo-1549144511-f099e773c147?auto=format&fit=crop&w=2560&q=80',
    features: ['10% off through RBC Travel', 'Flights included', 'Travel insurance'],
    estimatedMonths: 20,
    minMonthlyInvestment: 200,
    maxMonthlyInvestment: 400,
    recommendedStrategy: 'balanced',
  },
  {
    id: 'mexico-vacation',
    title: 'Riviera Maya All-Inclusive - 7 Days',
    category: 'travel',
    description: 'Luxury all-inclusive resort in Playa del Carmen with beach access and spa',
    basePrice: 2800,
    discountPercent: 0,
    finalPrice: 2800,
    partnerName: 'RBC Travel',
    image: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=2560&q=80',
    features: ['RBC Travel partner discounts', 'All meals included', 'Beach access'],
    estimatedMonths: 14,
    minMonthlyInvestment: 200,
    maxMonthlyInvestment: 350,
    recommendedStrategy: 'balanced',
  },

  // Cars & Mobility
  {
    id: 'honda-civic-2025',
    title: '2025 Honda Civic Sport Touring',
    category: 'car',
    description: 'Premium compact sedan with Honda Sensing safety suite and premium interior',
    basePrice: 33000,
    discountPercent: 0,
    finalPrice: 33000,
    partnerName: 'RBC Auto Finance',
    image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=2560&q=80',
    features: ['Special RBC Auto Loan Rates', 'Fuel efficient', 'Latest safety features'],
    estimatedMonths: 36,
    minMonthlyInvestment: 500,
    maxMonthlyInvestment: 1000,
    recommendedStrategy: 'conservative',
  },
  {
    id: 'tesla-model-3-2025',
    title: 'Tesla Model 3 Long Range AWD',
    category: 'car',
    description: 'Electric sedan with 358-mile range, Autopilot, and over-the-air updates',
    basePrice: 52000,
    discountPercent: 0,
    finalPrice: 52000,
    partnerName: 'Tesla Partners',
    image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=2560&q=80',
    features: ['EV Financing Incentives', 'Autopilot included', 'Zero emissions'],
    estimatedMonths: 48,
    minMonthlyInvestment: 700,
    maxMonthlyInvestment: 1200,
    recommendedStrategy: 'growth',
  },

  // Housing & Essentials
  {
    id: 'apartment-deposit',
    title: 'Downtown Apartment - First & Last',
    category: 'home',
    description: 'Security deposit and first/last month rent for modern downtown apartment',
    basePrice: 25000,
    discountPercent: 0,
    finalPrice: 25000,
    partnerName: 'RBC Mortgage Services',
    image: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=2560&q=80',
    features: ['RBC Mortgage Pre-Approval', 'First-time buyer programs', 'Moving assistance'],
    estimatedMonths: 30,
    minMonthlyInvestment: 600,
    maxMonthlyInvestment: 1000,
    recommendedStrategy: 'conservative',
  },
  {
    id: 'home-furniture',
    title: 'IKEA Complete Home Package',
    category: 'home',
    description: 'Complete furniture set including bedroom, living room, dining, and kitchen essentials',
    basePrice: 5000,
    discountPercent: 0,
    finalPrice: 5000,
    partnerName: 'Furniture Retailers',
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=2560&q=80',
    features: ['Partner retailer discounts', 'Complete room sets', 'Delivery included'],
    estimatedMonths: 15,
    minMonthlyInvestment: 250,
    maxMonthlyInvestment: 400,
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