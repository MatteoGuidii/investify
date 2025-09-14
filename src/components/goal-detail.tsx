"use client";

import Image from 'next/image';
import { useAppStore } from '@/lib/store';
import { Button } from './ui/button';
import { ArrowLeft, Wallet, Plus, Trophy } from 'lucide-react';
import { useState, useMemo } from 'react';

export function GoalDetail() {
  const {
    userGoals,
    activeUserGoalId,
  setCurrentView,
  addOneTimeContribution,
  } = useAppStore();

  const goalInstance = useMemo(() => userGoals.find(g => g.id === activeUserGoalId), [userGoals, activeUserGoalId]);
  const [oneTimeAmount, setOneTimeAmount] = useState(100);
  // Recurring contribution removed per request
  const [showCongrats, setShowCongrats] = useState(false);
  const [congratsFired, setCongratsFired] = useState(false);

  if (!goalInstance) {
    return (
      <div className="p-6 text-center text-gray-400">
        <p>Goal not found.</p>
        <Button className="mt-4 neo-button" onClick={() => setCurrentView('dashboard')}>Back to Dashboard</Button>
      </div>
    );
  }

  const { goal } = goalInstance;
  const progressPercent = Math.min(100, goalInstance.progressPercent || (goalInstance.currentAmount / goalInstance.targetAmount) * 100);
  const remaining = Math.max(0, goalInstance.targetAmount - goalInstance.currentAmount);
  const remainingPercent = 100 - progressPercent;

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0 }).format(amount);

  const handleOneTimeAdd = () => {
    addOneTimeContribution(goalInstance.id, Math.round(oneTimeAmount));
  };

  // Recurring logic removed
  if (!congratsFired && progressPercent >= 100) {
    setTimeout(() => {
      setShowCongrats(true);
      setCongratsFired(true);
    }, 120);
  }

  return (
    <>
    <div className="min-h-screen bg-neo-dark relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -right-10 w-96 h-96 bg-green-500/5 blur-3xl rounded-full" />
        <div className="absolute bottom-0 -left-10 w-96 h-96 bg-blue-500/5 blur-3xl rounded-full" />
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-5 py-6">
        <div className="flex items-center gap-3 mb-6">
          <Button onClick={() => setCurrentView('dashboard')} className="neo-button-ghost p-2 h-8 w-8">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-lg font-medium text-white">{goal.title}</h1>
            <p className="text-xs text-gray-400">Goal Detail & Contributions</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="neo-card p-0 overflow-hidden">
              <div className="relative h-56 w-full">
                {goal.image ? (
                  <Image src={goal.image} alt={goal.title} fill className="object-cover" priority />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-5xl bg-gradient-to-br from-green-400/20 to-green-600/20">{goal.category}</div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-3 left-4">
                  <h2 className="text-white font-semibold text-xl">{goal.title}</h2>
                  <p className="text-green-300 text-sm font-medium">Target {formatCurrency(goalInstance.targetAmount)}</p>
                </div>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-gray-300 leading-relaxed">{goal.description}</p>
                <div className="space-y-2">
                  <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-green-400 to-green-500" style={{ width: `${progressPercent}%` }} />
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-green-400 font-medium">{Math.round(progressPercent)}% funded</span>
                    <span className="text-gray-400">{formatCurrency(Math.round(goalInstance.currentAmount))} / {formatCurrency(goalInstance.targetAmount)}</span>
                  </div>
                </div>
                {progressPercent < 100 && (
                  <p className="text-xs text-gray-400">{formatCurrency(remaining)} remaining ({Math.round(remainingPercent)}%)</p>
                )}
              </div>
            </div>

            <div className="neo-card p-5">
              <h3 className="text-sm font-medium text-white mb-4">Risk & Strategy</h3>
              <div className="text-xs text-gray-300 space-y-2">
                <p><span className="text-gray-400">Recommended Strategy:</span> <span className="text-green-400 font-medium">{goal.recommendedStrategy}</span></p>
                <p><span className="text-gray-400">Estimated Months:</span> {goal.estimatedMonths}</p>
                <p className="text-gray-400">This section can later include simulated variance, downside scenarios, and suggestion to rebalance.</p>
              </div>
            </div>

          </div>
          <div className="lg:col-span-2 space-y-6">
            <div className="neo-card p-5 sticky top-24">
              <h3 className="text-sm font-medium text-white mb-4 flex items-center gap-2"><Wallet className="w-4 h-4 text-green-400" /> Contribution</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Add money</p>
                  <div className="flex items-center gap-2">
                    <input type="number" step={1} value={oneTimeAmount} onChange={e => setOneTimeAmount(Math.max(0, Math.round(Number(e.target.value))))} className="bg-black/30 border border-white/10 rounded px-2 py-1 text-sm w-28 text-white" />
                    <Button disabled={oneTimeAmount <= 0} onClick={handleOneTimeAdd} className="neo-button h-8 px-3 text-xs"><Plus className="w-3 h-3 mr-1" /> Add</Button>
                  </div>
                </div>
                <div className="text-[10px] text-gray-500">Monthly plan: {formatCurrency(Math.round(goalInstance.monthlyContribution))} / mo</div>
                <div className="text-[10px] text-gray-500">Remaining: {formatCurrency(remaining)}</div>
              </div>
            </div>
            <div className="neo-card p-5">
              <h3 className="text-sm font-medium text-white mb-3">Milestones</h3>
              <div className="space-y-2 max-h-72 overflow-auto pr-1">
                {goalInstance.milestones.map(m => {
                  const achieved = m.achieved || progressPercent >= m.targetPercent;
                  return (
                    <div key={m.id} className="p-2.5 rounded-lg border bg-black/20 border-white/10">
                      <div className="flex justify-between items-center mb-0.5">
                        <p className="text-white font-medium text-xs">{m.title}</p>
                        {achieved ? (
                          <span className="px-2 py-0.5 rounded-full bg-green-500/20 border border-green-400/30 text-green-300 text-[10px]">Achieved</span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-gray-300 text-[10px]">Not yet</span>
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400">{m.targetPercent}% • {formatCurrency(m.targetAmount)}</p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
    {showCongrats && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowCongrats(false)} />
        <div className="relative z-10 w-full max-w-sm neo-card p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-green-500/20 border border-green-400/30 flex items-center justify-center">
            <Trophy className="w-7 h-7 text-green-400" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">Congratulations!</h2>
          <p className="text-sm text-gray-300 mb-4">You fully funded <span className="text-green-400 font-medium">{goal.title}</span>. Great work staying consistent.</p>
          <div className="flex gap-2 justify-center">
            <Button className="neo-button-secondary h-8 px-4 text-xs" onClick={() => setShowCongrats(false)}>Close</Button>
            <Button className="neo-button h-8 px-4 text-xs" onClick={() => { setShowCongrats(false); setCurrentView('dashboard'); }}>Dashboard</Button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
