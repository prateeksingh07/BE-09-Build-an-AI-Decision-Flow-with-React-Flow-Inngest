export type DecisionResult = 'YES' | 'NO';

export type NodeExecutionStatus = 'idle' | 'running' | 'completed' | 'failed' | 'skipped';

export type WorkflowNodeType = 'triggerNode' | 'decisionNode' | 'actionNode';

export interface DecisionNodeData {
  label: string;
  prompt: string;
  description?: string;
  systemInstruction?: string;
  temperature?: number;
  model?: string;
  status?: NodeExecutionStatus;
  lastResult?: DecisionResult;
  lastExplanation?: string;
  lastExecutionTimeMs?: number;
  lastTokensUsed?: number;
  error?: string;
  isEvaluating?: boolean;
}

export interface TriggerNodeData {
  label: string;
  description?: string;
  inputPayload: string; // JSON string or text payload to pass to workflow
  status?: NodeExecutionStatus;
}

export interface ActionNodeData {
  label: string;
  actionType: 'notification' | 'ticket' | 'sales_lead' | 'webhook' | 'log' | 'escalation';
  details?: string;
  status?: NodeExecutionStatus;
  resultSummary?: string;
  executedAt?: string;
}

export interface WorkflowEdgeData {
  condition?: DecisionResult | 'DEFAULT';
  label?: string;
  isActive?: boolean;
  isTraversed?: boolean;
}

export interface StepLog {
  id: string;
  stepName: string;
  nodeId: string;
  nodeLabel: string;
  nodeType: WorkflowNodeType;
  status: 'started' | 'success' | 'failed' | 'skipped';
  decision?: DecisionResult;
  reasoning?: string;
  input: any;
  output: any;
  durationMs: number;
  timestamp: string;
  error?: string;
}

export interface WorkflowExecutionRecord {
  id: string;
  workflowId: string;
  workflowTitle: string;
  startedAt: string;
  completedAt?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  inputData: Record<string, any> | string;
  steps: StepLog[];
  traversedPath: string[]; // List of node IDs
  activeEdges: string[]; // Edge IDs
  totalDurationMs?: number;
  summary?: string;
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  description: string;
  category?: string;
  inputTemplate: string;
  nodes: any[];
  edges: any[];
  createdAt: string;
  updatedAt: string;
}

export interface InngestStepEvent {
  name: string;
  data: {
    workflowId: string;
    executionId: string;
    input: string;
    nodes: any[];
    edges: any[];
    startNodeId?: string;
  };
}
