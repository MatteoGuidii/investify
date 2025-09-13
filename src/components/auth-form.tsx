'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAppStore } from '../lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function AuthForm() {
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [initialCash, setInitialCash] = useState(10000);
  const [step, setStep] = useState<'team' | 'client'>('team');

  const { 
    registerTeam, 
    createClient, 
    setCurrentView, 
    isLoading, 
    error, 
    user 
  } = useAppStore();

  const handleTeamRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await registerTeam(teamName, email);
    if (success) {
      setStep('client');
    }
  };

  const handleClientCreation = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await createClient(clientName, clientEmail, initialCash);
    if (success) {
      setCurrentView('catalogue');
    }
  };

  if (step === 'client' && user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Welcome, {user.teamName}!
              </CardTitle>
              <CardDescription>
                Let&apos;s create your investor profile to get started with goal-based investing.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleClientCreation} className="space-y-4">
                <div>
                  <Label htmlFor="clientName">Your Name</Label>
                  <Input
                    id="clientName"
                    type="text"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="clientEmail">Email Address</Label>
                  <Input
                    id="clientEmail"
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="initialCash">Initial Cash Balance</Label>
                  <Input
                    id="initialCash"
                    type="number"
                    value={initialCash}
                    onChange={(e) => setInitialCash(Number(e.target.value))}
                    placeholder="10000"
                    min="100"
                    step="100"
                    required
                  />
                  <p className="text-sm text-gray-600 mt-1">
                    This simulates the cash you have available to invest in your goals.
                  </p>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-lg">
                    {error}
                  </div>
                )}

                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Profile...' : 'Start Investing'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card>
          <CardHeader className="text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4"
            >
              <span className="text-white text-2xl font-bold">R</span>
            </motion.div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              RBC Goals
            </CardTitle>
            <CardDescription>
              Transform your investing from an abstract habit into a tangible goal-based journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleTeamRegistration} className="space-y-4">
              <div>
                <Label htmlFor="teamName">Team Name</Label>
                <Input
                  id="teamName"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter your team name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="team@example.com"
                  required
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm text-center p-2 bg-red-50 rounded-lg">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Registering...' : 'Get Started'}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              <p>🏆 Hack the North 2025 Demo</p>
              <p>Real API integration with portfolio simulation</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
