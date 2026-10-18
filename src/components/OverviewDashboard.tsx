/**
 * Sentinel AI - Overview Analytics & Operations Dashboard
 */

import React from 'react';
import {
  ShieldAlert,
  DollarSign,
  AlertOctagon,
  Eye,
  TrendingUp,
  Activity,
  ArrowRight,
  Clock,
  CheckCircle,
  FileSearch,
  RefreshCw,
  Bot,
  Sparkles
} from 'lucide-react';
import { TransactionAnalysis } from '../types/fraud';

interface OverviewDashboardProps {
  analyses: TransactionAnalysis[];
  onSelectAlert: (analysis: TransactionAnalysis) => void;
  onNavigateTab: (tab: string) => void;
  onLoadDemo?: () => void;
}

export const OverviewDashboard: React.FC<OverviewDashboardProps> = ({
  analyses,
  onSelectAlert,
  onNavigateTab,
  onLoadDemo
}) => {
  // Aggregate real dataset metrics
  const totalCount = analyses.length;
  const totalVolume = analyses.reduce((acc, a) => acc + a.transaction.amount, 0);

  const flagged = analyses.filter(a => a.riskLevel !== 'LOW');
  const highAndCritical = analyses.filter(a => a.riskLevel === 'HIGH' || a.riskLevel === 'CRITICAL');
  const criticalOnly = analyses.filter(a => a.riskLevel === 'CRITICAL');

  // Estimated potential financial exposure (flagged transactions)
  const potentialExposure = flagged.reduce((acc, a) => acc + a.transaction.amount, 0);

  // Risk distribution
  const lowCount = analyses.filter(a => a.riskLevel === 'LOW').length;
  const mediumCount = analyses.filter(a => a.riskLevel === 'MEDIUM').length;
  const highCount = analyses.filter(a => a.riskLevel === 'HIGH').length;
  const criticalCount = criticalOnly.length;

  // Contributing indicator counts
  const indicatorCounts: Record<string, { count: number; severity: string }> = {};
  analyses.forEach(a => {
    a.indicators.forEach(ind => {
      if (!indicatorCounts[ind.name]) {
        indicatorCounts[ind.name] = { count: 0, severity: ind.severity };
      }
      indicatorCounts[ind.name].count++;
    });
  });

  const sortedIndicators = Object.entries(indicatorCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

  // Highest priority alerts needing immediate review
  const urgentQueue = [...highAndCritical]
    .sort((a, b) => b.riskScore - a.riskScore)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Top Banner Notice: Responsible AI & Investigative Signal Statement */}
      <div className="rounded-xl border border-teal-500/20 bg-gradient-to-r from-teal-950/40 via-slate-900 to-indigo-950/30 p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-semibold text-slate-100 flex items-center gap-2">
              Autonomous Behavioral Risk & Anomaly Scoring Active
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                100% Grounded
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Calculations derived from live transaction streams and customer historical baselines.
              <strong className="text-teal-300 ml-1">Core Principle:</strong> A high-risk score is an investigative signal for prioritization, not legal proof of fraud. Human analyst review is required prior to consequential intervention.
            </p>
          </div>
        </div>
        <div className="shrink-0 flex items-center gap-2 flex-wrap">
          {onLoadDemo && (
            <button
              onClick={onLoadDemo}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 border border-slate-700 rounded-lg shadow-sm transition-all cursor-pointer"
              title="Reset and reload 1,000 synthetic demo transactions"
            >
              <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
              <span>Reset Demo Data</span>
            </button>
          )}
          <button
            onClick={() => onNavigateTab('copilot')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-950/70 hover:bg-indigo-900/80 border border-indigo-500/40 rounded-lg shadow-sm transition-all cursor-pointer"
            title="Open AI Copilot investigation assistant"
          >
            <Bot className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Copilot</span>
            <Sparkles className="w-3 h-3 text-amber-400 animate-pulse" />
          </button>
          <button
            onClick={() => onNavigateTab('investigation')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-lg shadow-sm transition-all cursor-pointer"
          >
            <span>Open Alert Queue ({highAndCritical.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Analysed Transactions</span>
            <div className="p-2 rounded-lg bg-slate-800 text-slate-300">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-white font-mono">
              {totalCount.toLocaleString()}
            </span>
            <span className="text-xs text-teal-400 font-mono font-medium">100% Verified</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Total Volume: <span className="font-mono text-slate-200 font-medium">${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-teal-500 to-transparent" />
        </div>

        {/* KPI 2 */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Flagged for Review</span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-amber-400 font-mono">
              {flagged.length}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              ({totalCount > 0 ? ((flagged.length / totalCount) * 100).toFixed(1) : 0}%)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            Low/Med/High/Critical combined triage pipeline
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-amber-500 to-transparent" />
        </div>

        {/* KPI 3 */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Critical & High Alerts</span>
            <div className="p-2 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <AlertOctagon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-red-400 font-mono">
              {highAndCritical.length}
            </span>
            <span className="text-xs text-red-400 font-mono font-medium">
              ({criticalCount} Critical)
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            High confidence behavioral anomalies requiring immediate triage
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-500 to-transparent" />
        </div>

        {/* KPI 4 */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Estimated At-Risk Exposure</span>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-bold text-indigo-300 font-mono">
              ${potentialExposure.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            <strong className="text-amber-400/90 font-normal">Estimated potential exposure</strong> (not confirmed fraud loss)
          </p>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-transparent" />
        </div>
      </div>

      {/* Middle Row: Visual Risk Distribution & Top Triggers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Classification Distribution */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-teal-400" />
                Risk Classification Distribution
              </h3>
              <span className="text-xs text-slate-400 font-mono">{totalCount} total</span>
            </div>

            {/* Stacked Bar */}
            <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex mb-6">
              <div
                style={{ width: `${totalCount ? (lowCount / totalCount) * 100 : 0}%` }}
                className="bg-teal-500 h-full transition-all"
                title={`Low: ${lowCount}`}
              />
              <div
                style={{ width: `${totalCount ? (mediumCount / totalCount) * 100 : 0}%` }}
                className="bg-amber-500 h-full transition-all"
                title={`Medium: ${mediumCount}`}
              />
              <div
                style={{ width: `${totalCount ? (highCount / totalCount) * 100 : 0}%` }}
                className="bg-orange-500 h-full transition-all"
                title={`High: ${highCount}`}
              />
              <div
                style={{ width: `${totalCount ? (criticalCount / totalCount) * 100 : 0}%` }}
                className="bg-red-500 h-full transition-all"
                title={`Critical: ${criticalCount}`}
              />
            </div>

            {/* Breakdown List */}
            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                  <span className="text-slate-300 font-sans font-medium">Low Risk (0–29)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-200">{lowCount}</span>
                  <span className="text-slate-400 text-[11px]">({((lowCount / (totalCount || 1)) * 100).toFixed(1)}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className="text-slate-300 font-sans font-medium">Medium Risk (30–59)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-200">{mediumCount}</span>
                  <span className="text-slate-400 text-[11px]">({((mediumCount / (totalCount || 1)) * 100).toFixed(1)}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                  <span className="text-slate-300 font-sans font-medium">High Risk (60–79)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-200">{highCount}</span>
                  <span className="text-slate-400 text-[11px]">({((highCount / (totalCount || 1)) * 100).toFixed(1)}%)</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/40 border border-red-500/20">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <span className="text-red-300 font-sans font-medium">Critical Risk (80–100)</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-red-400 font-bold">{criticalCount}</span>
                  <span className="text-red-400/80 text-[11px]">({((criticalCount / (totalCount || 1)) * 100).toFixed(1)}%)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
            Threshold cutoffs are provisional and adjustable in the Evaluation Studio.
          </div>
        </div>

        {/* Top Contributing Behavioral Risk Indicators */}
        <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Top Contributing Behavioral Indicators</h3>
              <p className="text-xs text-slate-400 mt-0.5">Frequency of observed triggers contributing to elevated scores</p>
            </div>
            <button
              onClick={() => onNavigateTab('patterns')}
              className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1"
            >
              Cross Patterns <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {sortedIndicators.map(([name, data], idx) => {
              const maxCount = sortedIndicators[0]?.[1]?.count || 1;
              const percent = (data.count / maxCount) * 100;
              const isCrit = data.severity === 'CRITICAL';
              const isHigh = data.severity === 'HIGH';

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-200 font-medium flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${isCrit ? 'bg-red-500' : (isHigh ? 'bg-orange-400' : 'bg-amber-400')}`} />
                      {name}
                    </span>
                    <span className="font-mono text-slate-400">
                      {data.count} alerts
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${percent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        isCrit ? 'bg-red-500' : (isHigh ? 'bg-orange-500' : 'bg-amber-500')
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-5 p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-teal-400 shrink-0" />
              Multi-factor scoring reduces false-positives by requiring compound indicators.
            </span>
            <button
              onClick={() => onNavigateTab('evaluation')}
              className="text-teal-400 hover:underline font-mono text-[11px] whitespace-nowrap ml-2"
            >
              View Benchmark
            </button>
          </div>
        </div>
      </div>

      {/* Priority Alert Triage Queue */}
      <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              High-Priority Alert Triage Queue
            </h3>
            <p className="text-xs text-slate-400">Transactions exhibiting the highest behavioral divergence from normal customer patterns</p>
          </div>
          <button
            onClick={() => onNavigateTab('explorer')}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 self-start sm:self-auto"
          >
            Explore All {totalCount} Transactions <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/70 text-slate-400 font-mono text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-4 py-2.5 rounded-l-lg">ID</th>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Amount</th>
                <th className="px-4 py-2.5">Timestamp</th>
                <th className="px-4 py-2.5">Beneficiary</th>
                <th className="px-4 py-2.5">Risk Score</th>
                <th className="px-4 py-2.5">Primary Deviation Reason</th>
                <th className="px-4 py-2.5 text-right rounded-r-lg">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {urgentQueue.map(item => {
                const tx = item.transaction;
                const isCrit = item.riskLevel === 'CRITICAL';

                return (
                  <tr key={tx.transactionId} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-200">
                      {tx.transactionId}
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-sans">
                      {tx.customerId}
                    </td>
                    <td className="px-4 py-3 font-bold text-white">
                      ${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-3 text-slate-400 text-[11px]">
                      {new Date(tx.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-4 py-3 font-sans">
                      <div className="truncate max-w-[160px]" title={tx.beneficiaryName || tx.beneficiaryId}>
                        {tx.beneficiaryName || tx.beneficiaryId}
                      </div>
                      {tx.isNewBeneficiary && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          New
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                          isCrit
                            ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                            : 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isCrit ? 'bg-red-400 animate-ping' : 'bg-orange-400'}`} />
                        {item.riskScore}/100 ({item.riskLevel})
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-sans max-w-xs truncate text-[11px]">
                      {item.indicators[0]?.name || 'Behavioral anomaly detected'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => {
                          onSelectAlert(item);
                          onNavigateTab('investigation');
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-teal-300 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 rounded-lg transition-colors"
                      >
                        <FileSearch className="w-3.5 h-3.5" />
                        Investigate
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
  );
};
