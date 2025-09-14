'use client';

import { motion } from 'framer-motion';
import { Sparkles, X, Share2, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Kpi } from './Kpi';
import { TrendMiniChart } from './TrendMiniChart';
import { EpicWrapCardProps } from '@/lib/wrap/types';

export function EpicWrapCard({ 
  wrap, 
  onViewDetails, 
  onDismiss, 
  onShare 
}: EpicWrapCardProps) {
  const { kpis, timeline, periodLabel } = wrap;
  
  // Calculate total return for hero display
  const totalReturn = kpis.roboAdvisorReturnAbs;
  const totalReturnPct = kpis.roboAdvisorReturnPct;
  const isPositiveReturn = totalReturn > 0;

  // Format currency values
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format percentage
  const formatPercent = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      <div className="neo-card p-6 relative">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-green-400/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-green-400" />
            </div>
            <div>
              <h3 className="text-white font-medium text-lg">
                {periodLabel}
              </h3>
              <p className="text-white/80 text-sm">
                A standout period for staying invested
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge 
              variant="secondary" 
              className="bg-green-400/20 text-green-400 border-green-400/30"
            >
              New
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="h-8 w-8 p-0 text-gray-400 hover:text-gray-300"
              aria-label="Dismiss wrap-up"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Hero Stats */}
          <div className="neo-glass p-4 rounded-xl text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <span className={`text-2xl font-semibold ${isPositiveReturn ? 'text-green-400' : 'text-red-400'}`}>
                {formatCurrency(totalReturn)}
              </span>
              <Badge 
                variant={isPositiveReturn ? "default" : "destructive"}
                className="flex items-center space-x-1 text-white"
              >
                {isPositiveReturn ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="text-white">{formatPercent(totalReturnPct)}</span>
              </Badge>
            </div>
            <p className="text-sm text-white">
              Total return from roboadvisor
            </p>
          </div>

          {/* KPI Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            <Kpi
              label="Amount Invested"
              value={kpis.totalInvested}
              testId="kpi-total-invested"
            />
            <Kpi
              label="Total Saved"
              value={kpis.totalSaved}
              testId="kpi-total-saved"
            />
            <Kpi
              label="Saving Streak"
              value={`${kpis.savingStreakWeeks} weeks`}
              trend="up"
              testId="kpi-saving-streak"
            />
            <Kpi
              label="Fees Avoided"
              value={kpis.feesAvoided}
              hint="Estimated brokerage fees saved"
              testId="kpi-fees-avoided"
            />
            <Kpi
              label="Auto-Invest Success Rate"
              value={kpis.autoInvestSuccessRatePct}
              testId="kpi-auto-invest-rate"
            />
            <Kpi
              label="Diversification Score"
              value={`${kpis.diversificationScore}/100`}
              hint="Portfolio balance across asset classes"
              testId="kpi-diversification"
            />
          </div>

          {/* Mini Trend Chart */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-white/90">
              Portfolio Growth Trend
            </h4>
            <TrendMiniChart 
              points={timeline.slice(-12)} // Show last 12 points for card view
              className="neo-glass p-2 rounded-lg"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-700/30">
            <Button 
              onClick={onViewDetails}
              className="flex-1 neo-button-primary"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            
            {onShare && (
              <Button 
                variant="outline" 
                onClick={onShare}
                className="flex-1 sm:flex-none text-white border-white/20 hover:bg-white/10"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
          </div>

          {/* Footnote */}
          <p className="text-xs text-white/70 text-center">
            Data reflects your activity during the period.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
