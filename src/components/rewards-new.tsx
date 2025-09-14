'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Star, TrendingUp, Trophy, Users, Award, Target, Zap } from 'lucide-react';
import type { RewardsData } from '../lib/types';

export function Rewards() {
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null);

  useEffect(() => {
    // Two mock profiles: default and wrap-ready (demo mode)
    const defaultData: RewardsData = {
      avionPoints: { total: 320, description: 'Redeemable for travel, merchandise, or statement credits' },
      investmentStreak: { months: 12, currentProgress: 12, nextMilestone: 15, completionPercent: 80 },
      discounts: [],
      challenges: [
        { id: '1', title: 'Consistency Champion', description: 'Make investments for 12 consecutive months', progress: 12, completionPercent: 100, reward: '1,000 Avion Points', icon: 'target' },
        { id: '2', title: 'Growth Milestone', description: 'Reach $10,000 in total investments', progress: 7500, completionPercent: 75, reward: '2,500 Avion Points', icon: 'trending-up' },
        { id: '3', title: 'Portfolio Diversifier', description: 'Invest in 3 different goal categories', progress: 2, completionPercent: 67, reward: '500 Avion Points', icon: 'star' }
      ],
      leaderboard: [
        { rank: 1, name: 'Alex M.', points: 12500, badge: 'Investment Pro', isCurrentUser: false },
        { rank: 2, name: 'Jordan K.', points: 9800, badge: 'Consistent Saver', isCurrentUser: false },
        { rank: 3, name: 'You', points: 8200, badge: 'Rising Star', isCurrentUser: true },
        { rank: 4, name: 'Taylor B.', points: 7500, badge: 'Goal Crusher', isCurrentUser: false }
      ]
    };

    const wrapReadyData: RewardsData = {
      avionPoints: { total: 10420, description: 'Redeemable for travel, merchandise, or statement credits' },
      investmentStreak: { months: 18, currentProgress: 18, nextMilestone: 24, completionPercent: 75 },
      discounts: [
        { id: 'd1', title: 'Partner Travel Deal', provider: 'Air Canada', discountText: 'Save 10% on select flights', expiryDate: '2025-12-31', category: 'travel' }
      ],
      challenges: [
        { id: '1', title: 'Consistency Champion', description: 'Make investments for 12 consecutive months', progress: 12, completionPercent: 100, reward: '1,000 Avion Points', icon: 'target' },
        { id: '2', title: 'Growth Milestone', description: 'Reach $10,000 in total investments', progress: 10000, completionPercent: 100, reward: '2,500 Avion Points', icon: 'trending-up' },
        { id: '3', title: 'Portfolio Diversifier', description: 'Invest in 3 different goal categories', progress: 3, completionPercent: 100, reward: '500 Avion Points', icon: 'star' }
      ],
      leaderboard: [
        { rank: 1, name: 'You', points: 15800, badge: 'Wrap Legend', isCurrentUser: true },
        { rank: 2, name: 'Alex M.', points: 12500, badge: 'Investment Pro', isCurrentUser: false },
        { rank: 3, name: 'Jordan K.', points: 9800, badge: 'Consistent Saver', isCurrentUser: false },
        { rank: 4, name: 'Taylor B.', points: 7500, badge: 'Goal Crusher', isCurrentUser: false }
      ]
    };

    try {
      const isDemo = typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true';
      const profile = typeof window !== 'undefined' && localStorage.getItem('demo_rewards_profile');
      if (isDemo && profile === 'wrap_ready') {
        setRewardsData(wrapReadyData);
      } else {
        setRewardsData(defaultData);
      }
    } catch {
      setRewardsData(defaultData);
    }
  }, []);

  const getChallengeIcon = (iconName: string) => {
    switch (iconName) {
      case 'target': return <Target className="w-6 h-6" />;
      case 'trending-up': return <TrendingUp className="w-6 h-6" />;
      case 'star': return <Star className="w-6 h-6" />;
      default: return <Award className="w-6 h-6" />;
    }
  };

  if (!rewardsData) {
    return (
      <div className="min-h-screen bg-neo-dark flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const me = rewardsData.leaderboard.find(e => e.isCurrentUser);
  const monthsToMilestone = Math.max(
    0,
    rewardsData.investmentStreak.nextMilestone - rewardsData.investmentStreak.currentProgress
  );

  return (
    <div className="min-h-screen bg-neo-dark relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -right-20 w-80 h-80 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 -left-20 w-80 h-80 bg-gradient-to-tr from-green-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-4 py-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-3">Rewards & Recognition</h1>
          <p className="text-base text-gray-300 font-medium">Earn rewards for your investment journey. Every $100 invested gets you 10 Avion Points.</p>
        </div>

        {/* Top Cards */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Avion Points */}
          <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-400/40 rounded-xl p-6 flex flex-col min-h-[280px]">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/30 flex-shrink-0">
                <Star className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Avion Points</h3>
                <p className="text-sm text-gray-200">Total earned</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-300 mb-3">
              {rewardsData.avionPoints.total.toLocaleString()}
            </div>
            <p className="text-sm text-gray-100 mb-6 flex-grow">
              {rewardsData.avionPoints.description}
            </p>
            <div className="mt-auto">
              <a
                href="https://www.avionrewards.com/en-ca/lp/rewards/join-for-free/?utm_dc=ga_SEG_20529236817_150583073982_743756569614_kwd-297749411433_c_g_&gad_source=1&gad_campaignid=20529236817&gbraid=0AAAAADPnvsrNQ7QxfQ1vwVOyjB3rFhEML&gclid=Cj0KCQjwrJTGBhCbARIsANFBfgvxMu91rHdmkzyfhPh1BV_sV5D_Gw0fx2SvznC1DABSbTZjgjIdFIwaAsi8EALw_wcB"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-yellow-600/80 hover:bg-yellow-600 text-white font-medium text-sm py-3 border-0">
                  Redeem Points
                </Button>
              </a>
            </div>
          </div>

          {/* Investment Streak */}
          <div className="bg-green-500/20 backdrop-blur-md border border-green-400/40 rounded-xl p-6 flex flex-col min-h-[280px]">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-green-500/30 flex-shrink-0">
                <Zap className="w-6 h-6 text-green-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Investment Streak</h3>
                <p className="text-sm text-gray-200">{rewardsData.investmentStreak.months} months</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-green-300 mb-3">
              {rewardsData.investmentStreak.currentProgress}/{rewardsData.investmentStreak.nextMilestone}
            </div>
            <p className="text-sm text-gray-100 mb-6 flex-grow">
              {monthsToMilestone} months to next milestone
            </p>
            <div className="mt-auto">
              <Progress value={rewardsData.investmentStreak.completionPercent} className="mb-2" />
              {/* <span className="text-xs text-gray-300">{rewardsData.investmentStreak.completionPercent}% complete</span> */}
            </div>
          </div>

          {/* Leaderboard */}
          <div className="bg-blue-500/20 backdrop-blur-md border border-blue-400/40 rounded-xl p-6 flex flex-col min-h-[280px]">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/30 flex-shrink-0">
                <Trophy className="w-6 h-6 text-blue-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Your Rank</h3>
                <p className="text-sm text-gray-200">Among peers</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-300 mb-3">
              #{me?.rank ?? 'N/A'}
            </div>
            <p className="text-sm text-gray-100 mb-6 flex-grow">
              {me?.badge ?? 'Rising Star'}
            </p>
            <div className="mt-auto">
              {/* <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg px-3 py-2 text-center">
                <span className="text-xs text-blue-300 font-medium">Current Badge</span>
              </div> */}
            </div>
          </div>
        </div>

        {/* Active Challenges */}
        <div className="mt-8">
          <h2 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
            <Target className="w-6 h-6 text-green-400" />
            Active Challenges
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewardsData.challenges.map((challenge) => (
              <div key={challenge.id} className="neo-card p-4 flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-green-500/20">
                      {getChallengeIcon(challenge.icon)}
                    </div>
                    <div>
                      <h4 className="text-base font-medium text-white">{challenge.title}</h4>
                      <p className="text-sm text-gray-300 mt-1">{challenge.description}</p>
                    </div>
                  </div>
                </div>
                <Progress value={challenge.completionPercent} className="mb-2" />
                <div className="flex justify-between items-center mt-auto">
                  {/* <span className="text-sm text-gray-300">{challenge.completionPercent}% complete</span> */}
                  <Badge variant="outline" className="text-sm">
                    {challenge.reward}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="mt-8">
          <h2 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-400" />
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
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold ${
                        entry.rank === 1
                          ? 'bg-yellow-500/20 text-yellow-400'
                          : entry.rank === 2
                          ? 'bg-gray-500/20 text-gray-400'
                          : entry.rank === 3
                          ? 'bg-orange-500/20 text-orange-400'
                          : 'bg-gray-600/20 text-gray-300'
                      }`}
                    >
                      {entry.rank}
                    </div>
                    <div>
                      <p className="text-base font-medium text-white">{entry.name}</p>
                      <Badge variant="outline" className="text-sm mt-1">
                        {entry.badge}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-base font-medium text-green-400">
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
