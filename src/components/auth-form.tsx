'use client';

import { useState } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

export function AuthForm() {
  const [teamName, setTeamName] = useState('');
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
      // First register team
      const teamSuccess = await registerTeam(teamName, email);
      if (!teamSuccess) return;
    }
    
    // Then create client
    const clientSuccess = await createClient(clientName || teamName, email, initialCash);
    if (clientSuccess) {
      setCurrentView('catalogue');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-blue-600">
            RBC Goals
          </CardTitle>
          <CardDescription>
            Start your goal-based investing journey
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="teamName">Team/Company Name</Label>
              <Input
                id="teamName"
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Your team name"
                required
              />
            </div>

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
              <Label htmlFor="clientName">Your Name (Optional)</Label>
              <Input
                id="clientName"
                type="text"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Leave blank to use team name"
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
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-2 rounded">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full" 
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