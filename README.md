# Visual AI Workflow System (Inngest & React Flow)

An end-to-end visual AI decision workflow engine. Each node in the decision tree represents an AI decision step powered by Gemini that evaluates context payloads to output strictly a binary **YES** or **NO** decision. The entire workflow orchestration is managed step-by-step through Inngest while the frontend visualizes the execution graph and active paths using React Flow.

---

## 🚀 Key Features

### 1. Visual Flow Canvas (React Flow)
- **Interactive Decision Nodes**: Dynamic AI decision nodes with editable prompts, system instructions, temperature controls, and model selectors.
- **Dedicated Port Types**:
  - **YES Handle**: Output on upper right with glowing green badge & edge.
  - **NO Handle**: Output on lower right with glowing rose badge & edge.
- **Trigger & Action Nodes**: Dedicated payload ingest nodes and action outcomes (e.g., PagerDuty Escalation, Support Ticket Dispatch, CRM Lead Creation, Automated FAQ).
- **MiniMap, Controls & Dynamic Node Toolbar**: Zoom, pan, search, and floating quick-add buttons.

### 2. Inngest Step Orchestration Engine
- **Deterministic Step Execution**: Each graph node maps directly to an `Inngest step.run("decision:nodeId")` step execution.
- **AI-Powered Branching**: Prompts are evaluated by server-side Gemini AI models with JSON schema enforcement, strictly returning `YES` or `NO` along with factual reasoning.
- **Inngest Event Dispatcher**: Workflow requests are dispatched to Inngest via `inngest.send({ name: 'workflow/execute.requested' })` and served at `/api/inngest`.

### 3. Execution & Developer Experience (Phase 4 Polish)
- **Visual Execution State**: Real-time sequential animation of traversed paths, active edge pulse animations, and decision badge highlights.
- **Execution Logs Waterfall**: Live Inngest step logs showing input/output payloads, model reasoning, token consumption, and execution latencies.
- **Step Retry & Replay**: Re-evaluate individual decision nodes directly from the log panel or node drawer.
- **Interactive Node Sandbox**: Click any decision node to test its prompt against the current payload in real time before running the full flow.
- **Templates & Pre-sets**: Built-in workflows for Customer Support Triage and Cybersecurity Phishing Evaluation.
- **JSON Import / Export & Storage**: Save flows, export workflow JSON schemas, and load past executions from history.

---

## 🛠️ Architecture & API Endpoints

- `GET /api/health`: Inngest client state and server status.
- `POST /api/inngest`: Inngest handler serving background workflow functions.
- `POST /api/workflow/execute`: Triggers full workflow step orchestration.
- `POST /api/ai/evaluate`: Direct single-node prompt evaluation.
- `POST /api/workflow/retry-step`: Re-evaluates a specific step.
- `GET /api/executions`: History of past execution records.
- `GET /api/workflows`: Pre-built workflow templates.

---

## 📦 Tech Stack

- **Frontend**: React 19, `@xyflow/react` (React Flow), Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend & Orchestration**: Node.js, Express, `inngest`, `@google/genai` (Gemini AI).
- **Build System**: Vite, TypeScript, `tsx`, `esbuild`.
