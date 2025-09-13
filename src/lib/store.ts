import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UserGoal, Goal, AppUser, Client } from './types';
import { apiService } from './api';

interface AppState {
  // Authentication
  user: AppUser | null;
  isAuthenticated: boolean;
  
  // Client data
  currentClient: Client | null;
  
  // Goals
  userGoals: UserGoal[];
  selectedGoal: Goal | null;
  
  // UI state
  isLoading: boolean;
  currentView: 'auth' | 'catalogue' | 'setup' | 'dashboard';
  error: string | null;
  
  // Actions
  setUser: (user: AppUser) => void;
  setCurrentClient: (client: Client) => void;
  setSelectedGoal: (goal: Goal) => void;
  addUserGoal: (goal: UserGoal) => void;
  updateUserGoal: (goalId: string, updates: Partial<UserGoal>) => void;
  removeUserGoal: (goalId: string) => void;
  setLoading: (loading: boolean) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  registerTeam: (teamName: string, email: string) => Promise<boolean>;
  createClient: (name: string, email: string, initialCash: number) => Promise<boolean>;
  createGoalBasedInvestment: (goalId: string, monthlyContribution: number, targetDate: Date) => Promise<boolean>;
  logout: () => void;
  initializeFromStorage: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      currentClient: null,
      userGoals: [],
      selectedGoal: null,
      isLoading: false,
      currentView: 'auth',
      error: null,

      // Basic actions
      setUser: (user: AppUser) => {
        set({ user, isAuthenticated: true });
        
        // Store auth data in localStorage
        if (typeof window !== 'undefined') {
          localStorage.setItem('rbc_user', JSON.stringify(user));
        }
        
        // Set token in API service
        apiService.setAuthToken(user.jwtToken);
      },

      setCurrentClient: (client: Client) => {
        set({ currentClient: client });
        
        // Store client data
        if (typeof window !== 'undefined') {
          localStorage.setItem('rbc_current_client', JSON.stringify(client));
        }
      },

      setSelectedGoal: (goal: Goal) => set({ selectedGoal: goal }),

      addUserGoal: (goal: UserGoal) =>
        set((state) => ({
          userGoals: [...state.userGoals, goal],
        })),

      updateUserGoal: (goalId: string, updates: Partial<UserGoal>) =>
        set((state) => ({
          userGoals: state.userGoals.map((goal) =>
            goal.id === goalId ? { ...goal, ...updates } : goal
          ),
        })),

      removeUserGoal: (goalId: string) =>
        set((state) => ({
          userGoals: state.userGoals.filter((goal) => goal.id !== goalId),
        })),

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setCurrentView: (view: AppState['currentView']) => set({ currentView: view }),

      setError: (error: string | null) => set({ error }),

      // Async actions
      registerTeam: async (teamName: string, email: string) => {
        const { setLoading, setError, setUser } = get();
        
        setLoading(true);
        setError(null);
        
        try {
          const response = await apiService.registerTeam({
            team_name: teamName,
            contact_email: email,
          });

          if (!response.success || !response.data) {
            setError(response.message || 'Registration failed');
            return false;
          }

          const user: AppUser = {
            teamId: response.data.teamId,
            teamName: teamName,
            email: email,
            jwtToken: response.data.jwtToken,
            expiresAt: response.data.expiresAt,
          };

          setUser(user);
          return true;
        } catch {
          setError('Network error during registration');
          return false;
        } finally {
          setLoading(false);
        }
      },

      createClient: async (name: string, email: string, initialCash: number) => {
        const { setLoading, setError, setCurrentClient } = get();
        
        setLoading(true);
        setError(null);
        
        try {
          const response = await apiService.createClient({
            name,
            email,
            cash: initialCash,
          });

          if (!response.success || !response.data) {
            setError(response.message || 'Failed to create client');
            return false;
          }

          setCurrentClient(response.data);
          return true;
        } catch {
          setError('Network error while creating client');
          return false;
        } finally {
          setLoading(false);
        }
      },

      createGoalBasedInvestment: async (goalId: string, monthlyContribution: number, targetDate: Date) => {
        const { setLoading, setError, selectedGoal, currentClient, addUserGoal } = get();
        
        if (!selectedGoal || !currentClient) {
          setError('Missing goal or client data');
          return false;
        }

        setLoading(true);
        setError(null);
        
        try {
          // Create portfolio for the goal
          const portfolioResponse = await apiService.createGoalBasedPortfolio(
            currentClient.id,
            goalId,
            selectedGoal.finalPrice,
            monthlyContribution,
            selectedGoal.recommendedStrategy
          );

          if (!portfolioResponse.success || !portfolioResponse.data) {
            setError(portfolioResponse.message || 'Failed to create investment portfolio');
            return false;
          }

          const { portfolio, client } = portfolioResponse.data;

          // Update client data
          get().setCurrentClient(client);

          // Create user goal
          const userGoal: UserGoal = {
            id: `goal-${Date.now()}`,
            goalId,
            goal: selectedGoal,
            clientId: client.id,
            portfolioId: portfolio.id,
            targetAmount: selectedGoal.finalPrice,
            monthlyContribution,
            targetDate,
            currentAmount: portfolio.current_value,
            progressPercent: (portfolio.current_value / selectedGoal.finalPrice) * 100,
            projectedCompletion: new Date(targetDate),
            status: 'active',
            createdAt: new Date(),
            milestones: [
              {
                id: `milestone-1-${Date.now()}`,
                title: 'First Steps',
                targetPercent: 10,
                targetAmount: selectedGoal.finalPrice * 0.1,
                achieved: false,
                reward: '500 Avion Points',
              },
              {
                id: `milestone-2-${Date.now()}`,
                title: 'Quarter Way',
                targetPercent: 25,
                targetAmount: selectedGoal.finalPrice * 0.25,
                achieved: false,
                reward: '1,000 Avion Points',
              },
              {
                id: `milestone-3-${Date.now()}`,
                title: 'Halfway Hero',
                targetPercent: 50,
                targetAmount: selectedGoal.finalPrice * 0.5,
                achieved: false,
                reward: '2,500 Avion Points + $25 Gift Card',
              },
              {
                id: `milestone-4-${Date.now()}`,
                title: 'Almost There',
                targetPercent: 75,
                targetAmount: selectedGoal.finalPrice * 0.75,
                achieved: false,
                reward: '5,000 Avion Points',
              },
              {
                id: `milestone-5-${Date.now()}`,
                title: 'Goal Achieved!',
                targetPercent: 100,
                targetAmount: selectedGoal.finalPrice,
                achieved: false,
                reward: `Goal Discount (${selectedGoal.discountPercent}%) + 10,000 Avion Points`,
              },
            ],
          };

          addUserGoal(userGoal);

          // Run enhanced simulation to get realistic projections
          try {
            const totalMonths = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 30));
            const projectionResponse = await apiService.projectGoalCompletion(
              client.id,
              selectedGoal.finalPrice,
              monthlyContribution,
              totalMonths
            );

            if (projectionResponse.success && projectionResponse.data) {
              const projection = projectionResponse.data;
              // Update goal with enhanced projection data
              const updatedGoal = { 
                ...userGoal, 
                enhancedProjection: projection,
                projectedCompletion: new Date(Date.now() + (projection.months * 30 * 24 * 60 * 60 * 1000))
              };
              addUserGoal(updatedGoal);
            }
          } catch (error) {
            console.warn('Enhanced projection failed, but portfolio was created:', error);
          }

          return true;
        } catch {
          setError('Network error while creating investment');
          return false;
        } finally {
          setLoading(false);
        }
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          currentClient: null,
          userGoals: [],
          selectedGoal: null,
          currentView: 'auth',
        });

        // Clear stored data
        if (typeof window !== 'undefined') {
          localStorage.removeItem('rbc_user');
          localStorage.removeItem('rbc_current_client');
        }

        // Clear API token
        apiService.clearAuthToken();
      },

      initializeFromStorage: async () => {
        const { setUser, setCurrentClient, setCurrentView } = get();

        if (typeof window === 'undefined') return;

        try {
          // Load user data
          const storedUser = localStorage.getItem('rbc_user');
          if (storedUser) {
            const user: AppUser = JSON.parse(storedUser);
            
            // Check if token is still valid
            if (new Date(user.expiresAt) > new Date()) {
              setUser(user);
              
              // Load client data
              const storedClient = localStorage.getItem('rbc_current_client');
              if (storedClient) {
                const client: Client = JSON.parse(storedClient);
                setCurrentClient(client);
                setCurrentView('dashboard');
              } else {
                setCurrentView('catalogue');
              }
            } else {
              // Token expired, clear storage
              localStorage.removeItem('rbc_user');
              localStorage.removeItem('rbc_current_client');
              setCurrentView('auth');
            }
          } else {
            setCurrentView('auth');
          }
        } catch (error) {
          console.error('Error loading from storage:', error);
          setCurrentView('auth');
        }
      },
    }),
    {
      name: 'rbc-goals-store',
    }
  )
);
