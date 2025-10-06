"use client";

import { useState, useCallback, DragEvent } from "react";
import type { UploadedFile } from "@/types";

interface FileUploaderProps {
  onFilesUploaded: (files: UploadedFile[]) => void;
  onError?: (error: string) => void;
}

export default function FileUploader({ onFilesUploaded, onError }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});

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
    <div className="w-full">
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
          ${isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-[1.02]'
            : 'border-gray-600 hover:border-blue-500 hover:bg-gray-800/50'
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
              className="mx-auto h-12 w-12 text-blue-400 animate-spin"
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
              className="mx-auto h-12 w-12 text-gray-400"
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

          <p className="mt-2 text-sm text-gray-300 font-medium">
            {uploading
              ? 'Processing files...'
              : isDragging
              ? 'Drop files here'
              : 'Drag and drop CSV files here, or click to browse'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            Supports Triton Webcast exports and Nielsen data (CSV files, max 50MB each)
          </p>
        </div>
      </div>

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="mt-4 space-y-2">
          {Object.entries(uploadProgress).map(([filename, progress]) => (
            <div key={filename} className="bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-300 truncate flex-1 mr-2">
                  {filename}
                </span>
                <span className="text-xs text-gray-400">{progress}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
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
