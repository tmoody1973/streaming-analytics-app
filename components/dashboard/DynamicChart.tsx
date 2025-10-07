"use client";

import { useMemo } from "react";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { ChartSpecification, RadioMetrics } from "@/types";

interface DynamicChartProps {
  chart: ChartSpecification;
  data: RadioMetrics[];
}

const COLORS = ["#F8971D", "#32588E", "#FAB342", "#6E99BB", "#D67A0A", "#91B1CB"];

export default function DynamicChart({ chart, data }: DynamicChartProps) {
  const chartData = useMemo(() => {
    console.log(`[DynamicChart] ${chart.title}:`, {
      dataLength: data?.length || 0,
      chartType: chart.type,
      xAxis: chart.xAxis,
      dataKeys: chart.dataKeys,
      sampleData: data?.[0],
    });

    if (!data || data.length === 0) {
      console.warn(`[DynamicChart] ${chart.title}: No data provided`);
      return [];
    }

    if (chart.type === "table") {
      return data;
    }

    // For line/bar charts with xAxis
    if (chart.xAxis && (chart.type === "line" || chart.type === "bar" || chart.type === "area")) {
      const grouped = new Map<string, any>();

      data.forEach((item) => {
        const key =
          chart.xAxis === "date"
            ? new Date(item.date).toLocaleDateString()
            : chart.xAxis
            ? String((item as any)[chart.xAxis] || "Unknown")
            : "Unknown";

        if (!grouped.has(key)) {
          grouped.set(key, { name: key });
        }

        const group = grouped.get(key)!;
        chart.dataKeys.forEach((dataKey) => {
          const value = (item as any)[dataKey];
          if (value != null && !isNaN(Number(value))) {
            group[dataKey] = (group[dataKey] || 0) + Number(value);
          }
        });
      });

      const result = Array.from(grouped.values());
      console.log(`[DynamicChart] ${chart.title} - Grouped data:`, result.slice(0, 3));
      return result;
    }

    // For pie charts
    if (chart.type === "pie") {
      return data;
    }

    return data;
  }, [data, chart]);

  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-radiomke-charcoal-600 rounded-lg p-6 border border-radiomke-charcoal-400/30">
        <div className="mb-6">
          <h3 className="text-xl font-bold text-radiomke-cream-500">{chart.title}</h3>
          {chart.description && (
            <p className="text-sm text-radiomke-cream-600 mt-2">{chart.description}</p>
          )}
        </div>
        <div className="h-96 flex items-center justify-center">
          <p className="text-radiomke-cream-600">No data available for this chart</p>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    switch (chart.type) {
      case "line": {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={chartData} margin={{ top: 20, right: 120, bottom: 80, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis
                dataKey="name"
                stroke="#D1D5DB"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: "#D1D5DB", fontSize: 12 }}
              />
              <YAxis stroke="#D1D5DB" tick={{ fill: "#D1D5DB", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #4B5563",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: "20px" }}
                iconType="circle"
              />
              {chart.dataKeys.map((key, idx) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={COLORS[idx % COLORS.length]}
                  strokeWidth={3}
                  dot={{ fill: COLORS[idx % COLORS.length], r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        );
      }

      case "bar": {
        return (
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={chartData} margin={{ top: 20, right: 120, bottom: 80, left: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
              <XAxis
                dataKey="name"
                stroke="#D1D5DB"
                angle={-45}
                textAnchor="end"
                height={80}
                tick={{ fill: "#D1D5DB", fontSize: 12 }}
              />
              <YAxis stroke="#D1D5DB" tick={{ fill: "#D1D5DB", fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #4B5563",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
              />
              <Legend wrapperStyle={{ paddingTop: "20px" }} />
              {chart.dataKeys.map((key, idx) => (
                <Bar key={key} dataKey={key} fill={COLORS[idx % COLORS.length]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case "pie": {
        const pieData = chart.dataKeys.map((key, idx) => ({
          name: key,
          value: chartData.reduce((sum, item) => sum + (Number(item[key]) || 0), 0),
        }));

        return (
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={true}
                label={(entry) => `${entry.name}: ${entry.value.toLocaleString()}`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1F2937",
                  border: "1px solid #4B5563",
                  borderRadius: "8px",
                  color: "#F3F4F6",
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );
      }

      case "table":
        return (
          <div className="overflow-auto max-h-96">
            <table className="w-full text-sm">
              <thead className="bg-radiomke-charcoal-700 sticky top-0">
                <tr>
                  {chart.dataKeys.map((key) => (
                    <th
                      key={key}
                      className="px-4 py-3 text-left text-xs font-medium text-radiomke-cream-500 uppercase tracking-wider"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {chartData.slice(0, 100).map((item, idx) => (
                  <tr key={idx} className="hover:bg-radiomke-charcoal-700/50">
                    {chart.dataKeys.map((key) => (
                      <td key={key} className="px-4 py-3 text-radiomke-cream-500">
                        {typeof item[key] === "number"
                          ? item[key].toLocaleString()
                          : String(item[key] || "-")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {chartData.length > 100 && (
              <p className="text-center text-sm text-radiomke-cream-600 py-2">
                Showing first 100 of {chartData.length} rows
              </p>
            )}
          </div>
        );

      default:
        return (
          <div className="flex items-center justify-center h-full">
            <p className="text-radiomke-cream-600">Chart type "{chart.type}" not yet supported</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-radiomke-charcoal-600 rounded-lg p-6 border border-radiomke-charcoal-400/30">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-radiomke-cream-500">{chart.title}</h3>
        {chart.description && (
          <p className="text-sm text-radiomke-cream-600 mt-2">{chart.description}</p>
        )}
      </div>
      <div className={chart.type === "table" ? "" : "w-full"} style={chart.type !== "table" ? { height: "400px" } : undefined}>
        {renderChart()}
      </div>
    </div>
  );
}
