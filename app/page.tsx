"use client";

import { useState, useEffect } from "react";
import { CopilotSidebar } from "@copilotkit/react-ui";
import type { DataContext, DashboardConfiguration, UploadedFile, RadioMetrics } from "@/types";
import FileUploader from "@/components/data-upload/FileUploader";
import DataSummary from "@/components/data-upload/DataSummary";
import ErrorToast from "@/components/ui/ErrorToast";
import DashboardManager from "@/components/dashboard/DashboardManager";
import { useDashboardAI } from "@/hooks/useDashboardAI";

export default function Home() {
  const [dataContext, setDataContext] = useState<DataContext>({
    dashboards: [],
    uploadedFiles: [],
    lastUpdated: new Date(),
  });

  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null);
  const [isGeneratingDashboard, setIsGeneratingDashboard] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    setMounted(true);

    const savedData = localStorage.getItem("radioMilwaukeeData");
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Convert date strings back to Date objects
        const dashboards = parsed.dashboards?.map((d: any) => ({
          ...d,
          createdAt: new Date(d.createdAt),
        })) || [];
        const uploadedFiles = parsed.uploadedFiles?.map((f: any) => ({
          ...f,
          uploadedAt: new Date(f.uploadedAt),
          data: f.data?.map((m: any) => ({ ...m, date: new Date(m.date) })) || [],
        })) || [];

        setDataContext({
          dashboards,
          uploadedFiles,
          lastUpdated: new Date(parsed.lastUpdated),
        });

        // Set active dashboard
        if (dashboards.length > 0) {
          setActiveDashboardId(dashboards[0].id);
        }
      } catch (e) {
        console.error("Failed to load saved data:", e);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (mounted) {
      localStorage.setItem("radioMilwaukeeData", JSON.stringify(dataContext));
    }
  }, [dataContext, mounted]);

  const handleFilesUploaded = async (files: UploadedFile[]) => {
    setDataContext((prev) => {
      const newFiles = [...prev.uploadedFiles, ...files];
      return {
        ...prev,
        uploadedFiles: newFiles,
        lastUpdated: new Date(),
      };
    });

    // Generate dashboard for each uploaded file using AI
    for (const file of files) {
      if (file.status === "completed" && (file as any).data) {
        await generateDashboardForFile(file);
      }
    }
  };

  const generateDashboardForFile = async (file: UploadedFile) => {
    setIsGeneratingDashboard(true);
    try {
      const fileData = (file as any).data as RadioMetrics[];

      const response = await fetch("/api/ai/generate-dashboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, data: fileData }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate dashboard");
      }

      const dashboard: DashboardConfiguration = await response.json();

      setDataContext((prev) => ({
        ...prev,
        dashboards: [...prev.dashboards, dashboard],
        uploadedFiles: prev.uploadedFiles.map((f) =>
          f.id === file.id ? { ...f, dashboardId: dashboard.id } : f
        ),
        lastUpdated: new Date(),
      }));

      setActiveDashboardId(dashboard.id);
    } catch (error) {
      console.error("Dashboard generation error:", error);
      setError("Failed to generate dashboard. Please try again.");
    } finally {
      setIsGeneratingDashboard(false);
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const file = dataContext.uploadedFiles.find((f) => f.id === fileId);

    setDataContext((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((f) => f.id !== fileId),
      dashboards: prev.dashboards.filter((d) => d.id !== file?.dashboardId),
      lastUpdated: new Date(),
    }));

    // If active dashboard was removed, select another
    if (file?.dashboardId === activeDashboardId) {
      const remaining = dataContext.dashboards.filter((d) => d.id !== file.dashboardId);
      setActiveDashboardId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleClearAllData = () => {
    if (confirm("Are you sure you want to clear all uploaded data? This cannot be undone.")) {
      setDataContext({
        dashboards: [],
        uploadedFiles: [],
        lastUpdated: new Date(),
      });
      localStorage.removeItem("radioMilwaukeeData");
      setActiveDashboardId(null);
    }
  };

  const handleDashboardGenerated = (dashboard: DashboardConfiguration) => {
    setDataContext((prev) => ({
      ...prev,
      dashboards: [...prev.dashboards, dashboard],
      lastUpdated: new Date(),
    }));
    setActiveDashboardId(dashboard.id);
  };

  const handleDashboardUpdated = (dashboard: DashboardConfiguration) => {
    setDataContext((prev) => ({
      ...prev,
      dashboards: prev.dashboards.map((d) => (d.id === dashboard.id ? dashboard : d)),
      lastUpdated: new Date(),
    }));
  };

  // Setup AI dashboard actions
  useDashboardAI({
    dashboards: dataContext.dashboards,
    onDashboardGenerated: handleDashboardGenerated,
    onDashboardUpdated: handleDashboardUpdated,
  });

  const activeDashboard = dataContext.dashboards.find((d) => d.id === activeDashboardId);
  const activeDashboardData =
    dataContext.uploadedFiles.find((f) => f.dashboardId === activeDashboardId)?.data || [];

  return (
    <div className="min-h-screen bg-radiomke-charcoal-500">
      {/* Header */}
      <header className="bg-radiomke-charcoal-600 border-b border-radiomke-charcoal-400/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center gap-4">
              <img
                src="/images/RadioMilwaukeeLogos_HorizontalLockup_CreamOrange.png"
                alt="Radio Milwaukee"
                className="h-12 w-auto"
              />
              <div className="border-l border-radiomke-charcoal-400/50 pl-4">
                <p className="text-sm text-radiomke-cream-600">
                  AI-Powered Streaming Analytics Platform
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {dataContext.uploadedFiles.length > 0 && (
                <button
                  onClick={handleClearAllData}
                  className="bg-red-600 hover:bg-red-700 text-radiomke-cream-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                  title="Clear all uploaded data"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Clear All
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-radiomke-charcoal-600 min-h-screen border-r border-radiomke-charcoal-400/30">
          <nav className="p-4 space-y-2">
            <div className="mb-6">
              <h3 className="text-xs font-semibold text-radiomke-cream-600 uppercase tracking-wider mb-3">
                Dashboards
              </h3>
              {dataContext.dashboards.length === 0 ? (
                <p className="text-sm text-radiomke-cream-600 px-4 py-2">
                  No dashboards yet. Upload a CSV to get started.
                </p>
              ) : (
                dataContext.dashboards.map((dashboard) => (
                  <button
                    key={dashboard.id}
                    onClick={() => setActiveDashboardId(dashboard.id)}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      activeDashboardId === dashboard.id
                        ? "text-radiomke-cream-500 bg-radiomke-orange-500"
                        : "text-radiomke-cream-500 hover:bg-radiomke-charcoal-700"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {dashboard.generatedByAI && (
                        <svg
                          className="w-4 h-4 text-radiomke-orange-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13 7H7v6h6V7z" />
                          <path
                            fillRule="evenodd"
                            d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                      <span className="text-sm truncate">{dashboard.name}</span>
                    </div>
                    <div className="text-xs text-radiomke-cream-600 mt-1">
                      {dashboard.type.replace("_", " ")}
                    </div>
                  </button>
                ))
              )}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8">
          <CopilotSidebar
            defaultOpen={false}
            clickOutsideToClose={true}
            labels={{
              title: "Radio Analytics AI Assistant",
              initial: "Ask me anything about your radio analytics data, or request dashboard customizations!",
            }}
          />

          {/* File Upload Section */}
          <div className="mb-8">
            <FileUploader onFilesUploaded={handleFilesUploaded} />
            <DataSummary files={dataContext.uploadedFiles} onRemoveFile={handleRemoveFile} />
          </div>

          {/* Loading State */}
          {isGeneratingDashboard && (
            <div className="bg-radiomke-blue-500/10 border border-radiomke-blue-500/30 rounded-lg p-6 mb-6">
              <div className="flex items-center gap-3">
                <svg
                  className="animate-spin h-5 w-5 text-radiomke-blue-400"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-radiomke-blue-300">
                    AI is analyzing your data...
                  </p>
                  <p className="text-xs text-radiomke-blue-200">
                    GPT-5 is generating the optimal dashboard configuration
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Active Dashboard */}
          {activeDashboard && activeDashboardData.length > 0 && (
            <DashboardManager dashboard={activeDashboard} data={activeDashboardData} />
          )}

          {/* Empty State */}
          {dataContext.dashboards.length === 0 && !isGeneratingDashboard && (
            <div className="bg-radiomke-charcoal-600 rounded-lg p-12 text-center border border-radiomke-charcoal-400/30">
              <svg
                className="mx-auto h-12 w-12 text-radiomke-cream-600 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="text-lg font-medium text-radiomke-cream-500 mb-2">
                No dashboards yet
              </h3>
              <p className="text-radiomke-cream-600 mb-6">
                Upload a CSV file to let AI generate a custom dashboard for your data
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-radiomke-blue-300">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M13 7H7v6h6V7z" />
                  <path
                    fillRule="evenodd"
                    d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2h-2v1a1 1 0 11-2 0v-1H9v1a1 1 0 11-2 0v-1H5a2 2 0 01-2-2v-2H2a1 1 0 110-2h1V9H2a1 1 0 010-2h1V5a2 2 0 012-2h2V2zM5 5h10v10H5V5z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Powered by GPT-5</span>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Error Toast */}
      {error && <ErrorToast message={error} onClose={() => setError(null)} />}
    </div>
  );
}
