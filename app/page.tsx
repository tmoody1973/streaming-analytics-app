"use client";

import { useState, useEffect } from "react";
import { CopilotSidebar } from "@copilotkit/react-ui";
import { useCopilotReadable } from "@copilotkit/react-core";
import type { DataContext, RadioMetrics, UploadedFile } from "@/types";
import FileUploader from "@/components/data-upload/FileUploader";
import DataSummary from "@/components/data-upload/DataSummary";
import ErrorToast from "@/components/ui/ErrorToast";
import MetricsOverview from "@/components/dashboard/MetricsOverview";
import TrendAnalysis from "@/components/dashboard/TrendAnalysis";
import DaypartComparison from "@/components/dashboard/DaypartComparison";
import DeviceAnalysis from "@/components/dashboard/DeviceAnalysis";

export default function Home() {
  const [dataContext, setDataContext] = useState<DataContext>({
    streamingData: [],
    uploadedFiles: [],
    lastUpdated: new Date(),
  });

  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleFilesUploaded = (files: UploadedFile[]) => {
    console.log("Files uploaded:", files); // Debug log

    setDataContext((prev) => {
      const newFiles = [...prev.uploadedFiles, ...files];

      // Extract metrics data from successful uploads
      const newMetrics = files
        .filter((f) => f.status === "completed")
        .flatMap((f) => {
          const fileData = (f as any).data || [];
          console.log(`Extracting ${fileData.length} metrics from ${f.name}`); // Debug log
          return fileData;
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
      lastUpdated: new Date(),
    }));
  };

  // Make data accessible to AI
  useCopilotReadable({
    description: "Radio Milwaukee streaming and Nielsen analytics data",
    value: dataContext,
  });

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-white">
                Radio Milwaukee
              </h1>
              <p className="text-sm text-gray-400">Streaming Analytics Platform</p>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400">
                Last Updated: {mounted ? dataContext.lastUpdated.toLocaleString() : "Loading..."}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-gray-800 min-h-screen border-r border-gray-700">
          <nav className="p-4 space-y-2">
            <a
              href="#dashboard"
              className="block px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </a>
            <a
              href="#upload"
              className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Upload Data
            </a>
            <a
              href="#trends"
              className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Trend Analysis
            </a>
            <a
              href="#nielsen"
              className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Nielsen Integration
            </a>
            <a
              href="#demographics"
              className="block px-4 py-2 rounded-lg text-gray-300 hover:bg-gray-700 transition-colors"
            >
              Demographics
            </a>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-white mb-2">
                Welcome to Radio Milwaukee Analytics
              </h2>
              <p className="text-gray-300 mb-4">
                Analyze streaming metrics from Triton Webcast and correlate with Nielsen ratings data.
                Upload your CSV files to get started, or use the AI assistant to ask questions about your data.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-1">Uploaded Files</h3>
                  <p className="text-3xl font-bold text-blue-400">
                    {dataContext.uploadedFiles.length}
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-1">Data Records</h3>
                  <p className="text-3xl font-bold text-green-400">
                    {dataContext.streamingData.length}
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h3 className="text-white font-semibold mb-1">Status</h3>
                  <p className="text-lg font-semibold text-yellow-400">
                    Ready
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Section */}
            <div className="bg-gray-800 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                Upload Triton or Nielsen Data
              </h3>
              <FileUploader
                onFilesUploaded={handleFilesUploaded}
                onError={(msg) => setError(msg)}
              />
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
                <MetricsOverview data={dataContext.streamingData} />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <TrendAnalysis data={dataContext.streamingData} />
                  <DaypartComparison data={dataContext.streamingData} />
                </div>

                <DeviceAnalysis data={dataContext.streamingData} />
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
