'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '../lib/store';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Star, TrendingUp, Trophy, Users, Gift, Award, Target, Zap } from 'lucide-react';
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
          expiryDate: '12/30/2025',
          category: 'travel'
        },
        {
          id: '2',
          title: 'Tech Store Discount',
          provider: 'Best Buy',
          discountText: '5% off electronics',
          expiryDate: '10/14/2025',
          category: 'tech'
        },
        {
          id: '3',
          title: 'Lifestyle Rewards',
          provider: 'RBC Rewards',
          discountText: '15% off dining experiences',
          expiryDate: '11/30/2025',
          category: 'lifestyle'
        }
      ],
      challenges: [
        {
          id: '1',
          title: 'Consistency Champion',
          description: 'Make investments for 12 consecutive months',
          progress: 12,
          completionPercent: 100,
          reward: '1,000 Avion Points',
          icon: 'target'
        },
        {
          id: '2',
          title: 'Growth Milestone',
          description: 'Reach $10,000 in total investments',
          progress: 7500,
          completionPercent: 75,
          reward: '2,500 Avion Points',
          icon: 'trending-up'
        },
        {
          id: '3',
          title: 'Portfolio Diversifier',
          description: 'Invest in 3 different goal categories',
          progress: 2,
          completionPercent: 67,
          reward: '500 Avion Points',
          icon: 'star'
        }
      ],
      leaderboard: [
        {
          rank: 1,
          name: 'Alex M.',
          points: 12500,
          badge: 'Investment Pro',
          isCurrentUser: false
        },
        {
          rank: 2,
          name: 'Jordan K.',
          points: 9800,
          badge: 'Consistent Saver',
          isCurrentUser: false
        },
        {
          rank: 3,
          name: 'You',
          points: 8200,
          badge: 'Rising Star',
          isCurrentUser: true
        },
        {
          rank: 4,
          name: 'Taylor B.',
          points: 7500,
          badge: 'Goal Crusher',
          isCurrentUser: false
        }
      ]
    };

    setRewardsData(mockRewardsData);
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel': return '✈️';
      case 'tech': return '💻';
      case 'lifestyle': return '🍽️';
      case 'shopping': return '🛍️';
      default: return '🎁';
    }
  };

  const getChallengeIcon = (iconName: string) => {
    switch (iconName) {
      case 'target': return <Target className="w-5 h-5" />;
      case 'trending-up': return <TrendingUp className="w-5 h-5" />;
      case 'star': return <Star className="w-5 h-5" />;
      default: return <Award className="w-5 h-5" />;
    }
  };

  if (!rewardsData) {
    return (
      <div className="min-h-screen bg-neo-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neo-dark relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-green-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-white mb-2">Rewards & Recognition</h1>
          <p className="text-sm text-gray-400">Earn rewards for your investment journey. Every $100 invested gets you 10 Avion Points.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Avion Points Card */}
          <div className="neo-card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <Star className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-base font-medium text-white">Avion Points</h3>
                <p className="text-xs text-gray-400">Total earned</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-yellow-400 mb-2">
              {rewardsData.avionPoints.total.toLocaleString()}
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              {rewardsData.avionPoints.description}
            </p>
            <Button className="w-full mt-4 neo-button text-sm py-2">
              Redeem Points
            </Button>
          </div>

          {/* Investment Streak */}
          <div className="neo-card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/20">
                <Zap className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-base font-medium text-white">Investment Streak</h3>
                <p className="text-xs text-gray-400">{rewardsData.investmentStreak.months} months</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-green-400 mb-3">
              {rewardsData.investmentStreak.currentProgress}/{rewardsData.investmentStreak.nextMilestone}
            </div>
            <Progress 
              value={rewardsData.investmentStreak.completionPercent} 
              className="mb-3"
            />
            <p className="text-xs text-gray-400">
              {rewardsData.investmentStreak.nextMilestone - rewardsData.investmentStreak.currentProgress} months to next milestone
            </p>
          </div>

          {/* Leaderboard Position */}
          <div className="neo-card-elevated p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/20">
                <Trophy className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-base font-medium text-white">Your Rank</h3>
                <p className="text-xs text-gray-400">Among peers</p>
              </div>
            </div>
            <div className="text-2xl font-bold text-blue-400 mb-2">
              #{rewardsData.leaderboard.find(entry => entry.isCurrentUser)?.rank || 'N/A'}
            </div>
            <Badge variant="secondary" className="text-xs">
              {rewardsData.leaderboard.find(entry => entry.isCurrentUser)?.badge || 'Beginner'}
            </Badge>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-400" />
            Active Challenges
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewardsData.challenges.map((challenge) => (
              <div key={challenge.id} className="neo-card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      {getChallengeIcon(challenge.icon)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{challenge.title}</h4>
                      <p className="text-xs text-gray-400 mt-1">{challenge.description}</p>
                    </div>
                  </div>
                </div>
                <Progress value={challenge.completionPercent} className="mb-2" />
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    {challenge.completionPercent}% complete
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {challenge.reward}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Available Discounts */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-green-400" />
            Available Discounts
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewardsData.discounts.map((discount) => (
              <div key={discount.id} className="neo-card p-4 hover:border-green-500/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getCategoryIcon(discount.category)}</div>
                    <div>
                      <h4 className="text-sm font-medium text-white">{discount.title}</h4>
                      <p className="text-xs text-gray-400">{discount.provider}</p>
                    </div>
                  </div>
                </div>
                <p className="text-sm text-green-400 font-medium mb-2">
                  {discount.discountText}
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-400">
                    Expires: {discount.expiryDate}
                  </span>
                  <Button size="sm" className="neo-button text-xs px-3 py-1">
                    Use Now
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            Community Leaderboard
          </h2>
          <div className="neo-card p-4">
            <div className="space-y-3">
              {rewardsData.leaderboard.map((entry) => (
                <div
                  key={entry.rank}
                  className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                    entry.isCurrentUser 
                      ? 'bg-green-500/10 border border-green-500/20' 
                      : 'bg-black/20 hover:bg-black/30'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      entry.rank === 1 ? 'bg-yellow-500/20 text-yellow-400' :
                      entry.rank === 2 ? 'bg-gray-500/20 text-gray-400' :
                      entry.rank === 3 ? 'bg-orange-500/20 text-orange-400' :
                      'bg-gray-600/20 text-gray-300'
                    }`}>
                      {entry.rank}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">{entry.name}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {entry.badge}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm font-medium text-green-400">
                    {entry.points.toLocaleString()} pts
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
