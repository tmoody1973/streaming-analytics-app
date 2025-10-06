"use client";

import { useEffect } from "react";

interface ErrorToastProps {
  message: string;
  onClose: () => void;
  type?: "error" | "warning" | "success" | "info";
  duration?: number;
}

export default function ErrorToast({
  message,
  onClose,
  type = "error",
  duration = 5000,
}: ErrorToastProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const colors = {
    error: "bg-red-900/90 border-red-700 text-red-100",
    warning: "bg-yellow-900/90 border-yellow-700 text-yellow-100",
    success: "bg-green-900/90 border-green-700 text-green-100",
    info: "bg-blue-900/90 border-blue-700 text-blue-100",
  };

  const icons = {
    error: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    warning: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    ),
    success: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
    info: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    ),
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-md border rounded-lg shadow-lg p-4 ${colors[type]} animate-slide-in`}
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-6 h-6 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          {icons[type]}
        </svg>
        <div className="flex-1">
          <p className="text-sm whitespace-pre-line">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="flex-shrink-0 text-current hover:opacity-70 transition-opacity"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
