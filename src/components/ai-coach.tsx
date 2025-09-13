'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bot, X, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ParticleEffect } from './particle-effect';
import { SavingsProjection } from './savings-projection';

interface ChartData {
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  currentMonthlyContribution: number;
  suggestedSaving: number;
}

interface AiCoachProps {
  className?: string;
}

export function AiCoach({ className = '' }: AiCoachProps) {
  const [suggestion, setSuggestion] = useState<string>('');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [hasSuggestion, setHasSuggestion] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showParticles, setShowParticles] = useState(false);
  const [position] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  // Removed blinking attention effect state

  const fetchInsight = useCallback(async (forceRefresh = false) => {
    if (isLoading) return;
    
    setIsLoading(true);
    setIsThinking(true);
    setError('');
    
    try {
      const url = forceRefresh ? '/api/insight?refresh=true' : '/api/insight';
      const response = await fetch(url);
      const data = await response.json();
      
      if (response.ok) {
        // Add a slight delay for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSuggestion(data.suggestion);
        setChartData(data.chartData);
        setHasSuggestion(true);
        setIsThinking(false);
        
        // Don't auto-show suggestion - user needs to click
        // setTimeout(() => setShowSuggestion(true), 500);
      } else {
        setError(data.error || 'Failed to get insight');
        setIsThinking(false);
      }
    } catch {
      setError('Network error - please try again');
      setIsThinking(false);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleIconClick = () => {
    if (!showSuggestion && !suggestion && !isLoading) {
      fetchInsight();
    } else if (suggestion && !showSuggestion) {
      // Show suggestion and trigger particle effect when clicked
  setShowSuggestion(true);
  setShowParticles(true);
    } else if (suggestion && showSuggestion) {
      // Toggle visibility if already shown
      setShowSuggestion(!showSuggestion);
    }
  };

  const handleNewInsight = () => {
    fetchInsight(true); // Force refresh for new insights
  };

  const handleRetryInsight = () => {
    fetchInsight(false); // Regular fetch for retry
  };

  const closeSuggestion = () => {
    setShowSuggestion(false);
  };

  // Initialize with welcome message, then fetch insight but don't auto-show
  useEffect(() => {
    if (!hasInitialized) {
      // Show welcome message first
      setTimeout(() => {
        setShowWelcome(true);
        // Hide welcome and start fetching insight
        setTimeout(() => {
          setShowWelcome(false);
          fetchInsight();
          setHasInitialized(true);
        }, 3000); // Show welcome for 3 seconds
      }, 1500);
    }
  }, [fetchInsight, hasInitialized]);

  return (
    <>
      {/* Particle Effect */}
      <ParticleEffect 
        isActive={showParticles} 
        onComplete={() => setShowParticles(false)} 
      />
      
      {/* Floating AI Coach Icon with enhanced animations and dragging */}
      <motion.div
        className={`fixed bottom-6 right-6 z-50 ${className}`}
        style={{ x: position.x, y: position.y }}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
        drag
        dragConstraints={{ left: -400, right: 0, top: -600, bottom: 0 }}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        whileDrag={{ scale: 1.1, cursor: "grabbing" }}
      >
        <motion.div
          className="relative"
          animate={isThinking ? { y: [0, -8, 0] } : {}}
          transition={{
            duration: isThinking ? 1.5 : 0,
            repeat: isThinking ? Infinity : 0,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        >
          <motion.button
            onClick={handleIconClick}
            className={`
              relative w-16 h-16 rounded-full shadow-2xl transition-all duration-500
              flex items-center justify-center overflow-hidden cursor-pointer
              ${hasSuggestion 
                ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500' 
                : isThinking
                ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500'
                : 'bg-gradient-to-br from-gray-500 to-gray-600'
              }
            `}
            disabled={isLoading}
            whileHover={{ scale: isDragging ? 1.1 : 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
          >
            {/* Background sparkles */}
            {hasSuggestion && (
              <motion.div
                className="absolute inset-0"
                animate={{
                  background: [
                    "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)",
                    "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                    "radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)"
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            )}

            <motion.div
              animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
              transition={{ duration: 2, repeat: isLoading ? Infinity : 0, ease: "linear" }}
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
                  className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center"
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
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0 }}
                >
                  <Sparkles className="w-4 h-4 text-yellow-400" />
                </motion.div>
                <motion.div
                  className="absolute -bottom-2 -right-2"
                  animate={{
                    y: [0, -8, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                >
                  <Sparkles className="w-3 h-3 text-pink-400" />
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
                      opacity: [0.4, 1, 0.4]
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.2
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Compact Inline Suggestion Popup - responsive positioning */}
      <AnimatePresence>
        {(showSuggestion || showWelcome) && (
          <motion.div
            className="fixed z-40 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 sm:max-w-sm"
            style={{
              // Responsive positioning that adapts to screen size
              bottom: Math.max(24 + 80 - position.y, 100) // Always above the icon with safe margin
            }}
            initial={{ opacity: 0, x: 100, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 relative overflow-hidden max-h-[70vh] overflow-y-auto"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Gradient background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60"></div>
              
              {/* Close button - only show when not welcome message */}
              {!showWelcome && (
                <button
                  onClick={closeSuggestion}
                  className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Header */}
              <div className="flex items-center gap-2 mb-3 relative z-10">
                <motion.div
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center"
                  animate={{ rotate: [0, 360] }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                >
                  <TrendingUp className="w-4 h-4 text-white" />
                </motion.div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {showWelcome ? 'AI Financial Coach' : 'AI Financial Insight'}
                  </h3>
                  <p className="text-xs text-gray-600">
                    {showWelcome ? 'Just arrived!' : 'Personalized for you'}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="relative z-10">
                {showWelcome ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-2"
                  >
                    <div className="bg-white bg-opacity-80 rounded-xl p-3 border border-gray-100">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        Hi there! 👋 I&apos;m your AI financial coach. Give me a moment to analyze your spending patterns...
                      </p>
                    </div>
                    <div className="flex justify-center mt-2">
                      <div className="flex space-x-1">
                        {[0, 1, 2].map((i) => (
                          <motion.div
                            key={i}
                            className="w-2 h-2 bg-blue-500 rounded-full"
                            animate={{
                              scale: [1, 1.2, 1],
                              opacity: [0.7, 1, 0.7]
                            }}
                            transition={{
                              duration: 0.8,
                              repeat: Infinity,
                              delay: i * 0.2
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : isLoading ? (
                  <div className="flex items-center space-x-2 py-2">
                    <div className="flex space-x-1">
                      {[0, 1, 2].map((i) => (
                        <motion.div
                          key={i}
                          className="w-2 h-2 bg-blue-500 rounded-full"
                          animate={{
                            scale: [1, 1.5, 1],
                            opacity: [0.7, 1, 0.7]
                          }}
                          transition={{
                            duration: 1,
                            repeat: Infinity,
                            delay: i * 0.2
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-gray-600">Analyzing your spending patterns...</span>
                  </div>
                ) : error ? (
                  <div className="py-2">
                    <p className="text-red-600 text-sm mb-2">{error}</p>
                    <button
                      onClick={handleRetryInsight}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : suggestion ? (
                  <div>
                    <motion.div
                      className="space-y-4"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {/* Enhanced Insight Display */}
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                            <TrendingUp className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-2">
                              💡 Smart Financial Insight
                              <motion.div
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                              >
                                <Sparkles className="w-4 h-4 text-yellow-500" />
                              </motion.div>
                            </h4>
                            <div className="prose prose-sm text-gray-700">
                              {suggestion.split('. ').map((sentence, index) => {
                                if (sentence.trim()) {
                                  return (
                                    <motion.p 
                                      key={index}
                                      className="mb-2 last:mb-0"
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      transition={{ delay: 0.3 + index * 0.2 }}
                                    >
                                      {sentence.trim()}.
                                    </motion.p>
                                  );
                                }
                                return null;
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Key Metrics Cards */}
                      {chartData && (
                        <motion.div
                          className="grid grid-cols-2 gap-3 mb-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.6 }}
                        >
                          {/* Current Progress */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-600">Current</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              {Math.round((chartData.currentAmount / chartData.targetAmount) * 100)}%
                            </div>
                            <div className="text-xs text-gray-500">
                              ${chartData.currentAmount.toLocaleString()} saved
                            </div>
                          </div>

                          {/* Monthly Savings */}
                          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 border border-gray-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                              <span className="text-xs font-medium text-gray-600">Monthly</span>
                            </div>
                            <div className="text-lg font-bold text-gray-900">
                              ${chartData.currentMonthlyContribution}
                            </div>
                            <div className="text-xs text-gray-500">
                              +${chartData.suggestedSaving} suggested
                            </div>
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Chart visualization */}
                      {chartData && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.8 }}
                          className="flex justify-center"
                        >
                          <SavingsProjection {...chartData} />
                        </motion.div>
                      )}
                    </motion.div>
                    
                    <div className="flex justify-between items-center mt-4">
                      <button
                        onClick={handleNewInsight}
                        className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                        disabled={isLoading}
                      >
                        <Sparkles className="w-3 h-3" />
                        New Insight
                      </button>
                      <button
                        onClick={closeSuggestion}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors"
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
                <Sparkles className="w-6 h-6 text-yellow-400 opacity-60" />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
