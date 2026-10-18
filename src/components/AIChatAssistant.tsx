/**
 * Sentinel AI - Conversational Investigation Assistant & Copilot
 * Grounded in loaded synthetic transactions, computed risk scores, and fraud rings.
 */

import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  Cpu,
  Trash2,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  TrendingUp,
  RotateCcw
} from 'lucide-react';
import { TransactionAnalysis, CrossTransactionPattern } from '../types/fraud';

interface AIChatAssistantProps {
  analyses: TransactionAnalysis[];
  patterns?: CrossTransactionPattern[];
  onSelectAlert: (analysis: TransactionAnalysis) => void;
  onNavigateTab: (tab: string) => void;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: 'GEMINI_AI' | 'HEURISTIC_FALLBACK';
  isError?: boolean;
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({
  analyses,
  patterns = [],
  onSelectAlert,
  onNavigateTab
}) => {
  // Identify highest risk transaction in the dataset
  const highestAlert = useMemo(() => {
    if (!analyses || analyses.length === 0) return null;
    return [...analyses].sort((a, b) => b.riskScore - a.riskScore)[0];
  }, [analyses]);

  const flagged = useMemo(() => analyses.filter(a => a.riskLevel !== 'LOW'), [analyses]);
  const critical = useMemo(() => analyses.filter(a => a.riskLevel === 'CRITICAL'), [analyses]);
  const totalExposure = useMemo(() => flagged.reduce((sum, a) => sum + a.transaction.amount, 0), [flagged]);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      sender: 'assistant',
      text: `Hello! I am Sentinel AI's Forensic Investigation Copilot powered by Google Gemini. 
I have direct access to your currently loaded dataset of ${analyses.length} banking transactions, behavioral anomaly models, and ${patterns.length} cross-transaction rings.

All my answers are strictly grounded in verified transaction records and calculated risk scores.

You can ask me:
* "Which transaction has the highest risk score?"
* "Why was transaction ${highestAlert?.transaction.transactionId || 'TXN1003'} flagged?"
* "What evidence supports the risk assessment?"
* "What should an investigator check next?"
* "What is our total potential financial exposure?"
* "Are several suspicious transactions potentially connected in a mule funnel?"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'GEMINI_AI'
    }
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Specific required prompts from user specification
  const quickPrompts = [
    'Which transaction has the highest risk score?',
    `Why was transaction ${highestAlert?.transaction.transactionId || 'TXN1003'} flagged?`,
    'What evidence supports the risk assessment?',
    'What should an investigator check next?',
    'What is our total potential financial exposure?',
    'Are several suspicious transactions potentially connected in a mule funnel?',
    'Which alerts may be false positives?'
  ];

  const handleSendMessage = async (textToSend: string) => {
    const query = textToSend.trim();
    if (!query || loading) return;

    setLastFailedQuery(null);
    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const datasetSummary = {
        totalCount: analyses.length,
        flaggedCount: flagged.length,
        criticalCount: critical.length,
        potentialExposure: totalExposure
      };

      // Extract highest risk alert details
      const highestRiskPayload = highestAlert ? {
        transactionId: highestAlert.transaction.transactionId,
        customerId: highestAlert.transaction.customerId,
        amount: highestAlert.transaction.amount,
        riskScore: highestAlert.riskScore,
        riskLevel: highestAlert.riskLevel,
        status: highestAlert.status,
        indicators: highestAlert.indicators
      } : null;

      // Extract targeted transaction if referenced in query
      const idMatch = query.match(/TXN\d+/i);
      let targetedAlertPayload = null;
      if (idMatch) {
        const found = analyses.find(a => a.transaction.transactionId.toUpperCase() === idMatch[0].toUpperCase());
        if (found) {
          targetedAlertPayload = {
            transactionId: found.transaction.transactionId,
            customerId: found.transaction.customerId,
            amount: found.transaction.amount,
            timestamp: found.transaction.timestamp,
            transactionType: found.transaction.transactionType,
            beneficiaryId: found.transaction.beneficiaryId,
            beneficiaryName: found.transaction.beneficiaryName,
            isNewBeneficiary: found.transaction.isNewBeneficiary,
            location: found.transaction.location,
            channel: found.transaction.channel,
            riskScore: found.riskScore,
            riskLevel: found.riskLevel,
            status: found.status,
            indicators: found.indicators,
            customerHistoryStats: found.customerHistoryStats
          };
        }
      }

      const sampleAlerts = flagged.slice(0, 15).map(a => ({
        transactionId: a.transaction.transactionId,
        customerId: a.transaction.customerId,
        amount: a.transaction.amount,
        riskScore: a.riskScore,
        riskLevel: a.riskLevel,
        status: a.status,
        indicators: a.indicators
      }));

      const patternsSummary = patterns.map(p => ({
        id: p.id,
        title: p.title,
        severity: p.severity,
        totalValue: p.totalValue,
        transactionIds: p.transactionIds,
        involvedCustomers: p.involvedCustomers
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          datasetSummary,
          sampleAlerts,
          highestRiskAlert: highestRiskPayload,
          targetedAlert: targetedAlertPayload,
          patternsSummary
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const assistantMsg: Message = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        text: data.reply || 'Analysis completed with available evidence.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setLastFailedQuery(query);
      const errorMsg: Message = {
        id: `asst-err-${Date.now()}`,
        sender: 'assistant',
        text: `Unable to retrieve investigation answer: ${err.message || 'Network delay'}. You can click "Retry Query" or inspect the alert in the Investigation Centre.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'HEURISTIC_FALLBACK',
        isError: true
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'assistant',
        text: `Conversation cleared. I am ready to answer new questions about the active ${analyses.length} transactions in this dataset.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'GEMINI_AI'
      }
    ]);
  };

  const renderMessageContent = (text: string) => {
    // Detect transaction IDs like TXN1001, TXN1003 and render as clickable chips
    const parts = text.split(/(TXN\d+)/g);

    return (
      <div className="space-y-2 text-xs leading-relaxed font-sans">
        {parts.map((part, index) => {
          if (/^TXN\d+$/i.test(part)) {
            const foundAlert = analyses.find(a => a.transaction.transactionId.toUpperCase() === part.toUpperCase());
            return (
              <button
                key={index}
                onClick={() => {
                  if (foundAlert) {
                    onSelectAlert(foundAlert);
                    onNavigateTab('investigation');
                  }
                }}
                className="inline-flex items-center gap-1 mx-1 px-2 py-0.5 rounded font-mono font-bold text-teal-300 bg-teal-500/20 hover:bg-teal-500/35 border border-teal-500/40 transition-colors cursor-pointer"
                title={`Inspect ${part} dossier in Investigation Centre`}
              >
                <span>{part.toUpperCase()}</span>
                <ArrowRight className="w-2.5 h-2.5" />
              </button>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="rounded-xl bg-slate-900 border border-slate-800 flex flex-col h-[760px] overflow-hidden shadow-2xl">
      {/* Copilot Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-indigo-500/20 to-teal-500/20 text-indigo-400 border border-indigo-500/30">
            <Bot className="w-6 h-6 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">AI Copilot Forensic Assistant</h3>
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                Google Gemini Integrated
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Interactive inquiry grounded strictly in {analyses.length.toLocaleString()} transaction records & behavioral risk scores
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono hidden md:block">
            Highest Score: <strong className="text-red-400">{highestAlert?.transaction.transactionId} ({highestAlert?.riskScore}/100)</strong>
          </div>
          <button
            onClick={handleClearChat}
            title="Reset conversation"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition-colors border border-slate-800 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Chat</span>
          </button>
        </div>
      </div>

      {/* Suggested Quick Inquiry Chips */}
      <div className="p-3 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto no-scrollbar flex items-center gap-2">
        <span className="text-[11px] text-slate-400 font-semibold shrink-0 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          Quick questions:
        </span>
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            disabled={loading}
            onClick={() => handleSendMessage(prompt)}
            className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {messages.map(msg => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  isUser
                    ? 'bg-teal-600 text-white'
                    : msg.isError
                    ? 'bg-red-950/70 border border-red-500/30 text-red-400'
                    : 'bg-indigo-950/70 border border-indigo-500/30 text-indigo-400'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : msg.isError ? <AlertCircle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[85%] rounded-2xl p-4 shadow-sm ${
                  isUser
                    ? 'bg-teal-600 text-white rounded-tr-xs'
                    : msg.isError
                    ? 'bg-red-950/30 border border-red-500/30 text-red-200 rounded-tl-xs'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-4 mb-2 text-[10px] text-slate-400">
                  <span className="font-semibold font-sans">
                    {isUser ? 'Forensic Investigator' : 'Sentinel AI Copilot'}
                  </span>
                  <div className="flex items-center gap-2 font-mono">
                    {msg.source && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                        {msg.source === 'GEMINI_AI' ? 'Google Gemini 3.8 Flash' : 'Forensic Heuristic Engine'}
                      </span>
                    )}
                    <span>{msg.timestamp}</span>
                  </div>
                </div>

                <div className="whitespace-pre-line leading-relaxed">
                  {renderMessageContent(msg.text)}
                </div>

                {msg.isError && lastFailedQuery && (
                  <button
                    onClick={() => handleSendMessage(lastFailedQuery)}
                    className="mt-3 flex items-center gap-1.5 px-3 py-1 bg-red-900/40 hover:bg-red-900/60 border border-red-500/40 text-red-200 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry Query</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-950/70 border border-indigo-500/30 text-indigo-400 shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-xs p-4 flex items-center gap-3 text-xs text-slate-300">
              <RefreshCw className="w-4 h-4 text-teal-400 animate-spin shrink-0" />
              <span>Analyzing transaction records and synthesizing evidence with Google Gemini...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-4 bg-slate-950/90 border-t border-slate-800">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage(inputQuery);
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={inputQuery}
            onChange={e => setInputQuery(e.target.value)}
            disabled={loading}
            placeholder="Ask anything (e.g., 'Which transaction has the highest risk score?', 'Why was TXN1003 flagged?')..."
            className="flex-1 py-2.5 px-4 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-hidden focus:border-teal-500"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-40 rounded-xl transition-colors cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 px-1">
          <span>Responses grounded strictly in loaded transaction data. High risk scores indicate investigative signals, not legal proof.</span>
          <span className="font-mono text-slate-400 hidden sm:inline">Model: gemini-3.8-flash</span>
        </div>
      </div>
    </div>
  );
};
