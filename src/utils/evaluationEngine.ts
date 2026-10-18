/**
 * Sentinel AI - Evaluation & Performance Benchmark Studio
 * Calculates precision, recall, F1, false positive rate, and confusion matrices
 * comparing Sentinel AI's behavioral engine against baseline threshold rules.
 */

import { TransactionAnalysis, EvaluationMetrics, ConfigurableThresholds } from '../types/fraud';

export function calculateMetrics(
  analyses: TransactionAnalysis[],
  useBaseline: boolean = false,
  _thresholds?: ConfigurableThresholds
): EvaluationMetrics {
  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;

  for (const item of analyses) {
    const isGroundTruthFraud = item.transaction.fraudLabel === 1;

    // A transaction is flagged if it meets High or Critical risk level
    const isFlagged = useBaseline
      ? (item.baselineRiskLevel === 'HIGH' || item.baselineRiskLevel === 'CRITICAL')
      : (item.riskLevel === 'HIGH' || item.riskLevel === 'CRITICAL');

    if (isFlagged && isGroundTruthFraud) {
      truePositives++;
    } else if (isFlagged && !isGroundTruthFraud) {
      falsePositives++;
    } else if (!isFlagged && !isGroundTruthFraud) {
      trueNegatives++;
    } else if (!isFlagged && isGroundTruthFraud) {
      falseNegatives++;
    }
  }

  const totalEvaluated = analyses.length;
  const precision = (truePositives + falsePositives) > 0 
    ? truePositives / (truePositives + falsePositives) 
    : 0;
  const recall = (truePositives + falseNegatives) > 0 
    ? truePositives / (truePositives + falseNegatives) 
    : 0;
  const f1Score = (precision + recall) > 0 
    ? (2 * precision * recall) / (precision + recall) 
    : 0;
  const falsePositiveRate = (falsePositives + trueNegatives) > 0 
    ? falsePositives / (falsePositives + trueNegatives) 
    : 0;
  const accuracy = totalEvaluated > 0 
    ? (truePositives + trueNegatives) / totalEvaluated 
    : 0;

  return {
    totalEvaluated,
    truePositives,
    falsePositives,
    trueNegatives,
    falseNegatives,
    precision,
    recall,
    f1Score,
    falsePositiveRate,
    accuracy
  };
}
