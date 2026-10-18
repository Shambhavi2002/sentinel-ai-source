/**
 * Sentinel AI - Fraud Detection and Investigation Domain Types
 */

export type TransactionType =
  | 'TRANSFER'
  | 'WIRE'
  | 'CARD_PAYMENT'
  | 'ATM_WITHDRAWAL'
  | 'ONLINE_PURCHASE';

export type ChannelType =
  | 'MOBILE_APP'
  | 'WEB_BANKING'
  | 'API'
  | 'POS'
  | 'BRANCH'
  | 'ATM';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type InvestigationStatus =
  | 'OPEN'
  | 'UNDER_INVESTIGATION'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'FALSE_POSITIVE';

export interface Transaction {
  transactionId: string;
  customerId: string;
  amount: number;
  timestamp: string; // ISO 8601
  transactionType: TransactionType;
  beneficiaryId: string;
  beneficiaryName?: string;
  isNewBeneficiary: boolean;
  location: string;
  channel: ChannelType;
  deviceRiskScore?: number; // 0 to 100
  deviceType?: string;
  deviceIp?: string;
  previousHistoryCount?: number;
  fraudLabel?: 0 | 1; // 1 = Simulated confirmed fraud, 0 = Legitimate (benchmark ground truth)
  description?: string;
}

export interface RiskIndicator {
  code: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scoreImpact: number;
  evidence: string;
  observableFact: string;
}

export interface InvestigationNote {
  id: string;
  author: string;
  timestamp: string;
  statusChange?: InvestigationStatus;
  comment: string;
}

export interface AIDossier {
  investigationSummary: string;
  relevantTransactionIds: string[];
  observedEvidence: string[];
  detectedRiskIndicators: string[];
  possibleExplanations: {
    legitimate: string[];
    suspicious: string[];
  };
  riskAssessmentAndLimitations: string;
  recommendedNextSteps: string[];
  confidenceExplanation: string;
  generatedAt: string;
  source: 'GEMINI_AI' | 'HEURISTIC_FALLBACK';
}

export interface TransactionAnalysis {
  transaction: Transaction;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  baselineScore: number; // Simple rule baseline score for benchmark comparison
  baselineRiskLevel: RiskLevel;
  indicators: RiskIndicator[];
  recommendation: 'AUTO_APPROVE' | 'ROUTINE_MONITOR' | 'EXPEDITE_REVIEW' | 'IMMEDIATE_INVESTIGATION';
  investigationPriority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: InvestigationStatus;
  notes: InvestigationNote[];
  aiDossier?: AIDossier;
  customerHistoryStats?: {
    avgAmount: number;
    stdDevAmount: number;
    transactionCount: number;
    knownBeneficiariesCount: number;
    primaryLocation: string;
  };
}

export interface CrossTransactionPattern {
  id: string;
  patternType:
    | 'RAPID_BENEFICIARY_DRAIN'
    | 'BURST_ATTACK'
    | 'STRUCTURING_SMURFING'
    | 'DEVICE_SHARING_CLUSTER'
    | 'GEO_IMPOSSIBLE_TRAVEL';
  title: string;
  description: string;
  severity: 'MEDIUM' | 'HIGH' | 'CRITICAL';
  transactionIds: string[];
  involvedCustomers: string[];
  involvedBeneficiaries: string[];
  totalValue: number;
  observableIndicators: string[];
}

export interface EvaluationMetrics {
  totalEvaluated: number;
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1Score: number;
  falsePositiveRate: number;
  accuracy: number;
}

export interface ConfigurableThresholds {
  lowMax: number;     // e.g. 29
  mediumMax: number;  // e.g. 59
  highMax: number;    // e.g. 79
  criticalMin: number;// e.g. 80
}
