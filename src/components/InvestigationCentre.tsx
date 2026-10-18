/**
 * Sentinel AI - Forensic Investigation Centre (Alert Queue & Human Reviewer Workbench)
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Sparkles,
  User,
  DollarSign,
  Clock,
  MapPin,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Send,
  History,
  FileCheck,
  AlertTriangle,
  Lightbulb,
  HelpCircle,
  Lock,
  RefreshCw,
  Cpu,
  X,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  Check,
  Bot
} from 'lucide-react';
import {
  TransactionAnalysis,
  InvestigationStatus,
  AIDossier,
  RiskLevel
} from '../types/fraud';

interface InvestigationCentreProps {
  selectedAlert: TransactionAnalysis | null;
  allAnalyses: TransactionAnalysis[];
  onSelectAlert: (analysis: TransactionAnalysis | null) => void;
  onUpdateStatus: (txId: string, status: InvestigationStatus, noteText: string) => void;
  onUpdateDossier: (txId: string, dossier: AIDossier) => void;
  onNavigateTab?: (tab: string) => void;
}

export const InvestigationCentre: React.FC<InvestigationCentreProps> = ({
  selectedAlert,
  allAnalyses,
  onSelectAlert,
  onUpdateStatus,
  onUpdateDossier,
  onNavigateTab
}) => {
  const [generatingAI, setGeneratingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [reviewerNote, setReviewerNote] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<InvestigationStatus>(
    selectedAlert?.status || 'UNDER_INVESTIGATION'
  );
  const [confirmedReview, setConfirmedReview] = useState(false);

  // Filters for the Alert Queue list
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'CRITICAL' | 'HIGH' | 'MEDIUM'>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 10;

  // Filter flagged alerts (exclude low risk unless specifically searched)
  const flaggedAlerts = allAnalyses.filter(a => a.riskLevel !== 'LOW');

  const filteredQueue = flaggedAlerts.filter(item => {
    // Severity filter
    if (severityFilter !== 'ALL' && item.riskLevel !== severityFilter) {
      return false;
    }
    // Status filter
    if (statusFilter !== 'ALL' && item.status !== statusFilter) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const tx = item.transaction;
      const matchesId = tx.transactionId.toLowerCase().includes(q);
      const matchesCust = tx.customerId.toLowerCase().includes(q);
      const matchesBen = (tx.beneficiaryName || tx.beneficiaryId).toLowerCase().includes(q);
      const matchesReason = item.indicators.some(ind => ind.name.toLowerCase().includes(q));
      if (!matchesId && !matchesCust && !matchesBen && !matchesReason) {
        return false;
      }
    }
    return true;
  }).sort((a, b) => b.riskScore - a.riskScore);

  const totalPages = Math.ceil(filteredQueue.length / pageSize) || 1;
  const pagedAlerts = filteredQueue.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // The alert currently opened in the forensic detail panel/modal
  const activeAlert = selectedAlert;

  const handleOpenAlert = (alert: TransactionAnalysis) => {
    onSelectAlert(alert);
    setSelectedStatus(alert.status);
    setReviewerNote('');
    setConfirmedReview(false);
    setAiError(null);
  };

  const handleCloseModal = () => {
    onSelectAlert(null);
    setReviewerNote('');
    setConfirmedReview(false);
    setAiError(null);
  };

  // Navigate to previous or next alert within the filtered queue
  const currentIndex = activeAlert
    ? filteredQueue.findIndex(a => a.transaction.transactionId === activeAlert.transaction.transactionId)
    : -1;

  const handlePrevAlert = () => {
    if (currentIndex > 0) {
      handleOpenAlert(filteredQueue[currentIndex - 1]);
    }
  };

  const handleNextAlert = () => {
    if (currentIndex >= 0 && currentIndex < filteredQueue.length - 1) {
      handleOpenAlert(filteredQueue[currentIndex + 1]);
    }
  };

  const handleGenerateDossier = async () => {
    if (!activeAlert) return;
    setGeneratingAI(true);
    setAiError(null);

    const tx = activeAlert.transaction;
    const relatedCustomerTxs = allAnalyses
      .filter(a => a.transaction.customerId === tx.customerId && a.transaction.transactionId !== tx.transactionId)
      .slice(0, 5);

    try {
      const res = await fetch('/api/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transaction: tx,
          analysis: activeAlert,
          relatedTransactions: relatedCustomerTxs.map(r => r.transaction),
          customerHistoryStats: activeAlert.customerHistoryStats
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP error ${res.status}`);
      }

      const data = await res.json();
      if (data.dossier) {
        onUpdateDossier(tx.transactionId, data.dossier);
      }
    } catch (err: any) {
      console.error('Failed to generate AI dossier:', err);
      setAiError('Failed to contact Gemini API. Engine provided heuristic fallback forensic analysis.');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSaveDecision = () => {
    if (!activeAlert) return;
    if (!reviewerNote.trim()) {
      alert('Operational Compliance Rule: Reviewer rationale note is required to update alert status.');
      return;
    }

    onUpdateStatus(activeAlert.transaction.transactionId, selectedStatus, reviewerNote);
    setReviewerNote('');
    setConfirmedReview(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">Investigation Centre & Alert Triage Queue</h2>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  {flaggedAlerts.length} Flagged Alerts
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Click any alert below to inspect its supporting evidence, run Google Gemini forensic analysis, and commit human reviewer findings.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto font-mono text-xs">
            <span className="px-3 py-1.5 rounded-lg bg-red-500/15 text-red-300 border border-red-500/30">
              {allAnalyses.filter(a => a.riskLevel === 'CRITICAL').length} Critical
            </span>
            <span className="px-3 py-1.5 rounded-lg bg-orange-500/15 text-orange-300 border border-orange-500/30">
              {allAnalyses.filter(a => a.riskLevel === 'HIGH').length} High
            </span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar for Alert Queue */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search alert by Tx ID (e.g. TXN1003), Customer, Beneficiary, or Reason..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Severity Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(sev => (
              <button
                key={sev}
                onClick={() => {
                  setSeverityFilter(sev);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  severityFilter === sev
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-750'
                }`}
              >
                {sev === 'ALL' ? 'All Severities' : sev}
              </button>
            ))}
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="py-1.5 px-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 focus:outline-hidden focus:border-teal-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="UNDER_INVESTIGATION">Under Investigation</option>
            <option value="ESCALATED">Escalated</option>
            <option value="RESOLVED">Resolved</option>
            <option value="FALSE_POSITIVE">False Positive</option>
          </select>
        </div>
      </div>

      {/* Alert Cards Grid (Clickable alerts!) */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between text-xs text-slate-400 px-1">
          <span>Showing {filteredQueue.length} matching alerts (Click any card to open forensic dossier):</span>
        </div>

        {pagedAlerts.length === 0 ? (
          <div className="rounded-xl bg-slate-900 border border-slate-800 p-12 text-center text-slate-400">
            <ShieldAlert className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No alerts match the selected filter criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search query or selecting "All Severities"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2.5">
            {pagedAlerts.map(item => {
              const tx = item.transaction;
              const isCrit = item.riskLevel === 'CRITICAL';
              const isHigh = item.riskLevel === 'HIGH';
              const isSelected = activeAlert?.transaction.transactionId === tx.transactionId;

              return (
                <div
                  key={tx.transactionId}
                  onClick={() => handleOpenAlert(item)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 group ${
                    isSelected
                      ? 'bg-slate-850 border-teal-500 shadow-md ring-1 ring-teal-500/50'
                      : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                  }`}
                >
                  {/* Left info */}
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`p-2.5 rounded-xl border shrink-0 mt-0.5 ${
                        isCrit
                          ? 'bg-red-500/15 border-red-500/30 text-red-400'
                          : isHigh
                          ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      }`}
                    >
                      <ShieldAlert className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="font-mono text-sm font-bold text-white group-hover:text-teal-300 transition-colors">
                          {tx.transactionId}
                        </span>
                        <span className="text-xs text-slate-400 font-mono">
                          Cust: <strong className="text-slate-200">{tx.customerId}</strong>
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                            isCrit
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : isHigh
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${isCrit ? 'bg-red-400 animate-pulse' : 'bg-orange-400'}`} />
                          Score: {item.riskScore}/100 ({item.riskLevel})
                        </span>
                        <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {item.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div className="text-xs text-slate-300 font-sans flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-white font-mono">
                          ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-slate-500">•</span>
                        <span>{tx.transactionType}</span>
                        <span className="text-slate-500">•</span>
                        <span className="truncate max-w-[200px]" title={tx.beneficiaryName || tx.beneficiaryId}>
                          To: {tx.beneficiaryName || tx.beneficiaryId}
                        </span>
                        {tx.isNewBeneficiary && (
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            New Beneficiary
                          </span>
                        )}
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400 text-[11px]">
                          {new Date(tx.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-400 line-clamp-1">
                        <strong className="text-slate-300">Signal: </strong>
                        {item.indicators[0]?.name || 'Behavioral anomaly detected'} — {item.indicators[0]?.evidence || 'Historical divergence'}
                      </p>
                    </div>
                  </div>

                  {/* Right Action */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenAlert(item);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-colors cursor-pointer"
                    >
                      <FileSearch className="w-3.5 h-3.5" />
                      <span>Inspect Dossier</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Bar */}
        {filteredQueue.length > pageSize && (
          <div className="px-4 py-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div>
              Showing page <span className="font-semibold text-slate-200">{currentPage}</span> of{' '}
              <span className="font-semibold text-slate-200">{totalPages}</span> ({filteredQueue.length} total alerts)
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-mono text-slate-300">
                {currentPage} / {totalPages}
              </span>
              <button
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* FORENSIC DETAIL MODAL / SLIDE-OVER PANEL */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-5 overflow-y-auto">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[92vh]">
            {/* Modal Top Bar */}
            <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border ${
                    activeAlert.riskLevel === 'CRITICAL'
                      ? 'bg-red-500/15 border-red-500/30 text-red-400'
                      : activeAlert.riskLevel === 'HIGH'
                      ? 'bg-orange-500/15 border-orange-500/30 text-orange-400'
                      : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                  }`}
                >
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h3 className="text-lg font-bold text-white font-mono">{activeAlert.transaction.transactionId}</h3>
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
                        activeAlert.riskLevel === 'CRITICAL'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      }`}
                    >
                      Score: {activeAlert.riskScore}/100 ({activeAlert.riskLevel})
                    </span>
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      {activeAlert.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customer {activeAlert.transaction.customerId} • ${activeAlert.transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })} • {new Date(activeAlert.transaction.timestamp).toUTCString()}
                  </p>
                </div>
              </div>

              {/* Header Navigation & Close Controls */}
              <div className="flex items-center gap-2">
                <div className="flex items-center border border-slate-800 rounded-lg overflow-hidden mr-1">
                  <button
                    disabled={currentIndex <= 0}
                    onClick={handlePrevAlert}
                    title="Previous alert"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    disabled={currentIndex >= filteredQueue.length - 1}
                    onClick={handleNextAlert}
                    title="Next alert"
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={handleCloseModal}
                  title="Close dossier (Esc)"
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Transaction Attributes Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-sans">
                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Disbursement Amount</span>
                  <span className="text-base font-bold text-white font-mono mt-0.5 block">
                    ${activeAlert.transaction.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{activeAlert.transaction.transactionType}</span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Beneficiary Entity</span>
                  <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate" title={activeAlert.transaction.beneficiaryName || activeAlert.transaction.beneficiaryId}>
                    {activeAlert.transaction.beneficiaryName || activeAlert.transaction.beneficiaryId}
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-[10px]">
                    {activeAlert.transaction.isNewBeneficiary ? (
                      <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        New Beneficiary
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded bg-teal-500/20 text-teal-300">
                        Existing
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Channel & Location</span>
                  <span className="text-xs font-semibold text-slate-200 mt-0.5 block">
                    {activeAlert.transaction.channel}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1 block truncate">
                    {activeAlert.transaction.location}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                  <span className="text-slate-400 text-[11px] block">Hardware & Network</span>
                  <span className="text-xs font-semibold text-slate-200 mt-0.5 block truncate" title={activeAlert.transaction.deviceType}>
                    {activeAlert.transaction.deviceType || 'Standard Hardware'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                    Risk: {activeAlert.transaction.deviceRiskScore ?? 0}/100
                  </span>
                </div>
              </div>

              {/* Customer Baseline Historical Comparison */}
              {activeAlert.customerHistoryStats && (
                <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <User className="w-4 h-4 text-teal-400" />
                    Customer Behavioral Baseline Comparison ({activeAlert.transaction.customerId})
                  </h4>
                  <div className="grid grid-cols-3 gap-3 text-center font-mono text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">Historical Baseline Mean</span>
                      <span className="text-sm font-bold text-white mt-1 block">${activeAlert.customerHistoryStats.avgAmount.toFixed(0)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">Current Event Value</span>
                      <span className="text-sm font-bold text-teal-400 mt-1 block">${activeAlert.transaction.amount.toFixed(0)}</span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="text-[10px] text-slate-400 font-sans block">Deviation Multiple</span>
                      <span className="text-sm font-bold text-amber-400 mt-1 block">
                        {(activeAlert.transaction.amount / (activeAlert.customerHistoryStats.avgAmount || 1)).toFixed(1)}x
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Risk Indicators & Evidence Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-400" />
                  Triggered Behavioral Risk Indicators & Concrete Evidence ({activeAlert.indicators.length})
                </h4>

                <div className="space-y-2.5">
                  {activeAlert.indicators.map((ind, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-200">{ind.name}</span>
                        <span className="font-mono text-amber-400 font-bold">+{ind.scoreImpact} pts</span>
                      </div>
                      <p className="text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
                        <strong className="text-teal-400 font-medium mr-1.5">Evidence:</strong>
                        {ind.evidence}
                      </p>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>Observable Fact: {ind.observableFact}</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Google Gemini AI Investigation Agent Dossier */}
              <div className="rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-indigo-950/20 border border-indigo-500/30 p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-500/20 pb-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Google Gemini Forensic Dossier</h4>
                      <p className="text-[11px] text-slate-400">Distinguishes observed evidence from hypotheses</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {onNavigateTab && (
                      <button
                        onClick={() => {
                          onNavigateTab('copilot');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/40 rounded-lg shadow-sm transition-all cursor-pointer"
                        title="Open interactive AI Copilot investigation for this alert"
                      >
                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Consult AI Copilot</span>
                      </button>
                    )}

                    <button
                      disabled={generatingAI}
                      onClick={handleGenerateDossier}
                      className="flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg shadow-sm transition-all self-start sm:self-auto cursor-pointer"
                    >
                      {generatingAI ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Synthesizing Forensic Evidence...</span>
                        </>
                      ) : (
                        <>
                          <Cpu className="w-3.5 h-3.5" />
                          <span>{activeAlert.aiDossier ? 'Rerun Gemini Forensic Synthesis' : 'Generate Dossier with Gemini'}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {aiError && (
                  <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>{aiError}</span>
                  </div>
                )}

                {activeAlert.aiDossier ? (
                  <div className="space-y-3.5 text-xs">
                    {/* Executive Summary */}
                    <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-teal-400 font-semibold block text-[11px] uppercase tracking-wider">
                        1. Executive Investigation Summary
                      </span>
                      <p className="text-slate-200 leading-relaxed font-sans">{activeAlert.aiDossier.investigationSummary}</p>
                    </div>

                    {/* Differential explanations */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-teal-400 font-semibold text-[11px] block">Plausible Legitimate Scenarios:</span>
                        <ul className="list-disc pl-4 text-slate-300 space-y-1">
                          {activeAlert.aiDossier.possibleExplanations?.legitimate?.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                        <span className="text-red-400 font-semibold text-[11px] block">Suspicious Threat Hypotheses:</span>
                        <ul className="list-disc pl-4 text-slate-300 space-y-1">
                          {activeAlert.aiDossier.possibleExplanations?.suspicious?.map((item, i) => (
                            <li key={i}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Assessment Limitations */}
                    <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-amber-400 font-semibold text-[11px] block">Limitations & Data Boundaries:</span>
                      <p className="text-slate-300 leading-relaxed">{activeAlert.aiDossier.riskAssessmentAndLimitations}</p>
                    </div>

                    {/* Recommended Next Steps */}
                    <div className="p-3.5 rounded-lg bg-teal-950/20 border border-teal-500/30 space-y-1.5">
                      <span className="text-teal-300 font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-teal-400" />
                        Recommended Banking Operational Next Steps (Prior to any account hold):
                      </span>
                      <ol className="list-decimal pl-5 text-slate-200 space-y-1">
                        {activeAlert.aiDossier.recommendedNextSteps?.map((step, i) => (
                          <li key={i}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 rounded-lg bg-slate-950/60 border border-slate-800 text-center text-slate-400 text-xs">
                    Click "Generate Dossier with Gemini" above to synthesize an AI forensic assessment.
                  </div>
                )}
              </div>

              {/* Human Reviewer Decision & Audit Trail */}
              <div className="p-5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
                <h4 className="text-xs font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4 text-teal-400" />
                  Forensic Decision Workbench & Audit Trail
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">Set Case Status</label>
                    <select
                      value={selectedStatus}
                      onChange={e => setSelectedStatus(e.target.value as InvestigationStatus)}
                      className="w-full py-2 px-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono"
                    >
                      <option value="OPEN">Open (Pending Triage)</option>
                      <option value="UNDER_INVESTIGATION">Under Investigation</option>
                      <option value="ESCALATED">Escalated to Fraud Squad</option>
                      <option value="RESOLVED">Resolved (Legitimate)</option>
                      <option value="FALSE_POSITIVE">False Positive (Rule Tuning)</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-medium text-slate-400 block mb-1">
                      Reviewer Rationale & Notes <span className="text-red-400">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={reviewerNote}
                      onChange={e => setReviewerNote(e.target.value)}
                      placeholder="Document verified evidence or rationale for this status decision..."
                      className="w-full p-2 text-xs bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3 pt-2 border-t border-slate-800">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={confirmedReview}
                      onChange={e => setConfirmedReview(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-700 text-teal-500 focus:ring-0"
                    />
                    <span>I confirm this decision is backed by verified evidence and complies with responsible AI human review policy.</span>
                  </label>

                  <button
                    disabled={!confirmedReview || !reviewerNote.trim()}
                    onClick={handleSaveDecision}
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-40 rounded-lg transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Commit Decision to Audit Trail</span>
                  </button>
                </div>

                {/* Audit trail */}
                {activeAlert.notes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 block">Case History:</span>
                    <div className="space-y-1.5 font-mono text-xs max-h-32 overflow-y-auto">
                      {activeAlert.notes.map(note => (
                        <div key={note.id} className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                          <div className="flex justify-between text-[10px] text-slate-400">
                            <span className="text-teal-400">{note.author}</span>
                            <span>{new Date(note.timestamp).toLocaleString()}</span>
                          </div>
                          {note.statusChange && (
                            <span className="text-[10px] text-amber-300 block">Status: {note.statusChange}</span>
                          )}
                          <p className="text-xs text-slate-200 font-sans mt-0.5">{note.comment}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Bottom Close Bar */}
            <div className="px-6 py-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/90 sticky bottom-0">
              <span className="text-xs text-slate-500 font-mono">
                Alert {currentIndex + 1} of {filteredQueue.length}
              </span>
              <button
                onClick={handleCloseModal}
                className="px-4 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors cursor-pointer"
              >
                Close Dossier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
