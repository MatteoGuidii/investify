"use client";

import { useAppStore } from "@/lib/store";
import { GOAL_CATALOGUE } from "@/lib/goals-data";
import { Goal } from "@/lib/types";
import { Button } from "./ui/button";

export function GoalCatalogue() {
  const { setSelectedGoal, setCurrentView, userGoals } = useAppStore();

  const handleSelectGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setCurrentView("setup");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "travel":
        return "✈️";
      case "education":
        return "🎓";
      case "tech":
        return "📱";
      case "car":
        return "🚗";
      case "home":
        return "🏠";
      case "experience":
        return "🎵";
      case "clothing":
        return "💰";
      default:
        return "🎯";
    }
  };

  const getCategoryLabel = (category: string) => {
    if (category === "experience") return "Musical Instrument";
    return category;
  };

  return (
    <div className="min-h-screen bg-neo-dark relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-neo-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-neo-accent/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-3/4 left-1/2 w-64 h-64 bg-green-400/5 rounded-full blur-2xl"></div>
      </div>

      <div className="relative z-10 px-6 py-8">
        {/* Existing Goals Banner */}
        {userGoals.length > 0 && (
          <div className="max-w-6xl mx-auto mb-6">
            <div className="neo-glass border-green-400/30 p-4 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-green-400/20 flex items-center justify-center">
                    <span className="text-lg">🎯</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">
                      You have {userGoals.length} active goal
                      {userGoals.length !== 1 ? "s" : ""}
                    </h3>
                    <p className="text-sm text-gray-300">
                      You can have multiple goals
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setCurrentView("dashboard")}
                  className="neo-button-secondary text-xs px-3 py-1.5"
                >
                  View Dashboard
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="max-w-6xl mx-auto text-center mb-8">
          <div className="neo-card p-6 mb-6 border-2 border-green-500 bg-green-800">
            <h1 className="text-3xl font-semibold mb-3 text-white">
              {userGoals.length > 0
                ? "Add Another Goal"
                : "Choose Your Financial Goal"}
            </h1>
            <p className="text-sm text-gray-400 max-w-2xl mx-auto">
              Select what matters most to you and let our AI create a
              personalized investment strategy
            </p>
          </div>
        </div>

        {/* Goals Grid */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GOAL_CATALOGUE.map((goal, index) => (
              <div
                key={goal.id}
                className="neo-card p-5 hover:translate-y-[-2px] hover:shadow-lg/30 transition-all duration-300 group cursor-pointer flex flex-col h-full border border-white/5"
                onClick={() => handleSelectGoal(goal)}
              >
                {/* Goal Image */}
                <div className="relative mb-4">
                  <div className="h-36 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-xl relative overflow-hidden neo-glass">
                    <img
                      src={goal.image}
                      alt={goal.title}
                      className="absolute inset-0 w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        // Fallback to icon if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        const parent = target.parentElement;
                        if (parent) {
                          const fallback = document.createElement("div");
                          fallback.className =
                            "absolute inset-0 flex items-center justify-center backdrop-blur-sm rounded-xl";
                          fallback.innerHTML = `<span class="text-4xl">${getCategoryIcon(goal.category)}</span>`;
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                    <div className="absolute inset-0 bg-black/20 rounded-xl"></div>

                    {/* Partner badge */}
                    <div className="absolute top-2 left-2 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-lg">
                      <span className="text-white font-medium text-xs">
                        {goal.partnerName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Content - flex-grow to push button to bottom */}
                <div className="flex flex-col flex-grow space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md text-[10px] tracking-wide uppercase bg-white/5 text-gray-300 border border-white/10">
                        {getCategoryLabel(goal.category)}
                      </span>
                    </div>
                    <h3 className="text-xl font-semibold text-white leading-snug">
                      {goal.title}
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed line-clamp-3">
                      {goal.description}
                    </p>
                  </div>

                  {/* Stats + CTA grouped for consistent bottom spacing */}
                  <div className="mt-auto">
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="neo-glass rounded-lg p-2.5 flex flex-col">
                        <span className="text-[10px] tracking-wide text-gray-400 uppercase">
                          Target
                        </span>
                        <span className="mt-1 text-sm font-semibold text-green-400 leading-none">
                          {formatCurrency(goal.finalPrice)}
                        </span>
                      </div>
                      <div className="neo-glass rounded-lg p-2.5 flex flex-col">
                        <span className="text-[10px] tracking-wide text-gray-400 uppercase">
                          From / mo
                        </span>
                        <span className="mt-1 text-sm font-medium text-white leading-none">
                          {formatCurrency(goal.minMonthlyInvestment)}
                        </span>
                      </div>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectGoal(goal);
                      }}
                      className="w-full neo-button text-xs font-medium group-hover:scale-[1.03] transition-transform py-3 h-10"
                    >
                      Select Goal
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
