// components/ui/ScoreTooltip.tsx

"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { scoreInsights, ScoreType } from "@/lib/score-insights";
import { Info } from "lucide-react";

interface ScoreTooltipProps {
  scoreType: ScoreType;
  scoreValue: number;
  children: React.ReactNode; // To wrap the score display element
}

export function ScoreTooltip({
  scoreType,
  scoreValue,
  children,
}: ScoreTooltipProps) {
  const config = scoreInsights[scoreType];

  // Find the appropriate insight level based on the score
  const insightLevel = [...config.levels]
    .reverse()
    .find((level) => scoreValue >= level.threshold);

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent className="max-w-xs p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-gray-500" />
              <h3 className="font-bold text-lg text-gray-800">{config.name}</h3>
            </div>
            <p className="text-sm text-gray-600">{config.description}</p>
            {insightLevel && (
              <div className="mt-2">
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${insightLevel.flagColor}`}
                  >
                    {insightLevel.flag}
                  </span>
                  <span className="font-semibold text-gray-700">
                    Score: {scoreValue.toFixed(2)}
                  </span>
                </div>
                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-md border border-gray-200">
                  {insightLevel.insight}
                </p>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}