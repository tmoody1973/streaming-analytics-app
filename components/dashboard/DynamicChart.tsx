"use client";

import { useMemo } from "react";
import { ResponsiveLine } from "@nivo/line";
import { ResponsiveBar } from "@nivo/bar";
import { ResponsivePie } from "@nivo/pie";
import { ResponsiveHeatMap } from "@nivo/heatmap";
import type { ChartSpecification, RadioMetrics } from "@/types";

interface DynamicChartProps {
  chart: ChartSpecification;
  data: RadioMetrics[];
}

const RADIO_MKE_THEME = {
  axis: {
    ticks: {
      text: {
        fill: "#D1D5DB",
        fontSize: 13,
        fontWeight: 500,
      },
    },
    legend: {
      text: {
        fill: "#F3F4F6",
        fontSize: 14,
        fontWeight: 600,
      },
    },
  },
  grid: {
    line: {
      stroke: "#4B5563",
      strokeWidth: 1,
    },
  },
  legends: {
    text: {
      fill: "#F3F4F6",
      fontSize: 13,
      fontWeight: 500,
    },
  },
  labels: {
    text: {
      fill: "#1F2937",
      fontSize: 12,
      fontWeight: 700,
    },
  },
  tooltip: {
    container: {
      background: "#1F2937",
      color: "#F3F4F6",
      fontSize: 14,
      borderRadius: "8px",
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.5)",
      padding: "12px 16px",
      border: "1px solid #4B5563",
    },
  },
};

const COLORS = ["#F8971D", "#32588E", "#FAB342", "#6E99BB", "#D67A0A", "#91B1CB"];

export default function DynamicChart({ chart, data }: DynamicChartProps) {
  const chartData = useMemo(() => {
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
            ? String((item as any)[chart.xAxis])
            : "";

        if (!grouped.has(key)) {
          grouped.set(key, { x: key });
        }

        const group = grouped.get(key)!;
        chart.dataKeys.forEach((dataKey) => {
          const value = (item as any)[dataKey];
          if (value != null) {
            group[dataKey] = (group[dataKey] || 0) + value;
          }
        });
      });

      return Array.from(grouped.values());
    }

    return data;
  }, [data, chart]);

  const renderChart = () => {
    switch (chart.type) {
      case "line": {
        // Transform data for Nivo line chart
        const lineData = chart.dataKeys.map((key, idx) => ({
          id: key,
          color: COLORS[idx % COLORS.length],
          data: chartData.map((item) => ({
            x: item.x || item[chart.xAxis!],
            y: Number(item[key]) || 0,
          })),
        }));

        return (
          <ResponsiveLine
            data={lineData}
            theme={RADIO_MKE_THEME}
            colors={COLORS}
            margin={{ top: 30, right: 140, bottom: 80, left: 70 }}
            xScale={{ type: "point" }}
            yScale={{ type: "linear", min: "auto", max: "auto" }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 8,
              tickPadding: 10,
              tickRotation: -45,
              legend: chart.xAxis?.toUpperCase() || "X AXIS",
              legendOffset: 70,
              legendPosition: "middle",
            }}
            axisLeft={{
              tickSize: 8,
              tickPadding: 10,
              tickRotation: 0,
              legend: chart.dataKeys.join(", ").toUpperCase(),
              legendOffset: -60,
              legendPosition: "middle",
            }}
            pointSize={10}
            pointColor={{ from: "color", modifiers: [] }}
            pointBorderWidth={3}
            pointBorderColor={{ from: "serieColor" }}
            pointLabelYOffset={-12}
            useMesh={true}
            enableSlices="x"
            curve="monotoneX"
            lineWidth={3}
            legends={[
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 8,
                itemDirection: "left-to-right",
                itemWidth: 100,
                itemHeight: 24,
                symbolSize: 16,
                symbolShape: "circle",
              },
            ]}
          />
        );
      }

      case "bar": {
        return (
          <ResponsiveBar
            data={chartData}
            keys={chart.dataKeys}
            indexBy={chart.xAxis || "x"}
            theme={RADIO_MKE_THEME}
            colors={COLORS}
            margin={{ top: 30, right: 140, bottom: 80, left: 70 }}
            padding={0.3}
            valueScale={{ type: "linear" }}
            indexScale={{ type: "band", round: true }}
            borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 8,
              tickPadding: 10,
              tickRotation: -45,
              legend: chart.xAxis?.toUpperCase() || "X AXIS",
              legendPosition: "middle",
              legendOffset: 70,
            }}
            axisLeft={{
              tickSize: 8,
              tickPadding: 10,
              tickRotation: 0,
              legend: chart.dataKeys.join(", ").toUpperCase(),
              legendPosition: "middle",
              legendOffset: -60,
            }}
            labelSkipWidth={12}
            labelSkipHeight={12}
            labelTextColor="#1F2937"
            legends={[
              {
                dataFrom: "keys",
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 8,
                itemWidth: 100,
                itemHeight: 24,
                itemDirection: "left-to-right",
                symbolSize: 16,
              },
            ]}
            role="application"
          />
        );
      }

      case "pie": {
        const pieData = chart.dataKeys.map((key, idx) => ({
          id: key,
          label: key,
          value: chartData.reduce((sum, item) => sum + (Number(item[key]) || 0), 0),
          color: COLORS[idx % COLORS.length],
        }));

        return (
          <ResponsivePie
            data={pieData}
            theme={RADIO_MKE_THEME}
            colors={COLORS}
            margin={{ top: 20, right: 80, bottom: 20, left: 80 }}
            innerRadius={0.5}
            padAngle={0.7}
            cornerRadius={3}
            activeOuterRadiusOffset={8}
            borderWidth={1}
            borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
            arcLinkLabelsSkipAngle={10}
            arcLinkLabelsTextColor="#E5E7EB"
            arcLinkLabelsThickness={2}
            arcLinkLabelsColor={{ from: "color" }}
            arcLabelsSkipAngle={10}
            arcLabelsTextColor="#1F2937"
            legends={[
              {
                anchor: "right",
                direction: "column",
                justify: false,
                translateX: 0,
                translateY: 0,
                itemsSpacing: 8,
                itemWidth: 60,
                itemHeight: 18,
                itemTextColor: "#E5E7EB",
                itemDirection: "left-to-right",
                symbolSize: 14,
                symbolShape: "circle",
              },
            ]}
          />
        );
      }

      case "heatmap": {
        // Transform data for heatmap
        const heatmapData = chartData.map((item) => ({
          id: item[chart.xAxis!] || item.x,
          data: chart.dataKeys.map((key) => ({
            x: key,
            y: Number(item[key]) || 0,
          })),
        }));

        return (
          <ResponsiveHeatMap
            data={heatmapData}
            theme={RADIO_MKE_THEME}
            margin={{ top: 20, right: 60, bottom: 60, left: 60 }}
            valueFormat=">-.2s"
            axisTop={null}
            axisRight={null}
            axisBottom={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: -45,
              legend: "",
              legendOffset: 36,
            }}
            axisLeft={{
              tickSize: 5,
              tickPadding: 5,
              tickRotation: 0,
              legend: chart.xAxis || "category",
              legendPosition: "middle",
              legendOffset: -40,
            }}
            colors={{
              type: "diverging",
              scheme: "orange_red",
              divergeAt: 0.5,
            }}
            emptyColor="#1F2937"
            borderColor={{ from: "color", modifiers: [["darker", 0.6]] }}
            legends={[
              {
                anchor: "right",
                translateX: 30,
                translateY: 0,
                length: 200,
                thickness: 8,
                direction: "column",
                tickPosition: "after",
                tickSize: 3,
                tickSpacing: 4,
                tickOverlap: false,
                title: "Value →",
                titleAlign: "start",
                titleOffset: 4,
              },
            ]}
          />
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
      <div className={chart.type === "table" ? "" : "h-96"}>{renderChart()}</div>
    </div>
  );
}
