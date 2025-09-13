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
    user 
  } = useAppStore();

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
      <Card className="w-full max-w-md border-gray-200">
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
        </CardContent>
      </Card>
    </div>
  );
}