'use client';

import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

export function AuthForm() {
  const [email, setEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [initialCash, setInitialCash] = useState(10000);

  const { 
    registerTeam, 
    createClient, 
    setCurrentView, 
    isLoading, 
    error, 
    user,
    loginAsTestUser
  } = useAppStore();

  const handleTestLogin = async () => {
    await loginAsTestUser();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      // Register team with a default name (using email prefix)
      const defaultTeamName = email.split('@')[0] + '-team';
      const teamSuccess = await registerTeam(defaultTeamName, email);
      if (!teamSuccess) return;
    }
    
    // Create client
    const clientSuccess = await createClient(clientName, email, initialCash);
    if (clientSuccess) {
      setCurrentView('catalogue');
    }
  };

  return (
    <div className="min-h-screen bg-neo-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neo-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neo-accent/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-green-400/5 rounded-full blur-2xl"></div>
      </div>

      <div className="container mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16 max-w-6xl mx-auto">
          {/* Left Side: Hero Content */}
          <div className="w-full max-w-lg text-center lg:text-left">
            {/* Logo and tagline */}
            <div className="flex items-center justify-center lg:justify-start space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-neo-primary flex items-center justify-center">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <div className="w-4 h-4 rounded bg-white"></div>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Investify</h1>
              </div>
            </div>

            <h2 className="text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Future of
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 block">
                Goal-Based
              </span>
              <span className="text-white">Investing</span>
            </h2>
            
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Experience next-generation portfolio management with AI-powered insights, 
              real-time tracking, and seamless goal achievement.
            </p>

            {/* Stats */}
            <div className="flex justify-center lg:justify-start space-x-8 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">50K+</div>
                <div className="text-sm text-gray-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">$2.5B</div>
                <div className="text-sm text-gray-400">Assets Managed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-400">98%</div>
                <div className="text-sm text-gray-400">Goal Success</div>
              </div>
            </div>

            {/* Video */}
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl neo-glass border border-white/10">
              <iframe 
                className="w-full h-full"
                src="https://www.youtube.com/embed/gQNfSRC8Rb0"
                title="NexaGoals Demo" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                allowFullScreen
              ></iframe>
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
            </div>
          </div>

          {/* Right Side: Auth Form */}
          <div className="w-full max-w-md">
            <div className="neo-card p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Get Started Today
                </h3>
                <p className="text-gray-400">
                  Join thousands achieving their financial dreams
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-white font-medium">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-green-400 focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clientName" className="text-white font-medium">Full Name</Label>
                  <Input
                    id="clientName"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter your full name"
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-green-400 focus:ring-green-400"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="initialCash" className="text-white font-medium">Starting Investment</Label>
                  <Input
                    id="initialCash"
                    type="number"
                    value={initialCash}
                    onChange={(e) => setInitialCash(Number(e.target.value))}
                    min="100"
                    step="100"
                    className="mt-2 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-green-400 focus:ring-green-400"
                    required
                  />
                  <p className="text-xs text-gray-400 mt-2">
                    Minimum investment amount to get started
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-500/30 text-red-300 text-sm p-3 rounded-xl">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full neo-button text-white font-semibold py-3 rounded-xl" 
                  disabled={isLoading}
                >
                  {isLoading ? 'Setting up your account...' : 'Start Your Journey →'}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-white/20" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-800 px-2 text-gray-400">Or</span>
                  </div>
                </div>

                <Button 
                  type="button"
                  variant="outline" 
                  className="w-full bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 py-3 rounded-xl" 
                  onClick={handleTestLogin}
                  disabled={isLoading}
                >
                  {isLoading ? 'Accessing...' : '🚀 Try Demo Mode'}
                </Button>
              </form>

              <p className="text-center text-xs text-gray-500 mt-6">
                By continuing, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}