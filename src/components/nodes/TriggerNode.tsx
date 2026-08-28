import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { Play, Sparkles, Database, CheckCircle2, Clock } from 'lucide-react';
import { TriggerNodeData } from '../../types';

export const TriggerNode = memo(({ data, selected, id }: NodeProps) => {
  const nodeData = data as unknown as TriggerNodeData;
  const status = nodeData.status || 'idle';

  return (
    <div
      id={`node-${id}`}
      className={`relative w-72 rounded-xl bg-slate-900/95 border transition-all duration-200 shadow-xl backdrop-blur-md ${
        selected
          ? 'border-indigo-500 ring-2 ring-indigo-500/30 shadow-indigo-950/50'
          : status === 'running'
          ? 'border-indigo-400 ring-2 ring-indigo-400/50 animate-pulse'
          : status === 'completed'
          ? 'border-indigo-500/60 shadow-indigo-900/20'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Top Header Badge */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/70 border-b border-slate-800 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
            <Play className="w-3.5 h-3.5 fill-indigo-400" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300 font-mono">
            Trigger / Ingest
          </span>
        </div>
        {status === 'completed' ? (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
            <CheckCircle2 className="w-3 h-3" /> Ready
          </span>
        ) : status === 'running' ? (
          <span className="flex items-center gap-1 text-[11px] font-mono text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-700/50 animate-pulse">
            <Clock className="w-3 h-3 animate-spin" /> Ingesting
          </span>
        ) : null}
      </div>

      {/* Body Content */}
      <div className="p-3.5 space-y-2">
        <div className="font-semibold text-slate-100 text-sm flex items-center gap-1.5">
          <span>{nodeData.label || 'Workflow Trigger'}</span>
        </div>
        <p className="text-xs text-slate-400 leading-relaxed">
          {nodeData.description || 'Payload & contextual input root for Inngest execution'}
        </p>

        <div className="flex items-center gap-2 pt-1">
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-950/80 border border-slate-800/80 text-[11px] font-mono text-slate-400">
            <Database className="w-3 h-3 text-indigo-400" />
            <span>JSON Context</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-mono text-indigo-400/90 ml-auto">
            <Sparkles className="w-3 h-3" />
            <span>Step #1</span>
          </div>
        </div>
      </div>

      {/* Target & Source Handles */}
      <Handle
        type="source"
        position={Position.Right}
        id="trigger-out"
        className="!w-3.5 !h-3.5 !bg-indigo-500 !border-2 !border-slate-900 transition-transform hover:scale-125 cursor-crosshair"
      />
    </div>
  );
});

TriggerNode.displayName = 'TriggerNode';
