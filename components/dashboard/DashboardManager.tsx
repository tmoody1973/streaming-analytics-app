"use client";

import { useState, useMemo } from "react";
import type { DashboardConfiguration, RadioMetrics } from "@/types";
import DynamicChart from "./DynamicChart";
import DynamicKPI from "./DynamicKPI";
import DynamicFilter from "./DynamicFilter";

interface DashboardManagerProps {
  dashboard: DashboardConfiguration;
  data: RadioMetrics[];
}

export default function DashboardManager({ dashboard, data }: DashboardManagerProps) {
  const [activeFilters, setActiveFilters] = useState<Record<string, any>>({});

  // Apply filters to data
  const filteredData = useMemo(() => {
    let filtered = [...data];

    Object.entries(activeFilters).forEach(([field, value]) => {
      if (value === "all" || !value) return;

      if (field === "date" && value.start && value.end) {
        filtered = filtered.filter((item) => {
          const itemDate = new Date(item.date);
          return itemDate >= value.start && itemDate <= value.end;
        });
      } else if (Array.isArray(value)) {
        filtered = filtered.filter((item) => value.includes((item as any)[field]));
      } else {
        filtered = filtered.filter((item) => (item as any)[field] === value);
      }
    });

    return filtered;
  }, [data, activeFilters]);

  const handleFilterChange = (filterId: string, field: string, value: any) => {
    setActiveFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="bg-radiomke-charcoal-600 rounded-lg p-6 border border-radiomke-charcoal-400/30">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-radiomke-cream-500">{dashboard.name}</h2>
            <p className="text-sm text-radiomke-cream-600 mt-1">
              {dashboard.csvFileName} • {filteredData.length.toLocaleString()} records
            </p>
            {dashboard.generatedByAI && (
              <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-radiomke-orange-500/10 border border-radiomke-orange-500/30">
                <svg className="w-4 h-4 text-radiomke-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z" />
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span className="text-xs font-medium text-radiomke-orange-400">AI Generated</span>
              </div>
            )}
          </div>
        </div>

        {/* AI Insights */}
        {dashboard.aiInsights && dashboard.aiInsights.length > 0 && (
          <div className="mt-4 bg-radiomke-blue-500/10 border border-radiomke-blue-500/30 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-radiomke-blue-300 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              AI Insights
            </h3>
            <ul className="space-y-1">
              {dashboard.aiInsights.map((insight, idx) => (
                <li key={idx} className="text-sm text-radiomke-blue-200 flex items-start gap-2">
                  <span className="text-radiomke-blue-400 mt-0.5">•</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Filters */}
      {dashboard.filters && dashboard.filters.length > 0 && (
        <div className="bg-radiomke-charcoal-600 rounded-lg p-4 border border-radiomke-charcoal-400/30">
          <div className="flex flex-wrap gap-4">
            {dashboard.filters.map((filter) => (
              <DynamicFilter
                key={filter.id}
                filter={filter}
                data={data}
                value={activeFilters[filter.field]}
                onChange={(value) => handleFilterChange(filter.id, filter.field, value)}
              />
            ))}
          </div>
        </div>
      )}

      {/* KPIs */}
      {dashboard.kpis && dashboard.kpis.length > 0 && (
        <div className={`grid grid-cols-1 md:grid-cols-${Math.min(dashboard.kpis.length, 5)} gap-4`}>
          {dashboard.kpis.map((kpi) => (
            <DynamicKPI key={kpi.id} kpi={kpi} data={filteredData} />
          ))}
        </div>
      )}

      {/* Charts */}
      {dashboard.charts && dashboard.charts.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dashboard.charts.map((chart) => (
            <DynamicChart key={chart.id} chart={chart} data={filteredData} />
          ))}
        </div>
      )}

      {/* No Data Message */}
      {filteredData.length === 0 && (
        <div className="bg-radiomke-charcoal-600 rounded-lg p-12 text-center border border-radiomke-charcoal-400/30">
          <p className="text-radiomke-cream-600">No data matches the selected filters</p>
        </div>
      )}
    </div>
  );
}
