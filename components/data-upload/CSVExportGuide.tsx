"use client";

import { useState } from "react";

interface CSVExport {
  id: string;
  name: string;
  description: string;
  priority: "essential" | "recommended" | "advanced";
  category: string;
  columns: string[];
  filename: string;
  tritonSteps: string[];
}

const csvExports: CSVExport[] = [
  // Essential Exports
  {
    id: "daily-overview",
    name: "Daily Overview",
    description: "Main dashboard data with daily breakdowns for comprehensive trend analysis",
    priority: "essential",
    category: "Core Data",
    columns: ["Date", "Station", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_daily_overview.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Dimension: Date (daily breakdown)",
      "Include all stations",
    ],
  },
  {
    id: "daypart-performance",
    name: "Daypart Performance",
    description: "Compare performance across different time periods (Morning, Midday, etc.)",
    priority: "essential",
    category: "Core Data",
    columns: ["Daypart", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_daypart_performance.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Dimension: Daypart",
      "Include all dayparts",
    ],
  },
  {
    id: "device-analysis",
    name: "Device Analysis",
    description: "Understand how listeners access your streams (Mobile, Desktop, etc.)",
    priority: "essential",
    category: "Core Data",
    columns: ["Device Family", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_device_analysis.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Dimension: Device Family or Platform",
      "Include all devices",
    ],
  },

  // Recommended Exports
  {
    id: "day-of-week",
    name: "Day of Week Analysis",
    description: "Understand weekly listening patterns and identify best days",
    priority: "recommended",
    category: "Time Analysis",
    columns: ["Day of Week", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_day_of_week.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Dimension: Day of Week",
    ],
  },
  {
    id: "monthly-trends",
    name: "Monthly Trends",
    description: "Long-term trend analysis for strategic planning",
    priority: "recommended",
    category: "Time Analysis",
    columns: ["Month/Year", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_monthly_trends.csv",
    tritonSteps: [
      "Select date range: Last 12 Months",
      "Dimension: Month/Year",
    ],
  },
  {
    id: "hourly-patterns",
    name: "Hourly Listening Patterns",
    description: "Identify peak listening hours for programming decisions",
    priority: "recommended",
    category: "Time Analysis",
    columns: ["Hour of Day", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_hourly_patterns.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Dimension: Hour of Day (0-23)",
    ],
  },

  // Advanced Daypart Exports
  {
    id: "morning-drive",
    name: "Morning Drive (6AM-10AM)",
    description: "Analyze peak morning commute performance in detail",
    priority: "advanced",
    category: "Daypart Detail",
    columns: ["Date", "Hour", "CUME", "TLH", "Active Sessions", "Device"],
    filename: "radio_milwaukee_morning_drive_6am_10am.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Daypart: Morning Drive (6AM-10AM)",
      "Dimensions: Date, Hour of Day",
    ],
  },
  {
    id: "midday",
    name: "Midday (10AM-3PM)",
    description: "Analyze midday listening patterns and at-work audience",
    priority: "advanced",
    category: "Daypart Detail",
    columns: ["Date", "Hour", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_midday_10am_3pm.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Daypart: Midday (10AM-3PM)",
      "Dimensions: Date, Hour of Day",
    ],
  },
  {
    id: "afternoon-drive",
    name: "Afternoon Drive (3PM-7PM)",
    description: "Analyze afternoon commute and after-school performance",
    priority: "advanced",
    category: "Daypart Detail",
    columns: ["Date", "Hour", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_afternoon_drive_3pm_7pm.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Daypart: Afternoon Drive (3PM-7PM)",
      "Dimensions: Date, Hour of Day",
    ],
  },
  {
    id: "evening",
    name: "Evening (7PM-12AM)",
    description: "Analyze evening entertainment and at-home listening",
    priority: "advanced",
    category: "Daypart Detail",
    columns: ["Date", "Hour", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_evening_7pm_12am.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Daypart: Evening (7PM-12AM)",
      "Dimensions: Date, Hour of Day",
    ],
  },
  {
    id: "overnight",
    name: "Overnight (12AM-6AM)",
    description: "Analyze overnight and early morning streaming patterns",
    priority: "advanced",
    category: "Daypart Detail",
    columns: ["Date", "Hour", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_overnight_12am_6am.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Daypart: Overnight (12AM-6AM)",
      "Dimensions: Date, Hour of Day",
    ],
  },
  {
    id: "weekend-daytime",
    name: "Weekend Daytime (Sat-Sun 6AM-7PM)",
    description: "Analyze weekend daytime listening patterns",
    priority: "advanced",
    category: "Daypart Detail",
    columns: ["Date", "Day of Week", "Hour", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_weekend_daytime_6am_7pm.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Daypart: Weekend Daytime (Sat-Sun 6AM-7PM)",
      "Dimensions: Date, Day of Week, Hour",
    ],
  },
  {
    id: "weekend-evening",
    name: "Weekend Evening (Sat-Sun 7PM-12AM)",
    description: "Analyze weekend evening entertainment listening",
    priority: "advanced",
    category: "Daypart Detail",
    columns: ["Date", "Day of Week", "Hour", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_weekend_evening_7pm_12am.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Daypart: Weekend Evening (Sat-Sun 7PM-12AM)",
      "Dimensions: Date, Day of Week, Hour",
    ],
  },

  // Advanced Analysis
  {
    id: "geographic",
    name: "Geographic Distribution",
    description: "CUME map visualization by location (if available in Triton)",
    priority: "advanced",
    category: "Advanced Analysis",
    columns: ["Location", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_geographic.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Dimension: Country, State/Region, or City",
    ],
  },
  {
    id: "stream-comparison",
    name: "Stream Comparison",
    description: "Compare performance across different Radio Milwaukee streams",
    priority: "advanced",
    category: "Advanced Analysis",
    columns: ["Station/Stream", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_stream_comparison.csv",
    tritonSteps: [
      "Select all Radio Milwaukee stations/streams",
      "Dimension: Station/Stream Name",
    ],
  },
  {
    id: "daypart-device-cross",
    name: "Daypart by Device Cross-Analysis",
    description: "Advanced analysis of how device usage varies by daypart",
    priority: "advanced",
    category: "Advanced Analysis",
    columns: ["Daypart", "Device Family", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_daypart_device_cross.csv",
    tritonSteps: [
      "Select date range: Last 18 Months",
      "Dimensions: Daypart (first), Device Family (second)",
    ],
  },
  {
    id: "weekday",
    name: "Weekday Performance",
    description: "Monday-Friday listening patterns",
    priority: "advanced",
    category: "Advanced Analysis",
    columns: ["Date", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_weekday.csv",
    tritonSteps: [
      "Custom Daypart: Monday-Friday, All Hours",
      "Dimension: Date",
    ],
  },
  {
    id: "weekend",
    name: "Weekend Performance",
    description: "Saturday-Sunday listening patterns",
    priority: "advanced",
    category: "Advanced Analysis",
    columns: ["Date", "CUME", "TLH", "Active Sessions"],
    filename: "radio_milwaukee_weekend.csv",
    tritonSteps: [
      "Custom Daypart: Saturday-Sunday, All Hours",
      "Dimension: Date",
    ],
  },

  // Nielsen Demographics (if available)
  {
    id: "nielsen-age",
    name: "Nielsen Age Demographics",
    description: "Audience composition by age groups (requires Nielsen access)",
    priority: "advanced",
    category: "Nielsen Demographics",
    columns: ["Date/Month", "Age Groups", "AQH Persons", "CUME", "TSL", "P1%"],
    filename: "radio_milwaukee_age_demographics.csv",
    tritonSteps: [
      "Access Nielsen PD Advantage Web",
      "Report Type: Demographic Composition",
      "Demographics: Age Groups (18-24, 25-34, 35-44, etc.)",
    ],
  },
  {
    id: "nielsen-gender",
    name: "Nielsen Gender Demographics",
    description: "Audience composition by gender (requires Nielsen access)",
    priority: "advanced",
    category: "Nielsen Demographics",
    columns: ["Date/Month", "Gender", "AQH Persons", "CUME", "TSL"],
    filename: "radio_milwaukee_gender_demographics.csv",
    tritonSteps: [
      "Access Nielsen PD Advantage Web",
      "Report Type: Demographic Composition",
      "Demographics: Gender (Male, Female)",
    ],
  },
  {
    id: "nielsen-daypart-demo",
    name: "Nielsen Daypart Demographics",
    description: "Demographic performance across dayparts (requires Nielsen access)",
    priority: "advanced",
    category: "Nielsen Demographics",
    columns: ["Date", "Daypart", "Demographics", "AQH Share", "CUME%", "TSL"],
    filename: "radio_milwaukee_daypart_demographics.csv",
    tritonSteps: [
      "Access Nielsen PD Advantage Web",
      "Report Type: Daypart Demographic Analysis",
      "Include key age groups and gender",
    ],
  },
  {
    id: "nielsen-p1",
    name: "Nielsen P1 Demographics",
    description: "P1 (favorite station) listeners by demographics (requires Nielsen access)",
    priority: "advanced",
    category: "Nielsen Demographics",
    columns: ["Date", "Demographics", "P1 Listeners", "P1 %", "P1 TSL"],
    filename: "radio_milwaukee_p1_demographics.csv",
    tritonSteps: [
      "Access Nielsen PD Advantage Web",
      "Report Type: P1 Listener Analysis",
      "Include all demographic segments",
    ],
  },
];

interface CSVExportGuideProps {
  uploadedFiles: string[]; // Array of uploaded filenames
}

export default function CSVExportGuide({ uploadedFiles }: CSVExportGuideProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>("Core Data");
  const [showPriorityFilter, setShowPriorityFilter] = useState<string>("all");

  const categories = Array.from(new Set(csvExports.map((e) => e.category)));

  const filteredExports = csvExports.filter((exp) => {
    if (showPriorityFilter === "all") return true;
    return exp.priority === showPriorityFilter;
  });

  const exportsByCategory = categories.map((category) => ({
    category,
    exports: filteredExports.filter((e) => e.category === category),
  }));

  const totalExports = csvExports.length;
  const uploadedCount = uploadedFiles.length;
  const progressPercentage = Math.round((uploadedCount / totalExports) * 100);

  const isFileUploaded = (filename: string) => {
    return uploadedFiles.some((f) => f.toLowerCase().includes(filename.toLowerCase().replace(/\.csv$/, "")));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "essential":
        return "bg-radiomke-orange-500/10 border-radiomke-orange-500/30 text-radiomke-cream-500";
      case "recommended":
        return "bg-radiomke-blue-500/10 border-radiomke-blue-500/30 text-radiomke-cream-500";
      case "advanced":
        return "bg-radiomke-charcoal-700 border-radiomke-charcoal-400/50 text-radiomke-cream-500";
      default:
        return "bg-radiomke-charcoal-600 border-radiomke-charcoal-400/30 text-radiomke-cream-500";
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "essential":
        return "🟢 START HERE";
      case "recommended":
        return "🟡 RECOMMENDED";
      case "advanced":
        return "🔵 ADVANCED";
      default:
        return "";
    }
  };

  return (
    <div className="bg-radiomke-charcoal-600 rounded-lg p-6 space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-radiomke-cream-500 mb-2">CSV Export Guide</h2>
        <p className="text-sm text-radiomke-cream-600">
          Complete guide to all 22 possible CSV exports from Triton Webcast Metrics and Nielsen
        </p>
      </div>

      {/* Progress Bar */}
      <div className="bg-radiomke-charcoal-700 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-radiomke-cream-500 font-semibold">Upload Progress</span>
          <span className="text-radiomke-cream-500 text-sm">
            {uploadedCount} of {totalExports} exports
          </span>
        </div>
        <div className="w-full bg-radiomke-charcoal-700 rounded-full h-3">
          <div
            className="bg-gradient-to-r from-radiomke-orange-500 to-radiomke-blue-500 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-radiomke-cream-600 mt-2">{progressPercentage}% complete</p>
      </div>

      {/* Priority Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setShowPriorityFilter("all")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showPriorityFilter === "all"
              ? "bg-radiomke-orange-500 text-radiomke-cream-500"
              : "bg-radiomke-charcoal-700 text-radiomke-cream-500 hover:bg-radiomke-charcoal-700"
          }`}
        >
          All Exports ({csvExports.length})
        </button>
        <button
          onClick={() => setShowPriorityFilter("essential")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showPriorityFilter === "essential"
              ? "bg-radiomke-orange-500 text-radiomke-cream-500"
              : "bg-radiomke-charcoal-700 text-radiomke-cream-500 hover:bg-radiomke-charcoal-700"
          }`}
        >
          🟢 Essential (3)
        </button>
        <button
          onClick={() => setShowPriorityFilter("recommended")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showPriorityFilter === "recommended"
              ? "bg-radiomke-orange-400 text-radiomke-cream-500"
              : "bg-radiomke-charcoal-700 text-radiomke-cream-500 hover:bg-radiomke-charcoal-700"
          }`}
        >
          🟡 Recommended (3)
        </button>
        <button
          onClick={() => setShowPriorityFilter("advanced")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            showPriorityFilter === "advanced"
              ? "bg-radiomke-orange-500 text-radiomke-cream-500"
              : "bg-radiomke-charcoal-700 text-radiomke-cream-500 hover:bg-radiomke-charcoal-700"
          }`}
        >
          🔵 Advanced (16)
        </button>
      </div>

      {/* Export Categories */}
      <div className="space-y-4">
        {exportsByCategory.map(({ category, exports }) => {
          if (exports.length === 0) return null;

          const isExpanded = expandedCategory === category;

          return (
            <div key={category} className="border border-radiomke-charcoal-400/30 rounded-lg overflow-hidden">
              {/* Category Header */}
              <button
                onClick={() => setExpandedCategory(isExpanded ? null : category)}
                className="w-full bg-radiomke-charcoal-700 hover:bg-radiomke-charcoal-700 transition-colors px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <svg
                    className={`w-5 h-5 text-radiomke-cream-600 transition-transform ${
                      isExpanded ? "rotate-90" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-radiomke-cream-500 font-semibold">{category}</span>
                  <span className="text-radiomke-cream-600 text-sm">({exports.length} exports)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-radiomke-cream-600">
                    {exports.filter((e) => isFileUploaded(e.filename)).length} uploaded
                  </span>
                </div>
              </button>

              {/* Export Cards */}
              {isExpanded && (
                <div className="p-4 space-y-3">
                  {exports.map((exp) => {
                    const uploaded = isFileUploaded(exp.filename);

                    return (
                      <div
                        key={exp.id}
                        className={`border rounded-lg p-4 ${getPriorityColor(exp.priority)} ${
                          uploaded ? "opacity-60" : ""
                        }`}
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              {uploaded ? (
                                <svg
                                  className="w-5 h-5 text-green-400"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-5 h-5 text-radiomke-cream-600"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              )}
                              <h3 className="font-semibold text-radiomke-cream-500">{exp.name}</h3>
                            </div>
                            <p className="text-sm text-radiomke-cream-500 mb-2">{exp.description}</p>
                          </div>
                          <span className="text-xs font-bold px-2 py-1 bg-radiomke-charcoal-700 rounded whitespace-nowrap ml-2">
                            {getPriorityBadge(exp.priority)}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm">
                          {/* Filename */}
                          <div>
                            <span className="text-radiomke-cream-600">Filename: </span>
                            <code className="text-radiomke-orange-400 bg-radiomke-charcoal-700 px-2 py-1 rounded text-xs">
                              {exp.filename}
                            </code>
                          </div>

                          {/* Required Columns */}
                          <div>
                            <span className="text-radiomke-cream-600">Required Columns: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {exp.columns.map((col) => (
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
                            <span className="text-radiomke-cream-600">Export Steps:</span>
                            <ol className="list-decimal list-inside mt-1 space-y-1">
                              {exp.tritonSteps.map((step, idx) => (
                                <li key={idx} className="text-xs text-radiomke-cream-500">
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Help Footer */}
      <div className="bg-radiomke-blue-500/10 border border-radiomke-blue-500/30 rounded-lg p-4">
        <h4 className="text-radiomke-blue-300 font-semibold mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Pro Tips
        </h4>
        <ul className="text-sm text-radiomke-blue-200 space-y-1">
          <li>
            • <strong>Start with the 3 Essential exports</strong> (marked with 🟢) to get your dashboard working
          </li>
          <li>
            • <strong>The app works with partial data</strong> - charts will show what's available and suggest
            missing exports
          </li>
          <li>
            • <strong>You can upload files in any order</strong> - the app automatically detects file types
          </li>
          <li>
            • <strong>Re-uploading a file replaces old data</strong> - perfect for monthly updates
          </li>
        </ul>
      </div>
    </div>
  );
}
