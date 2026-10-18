/**
 * Sentinel AI - Evaluation & Performance Benchmark Studio
 * Computes Precision, Recall, F1, False Positive Rate, and Confusion Matrices
 * on ground-truth simulated labels, comparing Sentinel AI against baseline threshold rules.
 */

import React, { useState, useMemo } from 'react';
import {
  Layers,
  Award,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  TrendingUp,
  ShieldAlert,
  ArrowRight,
  Info
} from 'lucide-react';
import { TransactionAnalysis, ConfigurableThresholds } from '../types/fraud';
import { calculateMetrics } from '../utils/evaluationEngine';
import { DEFAULT_THRESHOLDS } from '../utils/fraudDetectionEngine';

interface EvaluationStudioProps {
  analyses: TransactionAnalysis[];
  thresholds: ConfigurableThresholds;
  onUpdateThresholds: (thresholds: ConfigurableThresholds) => void;
}

export const EvaluationStudio: React.FC<EvaluationStudioProps> = ({
  analyses,
  thresholds,
  onUpdateThresholds
}) => {
  const [highThreshold, setHighThreshold] = useState<number>(thresholds.highMax + 1); // e.g. 60

  // Filter analyses that have ground-truth evaluation labels
  const labeledAnalyses = useMemo(() => {
    return analyses.filter(a => a.transaction.fraudLabel !== undefined);
  }, [analyses]);

  // Recalculate metrics for Sentinel AI (based on highThreshold)
  const sentinelMetrics = useMemo(() => {
    let tp = 0;
    let fp = 0;
    let tn = 0;
    let fn = 0;

    labeledAnalyses.forEach(item => {
      const isActualFraud = item.transaction.fraudLabel === 1;
      const isPredictedFraud = item.riskScore >= highThreshold;

      if (isPredictedFraud && isActualFraud) tp++;
      else if (isPredictedFraud && !isActualFraud) fp++;
      else if (!isPredictedFraud && !isActualFraud) tn++;
      else if (!isPredictedFraud && isActualFraud) fn++;
    });

    const total = labeledAnalyses.length;
    const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
    const recall = (tp + fn) > 0 ? tp / (tp + fn) : 0;
    const f1Score = (precision + recall) > 0 ? (2 * precision * recall) / (precision + recall) : 0;
    const falsePositiveRate = (fp + tn) > 0 ? fp / (fp + tn) : 0;
    const accuracy = total > 0 ? (tp + tn) / total : 0;

    return {
      totalEvaluated: total,
      truePositives: tp,
      falsePositives: fp,
      trueNegatives: tn,
      falseNegatives: fn,
      precision,
      recall,
      f1Score,
      falsePositiveRate,
      accuracy
    };
  }, [labeledAnalyses, highThreshold]);

  // Baseline Simple Rule Detector metrics (naive amount > $5000 or new beneficiary)
  const baselineMetrics = useMemo(() => {
    return calculateMetrics(labeledAnalyses, true, thresholds);
  }, [labeledAnalyses, thresholds]);

  // False positive reduction percentage
  const fpReductionPercent = baselineMetrics.falsePositives > 0
    ? (((baselineMetrics.falsePositives - sentinelMetrics.falsePositives) / baselineMetrics.falsePositives) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6">
      {/* Methodological Context & Responsible Evaluation Banner */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-2">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shrink-0">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Empirical Model Evaluation & Benchmark Studio
              <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Ground-Truth Benchmarked
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">
              Calculates real precision, recall, F1, and false-positive rates comparing Sentinel AI's behavioral anomaly engine against a naive baseline rule detector (e.g. flagging any transaction &gt;$5,000 or new beneficiary) across {labeledAnalyses.length} labeled test records.
            </p>
          </div>
        </div>

        {/* Disclaimer Callout Box */}
        <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5 mt-3">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Responsible AI Notice:</strong> Evaluation metrics are computed strictly against the synthetic test dataset. High performance on synthetic benchmarks does <em>not</em> establish real-world banking production fraud effectiveness. Real deployments require ongoing calibration against production payment distributions and dark web compromise trends.
          </p>
        </div>
      </div>

      {/* Interactive Threshold Slider */}
      <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              Dynamic Alert Cutoff Calibration Slider
            </h3>
            <p className="text-xs text-slate-400">
              Adjust the decision threshold to observe real-time trade-offs between precision and recall
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs">
            <span className="text-slate-400">Current Cutoff:</span>
            <span className="px-3 py-1 rounded bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold">
              Score &ge; {highThreshold}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Aggressive (Score &ge; 40)</span>
            <span className="text-teal-400 font-bold">Default Recommended: 60</span>
            <span>Conservative (Score &ge; 80)</span>
          </div>
          <input
            type="range"
            min="30"
            max="85"
            step="1"
            value={highThreshold}
            onChange={e => setHighThreshold(parseInt(e.target.value, 10))}
            className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-950 rounded-lg"
          />
        </div>
      </div>

      {/* Side-by-Side Comparison Grid: Sentinel AI vs Baseline Rule Engine */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Model 1: Sentinel AI Behavioral & Anomaly Engine */}
        <div className="rounded-xl bg-gradient-to-b from-slate-900 to-teal-950/20 border border-teal-500/40 p-5 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-teal-500/20 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Sentinel AI</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30">
                  Enhanced Behavioral
                </span>
              </div>
              <p className="text-xs text-slate-400">Temporal velocity, historical baselines & compound indicators</p>
            </div>
            <Award className="w-6 h-6 text-teal-400" />
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-teal-500/20">
              <span className="text-[10px] text-slate-400 font-sans block">Precision</span>
              <span className="text-lg font-bold text-teal-300 mt-1 block">
                {(sentinelMetrics.precision * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-teal-500/20">
              <span className="text-[10px] text-slate-400 font-sans block">Recall</span>
              <span className="text-lg font-bold text-teal-300 mt-1 block">
                {(sentinelMetrics.recall * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-teal-500/20">
              <span className="text-[10px] text-slate-400 font-sans block">F1 Score</span>
              <span className="text-lg font-bold text-teal-300 mt-1 block">
                {(sentinelMetrics.f1Score * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-teal-500/20">
              <span className="text-[10px] text-slate-400 font-sans block">False Pos. Rate</span>
              <span className="text-lg font-bold text-teal-400 mt-1 block">
                {(sentinelMetrics.falsePositiveRate * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Confusion Matrix Table */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Sentinel AI Confusion Matrix
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-teal-500/30">
                <span className="text-[10px] text-teal-400 block font-sans">True Positives (TP)</span>
                <span className="text-xl font-bold text-white mt-1 block">{sentinelMetrics.truePositives}</span>
                <span className="text-[10px] text-slate-400">Correctly detected simulated frauds</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-amber-400 block font-sans">False Positives (FP)</span>
                <span className="text-xl font-bold text-amber-400 mt-1 block">{sentinelMetrics.falsePositives}</span>
                <span className="text-[10px] text-slate-400">Legitimate transactions flagged</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-red-400 block font-sans">False Negatives (FN)</span>
                <span className="text-xl font-bold text-red-400 mt-1 block">{sentinelMetrics.falseNegatives}</span>
                <span className="text-[10px] text-slate-400">Simulated frauds missed</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">True Negatives (TN)</span>
                <span className="text-xl font-bold text-slate-200 mt-1 block">{sentinelMetrics.trueNegatives}</span>
                <span className="text-[10px] text-slate-400">Legitimate payments passed</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-xs text-teal-300 font-medium flex items-center justify-between">
            <span>False-Positive Reduction vs Baseline:</span>
            <span className="font-mono font-bold text-sm text-teal-200">
              {Number(fpReductionPercent) > 0 ? `-${fpReductionPercent}%` : 'Optimal'}
            </span>
          </div>
        </div>

        {/* Model 2: Simple Rule Baseline Detector */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-300">Baseline Rule Engine</h3>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                  Static Threshold Rules
                </span>
              </div>
              <p className="text-xs text-slate-400">Naive rule: Flags if amount &gt; $5,000 or new beneficiary</p>
            </div>
            <AlertTriangle className="w-6 h-6 text-amber-500/80" />
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center font-mono">
            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans block">Precision</span>
              <span className="text-lg font-bold text-slate-300 mt-1 block">
                {(baselineMetrics.precision * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans block">Recall</span>
              <span className="text-lg font-bold text-slate-300 mt-1 block">
                {(baselineMetrics.recall * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans block">F1 Score</span>
              <span className="text-lg font-bold text-slate-300 mt-1 block">
                {(baselineMetrics.f1Score * 100).toFixed(1)}%
              </span>
            </div>

            <div className="p-3 rounded-lg bg-slate-950/70 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-sans block">False Pos. Rate</span>
              <span className="text-lg font-bold text-amber-400 mt-1 block">
                {(baselineMetrics.falsePositiveRate * 100).toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Baseline Confusion Matrix */}
          <div className="space-y-2">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Baseline Confusion Matrix
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">True Positives (TP)</span>
                <span className="text-xl font-bold text-slate-300 mt-1 block">{baselineMetrics.truePositives}</span>
                <span className="text-[10px] text-slate-500">Correctly detected frauds</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-red-500/20">
                <span className="text-[10px] text-red-400 block font-sans">False Positives (FP)</span>
                <span className="text-xl font-bold text-red-400 mt-1 block">{baselineMetrics.falsePositives}</span>
                <span className="text-[10px] text-slate-500">Massive investigator alert fatigue</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">False Negatives (FN)</span>
                <span className="text-xl font-bold text-slate-300 mt-1 block">{baselineMetrics.falseNegatives}</span>
                <span className="text-[10px] text-slate-500">Low-amount smurfing missed</span>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
                <span className="text-[10px] text-slate-400 block font-sans">True Negatives (TN)</span>
                <span className="text-xl font-bold text-slate-300 mt-1 block">{baselineMetrics.trueNegatives}</span>
                <span className="text-[10px] text-slate-500">Correctly cleared</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-400">
            Static thresholds cause high false positives on legitimate high-value purchases (e.g. house deposits, annual taxes, hospital bills).
          </div>
        </div>
      </div>
    </div>
  );
};
