"use client";

import { useState, useEffect, useMemo } from "react";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";
import type { DataContext, RadioMetrics, UploadedFile } from "@/types";
import FileUploader from "@/components/data-upload/FileUploader";
import DataSummary from "@/components/data-upload/DataSummary";
import CSVExportGuide from "@/components/data-upload/CSVExportGuide";
import ErrorToast from "@/components/ui/ErrorToast";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import TrendAnalysis from "@/components/dashboard/TrendAnalysis";
import DaypartComparison from "@/components/dashboard/DaypartComparison";
import DeviceAnalysis from "@/components/dashboard/DeviceAnalysis";
import HourlyPatterns from "@/components/dashboard/HourlyPatterns";
import DashboardSection from "@/components/dashboard/DashboardSection";
import DashboardTabs from "@/components/dashboard/DashboardTabs";
import KPISummary from "@/components/dashboard/KPISummary";

export default function Home() {
  const [dataContext, setDataContext] = useState<DataContext>({
    streamingData: [],
    uploadedFiles: [],
    lastUpdated: new Date(),
  });

  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedStation, setSelectedStation] = useState<string>("all");
  const [dateRange, setDateRange] = useState<string>("all");
  const [activeTab, setActiveTab] = useState<string>("overview");

  // Load data from localStorage on mount
  useEffect(() => {
    setMounted(true);

    const savedData = localStorage.getItem('radioMilwaukeeData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Convert date strings back to Date objects
        const streamingData = parsed.streamingData.map((m: any) => ({
          ...m,
          date: new Date(m.date),
        }));
        const uploadedFiles = parsed.uploadedFiles.map((f: any) => ({
          ...f,
          uploadedAt: new Date(f.uploadedAt),
        }));
        setDataContext({
          ...parsed,
          streamingData,
          uploadedFiles,
          lastUpdated: new Date(parsed.lastUpdated),
        });
      } catch (e) {
        console.error('Failed to load saved data:', e);
      }
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (mounted && dataContext.streamingData.length > 0) {
      localStorage.setItem('radioMilwaukeeData', JSON.stringify(dataContext));
    }
  }, [dataContext, mounted]);

  const handleFilesUploaded = (files: UploadedFile[]) => {
    console.log("Files uploaded:", files); // Debug log

    setDataContext((prev) => {
      const newFiles = [...prev.uploadedFiles, ...files];

      // Extract metrics data from successful uploads and tag with fileId
      const newMetrics = files
        .filter((f) => f.status === "completed")
        .flatMap((f) => {
          const fileData = (f as any).data || [];
          console.log(`Extracting ${fileData.length} metrics from ${f.name}`); // Debug log
          // Tag each metric with the file ID so we can remove them later
          return fileData.map((metric: RadioMetrics) => ({
            ...metric,
            fileId: f.id,
          }));
        });

      console.log(`Total new metrics: ${newMetrics.length}`); // Debug log

      return {
        ...prev,
        uploadedFiles: newFiles,
        streamingData: [...prev.streamingData, ...newMetrics],
        lastUpdated: new Date(),
      };
    });
  };

  const handleRemoveFile = (fileId: string) => {
    setDataContext((prev) => ({
      ...prev,
      uploadedFiles: prev.uploadedFiles.filter((f) => f.id !== fileId),
      // FIXED: Also remove all metrics that came from this file
      streamingData: prev.streamingData.filter((m) => m.fileId !== fileId),
      lastUpdated: new Date(),
    }));
  };

  const handleClearAllData = () => {
    if (confirm('Are you sure you want to clear all uploaded data? This cannot be undone.')) {
      setDataContext({
        streamingData: [],
        uploadedFiles: [],
        lastUpdated: new Date(),
      });
      localStorage.removeItem('radioMilwaukeeData');
    }
  };

  // Get available stations from data
  const availableStations = useMemo(() => {
    const stations = new Set<string>();
    dataContext.streamingData.forEach((m) => {
      if (m.station) stations.add(m.station);
    });
    return Array.from(stations).sort();
  }, [dataContext.streamingData]);

  // Filter data based on selected station and date range
  const filteredData = useMemo(() => {
    let filtered = dataContext.streamingData;

    // Filter by station
    if (selectedStation !== "all") {
      filtered = filtered.filter((m) => m.station === selectedStation);
    }

    // Filter by date range
    if (dateRange !== "all") {
      const now = new Date();
      let startDate = new Date();

      switch (dateRange) {
        case "7d":
          startDate.setDate(now.getDate() - 7);
          break;
        case "30d":
          startDate.setDate(now.getDate() - 30);
          break;
        case "3m":
          startDate.setMonth(now.getMonth() - 3);
          break;
        case "6m":
          startDate.setMonth(now.getMonth() - 6);
          break;
        case "1y":
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      filtered = filtered.filter((m) => new Date(m.date) >= startDate);
    }

    return filtered;
  }, [dataContext.streamingData, selectedStation, dateRange]);

  // Detect what types of data are available
  const dataAvailability = useMemo(() => {
    const hasDaypart = filteredData.some((m) => m.daypart);
    const hasDevice = filteredData.some((m) => m.device);
    const hasHourly = filteredData.some((m) => m.hour !== undefined);
    const hasBasicData = filteredData.length > 0;

    return {
      hasDaypart,
      hasDevice,
      hasHourly,
      hasBasicData,
    };
  }, [filteredData]);

  // Make data accessible to AI
  useCopilotReadable({
    description: "Radio Milwaukee streaming and Nielsen analytics data",
    value: dataContext,
  });

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
                <p className="text-sm text-radiomke-cream-600">Streaming Analytics Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Date Range Filter */}
              {dataContext.streamingData.length > 0 && (
                <>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="bg-radiomke-charcoal-700 text-radiomke-cream-500 text-sm rounded-lg px-3 py-2 border border-radiomke-charcoal-400/50 focus:ring-2 focus:ring-radiomke-orange-500 focus:border-transparent"
                  >
                    <option value="all">All Time</option>
                    <option value="7d">Last 7 Days</option>
                    <option value="30d">Last 30 Days</option>
                    <option value="3m">Last 3 Months</option>
                    <option value="6m">Last 6 Months</option>
                    <option value="1y">Last Year</option>
                  </select>

                  {/* Station Filter */}
                  {availableStations.length > 0 && (
                    <select
                      value={selectedStation}
                      onChange={(e) => setSelectedStation(e.target.value)}
                      className="bg-radiomke-charcoal-700 text-radiomke-cream-500 text-sm rounded-lg px-3 py-2 border border-radiomke-charcoal-400/50 focus:ring-2 focus:ring-radiomke-orange-500 focus:border-transparent"
                    >
                      <option value="all">All Stations</option>
                      {availableStations.map((station) => (
                        <option key={station} value={station}>
                          {station}
                        </option>
                      ))}
                    </select>
                  )}

                  {/* Clear All Data Button */}
                  <button
                    onClick={handleClearAllData}
                    className="bg-red-600 hover:bg-red-700 text-radiomke-cream-500 text-sm font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    title="Clear all uploaded data"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Clear All
                  </button>
                </>
              )}

              <span className="text-sm text-radiomke-cream-600">
                Last Updated: {mounted ? dataContext.lastUpdated.toLocaleString() : "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-radiomke-charcoal-600 min-h-screen border-r border-radiomke-charcoal-400/30">
          <nav className="p-4 space-y-2">
            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === "overview"
                  ? "text-radiomke-cream-500 bg-radiomke-orange-500"
                  : "text-radiomke-cream-500 hover:bg-radiomke-charcoal-700"
              }`}
            >
              📊 Overview
            </button>
            <button
              onClick={() => setActiveTab("hourly")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === "hourly"
                  ? "text-radiomke-cream-500 bg-radiomke-orange-500"
                  : "text-radiomke-cream-500 hover:bg-radiomke-charcoal-700"
              }`}
            >
              🕐 Hourly Patterns
            </button>
            <button
              onClick={() => setActiveTab("daypart")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === "daypart"
                  ? "text-radiomke-cream-500 bg-radiomke-orange-500"
                  : "text-radiomke-cream-500 hover:bg-radiomke-charcoal-700"
              }`}
            >
              🌅 Daypart Analysis
            </button>
            <button
              onClick={() => setActiveTab("device")}
              className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                activeTab === "device"
                  ? "text-radiomke-cream-500 bg-radiomke-orange-500"
                  : "text-radiomke-cream-500 hover:bg-radiomke-charcoal-700"
              }`}
            >
              📱 Device/Platform
            </button>
            <div className="pt-4 mt-4 border-t border-radiomke-charcoal-400/30">
              <a
                href="#upload"
                className="block px-4 py-2 rounded-lg text-radiomke-cream-600 hover:bg-radiomke-charcoal-700 hover:text-radiomke-cream-500 transition-colors text-sm"
              >
                📤 Upload Data
              </a>
              <a
                href="#guide"
                className="block px-4 py-2 rounded-lg text-radiomke-cream-600 hover:bg-radiomke-charcoal-700 hover:text-radiomke-cream-500 transition-colors text-sm"
              >
                📚 Export Guide
              </a>
            </div>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="bg-radiomke-charcoal-600 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-radiomke-cream-500 mb-2">
                Welcome to Radio Milwaukee Analytics
              </h2>
              <p className="text-radiomke-cream-500 mb-4">
                Analyze streaming metrics from Triton Webcast and correlate with Nielsen ratings data.
                Upload your CSV files to get started, or use the AI assistant to ask questions about your data.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                <div className="bg-radiomke-charcoal-700 rounded-lg p-4">
                  <h3 className="text-radiomke-cream-500 font-semibold mb-1">Uploaded Files</h3>
                  <p className="text-3xl font-bold text-radiomke-orange-400">
                    {dataContext.uploadedFiles.length}
                  </p>
                  <p className="text-xs text-radiomke-cream-600 mt-1">of 22 possible exports</p>
                </div>
                <div className="bg-radiomke-charcoal-700 rounded-lg p-4 border border-radiomke-blue-500/20">
                  <h3 className="text-radiomke-cream-500 font-semibold mb-1">Total Records</h3>
                  <p className="text-3xl font-bold text-radiomke-blue-400">
                    {dataContext.streamingData.length.toLocaleString()}
                  </p>
                  <p className="text-xs text-radiomke-cream-600 mt-1">all time</p>
                </div>
                <div className="bg-radiomke-charcoal-700 rounded-lg p-4 border border-radiomke-blue-500/20">
                  <h3 className="text-radiomke-cream-500 font-semibold mb-1">Filtered View</h3>
                  <p className="text-3xl font-bold text-radiomke-blue-300">
                    {filteredData.length.toLocaleString()}
                  </p>
                  <p className="text-xs text-radiomke-cream-600 mt-1">current filter</p>
                </div>
                <div className="bg-radiomke-charcoal-700 rounded-lg p-4 border border-radiomke-orange-500/20">
                  <h3 className="text-radiomke-cream-500 font-semibold mb-1">Status</h3>
                  <p className="text-lg font-semibold text-radiomke-orange-400">
                    Ready
                  </p>
                  <p className="text-xs text-radiomke-cream-600 mt-1">data persists on refresh</p>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-radiomke-charcoal-600 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-radiomke-cream-500 mb-4">
                Upload Triton or Nielsen Data
              </h3>
              <FileUploader
                onFilesUploaded={handleFilesUploaded}
                onError={(msg) => setError(msg)}
              />
            </div>

            {/* CSV Export Guide */}
            <div className="mb-6">
              <CSVExportGuide uploadedFiles={dataContext.uploadedFiles.map((f) => f.name)} />
            </div>

            {/* Data Summary */}
            {dataContext.uploadedFiles.length > 0 && (
              <DataSummary
                uploadedFiles={dataContext.uploadedFiles}
                metricsData={dataContext.streamingData}
                onRemoveFile={handleRemoveFile}
              />
            )}

            {/* Dashboard Components */}
            {dataContext.streamingData.length > 0 && (
              <div className="space-y-6 mt-6">
                {/* KPI Summary Cards */}
                <KPISummary data={filteredData} />

                {/* Dashboard Tabs */}
                <DashboardTabs
                  tabs={[
                    { id: "overview", label: "Overview" },
                    { id: "hourly", label: "Hourly Patterns" },
                    { id: "daypart", label: "Daypart Analysis" },
                    { id: "device", label: "Device/Platform" },
                  ]}
                  activeTab={activeTab}
                  onTabChange={setActiveTab}
                />

                {/* Overview Tab */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <MetricsOverview data={filteredData} />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <TrendAnalysis data={filteredData} />
                      <div className="bg-radiomke-charcoal-600 rounded-lg p-6 border border-radiomke-charcoal-400/30">
                        <h3 className="text-lg font-semibold text-radiomke-cream-500 mb-4">Quick Stats</h3>
                        <div className="space-y-3">
                          <div>
                            <p className="text-sm text-radiomke-cream-600">Total Data Points</p>
                            <p className="text-2xl font-bold text-radiomke-orange-400">
                              {filteredData.length.toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-radiomke-cream-600">Date Range</p>
                            <p className="text-sm text-radiomke-cream-500">
                              {filteredData.length > 0
                                ? `${new Date(Math.min(...filteredData.map((m) => m.date.getTime()))).toLocaleDateString()} - ${new Date(Math.max(...filteredData.map((m) => m.date.getTime()))).toLocaleDateString()}`
                                : "No data"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hourly Patterns Tab */}
                {activeTab === "hourly" && (
                  <DashboardSection
                    title="Hourly Listening Patterns"
                    description="Analyze audience behavior by hour of day"
                    hasData={dataAvailability.hasHourly}
                    missingDataMessage="Upload hourly patterns CSV to see peak listening times by hour"
                    requiredExport="radio_milwaukee_hourly_patterns.csv"
                  >
                    <HourlyPatterns data={filteredData} />
                  </DashboardSection>
                )}

                {/* Daypart Tab */}
                {activeTab === "daypart" && (
                  <DashboardSection
                    title="Daypart Performance Analysis"
                    description="Compare performance across dayparts (Morning Drive, Midday, etc.)"
                    hasData={dataAvailability.hasDaypart}
                    missingDataMessage="Upload daypart performance CSV to see analysis by time period"
                    requiredExport="radio_milwaukee_daypart_performance.csv"
                  >
                    <DaypartComparison data={filteredData} />
                  </DashboardSection>
                )}

                {/* Device/Platform Tab */}
                {activeTab === "device" && (
                  <DashboardSection
                    title="Device & Platform Analysis"
                    description="Listener distribution across Smart Speaker, Mobile, Desktop, etc."
                    hasData={dataAvailability.hasDevice}
                    missingDataMessage="Upload device analysis CSV to see platform breakdown"
                    requiredExport="radio_milwaukee_device_analysis.csv"
                  >
                    <DeviceAnalysis data={filteredData} />
                  </DashboardSection>
                )}
              </div>
            )}
          </div>
        </main>

        {/* CopilotKit AI Sidebar */}
        <CopilotSidebar
          defaultOpen={false}
          labels={{
            title: "Analytics Assistant",
            initial: "How can I help you analyze your radio metrics today?",
          }}
          instructions="You are an expert radio analytics assistant. Help users analyze streaming data from Triton Webcast and Nielsen ratings. Always apply proper CUME averaging rules (never sum CUME values). Provide insights on programming decisions, daypart performance, and audience trends."
        />
      </div>

      {/* Error Toast */}
      {error && (
        <ErrorToast
          message={error}
          onClose={() => setError(null)}
          type="error"
        />
      )}
    </div>
  );
}
