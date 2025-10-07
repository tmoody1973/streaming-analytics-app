"use client";

import { useState, useCallback, DragEvent } from "react";
import type { UploadedFile } from "@/types";

interface FileUploaderProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  onError?: (error: string) => void;
  showInstructions?: boolean;
}

export default function FileUploader({ onFilesUploaded, onError, showInstructions = true }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [showHelp, setShowHelp] = useState(false);

  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!file.name.endsWith('.csv')) {
      return `${file.name}: Only CSV files are supported`;
    }

    // Check file size (max 50MB)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      return `${file.name}: File size exceeds 50MB limit`;
    }

    return null;
  };

  const processFiles = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const errors: string[] = [];
    const validFiles: File[] = [];

    // Validate all files
    fileArray.forEach((file) => {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    });

    if (errors.length > 0) {
      onError?.(errors.join('\n'));
      if (validFiles.length === 0) return;
    }

    setUploading(true);

    try {
      const uploadedFiles: UploadedFile[] = [];

      for (const file of validFiles) {
        const formData = new FormData();
        formData.append('file', file);

        // Simulate progress for UX
        setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));

        try {
          const response = await fetch('/api/data/upload', {
            method: 'POST',
            body: formData,
          });

          setUploadProgress((prev) => ({ ...prev, [file.name]: 50 }));

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
          }

          const data = await response.json();

          setUploadProgress((prev) => ({ ...prev, [file.name]: 100 }));

          const uploadedFile: any = {
            id: data.id || crypto.randomUUID(),
            name: file.name,
            type: data.type || 'triton',
            uploadedAt: new Date(),
            recordCount: data.recordCount || 0,
            status: 'completed',
            data: data.data || [], // Include the processed metrics data
            summary: data.summary || {},
          };

          uploadedFiles.push(uploadedFile);
        } catch (error) {
          setUploadProgress((prev) => ({ ...prev, [file.name]: 0 }));
          errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);

          uploadedFiles.push({
            id: crypto.randomUUID(),
            name: file.name,
            type: 'triton',
            uploadedAt: new Date(),
            recordCount: 0,
            status: 'error',
            errorMessage: error instanceof Error ? error.message : 'Upload failed',
            data: [], // Empty array for failed upload
          });
        }
      }

      if (uploadedFiles.length > 0) {
        onFilesUploaded(uploadedFiles);
      }

      if (errors.length > 0) {
        onError?.(errors.join('\n'));
      }
    } finally {
      setUploading(false);
      setTimeout(() => setUploadProgress({}), 2000);
    }
  };

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        await processFiles(files);
      }
    },
    [onFilesUploaded, onError]
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFiles(files);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="w-full space-y-4">
      {/* Help Instructions Toggle */}
      {showInstructions && (
        <div className="flex items-center justify-between bg-radiomke-charcoal-600 rounded-lg p-4 border border-radiomke-charcoal-400/30">
          <div className="flex items-center gap-3">
            <svg
              className="w-6 h-6 text-radiomke-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-sm font-semibold text-radiomke-cream-500">Need help getting your CSV files?</h3>
              <p className="text-xs text-radiomke-cream-600">Learn how to export data from Triton Webcast Metrics</p>
            </div>
          </div>
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="px-4 py-2 bg-radiomke-orange-500 hover:bg-radiomke-orange-600 text-radiomke-cream-500 text-sm font-medium rounded-lg transition-colors"
          >
            {showHelp ? 'Hide Guide' : 'Show Guide'}
          </button>
        </div>
      )}

      {/* Expandable Help Section */}
      {showHelp && showInstructions && (
        <div className="bg-radiomke-charcoal-600 rounded-lg p-6 space-y-6 border border-radiomke-charcoal-400/30">
          <div>
            <h3 className="text-lg font-bold text-radiomke-cream-500 mb-4">How to Export CSV Files from Triton</h3>

            {/* Step-by-step guide */}
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-radiomke-orange-500 rounded-full flex items-center justify-center text-radiomke-cream-500 font-bold text-sm">
                  1
                </div>
                <div className="flex-1">
                  <h4 className="text-radiomke-cream-500 font-semibold mb-1">Log into Triton Webcast Metrics</h4>
                  <p className="text-sm text-radiomke-cream-600">Access your Triton account and navigate to the Explore or Reports section</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-radiomke-orange-500 rounded-full flex items-center justify-center text-radiomke-cream-500 font-bold text-sm">
                  2
                </div>
                <div className="flex-1">
                  <h4 className="text-radiomke-cream-500 font-semibold mb-1">Select Your Date Range</h4>
                  <p className="text-sm text-radiomke-cream-600">We recommend <strong className="text-radiomke-cream-500">last 18 months</strong> for comprehensive trend analysis</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-radiomke-orange-500 rounded-full flex items-center justify-center text-radiomke-cream-500 font-bold text-sm">
                  3
                </div>
                <div className="flex-1">
                  <h4 className="text-radiomke-cream-500 font-semibold mb-1">Choose Daily Overview Report</h4>
                  <p className="text-sm text-radiomke-cream-600">This is your main dashboard data with daily breakdowns</p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-radiomke-orange-500 rounded-full flex items-center justify-center text-radiomke-cream-500 font-bold text-sm">
                  4
                </div>
                <div className="flex-1">
                  <h4 className="text-radiomke-cream-500 font-semibold mb-1">Verify Required Columns</h4>
                  <p className="text-sm text-radiomke-cream-600 mb-2">Make sure your export includes these columns:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-radiomke-charcoal-700 rounded px-3 py-2">
                      <span className="text-xs font-mono text-radiomke-blue-300">Date</span>
                      <span className="text-xs text-radiomke-cream-600 ml-2">or Week</span>
                    </div>
                    <div className="bg-radiomke-charcoal-700 rounded px-3 py-2">
                      <span className="text-xs font-mono text-radiomke-blue-300">Station</span>
                    </div>
                    <div className="bg-radiomke-charcoal-700 rounded px-3 py-2">
                      <span className="text-xs font-mono text-radiomke-blue-300">CUME</span>
                    </div>
                    <div className="bg-radiomke-charcoal-700 rounded px-3 py-2">
                      <span className="text-xs font-mono text-radiomke-blue-300">TLH</span>
                    </div>
                    <div className="bg-radiomke-charcoal-700 rounded px-3 py-2">
                      <span className="text-xs font-mono text-radiomke-blue-300">AAS</span>
                      <span className="text-xs text-radiomke-cream-600 ml-2">or Active Sessions</span>
                    </div>
                    <div className="bg-radiomke-charcoal-700 rounded px-3 py-2">
                      <span className="text-xs font-mono text-radiomke-orange-400">TSL</span>
                      <span className="text-xs text-radiomke-cream-600 ml-2">(optional)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-radiomke-orange-500 rounded-full flex items-center justify-center text-radiomke-cream-500 font-bold text-sm">
                  5
                </div>
                <div className="flex-1">
                  <h4 className="text-radiomke-cream-500 font-semibold mb-1">Export as CSV</h4>
                  <p className="text-sm text-radiomke-cream-600">Click "Export as CSV" or "Download CSV" and save with a clear name like <code className="text-radiomke-orange-400 bg-radiomke-charcoal-700 px-2 py-1 rounded text-xs">radio_milwaukee_daily_overview.csv</code></p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-radiomke-blue-500/10 border border-radiomke-blue-500/30 rounded-lg p-4">
            <h4 className="text-radiomke-blue-300 font-semibold mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Pro Tips
            </h4>
            <ul className="text-sm text-radiomke-blue-200 space-y-1">
              <li>• Start with <strong>3 essential files</strong>: Daily Overview, Daypart Performance, Device Analysis</li>
              <li>• The app automatically <strong>averages CUME</strong> values (never sums them)</li>
              <li>• You can upload multiple files at once by selecting or dragging them together</li>
              <li>• Use clear file names to identify what data each file contains</li>
            </ul>
          </div>

          {/* Additional Resources */}
          <div className="border-t border-radiomke-charcoal-400/30 pt-4">
            <p className="text-xs text-radiomke-cream-600">
              Need more advanced exports? Check the complete guide with all 22 export types in our documentation.
            </p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragging
            ? 'border-radiomke-orange-500 bg-radiomke-orange-500/10 scale-[1.02]'
            : 'border-radiomke-charcoal-400 hover:border-radiomke-orange-500 hover:bg-radiomke-charcoal-600/50'
          }
          ${uploading ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
        `}
      >
        <input
          type="file"
          multiple
          accept=".csv"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={uploading}
        />

        <div className="pointer-events-none">
          {uploading ? (
            <svg
              className="mx-auto h-12 w-12 text-radiomke-orange-400 animate-spin"
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
          ) : (
            <svg
              className="mx-auto h-12 w-12 text-radiomke-cream-600"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}

          <p className="mt-2 text-sm text-radiomke-cream-500 font-medium">
            {uploading
              ? 'Processing files...'
              : isDragging
              ? 'Drop files here'
              : 'Drag and drop CSV files here, or click to browse'}
          </p>
          <p className="text-xs text-radiomke-cream-600 mt-1">
            Supports Triton Webcast exports and Nielsen data (CSV files, max 50MB each)
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="bg-radiomke-charcoal-600 rounded-lg p-3 border border-radiomke-charcoal-400/30">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-radiomke-cream-500 truncate flex-1 mr-2">
                  {filename}
                </span>
                <span className="text-xs text-radiomke-cream-600">{progress}%</span>
              </div>
              <div className="w-full bg-radiomke-charcoal-700 rounded-full h-2">
                <div
                  className="bg-radiomke-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
