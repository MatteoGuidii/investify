"use client";

import { motion } from "framer-motion";
import {
  X,
  Share2,
  Download,
  Target,
  Award,
  BarChart3,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
// Removed unused Badge import
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { Kpi } from "./Kpi";
import { EpicWrapSlideOverProps } from "@/lib/wrap/types";
import { useState } from "react";

export function EpicWrapSlideOver({
  wrap,
  isOpen,
  onClose,
  onShare,
  onDownload,
}: EpicWrapSlideOverProps) {
  const { periodLabel, userFirstName, kpis, timeline, highlights } = wrap;

  // Transform timeline data for the larger chart
  const chartData = timeline.map((point) => ({
    ...point,
    date: parseISO(point.date),
    formattedDate: format(parseISO(point.date), "MMM dd"),
    formattedValue: new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(point.portfolioValue),
  }));

  // Calculate chart domain
  const values = timeline.map((p) => p.portfolioValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1;
  const yDomain = [Math.max(0, minValue - padding), maxValue + padding];

  const isPositiveTrend = timeline[timeline.length - 1].portfolioValue > timeline[0].portfolioValue;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);
  };

  interface RechartsPayloadItem {
    payload: {
      formattedDate: string;
      formattedValue: string;
    };
  }
  interface CustomTooltipProps {
    active?: boolean;
    payload?: RechartsPayloadItem[];
  }
  const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg">
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
            {data.formattedDate}
          </p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {data.formattedValue}
          </p>
        </div>
      );
    }
    return null;
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      onClose();
    }
  };

  const [shared, setShared] = useState<null | "copied" | "shared">(null);
  const handleShareClick = async () => {
    if (onShare) {
      await onShare();
      // onShare already handles share; we just set optimistic feedback
      setShared("copied");
      setTimeout(() => setShared(null), 2000);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto"
        onKeyDown={handleKeyDown}
      >
        <SheetHeader className="space-y-4 pb-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <SheetTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                {periodLabel}
              </SheetTitle>
              <p className="text-lg text-gray-600 dark:text-gray-300 mt-1">
                Nice work, {userFirstName}.
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
              aria-label="Close wrap details"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            {onShare && (
              <Button
                variant="outline"
                onClick={handleShareClick}
                className="flex-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                {shared === "copied" ? "Copied!" : "Copy Link"}
              </Button>
            )}
            {onDownload && (
              <Button variant="outline" onClick={onDownload} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download Image
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="space-y-8 py-6">
          {/* 2025 Summary Statistics */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Your 2025 Summary
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl p-4 border border-green-200 dark:border-green-700/50">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {formatCurrency(kpis.roboAdvisorReturnAbs)}
                </div>
                <div className="text-lg font-semibold text-green-700 dark:text-green-300">
                  {formatPercent(kpis.roboAdvisorReturnPct)}
                </div>
                <div className="text-sm text-green-600 dark:text-green-400">
                  Total return from roboadvisor
                </div>
              </div>

              <Kpi
                label="Amount Invested"
                value={formatCurrency(kpis.totalInvested)}
                hint="Total amount you invested this year"
                testId="summary-amount-invested"
              />

              <Kpi
                label="Total Saved"
                value={formatCurrency(kpis.totalSaved)}
                hint="Total amount saved across all goals"
                testId="summary-total-saved"
              />

              <Kpi
                label="Saving Streak"
                value={`${kpis.savingStreakWeeks} weeks`}
                trend="up"
                hint="Consecutive weeks with deposits"
                testId="summary-saving-streak"
              />

              <Kpi
                label="Fees Avoided"
                value={formatCurrency(kpis.feesAvoided)}
                hint="Estimated brokerage fees saved"
                testId="summary-fees-avoided"
              />

              <Kpi
                label="Auto-Invest Success Rate"
                value={`${kpis.autoInvestSuccessRatePct}%`}
                trend={kpis.autoInvestSuccessRatePct >= 90 ? "up" : null}
                hint="Percentage of successful automated investments"
                testId="summary-auto-invest"
              />

              <Kpi
                label="Diversification Score"
                value={`${kpis.diversificationScore}/100`}
                hint="Portfolio balance across asset classes"
                testId="summary-diversification"
              />
            </div>
          </motion.section>

          {/* Performance Overview */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Performance Overview
              </h2>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="portfolioGradientLarge"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor={isPositiveTrend ? "#3b82f6" : "#ef4444"}
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor={isPositiveTrend ? "#3b82f6" : "#ef4444"}
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>

                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="opacity-30"
                    />

                    <XAxis
                      dataKey="date"
                      type="number"
                      scale="time"
                      domain={["dataMin", "dataMax"]}
                      tickFormatter={(value) => format(new Date(value), "MMM")}
                      className="text-xs"
                    />

                    <YAxis
                      domain={yDomain}
                      tickFormatter={(value) =>
                        `$${(value / 1000).toFixed(0)}k`
                      }
                      className="text-xs"
                    />

                    <Tooltip content={<CustomTooltip />} />

                    <Area
                      type="monotone"
                      dataKey="portfolioValue"
                      stroke={isPositiveTrend ? "#3b82f6" : "#ef4444"}
                      strokeWidth={3}
                      fill="url(#portfolioGradientLarge)"
                      dot={false}
                      activeDot={{
                        r: 4,
                        fill: isPositiveTrend ? "#3b82f6" : "#ef4444",
                        stroke: "#fff",
                        strokeWidth: 2,
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.section>

          {/* Detailed KPIs */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Key Metrics
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Kpi
                label="Total Invested"
                value={kpis.totalInvested}
                hint="Sum of all deposits made during the period"
                testId="detail-kpi-total-invested"
              />
              <Kpi
                label="Total Saved"
                value={kpis.totalSaved}
                hint="Cash saved vs. baseline spending"
                testId="detail-kpi-total-saved"
              />
              <Kpi
                label="Roboadvisor Return"
                value={`${formatCurrency(kpis.roboAdvisorReturnAbs)} (${formatPercent(kpis.roboAdvisorReturnPct)})`}
                trend={kpis.roboAdvisorReturnAbs > 0 ? "up" : "down"}
                hint="Absolute and percentage return generated"
                testId="detail-kpi-return"
              />
              <Kpi
                label="Fees Avoided"
                value={kpis.feesAvoided}
                hint="Estimated brokerage and bank fees saved"
                testId="detail-kpi-fees"
              />
              <Kpi
                label="Best Month"
                value={`${kpis.bestMonth.month} (${formatPercent(kpis.bestMonth.returnPct)})`}
                hint={`${formatCurrency(kpis.bestMonth.netDeposits)} in net deposits`}
                testId="detail-kpi-best-month"
              />
              <Kpi
                label="Top Asset"
                value={`${kpis.topAsset.name}`}
                hint={`${formatPercent(kpis.topAsset.returnPct)} return, ${formatCurrency(kpis.topAsset.contributionAbs)} contributed`}
                testId="detail-kpi-top-asset"
              />
              <Kpi
                label="Risk Level"
                value={kpis.riskLevel}
                hint="Your investment risk profile"
                testId="detail-kpi-risk-level"
              />
              <Kpi
                label="Goals Achieved"
                value={`${kpis.goalsAchieved} goals`}
                trend={kpis.goalsAchieved > 0 ? "up" : null}
                hint="Financial goals completed this period"
                testId="detail-kpi-goals"
              />
              <Kpi
                label="Referrals"
                value={`${kpis.referralCount} friends`}
                hint="Friends you've invited to start investing"
                testId="detail-kpi-referrals"
              />
              <Kpi
                label="Saving Streak"
                value={`${kpis.savingStreakWeeks} weeks`}
                trend="up"
                hint="Consecutive weeks with deposits"
                testId="detail-kpi-streak"
              />
            </div>
          </motion.section>

          {/* Highlights */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center space-x-2 mb-4">
              <Award className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Highlights
              </h2>
            </div>

            <div className="space-y-3">
              {highlights.map((highlight, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="flex items-start space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    {highlight}
                  </p>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Methodology */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="border-t border-gray-200 dark:border-gray-700 pt-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Methodology
            </h2>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
              <p>
                <strong>Returns:</strong> Time-weighted returns calculated using
                daily portfolio valuations, net of fees and adjusted for
                deposits and withdrawals.
              </p>
              <p>
                <strong>Diversification Score:</strong> Measures portfolio
                balance across asset classes, sectors, and geographic regions on
                a scale of 0-100.
              </p>
              <p>
                <strong>Fees Avoided:</strong> Estimated based on typical
                brokerage commissions and management fees for similar investment
                amounts.
              </p>
            </div>
          </motion.section>
        </div>
      </SheetContent>
    </Sheet>
  );
}
