"use client";

import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { useState } from "react";
import type { DashboardConfiguration, RadioMetrics } from "@/types";

interface UseDashboardAIProps {
  dashboards: DashboardConfiguration[];
  onDashboardGenerated: (dashboard: DashboardConfiguration) => void;
  onDashboardUpdated: (dashboard: DashboardConfiguration) => void;
}

export function useDashboardAI({
  dashboards,
  onDashboardGenerated,
  onDashboardUpdated,
}: UseDashboardAIProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  // Make dashboard data readable to Copilot
  useCopilotReadable({
    description: "Current dashboards and their configurations",
    value: dashboards,
  });

  // Action: Generate new dashboard from CSV
  useCopilotAction({
    name: "generateDashboard",
    description:
      "Analyze CSV data and generate an optimal dashboard with KPIs, charts, and filters for radio analytics",
    parameters: [
      {
        name: "fileName",
        type: "string",
        description: "Name of the CSV file",
        required: true,
      },
      {
        name: "data",
        type: "object[]",
        description: "Array of radio metrics data from the CSV",
        required: true,
      },
    ],
    handler: async ({ fileName, data }) => {
      setIsGenerating(true);
      try {
        const response = await fetch("/api/ai/generate-dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileName, data }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate dashboard");
        }

        const dashboard = await response.json();
        onDashboardGenerated(dashboard);

        return `✅ Generated dashboard "${dashboard.name}" with ${dashboard.charts.length} charts and ${dashboard.kpis.length} KPIs`;
      } catch (error) {
        console.error("Dashboard generation error:", error);
        return "❌ Failed to generate dashboard. Please try again.";
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Action: Customize existing dashboard
  useCopilotAction({
    name: "customizeDashboard",
    description:
      "Modify an existing dashboard based on user request (add/remove charts, change KPIs, etc.)",
    parameters: [
      {
        name: "dashboardId",
        type: "string",
        description: "ID of the dashboard to customize",
        required: true,
      },
      {
        name: "customizationRequest",
        type: "string",
        description: "What the user wants to change",
        required: true,
      },
    ],
    handler: async ({ dashboardId, customizationRequest }) => {
      const dashboard = dashboards.find((d) => d.id === dashboardId);
      if (!dashboard) {
        return `❌ Dashboard with ID ${dashboardId} not found`;
      }

      setIsGenerating(true);
      try {
        const response = await fetch("/api/ai/customize-dashboard", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ dashboard, customizationRequest }),
        });

        if (!response.ok) {
          throw new Error("Failed to customize dashboard");
        }

        const updatedDashboard = await response.json();
        onDashboardUpdated(updatedDashboard);

        return `✅ Updated dashboard "${updatedDashboard.name}" - ${customizationRequest}`;
      } catch (error) {
        console.error("Dashboard customization error:", error);
        return "❌ Failed to customize dashboard. Please try again.";
      } finally {
        setIsGenerating(false);
      }
    },
  });

  // Action: Get insights about data
  useCopilotAction({
    name: "getDataInsights",
    description:
      "Answer questions about radio analytics data, identify trends, and provide recommendations",
    parameters: [
      {
        name: "question",
        type: "string",
        description: "Question about the data",
        required: true,
      },
      {
        name: "dashboardId",
        type: "string",
        description: "ID of the dashboard to analyze",
        required: false,
      },
    ],
    handler: async ({ question, dashboardId }) => {
      const dashboard = dashboardId
        ? dashboards.find((d) => d.id === dashboardId)
        : dashboards[0];

      if (!dashboard) {
        return "❌ No dashboard available to analyze";
      }

      try {
        const response = await fetch("/api/ai/insights", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question, dashboardId }),
        });

        if (!response.ok) {
          throw new Error("Failed to get insights");
        }

        const { insight } = await response.json();
        return insight;
      } catch (error) {
        console.error("Insights error:", error);
        return "❌ Failed to analyze data. Please try again.";
      }
    },
  });

  return { isGenerating };
}
