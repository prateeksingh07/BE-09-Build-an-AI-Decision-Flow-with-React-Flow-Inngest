import React, { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  Connection,
  Edge,
  Node,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  BackgroundVariant,
} from '@xyflow/react';
import { TriggerNode } from './nodes/TriggerNode';
import { DecisionNode } from './nodes/DecisionNode';
import { ActionNode } from './nodes/ActionNode';
import { YesEdge } from './edges/YesEdge';
import { NoEdge } from './edges/NoEdge';
import { BrainCircuit, Sparkles, Play, Plus, Zap, Check, X } from 'lucide-react';

interface WorkflowCanvasProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  onNodeClick: (event: React.MouseEvent, node: Node) => void;
  onAddDecisionNode: () => void;
  onAddActionNode: () => void;
  onAddTriggerNode: () => void;
  isRunning: boolean;
}

export function WorkflowCanvas({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  onAddDecisionNode,
  onAddActionNode,
  onAddTriggerNode,
  isRunning,
}: WorkflowCanvasProps) {
  const nodeTypes = useMemo(
    () => ({
      triggerNode: TriggerNode,
      decisionNode: DecisionNode,
      actionNode: ActionNode,
    }),
    []
  );

  const edgeTypes = useMemo(
    () => ({
      yesEdge: YesEdge,
      noEdge: NoEdge,
    }),
    []
  );

  return (
    <div id="workflow-canvas-container" className="w-full h-full relative">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.2}
        maxZoom={2}
        defaultEdgeOptions={{
          type: 'default',
        }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1.5}
          color="#334155"
        />
        <Controls
          position="bottom-right"
          className="!bg-slate-900 !border-slate-800 !text-slate-300"
        />
        <MiniMap
          position="bottom-left"
          nodeColor={(n) => {
            if (n.type === 'triggerNode') return '#6366f1';
            if (n.type === 'decisionNode') return '#8b5cf6';
            if (n.type === 'actionNode') return '#06b6d4';
            return '#64748b';
          }}
          maskColor="rgba(3, 7, 18, 0.7)"
          className="!border-slate-800 !bg-slate-950 !rounded-xl overflow-hidden shadow-xl"
        />

        {/* Quick Add Floating Canvas Toolbar */}
        <Panel position="top-left" className="m-4">
          <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
            <span className="text-[11px] font-mono font-semibold uppercase text-slate-400 px-2">
              Add Node:
            </span>

            <button
              id="quick-add-decision-btn"
              onClick={onAddDecisionNode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-950/60 hover:bg-violet-900/80 border border-violet-700/50 text-violet-200 text-xs font-semibold transition-all hover:scale-105"
            >
              <BrainCircuit className="w-3.5 h-3.5 text-violet-400" />
              <span>AI Decision</span>
            </button>

            <button
              id="quick-add-action-btn"
              onClick={onAddActionNode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-700/50 text-cyan-200 text-xs font-semibold transition-all hover:scale-105"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Action Outcome</span>
            </button>

            <button
              id="quick-add-trigger-btn"
              onClick={onAddTriggerNode}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/80 border border-indigo-700/50 text-indigo-200 text-xs font-semibold transition-all hover:scale-105"
            >
              <Play className="w-3.5 h-3.5 fill-indigo-400 text-indigo-400" />
              <span>Trigger</span>
            </button>
          </div>
        </Panel>

        {/* Legend Panel */}
        <Panel position="top-right" className="m-4 hidden sm:block">
          <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl text-[11px] font-mono text-slate-400">
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50" />
              <span className="text-emerald-300 font-bold">YES Path</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm shadow-rose-500/50" />
              <span className="text-rose-300 font-bold">NO Path</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
