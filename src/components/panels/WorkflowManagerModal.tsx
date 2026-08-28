import React, { useState, useEffect } from 'react';
import {
  X,
  FolderOpen,
  Save,
  Download,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  FileCode,
  Layers,
} from 'lucide-react';
import { WorkflowDefinition } from '../../types';
import { fetchWorkflows, saveWorkflow } from '../../lib/api';

interface WorkflowManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentWorkflow: {
    id: string;
    name: string;
    description: string;
    category?: string;
    inputTemplate: string;
    nodes: any[];
    edges: any[];
  };
  onLoadWorkflow: (workflow: WorkflowDefinition) => void;
}

export function WorkflowManagerModal({
  isOpen,
  onClose,
  currentWorkflow,
  onLoadWorkflow,
}: WorkflowManagerModalProps) {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [workflowName, setWorkflowName] = useState(currentWorkflow.name);
  const [workflowDesc, setWorkflowDesc] = useState(currentWorkflow.description);
  const [activeTab, setActiveTab] = useState<'presets' | 'save' | 'export_import'>('presets');
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadAll = async () => {
    try {
      const list = await fetchWorkflows();
      setWorkflows(list);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadAll();
      setWorkflowName(currentWorkflow.name);
      setWorkflowDesc(currentWorkflow.description);
    }
  }, [isOpen, currentWorkflow]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const saved = await saveWorkflow({
        ...currentWorkflow,
        name: workflowName,
        description: workflowDesc,
      });
      setSaveSuccess(true);
      await loadAll();
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err: any) {
      alert(err.message || 'Failed to save workflow');
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify(currentWorkflow, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${currentWorkflow.name.toLowerCase().replace(/\s+/g, '-')}-workflow.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(importJsonText);
      if (!parsed.nodes || !Array.isArray(parsed.nodes)) {
        throw new Error('Invalid workflow JSON: missing "nodes" array.');
      }
      onLoadWorkflow({
        id: parsed.id || `wf_${Date.now()}`,
        name: parsed.name || 'Imported Workflow',
        description: parsed.description || '',
        category: parsed.category || 'Imported',
        inputTemplate: typeof parsed.inputTemplate === 'string' ? parsed.inputTemplate : JSON.stringify(parsed.inputTemplate || {}, null, 2),
        nodes: parsed.nodes,
        edges: parsed.edges || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      onClose();
    } catch (e: any) {
      setImportError(e.message || 'Malformed JSON');
    }
  };

  return (
    <div
      id="workflow-manager-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="workflow-manager-modal"
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-violet-500/20 border border-violet-500/30 text-violet-400">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Workflows & Presets
              </h2>
              <p className="text-xs text-slate-400">
                Save, load, and export visual decision trees.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center px-6 border-b border-slate-800 bg-slate-950/40 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('presets')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'presets'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Pre-Built Templates ({workflows.length})
          </button>
          <button
            onClick={() => setActiveTab('save')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'save'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Save Current Flow
          </button>
          <button
            onClick={() => setActiveTab('export_import')}
            className={`py-3 px-4 border-b-2 transition-colors ${
              activeTab === 'export_import'
                ? 'border-violet-500 text-violet-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            JSON Import / Export
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">
                Select a ready-to-run decision workflow template to load onto the canvas:
              </p>
              <div className="space-y-2.5">
                {workflows.map((wf) => (
                  <div
                    key={wf.id}
                    className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-violet-500/60 transition-all flex items-center justify-between group"
                  >
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-100 group-hover:text-violet-300">
                          {wf.name}
                        </span>
                        {wf.category && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-violet-950 text-violet-300 border border-violet-800/60">
                            {wf.category}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {wf.description}
                      </p>
                      <div className="text-[11px] font-mono text-slate-500">
                        {wf.nodes?.length || 0} nodes · {wf.edges?.length || 0} edges
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        onLoadWorkflow(wf);
                        onClose();
                      }}
                      className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-violet-600 text-xs font-semibold text-white transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5" /> Load Workflow
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'save' && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Workflow Name
                </label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-violet-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={workflowDesc}
                  onChange={(e) => setWorkflowDesc(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                  placeholder="Describe the logic and use case for this workflow."
                />
              </div>

              <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-400 font-mono space-y-1">
                <div>Active Nodes: {currentWorkflow.nodes?.length || 0}</div>
                <div>Connected Edges: {currentWorkflow.edges?.length || 0}</div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-xs font-bold text-white transition-colors flex items-center justify-center gap-2 shadow-lg shadow-violet-950"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" /> Workflow Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Workflow
                  </>
                )}
              </button>
            </form>
          )}

          {activeTab === 'export_import' && (
            <div className="space-y-5">
              {/* Export */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-slate-200">
                      Export Current Graph (JSON)
                    </h4>
                    <p className="text-xs text-slate-400">
                      Download full node and edge topology to share or backup.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJSON}
                    className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4" /> Export File
                  </button>
                </div>
              </div>

              {/* Import */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-200">
                    Import Workflow from JSON
                  </h4>
                  <p className="text-xs text-slate-400">
                    Paste previously exported workflow JSON schema below:
                  </p>
                </div>

                <textarea
                  rows={5}
                  value={importJsonText}
                  onChange={(e) => {
                    setImportJsonText(e.target.value);
                    setImportError(null);
                  }}
                  placeholder="Paste JSON here..."
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-lg font-mono text-xs text-slate-300 focus:outline-none focus:border-violet-500"
                />

                {importError && (
                  <p className="text-xs text-rose-400 font-mono flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> {importError}
                  </p>
                )}

                <button
                  onClick={handleImportJSON}
                  disabled={!importJsonText}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-xs font-semibold text-white flex items-center gap-1.5 transition-colors"
                >
                  <Upload className="w-4 h-4" /> Load Imported Workflow
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
