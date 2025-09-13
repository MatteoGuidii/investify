'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Star, TrendingUp, Trophy, Users } from 'lucide-react';
import type { RewardsData } from '../lib/types';

export function Rewards() {
  const { currentClient } = useAppStore();
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null);

  useEffect(() => {
    // Mock rewards data - in a real app this would come from an API
    const mockRewardsData: RewardsData = {
      avionPoints: {
        total: 320,
        description: 'Redeemable for travel, merchandise, or statement credits'
      },
      investmentStreak: {
        months: 12,
        currentProgress: 12,
        nextMilestone: 15,
        completionPercent: 80
      },
      discounts: [
        {
          id: '1',
          title: 'RBC Travel Discount',
          provider: 'RBC Travel',
          discountText: '10% off your next trip booking',
          expiryDate: '12/30/2023',
          category: 'travel'
        },
        {
          id: '2',
          title: 'Tech Store Discount',
          provider: 'Tech Store',
          discountText: '5% off electronics',
          expiryDate: '10/14/2023',
          category: 'tech'
        }
      ],
      challenges: [
        {
          id: '1',
          title: 'Consistency Champion',
          description: 'Invest for 15 consecutive months',
          progress: 12,
          completionPercent: 80,
          reward: '50 Avion Points',
          icon: '🏆'
        },
        {
          id: '2',
          title: 'Goal Getter',
          description: 'Complete your first investment goal',
          progress: 1,
          completionPercent: 50,
          reward: '100 Avion Points',
          icon: '🎯'
        }
      ],
      leaderboard: [
        { rank: 1, name: 'Sarah M.', points: 540, isCurrentUser: false },
        { rank: 2, name: 'Alex T.', points: 320, isCurrentUser: true },
        { rank: 3, name: 'Jordan K.', points: 290, isCurrentUser: false },
        { rank: 4, name: 'Taylor P.', points: 270, isCurrentUser: false },
        { rank: 5, name: 'Morgan L.', points: 250, isCurrentUser: false }
      ]
    };

    setRewardsData(mockRewardsData);
  }, []);

  if (!currentClient || !rewardsData) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⭐</div>
          <h2 className="text-xl font-semibold mb-2">Loading Rewards...</h2>
        </div>
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '📍';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'travel': return 'bg-blue-100 text-blue-800';
      case 'tech': return 'bg-gray-100 text-gray-800';
      case 'lifestyle': return 'bg-purple-100 text-purple-800';
      case 'shopping': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Rewards &amp; Engagement</h1>
        <p className="text-gray-600">Track your progress, earn rewards, and stay motivated on your financial journey.</p>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Avion Points */}
        <Card className="border-gray-200 hover:border-yellow-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Star className="w-5 h-5 text-yellow-500" />
              Avion Points
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {rewardsData.avionPoints.total}
            </div>
            <p className="text-sm text-gray-600">
              {rewardsData.avionPoints.description}
            </p>
          </CardContent>
        </Card>

        {/* Investment Streak */}
        <Card className="border-gray-200 hover:border-blue-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              Investment Streak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {rewardsData.investmentStreak.months} months
            </div>
            <div className="mb-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>{rewardsData.investmentStreak.currentProgress}/{rewardsData.investmentStreak.nextMilestone} to next milestone</span>
                <span>{rewardsData.investmentStreak.completionPercent}% complete</span>
              </div>
              <Progress value={rewardsData.investmentStreak.completionPercent} className="h-3" />
            </div>
          </CardContent>
        </Card>

        {/* Achievements */}
        <Card className="border-gray-200 hover:border-green-300 transition-colors">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Trophy className="w-5 h-5 text-green-500" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-2">
              {rewardsData.challenges.filter(c => c.completionPercent === 100).length}
            </div>
            <p className="text-sm text-gray-600">
              Challenges completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Available Discounts */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Discounts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewardsData.discounts.map((discount) => (
            <Card key={discount.id} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-rbc-blue text-white rounded-lg flex items-center justify-center text-xl font-bold">
                      {discount.category === 'travel' ? '✈️' : 
                       discount.category === 'tech' ? '💻' : 
                       discount.provider.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{discount.title}</h3>
                      <p className="text-sm text-gray-600">Expires: {discount.expiryDate}</p>
                    </div>
                  </div>
                  <Badge className={getCategoryColor(discount.category)}>
                    {discount.category}
                  </Badge>
                </div>
                <p className="text-gray-800 mb-4 text-lg">{discount.discountText}</p>
                <Button className="w-full bg-rbc-blue hover:bg-rbc-blue/90">
                  Redeem Now
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Active Challenges */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Active Challenges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rewardsData.challenges.map((challenge) => (
            <Card key={challenge.id} className="border-gray-200">
              <CardContent className="p-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center text-xl">
                    {challenge.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{challenge.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{challenge.description}</p>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{challenge.completionPercent}% complete</span>
                      </div>
                      <Progress value={challenge.completionPercent} className="h-3" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Reward: {challenge.reward}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Leaderboard</h2>
        <Card className="border-gray-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              See how you stack up against other students based on Avion Points earned this month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {rewardsData.leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    entry.isCurrentUser 
                      ? 'bg-blue-50 border-2 border-blue-200' 
                      : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-lg border-2 border-gray-200">
                      {getRankIcon(entry.rank)}
                    </div>
                    <div className="text-lg font-medium">
                      {entry.name}
                      {entry.isCurrentUser && (
                        <Badge className="ml-2 bg-blue-100 text-blue-800">You</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span className="font-bold text-lg">{entry.points}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
