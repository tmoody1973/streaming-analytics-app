"use client";

import { useState, useCallback, DragEvent } from "react";
import { Upload, X, CheckCircle, AlertCircle } from "lucide-react";

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (tableName: string, rowCount: number) => void;
}

export function UploadModal({ isOpen, onClose, onUploadSuccess }: UploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });

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

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      setUploadStatus({ type: 'error', message: 'Only CSV files are supported' });
      return;
    }

    setUploading(true);
    setUploadStatus({ type: null, message: '' });

    try {
      // Step 1: Parse and process CSV
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await fetch('/api/data/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.error || 'Upload failed');
      }

      const uploadData = await uploadResponse.json();

      const message = uploadData.isNewTable
        ? `Created new table "${uploadData.tableName}" with ${uploadData.rowsAdded} rows`
        : `Added ${uploadData.rowsAdded} rows to "${uploadData.tableName}" (total: ${uploadData.totalRows})`;

      setUploadStatus({
        type: 'success',
        message
      });

      onUploadSuccess(uploadData.tableName, uploadData.rowsAdded);

      // Auto-close after success
      setTimeout(() => {
        onClose();
        setUploadStatus({ type: null, message: '' });
      }, 2000);

    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus({
        type: 'error',
        message: error instanceof Error ? error.message : 'Upload failed'
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = useCallback(
    async (e: DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        await processFile(files[0]);
      }
    },
    []
  );

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
    e.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Upload Radio Analytics Data</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={uploading}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Upload Area */}
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={`
            relative border-2 border-dashed rounded-lg p-12 text-center transition-all cursor-pointer
            ${isDragging ? 'border-orange-500 bg-orange-50' : 'border-gray-300 hover:border-orange-500'}
            ${uploading ? 'opacity-50 pointer-events-none' : ''}
          `}
        >
          <input
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center">
              <svg
                className="animate-spin h-12 w-12 text-orange-600 mb-4"
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
              <p className="text-sm text-gray-600">Processing and storing your data...</p>
            </div>
          ) : (
            <>
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-sm text-gray-600 mb-2">
                {isDragging ? 'Drop your file here' : 'Drag and drop CSV file here, or click to browse'}
              </p>
              <p className="text-xs text-gray-500">
                Supports Triton Webcast exports and Nielsen data
              </p>
            </>
          )}
        </div>

        {/* Status Messages */}
        {uploadStatus.type && (
          <div className={`mt-4 p-4 rounded-lg flex items-start gap-3 ${
            uploadStatus.type === 'success'
              ? 'bg-green-50 border border-green-200'
              : 'bg-red-50 border border-red-200'
          }`}>
            {uploadStatus.type === 'success' ? (
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            )}
            <p className={`text-sm ${
              uploadStatus.type === 'success' ? 'text-green-800' : 'text-red-800'
            }`}>
              {uploadStatus.message}
            </p>
          </div>
        )}

        {/* Info Box */}
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">What happens after upload?</h3>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• Your data is stored securely in Supabase</li>
            <li>• Press <kbd className="px-1 py-0.5 bg-white border border-blue-300 rounded text-xs">⌘K</kbd> to ask the AI for charts</li>
            <li>• Charts appear as draggable cards on your canvas</li>
            <li>• Build custom dashboards by arranging your visualizations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
