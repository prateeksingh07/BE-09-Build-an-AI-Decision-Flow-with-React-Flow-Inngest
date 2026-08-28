import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  BrainCircuit,
  Check,
  X,
  AlertCircle,
  Clock,
  Sparkles,
  Zap,
} from 'lucide-react';
import { DecisionNodeData } from '../../types';

export const DecisionNode = memo(({ data, selected, id }: NodeProps) => {
  const nodeData = data as unknown as DecisionNodeData;
  const status = nodeData.status || 'idle';
  const result = nodeData.lastResult;
  const isRunning = status === 'running' || nodeData.isEvaluating;

  return (
    <div
      id={`node-${id}`}
      className={`relative w-80 rounded-xl bg-slate-900/95 border transition-all duration-200 shadow-2xl backdrop-blur-md ${
        selected
          ? 'border-violet-500 ring-2 ring-violet-500/30 shadow-violet-950/60'
          : isRunning
          ? 'border-amber-400 ring-2 ring-amber-400/50 shadow-amber-950/40 animate-pulse'
          : status === 'completed'
          ? result === 'YES'
            ? 'border-emerald-600/70 shadow-emerald-950/30'
            : 'border-rose-600/70 shadow-rose-950/30'
          : status === 'failed'
          ? 'border-rose-500 ring-2 ring-rose-500/30'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Target input handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!w-3.5 !h-3.5 !bg-slate-400 !border-2 !border-slate-900 transition-transform hover:scale-125 cursor-crosshair"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/80 border-b border-slate-800/90 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-lg border ${
              result === 'YES'
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                : result === 'NO'
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-violet-500/20 border-violet-500/40 text-violet-400'
            }`}
          >
            <BrainCircuit className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-violet-300 font-mono">
            AI Decision
          </span>
        </div>

        {/* Live Status indicator */}
        <div className="flex items-center gap-1.5">
          {isRunning ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-950/70 px-2 py-0.5 rounded border border-amber-700/60 animate-pulse">
              <Clock className="w-3 h-3 animate-spin" /> Evaluating
            </span>
          ) : result === 'YES' ? (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-emerald-300 bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/50 shadow-sm shadow-emerald-900/50">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> YES
            </span>
          ) : result === 'NO' ? (
            <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-rose-300 bg-rose-950/80 px-2.5 py-0.5 rounded-full border border-rose-500/50 shadow-sm shadow-rose-900/50">
              <X className="w-3.5 h-3.5 stroke-[3]" /> NO
            </span>
          ) : status === 'failed' ? (
            <span className="flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-800">
              <AlertCircle className="w-3 h-3" /> Error
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-slate-950/60 px-1.5 py-0.5 rounded border border-slate-800">
              <Sparkles className="w-3 h-3 text-violet-400" /> Binary
            </span>
          )}
        </div>
      </div>

      {/* Main Node Content */}
      <div className="p-3.5 space-y-2.5">
        <div>
          <div className="font-semibold text-slate-100 text-sm leading-snug">
            {nodeData.label || 'Binary AI Decision Step'}
          </div>
        </div>

        {/* Prompt Card */}
        <div className="p-2.5 rounded-lg bg-slate-950/90 border border-slate-800/80 text-xs text-slate-300 leading-relaxed font-sans relative group">
          <p className="line-clamp-3 italic text-slate-300 font-normal">
            &ldquo;{nodeData.prompt || 'Is the requirement met? Returns YES or NO.'}&rdquo;
          </p>
        </div>

        {/* Evaluation reasoning outcome if available */}
        {nodeData.lastExplanation && (
          <div className="p-2 rounded-md bg-slate-950/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 uppercase">
              <span>Model Reasoning</span>
              {nodeData.lastExecutionTimeMs && (
                <span>{nodeData.lastExecutionTimeMs}ms</span>
              )}
            </div>
            <p className="line-clamp-2 text-slate-300">
              {nodeData.lastExplanation}
            </p>
          </div>
        )}

        {/* Footer info: Model tag & handles indicator */}
        <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 font-mono">
          <div className="flex items-center gap-1 text-slate-400">
            <Zap className="w-3 h-3 text-amber-400" />
            <span>{nodeData.model || 'gemini-2.5-flash'}</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-400 font-semibold text-[11px] flex items-center gap-0.5">
              YES →
            </span>
            <span className="text-rose-400 font-semibold text-[11px] flex items-center gap-0.5">
              NO →
            </span>
          </div>
        </div>
      </div>

      {/* YES Output Handle (Top Right) */}
      <div className="absolute -right-3 top-16 flex items-center gap-1 group">
        <Handle
          type="source"
          position={Position.Right}
          id="yes"
          className="!w-4 !h-4 !bg-emerald-500 !border-2 !border-slate-950 transition-all hover:scale-125 !static shadow-md shadow-emerald-500/50 cursor-crosshair"
        />
      </div>

      {/* NO Output Handle (Bottom Right) */}
      <div className="absolute -right-3 bottom-10 flex items-center gap-1 group">
        <Handle
          type="source"
          position={Position.Right}
          id="no"
          className="!w-4 !h-4 !bg-rose-500 !border-2 !border-slate-950 transition-all hover:scale-125 !static shadow-md shadow-rose-500/50 cursor-crosshair"
        />
      </div>
    </div>
  );
});

DecisionNode.displayName = 'DecisionNode';
