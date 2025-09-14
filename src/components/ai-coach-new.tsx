"use client";

import { useState, useEffect, useCallback } from "react";
import { useAppStore } from '@/lib/store';
import { Bot, Sparkles, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AiCoachProps {
  className?: string;
}

interface ChartData {
  currentAmount: number;
  targetAmount: number;
  currentMonthlyContribution: number;
  suggestedSaving: number;
  goalName: string;
}

// Function to format suggestion text with consistent green styling
const formatSuggestionText = (text: string) => {
  // Split text while preserving dollar amounts, percentages, and other numbers
  const parts = text.split(
    /(\$\d+(?:,\d{3})*(?:\.\d{2})?|\d+%|\d+(?:,\d{3})*)/g
  );

  return parts.map((part, index) => {
    // Check if part is a dollar amount, percentage, or number
    if (
      /^\$\d+(?:,\d{3})*(?:\.\d{2})?$/.test(part) ||
      /^\d+%$/.test(part) ||
      /^\d+(?:,\d{3})*$/.test(part)
    ) {
      return (
        <span key={index} className="text-purple-300 font-semibold">
          {part}
        </span>
      );
    }
    return part;
  });
};

export function AiCoach({ className = "" }: AiCoachProps) {
  const [suggestion, setSuggestion] = useState<string>("");
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [hasSuggestion, setHasSuggestion] = useState(false);
  const [error, setError] = useState<string>("");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [showConsent, setShowConsent] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(false);
  const [showInitialGreeting, setShowInitialGreeting] = useState(false);
  const [isThinking, setIsThinking] = useState(false);

  // DEBUG: To test first-time behavior, run this in browser console:
  // localStorage.removeItem('aiCoachVisited'); localStorage.removeItem('aiCoachConsent'); location.reload();

  const userGoals = useAppStore(s => s.userGoals);

  const fetchInsight = useCallback(async () => {
    if (isLoading) return;
    if (hasConsent !== true) return;

    setIsLoading(true);
    setIsThinking(true);
    setError("");

    try {
      const active = userGoals.filter(g => g.status === 'active' || g.status === 'planning');
      let response: Response;
      if (active.length > 0) {
        const goalsPayload = active.map(g => ({
          name: g.goal.title,
          currentAmount: g.currentAmount,
          targetAmount: g.targetAmount,
          monthlyContribution: g.monthlyContribution
        }));
        response = await fetch('/api/insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goals: goalsPayload })
        });
      } else {
        response = await fetch('/api/insight');
      }
      const data = await response.json();

      if (response.ok) {
        // Add a slight delay for dramatic effect
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setSuggestion(data.suggestion);
        setChartData(data.chartData);
        setHasSuggestion(true);
        setIsThinking(false);

        // Auto-show suggestion after loading
        setTimeout(() => setShowSuggestion(true), 500);
      } else {
        setError(data.error || "Failed to get insight");
        setIsThinking(false);
      }
    } catch {
      setError("Network error - please try again");
      setIsThinking(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, hasConsent, userGoals]);

  const handleIconClick = () => {
    // If showing initial greeting, let user interact with it
    if (showInitialGreeting) {
      return;
    }

    // For returning users or after initial setup
    if (hasConsent === null) {
      setShowSuggestion(true);
      setShowConsent(true);
      return;
    }
    if (hasConsent === false) {
      setShowSuggestion(true);
      setShowConsent(true);
      return;
    }
    if (!showSuggestion && !suggestion && !isLoading) {
      fetchInsight();
    } else if (suggestion) {
      setShowSuggestion(!showSuggestion);
    }
  };

  const closeSuggestion = () => {
    setShowSuggestion(false);
    setShowInitialGreeting(false);
    setShowConsent(false);
  };

  // Initialize with first insight fetch on component mount
  // Load consent preference and check for first visit
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    try {
      const stored = localStorage.getItem("aiCoachConsent");
      const hasVisited = localStorage.getItem("aiCoachVisited");
      
      if (stored === "granted") setHasConsent(true);
      else if (stored === "declined") setHasConsent(false);
      
      // If user has never seen the AI coach, show initial greeting
      if (!hasVisited) {
        setIsFirstVisit(true);
        localStorage.setItem("aiCoachVisited", "true");
        // Show greeting immediately on first visit
        timeoutId = setTimeout(() => {
          setShowInitialGreeting(true);
          setShowSuggestion(true);
        }, 1000); // Small delay for better UX
      }
    } catch {
      /* ignore */
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  // Show initial greeting only on first visit
  useEffect(() => {
    if (isFirstVisit && !hasInitialized) {
      setHasInitialized(true);
    }
  }, [isFirstVisit, hasInitialized]);

  // Original orchestration for returning users
  useEffect(() => {
    if (!isFirstVisit && !hasInitialized) {
      // For returning users, don't auto-open - only show if they click
      setHasInitialized(true);
    }
  }, [isFirstVisit, hasInitialized]);

  // Fetch after user grants consent while consent screen is open
  useEffect(() => {
    if (hasConsent === true && showConsent) {
      setShowConsent(false);
      fetchInsight();
    }
  }, [hasConsent, showConsent, fetchInsight]);

  const grantConsent = () => {
    setHasConsent(true);
    try {
      localStorage.setItem("aiCoachConsent", "granted");
    } catch {
      /* ignore */
    }
    setShowInitialGreeting(false);
    setShowConsent(false);
    if (!suggestion) fetchInsight();
  };
  
  const declineConsent = () => {
    setHasConsent(false);
    try {
      localStorage.setItem("aiCoachConsent", "declined");
    } catch {
      /* ignore */
    }
    setShowInitialGreeting(false);
    setShowConsent(false);
    setShowSuggestion(false);
  };

  return (
    <>
      {/* Floating AI Coach Icon with enhanced animations */}
      <motion.div
        className={`fixed bottom-4 right-4 z-50 ${className}`}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
      >
        <motion.div
          className="relative"
          animate={
            isThinking
              ? {
                  y: [0, -8, 0],
                }
              : {}
          }
          transition={{
            duration: 1.5,
            repeat: isThinking ? Infinity : 0,
            repeatType: "loop",
            ease: "easeInOut",
          }}
        >
          <motion.button
            onClick={handleIconClick}
            className={`
              relative w-16 h-16 rounded-full shadow-2xl transition-all duration-500
              flex items-center justify-center overflow-hidden
              ${
                hasSuggestion
                  ? "bg-gradient-to-br from-purple-500 via-indigo-500 to-blue-600"
                  : isThinking
                    ? "bg-gradient-to-br from-purple-400 via-indigo-500 to-blue-500"
                    : "bg-gradient-to-br from-gray-500 to-gray-600"
              }
            `}
            disabled={isLoading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={
              hasSuggestion
                ? {
                    boxShadow: [
                      "0 0 0 0 rgba(139, 92, 246, 0.7)",
                      "0 0 0 15px rgba(139, 92, 246, 0)",
                      "0 0 0 0 rgba(139, 92, 246, 0)",
                    ],
                  }
                : {}
            }
            transition={{
              duration: 2,
              repeat: hasSuggestion ? Infinity : 0,
              repeatType: "loop",
            }}
          >
            {/* Background sparkles */}
            {hasSuggestion && (
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                    "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                    "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                  ],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            <motion.div
              animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={{
                duration: 2,
                repeat: isLoading ? Infinity : 0,
                ease: "linear",
              }}
            >
              {isThinking ? (
                <Sparkles className="w-7 h-7 text-white" />
              ) : (
                <Bot className="w-7 h-7 text-white" />
              )}
            </motion.div>

            {hasSuggestion && !showSuggestion && (
              <>
                <motion.div
                  className="absolute -top-1 -right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Zap className="w-3 h-3 text-white" />
                </motion.div>
                {/* Floating sparkles around the icon */}
                <motion.div
                  className="absolute -top-2 -left-2"
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                >
                  <Sparkles className="w-4 h-4 text-purple-400" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -right-2"
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0, 1, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <Sparkles className="w-3 h-3 text-blue-400" />
                </motion.div>
              </>
            )}
          </motion.button>

          {/* Thinking bubbles */}
          {isThinking && (
            <motion.div
              className="absolute -top-8 left-1/2 transform -translate-x-1/2"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
            >
              <div className="flex space-x-1">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 bg-white rounded-full"
                    animate={{
                      y: [0, -8, 0],
                      opacity: [0.4, 1, 0.4],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Comprehensive Financial Insight Popup */}
      <AnimatePresence>
        {showSuggestion && (
          <motion.div
            className="fixed bottom-24 right-24 left-4 sm:left-auto sm:right-24 z-40 w-full sm:max-w-sm max-h-[70vh] overflow-y-auto"
            initial={{ opacity: 0, x: 100, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div
              className="bg-white border border-gray-200 p-4 relative overflow-hidden rounded-xl shadow-lg"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Gradient background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/3 via-indigo-800/3 to-blue-900/3"></div>

              {/* Close button removed per spec (user can dismiss via Got it! or toggling icon) */}

              {/* Header */}
              <div className="relative z-10 mb-3">
                <h3 className="text-purple-900 font-semibold text-base mb-1">
                  AI Financial Insight
                </h3>
                <p className="text-indigo-700 text-xs">Personalized for you</p>
              </div>

              {/* Content */}
              <div className="relative z-10">
                {showInitialGreeting ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-2"
                  >
                    <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        Hi! 👋 I&apos;m your AI financial coach. Would you like me to provide personalized insights to help with your goals?
                      </p>
                    </div>
                    <div className="flex gap-2 pt-3">
                      <button
                        onClick={grantConsent}
                        className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-xs rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 flex items-center justify-center gap-1 shadow-md"
                      >
                        <Sparkles className="w-3 h-3" /> Yes, help me!
                      </button>
                      <button
                        onClick={declineConsent}
                        className="px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                      >
                        No thanks
                      </button>
                    </div>
                  </motion.div>
                ) : showConsent ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-1"
                  >
                    <div className="bg-gray-50 rounded-lg p-3 border border-purple-200 space-y-3">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        Enable AI generated financial insights? They are
                        educational and not personalized advice.
                      </p>
                      <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                        <li>May be imperfect.</li>
                        <li>No sensitive data stored.</li>
                        <li>Not professional advice.</li>
                      </ul>
                      <div className="flex gap-2 pt-1">
                        <button
                          onClick={grantConsent}
                          className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-xs rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 flex items-center justify-center gap-1 shadow-md"
                        >
                          <Sparkles className="w-3 h-3" /> Enable
                        </button>
                        <button
                          onClick={declineConsent}
                          className="px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                        >
                          Not now
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ) : isLoading ? (
                  <div className="flex items-center space-x-2 py-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-purple-400 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.7, 1, 0.7],
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">
                      Analyzing your spending patterns...
                    </span>
                  </div>
                ) : error ? (
                  <div className="py-2">
                    <p className="text-red-600 text-sm mb-2">{error}</p>
                    <button
                      onClick={fetchInsight}
                      className="px-3 py-1 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-sm rounded-lg hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 shadow-md"
                    >
                      Try Again
                    </button>
                  </div>
                ) : suggestion ? (
                  <div className="space-y-4">
                    {/* Smart Insight Section */}
                    <motion.div
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-white text-sm">💡</span>
                        </div>
                        <div>
                          <h4 className="text-gray-900 font-medium text-base mb-2">
                            Smart Financial Insight
                          </h4>
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {formatSuggestionText(suggestion)}
                          </p>
                        </div>
                      </div>
                    </motion.div>

                    {/* Progress Metrics */}
                    {chartData && (
                      <motion.div
                        className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                      >
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="text-center">
                            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                              Current
                            </p>
                            <p className="text-purple-700 text-lg font-bold">
                              {Math.round(
                                (chartData.currentAmount /
                                  chartData.targetAmount) *
                                  100
                              )}
                              %
                            </p>
                            <p className="text-gray-600 text-xs">
                              <span className="text-purple-700 font-semibold">
                                ${chartData.currentAmount.toLocaleString()}
                              </span>{" "}
                              saved
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">
                              Monthly
                            </p>
                            <p className="text-purple-700 text-lg font-bold">
                              ${chartData.currentMonthlyContribution}
                            </p>
                            <p className="text-gray-600 text-xs">
                              <span className="text-purple-700 font-semibold">
                                +${chartData.suggestedSaving}
                              </span>{" "}
                              suggested
                            </p>
                          </div>
                        </div>

                        <div className="border-t border-gray-200 pt-3">
                          <h5 className="text-gray-900 font-medium text-sm mb-2">
                            {chartData.goalName}
                          </h5>
                          <p className="text-gray-600 text-xs mb-2">
                            <span className="text-purple-700 font-semibold">
                              ${chartData.currentAmount.toLocaleString()}
                            </span>{" "}
                            of{" "}
                            <span className="text-gray-800 font-semibold">
                              ${chartData.targetAmount.toLocaleString()}
                            </span>
                          </p>

                          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
                            <span>
                              {Math.round(
                                (chartData.currentAmount /
                                  chartData.targetAmount) *
                                  100
                              )}
                              % complete
                            </span>
                          </div>

                          {/* Timeline Comparison */}
                          <div className="bg-white rounded-lg p-3 mt-3 border border-gray-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="text-center">
                                <p className="text-gray-500 text-xs">
                                  Current pace
                                </p>
                                <p className="text-gray-800 text-sm font-semibold">
                                  {Math.ceil(
                                    (chartData.targetAmount -
                                      chartData.currentAmount) /
                                      chartData.currentMonthlyContribution
                                  )}{" "}
                                  months
                                </p>
                              </div>
                              <div className="text-gray-400">→</div>
                              <div className="text-center">
                                <p className="text-gray-500 text-xs">
                                  With +${chartData.suggestedSaving}/month
                                </p>
                                <p className="text-purple-600 text-sm font-semibold">
                                  {Math.ceil(
                                    (chartData.targetAmount -
                                      chartData.currentAmount) /
                                      (chartData.currentMonthlyContribution +
                                        chartData.suggestedSaving)
                                  )}{" "}
                                  months
                                </p>
                              </div>
                            </div>
                            <div className="text-center">
                              <p className="text-purple-600 text-xs font-medium">
                                Save{" "}
                                {Math.ceil(
                                  (chartData.targetAmount -
                                    chartData.currentAmount) /
                                    chartData.currentMonthlyContribution
                                ) -
                                  Math.ceil(
                                    (chartData.targetAmount -
                                      chartData.currentAmount) /
                                      (chartData.currentMonthlyContribution +
                                        chartData.suggestedSaving)
                                  )}{" "}
                                months
                              </p>
                              <p className="text-gray-500 text-xs">
                                Add just ${chartData.suggestedSaving}/month
                              </p>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-2">
                      <button
                        onClick={fetchInsight}
                        className="text-sm text-purple-600 hover:text-purple-700 transition-colors flex items-center gap-1"
                        disabled={isLoading}
                      >
                        <Sparkles className="w-4 h-4" />
                        New Insight
                      </button>
                      <button
                        onClick={closeSuggestion}
                        className="px-4 py-2 bg-gray-100 text-gray-700 text-sm rounded-lg hover:bg-gray-200 transition-colors border border-gray-200"
                      >
                        Got it! 👍
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* Decorative elements */}
              <motion.div
                className="absolute -top-1 -right-1 w-6 h-6"
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="w-6 h-6 text-purple-400 opacity-60" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
