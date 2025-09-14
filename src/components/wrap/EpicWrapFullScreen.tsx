"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";
import { X, Share2, BarChart3, Target, Award, Trophy } from "lucide-react";
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
}: EpicWrapSlideOverProps) {
  const { periodLabel: _periodLabel, userFirstName: _userFirstName, kpis, timeline } = wrap;

  // Filter out fee-related and diversification highlights
  const filteredHighlights = wrap.highlights.filter(
    (highlight) => !/(fee|avoided|diversification)/i.test(highlight)
  );

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

  // Trend direction not currently displayed in UI; remove if unused.

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

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop layers (more opaque) */}
          <div className="absolute inset-0 bg-[#05070c]/90" />
          <div className="absolute inset-0 bg-gradient-to-br from-green-900/30 via-[#0B1220]/60 to-emerald-900/30" />
          <div className="absolute inset-0 backdrop-blur-md" />
          <div className="absolute inset-0 opacity-[0.08] [background-image:radial-gradient(circle_at_1px_1px,#22c55e_1px,transparent_1px)] [background-size:26px_26px]" />

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
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-green-300 via-emerald-300 to-green-400 drop-shadow-[0_0_10px_rgba(34,197,94,0.25)] mb-6">
                  Investify Wrapped
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
                  <Trophy className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-semibold text-white">
                    Your Wrapped Summary
                  </h2>
                </div>

                {/* Hero: Roboadvisor Return */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-green-500/10 via-emerald-400/5 to-teal-400/10 blur-xl" />
                  <div className="relative rounded-2xl border border-green-500/30 bg-gradient-to-br from-green-900/40 via-green-800/30 to-emerald-900/30 backdrop-blur-sm p-8 flex flex-col items-center text-center shadow-inner">
                    <span className="text-[11px] tracking-wider uppercase text-green-200/70 mb-3">
                      Roboadvisor Performance
                    </span>
                    <div className="flex items-end gap-4 mb-4 flex-wrap justify-center">
                      <span className="text-5xl md:text-6xl font-bold leading-none text-green-300 drop-shadow-sm">
                        {formatCurrency(kpis.roboAdvisorReturnAbs)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-md text-sm font-semibold flex items-center gap-1 ${kpis.roboAdvisorReturnPct >= 0 ? "bg-green-500/15 text-green-300" : "bg-red-500/15 text-red-300"}`}
                      >
                        {formatPercent(kpis.roboAdvisorReturnPct)}
                      </span>
                    </div>
                    <p className="text-sm md:text-base text-green-200/80 max-w-md">
                      Total return generated by automated investing this period.
                    </p>
                  </div>
                </div>

                {/* Grid of other statistics */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="neo-glass p-4 rounded-xl">
                    <div className="text-sm text-white/70 mb-1">
                      Amount Invested
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(kpis.totalInvested)}
                    </div>
                  </div>

                  <div className="neo-glass p-4 rounded-xl">
                    <div className="text-sm text-white/70 mb-1">
                      Total Saved
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {formatCurrency(kpis.totalSaved)}
                    </div>
                  </div>

                  <div className="neo-glass p-4 rounded-xl">
                    <div className="text-sm text-white/70 mb-1">
                      Saving Streak
                    </div>
                    <div className="text-2xl font-bold text-white">
                      {kpis.savingStreakWeeks} weeks
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
                  <BarChart3 className="w-5 h-5 text-green-400" />
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
                              stopColor="#22c55e"
                              stopOpacity={0.35}
                            />
                            <stop
                              offset="95%"
                              stopColor="#22c55e"
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
                          stroke="#22c55e"
                          strokeWidth={3}
                          fill="url(#portfolioGradientLarge)"
                          dot={false}
                          activeDot={{
                            r: 4,
                            fill: "#22c55e",
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
                className="mt-8 mb-8"
              >
                <div className="flex items-center space-x-2 mb-4">
                  <Award className="w-5 h-5 text-green-400" />
                  <h2 className="text-xl font-semibold text-white">
                    Highlights
                  </h2>
                </div>
                <div className="space-y-3">
                  {filteredHighlights.map((highlight, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
                      className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-white/90 leading-relaxed">
                        {highlight}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.section>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
