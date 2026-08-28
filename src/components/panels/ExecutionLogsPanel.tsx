import React, { useState } from 'react';
import {
  X,
  Terminal,
  Clock,
  CheckCircle2,
  AlertCircle,
  BrainCircuit,
  Play,
  Sparkles,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronRight,
  Copy,
  Layers,
} from 'lucide-react';
import { StepLog } from '../../types';

interface ExecutionLogsPanelProps {
  logs: StepLog[];
  executionId?: string;
  totalDurationMs?: number;
  status?: 'running' | 'completed' | 'failed' | 'idle';
  summary?: string;
  onClose: () => void;
  onRetryStep?: (step: StepLog) => void;
  onFocusNode?: (nodeId: string) => void;
}

export function ExecutionLogsPanel({
  logs,
  executionId,
  totalDurationMs,
  status = 'idle',
  summary,
  onClose,
  onRetryStep,
  onFocusNode,
}: ExecutionLogsPanelProps) {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  return (
    <div
      id="execution-logs-panel"
      className="fixed bottom-0 left-0 right-0 h-80 bg-slate-950/95 border-t border-slate-800 shadow-2xl z-30 flex flex-col backdrop-blur-xl animate-in slide-in-from-bottom duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-mono font-bold tracking-wide uppercase text-slate-200">
              Inngest Step Execution Logs
            </h3>
          </div>

          {executionId && (
            <span className="text-[11px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              ID: {executionId}
            </span>
          )}

          {status === 'running' ? (
            <span className="flex items-center gap-1 text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-2.5 py-0.5 rounded-full border border-amber-600/50 animate-pulse">
              <Clock className="w-3.5 h-3.5 animate-spin" /> Inngest Steps Running...
            </span>
          ) : status === 'completed' ? (
            <span className="flex items-center gap-1 text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-600/50">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed ({totalDurationMs || 0}ms)
            </span>
          ) : status === 'failed' ? (
            <span className="flex items-center gap-1 text-xs font-mono font-bold text-rose-400 bg-rose-950/60 px-2.5 py-0.5 rounded-full border border-rose-600/50">
              <AlertCircle className="w-3.5 h-3.5" /> Failed
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-3">
          {summary && (
            <span className="text-xs text-slate-400 hidden md:inline truncate max-w-md">
              {summary}
            </span>
          )}
          <button
            id="btn-close-logs"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logs Timeline Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2.5 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Layers className="w-8 h-8 opacity-40 text-indigo-400" />
            <p className="text-sm font-sans">No execution steps yet. Click "Run Workflow" to execute the flow.</p>
          </div>
        ) : (
          logs.map((step, idx) => {
            const isExpanded = !!expandedSteps[step.id];
            return (
              <div
                key={step.id || idx}
                id={`step-log-${step.nodeId}`}
                className={`rounded-lg border transition-all ${
                  step.status === 'failed'
                    ? 'bg-rose-950/20 border-rose-800/80'
                    : step.decision === 'YES'
                    ? 'bg-slate-900/90 border-emerald-800/50'
                    : step.decision === 'NO'
                    ? 'bg-slate-900/90 border-rose-800/50'
                    : 'bg-slate-900/90 border-slate-800'
                }`}
              >
                {/* Step Row summary */}
                <div className="flex items-center justify-between px-3.5 py-2.5">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(step.id)}
                      className="text-slate-400 hover:text-slate-200"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                    </button>

                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500 text-[11px]">#{idx + 1}</span>
                      <span className="text-indigo-400 font-bold">{step.stepName}</span>
                    </div>

                    <button
                      onClick={() => onFocusNode?.(step.nodeId)}
                      className="text-[11px] text-slate-400 hover:text-indigo-300 underline underline-offset-2"
                    >
                      [{step.nodeLabel}]
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Decision Outcome */}
                    {step.decision && (
                      <span
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] border ${
                          step.decision === 'YES'
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/60'
                            : 'bg-rose-950 text-rose-300 border-rose-500/60'
                        }`}
                      >
                        {step.decision === 'YES' ? (
                          <Check className="w-3 h-3 stroke-[3]" />
                        ) : (
                          <X className="w-3 h-3 stroke-[3]" />
                        )}
                        {step.decision}
                      </span>
                    )}

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {step.durationMs}ms
                    </span>

                    {onRetryStep && step.nodeType === 'decisionNode' && (
                      <button
                        onClick={() => onRetryStep(step)}
                        title="Re-run this Inngest decision step"
                        className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center gap-1 text-[11px] transition-colors border border-slate-700"
                      >
                        <RotateCcw className="w-3 h-3" /> Retry
                      </button>
                    )}
                  </div>
                </div>

                {/* Reasoning summary row if present */}
                {step.reasoning && (
                  <div className="px-9 pb-2 text-[11px] text-slate-300 font-sans italic">
                    Reasoning: &ldquo;{step.reasoning}&rdquo;
                  </div>
                )}

                {/* Expanded Payload & Raw Details */}
                {isExpanded && (
                  <div className="px-4 py-3 bg-slate-950/90 border-t border-slate-800/80 rounded-b-lg space-y-2 text-[11px]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <div className="flex items-center justify-between text-slate-400 font-bold mb-1">
                          <span>STEP INPUT</span>
                          <button
                            onClick={() =>
                              handleCopy(JSON.stringify(step.input, null, 2), `in-${step.id}`)
                            }
                            className="text-slate-500 hover:text-slate-300 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedId === `in-${step.id}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="p-2 bg-slate-900/90 rounded border border-slate-800 text-slate-300 overflow-x-auto max-h-36">
                          {JSON.stringify(step.input, null, 2)}
                        </pre>
                      </div>

                      <div>
                        <div className="flex items-center justify-between text-slate-400 font-bold mb-1">
                          <span>STEP OUTPUT</span>
                          <button
                            onClick={() =>
                              handleCopy(JSON.stringify(step.output, null, 2), `out-${step.id}`)
                            }
                            className="text-slate-500 hover:text-slate-300 flex items-center gap-1"
                          >
                            <Copy className="w-3 h-3" />
                            {copiedId === `out-${step.id}` ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                        <pre className="p-2 bg-slate-900/90 rounded border border-slate-800 text-slate-300 overflow-x-auto max-h-36">
                          {JSON.stringify(step.output, null, 2)}
                        </pre>
                      </div>
                    </div>

                    {step.error && (
                      <div className="p-2 rounded bg-rose-950/40 border border-rose-800 text-rose-300">
                        <strong>Error:</strong> {step.error}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
