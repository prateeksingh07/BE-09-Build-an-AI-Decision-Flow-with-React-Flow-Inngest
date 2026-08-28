import React from 'react';
import {
  BrainCircuit,
  Play,
  Plus,
  Terminal,
  History,
  FolderOpen,
  RotateCcw,
  Sparkles,
  Zap,
  CheckCircle2,
  Activity,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface HeaderProps {
  workflowTitle: string;
  onOpenRunner: () => void;
  onOpenLogs: () => void;
  onOpenHistory: () => void;
  onOpenWorkflows: () => void;
  onAddDecisionNode: () => void;
  onAddActionNode: () => void;
  onAddTriggerNode: () => void;
  onResetCanvas: () => void;
  isRunning: boolean;
  logsCount: number;
  lastStatus?: 'idle' | 'running' | 'completed' | 'failed';
}

export function Header({
  workflowTitle,
  onOpenRunner,
  onOpenLogs,
  onOpenHistory,
  onOpenWorkflows,
  onAddDecisionNode,
  onAddActionNode,
  onAddTriggerNode,
  onResetCanvas,
  isRunning,
  logsCount,
  lastStatus = 'idle',
}: HeaderProps) {
  const [showAddMenu, setShowAddMenu] = React.useState(false);

  return (
    <header
      id="app-header"
      className="h-16 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md flex items-center justify-between px-5 select-none z-20 shrink-0"
    >
      {/* Left: Brand & Workflow Title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 ring-1 ring-white/20">
            <BrainCircuit className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm tracking-tight text-white">
                Inngest AI Decision Engine
              </span>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-indigo-950/80 text-indigo-400 border border-indigo-700/50">
                <Zap className="w-2.5 h-2.5 fill-indigo-400" /> Inngest Orchestrated
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="font-semibold text-slate-200 truncate max-w-xs">
                {workflowTitle}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Center: Graph Actions & Add Nodes */}
      <div className="hidden lg:flex items-center gap-2">
        {/* Add Node Dropdown */}
        <div className="relative">
          <button
            id="btn-add-node-menu"
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-indigo-400" />
            <span>Add Node</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showAddMenu && (
            <div
              className="absolute top-full left-0 mt-1 w-52 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-1.5 z-50 space-y-1 animate-in fade-in zoom-in-95 duration-100"
              onMouseLeave={() => setShowAddMenu(false)}
            >
              <button
                onClick={() => {
                  onAddDecisionNode();
                  setShowAddMenu(false);
                }}
                className="w-full px-3 py-2 rounded-lg text-left text-xs font-medium text-slate-200 hover:bg-violet-950/60 hover:text-violet-300 flex items-center gap-2 transition-colors"
              >
                <BrainCircuit className="w-4 h-4 text-violet-400" />
                <div>
                  <div className="font-bold">AI Decision Step</div>
                  <div className="text-[10px] text-slate-400 font-mono">YES / NO Binary Branch</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onAddActionNode();
                  setShowAddMenu(false);
                }}
                className="w-full px-3 py-2 rounded-lg text-left text-xs font-medium text-slate-200 hover:bg-cyan-950/60 hover:text-cyan-300 flex items-center gap-2 transition-colors"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <div>
                  <div className="font-bold">Action Outcome</div>
                  <div className="text-[10px] text-slate-400 font-mono">Terminal Outcome</div>
                </div>
              </button>

              <button
                onClick={() => {
                  onAddTriggerNode();
                  setShowAddMenu(false);
                }}
                className="w-full px-3 py-2 rounded-lg text-left text-xs font-medium text-slate-200 hover:bg-indigo-950/60 hover:text-indigo-300 flex items-center gap-2 transition-colors"
              >
                <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
                <div>
                  <div className="font-bold">Workflow Trigger</div>
                  <div className="text-[10px] text-slate-400 font-mono">Payload Context Ingest</div>
                </div>
              </button>
            </div>
          )}
        </div>

        <button
          id="btn-open-workflows"
          onClick={onOpenWorkflows}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
        >
          <FolderOpen className="w-3.5 h-3.5 text-slate-400" />
          <span>Templates & Save</span>
        </button>

        <button
          id="btn-reset-canvas"
          onClick={onResetCanvas}
          title="Reset flow execution states"
          className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Right: Primary Run Button & Logs Toggles */}
      <div className="flex items-center gap-2.5">
        <button
          id="btn-toggle-logs"
          onClick={onOpenLogs}
          className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors ${
            lastStatus === 'running'
              ? 'bg-amber-950/80 border-amber-600/60 text-amber-300 animate-pulse'
              : lastStatus === 'completed'
              ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-emerald-400'
              : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Step Logs</span>
          {logsCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
              {logsCount}
            </span>
          )}
        </button>

        <button
          id="btn-toggle-history"
          onClick={onOpenHistory}
          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-mono font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
        >
          <History className="w-3.5 h-3.5 text-slate-400" />
          <span className="hidden sm:inline">History</span>
        </button>

        {/* Primary Run Workflow Action */}
        <button
          id="btn-header-run-workflow"
          onClick={onOpenRunner}
          disabled={isRunning}
          className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50"
        >
          {isRunning ? (
            <>
              <Activity className="w-3.5 h-3.5 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Run Flow</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
