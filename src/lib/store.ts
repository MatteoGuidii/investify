import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { UserGoal, Goal, AppUser, Client } from './types';
import { GOAL_CATALOGUE } from './goals-data';
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
  currentView: 'auth' | 'catalogue' | 'setup' | 'dashboard' | 'rewards';
  error: string | null;
  
  // Actions
  setUser: (user: AppUser) => void;
  setCurrentClient: (client: Client) => void;
  setSelectedGoal: (goal: Goal) => void;
  addUserGoal: (goal: UserGoal) => void;
  updateUserGoal: (goalId: string, updates: Partial<UserGoal>) => void;
  removeUserGoal: (goalId: string) => Promise<void>;
  setLoading: (loading: boolean) => void;
  setCurrentView: (view: AppState['currentView']) => void;
  setError: (error: string | null) => void;
  
  // Async actions
  registerTeam: (teamName: string, email: string) => Promise<boolean>;
  createClient: (name: string, email: string, initialCash: number) => Promise<boolean>;
  loginAsTestUser: () => Promise<void>;
  createGoalBasedInvestment: (goalId: string, monthlyContribution: number, targetDate: Date) => Promise<boolean>;
  logout: () => void;
  initializeFromStorage: () => Promise<void>;
  // Demo utilities
  restoreDemo: () => Promise<void>;
  resetDemo: () => Promise<void>;
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

      // Reset demo: clear session and reseed Hamudy from scratch
      resetDemo: async () => {
        const { logout, loginAsTestUser } = get();
        try {
          // Clear local storage flags and session
          if (typeof window !== 'undefined') {
            localStorage.removeItem('rbc_user');
            localStorage.removeItem('rbc_current_client');
          }
          logout();

          // Recreate demo user and reseed data
          await get().loginAsTestUser();
        } catch (e) {
          console.warn('Failed to reset demo', e);
        }
      },

      // Restore demo: reapply flags and reseed Hamudy's goals if a client exists; otherwise create demo user
      restoreDemo: async () => {
        const { currentClient, setCurrentView, addUserGoal, loginAsTestUser } = get();
        try {
          // Ensure demo flags
          if (typeof window !== 'undefined') {
            localStorage.setItem('demo_mode', 'true');
            localStorage.setItem('demo_rewards_profile', 'wrap_ready');
          }

          // If no client/session, fallback to creating demo user
          if (!currentClient) {
            await loginAsTestUser();
            return;
          }

          // Clear existing goals and reseed a rich demo profile
          set({ userGoals: [] });

          const goalsMap: Record<string, Goal> = Object.fromEntries(
            GOAL_CATALOGUE.map(g => [g.id, g])
          );
          // Use current catalogue IDs directly to avoid mismatches
          // Smaller, more realistic set with reduced monthly contributions
          const seed: Array<{ id: string; monthly: number; saved: number; status: 'active' | 'paused' | 'completed'; backdatedMonths?: number; }> = [
            // Completed goals
            { id: 'macbook-pro-m3', monthly: 150, saved: 2400, status: 'completed', backdatedMonths: 12 }, // 2400 target
            { id: 'home-furniture', monthly: 200, saved: 5000, status: 'completed', backdatedMonths: 10 }, // 5000 target
            // Active with reasonable progress
            { id: 'graduation-trip-france', monthly: 180, saved: 2200, status: 'active', backdatedMonths: 8 }, // 4000 target
            { id: 'mexico-vacation', monthly: 150, saved: 1600, status: 'active', backdatedMonths: 6 }, // 2800 target
          ];

          seed.forEach((g, idx) => {
            const goal = goalsMap[g.id];
            if (!goal) return;
            const targetAmount = goal.finalPrice;
            const isCompleted = g.status === 'completed' || g.saved >= targetAmount;
            const createdAt = new Date(Date.now() - (g.backdatedMonths ?? 6) * 30 * 24 * 60 * 60 * 1000);
            const currentAmount = isCompleted ? targetAmount : Math.min(g.saved, Math.max(targetAmount * 0.15, targetAmount * 0.85));
            const ug: UserGoal = {
              id: `demo-restore-${idx}-${Date.now()}`,
              goalId: goal.id,
              goal,
              clientId: get().currentClient!.id,
              targetAmount,
              monthlyContribution: g.monthly,
              targetDate: new Date(Date.now() + goal.estimatedMonths * 30 * 24 * 60 * 60 * 1000),
              currentAmount,
              progressPercent: Math.min(100, (currentAmount / targetAmount) * 100),
              projectedCompletion: isCompleted ? new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) : new Date(Date.now() + (goal.estimatedMonths - 2) * 30 * 24 * 60 * 60 * 1000),
              status: isCompleted ? 'completed' : g.status,
              createdAt,
              milestones: [
                { id: `ms-10-r-${idx}`, title: 'First Steps', targetPercent: 10, targetAmount: targetAmount * 0.1, achieved: true, achievedDate: new Date(createdAt.getTime() + 20 * 24 * 60 * 60 * 1000), reward: '500 Avion Points' },
                { id: `ms-25-r-${idx}`, title: 'Quarter Way', targetPercent: 25, targetAmount: targetAmount * 0.25, achieved: true, achievedDate: new Date(createdAt.getTime() + 60 * 24 * 60 * 60 * 1000), reward: '1,000 Avion Points' },
                { id: `ms-50-r-${idx}`, title: 'Halfway Hero', targetPercent: 50, targetAmount: targetAmount * 0.5, achieved: (currentAmount / targetAmount) >= 0.5 || isCompleted, achievedDate: isCompleted ? new Date(createdAt.getTime() + 90 * 24 * 60 * 60 * 1000) : undefined, reward: '2,500 Avion Points + $25 Gift Card' },
                ...(isCompleted ? [{ id: `ms-100-r-${idx}`, title: 'Goal Achieved!', targetPercent: 100, targetAmount: targetAmount, achieved: true, achievedDate: new Date(createdAt.getTime() + 120 * 24 * 60 * 60 * 1000), reward: `${goal.discountPercent}% Partner Discount + 10,000 Avion Points` }] as any : []),
              ],
            };
            addUserGoal(ug);
          });

          setCurrentView('dashboard');
        } catch (e) {
          console.warn('Failed to restore demo', e);
        }
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
        set((state) => {
          const next = [...state.userGoals, goal];
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('rbc_user_goals', JSON.stringify(next)); } catch {}
          }
          return { userGoals: next };
        }),

      updateUserGoal: (goalId: string, updates: Partial<UserGoal>) =>
        set((state) => {
          const next = state.userGoals.map((goal) =>
            goal.id === goalId ? { ...goal, ...updates } : goal
          );
          if (typeof window !== 'undefined') {
            try { localStorage.setItem('rbc_user_goals', JSON.stringify(next)); } catch {}
          }
          return { userGoals: next };
        }),

      removeUserGoal: async (goalId: string) => {
        const { userGoals, setLoading, setError } = get();
        const goalToRemove = userGoals.find(g => g.id === goalId);
        
        if (!goalToRemove) return;

        setLoading(true);
        try {
          // If the goal has an associated portfolio, we could delete it
          // For now, we'll just remove from local state and let user manage portfolio separately
          // This prevents accidental deletion of portfolios with multiple goals
          
          set((state) => {
            const next = state.userGoals.filter((goal) => goal.id !== goalId);
            if (typeof window !== 'undefined') {
              try { localStorage.setItem('rbc_user_goals', JSON.stringify(next)); } catch {}
            }
            return { userGoals: next };
          });
          
        } catch (error) {
          console.error('Error removing goal:', error);
          setError('Failed to remove goal');
        } finally {
          setLoading(false);
        }
      },

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

          // Run enhanced simulation to get realistic projections
          let finalGoal = userGoal;
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
              // Update goal with enhanced projection data using existing properties
              finalGoal = { 
                ...userGoal, 
                projectedCompletion: new Date(Date.now() + (projection.months * 30 * 24 * 60 * 60 * 1000))
              };
            }
          } catch (error) {
            console.warn('Enhanced projection failed, but portfolio was created:', error);
          }

          // Add the goal only once with all data
          addUserGoal(finalGoal);

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

      loginAsTestUser: async () => {
        const { setLoading, setError, registerTeam, createClient, setCurrentView, user, logout } = get();
        
        setLoading(true);
        setError(null);

        const testEmail = `hamudy-${Date.now()}@goals.app`;
        const testTeamName = `hamudy-team-${Date.now()}`;
        const testClientName = 'Hamudy';
        const testInitialCash = 50000;

        // Logout any existing user to ensure a clean test session
        if (user) {
          logout();
        }

        // The registerTeam function will set the user and token
        const teamSuccess = await registerTeam(testTeamName, testEmail);
        
        if (!teamSuccess) {
          // If team registration fails, we can't proceed.
          // The error is already set by registerTeam, so we just stop.
          setLoading(false);
          return;
        }

        // The createClient function will set the current client
        const clientSuccess = await createClient(testClientName, testEmail, testInitialCash);

        if (clientSuccess) {
          // Use centralized restore to apply flags and seed goals
          await get().restoreDemo();
        } 
        // Error is handled by createClient

        setLoading(false);
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
                // Hydrate saved goals if present
                try {
                  const savedGoals = localStorage.getItem('rbc_user_goals');
                  if (savedGoals) {
                    const parsed: UserGoal[] = JSON.parse(savedGoals);
                    if (parsed && Array.isArray(parsed) && parsed.length > 0) {
                      set({ userGoals: parsed });
                    }
                  }
                } catch {}

                // If demo flags are present, land on dashboard to showcase wrap-ready state
                const demo = localStorage.getItem('demo_mode') === 'true';
                const profile = localStorage.getItem('demo_rewards_profile');
                setCurrentView(demo && profile === 'wrap_ready' ? 'dashboard' : 'catalogue');

                // If demo and no goals seeded yet (fresh reload), seed again for consistency
                if (demo && profile === 'wrap_ready' && get().userGoals.length === 0) {
                  try {
                    const goalsMap: Record<string, Goal> = Object.fromEntries(
                      GOAL_CATALOGUE.map(g => [g.id, g])
                    );
                    // Use current catalogue IDs directly (reduced set) and lower monthly contributions
                    const seed: Array<{ id: string; monthly: number; saved: number; status: 'active' | 'paused' | 'completed'; backdatedMonths?: number; }> = [
                      { id: 'macbook-pro-m3', monthly: 150, saved: 2400, status: 'completed', backdatedMonths: 12 },
                      { id: 'home-furniture', monthly: 200, saved: 5000, status: 'completed', backdatedMonths: 10 },
                      { id: 'graduation-trip-france', monthly: 180, saved: 2200, status: 'active', backdatedMonths: 8 },
                      { id: 'mexico-vacation', monthly: 150, saved: 1600, status: 'active', backdatedMonths: 6 },
                    ];
                    seed.forEach((g, idx) => {
                      const goal = goalsMap[g.id];
                      if (!goal) return;
                      const targetAmount = goal.finalPrice;
                      const isCompleted = g.status === 'completed' || g.saved >= targetAmount;
                      const createdAt = new Date(Date.now() - (g.backdatedMonths ?? 6) * 30 * 24 * 60 * 60 * 1000);
                      const currentAmount = isCompleted ? targetAmount : Math.min(g.saved, targetAmount * 0.95);
                      const userGoal: UserGoal = {
                        id: `demo-goal-${idx}-${Date.now()}`,
                        goalId: goal.id,
                        goal,
                        clientId: get().currentClient!.id,
                        targetAmount,
                        monthlyContribution: g.monthly,
                        targetDate: new Date(Date.now() + goal.estimatedMonths * 30 * 24 * 60 * 60 * 1000),
                        currentAmount,
                        progressPercent: Math.min(100, (currentAmount / targetAmount) * 100),
                        projectedCompletion: isCompleted ? new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) : new Date(Date.now() + (goal.estimatedMonths - 2) * 30 * 24 * 60 * 60 * 1000),
                        status: isCompleted ? 'completed' : g.status,
                        createdAt,
                        milestones: [
                          { id: `ms-10-${idx}`, title: 'First Steps', targetPercent: 10, targetAmount: targetAmount * 0.1, achieved: true, achievedDate: new Date(createdAt.getTime() + 20 * 24 * 60 * 60 * 1000), reward: '500 Avion Points' },
                          { id: `ms-25-${idx}`, title: 'Quarter Way', targetPercent: 25, targetAmount: targetAmount * 0.25, achieved: true, achievedDate: new Date(createdAt.getTime() + 60 * 24 * 60 * 60 * 1000), reward: '1,000 Avion Points' },
                          { id: `ms-50-${idx}`, title: 'Halfway Hero', targetPercent: 50, targetAmount: targetAmount * 0.5, achieved: (currentAmount / targetAmount) >= 0.5 || isCompleted, achievedDate: isCompleted ? new Date(createdAt.getTime() + 90 * 24 * 60 * 60 * 1000) : undefined, reward: '2,500 Avion Points + $25 Gift Card' },
                          ...(isCompleted ? [{ id: `ms-100-${idx}`, title: 'Goal Achieved!', targetPercent: 100, targetAmount: targetAmount, achieved: true, achievedDate: new Date(createdAt.getTime() + 120 * 24 * 60 * 60 * 1000), reward: `${goal.discountPercent}% Partner Discount + 10,000 Avion Points` }] as any : []),
                        ],
                      };
                      get().addUserGoal(userGoal);
                    });
                  } catch (e) {
                    console.warn('Failed to seed demo goals on init', e);
                  }
                }
              } else {
                const demo = localStorage.getItem('demo_mode') === 'true';
                const profile = localStorage.getItem('demo_rewards_profile');
                setCurrentView(demo && profile === 'wrap_ready' ? 'dashboard' : 'catalogue');
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
