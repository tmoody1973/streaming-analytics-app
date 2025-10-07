"use client";

import { useState, useEffect, useRef } from "react";
import { Upload } from "lucide-react";
import { Editor } from "tldraw";
import { CanvasWorkspace, createC1Card } from "@/components/canvas/CanvasWorkspace";
import { UploadModal } from "@/components/canvas/UploadModal";
import { CommandPalette } from "@/components/canvas/CommandPalette";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [uploadedTables, setUploadedTables] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const editorRef = useRef<Editor | null>(null);

  useEffect(() => {
    setMounted(true);

    // Add Cmd+K / Ctrl+K keyboard shortcut
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleCanvasMount = (editor: Editor) => {
    editorRef.current = editor;
    console.log('✅ Canvas editor ready');
  };

  const handleUploadSuccess = (tableName: string, rowCount: number) => {
    setUploadedTables(prev => [...prev, tableName]);
    console.log(`✅ Uploaded: ${tableName} (${rowCount} rows)`);
  };

  const handlePromptSubmit = async (prompt: string) => {
    console.log('🎨 Creating C1 card for:', prompt);

    if (!editorRef.current) {
      console.error('Canvas editor not ready');
      return;
    }

    if (uploadedTables.length === 0) {
      alert('Please upload a CSV file first');
      return;
    }

    setIsGenerating(true);

    try {
      // Create C1 card on canvas - it will fetch and render C1's UI internally
      createC1Card(editorRef.current, {
        prompt,
        x: 100 + (uploadedTables.length * 50), // Offset each card
        y: 100 + (uploadedTables.length * 50),
      });

      console.log('✅ C1 card created on canvas');
      setShowCommandPalette(false);
    } catch (error: any) {
      console.error('Card creation error:', error);
      alert(`Failed to create card: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-radiomke-charcoal-500">
      {/* Top Bar - Radio Milwaukee Branded */}
      <div className="absolute top-0 left-0 right-0 z-[9999] bg-radiomke-charcoal-600 border-b border-radiomke-charcoal-400/30 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img
              src="/images/RadioMilwaukeeLogos_HorizontalLockup_CreamOrange.png"
              alt="Radio Milwaukee"
              className="h-8 w-auto"
            />
            <span className="text-sm text-radiomke-cream-600 border-l border-radiomke-charcoal-400/50 pl-3">
              Canvas Dashboard Builder
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-radiomke-orange-500 hover:bg-radiomke-orange-600 text-radiomke-cream-500 rounded-lg transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload CSV
            </button>
            <div className="px-3 py-2 bg-radiomke-charcoal-700 rounded-lg text-xs text-radiomke-cream-600">
              Press <kbd className="px-2 py-1 bg-radiomke-charcoal-600 border border-radiomke-charcoal-400 rounded shadow-sm text-radiomke-cream-500">⌘K</kbd> to add charts
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Workspace - Full Screen */}
      <div className="absolute inset-0 top-[57px]">
        <CanvasWorkspace onMount={handleCanvasMount} />
      </div>

      {/* Upload Modal */}
      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onUploadSuccess={handleUploadSuccess}
      />

      {/* Command Palette (Cmd+K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onSubmit={handlePromptSubmit}
        isGenerating={isGenerating}
      />
    </div>
  );
}
