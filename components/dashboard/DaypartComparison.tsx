"use client";

import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { RadioMetrics } from "@/types";
import { calculateAverageCUME, calculateTSL } from "@/lib/utils/radioMetrics";

interface DaypartComparisonProps {
  data: RadioMetrics[];
  loading?: boolean;
}

interface DaypartMetrics {
  daypart: string;
  avgCume: number;
  totalTlh: number;
  avgTsl: number;
  dataPoints: number;
}

export default function DaypartComparison({ data, loading = false }: DaypartComparisonProps) {
  const daypartData = useMemo(() => {
    if (data.length === 0) return [];

    // Group by daypart
    const grouped = new Map<string, RadioMetrics[]>();

    data.forEach((metric) => {
      const daypart = metric.daypart || "Unknown";
      if (!grouped.has(daypart)) {
        grouped.set(daypart, []);
      }
      grouped.get(daypart)!.push(metric);
    });

    // Calculate metrics for each daypart
    const dayparts: DaypartMetrics[] = Array.from(grouped.entries()).map(
      ([daypart, metrics]) => {
        const cumeValues = metrics.filter((m) => m.cume > 0).map((m) => m.cume);
        const avgCume = calculateAverageCUME(cumeValues);
        const totalTlh = metrics.reduce((sum, m) => sum + m.tlh, 0);
        const avgTsl = calculateTSL(totalTlh, avgCume);

        return {
          daypart,
          avgCume,
          totalTlh: Math.round(totalTlh),
          avgTsl,
          dataPoints: metrics.length,
        };
      }
    );

    // Sort by CUME descending
    return dayparts.sort((a, b) => b.avgCume - a.avgCume);
  }, [data]);

  const bestPerforming = daypartData[0];
  const worstPerforming = daypartData[daypartData.length - 1];

  if (loading) {
    return (
      <div className="bg-gray-800 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-700 rounded w-1/3"></div>
          <div className="h-64 bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0 || daypartData.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">
          No daypart data available. Upload CSV files with daypart information.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white">Daypart Performance</h2>
        <p className="text-sm text-gray-400 mt-1">
          Comparison across different time periods
        </p>
      </div>

      {/* Performance Highlights */}
      {bestPerforming && worstPerforming && daypartData.length > 1 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-green-900/20 border border-green-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span className="text-sm font-medium text-green-300">
                Best Performing
              </span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {bestPerforming.daypart}
            </p>
            <p className="text-sm text-gray-300">
              Avg CUME: {bestPerforming.avgCume.toLocaleString()}
            </p>
          </div>

          <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <svg
                className="w-5 h-5 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span className="text-sm font-medium text-red-300">
                Needs Attention
              </span>
            </div>
            <p className="text-2xl font-bold text-white mb-1">
              {worstPerforming.daypart}
            </p>
            <p className="text-sm text-gray-300">
              Avg CUME: {worstPerforming.avgCume.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={daypartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis
              dataKey="daypart"
              stroke="#9ca3af"
              style={{ fontSize: "12px" }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: "12px" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1f2937",
                border: "1px solid #374151",
                borderRadius: "0.5rem",
                color: "#fff",
              }}
              formatter={(value: number) => value.toLocaleString()}
            />
            <Bar dataKey="avgCume" name="Avg CUME" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Detailed Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Daypart
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Avg CUME
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Total TLH
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Avg TSL
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-300 uppercase tracking-wider">
                Data Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {daypartData.map((daypart, index) => (
              <tr
                key={daypart.daypart}
                className={`hover:bg-gray-700/50 transition-colors ${
                  index === 0
                    ? "bg-green-900/10"
                    : index === daypartData.length - 1
                    ? "bg-red-900/10"
                    : ""
                }`}
              >
                <td className="px-4 py-3 font-medium text-white">
                  {daypart.daypart}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {daypart.avgCume.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {daypart.totalTlh.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {daypart.avgTsl.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-gray-400">
                  {daypart.dataPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Insights */}
      <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-blue-400 flex-shrink-0 mt-0.5"
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
          <div>
            <p className="text-sm font-medium text-blue-300">Programming Insight</p>
            <p className="text-xs text-blue-200 mt-1">
              {bestPerforming && worstPerforming && (
                <>
                  {bestPerforming.daypart} is performing{" "}
                  {Math.round(
                    ((bestPerforming.avgCume - worstPerforming.avgCume) /
                      worstPerforming.avgCume) *
                      100
                  )}
                  % better than {worstPerforming.daypart}. Consider analyzing
                  programming strategies from high-performing dayparts.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
