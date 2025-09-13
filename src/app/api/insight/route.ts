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

// High-quality fallback suggestions for when API is rate limited
const fallbackSuggestions = [
  "I noticed you spent $350 on entertainment last month 🎉 That's $70 more than usual! If you saved half of that extra, you'd reach your laptop goal 1 month earlier 💻",
  "Great job keeping food costs steady around $420! 🍕 Try the 50/30/20 rule: redirect just $50 from shopping to your emergency fund and you'll hit your target 2 months sooner 💪",
  "Your entertainment spending peaked at $350 in August 🎊 Consider one 'stay-in' weekend per month and put that $80 toward your European vacation - you'll save an extra month! ✈️",
  "You're crushing it with consistent savings! 📈 I see you spent $280 extra on shopping in May. Channel that energy into your goals and you could boost your emergency fund by 40% 🎯",
  "Smart move keeping rent stable at $800! 🏠 Since your food spending varies ($380-$460), meal prep on Sundays could save $60/month - that's $720 extra for your laptop goal! 🥗💻",
  "I love that you're saving $650/month total! 💰 Your entertainment budget jumps around - try setting a $200 monthly limit and you'll reach your vacation goal 3 months faster! ✈️🎯"
];

export async function GET(request: Request) {
  // Check for force refresh parameter
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';
  
  // Generate chart data based on mock data (available throughout the function)
  const generateChartData = () => {
    // Pick a random goal for the chart
    const randomGoal = mockData.goals[Math.floor(Math.random() * mockData.goals.length)];
    // Generate a random suggested saving between $25-$100
    const suggestedSaving = 25 + Math.floor(Math.random() * 75);
    
    return {
      goalName: randomGoal.name,
      currentAmount: randomGoal.currentSaved,
      targetAmount: randomGoal.target,
      currentMonthlyContribution: randomGoal.monthlyContribution,
      suggestedSaving: suggestedSaving
    };
  };

  const chartData = generateChartData();

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
      console.warn('MARTIAN_API_KEY not configured, using fallback suggestion');
      const suggestion = fallbackSuggestions[Math.floor(Math.random() * fallbackSuggestions.length)];
      return NextResponse.json({ suggestion, chartData, source: 'no_api_key' });
    }

    if (!MARTIAN_API_KEY.startsWith('mk-') && !MARTIAN_API_KEY.startsWith('sk-')) {
      console.warn('MARTIAN_API_KEY appears to be invalid format, using fallback suggestion');
      const suggestion = fallbackSuggestions[Math.floor(Math.random() * fallbackSuggestions.length)];
      return NextResponse.json({ suggestion, chartData, source: 'invalid_api_key' });
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
      
      const suggestion = fallbackSuggestions[Math.floor(Math.random() * fallbackSuggestions.length)];
      
      // Cache the fallback suggestion for a shorter time
      insightCache = {
        suggestion,
        chartData,
        timestamp: Date.now()
      };
      
      return NextResponse.json({ suggestion, chartData, source: 'fallback_api_error' });
    }

    const data = await response.json();
    const suggestion = data.choices[0]?.message?.content || fallbackSuggestions[0];

    // Cache the successful response
    insightCache = {
      suggestion,
      chartData,
      timestamp: Date.now()
    };

    console.log('Successfully generated AI insight');
    return NextResponse.json({ suggestion, chartData });

  } catch (error) {
    console.error('Error calling Martian API:', error);
    
    // Use fallback suggestion on any error
    const suggestion = fallbackSuggestions[Math.floor(Math.random() * fallbackSuggestions.length)];
    
    // Cache the fallback suggestion
    insightCache = {
      suggestion,
      chartData,
      timestamp: Date.now()
    };
    
    return NextResponse.json({ 
      suggestion,
      chartData,
      source: 'fallback' // Optional: indicate this was a fallback response
    });
  }
}
