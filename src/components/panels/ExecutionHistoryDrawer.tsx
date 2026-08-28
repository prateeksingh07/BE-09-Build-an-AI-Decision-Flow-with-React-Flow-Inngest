import React, { useEffect, useState } from 'react';
import {
  X,
  History,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RotateCcw,
  Trash2,
  ChevronRight,
  Layers,
} from 'lucide-react';
import { WorkflowExecutionRecord } from '../../types';
import { fetchExecutions, clearExecutions } from '../../lib/api';

interface ExecutionHistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRun: (record: WorkflowExecutionRecord) => void;
  currentExecutionId?: string;
}

export function ExecutionHistoryDrawer({
  isOpen,
  onClose,
  onSelectRun,
  currentExecutionId,
}: ExecutionHistoryDrawerProps) {
  const [runs, setRuns] = useState<WorkflowExecutionRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const list = await fetchExecutions();
      setRuns(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRuns();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearAll = async () => {
    if (window.confirm('Clear all execution history logs?')) {
      await clearExecutions();
      setRuns([]);
    }
  };

  return (
    <div
      id="execution-history-drawer"
      className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-40 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              Execution History
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              {runs.length} total Inngest runs
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {runs.length > 0 && (
            <button
              onClick={handleClearAll}
              title="Clear all logs"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            id="btn-close-history-drawer"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Runs List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
        {loading ? (
          <div className="flex items-center justify-center h-48 text-slate-500 gap-2">
            <Clock className="w-4 h-4 animate-spin text-indigo-400" />
            <span className="text-xs">Loading execution runs...</span>
          </div>
        ) : runs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-slate-500 space-y-2">
            <History className="w-8 h-8 opacity-30 text-indigo-400" />
            <p className="text-xs">No historical runs recorded yet.</p>
          </div>
        ) : (
          runs.map((run) => {
            const isSelected = run.id === currentExecutionId;
            return (
              <div
                key={run.id}
                onClick={() => onSelectRun(run)}
                className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                  isSelected
                    ? 'bg-indigo-950/40 border-indigo-500/80 shadow-md ring-1 ring-indigo-500/30'
                    : 'bg-slate-950/60 hover:bg-slate-800/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {run.status === 'completed' ? (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/60">
                        <CheckCircle2 className="w-3 h-3" /> SUCCESS
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-700/60">
                        <AlertCircle className="w-3 h-3" /> FAILED
                      </span>
                    )}
                    <span className="text-xs font-mono text-slate-400">
                      {run.steps?.length || 0} steps
                    </span>
                  </div>

                  <span className="text-[11px] font-mono text-slate-500">
                    {run.totalDurationMs ? `${run.totalDurationMs}ms` : ''}
                  </span>
                </div>

                <div className="text-xs text-slate-300 font-mono line-clamp-1">
                  ID: {run.id}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                  <span>{new Date(run.startedAt).toLocaleTimeString()}</span>
                  <div className="flex items-center gap-1 text-indigo-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>Inspect Path</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
