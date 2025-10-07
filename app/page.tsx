"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Save, Clock, HelpCircle } from "lucide-react";
import { Editor, getSnapshot, loadSnapshot } from "tldraw";
import { CanvasWorkspace, createC1Card } from "@/components/canvas/CanvasWorkspace";
import { UploadModal } from "@/components/canvas/UploadModal";
import { CommandPalette } from "@/components/canvas/CommandPalette";
import { DashboardSelector } from "@/components/canvas/DashboardSelector";
import { DataGuide } from "@/components/help/DataGuide";
import { useDashboardAutoSave } from "@/hooks/useDashboardAutoSave";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [showDataGuide, setShowDataGuide] = useState(false);
  const [uploadedTables, setUploadedTables] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const editorRef = useRef<Editor | null>(null);

  // Dashboard state
  const [currentDashboardId, setCurrentDashboardId] = useState<string | null>(null);
  const [currentDashboardName, setCurrentDashboardName] = useState<string>('Untitled Dashboard');
  const [isLoadingDashboard, setIsLoadingDashboard] = useState(true);

  // Auto-save hook
  const { isSaving, lastSaved, saveError } = useDashboardAutoSave({
    editor: editorRef.current,
    dashboardId: currentDashboardId,
    dashboardName: currentDashboardName,
    enabled: !!currentDashboardId,
  });

  // Load existing tables from Supabase on mount
  useEffect(() => {
    const loadExistingTables = async () => {
      try {
        const response = await fetch('/api/tools/list-tables');
        const data = await response.json();

        if (data.success && data.tables && data.tables.length > 0) {
          setUploadedTables(data.tables);
          console.log('✅ Found existing tables in Supabase:', data.tables);
        }
      } catch (error) {
        console.error('Error loading existing tables:', error);
      }
    };

    loadExistingTables();
  }, []);

  // Load last dashboard or create default on mount
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


  const loadOrCreateDashboard = async () => {
    try {
      // Try to load existing dashboards
      const response = await fetch('/api/dashboards');
      const data = await response.json();

      if (data.success && data.dashboards.length > 0) {
        // Load most recent dashboard
        const latest = data.dashboards[0];
        await loadDashboard(latest.id, latest.name);
      } else {
        // Create default dashboard
        await createNewDashboard('My First Dashboard');
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
      await createNewDashboard('My First Dashboard');
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const loadDashboard = async (id: string, name: string) => {
    try {
      setIsLoadingDashboard(true);
      const response = await fetch(`/api/dashboards?id=${id}`);
      const data = await response.json();

      if (data.success && editorRef.current) {
        // Load snapshot into editor if it has valid data
        const snapshot = data.dashboard.snapshot;
        const hasValidSnapshot = snapshot?.document &&
          Object.keys(snapshot.document).length > 0;

        if (hasValidSnapshot) {
          editorRef.current.setCurrentTool('select');
          loadSnapshot(editorRef.current.store, snapshot);
          console.log(`✅ Loaded dashboard snapshot: ${name}`);
        } else {
          console.log(`✅ Loaded empty dashboard: ${name}`);
        }

        setCurrentDashboardId(id);
        setCurrentDashboardName(name);
      }
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setIsLoadingDashboard(false);
    }
  };

  const createNewDashboard = async (name: string) => {
    try {
      // Get current snapshot if editor is ready, otherwise use minimal valid snapshot
      let snapshot: any = { document: {}, session: {} };

      if (editorRef.current?.store) {
        snapshot = getSnapshot(editorRef.current.store);
      }

      const response = await fetch('/api/dashboards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          snapshot,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCurrentDashboardId(data.dashboard.id);
        setCurrentDashboardName(data.dashboard.name);
        console.log(`✅ Created dashboard: ${name}`);
      }
    } catch (error) {
      console.error('Error creating dashboard:', error);
    }
  };

  const handleRenameDashboard = async (id: string, newName: string) => {
    try {
      const response = await fetch('/api/dashboards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: newName }),
      });

      const data = await response.json();

      if (data.success && id === currentDashboardId) {
        setCurrentDashboardName(newName);
      }
    } catch (error) {
      console.error('Error renaming dashboard:', error);
    }
  };

  const handleDeleteDashboard = async (id: string) => {
    try {
      await fetch(`/api/dashboards?id=${id}`, { method: 'DELETE' });

      // If deleting current dashboard, load another or create new
      if (id === currentDashboardId) {
        const response = await fetch('/api/dashboards');
        const data = await response.json();

        if (data.success && data.dashboards.length > 0) {
          await loadDashboard(data.dashboards[0].id, data.dashboards[0].name);
        } else {
          await createNewDashboard('New Dashboard');
        }
      }
    } catch (error) {
      console.error('Error deleting dashboard:', error);
    }
  };

  const handleCanvasMount = (editor: Editor) => {
    editorRef.current = editor;
    console.log('✅ Canvas editor ready');

    // Load or create dashboard once editor is ready
    if (!currentDashboardId) {
      loadOrCreateDashboard();
    }
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
          {/* Logo and Dashboard Selector */}
          <div className="flex items-center gap-3">
            <img
              src="/images/RadioMilwaukeeLogos_HorizontalLockup_CreamOrange.png"
              alt="Radio Milwaukee"
              className="h-8 w-auto"
            />
            <span className="text-sm text-radiomke-cream-600 border-l border-radiomke-charcoal-400/50 pl-3 pr-3">
              Canvas Dashboard Builder
            </span>
            <DashboardSelector
              currentDashboardId={currentDashboardId}
              currentDashboardName={currentDashboardName}
              onSelectDashboard={loadDashboard}
              onCreateDashboard={createNewDashboard}
              onRenameDashboard={handleRenameDashboard}
              onDeleteDashboard={handleDeleteDashboard}
            />
          </div>

          {/* Actions and Save Status */}
          <div className="flex items-center gap-2">
            {/* Save Indicator */}
            {currentDashboardId && (
              <div className="flex items-center gap-2 px-3 py-2 bg-radiomke-charcoal-700 rounded-lg text-xs text-radiomke-cream-600">
                {isSaving ? (
                  <>
                    <Save className="w-3 h-3 animate-pulse text-radiomke-orange-500" />
                    <span>Saving...</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Clock className="w-3 h-3 text-radiomke-cream-600" />
                    <span>Saved {new Date(lastSaved).toLocaleTimeString()}</span>
                  </>
                ) : null}
                {saveError && (
                  <span className="text-red-400">Save failed</span>
                )}
              </div>
            )}

            <button
              onClick={() => setShowUploadModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-radiomke-orange-500 hover:bg-radiomke-orange-600 text-radiomke-cream-500 rounded-lg transition-colors text-sm font-medium"
            >
              <Upload className="w-4 h-4" />
              Upload CSV
            </button>
            <button
              onClick={() => setShowDataGuide(true)}
              className="flex items-center gap-2 px-4 py-2 bg-radiomke-blue-500 hover:bg-radiomke-blue-600 text-radiomke-cream-500 rounded-lg transition-colors text-sm font-medium"
              title="Data Management Guide"
            >
              <HelpCircle className="w-4 h-4" />
              Help
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

      {/* Data Guide Modal */}
      {showDataGuide && <DataGuide onClose={() => setShowDataGuide(false)} />}

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
