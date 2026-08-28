import React from 'react';
import { BaseEdge, EdgeLabelRenderer, EdgeProps, getBezierPath } from '@xyflow/react';
import { X } from 'lucide-react';

export function NoEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
}: EdgeProps) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isActive = Boolean(data?.isActive);
  const isTraversed = Boolean(data?.isTraversed);
  const label = (data?.label as string) || 'NO';

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: isActive ? '#f43f5e' : isTraversed ? '#e11d48' : '#3f1a24',
          strokeWidth: isActive ? 3 : selected ? 2.5 : 2,
          strokeDasharray: isActive ? '6,6' : undefined,
          animation: isActive ? 'flowDash 0.8s linear infinite' : undefined,
          filter: isActive ? 'drop-shadow(0 0 8px rgba(244, 63, 94, 0.7))' : undefined,
          transition: 'stroke 0.3s ease, stroke-width 0.3s ease',
        }}
      />
      <EdgeLabelRenderer>
        <div
          id={`edge-label-${id}`}
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-mono font-semibold transition-all duration-200 shadow-sm border ${
              isActive
                ? 'bg-rose-500 text-slate-950 border-rose-300 ring-2 ring-rose-400/50 scale-105 animate-pulse'
                : isTraversed
                ? 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                : 'bg-slate-900/90 text-rose-400/80 border-rose-900/50 hover:border-rose-500'
            }`}
          >
            <X className="w-3 h-3 stroke-[3]" />
            <span>{label}</span>
          </div>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}
