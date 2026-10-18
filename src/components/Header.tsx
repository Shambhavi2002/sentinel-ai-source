/**
 * Sentinel AI - Top Navigation & Operations Control Header
 */

import React from 'react';
import {
  ShieldAlert,
  Database,
  Upload,
  Download,
  Sparkles,
  RefreshCw,
  Cpu,
  Layers,
  Search,
  Bot,
  BarChart3,
  Cloud,
  Network
} from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  datasetName: string;
  totalTransactions: number;
  flaggedCount: number;
  geminiActive: boolean;
  onLoadDemo: () => void;
  onOpenUpload: () => void;
  onExportCSV: () => void;
  onDownloadDemoCSV: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onTabChange,
  datasetName,
  totalTransactions,
  flaggedCount,
  geminiActive,
  onLoadDemo,
  onOpenUpload,
  onExportCSV,
  onDownloadDemoCSV
}) => {
  const [isReloading, setIsReloading] = React.useState(false);

  const handleDemoClick = () => {
    setIsReloading(true);
    onLoadDemo();
    setTimeout(() => setIsReloading(false), 700);
  };
  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'explorer', label: 'Transactions', icon: Search, badge: totalTransactions },
    { id: 'investigation', label: 'Investigation Centre', icon: ShieldAlert, badge: flaggedCount, badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30' },
    { id: 'patterns', label: 'Pattern Rings', icon: Network },
    { id: 'copilot', label: 'AI Copilot', icon: Bot, isSpecial: true, isCopilot: true },
    { id: 'evaluation', label: 'Evaluation Studio', icon: Layers },
    { id: 'cloudrun', label: 'Cloud Run Guide', icon: Cloud }
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100">
      {/* Top Banner with Platform Brand & Global Action Controls */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-indigo-600/20 border border-teal-500/30 text-teal-400 shadow-inner">
            <ShieldAlert className="w-6 h-6 text-teal-400" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                SENTINEL<span className="text-teal-400">.AI</span>
              </span>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                Fintech V1.2
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium hidden sm:block">
              Intelligent Financial Fraud Intelligence & Investigation Platform
            </p>
          </div>
        </div>

        {/* System & AI Status Pills */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Database className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-slate-400">Dataset:</span>
            <span className="font-semibold text-slate-200 max-w-[140px] truncate">{datasetName}</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-400">Gemini:</span>
            {geminiActive ? (
              <span className="flex items-center gap-1.5 text-teal-400 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                gemini-3.8-flash (Active)
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-400 font-medium" title="Offline rule-based fallback ready">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                Heuristic Assistant Ready
              </span>
            )}
          </div>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleDemoClick}
            disabled={isReloading}
            title="Reload built-in 1,000 synthetic transaction dataset"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded-lg transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isReloading ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Load Demo Dataset</span>
            <span className="md:hidden">Demo</span>
          </button>

          <button
            onClick={onOpenUpload}
            title="Upload synthetic or live CSV for analysis"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shadow-xs"
          >
            <Upload className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upload CSV</span>
          </button>

          <button
            onClick={onExportCSV}
            title="Export filtered transactions with calculated risk scores"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 border border-slate-700 rounded-lg transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          <button
            onClick={onDownloadDemoCSV}
            title="Download the raw 1,000 synthetic transactions CSV file"
            className="p-1.5 text-xs text-slate-400 hover:text-teal-300 bg-slate-900 border border-slate-800 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800/70">
        <nav className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto py-2.5 scrollbar-thin scrollbar-thumb-slate-800">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id || (tab.id === 'copilot' && currentTab === 'chat');
            const isCopilotTab = tab.id === 'copilot';

            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? isCopilotTab
                      ? 'bg-indigo-600/30 text-white border border-indigo-400 ring-1 ring-indigo-500/50 shadow-md'
                      : 'bg-teal-500/15 text-teal-300 border border-teal-500/30 shadow-xs'
                    : isCopilotTab
                    ? 'bg-indigo-950/40 text-indigo-300 hover:text-white hover:bg-indigo-900/50 border border-indigo-500/40'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/70 border border-transparent'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? (isCopilotTab ? 'text-indigo-300' : 'text-teal-400') : (isCopilotTab ? 'text-indigo-400' : 'text-slate-400')}`} />
                <span>{tab.label}</span>
                {tab.isSpecial && (
                  <Sparkles className="w-3 h-3 text-amber-400 animate-pulse ml-0.5" />
                )}
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
                      tab.badgeColor || 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
