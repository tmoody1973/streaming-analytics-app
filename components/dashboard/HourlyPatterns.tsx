"use client";

import { useMemo } from "react";
import type { RadioMetrics } from "@/types";
import { calculateAverageCUME, calculateAverageTLH } from "@/lib/utils/radioMetrics";

interface HourlyPatternsProps {
  data: RadioMetrics[];
}

export default function HourlyPatterns({ data }: HourlyPatternsProps) {
  const hourlyData = useMemo(() => {
    // Filter data that has hour information
    const hourlyMetrics = data.filter((m) => m.hour !== undefined);

    if (hourlyMetrics.length === 0) return [];

    // Group by hour
    const hourMap = new Map<number, RadioMetrics[]>();

    hourlyMetrics.forEach((metric) => {
      const hour = metric.hour!;
      if (!hourMap.has(hour)) {
        hourMap.set(hour, []);
      }
      hourMap.get(hour)!.push(metric);
    });

    // Calculate averages for each hour
    const hourlyAverages = Array.from(hourMap.entries())
      .map(([hour, metrics]) => ({
        hour,
        avgCume: calculateAverageCUME(metrics.map((m) => m.cume)),
        avgTlh: calculateAverageTLH(metrics.map((m) => m.tlh)),
        count: metrics.length,
      }))
      .sort((a, b) => a.hour - b.hour);

    return hourlyAverages;
  }, [data]);

  const maxCume = useMemo(() => {
    return Math.max(...hourlyData.map((h) => h.avgCume), 0);
  }, [hourlyData]);

  const formatHour = (hour: number): string => {
    if (hour === 0) return "12 AM";
    if (hour === 12) return "12 PM";
    if (hour < 12) return `${hour} AM`;
    return `${hour - 12} PM`;
  };

  const getDaypartColor = (hour: number): string => {
    if (hour >= 6 && hour < 10) return "bg-radiomke-orange-500"; // Morning Drive
    if (hour >= 10 && hour < 15) return "bg-radiomke-blue-400"; // Midday
    if (hour >= 15 && hour < 19) return "bg-radiomke-orange-400"; // Afternoon Drive
    if (hour >= 19 && hour < 24) return "bg-radiomke-blue-300"; // Evening
    return "bg-radiomke-charcoal-400"; // Overnight
  };

  if (hourlyData.length === 0) {
    return (
      <div className="bg-radiomke-charcoal-600 rounded-lg p-6 border border-radiomke-charcoal-400/30">
        <h3 className="text-lg font-semibold text-radiomke-cream-500 mb-2">Hourly Listening Patterns</h3>
        <p className="text-sm text-radiomke-cream-600">No hourly data available. Upload hourly patterns CSV to see analysis.</p>
      </div>
    );
  }

  return (
    <div className="bg-radiomke-charcoal-600 rounded-lg p-6 border border-radiomke-charcoal-400/30">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-radiomke-cream-500 mb-1">Hourly Listening Patterns</h3>
        <p className="text-sm text-radiomke-cream-600">Average CUME by hour of day</p>
      </div>

      {/* Hour Chart */}
      <div className="space-y-2">
        {hourlyData.map((item) => (
          <div key={item.hour} className="flex items-center gap-3">
            <div className="w-16 text-xs text-radiomke-cream-600 text-right">
              {formatHour(item.hour)}
            </div>
            <div className="flex-1 bg-radiomke-charcoal-700 rounded-full h-8 relative overflow-hidden">
              <div
                className={`h-full ${getDaypartColor(item.hour)} transition-all duration-500 flex items-center justify-end pr-3`}
                style={{
                  width: `${(item.avgCume / maxCume) * 100}%`,
                }}
              >
                {item.avgCume > 0 && (
                  <span className="text-xs font-semibold text-radiomke-cream-500">
                    {item.avgCume.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
            <div className="w-20 text-xs text-radiomke-cream-600">
              {item.count} records
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-radiomke-charcoal-400/30">
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-radiomke-orange-500"></div>
            <span className="text-radiomke-cream-600">Morning Drive (6-10 AM)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-radiomke-blue-400"></div>
            <span className="text-radiomke-cream-600">Midday (10 AM-3 PM)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-radiomke-orange-400"></div>
            <span className="text-radiomke-cream-600">Afternoon Drive (3-7 PM)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-radiomke-blue-300"></div>
            <span className="text-radiomke-cream-600">Evening (7 PM-12 AM)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-radiomke-charcoal-400"></div>
            <span className="text-radiomke-cream-600">Overnight (12-6 AM)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
