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
    monthlyContribution: number
  ): Promise<APIResponse<{ months: number; projectedValue: number; confidence: number }>> {
    // Calculate estimated months needed
    const estimatedMonths = Math.ceil(targetAmount / monthlyContribution);
    
    // Cap at 12 months for simulation (API limit)
    const simulationMonths = Math.min(estimatedMonths, 12);
    
    // Run simulation to get actual projections
    const simulationResult = await this.simulateClientPortfolios(clientId, {
      months: simulationMonths,
    });

    if (!simulationResult.success || !simulationResult.data?.results?.length) {
      // Fallback calculation
      const projectedValue = monthlyContribution * estimatedMonths * 1.06; // 6% annual growth estimate
      return {
        data: {
          months: estimatedMonths,
          projectedValue,
          confidence: 70,
        },
        success: true,
      };
    }

    const result = simulationResult.data.results[0];
    const monthlyGrowthRate = Math.pow(result.projectedValue / result.initialValue, 1 / result.monthsSimulated) - 1;
    
    // Extrapolate to target amount if needed
    const projectedMonths = estimatedMonths;
    let projectedValue = result.projectedValue;
    
    if (simulationMonths < estimatedMonths) {
      // Extrapolate beyond simulation period
      const remainingMonths = estimatedMonths - simulationMonths;
      const additionalContributions = monthlyContribution * remainingMonths;
      const compoundedGrowth = Math.pow(1 + monthlyGrowthRate, remainingMonths);
      projectedValue = (result.projectedValue + additionalContributions) * compoundedGrowth;
    }

    return {
      data: {
        months: projectedMonths,
        projectedValue,
        confidence: 85,
      },
      success: true,
    };
  }
}

export const apiService = new APIService();
