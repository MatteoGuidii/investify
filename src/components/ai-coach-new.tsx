'use client';

import { useState, useEffect, useCallback } from 'react';
import { Bot, X, TrendingUp, Sparkles, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AiCoachProps {
  className?: string;
}

export function AiCoach({ className = '' }: AiCoachProps) {
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [hasSuggestion, setHasSuggestion] = useState(false);
  const [error, setError] = useState<string>('');
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);
  const [showConsent, setShowConsent] = useState(false);

  const fetchInsight = useCallback(async () => {
    if (isLoading) return;
    if (hasConsent !== true) return;
    
    setIsLoading(true);
    setIsThinking(true);
    setError('');
    
    try {
      const response = await fetch('/api/insight');
      const data = await response.json();
      
      if (response.ok) {
        // Add a slight delay for dramatic effect
        await new Promise(resolve => setTimeout(resolve, 1500));
        setSuggestion(data.suggestion);
        setHasSuggestion(true);
        setIsThinking(false);
        
        // Auto-show suggestion after loading
        setTimeout(() => setShowSuggestion(true), 500);
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
  }, [isLoading, hasConsent]);

  const handleIconClick = () => {
    if (hasConsent === null) {
      setShowSuggestion(true);
      return;
    }
    if (hasConsent === false) {
      setShowSuggestion(true);
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
  };

  // Initialize with first insight fetch on component mount
  // Load consent preference
  useEffect(() => {
    try {
      const stored = localStorage.getItem('aiCoachConsent');
      if (stored === 'granted') setHasConsent(true);
      else if (stored === 'declined') setHasConsent(false);
    } catch {/* ignore */}
  }, []);

  // Orchestrate welcome -> consent -> insight
  useEffect(() => {
    if (!hasInitialized) {
      setShowSuggestion(true); // ensure container visible
      setShowWelcome(true);
      const welcomeTimer = setTimeout(() => {
        setShowWelcome(false);
        if (hasConsent === null) {
          setShowConsent(true);
        } else if (hasConsent === true) {
          fetchInsight();
        }
        setHasInitialized(true);
      }, 2200);
      return () => clearTimeout(welcomeTimer);
    }
  }, [hasInitialized, hasConsent, fetchInsight]);

  // Fetch after user grants consent while consent screen is open
  useEffect(() => {
    if (hasConsent === true && showConsent) {
      setShowConsent(false);
      fetchInsight();
    }
  }, [hasConsent, showConsent, fetchInsight]);

  const grantConsent = () => {
    setHasConsent(true);
    try { localStorage.setItem('aiCoachConsent', 'granted'); } catch {/* ignore */}
    if (!suggestion) fetchInsight();
  };
  const declineConsent = () => {
    setHasConsent(false);
    try { localStorage.setItem('aiCoachConsent', 'declined'); } catch {/* ignore */}
    setShowConsent(false);
  };

  return (
    <>
      {/* Floating AI Coach Icon with enhanced animations */}
      <motion.div
        className={`fixed bottom-6 right-6 z-50 ${className}`}
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20, delay: 1 }}
      >
        <motion.div
          className="relative"
          animate={isThinking ? {
            y: [0, -8, 0],
          } : {}}
          transition={{
            duration: 1.5,
            repeat: isThinking ? Infinity : 0,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        >
          <motion.button
            onClick={handleIconClick}
            className={`
              relative w-16 h-16 rounded-full shadow-2xl transition-all duration-500
              flex items-center justify-center overflow-hidden
              ${hasSuggestion 
                ? 'bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500' 
                : isThinking
                ? 'bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500'
                : 'bg-gradient-to-br from-gray-500 to-gray-600'
              }
            `}
            disabled={isLoading}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            animate={hasSuggestion ? {
              boxShadow: [
                "0 0 0 0 rgba(59, 130, 246, 0.7)",
                "0 0 0 15px rgba(59, 130, 246, 0)",
                "0 0 0 0 rgba(59, 130, 246, 0)"
              ]
            } : {}}
            transition={{
              duration: 2,
              repeat: hasSuggestion ? Infinity : 0,
              repeatType: "loop"
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

      {/* Compact Inline Suggestion Popup */}
      <AnimatePresence>
  {showSuggestion && (
          <motion.div
            className="fixed bottom-24 right-6 z-40 max-w-sm"
            initial={{ opacity: 0, x: 100, y: 20 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <motion.div
              className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 relative overflow-hidden"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              {/* Gradient background overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-60"></div>
              
              {/* Close button */}
              <button
                onClick={closeSuggestion}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
              >
                <X className="w-4 h-4" />
              </button>

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
                  <h3 className="font-semibold text-gray-900 text-sm">{showWelcome ? 'AI Financial Coach' : showConsent ? 'Before We Begin' : (hasConsent === true ? 'AI Financial Insight' : 'AI Financial Coach')}</h3>
                  <p className="text-xs text-gray-600">{showWelcome ? 'Just arrived!' : showConsent ? 'Do you want insights?' : (hasConsent === true ? 'Educational only' : 'Preference saved')}</p>
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
                    <div className="bg-white/90 rounded-xl p-3 border border-gray-100">
                      <p className="text-gray-800 text-sm leading-relaxed">Hi! 👋 I’m your AI financial coach. Let’s get started.</p>
                    </div>
                    <div className="flex justify-center mt-2">
                      <div className="flex space-x-1">
                        {[0,1,2].map(i => (
                          <motion.div key={i} className="w-2 h-2 bg-blue-500 rounded-full" animate={{ scale: [1,1.2,1], opacity:[0.7,1,0.7] }} transition={{ duration:0.8, repeat:Infinity, delay:i*0.2 }} />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ) : showConsent ? (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="py-1"
                  >
                    <div className="bg-white/90 rounded-xl p-3 border border-blue-100 space-y-3">
                      <p className="text-gray-800 text-sm leading-relaxed">
                        Enable AI generated financial insights? They are educational and not personalized advice.
                      </p>
                      <ul className="text-xs text-gray-600 list-disc pl-4 space-y-1">
                        <li>May be imperfect.</li>
                        <li>No sensitive data stored.</li>
                        <li>Not professional advice.</li>
                      </ul>
                      <div className="flex gap-2 pt-1">
                        <button onClick={grantConsent} className="flex-1 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-1">
                          <Sparkles className="w-3 h-3" /> Enable
                        </button>
                        <button onClick={declineConsent} className="px-3 py-2 bg-gray-100 text-gray-700 text-xs rounded-lg hover:bg-gray-200 transition-colors">Not now</button>
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
                      onClick={fetchInsight}
                      className="px-3 py-1 bg-blue-500 text-white text-sm rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                ) : suggestion ? (
                  <div>
                    <motion.div
                      className="bg-white bg-opacity-80 rounded-xl p-3 mb-3 border border-gray-100"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      <p className="text-gray-800 text-sm leading-relaxed">{suggestion}</p>
                    </motion.div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={fetchInsight}
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
