/**
 * Sentinel AI - Cross-Transaction & Fraud Ring Pattern Explorer
 */

import React, { useState } from 'react';
import {
  Network,
  Users,
  AlertOctagon,
  ArrowRight,
  TrendingDown,
  Layers,
  ShieldAlert,
  Calendar,
  DollarSign,
  ChevronRight
} from 'lucide-react';
import { CrossTransactionPattern, TransactionAnalysis } from '../types/fraud';

interface CrossPatternExplorerProps {
  patterns: CrossTransactionPattern[];
  allAnalyses: TransactionAnalysis[];
  onSelectAlert: (analysis: TransactionAnalysis) => void;
  onNavigateTab: (tab: string) => void;
}

export const CrossPatternExplorer: React.FC<CrossPatternExplorerProps> = ({
  patterns,
  allAnalyses,
  onSelectAlert,
  onNavigateTab
}) => {
  const [selectedPatternId, setSelectedPatternId] = useState<string>(
    patterns[0]?.id || ''
  );

  const activePattern = patterns.find(p => p.id === selectedPatternId) || patterns[0];

  // Retrieve actual transactions in the selected cluster
  const clusterAnalyses = activePattern
    ? allAnalyses.filter(a => activePattern.transactionIds.includes(a.transaction.transactionId))
    : [];

  return (
    <div className="space-y-6">
      {/* Intro Banner */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Cross-Transaction Pattern & Coordinated Ring Engine
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                {patterns.length} Active Rings Discovered
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Traditional fraud engines evaluate payments in isolation. Sentinel AI correlates temporal sequences, beneficiary convergence, common device IPs, and smurfing thresholds across multiple accounts to detect syndicates and rapid liquidation runs.
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid: Left pattern list, right cluster inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pattern Ring List */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-1">
            Detected Cluster Syndicates & Patterns
          </h3>

          <div className="space-y-2.5">
            {patterns.length === 0 ? (
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-400">
                No cross-transaction syndicates detected in this dataset.
              </div>
            ) : (
              patterns.map(p => {
                const isSelected = p.id === selectedPatternId;
                const isCrit = p.severity === 'CRITICAL';

                return (
                  <div
                    key={p.id}
                    onClick={() => setSelectedPatternId(p.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-800/90 border-teal-500/60 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-mono text-teal-400 font-bold">{p.id}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold ${
                          isCrit
                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {p.severity}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-100 line-clamp-1">{p.title}</h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-3 pt-2.5 border-t border-slate-800/80 font-mono">
                      <span>{p.transactionIds.length} txns</span>
                      <span>{p.involvedCustomers.length} accounts</span>
                      <span className="text-slate-200 font-semibold font-sans">
                        ${p.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Selected Cluster Deep-Dive Inspector */}
        <div className="lg:col-span-2 space-y-4">
          {activePattern ? (
            <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-5">
              {/* Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-mono text-teal-400 font-bold">{activePattern.id}</span>
                  <span className="text-xs font-mono text-slate-400">
                    Type: <strong className="text-slate-200 font-sans">{activePattern.patternType.replace(/_/g, ' ')}</strong>
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white">{activePattern.title}</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {activePattern.description}
                </p>
              </div>

              {/* Observable Indicators Breakdown */}
              <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2">
                <h4 className="text-xs font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4" />
                  Observable Indicators Supporting Grouping
                </h4>
                <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-4 font-sans">
                  {activePattern.observableIndicators.map((ind, i) => (
                    <li key={i}>{ind}</li>
                  ))}
                </ul>
              </div>

              {/* Cluster Stats Summary */}
              <div className="grid grid-cols-3 gap-3 font-mono text-xs">
                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-sans block">Aggregated Value</span>
                  <span className="text-base font-bold text-white mt-1 block">
                    ${activePattern.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-sans block">Affected Accounts</span>
                  <span className="text-base font-bold text-teal-400 mt-1 block">
                    {activePattern.involvedCustomers.length}
                  </span>
                </div>

                <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 font-sans block">Linked Events</span>
                  <span className="text-base font-bold text-indigo-400 mt-1 block">
                    {activePattern.transactionIds.length}
                  </span>
                </div>
              </div>

              {/* Clustered Transactions Timeline Table */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Associated Event Timeline ({clusterAnalyses.length} Transactions)
                </h4>

                <div className="overflow-x-auto rounded-lg border border-slate-800">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-800/80 text-slate-400 font-mono text-[11px]">
                      <tr>
                        <th className="px-3.5 py-2">ID</th>
                        <th className="px-3.5 py-2">Account</th>
                        <th className="px-3.5 py-2">Amount</th>
                        <th className="px-3.5 py-2">Timestamp</th>
                        <th className="px-3.5 py-2">Beneficiary</th>
                        <th className="px-3.5 py-2">Risk</th>
                        <th className="px-3.5 py-2 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-slate-950/50 font-mono">
                      {clusterAnalyses.map(item => {
                        const tx = item.transaction;
                        return (
                          <tr key={tx.transactionId} className="hover:bg-slate-800/30">
                            <td className="px-3.5 py-2 font-semibold text-slate-200">
                              {tx.transactionId}
                            </td>
                            <td className="px-3.5 py-2 font-sans text-slate-300">{tx.customerId}</td>
                            <td className="px-3.5 py-2 font-bold text-white">
                              ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-3.5 py-2 text-slate-400 text-[11px]">
                              {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-3.5 py-2 font-sans truncate max-w-[120px]">
                              {tx.beneficiaryName || tx.beneficiaryId}
                            </td>
                            <td className="px-3.5 py-2">
                              <span className="text-red-400 font-bold">{item.riskScore}</span>
                            </td>
                            <td className="px-3.5 py-2 text-right">
                              <button
                                onClick={() => {
                                  onSelectAlert(item);
                                  onNavigateTab('investigation');
                                }}
                                className="text-xs text-teal-400 hover:text-teal-300 font-semibold"
                              >
                                Dossier →
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 rounded-xl bg-slate-900 border border-slate-800 text-center text-slate-400 text-xs">
              Select a pattern ring to inspect correlated transactions and underlying indicators.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
