"use client";

import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { RadioMetrics, ChartDataPoint } from "@/types";

interface TrendAnalysisProps {
  data: RadioMetrics[];
  loading?: boolean;
}

export default function TrendAnalysis({ data, loading = false }: TrendAnalysisProps) {
  const [chartType, setChartType] = useState<"line" | "bar">("line");
  const [selectedMetric, setSelectedMetric] = useState<"cume" | "tlh" | "tsl">("cume");

  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Group by week for cleaner visualization
    const weeklyData = new Map<string, RadioMetrics[]>();

    data.forEach((metric) => {
      const date = new Date(metric.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week
      const weekKey = weekStart.toISOString().split("T")[0];

      if (!weeklyData.has(weekKey)) {
        weeklyData.set(weekKey, []);
      }
      weeklyData.get(weekKey)!.push(metric);
    });

    // Calculate weekly aggregates with proper CUME averaging
    const aggregated: ChartDataPoint[] = Array.from(weeklyData.entries())
      .map(([weekKey, metrics]) => {
        const cumeValues = metrics.filter((m) => m.cume > 0).map((m) => m.cume);
        const avgCume =
          cumeValues.length > 0
            ? Math.round(cumeValues.reduce((a, b) => a + b, 0) / cumeValues.length)
            : 0;

        const totalTlh = metrics.reduce((sum, m) => sum + m.tlh, 0);
        const avgTsl = avgCume > 0 ? totalTlh / avgCume : 0;

        return {
          date: new Date(weekKey).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          cume: avgCume,
          tlh: Math.round(totalTlh),
          tsl: parseFloat(avgTsl.toFixed(2)),
        };
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-12); // Last 12 weeks

    return aggregated;
  }, [data]);

  const metricConfig = {
    cume: {
      name: "Average CUME",
      color: "#3b82f6",
      unit: "",
      warning: "Averaged per week",
    },
    tlh: {
      name: "Total Listening Hours",
      color: "#10b981",
      unit: " hrs",
      warning: "Summed per week",
    },
    tsl: {
      name: "Time Spent Listening",
      color: "#f59e0b",
      unit: " hrs",
      warning: "Calculated as TLH ÷ CUME",
    },
  };

  const currentConfig = metricConfig[selectedMetric];

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/4"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">
          No data available for trend analysis. Upload CSV files to see trends.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Trend Analysis</h2>
          <p className="text-sm text-gray-400 mt-1">Weekly performance trends</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Metric Selection */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            {(["cume", "tlh", "tsl"] as const).map((metric) => (
              <button
                key={metric}
                onClick={() => setSelectedMetric(metric)}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  selectedMetric === metric
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                {metric.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Chart Type Toggle */}
          <div className="flex bg-gray-700 rounded-lg p-1">
            <button
              onClick={() => setChartType("line")}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                chartType === "line"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Line
            </button>
            <button
              onClick={() => setChartType("bar")}
              className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                chartType === "bar"
                  ? "bg-blue-600 text-white"
                  : "text-gray-300 hover:text-white"
              }`}
            >
              Bar
            </button>
          </div>
        </div>
      </div>

      {/* Metric Info Banner */}
      <div className="bg-gray-700 rounded-lg p-3">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: currentConfig.color }}
          ></div>
          <span className="text-sm font-medium text-white">
            {currentConfig.name}
          </span>
          <span className="text-xs text-gray-400">•</span>
          <span className="text-xs text-gray-400">{currentConfig.warning}</span>
        </div>
      </div>

      {/* Chart */}
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === "line" ? (
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                formatter={(value: number) =>
                  `${value.toLocaleString()}${currentConfig.unit}`
                }
              />
              <Legend wrapperStyle={{ color: "#9ca3af" }} />
              <Line
                type="monotone"
                dataKey={selectedMetric}
                name={currentConfig.name}
                stroke={currentConfig.color}
                strokeWidth={2}
                dot={{ fill: currentConfig.color, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                style={{ fontSize: "12px" }}
              />
              <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                formatter={(value: number) =>
                  `${value.toLocaleString()}${currentConfig.unit}`
                }
              />
              <Legend wrapperStyle={{ color: "#9ca3af" }} />
              <Bar
                dataKey={selectedMetric}
                name={currentConfig.name}
                fill={currentConfig.color}
              />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-700">
        <div>
          <p className="text-xs text-gray-400 mb-1">Average</p>
          <p className="text-lg font-semibold text-white">
            {chartData.length > 0
              ? Math.round(
                  chartData.reduce((sum, d) => sum + (d[selectedMetric] || 0), 0) /
                    chartData.length
                ).toLocaleString()
              : "0"}
            {currentConfig.unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Peak</p>
          <p className="text-lg font-semibold text-white">
            {chartData.length > 0
              ? Math.max(...chartData.map((d) => d[selectedMetric] || 0)).toLocaleString()
              : "0"}
            {currentConfig.unit}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Data Points</p>
          <p className="text-lg font-semibold text-white">{chartData.length}</p>
        </div>
      </div>
    </div>
  );
}
