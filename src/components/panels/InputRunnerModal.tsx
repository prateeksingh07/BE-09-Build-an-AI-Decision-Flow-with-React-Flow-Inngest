import React, { useState } from 'react';
import {
  X,
  Play,
  Database,
  Sparkles,
  Zap,
  RotateCcw,
  Clock,
  CheckCircle2,
} from 'lucide-react';

interface InputRunnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunWorkflow: (inputPayload: string) => Promise<void>;
  currentPayload: string;
  onUpdatePayload: (payload: string) => void;
  isRunning: boolean;
}

const SAMPLE_PAYLOADS = [
  {
    title: '🚨 Critical Enterprise API 500 Outage (YES Path)',
    data: {
      customer: 'Acme Corp (Sarah Connor)',
      email: 'sarah@acme.example.com',
      message:
        'Hi team, we are hitting an HTTP 500 internal server error on /api/v2/webhooks whenever we send batches larger than 50 items. This is blocking our launch scheduled for tomorrow.',
      plan: 'Enterprise',
      priority: 'Urgent',
      timestamp: new Date().toISOString(),
    },
  },
  {
    title: '💼 Enterprise License Upgrade & Sales Quote (Sales Path)',
    data: {
      customer: 'Globex Health Solutions',
      email: 'procurement@globexhealth.example.com',
      message:
        'Hello! We are looking to upgrade our team from 20 seats to 250 seats with custom SOC2 compliance and SSO. Could you share enterprise annual pricing tiers?',
      plan: 'Pro Trial',
      priority: 'Medium',
      timestamp: new Date().toISOString(),
    },
  },
  {
    title: '🎫 Minor Documentation Typo & General Question (General Path)',
    data: {
      customer: 'Dev Community User',
      email: 'dev@opensource.org',
      message:
        'Hey there, quick question about your markdown formatting docs on page 3. Looks like a broken link to your styleguide. Thanks!',
      plan: 'Free',
      priority: 'Low',
      timestamp: new Date().toISOString(),
    },
  },
  {
    title: '🛡️ Phishing Security Hook with Suspicious Auth Domain',
    data: {
      subject: 'URGENT: Re-authenticate your Okta SSO session immediately',
      sender: 'security-alerts@okta-support-auth99.com',
      headers: { SPF: 'softfail', DKIM: 'fail', DMARC: 'fail' },
      body: 'Your corporate access has expired. Click here: https://okta-auth-verify.xyz/login to avoid suspension.',
      attachments: ['okta_patch_v2.exe'],
      reportedBy: 'employee_mark@company.com',
    },
  },
];

export function InputRunnerModal({
  isOpen,
  onClose,
  onRunWorkflow,
  currentPayload,
  onUpdatePayload,
  isRunning,
}: InputRunnerModalProps) {
  const [jsonText, setJsonText] = useState(currentPayload || JSON.stringify(SAMPLE_PAYLOADS[0].data, null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFormatJson = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      onUpdatePayload(formatted);
      setJsonError(null);
    } catch (e: any) {
      setJsonError(e.message || 'Invalid JSON syntax');
    }
  };

  const handleSelectSample = (sampleData: any) => {
    const formatted = JSON.stringify(sampleData, null, 2);
    setJsonText(formatted);
    onUpdatePayload(formatted);
    setJsonError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    onUpdatePayload(jsonText);
    await onRunWorkflow(jsonText);
    onClose();
  };

  return (
    <div
      id="input-runner-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
    >
      <div
        id="input-runner-modal"
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">
                Run Inngest AI Workflow
              </h2>
              <p className="text-xs text-slate-400">
                Provide payload data to ingest into the decision graph.
              </p>
            </div>
          </div>
          <button
            id="btn-close-runner-modal"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Preset Quick-Picks */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Quick Test Scenarios
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SAMPLE_PAYLOADS.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectSample(sample.data)}
                  className="p-2.5 text-left rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-indigo-500/50 transition-all text-xs text-slate-300 space-y-1 group"
                >
                  <div className="font-semibold text-slate-200 group-hover:text-indigo-300 flex items-center gap-1.5">
                    <span>{sample.title}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* JSON Payload Editor */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Input Payload (JSON / Context)
              </label>
              <button
                type="button"
                onClick={handleFormatJson}
                className="text-[11px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 px-2 py-0.5 rounded bg-slate-950 border border-slate-800"
              >
                <Sparkles className="w-3 h-3" /> Format JSON
              </button>
            </div>

            <textarea
              id="input-runner-payload-editor"
              rows={9}
              value={jsonText}
              onChange={(e) => {
                setJsonText(e.target.value);
                setJsonError(null);
              }}
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 leading-relaxed"
              placeholder="Paste JSON object here..."
            />

            {jsonError && (
              <p className="text-xs text-rose-400 font-mono">{jsonError}</p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Runs through Inngest Step Orchestrator</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-cancel-runner"
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              id="btn-execute-workflow-confirm"
              onClick={handleSubmit}
              disabled={isRunning}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-xs font-bold text-white transition-all shadow-lg shadow-indigo-950 flex items-center gap-2"
            >
              {isRunning ? (
                <>
                  <Clock className="w-4 h-4 animate-spin" /> Inngest Executing...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" /> Execute Flow
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
