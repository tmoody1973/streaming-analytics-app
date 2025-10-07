import { useEffect, useRef, useState } from 'react';
import { Editor, getSnapshot } from 'tldraw';

interface UseDashboardAutoSaveOptions {
  editor: Editor | null;
  dashboardId: string | null;
  dashboardName: string;
  enabled?: boolean;
  debounceMs?: number;
}

export function useDashboardAutoSave({
  editor,
  dashboardId,
  dashboardName,
  enabled = true,
  debounceMs = 3000, // 3 seconds
}: UseDashboardAutoSaveOptions) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSnapshotRef = useRef<string | null>(null);

  useEffect(() => {
    if (!editor || !enabled || !dashboardId) {
      return;
    }

    // Subscribe to tldraw store changes
    const handleStoreChange = () => {
      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Set new timeout for debounced save
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          // Get current snapshot
          const snapshot = getSnapshot(editor.store);
          const snapshotStr = JSON.stringify(snapshot);

          // Skip if nothing changed
          if (snapshotStr === lastSnapshotRef.current) {
            return;
          }

          setIsSaving(true);
          setSaveError(null);

          // Save to Supabase
          const response = await fetch('/api/dashboards', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: dashboardId,
              snapshot,
            }),
          });

          const data = await response.json();

          if (!data.success) {
            throw new Error(data.error || 'Failed to save dashboard');
          }

          // Update last saved state
          lastSnapshotRef.current = snapshotStr;
          setLastSaved(new Date());
          setSaveError(null);
        } catch (error: any) {
          console.error('Auto-save error:', error);
          setSaveError(error.message);
        } finally {
          setIsSaving(false);
        }
      }, debounceMs);
    };

    // Listen to store changes
    const unsubscribe = editor.store.listen(handleStoreChange);

    // Cleanup
    return () => {
      unsubscribe();
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [editor, dashboardId, enabled, debounceMs, dashboardName]);

  // Manual save function
  const saveNow = async () => {
    if (!editor || !dashboardId) return;

    try {
      setIsSaving(true);
      setSaveError(null);

      const snapshot = getSnapshot(editor.store);

      const response = await fetch('/api/dashboards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: dashboardId,
          snapshot,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to save dashboard');
      }

      lastSnapshotRef.current = JSON.stringify(snapshot);
      setLastSaved(new Date());
      setSaveError(null);
    } catch (error: any) {
      console.error('Manual save error:', error);
      setSaveError(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return {
    isSaving,
    lastSaved,
    saveError,
    saveNow,
  };
}
