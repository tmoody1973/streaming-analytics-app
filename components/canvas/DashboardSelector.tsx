"use client";

import { useState, useEffect } from 'react';
import { ChevronDown, Plus, Edit2, Trash2, Check, X } from 'lucide-react';

interface Dashboard {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

interface DashboardSelectorProps {
  currentDashboardId: string | null;
  currentDashboardName: string;
  onSelectDashboard: (id: string, name: string) => void;
  onCreateDashboard: (name: string) => void;
  onRenameDashboard: (id: string, newName: string) => void;
  onDeleteDashboard: (id: string) => void;
}

export function DashboardSelector({
  currentDashboardId,
  currentDashboardName,
  onSelectDashboard,
  onCreateDashboard,
  onRenameDashboard,
  onDeleteDashboard,
}: DashboardSelectorProps) {
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');

  // Load dashboards
  useEffect(() => {
    loadDashboards();
  }, []);

  const loadDashboards = async () => {
    try {
      const response = await fetch('/api/dashboards');
      const data = await response.json();

      if (data.success) {
        setDashboards(data.dashboards);
      }
    } catch (error) {
      console.error('Failed to load dashboards:', error);
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return;

    onCreateDashboard(newName.trim());
    setNewName('');
    setIsCreating(false);
    await loadDashboards();
  };

  const handleRename = async (id: string) => {
    if (!newName.trim()) return;

    onRenameDashboard(id, newName.trim());
    setEditingId(null);
    setNewName('');
    await loadDashboards();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this dashboard?')) {
      onDeleteDashboard(id);
      await loadDashboards();
    }
  };

  return (
    <div className="relative">
      {/* Current Dashboard Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-radiomke-charcoal-600 hover:bg-radiomke-charcoal-500 text-radiomke-cream-500 rounded-lg transition-colors text-sm font-medium border border-radiomke-charcoal-400/30"
      >
        <span>{currentDashboardName}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-radiomke-charcoal-600 border border-radiomke-charcoal-400/30 rounded-lg shadow-xl z-50 max-h-96 overflow-y-auto">
          {/* Dashboard List */}
          <div className="p-2">
            {dashboards.map((dashboard) => (
              <div
                key={dashboard.id}
                className="group flex items-center gap-2 px-3 py-2 hover:bg-radiomke-charcoal-500 rounded transition-colors"
              >
                {editingId === dashboard.id ? (
                  // Edit Mode
                  <div className="flex-1 flex items-center gap-2">
                    <input
                      type="text"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(dashboard.id);
                        if (e.key === 'Escape') {
                          setEditingId(null);
                          setNewName('');
                        }
                      }}
                      className="flex-1 px-2 py-1 bg-radiomke-charcoal-700 text-radiomke-cream-500 rounded text-sm border border-radiomke-orange-500 focus:outline-none"
                      autoFocus
                    />
                    <button
                      onClick={() => handleRename(dashboard.id)}
                      className="p-1 hover:bg-radiomke-orange-500/20 rounded"
                    >
                      <Check className="w-4 h-4 text-radiomke-orange-500" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setNewName('');
                      }}
                      className="p-1 hover:bg-radiomke-charcoal-400 rounded"
                    >
                      <X className="w-4 h-4 text-radiomke-cream-600" />
                    </button>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <button
                      onClick={() => {
                        onSelectDashboard(dashboard.id, dashboard.name);
                        setIsOpen(false);
                      }}
                      className="flex-1 text-left text-sm text-radiomke-cream-500"
                    >
                      {dashboard.name}
                      {dashboard.id === currentDashboardId && (
                        <span className="ml-2 text-radiomke-orange-500">●</span>
                      )}
                    </button>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(dashboard.id);
                          setNewName(dashboard.name);
                        }}
                        className="p-1 hover:bg-radiomke-orange-500/20 rounded"
                      >
                        <Edit2 className="w-3 h-3 text-radiomke-orange-500" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(dashboard.id);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {dashboards.length === 0 && !isCreating && (
              <div className="px-3 py-2 text-sm text-radiomke-cream-600 text-center">
                No dashboards yet
              </div>
            )}
          </div>

          {/* Create New */}
          <div className="border-t border-radiomke-charcoal-400/30 p-2">
            {isCreating ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleCreate();
                    if (e.key === 'Escape') {
                      setIsCreating(false);
                      setNewName('');
                    }
                  }}
                  placeholder="Dashboard name..."
                  className="flex-1 px-3 py-2 bg-radiomke-charcoal-700 text-radiomke-cream-500 rounded text-sm border border-radiomke-orange-500 focus:outline-none placeholder:text-radiomke-cream-600/50"
                  autoFocus
                />
                <button
                  onClick={handleCreate}
                  className="p-2 hover:bg-radiomke-orange-500/20 rounded"
                >
                  <Check className="w-4 h-4 text-radiomke-orange-500" />
                </button>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setNewName('');
                  }}
                  className="p-2 hover:bg-radiomke-charcoal-400 rounded"
                >
                  <X className="w-4 h-4 text-radiomke-cream-600" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsCreating(true)}
                className="w-full flex items-center gap-2 px-3 py-2 hover:bg-radiomke-charcoal-500 rounded transition-colors text-radiomke-orange-500 text-sm font-medium"
              >
                <Plus className="w-4 h-4" />
                New Dashboard
              </button>
            )}
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
