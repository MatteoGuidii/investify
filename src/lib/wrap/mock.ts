import { EpicWrap, WrapTimeseriesPoint } from './types';

export function getMockWrap(): EpicWrap {
  // Generate timeline data - 26 weekly points showing steady growth
  const timeline: WrapTimeseriesPoint[] = [];
  const startDate = new Date('2025-01-07');
  const baseValue = 10250;
  
  for (let i = 0; i < 26; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + (i * 7)); // Weekly intervals
    
    // Simulate growth with some volatility
    const growthFactor = 1 + (i * 0.015) + (Math.sin(i * 0.5) * 0.02);
    const portfolioValue = Math.round(baseValue * growthFactor);
    
    timeline.push({
      date: date.toISOString().split('T')[0],
      portfolioValue
    });
  }

  return {
  periodLabel: "Your 2025 Wrapped",
    userFirstName: "Lenn",
    kpis: {
      totalInvested: 12450,
      totalSaved: 3200,
      savingStreakWeeks: 18,
      roboAdvisorReturnAbs: 1870,
      roboAdvisorReturnPct: 12.4,
      feesAvoided: 146,
      autoInvestSuccessRatePct: 92,
      bestMonth: { 
        month: "May", 
        netDeposits: 2100, 
        returnPct: 3.1 
      },
      topAsset: { 
        name: "Global Equity ETF", 
        returnPct: 17.8, 
        contributionAbs: 940 
      },
      diversificationScore: 78,
      riskLevel: "Balanced",
      goalsAchieved: 3,
      referralCount: 4
    },
    timeline,
    highlights: [
      "You kept an 18-week saving streak going.",
      "Your roboadvisor added 12.4% this period.",
      "You avoided €146 in fees by staying invested.",
      "Achieved 3 financial goals this year.",
      "Maintained a balanced 78% diversification score."
    ]
  };
}

// Static example for testing/development
export const MOCK_WRAP_EXAMPLE: EpicWrap = {
  "periodLabel": "Your 2025 Wrapped",
  "userFirstName": "Lenn",
  "kpis": {
    "totalInvested": 12450,
    "totalSaved": 3200,
    "savingStreakWeeks": 18,
    "roboAdvisorReturnAbs": 1870,
    "roboAdvisorReturnPct": 12.4,
    "feesAvoided": 146,
    "autoInvestSuccessRatePct": 92,
    "bestMonth": { "month": "May", "netDeposits": 2100, "returnPct": 3.1 },
    "topAsset": { "name": "Global Equity ETF", "returnPct": 17.8, "contributionAbs": 940 },
    "diversificationScore": 78,
    "riskLevel": "Balanced",
    "goalsAchieved": 3,
    "referralCount": 4
  },
  "timeline": [
    { "date": "2025-01-07", "portfolioValue": 10250 },
    { "date": "2025-02-04", "portfolioValue": 10640 },
    { "date": "2025-03-04", "portfolioValue": 10920 },
    { "date": "2025-04-01", "portfolioValue": 11310 },
    { "date": "2025-05-06", "portfolioValue": 11890 },
    { "date": "2025-06-03", "portfolioValue": 12150 },
    { "date": "2025-07-01", "portfolioValue": 12480 }
  ],
  "highlights": [
    "You kept an 18-week saving streak going.",
    "Your roboadvisor added 12.4% this period.",
    "You avoided €146 in fees by staying invested."
  ]
};
