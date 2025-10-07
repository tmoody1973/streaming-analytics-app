"use client";

import type { UploadedFile, RadioMetrics } from "@/types";

interface DataSummaryProps {
  files?: UploadedFile[];
  uploadedFiles?: UploadedFile[];
  metricsData?: RadioMetrics[];
  onRemoveFile?: (fileId: string) => void;
}

export default function DataSummary({
  files,
  uploadedFiles,
  metricsData = [],
  onRemoveFile,
}: DataSummaryProps) {
  // Support both 'files' and 'uploadedFiles' props for backwards compatibility
  const fileList = files || uploadedFiles || [];

  if (fileList.length === 0) {
    return null;
  }

  // Calculate summary statistics
  const totalRecords = fileList.reduce((sum, file) => sum + file.recordCount, 0);
  const successfulFiles = fileList.filter((f) => f.status === "completed").length;
  const failedFiles = fileList.filter((f) => f.status === "error").length;

  // Calculate date range from metrics
  const dates = metricsData.map((m) => new Date(m.date).getTime());
  const minDate = dates.length > 0 ? new Date(Math.min(...dates)) : null;
  const maxDate = dates.length > 0 ? new Date(Math.max(...dates)) : null;

  // Calculate CUME average (NEVER sum!)
  const cumeValues = metricsData.filter((m) => m.cume > 0).map((m) => m.cume);
  const avgCume =
    cumeValues.length > 0
      ? Math.round(cumeValues.reduce((a, b) => a + b, 0) / cumeValues.length)
      : 0;

  // Sum TLH (can be summed)
  const totalTlh = metricsData.reduce((sum, m) => sum + m.tlh, 0);

  // Get unique dayparts and devices
  const uniqueDayparts = [...new Set(metricsData.map((m) => m.daypart).filter(Boolean))];
  const uniqueDevices = [...new Set(metricsData.map((m) => m.device).filter(Boolean))];

  return (
    <div className="bg-radiomke-charcoal-600 rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-radiomke-cream-500">Data Summary</h3>
        <span className="text-sm text-radiomke-cream-600">
          {successfulFiles} of {fileList.length} files processed
        </span>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-radiomke-charcoal-700 rounded-lg p-4">
          <p className="text-xs text-radiomke-cream-600 mb-1">Total Records</p>
          <p className="text-2xl font-bold text-radiomke-cream-500">{totalRecords.toLocaleString()}</p>
        </div>
        <div className="bg-radiomke-charcoal-700 rounded-lg p-4">
          <p className="text-xs text-radiomke-cream-600 mb-1">Avg CUME</p>
          <p className="text-2xl font-bold text-radiomke-blue-400">{avgCume.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">Averaged, not summed</p>
        </div>
        <div className="bg-radiomke-charcoal-700 rounded-lg p-4">
          <p className="text-xs text-radiomke-cream-600 mb-1">Total TLH</p>
          <p className="text-2xl font-bold text-green-400">
            {Math.round(totalTlh).toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">Hours</p>
        </div>
        <div className="bg-radiomke-charcoal-700 rounded-lg p-4">
          <p className="text-xs text-radiomke-cream-600 mb-1">Date Range</p>
          <p className="text-sm font-semibold text-radiomke-cream-500">
            {minDate && maxDate
              ? `${minDate.toLocaleDateString()} - ${maxDate.toLocaleDateString()}`
              : "N/A"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {dates.length > 0 ? `${dates.length} days` : ""}
          </p>
        </div>
      </div>

      {/* Data Dimensions */}
      {(uniqueDayparts.length > 0 || uniqueDevices.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {uniqueDayparts.length > 0 && (
            <div className="bg-radiomke-charcoal-700 rounded-lg p-4">
              <p className="text-sm font-semibold text-radiomke-cream-500 mb-2">Dayparts ({uniqueDayparts.length})</p>
              <div className="flex flex-wrap gap-2">
                {uniqueDayparts.slice(0, 5).map((daypart) => (
                  <span
                    key={daypart}
                    className="px-2 py-1 bg-gray-600 rounded text-xs text-radiomke-cream-500"
                  >
                    {daypart}
                  </span>
                ))}
                {uniqueDayparts.length > 5 && (
                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-radiomke-cream-600">
                    +{uniqueDayparts.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {uniqueDevices.length > 0 && (
            <div className="bg-radiomke-charcoal-700 rounded-lg p-4">
              <p className="text-sm font-semibold text-radiomke-cream-500 mb-2">Devices ({uniqueDevices.length})</p>
              <div className="flex flex-wrap gap-2">
                {uniqueDevices.slice(0, 5).map((device) => (
                  <span
                    key={device}
                    className="px-2 py-1 bg-gray-600 rounded text-xs text-radiomke-cream-500"
                  >
                    {device}
                  </span>
                ))}
                {uniqueDevices.length > 5 && (
                  <span className="px-2 py-1 bg-gray-600 rounded text-xs text-radiomke-cream-600">
                    +{uniqueDevices.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* File List */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-radiomke-cream-600">Uploaded Files</h4>
        {fileList.map((file) => (
          <div
            key={file.id}
            className="flex items-center justify-between bg-radiomke-charcoal-700 rounded-lg p-3"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <div
                  className={`w-2 h-2 rounded-full ${
                    file.status === "completed"
                      ? "bg-green-500"
                      : file.status === "error"
                      ? "bg-red-500"
                      : "bg-yellow-500"
                  }`}
                />
                <p className="text-sm font-medium text-radiomke-cream-500 truncate">{file.name}</p>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <span className="text-xs text-radiomke-cream-600">
                  {file.recordCount.toLocaleString()} records
                </span>
                <span className="text-xs text-radiomke-cream-600">
                  {file.uploadedAt.toLocaleString()}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    file.type === "triton"
                      ? "bg-radiomke-orange-500 text-blue-100"
                      : "bg-purple-600 text-purple-100"
                  }`}
                >
                  {file.type}
                </span>
              </div>
              {file.status === "error" && file.errorMessage && (
                <p className="text-xs text-red-400 mt-1">{file.errorMessage}</p>
              )}
            </div>
            {onRemoveFile && (
              <button
                onClick={() => onRemoveFile(file.id)}
                className="ml-4 text-radiomke-cream-600 hover:text-red-400 transition-colors"
                title="Remove file"
              >
                <svg
                  className="w-5 h-5"
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
              </button>
            )}
          </div>
        ))}
      </div>

      {failedFiles > 0 && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <svg
              className="w-5 h-5 text-red-400 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-400">
                {failedFiles} file{failedFiles > 1 ? "s" : ""} failed to process
              </p>
              <p className="text-xs text-red-300 mt-1">
                Check the error messages above and verify your CSV format.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
