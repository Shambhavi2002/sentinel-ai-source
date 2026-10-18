/**
 * Sentinel AI - Google Cloud Run Deployment & Architecture Guide
 * Tailored for finance executives, fintech product managers, and hackathon evaluators.
 */

import React, { useState } from 'react';
import {
  Cloud,
  Terminal,
  CheckCircle2,
  Copy,
  ExternalLink,
  ShieldCheck,
  Server,
  Key,
  Activity,
  Cpu,
  Layers,
  HelpCircle,
  AlertTriangle
} from 'lucide-react';

export const CloudRunGuide: React.FC = () => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [testingHealth, setTestingHealth] = useState(false);
  const [healthResult, setHealthResult] = useState<any>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  const runHealthCheck = async () => {
    setTestingHealth(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setHealthResult(data);
    } catch (err: any) {
      setHealthResult({ error: err.message || 'Failed to reach health endpoint' });
    } finally {
      setTestingHealth(false);
    }
  };

  const steps = [
    {
      title: 'Step 1: Set Google Cloud Project & Enable APIs',
      detail: 'Open your terminal (or Google Cloud Shell in your browser) and set your target GCP project.',
      command: `gcloud config set project YOUR_PROJECT_ID
gcloud services enable run.googleapis.com artifactregistry.googleapis.com secretmanager.googleapis.com`
    },
    {
      title: 'Step 2: Store Gemini API Key in Google Cloud Secret Manager',
      detail: 'Securely store your Gemini API key in Secret Manager so it is never exposed in bundles or repository files.',
      command: `echo -n "AIzaSyYourSecretGeminiApiKey" | gcloud secrets create GEMINI_API_KEY --data-file=-
gcloud secrets add-iam-policy-binding GEMINI_API_KEY \\
  --member="serviceAccount:\$(gcloud projects describe \$(gcloud config get-value project) --format='value(projectNumber)')-compute@developer.gserviceaccount.com" \\
  --role="roles/secretmanager.secretAccessor"`
    },
    {
      title: 'Step 3: Deploy Directly to Google Cloud Run',
      detail: 'Deploy Sentinel AI container directly with automatic scaling and health monitoring.',
      command: `gcloud run deploy sentinel-ai \\
  --source . \\
  --region us-central1 \\
  --platform managed \\
  --allow-unauthenticated \\
  --port 3000 \\
  --set-secrets=GEMINI_API_KEY=GEMINI_API_KEY:latest`
    },
    {
      title: 'Step 4: Verify Deployment and Test Health Check',
      detail: 'Retrieve your live Cloud Run URL and query the health endpoint.',
      command: `URL=\$(gcloud run services describe sentinel-ai --platform managed --region us-central1 --format 'value(status.url)')
curl -s "\$URL/api/health" | jq .`
    }
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Intro Header */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-6 space-y-3">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <Cloud className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white">Google Cloud Run Deployment Guide</h2>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Serverless & Auto-Scale
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Sentinel AI is architected as a lightweight, single-container full-stack Express + React application specifically optimized for Google Cloud Run with zero cold-start complexity, server-side secret isolation, and automatic health monitoring.
            </p>
          </div>
        </div>

        {/* Live Health Check Tester */}
        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              Live Server Health-Check Endpoint (/api/health)
            </h4>
            <p className="text-[11px] text-slate-400">
              Test the active Express health check route right now
            </p>
          </div>

          <button
            onClick={runHealthCheck}
            disabled={testingHealth}
            className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-all self-start sm:self-auto cursor-pointer"
          >
            {testingHealth ? 'Pinging /api/health...' : 'Test Health Endpoint'}
          </button>
        </div>

        {healthResult && (
          <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-teal-300 border border-slate-800 max-h-40 overflow-y-auto">
            <pre>{JSON.stringify(healthResult, null, 2)}</pre>
          </div>
        )}
      </div>

      {/* Security Architecture Guarantees */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="p-2 w-fit rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
            <Key className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white">Zero Client Secret Leakage</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            All calls to Google Gemini AI execute strictly within the Express container backend. The API key is never bundled in frontend code, DOM attributes, or network responses.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="p-2 w-fit rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white">Untrusted Input Sanitization</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            CSV memos and customer transaction fields are isolated as inert strings, neutralizing prompt injection attacks from adversarial uploaded data.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
          <div className="p-2 w-fit rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Server className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-white">Heuristic Fallback Resilience</h3>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            If Gemini API quota is temporarily exhausted, Sentinel AI gracefully switches to deterministic heuristic copilot logic without disrupting banking triage.
          </p>
        </div>
      </div>

      {/* Step-by-Step Copy-and-Paste Commands */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-teal-400" />
          Step-by-Step Google Cloud Run Deployment
        </h3>

        {steps.map((step, idx) => (
          <div key={idx} className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-slate-100">{step.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{step.detail}</p>
              </div>
              <button
                onClick={() => copyToClipboard(step.command, idx)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shrink-0"
              >
                {copiedIndex === idx ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    <span className="text-teal-300 font-mono">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-400" />
                    <span>Copy Command</span>
                  </>
                )}
              </button>
            </div>

            <div className="p-3 rounded-lg bg-slate-950 font-mono text-xs text-slate-200 overflow-x-auto border border-slate-800/80">
              <pre>{step.command}</pre>
            </div>
          </div>
        ))}
      </div>

      {/* Troubleshooting & Support */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-3">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-teal-400" />
          Troubleshooting Common Cloud Run Issues
        </h3>

        <div className="space-y-2 text-xs text-slate-300">
          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <strong className="text-teal-300">1. Port Binding:</strong> Google Cloud Run automatically injects the <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">PORT</code> environment variable. Sentinel AI automatically listens on <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">process.env.PORT || 3000</code>.
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <strong className="text-teal-300">2. Missing API Key:</strong> If you see "Heuristic Assistant Ready", your <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">GEMINI_API_KEY</code> has not been bound in Cloud Run secrets. The app continues functioning autonomously with heuristic logic.
          </div>

          <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
            <strong className="text-teal-300">3. Ingress & Unauthenticated Access:</strong> Ensure <code className="text-slate-200 bg-slate-800 px-1 py-0.5 rounded">--allow-unauthenticated</code> is specified so hackathon judges and external evaluators can access the preview URL.
          </div>
        </div>
      </div>
    </div>
  );
};
