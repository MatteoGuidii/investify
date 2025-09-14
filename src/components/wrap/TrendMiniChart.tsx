'use client';

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { TrendMiniChartProps } from '@/lib/wrap/types';

export function TrendMiniChart({ points, className = '' }: TrendMiniChartProps) {
  // Don't render if we have insufficient data
  if (!points || points.length < 2) {
    return (
      <div className={`flex items-center justify-center h-24 text-xs text-white/80 ${className}`}>
        Insufficient data for chart
      </div>
    );
  }

  // Transform data for recharts
  const chartData = points.map(point => ({
    ...point,
    date: parseISO(point.date),
    formattedDate: format(parseISO(point.date), 'MMM dd')
  }));

  // Calculate domain for better visualization
  const values = points.map(p => p.portfolioValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1;
  const yDomain = [
    Math.max(0, minValue - padding),
    maxValue + padding
  ];

  // Determine if trend is positive
  const isPositiveTrend = points[points.length - 1].portfolioValue > points[0].portfolioValue;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border border-gray-200 dark:border-gray-600 rounded shadow-lg">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            {data.formattedDate}
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {new Intl.NumberFormat('en-US', {
              style: 'currency',
              currency: 'USD',
              minimumFractionDigits: 0,
              maximumFractionDigits: 0
            }).format(data.portfolioValue)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`h-24 w-full ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
        >
          <defs>
            <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
              <stop 
                offset="5%" 
                stopColor={isPositiveTrend ? "#10b981" : "#ef4444"} 
                stopOpacity={0.3}
              />
              <stop 
                offset="95%" 
                stopColor={isPositiveTrend ? "#10b981" : "#ef4444"} 
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="date"
            type="number"
            scale="time"
            domain={['dataMin', 'dataMax']}
            tick={false}
            axisLine={false}
          />
          
          <YAxis 
            domain={yDomain}
            tick={false}
            axisLine={false}
          />
          
          <Tooltip 
            content={<CustomTooltip />}
            cursor={{ stroke: isPositiveTrend ? "#10b981" : "#ef4444", strokeWidth: 1 }}
          />
          
          <Area
            type="monotone"
            dataKey="portfolioValue"
            stroke={isPositiveTrend ? "#10b981" : "#ef4444"}
            strokeWidth={2}
            fill="url(#portfolioGradient)"
            dot={false}
            activeDot={{ 
              r: 3, 
              fill: isPositiveTrend ? "#10b981" : "#ef4444",
              stroke: "#fff",
              strokeWidth: 1
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
