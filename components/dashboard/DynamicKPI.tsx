"use client";

import { useMemo } from "react";
import type { KPISpecification, RadioMetrics } from "@/types";

interface DynamicKPIProps {
  kpi: KPISpecification;
  data: RadioMetrics[];
}

export default function DynamicKPI({ kpi, data }: DynamicKPIProps) {
  const value = useMemo(() => {
    if (data.length === 0) return 0;

    const values = data
      .map((item) => (item as any)[kpi.metric])
      .filter((v) => v != null && !isNaN(v));

    if (values.length === 0) return 0;

    switch (kpi.calculation) {
      case "average":
        return values.reduce((sum, v) => sum + v, 0) / values.length;
      case "sum":
        return values.reduce((sum, v) => sum + v, 0);
      case "max":
        return Math.max(...values);
      case "min":
        return Math.min(...values);
      case "count":
        return values.length;
      default:
        return 0;
    }
  }, [data, kpi]);

  const formattedValue = useMemo(() => {
    switch (kpi.format) {
      case "currency":
        return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
      case "percentage":
        return `${value.toFixed(1)}%`;
      case "decimal":
        return value.toFixed(2);
      default:
        return value.toLocaleString(undefined, { maximumFractionDigits: 0 });
    }
  }, [value, kpi.format]);

  const getColorClasses = (color: string | undefined) => {
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

  const colors = getColorClasses(kpi.color);

  return (
    <div className={`${colors.bg} border ${colors.border} rounded-lg p-4 transition-all hover:scale-105`}>
      <p className={`text-sm font-medium ${colors.label} mb-2`}>{kpi.label}</p>
      <p className={`text-3xl font-bold ${colors.text}`}>{formattedValue}</p>
      <p className="text-xs text-radiomke-cream-600 mt-1 capitalize">
        {kpi.calculation} of {kpi.metric}
      </p>
    </div>
  );
}
