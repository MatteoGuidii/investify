'use client';

import { motion } from 'framer-motion';
import { Sparkles, X, Share2, Eye, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
      <Card className="relative overflow-hidden border-2 border-gradient-to-r from-blue-500/20 to-purple-500/20 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-purple-500/5 rounded-full blur-2xl transform translate-x-16 -translate-y-16" />
        
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {periodLabel}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  A standout period for staying invested
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Badge 
                variant="secondary" 
                className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
              >
                New
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDismiss}
                className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                aria-label="Dismiss wrap-up"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Hero Stats */}
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-2">
              <span className={`text-3xl font-bold ${isPositiveReturn ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {formatCurrency(totalReturn)}
              </span>
              <Badge 
                variant={isPositiveReturn ? "default" : "destructive"}
                className="flex items-center space-x-1"
              >
                {isPositiveReturn ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span>{formatPercent(totalReturnPct)}</span>
              </Badge>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
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
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Portfolio Growth Trend
            </h4>
            <TrendMiniChart 
              points={timeline.slice(-12)} // Show last 12 points for card view
              className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-2"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button 
              onClick={onViewDetails}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            
            {onShare && (
              <Button 
                variant="outline" 
                onClick={onShare}
                className="flex-1 sm:flex-none"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            )}
          </div>

          {/* Footnote */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Data reflects your activity during the period.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
