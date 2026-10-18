/**
 * Sentinel AI - Intelligent Financial Fraud Detection & Investigation Platform
 * Main Application Orchestrator
 */

import React, { useState, useEffect, useMemo } from 'react';
import { CheckCircle2, X } from 'lucide-react';
import { Header } from './components/Header';
import { OverviewDashboard } from './components/OverviewDashboard';
import { TransactionExplorer } from './components/TransactionExplorer';
import { InvestigationCentre } from './components/InvestigationCentre';
import { CrossPatternExplorer } from './components/CrossPatternExplorer';
import { AIChatAssistant } from './components/AIChatAssistant';
import { EvaluationStudio } from './components/EvaluationStudio';
import { CloudRunGuide } from './components/CloudRunGuide';
import { UploadModal } from './components/UploadModal';

import {
  Transaction,
  TransactionAnalysis,
  InvestigationStatus,
  AIDossier,
  ConfigurableThresholds
} from './types/fraud';
import {
  generateSyntheticDataset,
  transactionsToCSV
} from './utils/syntheticDataGenerator';
import {
  analyzeTransactions,
  DEFAULT_THRESHOLDS
} from './utils/fraudDetectionEngine';
import { detectCrossTransactionPatterns } from './utils/crossPatternDetector';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [datasetName, setDatasetName] = useState<string>('Synthetic Demo (~1,000 txns)');
  const [thresholds, setThresholds] = useState<ConfigurableThresholds>(DEFAULT_THRESHOLDS);
  const [rawTransactions, setRawTransactions] = useState<Transaction[]>(() => generateSyntheticDataset(1000));
  const [selectedAlert, setSelectedAlert] = useState<TransactionAnalysis | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [geminiActive, setGeminiActive] = useState(false);
  const [demoSuccessMessage, setDemoSuccessMessage] = useState<string | null>(null);

  // Check Gemini server-side readiness
  useEffect(() => {
    fetch('/api/gemini/status')
      .then(res => res.json())
      .then(data => {
        setGeminiActive(!!data.configured);
      })
      .catch(() => {
        setGeminiActive(false);
      });
  }, []);

  // Compute behavioral analyses across transactions
  const [analyses, setAnalyses] = useState<TransactionAnalysis[]>(() =>
    analyzeTransactions(rawTransactions, thresholds)
  );

  // Recalculate analyses whenever rawTransactions or thresholds change
  useEffect(() => {
    const updated = analyzeTransactions(rawTransactions, thresholds);
    setAnalyses(updated);
    if (selectedAlert) {
      const refreshed = updated.find(a => a.transaction.transactionId === selectedAlert.transaction.transactionId);
      if (refreshed) {
        // preserve existing notes and dossier
        refreshed.notes = selectedAlert.notes;
        refreshed.status = selectedAlert.status;
        refreshed.aiDossier = selectedAlert.aiDossier;
        setSelectedAlert(refreshed);
      }
    }
  }, [rawTransactions, thresholds]);

  // Compute cross-transaction syndicate & fraud rings
  const patterns = useMemo(() => {
    return detectCrossTransactionPatterns(rawTransactions);
  }, [rawTransactions]);

  // Handlers
  const handleLoadDemo = () => {
    const demo = generateSyntheticDataset(1000);
    const freshAnalyses = analyzeTransactions(demo, thresholds);
    setRawTransactions(demo);
    setAnalyses(freshAnalyses);
    setDatasetName('Synthetic Demo (~1,000 txns)');
    setSelectedAlert(null);
    setDemoSuccessMessage('Demonstration dataset loaded: 1,000 synthetic transactions analyzed across 40 accounts. All dashboard metrics, behavioral scores, and fraud rings refreshed.');
  };

  // Auto-dismiss success message after 6 seconds
  useEffect(() => {
    if (demoSuccessMessage) {
      const timer = setTimeout(() => {
        setDemoSuccessMessage(null);
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [demoSuccessMessage]);

  const handleDataLoaded = (newTransactions: Transaction[], filename: string) => {
    const freshAnalyses = analyzeTransactions(newTransactions, thresholds);
    setRawTransactions(newTransactions);
    setAnalyses(freshAnalyses);
    setDatasetName(filename);
    setSelectedAlert(null);
    setCurrentTab('explorer');
    setDemoSuccessMessage(`Dataset "${filename}" loaded successfully: ${newTransactions.length} transactions processed.`);
  };

  const handleUpdateStatus = (txId: string, newStatus: InvestigationStatus, noteText: string) => {
    setAnalyses(prev => {
      return prev.map(item => {
        if (item.transaction.transactionId === txId) {
          const newNote = {
            id: `note-${Date.now()}`,
            author: 'Investigator (Lead Compliance Officer)',
            timestamp: new Date().toISOString(),
            statusChange: newStatus,
            comment: noteText
          };
          const updated = {
            ...item,
            status: newStatus,
            notes: [newNote, ...item.notes]
          };
          if (selectedAlert?.transaction.transactionId === txId) {
            setSelectedAlert(updated);
          }
          return updated;
        }
        return item;
      });
    });
  };

  const handleUpdateDossier = (txId: string, dossier: AIDossier) => {
    setAnalyses(prev => {
      return prev.map(item => {
        if (item.transaction.transactionId === txId) {
          const updated = {
            ...item,
            aiDossier: dossier
          };
          if (selectedAlert?.transaction.transactionId === txId) {
            setSelectedAlert(updated);
          }
          return updated;
        }
        return item;
      });
    });
  };

  const handleExportCSV = () => {
    const csvData = transactionsToCSV(rawTransactions);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sentinel_ai_full_dataset_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadDemoCSV = () => {
    const demo = generateSyntheticDataset(1000);
    const csvData = transactionsToCSV(demo);
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sentinel_synthetic_1000_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const flaggedCount = analyses.filter(a => a.riskLevel !== 'LOW').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-teal-500/30 selection:text-teal-200">
      {/* Top Header & Navigation */}
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        datasetName={datasetName}
        totalTransactions={analyses.length}
        flaggedCount={flaggedCount}
        geminiActive={geminiActive}
        onLoadDemo={handleLoadDemo}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onExportCSV={handleExportCSV}
        onDownloadDemoCSV={handleDownloadDemoCSV}
      />

      {/* Global Success Feedback Banner */}
      {demoSuccessMessage && (
        <div className="bg-teal-950/80 border-b border-teal-500/40 text-teal-200 px-4 py-3 transition-all animate-fadeIn">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              <span className="font-medium text-slate-100">{demoSuccessMessage}</span>
            </div>
            <button
              onClick={() => setDemoSuccessMessage(null)}
              className="p-1 rounded hover:bg-teal-900/50 text-teal-300 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <OverviewDashboard
            analyses={analyses}
            onLoadDemo={handleLoadDemo}
            onSelectAlert={alert => {
              setSelectedAlert(alert);
              setCurrentTab('investigation');
            }}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'explorer' && (
          <TransactionExplorer
            analyses={analyses}
            onSelectAlert={alert => {
              setSelectedAlert(alert);
              setCurrentTab('investigation');
            }}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'investigation' && (
          <InvestigationCentre
            selectedAlert={selectedAlert}
            allAnalyses={analyses}
            onSelectAlert={setSelectedAlert}
            onUpdateStatus={handleUpdateStatus}
            onUpdateDossier={handleUpdateDossier}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'patterns' && (
          <CrossPatternExplorer
            patterns={patterns}
            allAnalyses={analyses}
            onSelectAlert={alert => {
              setSelectedAlert(alert);
              setCurrentTab('investigation');
            }}
            onNavigateTab={setCurrentTab}
          />
        )}

        {(currentTab === 'copilot' || currentTab === 'chat') && (
          <AIChatAssistant
            analyses={analyses}
            patterns={patterns}
            onSelectAlert={alert => {
              setSelectedAlert(alert);
              setCurrentTab('investigation');
            }}
            onNavigateTab={setCurrentTab}
          />
        )}

        {currentTab === 'evaluation' && (
          <EvaluationStudio
            analyses={analyses}
            thresholds={thresholds}
            onUpdateThresholds={setThresholds}
          />
        )}

        {currentTab === 'cloudrun' && (
          <CloudRunGuide />
        )}
      </main>

      {/* Upload CSV Modal */}
      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onDataLoaded={handleDataLoaded}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <strong>Sentinel AI</strong> — Financial Fraud Intelligence & Investigation Platform.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Serverless Cloud Run Target</span>
            <span>•</span>
            <span>Google Gemini 3.8 Flash</span>
            <span>•</span>
            <span>Synthetic Demonstration Data</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
