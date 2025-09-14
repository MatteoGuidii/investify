'use client';

import { TrendingUp, TrendingDown } from 'lucide-react';
import { KpiProps } from '@/lib/wrap/types';

export function Kpi({ 
  label, 
  value, 
  hint, 
  trend, 
  testId 
}: KpiProps) {
  // Format numbers with proper localization
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    
    // Check if it's a percentage
    if (label.toLowerCase().includes('rate') || label.toLowerCase().includes('%')) {
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 0,
        maximumFractionDigits: 1
      }).format(val / 100);
    }
    
    // Check if it's a currency amount
    if (label.toLowerCase().includes('invested') || 
        label.toLowerCase().includes('saved') || 
        label.toLowerCase().includes('return') ||
        label.toLowerCase().includes('fees')) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(val);
    }
    
    // Default number formatting
    return new Intl.NumberFormat('en-US').format(val);
  };

  const formattedValue = formatValue(value);
  
  const getTrendIcon = () => {
    if (!trend) return null;
    
    const iconClass = "w-4 h-4 ml-1";
    if (trend === 'up') {
      return <TrendingUp className={`${iconClass} text-green-500`} aria-label="Trending up" />;
    }
    if (trend === 'down') {
      return <TrendingDown className={`${iconClass} text-red-500`} aria-label="Trending down" />;
    }
    return null;
  };

  return (
    <div 
      className="space-y-1"
      data-testid={testId}
    >
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white/80">
          {label}
        </p>
        {getTrendIcon()}
      </div>
      
      <div className="flex items-baseline space-x-1">
        <span className="text-2xl font-bold text-white">
          {formattedValue}
        </span>
      </div>
      
      {hint && (
        <p className="text-xs text-white/70 leading-relaxed">
          {hint}
        </p>
      )}
    </div>
  );
}
