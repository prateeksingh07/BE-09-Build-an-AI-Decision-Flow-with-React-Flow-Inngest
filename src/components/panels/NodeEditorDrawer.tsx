import React, { useState } from 'react';
import {
  X,
  BrainCircuit,
  Play,
  Zap,
  Sparkles,
  Check,
  CheckCircle2,
  AlertCircle,
  Clock,
  RotateCcw,
  Sliders,
} from 'lucide-react';
import { DecisionNodeData, TriggerNodeData, ActionNodeData } from '../../types';
import { evaluateSingleNode } from '../../lib/api';

interface NodeEditorDrawerProps {
  selectedNode: any;
  currentInputPayload: string;
  onUpdateNodeData: (nodeId: string, data: any) => void;
  onClose: () => void;
}

export function NodeEditorDrawer({
  selectedNode,
  currentInputPayload,
  onUpdateNodeData,
  onClose,
}: NodeEditorDrawerProps) {
  if (!selectedNode) return null;

  const nodeType = selectedNode.type;
  const data = selectedNode.data || {};

  const [label, setLabel] = useState(data.label || '');
  const [prompt, setPrompt] = useState(data.prompt || '');
  const [systemInstruction, setSystemInstruction] = useState(data.systemInstruction || '');
  const [temperature, setTemperature] = useState(data.temperature ?? 0.1);
  const [model, setModel] = useState(data.model || 'gemini-3.7-flash');
  const [actionType, setActionType] = useState(data.actionType || 'ticket');
  const [details, setDetails] = useState(data.details || '');
  const [description, setDescription] = useState(data.description || '');

  // Quick test state
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    decision?: 'YES' | 'NO';
    reasoning?: string;
    tokensUsed?: number;
    durationMs?: number;
    error?: string;
  } | null>(null);

  const handleSave = () => {
    let updatedData: any = { ...data, label };
    if (nodeType === 'decisionNode') {
      updatedData = {
        ...updatedData,
        prompt,
        systemInstruction,
        temperature,
        model,
      };
    } else if (nodeType === 'actionNode') {
      updatedData = {
        ...updatedData,
        actionType,
        details,
      };
    } else if (nodeType === 'triggerNode') {
      updatedData = {
        ...updatedData,
        description,
      };
    }

    onUpdateNodeData(selectedNode.id, updatedData);
  };

  const handleTestDecision = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      let parsedContext: any = {};
      try {
        parsedContext = JSON.parse(currentInputPayload);
      } catch {
        parsedContext = { message: currentInputPayload };
      }

      const res = await evaluateSingleNode({
        prompt,
        contextData: parsedContext,
        systemInstruction,
        model,
        temperature,
      });

      setTestResult(res);

      // Also update node's last result preview
      onUpdateNodeData(selectedNode.id, {
        ...data,
        prompt,
        systemInstruction,
        lastResult: res.decision,
        lastExplanation: res.reasoning,
        lastExecutionTimeMs: res.durationMs,
        lastTokensUsed: res.tokensUsed,
      });
    } catch (err: any) {
      setTestResult({ error: err.message || 'Evaluation failed' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      id="node-editor-drawer"
      className="fixed inset-y-0 right-0 w-96 bg-slate-900 border-l border-slate-800 shadow-2xl z-40 flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/70">
        <div className="flex items-center gap-2.5">
          <div
            className={`p-1.5 rounded-lg border ${
              nodeType === 'decisionNode'
                ? 'bg-violet-500/20 border-violet-500/30 text-violet-400'
                : nodeType === 'triggerNode'
                ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400'
                : 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
            }`}
          >
            {nodeType === 'decisionNode' ? (
              <BrainCircuit className="w-4 h-4" />
            ) : nodeType === 'triggerNode' ? (
              <Play className="w-4 h-4" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">
              {nodeType === 'decisionNode'
                ? 'AI Decision Step'
                : nodeType === 'triggerNode'
                ? 'Trigger Ingest'
                : 'Action Node'}
            </h3>
            <p className="text-[11px] font-mono text-slate-400">
              Node ID: {selectedNode.id}
            </p>
          </div>
        </div>
        <button
          id="btn-close-drawer"
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Form Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Node Label */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-300">
            Node Title / Step Name
          </label>
          <input
            id="input-node-label"
            type="text"
            value={label}
            onChange={(e) => {
              setLabel(e.target.value);
              onUpdateNodeData(selectedNode.id, { ...data, label: e.target.value });
            }}
            placeholder="e.g. Is Technical Issue?"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
        </div>

        {/* DECISION NODE SPECIFIC FIELDS */}
        {nodeType === 'decisionNode' && (
          <>
            {/* Prompt */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-slate-300">
                  Decision Prompt (Must evaluate to YES or NO)
                </label>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/40">
                  Binary Output
                </span>
              </div>
              <textarea
                id="input-decision-prompt"
                rows={4}
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  onUpdateNodeData(selectedNode.id, { ...data, prompt: e.target.value });
                }}
                placeholder="e.g. Does the customer message describe an active technical bug or outage? Return YES or NO."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 leading-relaxed font-sans"
              />
              <p className="text-[11px] text-slate-500">
                The Gemini model evaluates incoming payload and strictly returns either <span className="text-emerald-400 font-mono font-bold">YES</span> or <span className="text-rose-400 font-mono font-bold">NO</span>.
              </p>
            </div>

            {/* System Instruction */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                System Instructions (Optional)
              </label>
              <textarea
                id="input-system-instruction"
                rows={2}
                value={systemInstruction}
                onChange={(e) => {
                  setSystemInstruction(e.target.value);
                  onUpdateNodeData(selectedNode.id, {
                    ...data,
                    systemInstruction: e.target.value,
                  });
                }}
                placeholder="e.g. You are a senior triage analyst. Evaluate strictly based on technical keywords."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Model & Temperature */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  AI Model
                </label>
                <select
                  id="select-ai-model"
                  value={model}
                  onChange={(e) => {
                    setModel(e.target.value);
                    onUpdateNodeData(selectedNode.id, { ...data, model: e.target.value });
                  }}
                  className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash (Fastest)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro (Deep Reasoning)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold text-slate-300">
                    Temp: {temperature}
                  </label>
                </div>
                <input
                  id="input-temperature-slider"
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setTemperature(val);
                    onUpdateNodeData(selectedNode.id, { ...data, temperature: val });
                  }}
                  className="w-full accent-violet-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Interactive Test Sandbox */}
            <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Live Node Test
                </span>
                <button
                  id="btn-test-node"
                  onClick={handleTestDecision}
                  disabled={testing || !prompt}
                  className="px-2.5 py-1 rounded-md bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center gap-1 shadow-sm transition-colors"
                >
                  {testing ? (
                    <>
                      <Clock className="w-3 h-3 animate-spin" /> Evaluating...
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" /> Test Prompt
                    </>
                  )}
                </button>
              </div>

              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs space-y-1.5 transition-all ${
                    testResult.error
                      ? 'bg-rose-950/40 border-rose-800 text-rose-300'
                      : testResult.decision === 'YES'
                      ? 'bg-emerald-950/40 border-emerald-700/80 text-emerald-200'
                      : 'bg-rose-950/40 border-rose-700/80 text-rose-200'
                  }`}
                >
                  {testResult.error ? (
                    <div className="flex items-center gap-1.5 text-rose-400 font-semibold">
                      <AlertCircle className="w-4 h-4" /> {testResult.error}
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="font-bold flex items-center gap-1 text-sm font-mono">
                          {testResult.decision === 'YES' ? (
                            <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
                          ) : (
                            <X className="w-4 h-4 text-rose-400 stroke-[3]" />
                          )}
                          Result: {testResult.decision}
                        </span>
                        <span className="font-mono text-[10px] text-slate-400">
                          {testResult.durationMs}ms · {testResult.tokensUsed || 0} tokens
                        </span>
                      </div>
                      <p className="text-slate-300 leading-snug font-sans">
                        {testResult.reasoning}
                      </p>
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {/* TRIGGER NODE SPECIFIC FIELDS */}
        {nodeType === 'triggerNode' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Trigger Description
              </label>
              <textarea
                id="input-trigger-description"
                rows={3}
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  onUpdateNodeData(selectedNode.id, { ...data, description: e.target.value });
                }}
                placeholder="Describe the source data this trigger receives."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        )}

        {/* ACTION NODE SPECIFIC FIELDS */}
        {nodeType === 'actionNode' && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Action Type
              </label>
              <select
                id="select-action-type"
                value={actionType}
                onChange={(e) => {
                  setActionType(e.target.value);
                  onUpdateNodeData(selectedNode.id, {
                    ...data,
                    actionType: e.target.value,
                  });
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="ticket">🎫 Support Ticket (Zendesk / Linear)</option>
                <option value="escalation">🚨 Emergency Escalation & PagerDuty</option>
                <option value="sales_lead">💼 Salesforce Lead / CRM Pipeline</option>
                <option value="webhook">⚡ HTTP Webhook Dispatch</option>
                <option value="log">📨 Automated Response & Activity Log</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300">
                Action Outcome Description
              </label>
              <textarea
                id="input-action-details"
                rows={3}
                value={details}
                onChange={(e) => {
                  setDetails(e.target.value);
                  onUpdateNodeData(selectedNode.id, { ...data, details: e.target.value });
                }}
                placeholder="e.g. Created incident ticket INC-4091 and paged SRE on-call."
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-end gap-2">
        <button
          id="btn-apply-drawer"
          onClick={() => {
            handleSave();
            onClose();
          }}
          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-950"
        >
          <Check className="w-4 h-4 stroke-[2.5]" /> Done Editing
        </button>
      </div>
    </div>
  );
}
