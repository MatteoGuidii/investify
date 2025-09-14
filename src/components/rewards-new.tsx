'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';
import { Star, TrendingUp, Trophy, Users, Award, Target, Zap } from 'lucide-react';
import type { RewardsData, LeaderboardEntry } from '../lib/types';

// Gamification config
const POINTS_PER_LEVEL = 1000; // every 1000 lifetime points -> +1 level
// Progressive tiers: higher tiers span more levels (visual width reflects effort)
// Bronze: 0-4, Silver:5-14, Gold:15-29, Diamond:30-49 (>=50 treated as Diamond overflow)
const TIERS = [
  { name: 'Bronze', minLevel: 0, maxLevel: 5 },   // 5 levels
  { name: 'Silver', minLevel: 5, maxLevel: 15 },  // 10 levels
  { name: 'Gold', minLevel: 15, maxLevel: 30 },   // 15 levels
  { name: 'Diamond', minLevel: 30, maxLevel: 50 } // 20 levels (cap display)
];

function computeLevel(lifetimePoints?: number) {
  if (!lifetimePoints) return 0;
  return Math.floor(lifetimePoints / POINTS_PER_LEVEL);
}

function computeTier(level: number) {
  const last = TIERS[TIERS.length - 1];
  for (const t of TIERS) {
    if (level >= t.minLevel && level < t.maxLevel) return t.name;
  }
  // beyond last max -> remain at last tier
  return last.name;
}

function enrichLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries
    .map(e => {
      const lifetime = e.lifetimePoints ?? e.points; // fallback to current points
      const level = computeLevel(lifetime);
      return { ...e, lifetimePoints: lifetime, level };
    })
    .sort((a, b) => (b.lifetimePoints || 0) - (a.lifetimePoints || 0))
    .map((e, i) => ({ ...e, rank: i + 1 }));
}

export function Rewards() {
  const [rewardsData, setRewardsData] = useState<RewardsData | null>(null);

  useEffect(() => {
    // Two mock profiles: default and wrap-ready (demo mode)
    const defaultData: RewardsData = {
      avionPoints: { total: 320, description: 'Redeemable for travel, merchandise, or statement credits', lifetime: 4320 },
      investmentStreak: { months: 12, currentProgress: 12, nextMilestone: 15, completionPercent: 80 },
      discounts: [],
      challenges: [
        { id: '1', title: 'Consistency Champion', description: 'Make investments for 12 consecutive months', progress: 12, completionPercent: 100, reward: '1,000 Avion Points', icon: 'target' },
        { id: '2', title: 'Growth Milestone', description: 'Reach $10,000 in total investments', progress: 7500, completionPercent: 75, reward: '2,500 Avion Points', icon: 'trending-up' },
        { id: '3', title: 'Portfolio Diversifier', description: 'Invest in 3 different goal categories', progress: 2, completionPercent: 67, reward: '500 Avion Points', icon: 'star' }
      ],
      leaderboard: [
        { rank: 1, name: 'Alex M.', points: 12500, lifetimePoints: 15800, badge: 'Investment Pro', isCurrentUser: false },
        { rank: 2, name: 'Jordan K.', points: 9800, lifetimePoints: 11200, badge: 'Consistent Saver', isCurrentUser: false },
        { rank: 3, name: 'You', points: 8200, lifetimePoints: 4320, badge: 'Rising Star', isCurrentUser: true },
        { rank: 4, name: 'Taylor B.', points: 7500, lifetimePoints: 9100, badge: 'Goal Crusher', isCurrentUser: false },
        { rank: 5, name: 'Sam W.', points: 6400, lifetimePoints: 7000, badge: 'Saver', isCurrentUser: false }
      ]
    };

    const wrapReadyData: RewardsData = {
      // Keep leaderboard consistent with Avion total by setting both to same number
      avionPoints: { total: 15800, description: 'Redeemable for travel, merchandise, or statement credits', lifetime: 26800 },
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
        { rank: 1, name: 'You', points: 15800, lifetimePoints: 26800, badge: 'Wrap Legend', isCurrentUser: true },
        { rank: 2, name: 'Alex M.', points: 12500, lifetimePoints: 19800, badge: 'Investment Pro', isCurrentUser: false },
        { rank: 3, name: 'Jordan K.', points: 9800, lifetimePoints: 17800, badge: 'Consistent Saver', isCurrentUser: false },
        { rank: 4, name: 'Taylor B.', points: 7500, lifetimePoints: 15400, badge: 'Goal Crusher', isCurrentUser: false },
        { rank: 5, name: 'Sam W.', points: 6400, lifetimePoints: 12100, badge: 'Saver', isCurrentUser: false }
      ]
    };

    try {
      const isDemo = typeof window !== 'undefined' && localStorage.getItem('demo_mode') === 'true';
      const profile = typeof window !== 'undefined' && localStorage.getItem('demo_rewards_profile');
      const raw = isDemo && profile === 'wrap_ready' ? wrapReadyData : defaultData;
      // Normalize leaderboard so current user points == Avion total
      const normalized: RewardsData = {
        ...raw,
        leaderboard: enrichLeaderboard(
          raw.leaderboard.map(entry => entry.isCurrentUser ? { ...entry, points: raw.avionPoints.total } : entry)
        )
      };
      setRewardsData(normalized);
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
  const myLevel = me?.level || 0;
  const myTier = computeTier(myLevel);
  const myLifetime = me?.lifetimePoints || rewardsData.avionPoints.lifetime || rewardsData.avionPoints.total;
  const progressWithinLevel = ((myLifetime % POINTS_PER_LEVEL) / POINTS_PER_LEVEL) * 100;
  const toNextLevel = POINTS_PER_LEVEL - (myLifetime % POINTS_PER_LEVEL || 0);
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
          {/* Avion Points & Level */}
          <div className="bg-yellow-500/20 backdrop-blur-md border border-yellow-400/40 rounded-xl p-6 flex flex-col min-h-[280px]">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-yellow-500/30 flex-shrink-0">
                <Star className="w-6 h-6 text-yellow-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Avion Points & Level</h3>
                <p className="text-sm text-gray-200">Level {myLevel} • {myTier}</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-yellow-300 mb-3">
              {rewardsData.avionPoints.total.toLocaleString()}
            </div>
            <p className="text-sm text-gray-100 mb-2">
              {rewardsData.avionPoints.description}
            </p>
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-200 mb-1">
                <span>Lifetime: {myLifetime.toLocaleString()}</span>
                <span>Next L{myLevel + 1} in {toNextLevel} pts</span>
              </div>
              <Progress value={progressWithinLevel} />
            </div>
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
            </div>
          </div>

          {/* Leaderboard Summary */}
          <div className="bg-blue-500/20 backdrop-blur-md border border-blue-400/40 rounded-xl p-6 flex flex-col min-h-[280px]">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-lg bg-blue-500/30 flex-shrink-0">
                <Trophy className="w-6 h-6 text-blue-300" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white">Your Rank</h3>
                <p className="text-sm text-gray-200">Level {myLevel} • {myTier}</p>
              </div>
            </div>
            <div className="text-3xl font-bold text-blue-300 mb-3">
              #{me?.rank ?? 'N/A'}
            </div>
            <p className="text-sm text-gray-100 mb-6 flex-grow">
              {me?.badge ?? 'Rising Star'}
            </p>
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
                  <Badge variant="outline" className="text-sm">
                    {challenge.reward}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tier Progression (Enhanced) */}
        <div className="mt-12" aria-labelledby="tier-progress-heading">
          <div className="flex items-center justify-between mb-3">
            <h3 id="tier-progress-heading" className="text-lg font-semibold text-white flex items-center gap-2">Your Tier Progress</h3>
            <span className="text-xs text-gray-300">1 Level = {POINTS_PER_LEVEL.toLocaleString()} lifetime pts</span>
          </div>
          {(() => {
            const lifetime = myLifetime;
            const level = myLevel;
            const tierName = myTier;
            const inLevelProgress = (lifetime % POINTS_PER_LEVEL) / POINTS_PER_LEVEL;
            const fractionalLevel = level + inLevelProgress;
            const totalDisplayLevels = TIERS[TIERS.length - 1].maxLevel; // cap for visual scale
            const clampedFractional = Math.min(fractionalLevel, totalDisplayLevels);
            const barFillPercent = (clampedFractional / totalDisplayLevels) * 100;
            const remainingToNextLevel = POINTS_PER_LEVEL - Math.floor(inLevelProgress * POINTS_PER_LEVEL);

            // Improved accessible palette (higher contrast & progressive richness)
            const tierColors: Record<string,{base:string; fill:string; text:string}> = {
              Bronze:  { base: '#2d241d', fill: '#b07b52', text: '#e9d2c1' },
              Silver:  { base: '#26292d', fill: '#a2adb7', text: '#e2e8ed' },
              Gold:    { base: '#2e2818', fill: '#eab308', text: '#fef08a' },
              Diamond: { base: '#10272d', fill: '#4db9cc', text: '#c2ecf4' }
            };

            // Build segments using explicit maxLevel for proportional widths
            const segments = TIERS.map(t => {
              const span = t.maxLevel - t.minLevel;
              let fillRatio = 0;
              if (level >= t.maxLevel) fillRatio = 1;
              else if (fractionalLevel <= t.minLevel) fillRatio = 0;
              else fillRatio = (fractionalLevel - t.minLevel) / span;
              fillRatio = Math.min(Math.max(fillRatio, 0), 1);
              return { name: t.name, start: t.minLevel, end: t.maxLevel, fillRatio, spanPercent: (span / totalDisplayLevels) * 100 };
            });

            return (
              <div className="neo-card p-5 relative">
                {/* Segmented tier bar */}
                <div className="relative h-5 flex w-full rounded-full overflow-hidden bg-neutral-800/70 border border-white/10" aria-label="Tier cumulative progress bar">
                  {segments.map(seg => {
                    const c = tierColors[seg.name];
                    return (
                      <div key={seg.name} className="relative h-full" style={{ width: `${seg.spanPercent}%`, background: c.base }}>
                        <div className="absolute inset-y-0 left-0 transition-[width] duration-500 ease-out" style={{ width: `${seg.fillRatio * 100}%`, background: c.fill, opacity: 0.7 }} />
                        <div className="absolute top-0 right-0 h-full w-px bg-white/5" />
                      </div>
                    );
                  })}
                  {/* Progress handle */}
                  <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc(${barFillPercent}%)` }}>
                    <div className="relative flex items-center justify-center -translate-x-1/2">
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-green-400 to-green-500 shadow-lg ring-2 ring-green-400/30" />
                      <div className="absolute w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </div>
                </div>
                {/* Markers */}
                <div className="relative mt-3 h-8">
                  {TIERS.map(t => {
                    const active = level >= t.minLevel;
                    const span = t.maxLevel - t.minLevel;
                    const startPercent = (t.minLevel / totalDisplayLevels) * 100;
                    const spanPercent = (span / totalDisplayLevels) * 100;
                    const centerPercent = startPercent + (spanPercent / 2); // Center of the segment
                    const c = tierColors[t.name];
                    return (
                      <div key={t.name} className="group absolute flex flex-col items-center" style={{ left: `${centerPercent}%`, transform: 'translateX(-50%)' }}>
                        <button
                          type="button"
                          className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-green-500/40 ${active ? 'border-white/40 text-white bg-white/10' : 'border-white/15 text-gray-400 bg-transparent'}`}
                          aria-label={`${t.name} tier ${active ? 'achieved' : 'locked'}`}
                        >
                          {t.name}
                        </button>
                        <div className={`text-[10px] mt-1 ${active ? 'text-neutral-300' : 'text-neutral-500'}`}>L{t.minLevel}-{t.maxLevel - 1}</div>
                        <div className="pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity absolute top-full mt-2 w-44 text-[11px] leading-snug text-neutral-200 bg-neutral-900/95 border border-white/10 rounded-md p-3 shadow-lg">
                          <div className="font-semibold mb-1 tracking-wide" style={{ color: c.text }}>{t.name} Tier</div>
                          <div>Levels {t.minLevel}–{t.maxLevel - 1}</div>
                          <div>{level < t.minLevel ? `Unlock in ${t.minLevel - level} lvl` : level >= t.maxLevel ? 'Completed span' : 'In progress'}</div>
                          {t.name !== 'Diamond' && (
                            <div>
                              Next tier at L{t.maxLevel}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-3 gap-4 text-xs">
                  <div className="bg-white/5 rounded-md p-3 flex flex-col gap-1">
                    <span className="text-gray-400">Current Tier</span>
                    <span className="text-white font-medium">{tierName}</span>
                  </div>
                  <div className="bg-white/5 rounded-md p-3 flex flex-col gap-1">
                    <span className="text-gray-400">Level</span>
                    <span className="text-white font-medium">{level}</span>
                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                      <div className="h-full bg-green-400" style={{ width: `${inLevelProgress * 100}%` }} />
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-md p-3 flex flex-col gap-1">
                    <span className="text-gray-400">Next Level</span>
                    <span className="text-white font-medium">{remainingToNextLevel} pts</span>
                    <span className="text-gray-500">to L{level + 1}</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Detailed Leaderboard */}
        <div className="mt-8">
          <h2 className="text-xl font-medium text-white mb-4 flex items-center gap-2">
            <Users className="w-6 h-6 text-green-400" />
            Community Leaderboard
          </h2>
          <div className="neo-card p-4">
            <div className="space-y-3">
              {rewardsData.leaderboard.map((entry) => {
                const userTier = computeTier(entry.level || 0);
                const tierColors: Record<string, {bg: string; border: string; text: string; badge: string}> = {
                  Bronze:  { bg: 'bg-amber-900/20', border: 'border-amber-700/30', text: 'text-amber-300', badge: 'bg-amber-900/30 text-amber-200 border-amber-700/40' },
                  Silver:  { bg: 'bg-gray-500/20', border: 'border-gray-400/30', text: 'text-gray-300', badge: 'bg-gray-600/30 text-gray-200 border-gray-500/40' },
                  Gold:    { bg: 'bg-yellow-500/20', border: 'border-yellow-400/30', text: 'text-yellow-300', badge: 'bg-yellow-600/30 text-yellow-200 border-yellow-500/40' },
                  Diamond: { bg: 'bg-cyan-500/20', border: 'border-cyan-400/30', text: 'text-cyan-300', badge: 'bg-cyan-600/30 text-cyan-200 border-cyan-500/40' }
                };
                const colors = tierColors[userTier] || tierColors.Bronze;
                
                return (
                  <div
                    key={entry.rank}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors border ${colors.bg} ${colors.border} ${
                      entry.isCurrentUser ? 'ring-2 ring-green-400/30' : 'hover:bg-opacity-80'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-base font-bold ${
                          entry.rank === 1
                            ? 'bg-yellow-500/30 text-yellow-300 border border-yellow-400/40'
                            : entry.rank === 2
                            ? 'bg-gray-500/30 text-gray-300 border border-gray-400/40'
                            : entry.rank === 3
                            ? 'bg-orange-500/30 text-orange-300 border border-orange-400/40'
                            : 'bg-gray-600/30 text-gray-300 border border-gray-500/40'
                        }`}
                      >
                        {entry.rank}
                      </div>
                      <div>
                        <p className="text-base font-medium text-white">{entry.name}</p>
                        <div className="flex gap-2 mt-1 items-center">
                          <Badge variant="outline" className={`text-xs border ${colors.badge}`}>{entry.badge}</Badge>
                          <span className={`text-[11px] font-medium ${colors.text}`}>L{entry.level} {userTier}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-base font-medium ${colors.text} flex flex-col items-end`}>
                      <span>Lvl {entry.level}</span>
                      <span className="text-xs text-gray-300">{(entry.lifetimePoints || entry.points).toLocaleString()} lp</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
