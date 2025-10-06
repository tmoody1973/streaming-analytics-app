"use client";

import { useMemo } from "react";
import type { RadioMetrics } from "@/types";
import { calculateAverageCUME, calculateAverageTLH, calculateAverageTSL } from "@/lib/utils/radioMetrics";

interface KPISummaryProps {
  data: RadioMetrics[];
}

interface KPICard {
  label: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    direction: "up" | "down" | "neutral";
  };
  color: "orange" | "blue" | "cream";
}

export default function KPISummary({ data }: KPISummaryProps) {
  const kpis = useMemo(() => {
    if (data.length === 0) return null;

    const avgCume = calculateAverageCUME(data.map((m) => m.cume));
    const avgTlh = calculateAverageTLH(data.map((m) => m.tlh));
    const avgTsl = calculateAverageTSL(data.map((m) => m.tsl));
    const totalSessions = Math.round(data.reduce((sum, m) => sum + m.activeSessions, 0) / data.length);

    // Get unique stations
    const stations = new Set(data.filter((m) => m.station).map((m) => m.station));

    return {
      avgCume,
      avgTlh,
      avgTsl,
      totalSessions,
      stationCount: stations.size,
      dataPoints: data.length,
    };
  }, [data]);

  if (!kpis) {
    return null;
  }

  const cards: KPICard[] = [
    {
      label: "Avg CUME",
      value: kpis.avgCume.toLocaleString(),
      subtitle: "Unique Listeners (averaged)",
      color: "orange",
    },
    {
      label: "Avg TLH",
      value: kpis.avgTlh.toLocaleString(),
      subtitle: "Total Listening Hours",
      color: "blue",
    },
    {
      label: "Avg TSL",
      value: kpis.avgTsl.toFixed(2),
      subtitle: "Time Spent Listening (hours)",
      color: "blue",
    },
    {
      label: "Avg Sessions",
      value: kpis.totalSessions.toLocaleString(),
      subtitle: "Active Sessions",
      color: "cream",
    },
    {
      label: "Stations",
      value: kpis.stationCount,
      subtitle: `${kpis.dataPoints.toLocaleString()} data points`,
      color: "cream",
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case "orange":
        return {
          bg: "bg-radiomke-orange-500/10",
          border: "border-radiomke-orange-500/30",
          text: "text-radiomke-orange-400",
          label: "text-radiomke-orange-300",
        };
      case "blue":
        return {
          bg: "bg-radiomke-blue-500/10",
          border: "border-radiomke-blue-500/30",
          text: "text-radiomke-blue-400",
          label: "text-radiomke-blue-300",
        };
      default:
        return {
          bg: "bg-radiomke-charcoal-700",
          border: "border-radiomke-charcoal-400/30",
          text: "text-radiomke-cream-500",
          label: "text-radiomke-cream-600",
        };
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
      {cards.map((card) => {
        const colors = getColorClasses(card.color);
        return (
          <div
            key={card.label}
            className={`${colors.bg} border ${colors.border} rounded-lg p-4 transition-all hover:scale-105`}
          >
            <div className="flex items-start justify-between mb-2">
              <p className={`text-sm font-medium ${colors.label}`}>{card.label}</p>
            </div>
            <p className={`text-3xl font-bold ${colors.text} mb-1`}>{card.value}</p>
            {card.subtitle && (
              <p className="text-xs text-radiomke-cream-600">{card.subtitle}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
