"use client";

import { useState } from "react";
import { X, Upload, Database, Sparkles, Link2, Info, FileText } from "lucide-react";

interface DataGuideProps {
  onClose: () => void;
}

export function DataGuide({ onClose }: DataGuideProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "upload" | "query" | "combine" | "exports">("overview");

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-radiomke-charcoal-700 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden border border-radiomke-orange-500/20">
        {/* Header */}
        <div className="bg-gradient-to-r from-radiomke-orange-500 to-radiomke-orange-600 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close guide"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-2xl font-bold mb-2">📊 Data Management Guide</h2>
          <p className="text-radiomke-cream-500/90 text-sm">
            Learn how to upload, manage, and visualize your radio analytics data
          </p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-radiomke-charcoal-400/30 bg-radiomke-charcoal-600">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "overview"
                ? "text-radiomke-orange-400 border-b-2 border-radiomke-orange-400"
                : "text-radiomke-cream-600 hover:text-radiomke-cream-500"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("upload")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "upload"
                ? "text-radiomke-orange-400 border-b-2 border-radiomke-orange-400"
                : "text-radiomke-cream-600 hover:text-radiomke-cream-500"
            }`}
          >
            Upload CSV
          </button>
          <button
            onClick={() => setActiveTab("query")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "query"
                ? "text-radiomke-orange-400 border-b-2 border-radiomke-orange-400"
                : "text-radiomke-cream-600 hover:text-radiomke-cream-500"
            }`}
          >
            Create Charts
          </button>
          <button
            onClick={() => setActiveTab("combine")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "combine"
                ? "text-radiomke-orange-400 border-b-2 border-radiomke-orange-400"
                : "text-radiomke-cream-600 hover:text-radiomke-cream-500"
            }`}
          >
            Combine Data
          </button>
          <button
            onClick={() => setActiveTab("exports")}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === "exports"
                ? "text-radiomke-orange-400 border-b-2 border-radiomke-orange-400"
                : "text-radiomke-cream-600 hover:text-radiomke-cream-500"
            }`}
          >
            Export Guide
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === "overview" && <OverviewTab />}
          {activeTab === "upload" && <UploadTab />}
          {activeTab === "query" && <QueryTab />}
          {activeTab === "combine" && <CombineTab />}
          {activeTab === "exports" && <ExportsTab />}
        </div>
      </div>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="bg-radiomke-blue-500/10 border border-radiomke-blue-500/30 rounded-lg p-5">
        <h3 className="text-radiomke-blue-300 font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          What's New: Smarter Data Management
        </h3>
        <p className="text-radiomke-cream-600 text-sm leading-relaxed">
          Your analytics dashboard now <strong className="text-radiomke-cream-500">automatically discovers</strong> uploaded datasets
          and understands their structure. No more setup required - just upload and analyze!
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Feature 1 */}
        <div className="bg-radiomke-charcoal-600 rounded-lg p-5 border border-radiomke-charcoal-400/30">
          <div className="w-12 h-12 bg-radiomke-orange-500/10 rounded-lg flex items-center justify-center mb-3">
            <Upload className="w-6 h-6 text-radiomke-orange-400" />
          </div>
          <h4 className="text-radiomke-cream-500 font-semibold mb-2">Automatic Discovery</h4>
          <p className="text-radiomke-cream-600 text-sm">
            Upload any CSV file and the system instantly detects it. Your AI assistant will automatically see new datasets without any configuration.
          </p>
        </div>

        {/* Feature 2 */}
        <div className="bg-radiomke-charcoal-600 rounded-lg p-5 border border-radiomke-charcoal-400/30">
          <div className="w-12 h-12 bg-radiomke-blue-500/10 rounded-lg flex items-center justify-center mb-3">
            <Database className="w-6 h-6 text-radiomke-blue-400" />
          </div>
          <h4 className="text-radiomke-cream-500 font-semibold mb-2">Smart Schema Detection</h4>
          <p className="text-radiomke-cream-600 text-sm">
            The AI inspects your data to understand column names, types, and relationships. It knows what metrics are available before creating charts.
          </p>
        </div>

        {/* Feature 3 */}
        <div className="bg-radiomke-charcoal-600 rounded-lg p-5 border border-radiomke-charcoal-400/30">
          <div className="w-12 h-12 bg-radiomke-orange-500/10 rounded-lg flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6 text-radiomke-orange-400" />
          </div>
          <h4 className="text-radiomke-cream-500 font-semibold mb-2">Real Data Only</h4>
          <p className="text-radiomke-cream-600 text-sm">
            The AI now uses <strong className="text-radiomke-cream-500">only your actual data</strong> - no more made-up examples or fake demographics. Every chart shows real metrics from your CSVs.
          </p>
        </div>

        {/* Feature 4 */}
        <div className="bg-radiomke-charcoal-600 rounded-lg p-5 border border-radiomke-charcoal-400/30">
          <div className="w-12 h-12 bg-radiomke-blue-500/10 rounded-lg flex items-center justify-center mb-3">
            <Link2 className="w-6 h-6 text-radiomke-blue-400" />
          </div>
          <h4 className="text-radiomke-cream-500 font-semibold mb-2">Multi-Dataset Support</h4>
          <p className="text-radiomke-cream-600 text-sm">
            Upload multiple CSVs and the AI can work with all of them. Combine daily metrics with device analysis for deeper insights.
          </p>
        </div>
      </div>

      <div className="bg-radiomke-charcoal-600 rounded-lg p-5 border-l-4 border-radiomke-orange-500">
        <h4 className="text-radiomke-cream-500 font-semibold mb-2 flex items-center gap-2">
          <Info className="w-5 h-5 text-radiomke-orange-400" />
          How It Works
        </h4>
        <ol className="space-y-2 text-radiomke-cream-600 text-sm">
          <li className="flex gap-3">
            <span className="text-radiomke-orange-400 font-bold">1.</span>
            <span>Upload your Triton CSV files using the upload button</span>
          </li>
          <li className="flex gap-3">
            <span className="text-radiomke-orange-400 font-bold">2.</span>
            <span>Data is automatically stored and indexed in the database</span>
          </li>
          <li className="flex gap-3">
            <span className="text-radiomke-orange-400 font-bold">3.</span>
            <span>Ask the AI to create visualizations from your data</span>
          </li>
          <li className="flex gap-3">
            <span className="text-radiomke-orange-400 font-bold">4.</span>
            <span>The AI inspects your data structure and creates accurate charts</span>
          </li>
        </ol>
      </div>
    </div>
  );
}

function UploadTab() {
  return (
    <div className="space-y-6">
      <div className="bg-radiomke-orange-500/10 border border-radiomke-orange-500/30 rounded-lg p-5">
        <h3 className="text-radiomke-orange-300 font-semibold mb-2">
          📤 Uploading CSV Files
        </h3>
        <p className="text-radiomke-cream-600 text-sm">
          Upload Triton Webcast Metrics exports or any CSV file with radio analytics data.
          The system will automatically create a database table and make it available to the AI.
        </p>
      </div>

      {/* Step-by-step */}
      <div className="space-y-4">
        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-radiomke-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            1
          </div>
          <div className="flex-1">
            <h4 className="text-radiomke-cream-500 font-semibold mb-2">Export from Triton</h4>
            <p className="text-radiomke-cream-600 text-sm mb-3">
              Log into Triton Webcast Metrics and export your desired report as CSV.
              Recommended exports:
            </p>
            <ul className="space-y-1 text-radiomke-cream-600 text-sm pl-4">
              <li className="flex items-start gap-2">
                <span className="text-radiomke-orange-400">•</span>
                <span><strong className="text-radiomke-cream-500">Daily Overview:</strong> CUME, TLH, TSL by date</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-radiomke-orange-400">•</span>
                <span><strong className="text-radiomke-cream-500">Device Analysis:</strong> Metrics broken down by device type</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-radiomke-orange-400">•</span>
                <span><strong className="text-radiomke-cream-500">Daypart Performance:</strong> Morning drive, midday, etc.</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-radiomke-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            2
          </div>
          <div className="flex-1">
            <h4 className="text-radiomke-cream-500 font-semibold mb-2">Name Your File</h4>
            <p className="text-radiomke-cream-600 text-sm mb-3">
              Use clear, descriptive names that start with <code className="bg-radiomke-charcoal-600 px-2 py-1 rounded text-radiomke-orange-400 text-xs">radio_milwaukee_</code>
            </p>
            <div className="bg-radiomke-charcoal-600 rounded p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <code className="text-radiomke-cream-500 text-xs">radio_milwaukee_daily_overview.csv</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-400">✓</span>
                <code className="text-radiomke-cream-500 text-xs">radio_milwaukee_device_analysis.csv</code>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-red-400">✗</span>
                <code className="text-radiomke-cream-600 text-xs">data.csv</code>
                <span className="text-radiomke-cream-600 text-xs">(too generic)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-radiomke-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            3
          </div>
          <div className="flex-1">
            <h4 className="text-radiomke-cream-500 font-semibold mb-2">Upload to Dashboard</h4>
            <p className="text-radiomke-cream-600 text-sm mb-3">
              Click the <strong className="text-radiomke-cream-500">Upload CSV</strong> button or drag and drop your file.
              The system will:
            </p>
            <ul className="space-y-1 text-radiomke-cream-600 text-sm pl-4">
              <li className="flex items-start gap-2">
                <span className="text-radiomke-blue-400">→</span>
                <span>Create a database table with your file name</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-radiomke-blue-400">→</span>
                <span>Detect column types (numbers, text, dates)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-radiomke-blue-400">→</span>
                <span>Import all rows into the database</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-radiomke-blue-400">→</span>
                <span>Make data instantly available to the AI</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 bg-radiomke-orange-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
            4
          </div>
          <div className="flex-1">
            <h4 className="text-radiomke-cream-500 font-semibold mb-2">Data Persists Permanently</h4>
            <p className="text-radiomke-cream-600 text-sm">
              Once uploaded, your data stays in the database. No need to re-upload when you start a new session.
              You can upload updated files with new data and they'll be added to the existing table.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-radiomke-blue-500/10 border border-radiomke-blue-500/30 rounded-lg p-4">
        <h4 className="text-radiomke-blue-300 font-semibold mb-2 text-sm">💡 Pro Tip</h4>
        <p className="text-radiomke-cream-600 text-sm">
          Upload multiple related files (like daily_overview + device_analysis) and the AI can analyze
          them together to find patterns across different dimensions of your data.
        </p>
      </div>
    </div>
  );
}

function QueryTab() {
  return (
    <div className="space-y-6">
      <div className="bg-radiomke-blue-500/10 border border-radiomke-blue-500/30 rounded-lg p-5">
        <h3 className="text-radiomke-blue-300 font-semibold mb-2">
          📈 Creating Charts with AI
        </h3>
        <p className="text-radiomke-cream-600 text-sm">
          Simply ask the AI to create visualizations in plain English.
          The AI will automatically discover your data, understand its structure, and create accurate charts.
        </p>
      </div>

      {/* What Happens Behind the Scenes */}
      <div className="bg-radiomke-charcoal-600 rounded-lg p-5 border border-radiomke-charcoal-400/30">
        <h4 className="text-radiomke-cream-500 font-semibold mb-3">
          How the AI Creates Charts (Behind the Scenes)
        </h4>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-radiomke-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-radiomke-orange-400 text-xs font-bold">1</span>
            </div>
            <div>
              <p className="text-radiomke-cream-500 font-medium text-sm">Discovers Available Tables</p>
              <p className="text-radiomke-cream-600 text-xs">Automatically finds all uploaded CSV files</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-radiomke-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-radiomke-orange-400 text-xs font-bold">2</span>
            </div>
            <div>
              <p className="text-radiomke-cream-500 font-medium text-sm">Inspects Schema</p>
              <p className="text-radiomke-cream-600 text-xs">Checks what columns exist and their data types</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-radiomke-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-radiomke-orange-400 text-xs font-bold">3</span>
            </div>
            <div>
              <p className="text-radiomke-cream-500 font-medium text-sm">Fetches Real Data</p>
              <p className="text-radiomke-cream-600 text-xs">Queries the database for actual values</p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <div className="flex-shrink-0 w-6 h-6 bg-radiomke-orange-500/20 rounded-full flex items-center justify-center">
              <span className="text-radiomke-orange-400 text-xs font-bold">4</span>
            </div>
            <div>
              <p className="text-radiomke-cream-500 font-medium text-sm">Generates Visualization</p>
              <p className="text-radiomke-cream-600 text-xs">Creates interactive charts using your real data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Example Queries */}
      <div>
        <h4 className="text-radiomke-cream-500 font-semibold mb-3">Example Queries You Can Try</h4>
        <div className="space-y-3">
          <div className="bg-radiomke-charcoal-600 rounded-lg p-4 border border-radiomke-charcoal-400/30">
            <p className="text-radiomke-cream-500 font-medium text-sm mb-1">
              "Show me CUME trends over the last 30 days"
            </p>
            <p className="text-radiomke-cream-600 text-xs">
              Creates a line chart with daily CUME values
            </p>
          </div>

          <div className="bg-radiomke-charcoal-600 rounded-lg p-4 border border-radiomke-charcoal-400/30">
            <p className="text-radiomke-cream-500 font-medium text-sm mb-1">
              "Compare listening hours across different devices"
            </p>
            <p className="text-radiomke-cream-600 text-xs">
              Creates a bar chart comparing TLH by device type
            </p>
          </div>

          <div className="bg-radiomke-charcoal-600 rounded-lg p-4 border border-radiomke-charcoal-400/30">
            <p className="text-radiomke-cream-500 font-medium text-sm mb-1">
              "What are the top performing days this month?"
            </p>
            <p className="text-radiomke-cream-600 text-xs">
              Analyzes active sessions and shows peak days
            </p>
          </div>

          <div className="bg-radiomke-charcoal-600 rounded-lg p-4 border border-radiomke-charcoal-400/30">
            <p className="text-radiomke-cream-500 font-medium text-sm mb-1">
              "Show me a summary table of all metrics"
            </p>
            <p className="text-radiomke-cream-600 text-xs">
              Creates an interactive data table with all columns
            </p>
          </div>
        </div>
      </div>

      <div className="bg-radiomke-orange-500/10 border border-radiomke-orange-500/30 rounded-lg p-4">
        <h4 className="text-radiomke-orange-300 font-semibold mb-2 text-sm">✨ Key Improvement</h4>
        <p className="text-radiomke-cream-600 text-sm">
          The AI now <strong className="text-radiomke-cream-500">never invents data</strong>. Every number,
          column name, and metric comes directly from your uploaded CSV files. No more fake demographics or made-up examples!
        </p>
      </div>
    </div>
  );
}

function CombineTab() {
  return (
    <div className="space-y-6">
      <div className="bg-radiomke-orange-500/10 border border-radiomke-orange-500/30 rounded-lg p-5">
        <h3 className="text-radiomke-orange-300 font-semibold mb-2">
          🔗 Combining Multiple Datasets
        </h3>
        <p className="text-radiomke-cream-600 text-sm">
          When you upload multiple related CSV files, the AI can analyze them together
          to uncover deeper insights across different dimensions of your data.
        </p>
      </div>

      {/* Current Capabilities */}
      <div>
        <h4 className="text-radiomke-cream-500 font-semibold mb-3">✅ What Works Now</h4>
        <div className="space-y-3">
          <div className="bg-radiomke-charcoal-600 rounded-lg p-4 border-l-4 border-radiomke-blue-500">
            <p className="text-radiomke-cream-500 font-medium text-sm mb-2">
              Multiple Independent Queries
            </p>
            <p className="text-radiomke-cream-600 text-sm">
              Ask the AI to analyze data from different tables separately.
              Example: "Show CUME from daily overview, then show device breakdown"
            </p>
          </div>

          <div className="bg-radiomke-charcoal-600 rounded-lg p-4 border-l-4 border-radiomke-blue-500">
            <p className="text-radiomke-cream-500 font-medium text-sm mb-2">
              Side-by-Side Comparisons
            </p>
            <p className="text-radiomke-cream-600 text-sm">
              Create separate charts from different datasets and place them on the same canvas for visual comparison.
            </p>
          </div>
        </div>
      </div>

      {/* Coming Soon */}
      <div>
        <h4 className="text-radiomke-cream-500 font-semibold mb-3">🚧 Coming Soon</h4>
        <div className="space-y-3">
          <div className="bg-radiomke-charcoal-600 rounded-lg p-4 border-l-4 border-radiomke-orange-500 opacity-75">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-radiomke-cream-500 font-medium text-sm">
                Automatic Data Joins
              </p>
              <span className="text-xs bg-radiomke-orange-500/20 text-radiomke-orange-400 px-2 py-1 rounded">
                Planned
              </span>
            </div>
            <p className="text-radiomke-cream-600 text-sm mb-2">
              System will detect matching columns (like 'date' or 'station') and suggest combining datasets.
            </p>
            <p className="text-radiomke-cream-600 text-xs italic">
              Example: "Both files have a 'date' column - would you like to create a combined view?"
            </p>
          </div>

          <div className="bg-radiomke-charcoal-600 rounded-lg p-4 border-l-4 border-radiomke-orange-500 opacity-75">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-radiomke-cream-500 font-medium text-sm">
                Data Catalog UI
              </p>
              <span className="text-xs bg-radiomke-orange-500/20 text-radiomke-orange-400 px-2 py-1 rounded">
                In Progress
              </span>
            </div>
            <p className="text-radiomke-cream-600 text-sm">
              Browse all uploaded CSVs, view their columns, see sample data, and manage relationships between tables.
            </p>
          </div>

          <div className="bg-radiomke-charcoal-600 rounded-lg p-4 border-l-4 border-radiomke-orange-500 opacity-75">
            <div className="flex items-center gap-2 mb-2">
              <p className="text-radiomke-cream-500 font-medium text-sm">
                Predefined Views
              </p>
              <span className="text-xs bg-radiomke-orange-500/20 text-radiomke-orange-400 px-2 py-1 rounded">
                Planned
              </span>
            </div>
            <p className="text-radiomke-cream-600 text-sm">
              Pre-configured combined datasets like "daily_device_analysis" that join multiple tables for common use cases.
            </p>
          </div>
        </div>
      </div>

      {/* Workaround */}
      <div className="bg-radiomke-blue-500/10 border border-radiomke-blue-500/30 rounded-lg p-4">
        <h4 className="text-radiomke-blue-300 font-semibold mb-2 text-sm">💡 Current Workaround</h4>
        <p className="text-radiomke-cream-600 text-sm mb-3">
          To analyze related data from multiple CSVs together:
        </p>
        <ol className="space-y-2 text-radiomke-cream-600 text-sm pl-4">
          <li className="flex gap-2">
            <span className="text-radiomke-blue-400">1.</span>
            <span>Manually join the data in Excel or Google Sheets before uploading</span>
          </li>
          <li className="flex gap-2">
            <span className="text-radiomke-blue-400">2.</span>
            <span>Export the combined data as a new CSV</span>
          </li>
          <li className="flex gap-2">
            <span className="text-radiomke-blue-400">3.</span>
            <span>Upload the combined CSV with a descriptive name like <code className="bg-radiomke-charcoal-600 px-1.5 py-0.5 rounded text-radiomke-orange-400 text-xs">radio_milwaukee_daily_device_combined.csv</code></span>
          </li>
        </ol>
      </div>
    </div>
  );
}

function ExportsTab() {
  return (
    <div className="space-y-6">
      <div className="bg-radiomke-orange-500/10 border border-radiomke-orange-500/30 rounded-lg p-5">
        <h3 className="text-radiomke-orange-300 font-semibold mb-2 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Complete CSV Export Guide
        </h3>
        <p className="text-radiomke-cream-600 text-sm">
          This comprehensive guide lists all 22 possible CSV exports from Triton Webcast Metrics and Nielsen
          to make the Radio Milwaukee analytics app fully functional for program director decision-making.
        </p>
      </div>

      {/* Essential Exports */}
      <div>
        <h4 className="text-radiomke-cream-500 font-semibold mb-3 flex items-center gap-2">
          🟢 Essential Exports (Start Here)
        </h4>
        <div className="space-y-3">
          <ExportCard
            name="Daily Overview"
            filename="radio_milwaukee_daily_overview.csv"
            description="Main dashboard metrics and trend analysis"
            columns={["Date", "Station", "CUME", "TLH", "Active Sessions", "AAS"]}
            steps={[
              "Date Range: Last 18 Months",
              "Dimension: Date (daily breakdown)",
              "Include all stations",
            ]}
          />
          <ExportCard
            name="Daypart Performance"
            filename="radio_milwaukee_daypart_performance.csv"
            description="Compare performance across different time periods"
            columns={["Daypart", "CUME", "TLH", "Active Sessions", "TSL"]}
            steps={[
              "Date Range: Last 18 Months",
              "Dimension: Daypart (Morning Drive, Mid-Day, etc.)",
            ]}
          />
          <ExportCard
            name="Device Analysis"
            filename="radio_milwaukee_device_analysis.csv"
            description="Understand how listeners access your streams"
            columns={["Device Family", "CUME", "TLH", "Active Sessions"]}
            steps={[
              "Date Range: Last 18 Months",
              "Dimension: Device Family or Platform",
            ]}
          />
        </div>
      </div>

      {/* Recommended Exports */}
      <div>
        <h4 className="text-radiomke-cream-500 font-semibold mb-3 flex items-center gap-2">
          🟡 Recommended Exports
        </h4>
        <div className="space-y-3">
          <ExportCard
            name="Day of Week Analysis"
            filename="radio_milwaukee_day_of_week.csv"
            description="Understand weekly listening patterns"
            columns={["Day of Week", "CUME", "TLH", "Active Sessions"]}
            steps={[
              "Date Range: Last 18 Months",
              "Dimension: Day of Week",
            ]}
          />
          <ExportCard
            name="Monthly Trends"
            filename="radio_milwaukee_monthly_trends.csv"
            description="Long-term trend analysis for strategic planning"
            columns={["Month/Year", "CUME", "TLH", "Active Sessions"]}
            steps={[
              "Date Range: Last 12 Months",
              "Dimension: Month/Year",
            ]}
          />
          <ExportCard
            name="Hourly Patterns"
            filename="radio_milwaukee_hourly_patterns.csv"
            description="Identify peak listening hours for programming decisions"
            columns={["Hour of Day", "CUME", "TLH", "Active Sessions"]}
            steps={[
              "Date Range: Last 18 Months",
              "Dimension: Hour of Day (0-23)",
            ]}
          />
        </div>
      </div>

      {/* Advanced Exports Info */}
      <div className="bg-radiomke-blue-500/10 border border-radiomke-blue-500/30 rounded-lg p-4">
        <h4 className="text-radiomke-blue-300 font-semibold mb-2 text-sm">🔵 Advanced Exports Available</h4>
        <p className="text-radiomke-cream-600 text-sm mb-3">
          Beyond the essential and recommended exports, there are 16 additional advanced exports available:
        </p>
        <ul className="space-y-1 text-radiomke-cream-600 text-sm pl-4">
          <li className="flex items-start gap-2">
            <span className="text-radiomke-blue-400">•</span>
            <span><strong>Detailed Daypart Exports:</strong> Morning Drive (6AM-10AM), Midday (10AM-3PM), Afternoon Drive (3PM-7PM), Evening (7PM-12AM), Weekend Daytime, Weekend Evening, Overnight</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-radiomke-blue-400">•</span>
            <span><strong>Geographic Analysis:</strong> CUME distribution by location</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-radiomke-blue-400">•</span>
            <span><strong>Stream Comparison:</strong> Performance across different Radio Milwaukee streams</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-radiomke-blue-400">•</span>
            <span><strong>Cross-Analysis:</strong> Daypart by Device, Weekend vs Weekday</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-radiomke-blue-400">•</span>
            <span><strong>Nielsen Demographics:</strong> Age, Gender, Ethnic, Daypart Demographics, P1 Listeners</span>
          </li>
        </ul>
      </div>

      {/* File Naming Convention */}
      <div className="bg-radiomke-charcoal-600 rounded-lg p-5 border border-radiomke-charcoal-400/30">
        <h4 className="text-radiomke-cream-500 font-semibold mb-3">📝 File Naming Convention</h4>
        <p className="text-radiomke-cream-600 text-sm mb-3">
          Use this naming pattern for easy identification:
        </p>
        <div className="bg-radiomke-charcoal-700 rounded p-3 mb-3">
          <code className="text-radiomke-orange-400 text-sm">
            radio_milwaukee_[analysis_type]_[date_range].csv
          </code>
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-400">✓</span>
            <code className="text-radiomke-cream-500 text-xs">radio_milwaukee_daily_overview_last30days.csv</code>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-green-400">✓</span>
            <code className="text-radiomke-cream-500 text-xs">radio_milwaukee_device_analysis_18months.csv</code>
          </div>
        </div>
      </div>

      {/* Upload Order Recommendation */}
      <div className="bg-radiomke-orange-500/10 border border-radiomke-orange-500/30 rounded-lg p-4">
        <h4 className="text-radiomke-orange-300 font-semibold mb-2 text-sm">✨ Upload Order Recommendation</h4>
        <p className="text-radiomke-cream-600 text-sm mb-3">
          For best results, upload files in this order:
        </p>
        <ol className="space-y-1 text-radiomke-cream-600 text-sm pl-4">
          <li className="flex gap-2">
            <span className="text-radiomke-orange-400 font-bold">1.</span>
            <span>Daily Overview (primary data)</span>
          </li>
          <li className="flex gap-2">
            <span className="text-radiomke-orange-400 font-bold">2.</span>
            <span>Daypart Performance</span>
          </li>
          <li className="flex gap-2">
            <span className="text-radiomke-orange-400 font-bold">3.</span>
            <span>Device Analysis</span>
          </li>
          <li className="flex gap-2">
            <span className="text-radiomke-orange-400 font-bold">4.</span>
            <span>Day of Week Analysis</span>
          </li>
          <li className="flex gap-2">
            <span className="text-radiomke-orange-400 font-bold">5.</span>
            <span>Additional analysis files as needed</span>
          </li>
        </ol>
        <p className="text-radiomke-cream-600 text-xs mt-3">
          This ensures the main dashboard populates first, then additional analysis features become available as you upload more specific data files.
        </p>
      </div>

      {/* Multi-Station Note */}
      <div className="bg-radiomke-blue-500/10 border border-radiomke-blue-500/30 rounded-lg p-4">
        <h4 className="text-radiomke-blue-300 font-semibold mb-2 text-sm">📻 Multi-Station Data Management</h4>
        <p className="text-radiomke-cream-600 text-sm mb-3">
          Radio Milwaukee operates multiple stations and streams. Each CSV export should include a "Station" or "Stream" column to enable filtering and comparison.
        </p>
        <p className="text-radiomke-cream-600 text-sm">
          <strong className="text-radiomke-cream-500">Recommended approach:</strong> Generate combined CSV files with station identification columns to enable easy cross-station analysis while maintaining the ability to filter by individual stations.
        </p>
      </div>

      {/* Link to Full Documentation */}
      <div className="bg-radiomke-charcoal-600 rounded-lg p-5 border-l-4 border-radiomke-orange-500">
        <h4 className="text-radiomke-cream-500 font-semibold mb-2 flex items-center gap-2">
          <Info className="w-5 h-5 text-radiomke-orange-400" />
          Complete Documentation
        </h4>
        <p className="text-radiomke-cream-600 text-sm">
          For detailed information on all 22 CSV exports, including specific Triton Webcast Explore settings,
          Nielsen demographics exports, and strategic applications, refer to the complete{" "}
          <code className="bg-radiomke-charcoal-700 px-2 py-1 rounded text-radiomke-orange-400 text-xs">
            docs/csv_exports_guide.md
          </code>{" "}
          documentation file in the project repository.
        </p>
      </div>
    </div>
  );
}

interface ExportCardProps {
  name: string;
  filename: string;
  description: string;
  columns: string[];
  steps: string[];
}

function ExportCard({ name, filename, description, columns, steps }: ExportCardProps) {
  return (
    <div className="bg-radiomke-charcoal-600 rounded-lg p-4 border border-radiomke-charcoal-400/30">
      <div className="mb-3">
        <h5 className="text-radiomke-cream-500 font-semibold mb-1">{name}</h5>
        <p className="text-radiomke-cream-600 text-sm mb-2">{description}</p>
      </div>

      <div className="space-y-2 text-sm">
        {/* Filename */}
        <div>
          <span className="text-radiomke-cream-600 text-xs">Filename: </span>
          <code className="text-radiomke-orange-400 bg-radiomke-charcoal-700 px-2 py-1 rounded text-xs">
            {filename}
          </code>
        </div>

        {/* Required Columns */}
        <div>
          <span className="text-radiomke-cream-600 text-xs">Required Columns: </span>
          <div className="flex flex-wrap gap-1 mt-1">
            {columns.map((col) => (
              <span
                key={col}
                className="text-xs bg-radiomke-charcoal-700 text-radiomke-blue-300 px-2 py-1 rounded"
              >
                {col}
              </span>
            ))}
          </div>
        </div>

        {/* Triton Steps */}
        <div>
          <span className="text-radiomke-cream-600 text-xs">Export Steps:</span>
          <ol className="list-decimal list-inside mt-1 space-y-1">
            {steps.map((step, idx) => (
              <li key={idx} className="text-xs text-radiomke-cream-500">
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
