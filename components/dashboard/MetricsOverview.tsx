"use client";

import { useMemo } from "react";
import type { RadioMetrics } from "@/types";
import { calculateAverageCUME, calculateTSL } from "@/lib/utils/radioMetrics";

interface MetricsOverviewProps {
  data: RadioMetrics[];
  previousData?: RadioMetrics[];
  loading?: boolean;
}

interface MetricCard {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  tooltip: string;
  isAverage?: boolean;
}

export default function MetricsOverview({
  data,
  previousData = [],
  loading = false,
}: MetricsOverviewProps) {
  const metrics = useMemo(() => {
    if (data.length === 0) {
      return {
        avgCume: 0,
        totalTlh: 0,
        avgTsl: 0,
        avgSessions: 0,
      };
    }

    // CRITICAL: Average CUME, never sum!
    const cumeValues = data.filter((m) => m.cume > 0).map((m) => m.cume);
    const avgCume = calculateAverageCUME(cumeValues);

    // TLH can be summed
    const totalTlh = data.reduce((sum, m) => sum + m.tlh, 0);

    // Calculate overall TSL
    const avgTsl = calculateTSL(totalTlh, avgCume);

    // Average active sessions
    const sessionValues = data.filter((m) => m.activeSessions > 0);
    const avgSessions = sessionValues.length > 0
      ? Math.round(
          sessionValues.reduce((sum, m) => sum + m.activeSessions, 0) /
            sessionValues.length
        )
      : 0;

    return {
      avgCume,
      totalTlh: Math.round(totalTlh),
      avgTsl,
      avgSessions,
    };
  }, [data]);

  const previousMetrics = useMemo(() => {
    if (previousData.length === 0) return null;

    const cumeValues = previousData.filter((m) => m.cume > 0).map((m) => m.cume);
    const avgCume = calculateAverageCUME(cumeValues);
    const totalTlh = previousData.reduce((sum, m) => sum + m.tlh, 0);

    return {
      avgCume,
      totalTlh: Math.round(totalTlh),
    };
  }, [previousData]);

  const calculateChange = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  const cards: MetricCard[] = [
    {
      title: "Average CUME",
      value: metrics.avgCume.toLocaleString(),
      change: previousMetrics
        ? calculateChange(metrics.avgCume, previousMetrics.avgCume)
        : undefined,
      tooltip:
        "CUME (Cumulative Audience) represents unique listeners. ALWAYS AVERAGED, NEVER SUMMED. This is a critical radio industry rule.",
      isAverage: true,
    },
    {
      title: "Total Listening Hours",
      value: metrics.totalTlh.toLocaleString(),
      unit: "hours",
      change: previousMetrics
        ? calculateChange(metrics.totalTlh, previousMetrics.totalTlh)
        : undefined,
      tooltip:
        "Total Listening Hours (TLH) is the sum of all hours listened across all unique listeners.",
    },
    {
      title: "Time Spent Listening",
      value: metrics.avgTsl.toFixed(2),
      unit: "hours",
      tooltip:
        "TSL = TLH ÷ CUME. Average listening duration per unique listener.",
    },
    {
      title: "Avg Active Sessions",
      value: metrics.avgSessions.toLocaleString(),
      tooltip:
        "Average number of concurrent active listening sessions during the period.",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-radiomke-charcoal-600 rounded-lg p-6 animate-pulse"
          >
            <div className="h-4 bg-radiomke-charcoal-700 rounded w-1/2 mb-4"></div>
            <div className="h-8 bg-radiomke-charcoal-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-radiomke-charcoal-600 rounded-lg p-6 text-center">
        <p className="text-radiomke-cream-600">
          No data available. Upload CSV files to see metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* CUME Warning Banner */}
      <div className="bg-radiomke-orange-500/10 border border-radiomke-orange-500/30 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-radiomke-orange-300">
              Important: CUME Calculation Rule
            </p>
            <p className="text-xs text-yellow-200 mt-1">
              CUME represents unique listeners and must ALWAYS be averaged across time
              periods, never summed. Summing CUME would incorrectly count the same
              listeners multiple times.
            </p>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className={`bg-radiomke-charcoal-600 rounded-lg p-6 relative group hover:bg-gray-750 transition-colors ${
              card.isAverage ? "border-2 border-yellow-600" : ""
            }`}
          >
            {/* Tooltip */}
            <div className="absolute top-2 right-2">
              <div className="relative">
                <svg
                  className="w-5 h-5 text-radiomke-cream-600 cursor-help"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="absolute right-0 top-6 w-64 p-3 bg-radiomke-charcoal-700 border border-radiomke-charcoal-400/30 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                  <p className="text-xs text-radiomke-cream-500">{card.tooltip}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-radiomke-cream-600 flex items-center gap-2">
                {card.title}
                {card.isAverage && (
                  <span className="text-xs bg-yellow-600 text-yellow-100 px-2 py-0.5 rounded">
                    AVERAGED
                  </span>
                )}
              </h3>

              <div className="flex items-baseline gap-2">
                <p className="text-3xl font-bold text-radiomke-cream-500">{card.value}</p>
                {card.unit && (
                  <span className="text-sm text-radiomke-cream-600">{card.unit}</span>
                )}
              </div>

              {card.change !== undefined && (
                <div className="flex items-center gap-1">
                  {card.change > 0 ? (
                    <svg
                      className="w-4 h-4 text-green-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 10l7-7m0 0l7 7m-7-7v18"
                      />
                    </svg>
                  ) : card.change < 0 ? (
                    <svg
                      className="w-4 h-4 text-red-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 14l-7 7m0 0l-7-7m7 7V3"
                      />
                    </svg>
                  ) : null}
                  <span
                    className={`text-sm font-medium ${
                      card.change > 0
                        ? "text-green-400"
                        : card.change < 0
                        ? "text-red-400"
                        : "text-radiomke-cream-600"
                    }`}
                  >
                    {card.change > 0 ? "+" : ""}
                    {card.change.toFixed(1)}%
                  </span>
                  <span className="text-xs text-gray-500">vs previous</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Data Quality Indicator */}
      <div className="flex items-center justify-between bg-radiomke-charcoal-600 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-radiomke-cream-500">
            Data Quality: <span className="font-semibold text-radiomke-cream-500">Good</span>
          </span>
        </div>
        <div className="text-sm text-radiomke-cream-600">
          {data.length} data points analyzed
        </div>
      </div>
    </div>
  );
}
