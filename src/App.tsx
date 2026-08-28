import React, { useState, useCallback, useEffect } from 'react';
import {
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  ReactFlowProvider,
} from '@xyflow/react';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { WorkflowCanvas } from './components/WorkflowCanvas';
import { NodeEditorDrawer } from './components/panels/NodeEditorDrawer';
import { ExecutionLogsPanel } from './components/panels/ExecutionLogsPanel';
import { ExecutionHistoryDrawer } from './components/panels/ExecutionHistoryDrawer';
import { InputRunnerModal } from './components/panels/InputRunnerModal';
import { WorkflowManagerModal } from './components/panels/WorkflowManagerModal';
import {
  WorkflowDefinition,
  WorkflowExecutionRecord,
  StepLog,
  DecisionNodeData,
} from './types';
import {
  executeWorkflow,
  fetchWorkflows,
  retryStep,
  evaluateSingleNode,
} from './lib/api';

const INITIAL_NODES: Node[] = [
  {
    id: 'start-1',
    type: 'triggerNode',
    position: { x: 50, y: 220 },
    data: {
      label: 'Incoming Customer Request',
      description: 'Customer email payload, plan tier, and raw message body',
      inputPayload: '',
      status: 'idle',
    },
  },
  {
    id: 'decision-1',
    type: 'decisionNode',
    position: { x: 400, y: 190 },
    data: {
      label: 'Is Technical Bug or Outage?',
      prompt:
        'Does this customer message describe an active technical issue, software bug, API error (like 500 status), or system outage? Return YES if technical/error, NO if sales/billing/general inquiry.',
      systemInstruction:
        'You are an expert customer operations triage classifier. Look for technical keywords like error codes, API endpoints, bugs, crashes, or integration failures.',
      temperature: 0.1,
      model: 'gemini-3.7-flash',
      status: 'idle',
    },
  },
  {
    id: 'decision-2',
    type: 'decisionNode',
    position: { x: 820, y: 80 },
    data: {
      label: 'Is Critical Urgency or Enterprise Tier?',
      prompt:
        'Is this issue marked as Urgent priority OR reported by an Enterprise tier customer OR blocking production launch? Return YES for high-urgency outage, NO for standard ticket.',
      systemInstruction:
        'Inspect customer plan, priority field, and impact phrases (e.g. blocking launch, production down).',
      temperature: 0.1,
      model: 'gemini-3.7-flash',
      status: 'idle',
    },
  },
  {
    id: 'decision-3',
    type: 'decisionNode',
    position: { x: 820, y: 340 },
    data: {
      label: 'Is Commercial Sales Opportunity?',
      prompt:
        'Is this inquiry interested in purchasing, upgrading licenses, enterprise demo, pricing quotes, or new contract expansion? Return YES if sales/commercial, NO for general FAQ or feedback.',
      systemInstruction: 'Detect commercial purchase intent and expansion opportunities.',
      temperature: 0.1,
      model: 'gemini-3.7-flash',
      status: 'idle',
    },
  },
  {
    id: 'action-tier1',
    type: 'actionNode',
    position: { x: 1240, y: 30 },
    data: {
      label: '🚨 Page On-Call SRE & Create Incident',
      actionType: 'escalation',
      details: 'Created P1 incident INC-9812; Paged SRE primary and notified #enterprise-war-room.',
      status: 'idle',
    },
  },
  {
    id: 'action-standard-support',
    type: 'actionNode',
    position: { x: 1240, y: 160 },
    data: {
      label: '🎫 Dispatch Standard Support Ticket',
      actionType: 'ticket',
      details: 'Created Zendesk Ticket with standard 4-hour SLA and routed to DevRel Queue.',
      status: 'idle',
    },
  },
  {
    id: 'action-sales',
    type: 'actionNode',
    position: { x: 1240, y: 290 },
    data: {
      label: '💼 Create Salesforce Lead & Notify AE',
      actionType: 'sales_lead',
      details: 'Added to High-Value Enterprise Pipeline and scheduled calendar invitation.',
      status: 'idle',
    },
  },
  {
    id: 'action-general',
    type: 'actionNode',
    position: { x: 1240, y: 420 },
    data: {
      label: '📨 Send Automated FAQ & General Inbound Log',
      actionType: 'log',
      details: 'Dispatched automated help center knowledge base response.',
      status: 'idle',
    },
  },
];

const INITIAL_EDGES: Edge[] = [
  {
    id: 'e-start-d1',
    source: 'start-1',
    target: 'decision-1',
    type: 'default',
    animated: false,
  },
  {
    id: 'e-d1-yes-d2',
    source: 'decision-1',
    sourceHandle: 'yes',
    target: 'decision-2',
    type: 'yesEdge',
    data: { condition: 'YES', label: 'YES (Technical)' },
    animated: false,
  },
  {
    id: 'e-d1-no-d3',
    source: 'decision-1',
    sourceHandle: 'no',
    target: 'decision-3',
    type: 'noEdge',
    data: { condition: 'NO', label: 'NO (Non-Technical)' },
    animated: false,
  },
  {
    id: 'e-d2-yes-p1',
    source: 'decision-2',
    sourceHandle: 'yes',
    target: 'action-tier1',
    type: 'yesEdge',
    data: { condition: 'YES', label: 'YES (Critical/VIP)' },
    animated: false,
  },
  {
    id: 'e-d2-no-std',
    source: 'decision-2',
    sourceHandle: 'no',
    target: 'action-standard-support',
    type: 'noEdge',
    data: { condition: 'NO', label: 'NO (Standard)' },
    animated: false,
  },
  {
    id: 'e-d3-yes-sales',
    source: 'decision-3',
    sourceHandle: 'yes',
    target: 'action-sales',
    type: 'yesEdge',
    data: { condition: 'YES', label: 'YES (Sales)' },
    animated: false,
  },
  {
    id: 'e-d3-no-general',
    source: 'decision-3',
    sourceHandle: 'no',
    target: 'action-general',
    type: 'noEdge',
    data: { condition: 'NO', label: 'NO (General)' },
    animated: false,
  },
];

const DEFAULT_PAYLOAD = JSON.stringify(
  {
    customer: 'Acme Corp (Sarah Connor)',
    email: 'sarah@acme.example.com',
    message:
      'Hi team, we are hitting an HTTP 500 internal server error on your /api/v2/webhooks endpoint whenever we send batches larger than 50 items. This is blocking our launch scheduled for tomorrow.',
    plan: 'Enterprise',
    priority: 'Urgent',
    timestamp: new Date().toISOString(),
  },
  null,
  2
);

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(INITIAL_NODES);
  const [edges, setEdges, onEdgesChange] = useEdgesState(INITIAL_EDGES);

  const [workflowTitle, setWorkflowTitle] = useState('Customer Message Triage & Routing');
  const [workflowDescription, setWorkflowDescription] = useState(
    'Evaluates incoming customer requests to determine if it is technical support, billing, or enterprise sales.'
  );
  const [currentPayload, setCurrentPayload] = useState(DEFAULT_PAYLOAD);

  // Modals and Drawers
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [isRunnerOpen, setIsRunnerOpen] = useState(false);
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isWorkflowsOpen, setIsWorkflowsOpen] = useState(false);

  // Execution State
  const [isRunning, setIsRunning] = useState(false);
  const [executionId, setExecutionId] = useState<string | undefined>();
  const [logs, setLogs] = useState<StepLog[]>([]);
  const [executionStatus, setExecutionStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');
  const [totalDurationMs, setTotalDurationMs] = useState<number | undefined>();
  const [executionSummary, setExecutionSummary] = useState<string | undefined>();

  // Reset Node and Edge Visual Execution State
  const resetExecutionVisuals = useCallback(() => {
    setNodes((nds) =>
      nds.map((n) => ({
        ...n,
        data: {
          ...n.data,
          status: 'idle',
          lastResult: undefined,
          lastExplanation: undefined,
          isEvaluating: false,
        },
      }))
    );
    setEdges((eds) =>
      eds.map((e) => ({
        ...e,
        animated: false,
        data: {
          ...e.data,
          isActive: false,
          isTraversed: false,
        },
      }))
    );
    setExecutionStatus('idle');
    setLogs([]);
    setExecutionId(undefined);
  }, [setNodes, setEdges]);

  // Connect new Edge
  const onConnect = useCallback(
    (params: Connection) => {
      const sourceHandle = params.sourceHandle?.toLowerCase();
      let edgeType = 'default';
      let edgeData: any = {};

      if (sourceHandle === 'yes') {
        edgeType = 'yesEdge';
        edgeData = { condition: 'YES', label: 'YES' };
      } else if (sourceHandle === 'no') {
        edgeType = 'noEdge';
        edgeData = { condition: 'NO', label: 'NO' };
      }

      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: edgeType,
            data: edgeData,
            animated: false,
          },
          eds
        )
      );
    },
    [setEdges]
  );

  // Handle Node Click to open Editor
  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      setSelectedNode(node);
    },
    []
  );

  // Update specific node data from editor
  const handleUpdateNodeData = useCallback(
    (nodeId: string, updatedData: any) => {
      setNodes((nds) =>
        nds.map((n) => {
          if (n.id === nodeId) {
            const updatedNode = { ...n, data: { ...n.data, ...updatedData } };
            if (selectedNode && selectedNode.id === nodeId) {
              setSelectedNode(updatedNode);
            }
            return updatedNode;
          }
          return n;
        })
      );
    },
    [setNodes, selectedNode]
  );

  // Add Nodes dynamically
  const handleAddDecisionNode = useCallback(() => {
    const id = `decision-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'decisionNode',
      position: {
        x: 450 + Math.random() * 80,
        y: 200 + Math.random() * 80,
      },
      data: {
        label: 'New AI Decision Step',
        prompt: 'Does this payload satisfy condition? Return YES or NO.',
        systemInstruction: 'Evaluate strictly and return YES or NO.',
        temperature: 0.1,
        model: 'gemini-2.5-flash',
        status: 'idle',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
  }, [setNodes]);

  const handleAddActionNode = useCallback(() => {
    const id = `action-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'actionNode',
      position: {
        x: 900 + Math.random() * 80,
        y: 200 + Math.random() * 80,
      },
      data: {
        label: 'New Action Outcome',
        actionType: 'ticket',
        details: 'Dispatches automated response or creates issue.',
        status: 'idle',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
  }, [setNodes]);

  const handleAddTriggerNode = useCallback(() => {
    const id = `trigger-${Date.now()}`;
    const newNode: Node = {
      id,
      type: 'triggerNode',
      position: {
        x: 60,
        y: 200 + Math.random() * 60,
      },
      data: {
        label: 'New Workflow Ingest',
        description: 'Receives context payload for Inngest orchestration',
        inputPayload: '',
        status: 'idle',
      },
    };
    setNodes((nds) => [...nds, newNode]);
    setSelectedNode(newNode);
  }, [setNodes]);

  // Load Workflow definition
  const handleLoadWorkflow = useCallback(
    (wf: WorkflowDefinition) => {
      setWorkflowTitle(wf.name);
      setWorkflowDescription(wf.description);
      if (wf.inputTemplate) {
        setCurrentPayload(wf.inputTemplate);
      }
      setNodes(wf.nodes || []);
      setEdges(wf.edges || []);
      resetExecutionVisuals();
    },
    [setNodes, setEdges, resetExecutionVisuals]
  );

  // Execute Workflow through Inngest orchestrator with visual step progression
  const handleRunWorkflow = useCallback(
    async (payloadText: string) => {
      setIsRunning(true);
      setExecutionStatus('running');
      setIsLogsOpen(true);

      // Reset prior states
      resetExecutionVisuals();

      try {
        const result = await executeWorkflow({
          workflowId: 'active-flow',
          title: workflowTitle,
          input: payloadText,
          nodes,
          edges,
        });

        setExecutionId(result.executionId);
        setLogs(result.steps);
        setTotalDurationMs(result.totalDurationMs);
        setExecutionSummary(result.summary);

        // Step-by-step visual animation through the traversed path
        const traversedNodeIds = result.traversedPath || [];
        const activeEdgeIds = result.activeEdges || [];

        // Animate each step sequentially for clear visual feedback
        for (let i = 0; i < traversedNodeIds.length; i++) {
          const nodeId = traversedNodeIds[i];
          const stepLog = result.steps.find((s) => s.nodeId === nodeId);

          // Mark current node as running
          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      status: 'running',
                      isEvaluating: true,
                    },
                  }
                : n
            )
          );

          await new Promise((r) => setTimeout(r, 450));

          // Mark node completed with result
          setNodes((nds) =>
            nds.map((n) =>
              n.id === nodeId
                ? {
                    ...n,
                    data: {
                      ...n.data,
                      status: 'completed',
                      isEvaluating: false,
                      lastResult: stepLog?.decision,
                      lastExplanation: stepLog?.reasoning,
                      lastExecutionTimeMs: stepLog?.durationMs,
                    },
                  }
                : n
            )
          );

          // Animate outgoing edge if there is one
          if (i < activeEdgeIds.length) {
            const edgeId = activeEdgeIds[i];
            setEdges((eds) =>
              eds.map((e) =>
                e.id === edgeId
                  ? {
                      ...e,
                      animated: true,
                      data: { ...e.data, isActive: true, isTraversed: true },
                    }
                  : e
              )
            );
          }

          await new Promise((r) => setTimeout(r, 200));
        }

        setExecutionStatus('completed');

        // Confetti celebration on successful execution
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#10b981', '#6366f1', '#a855f7'],
        });
      } catch (err: any) {
        console.error('Execution failed:', err);
        setExecutionStatus('failed');
        alert(`Workflow execution failed: ${err.message}`);
      } finally {
        setIsRunning(false);
      }
    },
    [nodes, edges, workflowTitle, resetExecutionVisuals, setNodes, setEdges]
  );

  // Retry single step
  const handleRetryStep = useCallback(
    async (step: StepLog) => {
      try {
        const node = nodes.find((n) => n.id === step.nodeId);
        if (!node) return;

        let parsedInput: any = {};
        try {
          parsedInput = JSON.parse(currentPayload);
        } catch {
          parsedInput = { rawText: currentPayload };
        }

        const nodeData = node.data as unknown as DecisionNodeData;
        const res = await evaluateSingleNode({
          prompt: nodeData?.prompt || 'Is condition met?',
          contextData: parsedInput,
          systemInstruction: nodeData?.systemInstruction,
          model: nodeData?.model,
          temperature: nodeData?.temperature,
        });

        // Update node in canvas
        setNodes((nds) =>
          nds.map((n) =>
            n.id === step.nodeId
              ? {
                  ...n,
                  data: {
                    ...n.data,
                    lastResult: res.decision,
                    lastExplanation: res.reasoning,
                    lastExecutionTimeMs: res.durationMs,
                  },
                }
              : n
          )
        );

        // Update log entry
        setLogs((prev) =>
          prev.map((l) =>
            l.id === step.id
              ? {
                  ...l,
                  decision: res.decision,
                  reasoning: res.reasoning,
                  durationMs: res.durationMs,
                  output: { decision: res.decision, reasoning: res.reasoning },
                }
              : l
          )
        );
      } catch (e: any) {
        alert(`Step retry failed: ${e.message}`);
      }
    },
    [nodes, currentPayload, setNodes]
  );

  // Inspect run from history
  const handleSelectHistoryRun = useCallback(
    (record: WorkflowExecutionRecord) => {
      setExecutionId(record.id);
      setLogs(record.steps || []);
      setExecutionStatus(record.status as any);
      setTotalDurationMs(record.totalDurationMs);
      setExecutionSummary(record.summary);
      setIsLogsOpen(true);
      setIsHistoryOpen(false);

      // Highlight historical path on canvas
      const traversed = record.traversedPath || [];
      const activeEdges = record.activeEdges || [];

      setNodes((nds) =>
        nds.map((n) => {
          const wasTraversed = traversed.includes(n.id);
          const step = record.steps?.find((s) => s.nodeId === n.id);
          return {
            ...n,
            data: {
              ...n.data,
              status: wasTraversed ? 'completed' : 'idle',
              lastResult: step?.decision,
              lastExplanation: step?.reasoning,
            },
          };
        })
      );

      setEdges((eds) =>
        eds.map((e) => ({
          ...e,
          animated: activeEdges.includes(e.id),
          data: {
            ...e.data,
            isActive: activeEdges.includes(e.id),
            isTraversed: activeEdges.includes(e.id),
          },
        }))
      );
    },
    [setNodes, setEdges]
  );

  return (
    <ReactFlowProvider>
      <div className="h-screen w-screen flex flex-col bg-slate-950 overflow-hidden text-slate-100 font-sans">
        {/* Header Bar */}
        <Header
          workflowTitle={workflowTitle}
          onOpenRunner={() => setIsRunnerOpen(true)}
          onOpenLogs={() => setIsLogsOpen(!isLogsOpen)}
          onOpenHistory={() => setIsHistoryOpen(!isHistoryOpen)}
          onOpenWorkflows={() => setIsWorkflowsOpen(true)}
          onAddDecisionNode={handleAddDecisionNode}
          onAddActionNode={handleAddActionNode}
          onAddTriggerNode={handleAddTriggerNode}
          onResetCanvas={resetExecutionVisuals}
          isRunning={isRunning}
          logsCount={logs.length}
          lastStatus={executionStatus}
        />

        {/* Main Flow Canvas */}
        <main className="flex-1 relative overflow-hidden">
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            onAddDecisionNode={handleAddDecisionNode}
            onAddActionNode={handleAddActionNode}
            onAddTriggerNode={handleAddTriggerNode}
            isRunning={isRunning}
          />
        </main>

        {/* Node Properties Editor Drawer */}
        {selectedNode && (
          <NodeEditorDrawer
            selectedNode={selectedNode}
            currentInputPayload={currentPayload}
            onUpdateNodeData={handleUpdateNodeData}
            onClose={() => setSelectedNode(null)}
          />
        )}

        {/* Inngest Step Logs Bottom Panel */}
        {isLogsOpen && (
          <ExecutionLogsPanel
            logs={logs}
            executionId={executionId}
            totalDurationMs={totalDurationMs}
            status={executionStatus}
            summary={executionSummary}
            onClose={() => setIsLogsOpen(false)}
            onRetryStep={handleRetryStep}
            onFocusNode={(nodeId) => {
              const targetNode = nodes.find((n) => n.id === nodeId);
              if (targetNode) {
                setSelectedNode(targetNode);
              }
            }}
          />
        )}

        {/* Execution History Drawer */}
        <ExecutionHistoryDrawer
          isOpen={isHistoryOpen}
          onClose={() => setIsHistoryOpen(false)}
          onSelectRun={handleSelectHistoryRun}
          currentExecutionId={executionId}
        />

        {/* Input Runner Modal */}
        <InputRunnerModal
          isOpen={isRunnerOpen}
          onClose={() => setIsRunnerOpen(false)}
          onRunWorkflow={handleRunWorkflow}
          currentPayload={currentPayload}
          onUpdatePayload={setCurrentPayload}
          isRunning={isRunning}
        />

        {/* Workflow Templates & Save/Export Modal */}
        <WorkflowManagerModal
          isOpen={isWorkflowsOpen}
          onClose={() => setIsWorkflowsOpen(false)}
          currentWorkflow={{
            id: 'current-flow',
            name: workflowTitle,
            description: workflowDescription,
            inputTemplate: currentPayload,
            nodes,
            edges,
          }}
          onLoadWorkflow={handleLoadWorkflow}
        />
      </div>
    </ReactFlowProvider>
  );
}
