"use client";

interface DashboardSectionProps {
  title: string;
  description: string;
  hasData: boolean;
  missingDataMessage: string;
  requiredExport: string;
  children: React.ReactNode;
}

export default function DashboardSection({
  title,
  description,
  hasData,
  missingDataMessage,
  requiredExport,
  children,
}: DashboardSectionProps) {
  if (!hasData) {
    return (
      <div className="bg-radiomke-charcoal-600 rounded-lg p-6 border-2 border-dashed border-radiomke-charcoal-400/30">
        <div className="text-center py-8">
          <div className="flex justify-center mb-4">
            <svg
              className="w-16 h-16 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 2 0 01-2 2z"
              />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-radiomke-cream-500 mb-2">{title}</h3>
          <p className="text-sm text-radiomke-cream-600 mb-4">{description}</p>

          <div className="bg-radiomke-orange-500/10 border border-radiomke-orange-500/30 rounded-lg p-4 mb-4 max-w-md mx-auto">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <div className="text-left">
                <p className="text-sm font-medium text-radiomke-orange-300 mb-1">Data Not Available</p>
                <p className="text-xs text-yellow-200">{missingDataMessage}</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 max-w-md mx-auto">
            <p className="text-sm font-medium text-blue-300 mb-2">📁 Required Export</p>
            <code className="text-xs text-blue-200 bg-radiomke-charcoal-700/50 px-3 py-1.5 rounded block">
              {requiredExport}
            </code>
            <p className="text-xs text-blue-300 mt-3">
              Check the <strong>CSV Export Guide</strong> below for instructions on how to export this file
              from Triton Webcast Metrics
            </p>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
