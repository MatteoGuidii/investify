'use client';

import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-16">
        {/* Left Side: Video and Explanation */}
        <div className="w-full max-w-lg text-center lg:text-left">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Welcome to Your Future</h1>
          <p className="text-lg text-gray-600 mb-6">
            Our smart robo-advisor helps you set, plan, and achieve your financial goals with personalized investment strategies. See how it works in this short video.
          </p>
          <div className="aspect-video rounded-lg overflow-hidden shadow-2xl border-4 border-white">
            <iframe 
              className="w-full h-full"
              src="https://www.youtube.com/embed/gQNfSRC8Rb0"
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              allowFullScreen
            ></iframe>
          </div>
        </div>

        {/* Right Side: Auth Form */}
        <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold rbc-blue">
            RBC Goals
          </CardTitle>
          <CardDescription className="text-gray-600">
            Start your goal-based investing journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="clientName">Your Name</Label>
              <Input
                id="clientName"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Enter your name"
                required
              />
            </div>

            <div>
              <Label htmlFor="initialCash">Starting Cash</Label>
              <Input
                id="initialCash"
                type="number"
                value={initialCash}
                onChange={(e) => setInitialCash(Number(e.target.value))}
                min="100"
                step="100"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                This represents your available investment funds
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded border border-red-200">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-rbc-blue hover:bg-rbc-blue/90 text-white" 
              disabled={isLoading}
            >
              {isLoading ? 'Setting up...' : 'Get Started'}
            </Button>
          </form>
          <Button 
            variant="outline" 
            className="w-full mt-2" 
            onClick={handleTestLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Enter Test Mode'}
          </Button>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}