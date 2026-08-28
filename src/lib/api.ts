import { WorkflowDefinition, WorkflowExecutionRecord, StepLog } from '../types';

export async function fetchHealth() {
  const res = await fetch('/api/health');
  if (!res.ok) throw new Error('Health check failed');
  return res.json();
}

export async function fetchWorkflows(): Promise<WorkflowDefinition[]> {
  const res = await fetch('/api/workflows');
  if (!res.ok) throw new Error('Failed to load workflows');
  return res.json();
}

export async function saveWorkflow(workflow: Partial<WorkflowDefinition>): Promise<WorkflowDefinition> {
  const res = await fetch('/api/workflows', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(workflow),
  });
  if (!res.ok) throw new Error('Failed to save workflow');
  return res.json();
}

export async function executeWorkflow(params: {
  workflowId: string;
  title?: string;
  input: string | Record<string, any>;
  nodes: any[];
  edges: any[];
  startNodeId?: string;
}): Promise<{
  executionId: string;
  status: 'completed' | 'failed';
  traversedPath: string[];
  activeEdges: string[];
  steps: StepLog[];
  totalDurationMs: number;
  summary: string;
}> {
  const res = await fetch('/api/workflow/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Workflow execution failed' }));
    throw new Error(err.error || 'Workflow execution failed');
  }
  return res.json();
}

export async function evaluateSingleNode(params: {
  prompt: string;
  contextData: any;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
}): Promise<{
  decision: 'YES' | 'NO';
  reasoning: string;
  tokensUsed?: number;
  durationMs: number;
}> {
  const res = await fetch('/api/ai/evaluate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'AI Evaluation failed' }));
    throw new Error(err.error || 'AI Evaluation failed');
  }
  return res.json();
}

export async function retryStep(params: {
  nodeId: string;
  prompt: string;
  contextData: any;
  systemInstruction?: string;
  model?: string;
  temperature?: number;
}) {
  const res = await fetch('/api/workflow/retry-step', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Step retry failed' }));
    throw new Error(err.error || 'Step retry failed');
  }
  return res.json();
}

export async function fetchExecutions(): Promise<WorkflowExecutionRecord[]> {
  const res = await fetch('/api/executions');
  if (!res.ok) throw new Error('Failed to fetch executions');
  return res.json();
}

export async function clearExecutions(): Promise<void> {
  await fetch('/api/executions', { method: 'DELETE' });
}
