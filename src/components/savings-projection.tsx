'use client';

interface SavingsProjectionProps {
  goalName: string;
  currentAmount: number;
  targetAmount: number;
  currentMonthlyContribution: number;
  suggestedSaving: number;
  className?: string;
}

export function SavingsProjection({ 
  goalName, 
  currentAmount, 
  targetAmount, 
  currentMonthlyContribution, 
  suggestedSaving,
  className = ''
}: SavingsProjectionProps) {
  
  const remaining = targetAmount - currentAmount;
  const currentMonthsToGoal = Math.ceil(remaining / currentMonthlyContribution);
  const improvedMonthlyContribution = currentMonthlyContribution + suggestedSaving;
  const improvedMonthsToGoal = Math.ceil(remaining / improvedMonthlyContribution);
  const monthsSaved = currentMonthsToGoal - improvedMonthsToGoal;

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-xl p-5 border border-gray-200/50 shadow-lg w-full max-w-md ${className}`}>
      
      {/* Header - Clean and Simple */}
      <div className="mb-4">
        <h4 className="font-semibold text-lg text-gray-900 mb-1">{goalName}</h4>
        <p className="text-gray-600">${currentAmount.toLocaleString()} of ${targetAmount.toLocaleString()}</p>
      </div>

      {/* Progress - Single Visual */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-3xl font-bold text-gray-900">
            {Math.round((currentAmount / targetAmount) * 100)}%
          </span>
          <span className="text-sm text-gray-600">complete</span>
        </div>
        
        {/* Unified Progress Bar */}
        <div className="relative h-6 bg-gray-100 rounded-full overflow-hidden mb-2">
          {/* Current progress */}
          <div 
            className="absolute top-0 left-0 h-full bg-red-500 rounded-full transition-all duration-1000"
            style={{ width: `${(currentAmount / targetAmount) * 100}%` }}
          />
          {/* Potential progress overlay */}
          <div 
            className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-1000 delay-500 opacity-40"
            style={{ width: `${(Math.min(currentAmount + (suggestedSaving * 6), targetAmount) / targetAmount) * 100}%` }}
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-500">
          <span>Current pace</span>
          <span>With +${suggestedSaving}/month</span>
        </div>
      </div>

      {/* Timeline Comparison - Direct and Clear */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="text-center">
          <div className="flex items-center justify-center gap-6 mb-4">
            <div>
              <div className="text-2xl font-bold text-red-600">{currentMonthsToGoal}</div>
              <div className="text-sm text-gray-600">months</div>
            </div>
            
            <div className="text-xl text-gray-400 font-light">→</div>
            
            <div>
              <div className="text-2xl font-bold text-blue-600">{improvedMonthsToGoal}</div>
              <div className="text-sm text-gray-600">months</div>
            </div>
          </div>
          
          {/* Clear Benefit */}
          {monthsSaved > 0 && (
            <div className="bg-green-100 rounded-lg p-3 border border-green-200">
              <div className="text-lg font-bold text-green-800 mb-1">
                Save {monthsSaved} month{monthsSaved !== 1 ? 's' : ''}
              </div>
              <div className="text-sm text-green-700">
                Add just ${suggestedSaving}/month
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
