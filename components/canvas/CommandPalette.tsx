"use client";

import { useState, useEffect, useRef } from "react";
import { Send, Loader2 } from "lucide-react";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (prompt: string) => void;
  isGenerating?: boolean;
}

export function CommandPalette({ isOpen, onClose, onSubmit, isGenerating = false }: CommandPaletteProps) {
  const [prompt, setPrompt] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isGenerating) {
      onSubmit(prompt.trim());
      setPrompt("");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-[20vh] z-50" onClick={onClose}>
      <div
        className="bg-radiomke-charcoal-600 rounded-lg shadow-2xl w-full max-w-2xl mx-4 border border-radiomke-charcoal-400/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-radiomke-charcoal-400/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-radiomke-orange-500 animate-pulse"></div>
            <span className="text-sm font-medium text-radiomke-cream-500">AI Chart Generator</span>
          </div>
          <kbd className="px-2 py-1 bg-radiomke-charcoal-700 border border-radiomke-charcoal-400 rounded text-xs text-radiomke-cream-600">
            ESC
          </kbd>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-center gap-3">
            <input
              ref={inputRef}
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask for a chart... e.g., 'Show CUME trends over time'"
              className="flex-1 px-4 py-3 text-sm border-none outline-none focus:ring-0 bg-radiomke-charcoal-700 text-radiomke-cream-500 placeholder:text-radiomke-cream-600/50 rounded-lg"
              disabled={isGenerating}
            />
            <button
              type="submit"
              disabled={!prompt.trim() || isGenerating}
              className="p-3 bg-radiomke-orange-500 hover:bg-radiomke-orange-600 disabled:bg-radiomke-charcoal-500 disabled:cursor-not-allowed text-radiomke-cream-500 rounded-lg transition-colors"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </form>

        {/* Suggestions */}
        <div className="px-4 pb-4">
          <p className="text-xs text-radiomke-cream-600 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {[
              "Show CUME trends",
              "Compare stations by TLH",
              "Device breakdown",
              "Top 10 days by listeners"
            ].map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setPrompt(suggestion)}
                className="px-3 py-1.5 text-xs bg-radiomke-charcoal-700 hover:bg-radiomke-charcoal-500 text-radiomke-cream-600 rounded-full transition-colors border border-radiomke-charcoal-400/30"
                disabled={isGenerating}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
