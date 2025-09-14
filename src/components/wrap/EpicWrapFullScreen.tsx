"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Share2,
  Download,
  BarChart3,
  Target,
  Award,
  Trophy,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kpi } from "./Kpi";
import { EpicWrapSlideOverProps } from "@/lib/wrap/types";
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

// Full-screen version of the Wrap details, reusing the content/structure from the slide-over
// and adding fancier entrance/exit animations and a cinematic backdrop.
export function EpicWrapFullScreen({
  wrap,
  isOpen,
  onClose,
  onShare,
  onDownload,
}: EpicWrapSlideOverProps) {
  const { periodLabel, userFirstName, kpis, timeline, highlights } = wrap;

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

  const values = timeline.map((p) => p.portfolioValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const padding = (maxValue - minValue) * 0.1;
  const yDomain = [Math.max(0, minValue - padding), maxValue + padding];

  const isPositiveTrend =
    timeline[timeline.length - 1].portfolioValue > timeline[0].portfolioValue;

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);

  const formatPercent = (value: number) =>
    new Intl.NumberFormat("en-US", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value / 100);

  const CustomTooltip = ({ active, payload }: any) => {
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

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Cinematic gradient backdrop with subtle grid */}
          <div className="absolute inset-0 bg-gradient-to-br from-neo-dark via-[#0B1220] to-[#0E1B2A]" />
          <div className="absolute inset-0 backdrop-blur-[2px]" />
          <div className="absolute inset-0 opacity-[0.07] [background-image:radial-gradient(circle_at_1px_1px,#8b5cf6_1px,transparent_1px)] [background-size:24px_24px]" />

          {/* Content container */}
          <motion.div
            role="dialog"
            aria-modal="true"
            className="relative h-full w-full"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Top bar */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/30 backdrop-blur-xl">
              <div className="flex-1" />
              <div className="text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-white tracking-wide">
                  Your 2025 Wrap ✨
                </h1>
              </div>
              <div className="flex gap-2 flex-1 justify-end">
                {onShare && (
                  <Button
                    variant="outline"
                    onClick={onShare}
                    className="bg-white/5 text-white border-white/20 hover:bg-white/10"
                  >
                    <Share2 className="w-4 h-4 mr-2" /> Copy Link
                  </Button>
                )}
                {onDownload && (
                  <Button
                    variant="outline"
                    onClick={onDownload}
                    className="bg-white/5 text-white border-white/20 hover:bg-white/10"
                  >
                    <Download className="w-4 h-4 mr-2" /> Download
                  </Button>
                )}
                <Button
                  onClick={onClose}
                  variant="ghost"
                  className="text-white hover:text-white/80"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Scrolling content */}
            <div className="h-[calc(100vh-64px)] overflow-y-auto px-6 py-6">
              {/* Your Summary Statistics */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">
                    Your Summary
                  </h2>
                </div>

                {/* Top highlighted roboadvisor return */}
                <div className="bg-gradient-to-br from-green-900/30 to-green-800/30 rounded-xl p-6 mb-6 border border-green-700/50 text-center">
                  <div className="flex items-center justify-center space-x-4 mb-2">
                    <div className="text-4xl font-bold text-green-400">
                      $1,870
                    </div>
                    <div className="text-2xl font-semibold text-green-300">
                      12.4%
                    </div>
                  </div>
                  <div className="text-lg text-green-400">
                    Total return from roboadvisor
                  </div>
                </div>

                {/* Grid of other statistics */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="neo-glass p-4 rounded-xl">
                    <div className="text-sm text-white/70 mb-1">
                      Amount Invested
                    </div>
                    <div className="text-2xl font-bold text-white">$12,450</div>
                  </div>

                  <div className="neo-glass p-4 rounded-xl">
                    <div className="text-sm text-white/70 mb-1">
                      Total Saved
                    </div>
                    <div className="text-2xl font-bold text-white">$3,200</div>
                  </div>

                  <div className="neo-glass p-4 rounded-xl">
                    <div className="text-sm text-white/70 mb-1">
                      Saving Streak
                    </div>
                    <div className="text-2xl font-bold text-white">
                      18 weeks
                    </div>
                  </div>

                  <div className="neo-glass p-4 rounded-xl">
                    <div className="text-sm text-white/70 mb-1">
                      Fees Avoided
                    </div>
                    <div className="text-2xl font-bold text-white">$146</div>
                    <div className="text-xs text-white/50">
                      Estimated brokerage fees saved
                    </div>
                  </div>

                  <div className="neo-glass p-4 rounded-xl">
                    <div className="text-sm text-white/70 mb-1">
                      Auto-Invest Success Rate
                    </div>
                    <div className="text-2xl font-bold text-white">92%</div>
                  </div>

                  <div className="neo-glass p-4 rounded-xl">
                    <div className="text-sm text-white/70 mb-1">
                      Diversification Score
                    </div>
                    <div className="text-2xl font-bold text-white">78/100</div>
                    <div className="text-xs text-white/50">
                      Portfolio balance across asset classes
                    </div>
                  </div>
                </div>
              </motion.section>

              {/* Performance Overview */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center space-x-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  <h2 className="text-xl font-semibold text-white">
                    Performance Overview
                  </h2>
                </div>
                <div className="neo-glass p-4 rounded-xl">
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
                              stopColor={
                                isPositiveTrend ? "#22c55e" : "#ef4444"
                              }
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="95%"
                              stopColor={
                                isPositiveTrend ? "#22c55e" : "#ef4444"
                              }
                              stopOpacity={0.06}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          className="opacity-20"
                        />
                        <XAxis
                          dataKey="date"
                          type="number"
                          scale="time"
                          domain={["dataMin", "dataMax"]}
                          tickFormatter={(v) => format(new Date(v), "MMM")}
                          className="text-xs fill-white"
                        />
                        <YAxis
                          domain={yDomain}
                          tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                          className="text-xs fill-white"
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="portfolioValue"
                          stroke={isPositiveTrend ? "#22c55e" : "#ef4444"}
                          strokeWidth={3}
                          fill="url(#portfolioGradientLarge)"
                          dot={false}
                          activeDot={{
                            r: 4,
                            fill: isPositiveTrend ? "#22c55e" : "#ef4444",
                            stroke: "#fff",
                            strokeWidth: 2,
                          }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.section>

              {/* KPIs */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="mt-8"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Target className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-semibold text-white">
                    Key Metrics
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Kpi
                    label="Total Invested"
                    value={kpis.totalInvested}
                    hint="Sum of all deposits made during the period"
                    testId="fs-kpi-total-invested"
                  />
                  <Kpi
                    label="Total Saved"
                    value={kpis.totalSaved}
                    hint="Cash saved vs. baseline spending"
                    testId="fs-kpi-total-saved"
                  />
                  <Kpi
                    label="Roboadvisor Return"
                    value={`${formatCurrency(kpis.roboAdvisorReturnAbs)} (${formatPercent(kpis.roboAdvisorReturnPct)})`}
                    trend={kpis.roboAdvisorReturnAbs > 0 ? "up" : "down"}
                    hint="Absolute and percentage return"
                    testId="fs-kpi-return"
                  />
                  <Kpi
                    label="Fees Avoided"
                    value={kpis.feesAvoided}
                    hint="Estimated brokerage and bank fees saved"
                    testId="fs-kpi-fees"
                  />
                  <Kpi
                    label="Best Month"
                    value={`${kpis.bestMonth.month} (${formatPercent(kpis.bestMonth.returnPct)})`}
                    hint={`${formatCurrency(kpis.bestMonth.netDeposits)} in net deposits`}
                    testId="fs-kpi-best-month"
                  />
                  <Kpi
                    label="Top Asset"
                    value={`${kpis.topAsset.name}`}
                    hint={`${formatPercent(kpis.topAsset.returnPct)} return, ${formatCurrency(kpis.topAsset.contributionAbs)} contributed`}
                    testId="fs-kpi-top-asset"
                  />
                  <Kpi
                    label="Risk Level"
                    value={kpis.riskLevel}
                    hint="Your investment risk profile"
                    testId="fs-kpi-risk"
                  />
                  <Kpi
                    label="Saving Streak"
                    value={`${kpis.savingStreakWeeks} weeks`}
                    trend="up"
                    hint="Consecutive weeks with deposits"
                    testId="fs-kpi-streak"
                  />
                </div>
              </motion.section>

              {/* Highlights */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mt-8"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="w-5 h-5 text-yellow-400" />
                  <h2 className="text-xl font-semibold text-white">
                    Highlights
                  </h2>
                </div>
                <div className="space-y-3">
                  {highlights.map((highlight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
                      className="flex items-start space-x-3 p-3 bg-green-400/10 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/90 leading-relaxed">
                        {highlight}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>

              {/* Methodology */}
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="mt-10 border-t border-white/10 pt-6"
              >
                <h2 className="text-lg font-semibold text-white mb-3">
                  Methodology
                </h2>
                <div className="text-sm text-white/70 space-y-2">
                  <p>
                    <strong>Returns:</strong> Time-weighted returns calculated
                    using daily portfolio valuations, net of fees and adjusted
                    for deposits and withdrawals.
                  </p>
                  <p>
                    <strong>Diversification Score:</strong> Measures portfolio
                    balance across asset classes, sectors, and geographic
                    regions on a scale of 0-100.
                  </p>
                  <p>
                    <strong>Fees Avoided:</strong> Estimated based on typical
                    brokerage commissions and management fees for similar
                    investment amounts.
                  </p>
                </div>
              </motion.section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
