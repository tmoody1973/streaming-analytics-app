"use client";

import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import type { RadioMetrics } from "@/types";
import { calculateAverageCUME, calculateTSL } from "@/lib/utils/radioMetrics";

interface DeviceAnalysisProps {
  data: RadioMetrics[];
  loading?: boolean;
}

interface DeviceMetrics {
  device: string;
  avgCume: number;
  totalTlh: number;
  avgTsl: number;
  percentage: number;
  dataPoints: number;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function DeviceAnalysis({ data, loading = false }: DeviceAnalysisProps) {
  const deviceData = useMemo(() => {
    if (data.length === 0) return [];

    // Group by device
    const grouped = new Map<string, RadioMetrics[]>();

    data.forEach((metric) => {
      const device = metric.device || "Unknown";
      if (!grouped.has(device)) {
        grouped.set(device, []);
      }
      grouped.get(device)!.push(metric);
    });

    const totalDataPoints = data.length;

    // Calculate metrics for each device
    const devices: DeviceMetrics[] = Array.from(grouped.entries()).map(
      ([device, metrics]) => {
        const cumeValues = metrics.filter((m) => m.cume > 0).map((m) => m.cume);
        const avgCume = calculateAverageCUME(cumeValues);
        const totalTlh = metrics.reduce((sum, m) => sum + m.tlh, 0);
        const avgTsl = calculateTSL(totalTlh, avgCume);

        return {
          device,
          avgCume,
          totalTlh: Math.round(totalTlh),
          avgTsl,
          percentage: (metrics.length / totalDataPoints) * 100,
          dataPoints: metrics.length,
        };
      }
    );

    // Sort by CUME descending
    return devices.sort((a, b) => b.avgCume - a.avgCume);
  }, [data]);

  const pieData = useMemo(() => {
    return deviceData.map((d) => ({
      name: d.device,
      value: d.avgCume,
    }));
  }, [deviceData]);

  if (loading) {
    return (
      <div className="bg-radiomke-charcoal-600 rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-radiomke-charcoal-700 rounded w-1/3"></div>
          <div className="h-64 bg-radiomke-charcoal-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (data.length === 0 || deviceData.length === 0) {
    return (
      <div className="bg-radiomke-charcoal-600 rounded-lg p-6 text-center">
        <p className="text-radiomke-cream-600">
          No device data available. Upload CSV files with device information.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-radiomke-charcoal-600 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-radiomke-cream-500">Device Distribution</h2>
        <p className="text-sm text-radiomke-cream-600 mt-1">
          Listener breakdown by platform/station
        </p>
      </div>

      {/* Chart and Legend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pie Chart */}
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "0.5rem",
                  color: "#fff",
                }}
                formatter={(value: number) => value.toLocaleString()}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Device Cards */}
        <div className="space-y-3">
          {deviceData.slice(0, 5).map((device, index) => (
            <div
              key={device.device}
              className="bg-radiomke-charcoal-700 rounded-lg p-4 hover:bg-gray-650 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium text-radiomke-cream-500">{device.device}</span>
                </div>
                <span className="text-sm text-radiomke-cream-600">
                  {device.percentage.toFixed(1)}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-radiomke-cream-600">Avg CUME</p>
                  <p className="text-radiomke-cream-500 font-semibold">
                    {device.avgCume.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-radiomke-cream-600">Total TLH</p>
                  <p className="text-radiomke-cream-500 font-semibold">
                    {device.totalTlh.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-radiomke-cream-600">Avg TSL</p>
                  <p className="text-radiomke-cream-500 font-semibold">
                    {device.avgTsl.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {deviceData.length > 5 && (
            <p className="text-sm text-radiomke-cream-600 text-center">
              +{deviceData.length - 5} more devices
            </p>
          )}
        </div>
      </div>

      {/* Detailed Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-radiomke-charcoal-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-radiomke-cream-500 uppercase tracking-wider">
                Device/Station
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-radiomke-cream-500 uppercase tracking-wider">
                Distribution
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-radiomke-cream-500 uppercase tracking-wider">
                Avg CUME
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-radiomke-cream-500 uppercase tracking-wider">
                Total TLH
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-radiomke-cream-500 uppercase tracking-wider">
                Avg TSL
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-radiomke-cream-500 uppercase tracking-wider">
                Data Points
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {deviceData.map((device, index) => (
              <tr key={device.device} className="hover:bg-radiomke-charcoal-700/50 transition-colors">
                <td className="px-4 py-3 flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <span className="font-medium text-radiomke-cream-500">{device.device}</span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-16 bg-gray-600 rounded-full h-2">
                      <div
                        className="h-2 rounded-full"
                        style={{
                          width: `${device.percentage}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      ></div>
                    </div>
                    <span className="text-radiomke-cream-500 w-12">
                      {device.percentage.toFixed(1)}%
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-right text-radiomke-cream-500">
                  {device.avgCume.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-radiomke-cream-500">
                  {device.totalTlh.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-right text-radiomke-cream-500">
                  {device.avgTsl.toFixed(2)}
                </td>
                <td className="px-4 py-3 text-right text-radiomke-cream-600">
                  {device.dataPoints}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Insights */}
      {deviceData.length > 1 && (
        <div className="bg-purple-900/20 border border-purple-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <svg
              className="w-6 h-6 text-purple-400 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-purple-300">Key Insight</p>
              <p className="text-xs text-purple-200 mt-1">
                {deviceData[0].device} accounts for {deviceData[0].percentage.toFixed(1)}% of
                distribution with an average CUME of {deviceData[0].avgCume.toLocaleString()}.
                {deviceData[0].avgTsl > 4
                  ? " High TSL indicates strong listener engagement."
                  : " Consider strategies to increase TSL for deeper engagement."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
