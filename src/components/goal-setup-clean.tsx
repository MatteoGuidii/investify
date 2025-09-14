'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { ArrowLeft, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RISK_PROFILES, RiskProfile } from '../lib/risk-profiles';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from 'recharts';

const SavingsProfile: RiskProfile = {
  name: 'Savings',
  expectedReturn: 0.005,
  volatility: 0,
  meanAbsoluteDeviation: 0,
  range: { lower: 0.005, upper: 0.005 },
};

const ALL_PROFILES = [...RISK_PROFILES, SavingsProfile];

const PROFILE_COLORS: { [key: string]: string } = {
  'Total Invested': '#6b7280',
  'Safe': '#3b82f6',
  'Growth': '#22c55e',
  'Risky': '#ef4444',
  'Savings': '#84cc16',
};

export function GoalSetup() {
  const { selectedGoal, setCurrentView, createGoalBasedInvestment, isLoading, error, setError } = useAppStore();
  
  // Default to 'Target Date' tab, which is now wired to fixedAmount mode after the swap
  const [calculationMode, setCalculationMode] = useState<'fixedDate' | 'fixedAmount'>('fixedAmount');
  const [monthlyAmount, setMonthlyAmount] = useState(250);

  const defaultTargetDate = new Date();
  defaultTargetDate.setFullYear(defaultTargetDate.getFullYear() + 2);

  const [targetDate, setTargetDate] = useState(defaultTargetDate.toISOString().split('T')[0]);
  const [selectedProfileName, setSelectedProfileName] = useState<RiskProfile['name'] | 'Savings'>('Growth');
  const [hiddenProfiles] = useState<string[]>([]);

  const displayData = useMemo(() => {
    if (!selectedGoal) return {};
    
    const data: { [key: string]: { pmt: number, months: number, monthsLower?: number, monthsUpper?: number } } = {};

    const fixedDateTimeline = (() => {
      const today = new Date();
      const target = new Date(targetDate);
      if (target <= today) return 0;
      return (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());
    })();

    ALL_PROFILES.forEach(profile => {
      if (calculationMode === 'fixedDate') {
        if (fixedDateTimeline <= 0) return;
        const monthlyRate = profile.expectedReturn / 12;
        let pmt = 0;
        if (monthlyRate > 0) {
          pmt = (selectedGoal.finalPrice * monthlyRate) / (Math.pow(1 + monthlyRate, fixedDateTimeline) - 1);
        } else {
          pmt = selectedGoal.finalPrice / fixedDateTimeline;
        }
        data[profile.name] = { pmt, months: fixedDateTimeline };
      } else {
        const calcMonths = (rate: number) => {
          if (monthlyAmount <= 0) return Infinity;
          const monthlyRate = rate / 12;
          if (monthlyRate > 0) {
            return Math.log((selectedGoal.finalPrice * monthlyRate / monthlyAmount) + 1) / Math.log(1 + monthlyRate);
          }
          return selectedGoal.finalPrice / monthlyAmount;
        };

        const months = calcMonths(profile.expectedReturn);
        const monthsLower = calcMonths(profile.range.upper);
        const monthsUpper = calcMonths(profile.range.lower);

        data[profile.name] = { 
          pmt: monthlyAmount, 
          months: Math.ceil(months), 
          monthsLower: Math.ceil(monthsLower), 
          monthsUpper: Math.ceil(monthsUpper) 
        };
      }
    });
    return data;
  }, [selectedGoal, targetDate, calculationMode, monthlyAmount]);

  const timelineInMonths = useMemo(() => {
    if (calculationMode === 'fixedDate') {
      const today = new Date();
      const target = new Date(targetDate);
      if (target <= today) return 0;
      return (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth());
    } else {
      const allMonths = Object.values(displayData).map(d => d.monthsUpper || d.months).filter(m => m !== Infinity);
      return allMonths.length > 0 ? Math.max(...allMonths) : 0;
    }
  }, [targetDate, calculationMode, displayData]);

  const chartData = useMemo(() => {
    if (timelineInMonths <= 0) return [];
    const data = [];
    const pmtForSelectedProfile = displayData[selectedProfileName]?.pmt || 0;
    
    const dataPointInterval = Math.max(1, Math.floor(timelineInMonths / 50));
    
    const calcFv = (rate: number, n: number, p: number) => {
      const monthlyRate = rate / 12;
      if (monthlyRate > 0) {
        return p * (Math.pow(1 + monthlyRate, n) - 1) / monthlyRate;
      }
      return p * n;
    };

    for (let i = 0; i <= timelineInMonths; i += dataPointInterval) {
      const actualMonth = Math.min(i, timelineInMonths);
      const monthData: { month: number; [key: string]: number } = { month: actualMonth };

      monthData['totalInvested'] = actualMonth * pmtForSelectedProfile;
      
      const profilesToCalculate = ALL_PROFILES.filter(profile => 
        !hiddenProfiles.includes(profile.name) || profile.name === selectedProfileName
      );

      profilesToCalculate.forEach(profile => {
        const pmt = displayData[profile.name]?.pmt || 0;
        monthData[profile.name] = calcFv(profile.expectedReturn, actualMonth, pmt);
      });
      data.push(monthData);
    }
    
    if (data[data.length - 1]?.month !== timelineInMonths) {
      const monthData: { month: number; [key: string]: number } = { month: timelineInMonths };
      monthData['totalInvested'] = timelineInMonths * pmtForSelectedProfile;
      
      const profilesToCalculate = ALL_PROFILES.filter(profile => 
        !hiddenProfiles.includes(profile.name) || profile.name === selectedProfileName
      );

      profilesToCalculate.forEach(profile => {
        const pmt = displayData[profile.name]?.pmt || 0;
        monthData[profile.name] = calcFv(profile.expectedReturn, timelineInMonths, pmt);
      });
      data.push(monthData);
    }
    
    return data;
  }, [timelineInMonths, displayData, selectedProfileName, hiddenProfiles]);

  if (!selectedGoal) {
    if (typeof window !== 'undefined') {
      setCurrentView('dashboard');
    }
    return null;
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCreateGoal = async () => {
    const selectedProfile = ALL_PROFILES.find(p => p.name === selectedProfileName);
    if (!selectedProfile || !displayData[selectedProfileName]) return;

    const success = await createGoalBasedInvestment(
      selectedGoal.id,
      displayData[selectedProfileName].pmt,
      new Date(targetDate)
    );

    if (success) {
      // Navigate to dashboard on successful goal creation
      setCurrentView('dashboard');
    }
    // If not successful, error will be shown in the UI via the store's error state
  };

  return (
    <div className="min-h-screen bg-neo-dark relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-gradient-to-br from-green-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-blue-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 py-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            onClick={() => setCurrentView('catalogue')}
            className="neo-button-ghost p-2 h-8 w-8"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-medium text-white">Investment Strategy</h1>
            <p className="text-sm text-gray-400">{selectedGoal.title}</p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-6">
            <div className="neo-glass border-red-400/30 p-4 rounded-xl">
              <div className="flex items-center">
                <div className="text-red-400 text-xl mr-3">⚠️</div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-red-300">Error</h3>
                  <p className="text-sm text-red-200 mt-1">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300 text-xl ml-3"
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goal Header */}
        <div className="neo-card-elevated p-5 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-medium text-white mb-1">{selectedGoal.title}</h2>
              <p className="text-sm text-gray-400">{selectedGoal.description}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-semibold text-green-400">{formatCurrency(selectedGoal.finalPrice)}</p>
              <p className="text-xs text-gray-500">Target Amount</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="neo-card p-4 mb-6">
          <Tabs value={calculationMode} onValueChange={(value) => setCalculationMode(value as 'fixedDate' | 'fixedAmount')}>
            <TabsList className="grid w-full grid-cols-2 bg-black/20 h-9">
              {/* Swap functionality: this button now selects fixedAmount mode */}
              <TabsTrigger value="fixedAmount" className="text-sm data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400">
                Target Date
              </TabsTrigger>
              {/* Swap functionality: this button now selects fixedDate mode */}
              <TabsTrigger value="fixedDate" className="text-sm data-[state=active]:bg-green-600/20 data-[state=active]:text-green-400">
                Monthly Amount
              </TabsTrigger>
            </TabsList>
            
            {/* Swap: date input now bound to fixedAmount mode */}
            <TabsContent value="fixedAmount" className="mt-4">
              <div className="space-y-3">
                <Label htmlFor="target-date" className="text-sm text-gray-300">When do you want to reach this goal?</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <Input
                    id="target-date"
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    className="bg-black/20 border-white/10 text-white text-sm h-9"
                  />
                </div>
              </div>
            </TabsContent>
            
            {/* Swap: monthly amount input now bound to fixedDate mode */}
            <TabsContent value="fixedDate" className="mt-4">
              <div className="space-y-3">
                <Label htmlFor="monthly-amount" className="text-sm text-gray-300">How much can you invest monthly?</Label>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-400" />
                  <Input
                    id="monthly-amount"
                    type="number"
                    value={monthlyAmount}
                    onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                    className="bg-black/20 border-white/10 text-white text-sm h-9"
                    placeholder="250"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {timelineInMonths > 0 && (
          <>
            {/* Investment Strategies */}
            <div className="neo-card p-4 mb-6">
              <h3 className="text-base font-medium text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Investment Strategies
              </h3>
              <div className="grid gap-3">
                {ALL_PROFILES.map((profile) => (
                  <div
                    key={profile.name}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedProfileName === profile.name
                        ? 'border-green-500/50 bg-green-500/5'
                        : 'border-white/10 bg-black/20 hover:border-white/20'
                    }`}
                    onClick={() => setSelectedProfileName(profile.name)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-white text-sm">{profile.name}</h4>
                        <p className="text-xs text-gray-400 mt-1">
                          Expected: {(profile.expectedReturn * 100).toFixed(1)}% annually
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-white">
                          {calculationMode === 'fixedDate' 
                            ? formatCurrency(displayData[profile.name]?.pmt || 0)
                            : `${Math.ceil(displayData[profile.name]?.months || 0)} months`
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {calculationMode === 'fixedDate' ? 'per month' : 'to reach goal'}
                        </p>
                      </div>
                    </div>


                  </div>
                ))}
              </div>
            </div>

            {/* Chart */}
            <div className="neo-card p-4 mb-6">
              <h3 className="text-base font-medium text-white mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-400" />
                Growth Projection
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis 
                      dataKey="month" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                      tickFormatter={(value) => `${(value / 1000).toFixed(0)}K`}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.95)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '6px',
                        color: 'white',
                        fontSize: '12px'
                      }}
                      formatter={(value) => [formatCurrency(value as number), '']}
                      labelFormatter={(month) => `Month ${month}`}
                    />
                    <ReferenceLine 
                      y={selectedGoal.finalPrice} 
                      stroke="#22c55e" 
                      strokeDasharray="3 3" 
                      strokeWidth={1}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalInvested"
                      stroke="#6b7280"
                      strokeWidth={1}
                      strokeDasharray="3 3"
                      dot={false}
                    />
                    {ALL_PROFILES.map(profile => (
                      <Line
                        key={profile.name}
                        type="monotone"
                        dataKey={profile.name}
                        stroke={PROFILE_COLORS[profile.name]}
                        strokeWidth={selectedProfileName === profile.name ? 2.5 : 1.5}
                        dot={false}
                      />
                    ))}
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              {/* Chart Legend */}
              <div className="mt-4 space-y-3">
                <div className="flex flex-wrap justify-center gap-4">
                  {/* Investment Strategy Lines */}
                  {ALL_PROFILES.map(profile => (
                    <div key={profile.name} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-0.5 rounded"
                        style={{ 
                          backgroundColor: PROFILE_COLORS[profile.name],
                          opacity: selectedProfileName === profile.name ? 1 : 0.7
                        }}
                      />
                      <span className={`text-xs ${
                        selectedProfileName === profile.name 
                          ? 'text-white font-medium' 
                          : 'text-gray-400'
                      }`}>
                        {profile.name}
                      </span>
                    </div>
                  ))}
                  
                  {/* Total Invested Line */}
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-0.5 bg-gray-500" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, #6b7280 2px, #6b7280 4px)' }} />
                    <span className="text-xs text-gray-400">Total Invested</span>
                  </div>
                </div>
                
                {/* Line Explanations */}
                <div className="grid grid-cols-1 gap-4 text-xs justify-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-1 h-4 bg-gray-500 opacity-10" />
                    <span className="text-gray-400">Timeline Grid</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Button 
              onClick={handleCreateGoal} 
              className="w-full neo-button text-white font-medium py-2.5 h-10 text-sm" 
              disabled={isLoading || !displayData[selectedProfileName]}
            >
              {isLoading ? 'Creating Investment...' : `Start Investing with ${selectedProfileName} Strategy`}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
