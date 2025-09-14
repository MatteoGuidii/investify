"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  BarChart3,
  Target,
  Award,
  ArrowLeft,
  Share2,
  Download,
  Volume2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Kpi } from "@/components/wrap/Kpi";
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
import type { EpicWrap } from "@/lib/wrap/types";

export default function WrapPage() {
  const router = useRouter();
  const params = useParams<{ period: string }>();
  const period = params?.period?.toString?.() || "2025";
  const [wrap, setWrap] = useState<EpicWrap | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Epic sound using Web Audio API (no external asset required)
  const [soundOn, setSoundOn] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const nodesRef = useRef<{
    osc: OscillatorNode;
    gain: GainNode;
    filter: BiquadFilterNode;
  } | null>(null);

  const startEpicSound = async () => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") await ctx.resume();

      // Create a soft evolving pad
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = "sine";
      osc.frequency.value = 110; // A2 base tone

      filter.type = "lowpass";
      filter.frequency.value = 800;

      gain.gain.value = 0.0; // start silent then fade in

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();

      // Slow modulation for epic vibe
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.type = "sine";
      lfo.frequency.value = 0.07; // very slow
      lfoGain.gain.value = 20; // modulate filter cutoff
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      nodesRef.current = { osc, gain, filter } as any; // store primary nodes

      // Fade in
      const now = ctx.currentTime;
      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.12, now + 3.0);

      setSoundOn(true);
    } catch (e) {
      console.warn("Failed to start epic sound", e);
    }
  };

  const stopEpicSound = async () => {
    try {
      const ctx = audioCtxRef.current;
      const nodes = nodesRef.current;
      if (ctx && nodes) {
        const now = ctx.currentTime;
        nodes.gain.gain.cancelScheduledValues(now);
        nodes.gain.gain.linearRampToValueAtTime(0.0, now + 1.5);
        setTimeout(() => {
          try {
            nodes.osc.stop();
          } catch {}
          try {
            ctx.close();
          } catch {}
          audioCtxRef.current = null;
          nodesRef.current = null;
        }, 1600);
      }
    } catch (e) {
      console.warn("Failed to stop epic sound", e);
    } finally {
      setSoundOn(false);
    }
  };

  useEffect(() => {
    return () => {
      // cleanup sound on unmount
      stopEpicSound();
    };
  }, []);

  // Load wrap data on mount
  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/wrap");
        if (!res.ok) throw new Error("Failed to load wrap");
        const data: EpicWrap = await res.json();
        setWrap(data);
      } catch (e: any) {
        setError(e?.message || "Failed to load wrap");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [period]);

  // Attempt to auto-start epic sound on mount (may be blocked by browser policies)
  useEffect(() => {
    // small delay to ensure page is painted
    const t = setTimeout(() => {
      startEpicSound();
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartData = useMemo(() => {
    if (!wrap) return [] as any[];
    return wrap.timeline.map((point) => ({
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
  }, [wrap]);

  const yDomain = useMemo(() => {
    if (!wrap) return [0, 0] as [number, number];
    const values = wrap.timeline.map((p) => p.portfolioValue);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const padding = (maxValue - minValue) * 0.1;
    return [Math.max(0, minValue - padding), maxValue + padding] as [
      number,
      number,
    ];
  }, [wrap]);

  const isPositiveTrend = useMemo(() => {
    if (!wrap) return true;
    return (
      wrap.timeline[wrap.timeline.length - 1].portfolioValue >
      wrap.timeline[0].portfolioValue
    );
  }, [wrap]);

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

  if (loading) {
    return (
      <div className="min-h-screen bg-neo-dark flex items-center justify-center">
        <div className="neo-card p-6">
          {" "}
          <div className="text-white">Loading wrap...</div>{" "}
        </div>
      </div>
    );
  }

  if (error || !wrap) {
    return (
      <div className="min-h-screen bg-neo-dark flex items-center justify-center">
        <div className="neo-card p-6 space-y-3">
          <div className="text-red-300">Failed to load wrap</div>
          <Button onClick={() => router.back()} className="neo-button">
            Back
          </Button>
        </div>
      </div>
    );
  }

  const { periodLabel, userFirstName, kpis } = wrap;
  // Remove fee avoidance / diversification / auto-invest highlights per latest requirements
  const filteredHighlights = wrap.highlights.filter(
    (h) => !/fee|diversification|avoided/i.test(h)
  );

  return (
    <div className="min-h-screen bg-neo-dark relative overflow-hidden">
      {/* Cinematic background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[28rem] h-[28rem] bg-neo-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-[28rem] h-[28rem] bg-neo-accent/10 rounded-full blur-3xl animate-pulse delay-700" />
        <div className="absolute inset-0 opacity-[0.06] [background-image:radial-gradient(circle_at_1px_1px,#9ca3af_1px,transparent_1px)] [background-size:22px_22px]" />
      </div>

      <div className="relative z-10 px-4 md:px-8 py-6">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-white hover:text-white/80"
            >
              <ArrowLeft className="w-4 h-4 mr-2" /> Back
            </Button>
            <div>
              <h1 className="text-2xl font-semibold text-white">
                {periodLabel}
              </h1>
              <p className="text-white/70">Nice work, {userFirstName}.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="bg-white/5 text-white border-white/20 hover:bg-white/10"
            >
              <Share2 className="w-4 h-4 mr-2" /> Copy Link
            </Button>
            {soundOn ? (
              <Button
                variant="ghost"
                onClick={stopEpicSound}
                className="text-white"
              >
                <VolumeX className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={startEpicSound}
                className="text-white"
              >
                <Volume2 className="w-5 h-5" />
              </Button>
            )}
          </div>
        </div>

        {/* Performance Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mt-4"
        >
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-xl font-semibold text-white">
              Performance Overview
            </h2>
          </div>
          <div className="neo-glass p-4 rounded-xl">
            <div className="h-72 w-full">
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
                        stopColor={isPositiveTrend ? "#22c55e" : "#ef4444"}
                        stopOpacity={0.35}
                      />
                      <stop
                        offset="95%"
                        stopColor={isPositiveTrend ? "#22c55e" : "#ef4444"}
                        stopOpacity={0.06}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-20" />
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
                  <Tooltip
                    content={({ active, payload }: any) => {
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
                    }}
                  />
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

        {/* KPI grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.05 }}
          className="mt-8"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Target className="w-5 h-5 text-green-400" />
            <h2 className="text-xl font-semibold text-white">Key Metrics</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Kpi
              label="Total Invested"
              value={kpis.totalInvested}
              hint="Sum of all deposits made during the period"
              testId="pg-kpi-total-invested"
            />
            <Kpi
              label="Total Saved"
              value={kpis.totalSaved}
              hint="Cash saved vs. baseline spending"
              testId="pg-kpi-total-saved"
            />
            <Kpi
              label="Roboadvisor Return"
              value={`${formatCurrency(kpis.roboAdvisorReturnAbs)} (${formatPercent(kpis.roboAdvisorReturnPct)})`}
              trend={kpis.roboAdvisorReturnAbs > 0 ? "up" : "down"}
              hint="Absolute and percentage return"
              testId="pg-kpi-return"
            />
            <Kpi
              label="Best Month"
              value={`${kpis.bestMonth.month} (${formatPercent(kpis.bestMonth.returnPct)})`}
              hint={`${formatCurrency(kpis.bestMonth.netDeposits)} in net deposits`}
              testId="pg-kpi-best-month"
            />
            <Kpi
              label="Top Asset"
              value={`${kpis.topAsset.name}`}
              hint={`${formatPercent(kpis.topAsset.returnPct)} return, ${formatCurrency(kpis.topAsset.contributionAbs)} contributed`}
              testId="pg-kpi-top-asset"
            />
            <Kpi
              label="Risk Level"
              value={kpis.riskLevel}
              hint="Your investment risk profile"
              testId="pg-kpi-risk"
            />
            <Kpi
              label="Saving Streak"
              value={`${kpis.savingStreakWeeks} weeks`}
              trend="up"
              hint="Consecutive weeks with deposits"
              testId="pg-kpi-streak"
            />
          </div>
        </motion.section>

        {/* Highlights */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.1 }}
          className="mt-8"
        >
          <div className="flex items-center space-x-2 mb-4">
            <Award className="w-5 h-5 text-yellow-400" />
            <h2 className="text-xl font-semibold text-white">Highlights</h2>
          </div>
          <div className="space-y-3">
            {filteredHighlights.map((highlight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
                className="flex items-start space-x-3 p-3 bg-green-400/10 rounded-lg"
              >
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <p className="text-white/90 leading-relaxed">{highlight}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Methodology section removed per requirements */}
      </div>
    </div>
  );
}
