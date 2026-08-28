import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Ticket,
  AlertTriangle,
  Briefcase,
  FileCode,
  Send,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ActionNodeData } from '../../types';

export const ActionNode = memo(({ data, selected, id }: NodeProps) => {
  const nodeData = data as unknown as ActionNodeData;
  const status = nodeData.status || 'idle';

  const getActionIcon = () => {
    switch (nodeData.actionType) {
      case 'escalation':
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
      case 'ticket':
        return <Ticket className="w-3.5 h-3.5 text-cyan-400" />;
      case 'sales_lead':
        return <Briefcase className="w-3.5 h-3.5 text-emerald-400" />;
      case 'webhook':
        return <FileCode className="w-3.5 h-3.5 text-purple-400" />;
      default:
        return <Send className="w-3.5 h-3.5 text-blue-400" />;
    }
  };

  const getActionColorTheme = () => {
    switch (nodeData.actionType) {
      case 'escalation':
        return 'border-amber-500/30 bg-amber-500/10 text-amber-300';
      case 'ticket':
        return 'border-cyan-500/30 bg-cyan-500/10 text-cyan-300';
      case 'sales_lead':
        return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300';
      case 'webhook':
        return 'border-purple-500/30 bg-purple-500/10 text-purple-300';
      default:
        return 'border-blue-500/30 bg-blue-500/10 text-blue-300';
    }
  };

  return (
    <div
      id={`node-${id}`}
      className={`relative w-72 rounded-xl bg-slate-900/95 border transition-all duration-200 shadow-xl backdrop-blur-md ${
        selected
          ? 'border-cyan-500 ring-2 ring-cyan-500/30 shadow-cyan-950/50'
          : status === 'running'
          ? 'border-cyan-400 ring-2 ring-cyan-400/50 animate-pulse'
          : status === 'completed'
          ? 'border-cyan-500/60 shadow-cyan-950/40 ring-1 ring-cyan-500/40'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      {/* Target input handle (Left) */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        className="!w-3.5 !h-3.5 !bg-cyan-500 !border-2 !border-slate-900 transition-transform hover:scale-125 cursor-crosshair"
      />

      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-slate-800/70 border-b border-slate-800 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center justify-center w-6 h-6 rounded-lg border ${getActionColorTheme()}`}
          >
            {getActionIcon()}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-cyan-300 font-mono">
            Action Outcome
          </span>
        </div>

        {status === 'completed' ? (
          <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
            <CheckCircle2 className="w-3 h-3" /> Executed
          </span>
        ) : status === 'running' ? (
          <span className="flex items-center gap-1 text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-700/50 animate-pulse">
            <Clock className="w-3 h-3 animate-spin" /> Processing
          </span>
        ) : null}
      </div>

      {/* Body Content */}
      <div className="p-3.5 space-y-2">
        <div className="font-semibold text-slate-100 text-sm">
          {nodeData.label || 'Final Action Outcome'}
        </div>
        <p className="text-xs text-slate-400 leading-relaxed font-sans line-clamp-3">
          {nodeData.details || 'Dispatches downstream tasks, API actions or notifications.'}
        </p>

        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-mono text-slate-500 uppercase">
            Inngest Step
          </span>
          <div className="flex items-center gap-1 text-[11px] font-mono text-cyan-400">
            <Sparkles className="w-3 h-3" />
            <span>Terminal</span>
          </div>
        </div>
      </div>
    </div>
  );
});

ActionNode.displayName = 'ActionNode';
