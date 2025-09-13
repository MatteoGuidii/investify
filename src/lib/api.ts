// API Service for RBC Goals App - Real API Integration
// Integration with Hack the North 2025 Portfolio Simulation API

import { 
  TeamRegistration, 
  TeamAuthResponse, 
  ClientCreate, 
  Client, 
  PortfolioCreate, 
  Portfolio, 
  SimulationRequest, 
  MultipleSimulationResponse, 
  APIResponse,
  PortfolioType
} from './types';

class APIService {
  private baseURL = 'https://2dcq63co40.execute-api.us-east-1.amazonaws.com/dev';
  private jwtToken: string | null = null;

  constructor() {
    // Load token from localStorage if available
    if (typeof window !== 'undefined') {
      this.jwtToken = localStorage.getItem('rbc_jwt_token');
    }
  }

  setAuthToken(token: string) {
    this.jwtToken = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('rbc_jwt_token', token);
    }
  }

  clearAuthToken() {
    this.jwtToken = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('rbc_jwt_token');
    }
  }

  private getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.jwtToken) {
      headers['Authorization'] = `Bearer ${this.jwtToken}`;
    }
    
    return headers;
  }

  async makeRequest<T>(url: string, options: RequestInit = {}): Promise<APIResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${url}`, {
        ...options,
        headers: {
          ...this.getAuthHeaders(),
          ...options.headers,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          data: null as T,
          success: false,
          message: data.message || `HTTP ${response.status}`,
        };
      }
      
      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error('API Error:', error);
      return {
        data: null as T,
        success: false,
        message: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Authentication endpoints
  async registerTeam(registration: TeamRegistration): Promise<APIResponse<TeamAuthResponse>> {
    return this.makeRequest<TeamAuthResponse>('/teams/register', {
      method: 'POST',
      body: JSON.stringify(registration),
    });
  }

  // Client management endpoints
  async createClient(clientData: ClientCreate): Promise<APIResponse<Client>> {
    return this.makeRequest<Client>('/clients', {
      method: 'POST',
      body: JSON.stringify(clientData),
    });
  }

  async getClients(): Promise<APIResponse<Client[]>> {
    return this.makeRequest<Client[]>('/clients');
  }

  async getClient(clientId: string): Promise<APIResponse<Client>> {
    return this.makeRequest<Client>(`/clients/${clientId}`);
  }

  async updateClient(clientId: string, updates: { name?: string; email?: string }): Promise<APIResponse<Client>> {
    return this.makeRequest<Client>(`/clients/${clientId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteClient(clientId: string): Promise<APIResponse<{ message: string }>> {
    return this.makeRequest<{ message: string }>(`/clients/${clientId}`, {
      method: 'DELETE',
    });
  }

  async depositToClient(clientId: string, amount: number): Promise<APIResponse<{ message: string; client: Client }>> {
    return this.makeRequest<{ message: string; client: Client }>(`/clients/${clientId}/deposit`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  // Portfolio management endpoints
  async createPortfolio(clientId: string, portfolioData: PortfolioCreate): Promise<APIResponse<Portfolio>> {
    return this.makeRequest<Portfolio>(`/clients/${clientId}/portfolios`, {
      method: 'POST',
      body: JSON.stringify(portfolioData),
    });
  }

  async getClientPortfolios(clientId: string): Promise<APIResponse<Portfolio[]>> {
    return this.makeRequest<Portfolio[]>(`/clients/${clientId}/portfolios`);
  }

  async getPortfolio(portfolioId: string): Promise<APIResponse<Portfolio>> {
    return this.makeRequest<Portfolio>(`/portfolios/${portfolioId}`);
  }

  async transferToPortfolio(portfolioId: string, amount: number): Promise<APIResponse<{ message: string; portfolio: Portfolio; client_cash: number }>> {
    return this.makeRequest<{ message: string; portfolio: Portfolio; client_cash: number }>(`/portfolios/${portfolioId}/transfer`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async withdrawFromPortfolio(portfolioId: string, amount: number): Promise<APIResponse<{ message: string; portfolio: Portfolio; client_cash: number }>> {
    return this.makeRequest<{ message: string; portfolio: Portfolio; client_cash: number }>(`/portfolios/${portfolioId}/withdraw`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async getPortfolioAnalysis(portfolioId: string): Promise<APIResponse<{ 
    portfolioId: string;
    trailingReturns: Record<string, string>;
    calendarReturns: Record<string, string>;
  }>> {
    return this.makeRequest<{ 
      portfolioId: string;
      trailingReturns: Record<string, string>;
      calendarReturns: Record<string, string>;
    }>(`/portfolios/${portfolioId}/analysis`);
  }

  // Simulation endpoints
  async simulateClientPortfolios(clientId: string, request: SimulationRequest): Promise<APIResponse<MultipleSimulationResponse>> {
    return this.makeRequest<MultipleSimulationResponse>(`/client/${clientId}/simulate`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  // Goal-based investing helper methods
  async createGoalBasedPortfolio(
    clientId: string,
    goalId: string,
    targetAmount: number,
    monthlyContribution: number,
    strategy: PortfolioType
  ): Promise<APIResponse<{ portfolio: Portfolio; client: Client }>> {
    // Create portfolio with initial contribution
    const portfolioResult = await this.createPortfolio(clientId, {
      type: strategy,
      initialAmount: monthlyContribution,
    });

    if (!portfolioResult.success || !portfolioResult.data) {
      return {
        data: null as unknown as { portfolio: Portfolio; client: Client },
        success: false,
        message: portfolioResult.message || 'Failed to create portfolio',
      };
    }

    // Get updated client data
    const clientResult = await this.getClient(clientId);
    
    if (!clientResult.success || !clientResult.data) {
      return {
        data: null as unknown as { portfolio: Portfolio; client: Client },
        success: false,
        message: 'Portfolio created but failed to get client data',
      };
    }

    return {
      data: {
        portfolio: portfolioResult.data,
        client: clientResult.data,
      },
      success: true,
    };
  }

  async projectGoalCompletion(
    clientId: string,
    targetAmount: number,
    monthlyContribution: number,
    totalMonths: number
  ): Promise<APIResponse<{ 
    months: number; 
    projectedValue: number; 
    confidence: number;
    yearByYearBreakdown: Array<{year: number, value: number, contributions: number, growth: number}>;
  }>> {
    
    try {
      // Use API simulation for first 12 months to get realistic growth patterns
      const simulationResult = await this.simulateClientPortfolios(clientId, {
        months: 12,
      });

      let firstYearGrowthRate = 0.07; // Default 7% annual
      let baselineProjection = 0;
      let confidence = 80;

      if (simulationResult.success && simulationResult.data?.results?.length) {
        const result = simulationResult.data.results[0];
        // Calculate annual growth rate from API simulation
        const annualGrowthFromSim = (result.projectedValue / result.initialValue) - 1;
        firstYearGrowthRate = Math.max(0.04, Math.min(0.12, annualGrowthFromSim)); // Cap between 4-12%
        baselineProjection = result.projectedValue;
        confidence = 90;
      }

      // For longer periods, use mathematical projection with compound interest
      const yearByYearBreakdown = [];
      let currentValue = monthlyContribution; // Starting with first month's contribution
      const monthlyGrowthRate = firstYearGrowthRate / 12;
      
      // Calculate year by year using Future Value of Annuity formula
      for (let year = 1; year <= Math.ceil(totalMonths / 12); year++) {
        const monthsThisYear = Math.min(12, totalMonths - (year - 1) * 12);
        
        if (monthsThisYear <= 0) break;
        
        const contributionsThisYear = monthlyContribution * monthsThisYear;
        
        if (year === 1 && baselineProjection > 0) {
          // Use API projection for first year
          currentValue = baselineProjection;
        } else {
          // Mathematical projection for subsequent years
          // Future value of annuity: PMT * [((1 + r)^n - 1) / r]
          const periodContributions = monthlyContribution * monthsThisYear;
          const growthOnNewContributions = periodContributions * (Math.pow(1 + monthlyGrowthRate, monthsThisYear) - 1) / monthlyGrowthRate;
          const growthOnExistingValue = currentValue * Math.pow(1 + monthlyGrowthRate, monthsThisYear);
          
          const newValue = growthOnExistingValue + growthOnNewContributions;
          const growthThisYear = newValue - currentValue - contributionsThisYear;
          
          yearByYearBreakdown.push({
            year,
            value: newValue,
            contributions: contributionsThisYear,
            growth: growthThisYear
          });
          
          currentValue = newValue;
        }
        
        if (year === 1) {
          yearByYearBreakdown.push({
            year: 1,
            value: currentValue,
            contributions: contributionsThisYear,
            growth: currentValue - contributionsThisYear
          });
        }
      }

      return {
        data: {
          months: totalMonths,
          projectedValue: currentValue,
          confidence,
          yearByYearBreakdown
        },
        success: true,
      };

    } catch {
      // Fallback to pure mathematical calculation
      const annualRate = 0.07;
      const monthlyRate = annualRate / 12;
      
      // Future value of annuity formula
      const futureValue = monthlyContribution * (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
      
      const yearByYearBreakdown = [];
      for (let year = 1; year <= Math.ceil(totalMonths / 12); year++) {
        const monthsForYear = Math.min(12, totalMonths - (year - 1) * 12);
        if (monthsForYear <= 0) break;
        
        const monthsUpToYear = Math.min(year * 12, totalMonths);
        const valueAtYear = monthlyContribution * (Math.pow(1 + monthlyRate, monthsUpToYear) - 1) / monthlyRate;
        const contributionsUpToYear = monthlyContribution * monthsUpToYear;
        
        yearByYearBreakdown.push({
          year,
          value: valueAtYear,
          contributions: monthlyContribution * monthsForYear,
          growth: valueAtYear - contributionsUpToYear
        });
      }
      
      return {
        data: {
          months: totalMonths,
          projectedValue: futureValue,
          confidence: 75,
          yearByYearBreakdown
        },
        success: true,
      };
    }
  }
}

export const apiService = new APIService();
