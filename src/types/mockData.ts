export interface MockSpendingData {
  [month: string]: {
    [category: string]: number;
  };
}

export interface MockGoal {
  name: string;
  target: number;
  currentSaved: number;
  monthlyContribution: number;
  category: string;
  deadline: string;
}

export interface MockProfile {
  name: string;
  age: number;
  status: string;
}

export interface MockData {
  spending: MockSpendingData;
  goals: MockGoal[];
  monthlyIncome: number;
  profile: MockProfile;
}
