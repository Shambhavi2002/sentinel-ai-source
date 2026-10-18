/**
 * Sentinel AI - Transaction Explorer Table & Advanced Search Filter
 */

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  ArrowUpDown,
  FileSearch,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Shield,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { TransactionAnalysis, RiskLevel, InvestigationStatus } from '../types/fraud';

interface TransactionExplorerProps {
  analyses: TransactionAnalysis[];
  onSelectAlert: (analysis: TransactionAnalysis) => void;
  onNavigateTab: (tab: string) => void;
}

export const TransactionExplorer: React.FC<TransactionExplorerProps> = ({
  analyses,
  onSelectAlert,
  onNavigateTab
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRisk, setSelectedRisk] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [minAmount, setMinAmount] = useState<string>('');
  const [maxAmount, setMaxAmount] = useState<string>('');
  const [sortBy, setSortBy] = useState<'timestamp' | 'amount' | 'riskScore'>('riskScore');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 15;

  // Filter and sort transactions
  const filtered = useMemo(() => {
    return analyses.filter(item => {
      const tx = item.transaction;
      // Search text
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matchesId = tx.transactionId.toLowerCase().includes(term);
        const matchesCust = tx.customerId.toLowerCase().includes(term);
        const matchesBen = (tx.beneficiaryName || tx.beneficiaryId).toLowerCase().includes(term);
        const matchesLoc = tx.location.toLowerCase().includes(term);
        const matchesReason = item.indicators.some(i => i.name.toLowerCase().includes(term));
        if (!matchesId && !matchesCust && !matchesBen && !matchesLoc && !matchesReason) {
          return false;
        }
      }

      // Risk level filter
      if (selectedRisk !== 'ALL' && item.riskLevel !== selectedRisk) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }

      // Min amount
      if (minAmount && tx.amount < parseFloat(minAmount)) {
        return false;
      }

      // Max amount
      if (maxAmount && tx.amount > parseFloat(maxAmount)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let valA: number;
      let valB: number;

      if (sortBy === 'riskScore') {
        valA = a.riskScore;
        valB = b.riskScore;
      } else if (sortBy === 'amount') {
        valA = a.transaction.amount;
        valB = b.transaction.amount;
      } else {
        valA = new Date(a.transaction.timestamp).getTime();
        valB = new Date(b.transaction.timestamp).getTime();
      }

      return sortOrder === 'asc' ? valA - valB : valB - valA;
    });
  }, [analyses, searchTerm, selectedRisk, selectedStatus, minAmount, maxAmount, sortBy, sortOrder]);

  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const pagedItems = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: 'timestamp' | 'amount' | 'riskScore') => {
    if (sortBy === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handleExportFiltered = () => {
    const headers = [
      'transactionId',
      'customerId',
      'amount',
      'timestamp',
      'transactionType',
      'beneficiary',
      'location',
      'riskScore',
      'riskLevel',
      'investigationPriority',
      'status',
      'topReason'
    ];

    const rows = filtered.map(item => [
      item.transaction.transactionId,
      item.transaction.customerId,
      item.transaction.amount.toFixed(2),
      item.transaction.timestamp,
      item.transaction.transactionType,
      `"${item.transaction.beneficiaryName || item.transaction.beneficiaryId}"`,
      `"${item.transaction.location}"`,
      item.riskScore,
      item.riskLevel,
      item.investigationPriority,
      item.status,
      `"${item.indicators[0]?.name || 'Routine'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sentinel_filtered_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search by Transaction ID (TXN1003), Customer, Beneficiary, or Reason..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-950 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 self-end md:self-auto">
            <button
              onClick={handleExportFiltered}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-teal-400" />
              <span>Export Filtered ({filtered.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Chips & Ranges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 pt-2 border-t border-slate-800/80 text-xs">
          {/* Risk Level Filter */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Risk Level</label>
            <select
              value={selectedRisk}
              onChange={e => {
                setSelectedRisk(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
            >
              <option value="ALL">All Risk Levels</option>
              <option value="CRITICAL">Critical Only (80-100)</option>
              <option value="HIGH">High Only (60-79)</option>
              <option value="MEDIUM">Medium Only (30-59)</option>
              <option value="LOW">Low (0-29)</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Investigation Status</label>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="UNDER_INVESTIGATION">Under Investigation</option>
              <option value="ESCALATED">Escalated</option>
              <option value="RESOLVED">Resolved</option>
              <option value="FALSE_POSITIVE">False Positive</option>
            </select>
          </div>

          {/* Min Amount */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Min Amount ($)</label>
            <input
              type="number"
              value={minAmount}
              onChange={e => {
                setMinAmount(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="e.g. 1000"
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Max Amount */}
          <div>
            <label className="text-[11px] font-medium text-slate-400 block mb-1">Max Amount ($)</label>
            <input
              type="number"
              value={maxAmount}
              onChange={e => {
                setMaxAmount(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="e.g. 10000"
              className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 text-xs focus:outline-hidden focus:border-teal-500"
            />
          </div>

          {/* Quick Presets */}
          <div className="col-span-2 flex items-end gap-2">
            <button
              onClick={() => {
                setSelectedRisk('CRITICAL');
                setMinAmount('3000');
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-[11px] rounded bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-medium transition-colors"
            >
              Critical Outflows &gt;$3k
            </button>
            <button
              onClick={() => {
                setSelectedRisk('ALL');
                setSelectedStatus('ALL');
                setMinAmount('');
                setMaxAmount('');
                setSearchTerm('');
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-[11px] rounded bg-slate-800 hover:bg-slate-700 text-slate-400 font-medium transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Data Table */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th
                  onClick={() => toggleSort('riskScore')}
                  className="px-4 py-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Risk Score</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3">Tx ID</th>
                <th className="px-4 py-3">Customer</th>
                <th
                  onClick={() => toggleSort('amount')}
                  className="px-4 py-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Amount</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('timestamp')}
                  className="px-4 py-3 cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Timestamp</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="px-4 py-3">Beneficiary</th>
                <th className="px-4 py-3">Channel / Geo</th>
                <th className="px-4 py-3">Primary Signal Reason</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Forensic Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 font-mono">
              {pagedItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-slate-500 font-sans">
                    No transactions match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                pagedItems.map(item => {
                  const tx = item.transaction;
                  const isCrit = item.riskLevel === 'CRITICAL';
                  const isHigh = item.riskLevel === 'HIGH';
                  const isMed = item.riskLevel === 'MEDIUM';

                  return (
                    <tr
                      key={tx.transactionId}
                      onClick={() => {
                        onSelectAlert(item);
                        onNavigateTab('investigation');
                      }}
                      className="hover:bg-slate-800/40 cursor-pointer transition-colors group"
                    >
                      {/* Risk Score */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                            isCrit
                              ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                              : isHigh
                              ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                              : isMed
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isCrit ? 'bg-red-400' : isHigh ? 'bg-orange-400' : isMed ? 'bg-amber-400' : 'bg-teal-400'
                            }`}
                          />
                          {item.riskScore}
                        </span>
                      </td>

                      {/* Tx ID */}
                      <td className="px-4 py-3 font-semibold text-slate-200">
                        {tx.transactionId}
                      </td>

                      {/* Customer */}
                      <td className="px-4 py-3 text-slate-300 font-sans">
                        {tx.customerId}
                      </td>

                      {/* Amount */}
                      <td className="px-4 py-3 font-bold text-white">
                        ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>

                      {/* Timestamp */}
                      <td className="px-4 py-3 text-slate-400 text-[11px]">
                        {new Date(tx.timestamp).toLocaleString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>

                      {/* Beneficiary */}
                      <td className="px-4 py-3 font-sans">
                        <div className="flex items-center gap-1.5">
                          <span className="truncate max-w-[140px]" title={tx.beneficiaryName || tx.beneficiaryId}>
                            {tx.beneficiaryName || tx.beneficiaryId}
                          </span>
                          {tx.isNewBeneficiary && (
                            <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              New
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Channel / Geo */}
                      <td className="px-4 py-3 font-sans text-slate-400 text-[11px]">
                        <div>{tx.channel}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{tx.location}</div>
                      </td>

                      {/* Primary Signal Reason */}
                      <td className="px-4 py-3 font-sans text-slate-300 text-[11px] max-w-[200px] truncate">
                        {item.indicators[0]?.name || 'Standard behavioral match'}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded ${
                            item.status === 'RESOLVED'
                              ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                              : item.status === 'FALSE_POSITIVE'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : item.status === 'ESCALATED'
                              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                              : item.status === 'UNDER_INVESTIGATION'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.status.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Forensic Action */}
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => {
                            onSelectAlert(item);
                            onNavigateTab('investigation');
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-colors"
                        >
                          <FileSearch className="w-3.5 h-3.5" />
                          <span>Dossier</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="font-semibold text-slate-200">{filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
            <span className="font-semibold text-slate-200">{Math.min(currentPage * pageSize, filtered.length)}</span> of{' '}
            <span className="font-semibold text-slate-200">{filtered.length}</span> matching transactions
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
      </div>
    </div>
  );
};
