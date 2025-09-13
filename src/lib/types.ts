// API Types matching Hack the North 2025 Portfolio Simulation API

export interface TeamRegistration {
  team_name: string;
  contact_email: string;
}

export interface TeamAuthResponse {
  teamId: string;
  jwtToken: string;
  expiresAt: string;
}

export interface ClientCreate {
  name: string;
  email: string;
  cash: number;
  portfolios?: string[];
}

export interface Client {
  id: string;
  name: string;
  email: string;
  team_name: string;
  portfolios: Portfolio[];
  cash: number;
  created_at: string;
  updated_at: string;
}

export type PortfolioType = 'aggressive_growth' | 'growth' | 'balanced' | 'conservative' | 'very_conservative';

export interface PortfolioCreate {
  type: PortfolioType;
  initialAmount: number;
}

export interface Portfolio {
  id: string;
  client_id: string;
  team_name: string;
  type: PortfolioType;
  created_at: string;
  invested_amount: number;
  current_value: number;
  total_months_simulated: number;
  transactions: Transaction[];
  growth_trend: GrowthDataPoint[];
}

export interface Transaction {
  id: string;
  date: string;
  type: 'deposit' | 'withdraw' | 'growth';
  amount: number;
  balance_after: number;
}

export interface GrowthDataPoint {
  date: string;
  value: number;
}

export interface SimulationRequest {
  months: number; // 1-12 months max
}

export interface SimulationResult {
  portfolioId: string;
  strategy: PortfolioType;
  monthsSimulated: number;
  daysSimulated: number;
  initialValue: number;
  projectedValue: number;
  totalGrowthPoints: number;
  simulationId: string;
  growth_trend: GrowthDataPoint[];
}

export interface MultipleSimulationResponse {
  message: string;
  results: SimulationResult[];
}

// Goal-based investing types (our business logic layer)
export interface Goal {
  id: string;
  title: string;
  category: 'travel' | 'education' | 'home' | 'car' | 'tech' | 'experience' | 'lifestyle';
  description: string;
  basePrice: number;
  discountPercent: number;
  finalPrice: number;
  partnerName: string;
  image: string;
  features: string[];
  estimatedMonths: number;
  minMonthlyInvestment: number;
  maxMonthlyInvestment: number;
  recommendedStrategy: PortfolioType;
}

export interface UserGoal {
  id: string;
  goalId: string;
  goal: Goal;
  clientId: string;
  portfolioId?: string;
  targetAmount: number;
  monthlyContribution: number;
  targetDate: Date;
  currentAmount: number;
  progressPercent: number;
  projectedCompletion: Date;
  status: 'planning' | 'active' | 'paused' | 'completed';
  createdAt: Date;
  lastSimulation?: SimulationResult;
}

// App state types
export interface AppUser {
  teamId: string;
  teamName: string;
  email: string;
  jwtToken: string;
  expiresAt: string;
}

export interface APIResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface ErrorResponse {
  message: string;
  error?: string;
  code?: string;
}

export interface UserGoal {
  id: string;
  goalId: string;
  goal: Goal;
  targetAmount: number;
  monthlyContribution: number;
  targetDate: Date;
  currentAmount: number;
  progressPercent: number;
  projectedCompletion: Date;
  status: 'planning' | 'active' | 'paused' | 'completed';
  createdAt: Date;
  milestones: Milestone[];
}

export interface Milestone {
  id: string;
  title: string;
  targetPercent: number;
  targetAmount: number;
  achieved: boolean;
  achievedDate?: Date;
  reward?: string;
}

export interface InvestmentProjection {
  monthlyAmount: number;
  totalMonths: number;
  totalContributions: number;
  projectedReturns: number;
  finalAmount: number;
  confidence: number; // 0-100
}

export interface MarketPerformance {
  currentReturn: number;
  yearToDate: number;
  allTime: number;
  lastUpdated: Date;
}
