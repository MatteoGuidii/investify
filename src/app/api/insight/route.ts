import { NextResponse } from 'next/server';
import mockDataJson from '@/data/mockData.json';
import type { MockData, MockGoal } from '@/types/mockData';

// Cast the imported JSON to the proper TypeScript interface
const mockData = mockDataJson as MockData;

// Cache for storing insights to avoid hitting rate limits
interface CacheEntry {
  suggestion: string;
  chartData: {
    goalName: string;
    currentAmount: number;
    targetAmount: number;
    currentMonthlyContribution: number;
    suggestedSaving: number;
  } | null;
  timestamp: number;
}

let insightCache: CacheEntry | null = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Deterministic local insight generator so suggestions always relate to mock data.
 * This is used when no API key is present OR remote model fails. It analyzes:
 *  - Category with largest recent increase (last 3 months vs prior 3)
 *  - Goal that would benefit most from acceleration (largest months remaining)
 *  - Computes an extra monthly contribution that saves at least 1 month if possible
 */
interface LocalInsightResult {
  suggestion: string;
  chartData: CacheEntry['chartData'];
  metrics: {
    trendCategory: string;
    avgRecent: number;
    avgPrev: number;
    increase: number;
    goalName: string;
    currentMonths: number;
    newMonths: number;
    monthsSaved: number;
    extra: number;
  } | null;
}

function computeLocalInsight(data: MockData, focusGoal?: string): LocalInsightResult {
  const monthKeys = Object.keys(data.spending);
  if (monthKeys.length === 0) {
    return {
      suggestion: 'Add a small extra amount to any goal each month to reach it sooner.',
      chartData: null,
      metrics: null
    };
  }

  // Parse month names like "September 2024" into Date objects for sorting
  const parsed = monthKeys.map(k => ({
    key: k,
    date: new Date(k.replace(/(January|February|March|April|May|June|July|August|September|October|November|December)/, '$& 1,'))
  }));
  parsed.sort((a,b) => a.date.getTime() - b.date.getTime());
  const orderedKeys = parsed.map(p => p.key);

  // Take last 6 months if available
  const lastSixKeys = orderedKeys.slice(-6);
  const lastThree = lastSixKeys.slice(-3);
  const prevThree = lastSixKeys.slice(0, Math.max(0, lastSixKeys.length - 3));

  // Aggregate category averages
  interface CatStats { avgRecent: number; avgPrev: number; delta: number; }
  const categoryMap: Record<string, CatStats> = {};

  function accumulate(keys: string[], field: 'recent' | 'prev') {
    keys.forEach(m => {
      const spend = data.spending[m];
      if (!spend) return;
      Object.entries(spend).forEach(([cat, amt]) => {
        const amountNum = typeof amt === 'number' ? amt : Number(amt) || 0;
        if (!categoryMap[cat]) {
          categoryMap[cat] = { avgRecent: 0, avgPrev: 0, delta: 0 };
        }
        if (field === 'recent') categoryMap[cat].avgRecent += amountNum;
        else categoryMap[cat].avgPrev += amountNum;
      });
    });
  }

  accumulate(lastThree, 'recent');
  accumulate(prevThree, 'prev');
  const recentDiv = lastThree.length || 1;
  const prevDiv = prevThree.length || 1;
  Object.values(categoryMap).forEach(stat => {
    stat.avgRecent = stat.avgRecent / recentDiv;
    stat.avgPrev = stat.avgPrev / prevDiv;
    stat.delta = stat.avgRecent - stat.avgPrev;
  });

  // Identify category with largest positive increase (ignore fixed categories like rent & utilities)
  const EXCLUDE = new Set(['rent', 'utilities']);
  let risingCategory: { name: string; stat: CatStats } | null = null;
  for (const [cat, stat] of Object.entries(categoryMap)) {
    if (EXCLUDE.has(cat)) continue;
    if (!risingCategory || stat.delta > risingCategory.stat.delta) {
      risingCategory = { name: cat, stat };
    }
  }
  if (!risingCategory) {
    // fallback to highest spend most recent month
    const latestMonth = orderedKeys[orderedKeys.length - 1];
    const spends = data.spending[latestMonth];
    if (spends) {
      const topEntry = Object.entries(spends).sort((a,b) => b[1]-a[1])[0];
      if (topEntry) {
        const [tCat, tVal] = topEntry;
        risingCategory = { name: tCat, stat: { avgRecent: tVal, avgPrev: tVal, delta: 0 } };
      }
    }
  }

  // Select goal: if focusGoal param provided (substring match), else pick a random incomplete goal
  let goal: MockGoal | undefined;
  const incompleteGoals = data.goals.filter(g => g.currentSaved < g.target);
  if (focusGoal) {
    const norm = focusGoal.toLowerCase().trim();
    goal = incompleteGoals.find(g => g.name.toLowerCase().includes(norm));
  }
  if (!goal) {
    if (incompleteGoals.length > 0) {
      goal = incompleteGoals[Math.floor(Math.random() * incompleteGoals.length)];
    } else {
      goal = data.goals[0];
    }
  }
  const remaining = goal.target - goal.currentSaved;
  const currentMonths = Math.ceil(remaining / goal.monthlyContribution);

  // Random suggested extra within a range influenced by category delta
  const baseDelta = Math.max(0, risingCategory ? risingCategory.stat.delta : 0);
  const minExtra = 15;
  const maxExtra = 100;
  let extra = Math.round((Math.random() * (maxExtra - minExtra) + minExtra) / 5) * 5; // nearest 5
  // If there is a noticeable increase, bias extra upward a bit
  if (baseDelta > 0) {
    const bias = Math.min(40, Math.round(baseDelta / 3));
    extra = Math.min(maxExtra, extra + Math.round(bias / 5) * 5);
  }
  if (extra < 15) extra = 15;

  // Increase extra until at least 1 month saved or cap
  let monthsSaved = 0;
  let newMonths = currentMonths;
  for (let candidate = extra; candidate <= 200; candidate += 5) {
    const m = Math.ceil(remaining / (goal.monthlyContribution + candidate));
    if (m < currentMonths) {
      extra = candidate;
      newMonths = m;
      monthsSaved = currentMonths - m;
      break;
    }
  }

  // If still no saving, keep current values (monthsSaved 0)
  const catName = risingCategory ? risingCategory.name : 'spending';
  const deltaRounded = Math.round(risingCategory ? risingCategory.stat.delta : 0);
  const avgRecentRounded = Math.round(risingCategory ? risingCategory.stat.avgRecent : 0);

  // Build plain text (no emoji) suggestion parts

  let suggestion: string;
  if (deltaRounded > 0) {
    suggestion = `Recent spend: ${catName} avg $${avgRecentRounded} (+$${deltaRounded}). Try adding $${extra}/mo to ${goal.name} to move from ${currentMonths} → ${newMonths} months (${monthsSaved} saved).`;
  } else {
    suggestion = `${catName} steady near $${avgRecentRounded}. Add $${extra}/mo to ${goal.name} to shift ${currentMonths} → ${newMonths} months (${monthsSaved} saved).`;
  }

  return {
    suggestion,
    chartData: {
      goalName: goal.name,
      currentAmount: goal.currentSaved,
      targetAmount: goal.target,
      currentMonthlyContribution: goal.monthlyContribution,
      suggestedSaving: extra
    },
    metrics: {
      trendCategory: catName,
      avgRecent: avgRecentRounded,
      avgPrev: Math.round(avgRecentRounded - deltaRounded),
      increase: deltaRounded,
      goalName: goal.name,
      currentMonths,
      newMonths,
      monthsSaved,
      extra
    }
  };
}

export async function GET(request: Request) {
  // Check for force refresh parameter
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';
  
  // (Removed random chart generation; now derived from deterministic local insight)

  const goalParam = searchParams.get('goal') || undefined;
  // Pre-compute local insight (deterministic) for use as primary or fallback
  const localInsight = computeLocalInsight(mockData, goalParam);
  const chartData = localInsight.chartData; // remove randomness

  try {
    // Check if we have a valid cached response (skip if force refresh)
    if (!forceRefresh && insightCache && (Date.now() - insightCache.timestamp) < CACHE_DURATION) {
      console.log('Returning cached insight');
      return NextResponse.json({ 
        suggestion: insightCache.suggestion,
        chartData: insightCache.chartData 
      });
    }

    const MARTIAN_API_KEY = process.env.MARTIAN_API_KEY;
    
    if (!MARTIAN_API_KEY) {
      console.warn('MARTIAN_API_KEY not configured, using local deterministic insight');
  return NextResponse.json({ suggestion: localInsight.suggestion, chartData: localInsight.chartData, metrics: localInsight.metrics, source: 'local_model' });
    }

    if (!MARTIAN_API_KEY.startsWith('mk-') && !MARTIAN_API_KEY.startsWith('sk-')) {
      console.warn('MARTIAN_API_KEY appears to be invalid format, using local deterministic insight');
  return NextResponse.json({ suggestion: localInsight.suggestion, chartData: localInsight.chartData, metrics: localInsight.metrics, source: 'local_model_invalid_key' });
    }

    const prompt = `You are a friendly financial coach for a student named ${mockData.profile.name}.

Here is their spending and savings data from the last 6 months:

SPENDING BREAKDOWN:
${Object.entries(mockData.spending).map(([month, expenses]) => 
  `${month}: ${Object.entries(expenses as Record<string, number>).map(([category, amount]) => `${category}: $${amount}`).join(', ')}`
).join('\n')}

SAVINGS GOALS:
${mockData.goals.map((goal: MockGoal) => 
  `• ${goal.name}: $${goal.currentSaved}/$${goal.target} saved (contributing $${goal.monthlyContribution}/month)`
).join('\n')}

Monthly Income: $${mockData.monthlyIncome}

Tasks:
- Analyze their spending patterns and identify ONE clear trend
- Suggest ONE specific, actionable step to help them reach their goals faster
- Keep it short (1-2 sentences max), positive, and student-friendly
- Use emojis to make it engaging
- Focus on realistic savings they can achieve

Example format: "I noticed [trend] 📊 [Specific action] and you'll [specific benefit] 🎯"`;

    console.log('Attempting to call Martian API...');
    console.log('API URL:', 'https://api.withmartian.com/v1/openai/chat/completions');
    console.log('Model:', 'gpt-4o-mini');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch('https://api.withmartian.com/v1/openai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MARTIAN_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // Using mini model to reduce rate limits
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('Martian API response status:', response.status);
    console.log('Martian API response headers:', Object.fromEntries(response.headers.entries()));

  if (!response.ok) {
      if (response.status === 429) {
        console.warn('Rate limited by Martian API, using fallback suggestion');
      } else if (response.status === 404) {
        console.warn('Martian API endpoint not found (404), using fallback suggestion');
      } else if (response.status >= 500) {
        console.warn(`Martian API server error (${response.status}), using fallback suggestion`);
      } else {
        console.warn(`Martian API error (${response.status}), using fallback suggestion`);
      }
      
      // Use local deterministic insight instead of random fallback
      insightCache = {
        suggestion: localInsight.suggestion,
        chartData: localInsight.chartData,
        timestamp: Date.now()
      };
  return NextResponse.json({ suggestion: localInsight.suggestion, chartData: localInsight.chartData, metrics: localInsight.metrics, source: 'local_model_api_error' });
    }

  const data = await response.json();
  const remoteRaw = data.choices?.[0]?.message?.content?.trim();
  // Strip emojis and excessive whitespace
  const withoutEmoji = remoteRaw ? remoteRaw.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, '').replace(/\s+/g,' ').trim() : '';
  const suggestion = withoutEmoji && withoutEmoji.length > 0 ? withoutEmoji : localInsight.suggestion;

    // Cache the successful response
    insightCache = {
      suggestion,
      chartData,
      timestamp: Date.now()
    };

    console.log('Successfully generated AI insight');
  return NextResponse.json({ suggestion, chartData, metrics: localInsight.metrics });

  } catch (error) {
    console.error('Error calling Martian API:', error);
    insightCache = {
      suggestion: localInsight.suggestion,
      chartData: localInsight.chartData,
      timestamp: Date.now()
    };
    return NextResponse.json({ 
      suggestion: localInsight.suggestion,
      chartData: localInsight.chartData,
      metrics: localInsight.metrics,
      source: 'local_model_error' 
    });
  }
}

// POST: accept dynamic goal + optional spending override
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const { goal, goals, spending, mode } = body as {
      goal?: { name: string; currentAmount: number; targetAmount: number; monthlyContribution: number };
      goals?: Array<{ name: string; currentAmount: number; targetAmount: number; monthlyContribution: number }>;
      spending?: MockData['spending'];
      mode?: 'optimized' | 'random';
    };

    // Branch 1: multiple goals (preferred when user has active goals)
    if (goals && Array.isArray(goals) && goals.length > 0) {
      const syntheticMulti: MockData = {
        spending: spending || mockData.spending, // still derive trends from mock spending (requirement)
        goals: goals.map(g => ({
          name: g.name,
          target: g.targetAmount,
            currentSaved: g.currentAmount,
            monthlyContribution: g.monthlyContribution,
            category: 'custom',
            deadline: ''
        })),
        monthlyIncome: mockData.monthlyIncome,
        profile: mockData.profile
      };
      const insight = computeLocalInsight(syntheticMulti);
      return NextResponse.json({ suggestion: insight.suggestion, chartData: insight.chartData, metrics: insight.metrics, source: 'dynamic_goals' });
    }

    // Branch 2: single goal (legacy usage)
    if (!goal) {
      return NextResponse.json({ error: 'goal object required (or goals array)' }, { status: 400 });
    }

    // Build a temporary data object using provided spending override or fallback to mockData spending
    const synthetic: MockData = {
      spending: spending || mockData.spending,
      goals: [
        {
          name: goal.name,
          target: goal.targetAmount,
          currentSaved: goal.currentAmount,
          monthlyContribution: goal.monthlyContribution,
          category: 'custom',
          deadline: ''
        }
      ],
      monthlyIncome: mockData.monthlyIncome,
      profile: mockData.profile
    };

    // Reuse computation (focusGoal = provided goal name)
    const insight = computeLocalInsight(synthetic, goal.name);

    // Adjust extra based on mode if requested
    if (insight.chartData && insight.metrics) {
      const { currentMonths, monthsSaved, extra } = insight.metrics;
      if (mode === 'optimized' && monthsSaved === 0) {
        // escalate extra up to 200 trying to save a month
        const remaining = insight.chartData.targetAmount - insight.chartData.currentAmount;
        for (let candidate = extra + 5; candidate <= 200; candidate += 5) {
          const m = Math.ceil(remaining / (insight.chartData.currentMonthlyContribution + candidate));
          if (m < currentMonths) {
            insight.chartData.suggestedSaving = candidate;
            insight.metrics.extra = candidate;
            insight.metrics.newMonths = m;
            insight.metrics.monthsSaved = currentMonths - m;
            insight.suggestion = insight.suggestion.replace(/\b(\d+) → (\d+) months.*$/,'') + ` ${currentMonths} → ${m} months (${currentMonths - m} saved).`;
            break;
          }
        }
      } else if (mode === 'random') {
        // regenerate a random extra (15-100) and recompute months
        const remaining = insight.chartData.targetAmount - insight.chartData.currentAmount;
        const rand = Math.round((Math.random() * (100 - 15) + 15) / 5) * 5;
        const m = Math.ceil(remaining / (insight.chartData.currentMonthlyContribution + rand));
        insight.chartData.suggestedSaving = rand;
        insight.metrics.extra = rand;
        insight.metrics.newMonths = m;
        insight.metrics.monthsSaved = currentMonths - m;
        insight.suggestion = `With an added $${rand}/mo to ${goal.name} you move from ${currentMonths} to ${m} months (${currentMonths - m} saved).`;
      }
    }

    return NextResponse.json({ suggestion: insight.suggestion, chartData: insight.chartData, metrics: insight.metrics, source: 'dynamic_goal' });
  } catch {
    return NextResponse.json({ error: 'Failed to process insight' }, { status: 500 });
  }
}
