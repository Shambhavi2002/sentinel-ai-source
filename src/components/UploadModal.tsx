/**
 * Sentinel AI - CSV Upload & Validation Modal
 * Validates columns, amounts, dates, and duplicate transaction IDs.
 */

import React, { useState, useRef } from 'react';
import Papa from 'papaparse';
import { Upload, AlertTriangle, CheckCircle2, X, FileText } from 'lucide-react';
import { Transaction, TransactionType, ChannelType } from '../types/fraud';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (transactions: Transaction[], filename: string) => void;
}

interface ValidationError {
  row: number;
  field: string;
  message: string;
}

export const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, onDataLoaded }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsing, setParsing] = useState(false);
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [warningCount, setWarningCount] = useState(0);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [validTransactions, setValidTransactions] = useState<Transaction[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      processFile(selected);
    }
  };

  const processFile = (fileToParse: File) => {
    setFile(fileToParse);
    setParsing(true);
    setErrors([]);
    setWarningCount(0);
    setPreviewRows([]);
    setValidTransactions([]);

    Papa.parse(fileToParse, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        validateAndParse(results.data);
        setParsing(false);
      },
      error: (err) => {
        setErrors([{ row: 0, field: 'File', message: `CSV Parsing error: ${err.message}` }]);
        setParsing(false);
      }
    });
  };

  const validateAndParse = (rows: any[]) => {
    const valErrors: ValidationError[] = [];
    const seenIds = new Set<string>();
    const parsed: Transaction[] = [];
    let warnings = 0;

    if (!rows || rows.length === 0) {
      valErrors.push({ row: 0, field: 'File', message: 'The uploaded CSV file is empty.' });
      setErrors(valErrors);
      return;
    }

    // Required columns
    const firstRow = rows[0];
    const requiredColumns = ['transactionId', 'amount', 'timestamp'];
    const missingCols = requiredColumns.filter(c => !(c in firstRow));

    if (missingCols.length > 0) {
      valErrors.push({
        row: 0,
        field: 'Headers',
        message: `Missing mandatory column(s): ${missingCols.join(', ')}. Expected: transactionId, amount, timestamp, customerId, beneficiaryId.`
      });
      setErrors(valErrors);
      return;
    }

    rows.forEach((row, index) => {
      const rowNum = index + 2; // header is row 1
      const txId = (row.transactionId || '').toString().trim();
      const amountStr = (row.amount || '').toString().trim();
      const timestamp = (row.timestamp || '').toString().trim();

      // Check transaction ID
      if (!txId) {
        valErrors.push({ row: rowNum, field: 'transactionId', message: 'Missing transaction ID' });
        return;
      }
      if (seenIds.has(txId)) {
        valErrors.push({ row: rowNum, field: 'transactionId', message: `Duplicate transaction ID: ${txId}` });
        return;
      }
      seenIds.add(txId);

      // Check amount
      const amount = parseFloat(amountStr.replace(/[^0-9.-]+/g, ''));
      if (isNaN(amount) || amount <= 0) {
        valErrors.push({ row: rowNum, field: 'amount', message: `Invalid transaction amount "${amountStr}"` });
        return;
      }

      // Check date
      const parsedDate = new Date(timestamp);
      if (isNaN(parsedDate.getTime())) {
        valErrors.push({ row: rowNum, field: 'timestamp', message: `Invalid timestamp format "${timestamp}". Expected ISO 8601.` });
        return;
      }

      // Optional fields with sensible defaults
      const customerId = (row.customerId || `CUST-ANON-${(index % 20) + 1}`).toString().trim();
      const beneficiaryId = (row.beneficiaryId || `BEN-UNKNOWN-${(index % 30) + 1}`).toString().trim();
      const beneficiaryName = row.beneficiaryName ? row.beneficiaryName.toString().trim() : undefined;
      const isNewBeneficiary = (row.isNewBeneficiary === 'true' || row.isNewBeneficiary === true || row.isNewBeneficiary === '1');
      const location = (row.location || 'Unknown Location').toString().trim();
      
      const rawType = (row.transactionType || 'TRANSFER').toString().toUpperCase();
      const validTypes: TransactionType[] = ['TRANSFER', 'WIRE', 'CARD_PAYMENT', 'ATM_WITHDRAWAL', 'ONLINE_PURCHASE'];
      const transactionType: TransactionType = validTypes.includes(rawType as any) ? (rawType as TransactionType) : 'TRANSFER';

      const rawChannel = (row.channel || 'WEB_BANKING').toString().toUpperCase();
      const validChannels: ChannelType[] = ['MOBILE_APP', 'WEB_BANKING', 'API', 'POS', 'BRANCH', 'ATM'];
      const channel: ChannelType = validChannels.includes(rawChannel as any) ? (rawChannel as ChannelType) : 'WEB_BANKING';

      const deviceRiskScore = row.deviceRiskScore ? Math.min(100, Math.max(0, parseInt(row.deviceRiskScore, 10) || 0)) : undefined;
      const deviceType = row.deviceType ? row.deviceType.toString().trim() : undefined;
      const deviceIp = row.deviceIp ? row.deviceIp.toString().trim() : undefined;
      const fraudLabel = row.fraudLabel !== undefined ? (parseInt(row.fraudLabel, 10) === 1 ? 1 : 0) : undefined;
      const description = row.description ? row.description.toString().trim() : undefined;

      parsed.push({
        transactionId: txId,
        customerId,
        amount,
        timestamp: parsedDate.toISOString(),
        transactionType,
        beneficiaryId,
        beneficiaryName,
        isNewBeneficiary,
        location,
        channel,
        deviceRiskScore,
        deviceType,
        deviceIp,
        fraudLabel,
        description
      });
    });

    setErrors(valErrors.slice(0, 15)); // show top 15 errors
    setWarningCount(warnings);
    setValidTransactions(parsed);
    setPreviewRows(parsed.slice(0, 5));
  };

  const handleConfirm = () => {
    if (validTransactions.length > 0) {
      onDataLoaded(validTransactions, file?.name || 'uploaded_transactions.csv');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-100">Upload Transaction CSV</h3>
              <p className="text-xs text-slate-400">Validate and ingest synthetic or batch transaction datasets</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-teal-500/60 rounded-xl p-8 text-center cursor-pointer transition-all bg-slate-800/30 hover:bg-slate-800/50"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            <FileText className="w-10 h-10 text-teal-400/80 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-200">
              {file ? file.name : 'Click to select or drag and drop CSV file'}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Supported fields: transactionId, customerId, amount, timestamp, transactionType, beneficiaryId, isNewBeneficiary, location, deviceRiskScore
            </p>
            {file && (
              <span className="inline-block mt-3 px-3 py-1 rounded-full text-xs font-mono bg-slate-800 text-teal-300 border border-slate-700">
                {(file.size / 1024).toFixed(1)} KB
              </span>
            )}
          </div>

          {/* Validation Feedback */}
          {parsing && (
            <div className="flex items-center justify-center gap-3 py-4 text-sm text-teal-400">
              <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
              Validating transaction records and schema integrity...
            </div>
          )}

          {errors.length > 0 && (
            <div className="rounded-xl bg-red-950/40 border border-red-500/30 p-4 space-y-2">
              <div className="flex items-center gap-2 text-red-400 text-sm font-semibold">
                <AlertTriangle className="w-4 h-4" />
                Validation Errors Detected ({errors.length})
              </div>
              <ul className="text-xs text-red-300/90 space-y-1 pl-5 list-disc max-h-36 overflow-y-auto font-mono">
                {errors.map((e, idx) => (
                  <li key={idx}>
                    {e.row > 0 ? `Row ${e.row} [${e.field}]: ` : ''}{e.message}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {validTransactions.length > 0 && errors.length === 0 && (
            <div className="rounded-xl bg-teal-950/30 border border-teal-500/30 p-4 space-y-3">
              <div className="flex items-center gap-2 text-teal-300 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4 text-teal-400" />
                Validation Successful: {validTransactions.length.toLocaleString()} valid transactions ready for analysis
              </div>
              <div className="text-xs text-slate-400">
                Sample preview of parsed records:
              </div>
              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-800 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="px-3 py-1.5">ID</th>
                      <th className="px-3 py-1.5">Customer</th>
                      <th className="px-3 py-1.5">Amount</th>
                      <th className="px-3 py-1.5">Type</th>
                      <th className="px-3 py-1.5">Beneficiary</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 bg-slate-900/60 font-mono">
                    {previewRows.map((r, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="px-3 py-1.5 text-teal-400">{r.transactionId}</td>
                        <td className="px-3 py-1.5">{r.customerId}</td>
                        <td className="px-3 py-1.5">${r.amount.toFixed(2)}</td>
                        <td className="px-3 py-1.5">{r.transactionType}</td>
                        <td className="px-3 py-1.5">{r.beneficiaryId}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-800 flex items-center justify-between bg-slate-900/90">
          <p className="text-xs text-slate-500">
            Client-side schema validation guarantees clean ingestion.
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={validTransactions.length === 0}
              onClick={handleConfirm}
              className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:pointer-events-none rounded-lg shadow-sm transition-all"
            >
              Analyze {validTransactions.length > 0 ? `${validTransactions.length} Transactions` : 'Dataset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
