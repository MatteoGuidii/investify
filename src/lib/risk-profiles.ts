export type RiskProfile = {
    name: 'Safe' | 'Growth' | 'Risky' | 'Savings';
    expectedReturn: number;
    volatility: number;
    meanAbsoluteDeviation: number;
    range: {
      lower: number;
      upper: number;
    };
  };
  
  export const RISK_PROFILES: RiskProfile[] = [
    {
      name: 'Safe',
      expectedReturn: 0.05,
      volatility: 0.06,
      meanAbsoluteDeviation: 0.0479,
      range: {
        lower: -0.01,
        upper: 0.11,
      },
    },
    {
      name: 'Growth',
      expectedReturn: 0.075,
      volatility: 0.11,
      meanAbsoluteDeviation: 0.0878,
      range: {
        lower: -0.035,
        upper: 0.185,
      },
    },
    {
      name: 'Risky',
      expectedReturn: 0.10,
      volatility: 0.17,
      meanAbsoluteDeviation: 0.1356,
      range: {
        lower: -0.07,
        upper: 0.27,
      },
    },
  ];