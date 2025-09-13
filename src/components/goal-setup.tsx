'use client';

import { useState, useMemo } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { RISK_PROFILES, RiskProfile } from '../lib/risk-profiles';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, ReferenceLine, Area } from 'recharts';

const SavingsProfile: RiskProfile = {
  name: 'Savings',
  expectedReturn: 0.005, // 0.5% for high-yield savings
  volatility: 0,
  meanAbsoluteDeviation: 0,
  range: { lower: 0.005, upper: 0.005 },
};

const ALL_PROFILES = [...RISK_PROFILES, SavingsProfile];

const PROFILE_COLORS: { [key: string]: string } = {
  'Total Invested': '#a1a1aa',
  'Safe': '#3b82f6',
  'Growth': '#22c55e',
  'Risky': '#ef4444',
  'Savings': '#6b7280',
};

export function GoalSetup() {
  const { selectedGoal, setCurrentView, createGoalBasedInvestment, isLoading } = useAppStore();
  
  const [calculationMode, setCalculationMode] = useState<'fixedDate' | 'fixedAmount'>('fixedDate');
  const [monthlyAmount, setMonthlyAmount] = useState(250);

  const defaultTargetDate = new Date();
  defaultTargetDate.setFullYear(defaultTargetDate.getFullYear() + 2);

  const [targetDate, setTargetDate] = useState(defaultTargetDate.toISOString().split('T')[0]);
  const [selectedProfileName, setSelectedProfileName] = useState<RiskProfile['name'] | 'Savings'>('Growth');
  const [riskPerspectiveProfile, setRiskPerspectiveProfile] = useState<string | null>(null);
  const [hiddenProfiles, setHiddenProfiles] = useState<string[]>([]);
  const [hoveredProfile, setHoveredProfile] = useState<string | null>(null);

  // Move all useMemo hooks before conditional logic
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
          if (monthlyAmount + (selectedGoal.finalPrice * monthlyRate) <= 0) return Infinity;
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
      // In fixed amount mode, find the longest timeline to ensure all profiles are visible
      const allMonths = Object.values(displayData).map(d => d.monthsUpper || d.months).filter(m => m !== Infinity);
      return allMonths.length > 0 ? Math.max(...allMonths) : 0;
    }
  }, [targetDate, calculationMode, displayData]);


  const chartData = useMemo(() => {
    if (timelineInMonths <= 0) return [];
    const data = [];
    const pmtForSelectedProfile = displayData[selectedProfileName]?.pmt || 0;
    
    // Only calculate data points for every few months to reduce data points and improve performance
    const dataPointInterval = Math.max(1, Math.floor(timelineInMonths / 50)); // Max 50 data points
    
    // Helper function to calculate future value
    const calcFv = (rate: number, n: number, p: number) => {
      const monthlyRate = rate / 12;
      if (monthlyRate > 0) {
        return p * (Math.pow(1 + monthlyRate, n) - 1) / monthlyRate;
      }
      return p * n;
    };

    for (let i = 0; i <= timelineInMonths; i += dataPointInterval) {
      const actualMonth = Math.min(i, timelineInMonths); // Ensure we include the final month
      const monthData: { month: number; [key: string]: number } = { month: actualMonth };

      // Always include total invested line
      monthData['totalInvested'] = actualMonth * pmtForSelectedProfile;
      
      // Only calculate data for visible profiles and selected profile
      const profilesToCalculate = ALL_PROFILES.filter(profile => 
        !hiddenProfiles.includes(profile.name) || profile.name === selectedProfileName
      );

      profilesToCalculate.forEach(profile => {
        const pmt = displayData[profile.name]?.pmt || 0;
        monthData[profile.name] = calcFv(profile.expectedReturn, actualMonth, pmt);
        
        // Only calculate risk ranges if the risk perspective is enabled for this profile
        if (riskPerspectiveProfile === profile.name && profile.name !== 'Savings') {
          const lowerBound = calcFv(profile.range.lower, actualMonth, pmt);
          const upperBound = calcFv(profile.range.upper, actualMonth, pmt);
          monthData[`${profile.name}_lower`] = lowerBound;
          monthData[`${profile.name}_upper`] = upperBound;
          monthData[`${profile.name}_range`] = upperBound - lowerBound;
        }
      });
      data.push(monthData);
    }
    
    // Ensure the final data point is included
    if (data[data.length - 1]?.month !== timelineInMonths) {
      const monthData: { month: number; [key: string]: number } = { month: timelineInMonths };
      monthData['totalInvested'] = timelineInMonths * pmtForSelectedProfile;
      
      const profilesToCalculate = ALL_PROFILES.filter(profile => 
        !hiddenProfiles.includes(profile.name) || profile.name === selectedProfileName
      );

      profilesToCalculate.forEach(profile => {
        const pmt = displayData[profile.name]?.pmt || 0;
        monthData[profile.name] = calcFv(profile.expectedReturn, timelineInMonths, pmt);
        
        if (riskPerspectiveProfile === profile.name && profile.name !== 'Savings') {
          const lowerBound = calcFv(profile.range.lower, timelineInMonths, pmt);
          const upperBound = calcFv(profile.range.upper, timelineInMonths, pmt);
          monthData[`${profile.name}_lower`] = lowerBound;
          monthData[`${profile.name}_upper`] = upperBound;
          monthData[`${profile.name}_range`] = upperBound - lowerBound;
        }
      });
      data.push(monthData);
    }
    
    return data;
  }, [timelineInMonths, displayData, selectedProfileName, hiddenProfiles, riskPerspectiveProfile]);

  const goalIntersectionPoints = useMemo(() => {
    const points: { [key: string]: number } = {};
    if (!chartData.length || !selectedGoal) return points;

    ALL_PROFILES.forEach(profile => {
      if (hiddenProfiles.includes(profile.name)) return;

      const goalMonth = chartData.findIndex(d => d[profile.name] >= selectedGoal.finalPrice);
      if (goalMonth !== -1) {
        points[profile.name] = goalMonth;
      }
    });
    return points;
  }, [chartData, selectedGoal, hiddenProfiles]);

  // Early return after all hooks are called
  if (!selectedGoal) {
    if (typeof window !== 'undefined') {
      setCurrentView('catalogue');
    }
    return null;
  }

  const GoalMarkerDot = (props: { cx?: number; cy?: number; payload?: { month: number }; [key: string]: unknown }) => {
    const { cx, cy, payload } = props;
    if (!cx || !cy || !payload) return null;
    
    const month = payload.month;
    const dataKey = props.dataKey as string;
    const intersectionMonth = goalIntersectionPoints[dataKey];

    if (month === intersectionMonth) {
      return <circle cx={cx} cy={cy} r={6} stroke={PROFILE_COLORS[dataKey]} strokeWidth={2} fill="#fff" />;
    }

    return null;
  };

  const handleCreateGoal = async () => {
    const profileData = displayData[selectedProfileName];
    if (!profileData || profileData.pmt <= 0) return;

    const finalTargetDate = new Date();
    finalTargetDate.setMonth(finalTargetDate.getMonth() + profileData.months);

    const success = await createGoalBasedInvestment(
      selectedGoal.id,
      profileData.pmt,
      finalTargetDate
    );
    
    if (success) {
      setCurrentView('dashboard');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0 }).format(amount);
  };

    const CustomTooltip = ({ active, payload, label }: { 
      active?: boolean; 
      payload?: Array<{ 
        dataKey: string; 
        value: number; 
        name: string; 
        color: string; 
        payload: { [key: string]: number } 
      }>; 
      label?: string | number;
    }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;

      return (
        <div className="p-2 bg-white border rounded-lg shadow-lg">
          <p className="font-bold mb-2 text-sm text-gray-700">{`Month: ${label}`}</p>
          <ul className="space-y-1">
            {payload.map((pld: { dataKey: string; value: number; name: string; color: string; payload: { [key: string]: number } }) => {
              if (pld.dataKey.includes('_lower') || pld.dataKey.includes('_range') || pld.dataKey.includes('_upper')) return null;

              const isRiskProfile = riskPerspectiveProfile === pld.dataKey;
              const lowerBound = data[`${pld.dataKey}_lower`];
              const upperBound = lowerBound + data[`${pld.dataKey}_range`];

              return (
                <li key={pld.dataKey} style={{ color: pld.color }} className="text-xs font-medium">
                  {`${pld.name}: ${formatCurrency(pld.value)}`}
                  {isRiskProfile && (
                    <div className="pl-3 text-gray-500 font-normal">
                      <p>Risk Range: {formatCurrency(lowerBound)} - {formatCurrency(upperBound)}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      );
    }

    return null;
  };

  const handleLegendClick = (dataKey: string) => {
    if (hiddenProfiles.includes(dataKey)) {
      setHiddenProfiles(hiddenProfiles.filter(p => p !== dataKey));
    } else {
      setHiddenProfiles([...hiddenProfiles, dataKey]);
    }
  };

  const renderLegend = (props: { payload?: readonly unknown[] }) => {
    const { payload } = props;

    return (
      <div className="flex justify-center items-center space-x-4 mt-4">
        {payload?.map((item: unknown, index: number) => {
          const entry = item as { dataKey: string; value: string; color: string };
          
          // Filter out any risk-related entries that shouldn't show in legend
          if (entry.dataKey.includes('_lower') || 
              entry.dataKey.includes('_upper') || 
              entry.dataKey.includes('_range')) {
            return null;
          }
          
          return (
            <div 
              key={`item-${index}`} 
              onClick={() => handleLegendClick(entry.dataKey)}
              onMouseEnter={() => setHoveredProfile(entry.dataKey)}
              onMouseLeave={() => setHoveredProfile(null)}
              className={`flex items-center space-x-2 cursor-pointer transition-opacity ${hiddenProfiles.includes(entry.dataKey) ? 'opacity-50' : 'opacity-100'}`}
            >
              <div style={{ width: 12, height: 12, backgroundColor: entry.color }}></div>
              <span className="text-sm text-gray-600">{entry.value}</span>
            </div>
          );
        })}
      </div>
    );
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel': return '✈️';
      case 'education': return '🎓';
      case 'tech': return '📱';
      case 'car': return '🚗';
      case 'home': return '🏠';
      case 'experience': return '🎵';
      case 'lifestyle': return '💰';
      default: return '🎯';
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => setCurrentView('catalogue')} className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Goals
      </Button>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-3xl">{getCategoryIcon(selectedGoal.category)}</span>
            {selectedGoal.title}
          </CardTitle>
          <p className="text-gray-600">{selectedGoal.description}</p>
          <p className="text-2xl font-bold text-blue-600">{formatCurrency(selectedGoal.finalPrice)}</p>
        </CardHeader>
      </Card>

      <Tabs value={calculationMode} onValueChange={(value) => setCalculationMode(value as 'fixedDate' | 'fixedAmount')} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="fixedDate">
            <Calendar className="w-4 h-4 mr-2" />
            Plan by Date
          </TabsTrigger>
          <TabsTrigger value="fixedAmount">
            <DollarSign className="w-4 h-4 mr-2" />
            Plan by Amount
          </TabsTrigger>
        </TabsList>
        <TabsContent value="fixedDate">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>1. Select Your Target Date</CardTitle>
              <CardDescription>When do you want to achieve this goal?</CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                min={new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="fixedAmount">
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>1. Set Your Monthly Investment</CardTitle>
              <CardDescription>How much can you invest each month?</CardDescription>
            </CardHeader>
            <CardContent>
              <Input 
                type="number"
                value={monthlyAmount}
                onChange={(e) => setMonthlyAmount(Number(e.target.value))}
                min="1"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {timelineInMonths > 0 && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>2. Choose Your Investment Strategy</CardTitle>
              <CardDescription>
                {calculationMode === 'fixedDate' 
                  ? 'Each strategy requires a different monthly investment.' 
                  : 'Each strategy will reach your goal on a different timeline.'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {ALL_PROFILES.map(profile => (
                <div key={profile.name} className={`w-full p-4 border rounded-lg transition-all ${selectedProfileName === profile.name ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'hover:border-gray-400'}`}>
                  <div className="flex justify-between items-center cursor-pointer" onClick={() => setSelectedProfileName(profile.name as RiskProfile['name'] | 'Savings')}>
                    <div>
                      <p className="font-semibold">{profile.name}</p>
                      <p className="text-sm text-gray-600">Expected Return: { (profile.expectedReturn * 100).toFixed(1) }%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(displayData[profile.name]?.pmt || 0)}/mo</p>
                        {calculationMode === 'fixedAmount' ? (
                        <p className="text-xs text-gray-500">
                          ~ {displayData[profile.name]?.months} months
                          {displayData[profile.name]?.monthsLower !== displayData[profile.name]?.monthsUpper && (
                            <span className="ml-1 text-gray-400">({displayData[profile.name]?.monthsLower} - {displayData[profile.name]?.monthsUpper})</span>
                          )}
                        </p>
                      ) : (
                        <p className="text-xs text-gray-500">for {displayData[profile.name]?.months || 0} months</p>
                      )}
                    </div>
                  </div>
                  {profile.name !== 'Savings' && (
                    <div className="flex items-center justify-end space-x-2 mt-2 pt-2 border-t border-gray-200">
                      <Label htmlFor={`risk-switch-${profile.name}`} className="text-xs text-gray-500">Show Risk Range</Label>
                      <Switch
                        id={`risk-switch-${profile.name}`}
                        checked={riskPerspectiveProfile === profile.name}
                        onCheckedChange={(checked: boolean) => {
                          if (checked) {
                            setRiskPerspectiveProfile(profile.name);
                          } else {
                            setRiskPerspectiveProfile(null);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Investment Growth Projection
              </CardTitle>
              <CardDescription>How your investment could grow over {timelineInMonths} months.</CardDescription>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 400 }}>
                <ResponsiveContainer>
                  <LineChart 
                    data={chartData} 
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="month" 
                      label={{ value: 'Months', position: 'insideBottom', offset: -5 }} 
                      stroke="#666"
                    />
                    <YAxis 
                      tickFormatter={(value) => {
                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                        return formatCurrency(value);
                      }}
                      domain={[0, (dataMax: number) => Math.max(dataMax * 1.1, selectedGoal.finalPrice * 1.2)]}
                      stroke="#666"
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend content={renderLegend} />
                    <ReferenceLine 
                      y={selectedGoal.finalPrice} 
                      label={{ value: 'Your Goal', position: 'insideTopLeft', fill: '#666', fontSize: 12 }} 
                      stroke="#e11d48" 
                      strokeDasharray="5 5" 
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="totalInvested"
                      name="Total Invested"
                      stroke={PROFILE_COLORS['Total Invested']}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                      hide={hiddenProfiles.includes('Total Invested')}
                    />
                    
                    {ALL_PROFILES.map(profile => {
                      const isRiskPerspectiveOn = riskPerspectiveProfile === profile.name && profile.name !== 'Savings' && !hiddenProfiles.includes(profile.name);
                      return (
                        <g key={profile.name}>
                          {isRiskPerspectiveOn && (
                            <>
                              <Area
                                stackId={`range-${profile.name}`}
                                dataKey={`${profile.name}_lower`}
                                stroke="none"
                                fillOpacity={0} // Invisible base for stacking
                              />
                              <Area
                                stackId={`range-${profile.name}`}
                                dataKey={`${profile.name}_range`}
                                stroke="none"
                                fill={PROFILE_COLORS[profile.name]}
                                fillOpacity={0.2}
                              />
                              <Line
                                type="monotone"
                                dataKey={`${profile.name}_lower`}
                                stroke={PROFILE_COLORS[profile.name]}
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={false}
                              />
                              <Line
                                type="monotone"
                                dataKey={`${profile.name}_upper`}
                                stroke={PROFILE_COLORS[profile.name]}
                                strokeWidth={1}
                                strokeDasharray="3 3"
                                dot={false}
                              />
                            </>
                          )}
                          <Line 
                            type="monotone" 
                            dataKey={profile.name} 
                            stroke={PROFILE_COLORS[profile.name]} 
                            strokeWidth={hoveredProfile === profile.name ? 4 : (selectedProfileName === profile.name ? 3 : 2)}
                            hide={hiddenProfiles.includes(profile.name)}
                            dot={<GoalMarkerDot dataKey={profile.name} />}
                            strokeDasharray={profile.name === 'Savings' ? '8 4' : '0'}
                            connectNulls={false}
                          />
                        </g>
                      );
                    })}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="mt-6">
            <Button 
              onClick={handleCreateGoal} 
              className="w-full" 
              disabled={isLoading || !displayData[selectedProfileName] || displayData[selectedProfileName].pmt <= 0}
            >
              {isLoading ? 'Creating Investment...' : `Start Investing with ${selectedProfileName} Profile`}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}