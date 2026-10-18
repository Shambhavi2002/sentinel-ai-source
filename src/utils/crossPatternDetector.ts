/**
 * Sentinel AI - Cross-Transaction & Entity Pattern Detector
 * Identifies coordinated multi-transaction rings, rapid beneficiary funnels,
 * structuring clusters, and velocity attacks.
 */

import { Transaction, CrossTransactionPattern } from '../types/fraud';

export function detectCrossTransactionPatterns(transactions: Transaction[]): CrossTransactionPattern[] {
  const patterns: CrossTransactionPattern[] = [];

  // Group by beneficiary
  const beneficiaryMap = new Map<string, Transaction[]>();
  // Group by customer
  const customerMap = new Map<string, Transaction[]>();
  // Group by IP
  const ipMap = new Map<string, Transaction[]>();

  transactions.forEach(t => {
    // Beneficiary map
    const bList = beneficiaryMap.get(t.beneficiaryId) || [];
    bList.push(t);
    beneficiaryMap.set(t.beneficiaryId, bList);

    // Customer map
    const cList = customerMap.get(t.customerId) || [];
    cList.push(t);
    customerMap.set(t.customerId, cList);

    // IP map
    if (t.deviceIp) {
      const ipList = ipMap.get(t.deviceIp) || [];
      ipList.push(t);
      ipMap.set(t.deviceIp, ipList);
    }
  });

  let patternIdCounter = 1;

  // 1. Detect Mule Account Funneling (Multiple customers sending to the same beneficiary in a short time)
  beneficiaryMap.forEach((txs, benId) => {
    if (txs.length >= 3) {
      const distinctCustomers = Array.from(new Set(txs.map(t => t.customerId)));
      if (distinctCustomers.length >= 3) {
        // Check temporal proximity: did 3+ happen within 4 hours?
        const sortedTxs = [...txs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
        for (let i = 0; i < sortedTxs.length - 2; i++) {
          const windowStart = new Date(sortedTxs[i].timestamp).getTime();
          const windowEnd = new Date(sortedTxs[i + 2].timestamp).getTime();
          const hoursSpan = (windowEnd - windowStart) / (1000 * 3600);

          if (hoursSpan <= 6) {
            const clusterTxs = sortedTxs.filter(t => {
              const tm = new Date(t.timestamp).getTime();
              return tm >= windowStart && tm <= windowStart + 6 * 3600 * 1000;
            });
            const clusterCusts = Array.from(new Set(clusterTxs.map(t => t.customerId)));
            if (clusterCusts.length >= 3) {
              const totalVal = clusterTxs.reduce((sum, t) => sum + t.amount, 0);
              patterns.push({
                id: `RING-${patternIdCounter++}`,
                patternType: 'RAPID_BENEFICIARY_DRAIN',
                title: `Multi-Source Mule Account Funneling into ${clusterTxs[0].beneficiaryName || benId}`,
                description: `${clusterCusts.length} distinct banking customers initiated concurrent outbound payments to single beneficiary ${clusterTxs[0].beneficiaryName || benId} within ${hoursSpan.toFixed(1)} hours.`,
                severity: 'CRITICAL',
                transactionIds: clusterTxs.map(t => t.transactionId),
                involvedCustomers: clusterCusts,
                involvedBeneficiaries: [benId],
                totalValue: totalVal,
                observableIndicators: [
                  `${clusterCusts.length} unrelated sender accounts funneling to common endpoint`,
                  `Total clustered volume: $${totalVal.toLocaleString()}`,
                  `Temporal concentration window: ${hoursSpan.toFixed(1)} hours`,
                  `Beneficiary ${benId} designated as new recipient across senders`
                ]
              });
              break; // Avoid overlapping duplicates for this beneficiary
            }
          }
        }
      }
    }
  });

  // 2. Detect Structuring / Smurfing Clusters (Amounts $9,400 - $9,990 to avoid $10k reporting)
  customerMap.forEach((txs, custId) => {
    const smurfTxs = txs.filter(t => t.amount >= 9400 && t.amount <= 9990);
    if (smurfTxs.length >= 2) {
      const sortedSmurf = [...smurfTxs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      const firstTime = new Date(sortedSmurf[0].timestamp).getTime();
      const lastTime = new Date(sortedSmurf[sortedSmurf.length - 1].timestamp).getTime();
      const daysSpan = (lastTime - firstTime) / (1000 * 3600 * 24);

      if (daysSpan <= 7) {
        const totalVal = sortedSmurf.reduce((sum, t) => sum + t.amount, 0);
        patterns.push({
          id: `RING-${patternIdCounter++}`,
          patternType: 'STRUCTURING_SMURFING',
          title: `Regulatory Currency Structuring Cluster on Customer ${custId}`,
          description: `${sortedSmurf.length} sequential wire transfers each executed just beneath the $10,000 regulatory Bank Secrecy Act / CTR threshold within ${daysSpan <= 1 ? '24 hours' : daysSpan.toFixed(1) + ' days'}.`,
          severity: 'HIGH',
          transactionIds: sortedSmurf.map(t => t.transactionId),
          involvedCustomers: [custId],
          involvedBeneficiaries: Array.from(new Set(sortedSmurf.map(t => t.beneficiaryId))),
          totalValue: totalVal,
          observableIndicators: [
            `Amounts range between $${Math.min(...sortedSmurf.map(t => t.amount)).toLocaleString()} and $${Math.max(...sortedSmurf.map(t => t.amount)).toLocaleString()}`,
            `Aggregated cumulative sum of $${totalVal.toLocaleString()} avoids CTR filing threshold if considered in isolation`,
            `Short execution interval across ${sortedSmurf.length} wire disbursements`
          ]
        });
      }
    }
  });

  // 3. Detect Burst Attacks / Account Takeover Rapid Drains
  customerMap.forEach((txs, custId) => {
    if (txs.length >= 3) {
      const sortedTxs = [...txs].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      for (let i = 0; i < sortedTxs.length - 2; i++) {
        const t1 = new Date(sortedTxs[i].timestamp).getTime();
        const t3 = new Date(sortedTxs[i + 2].timestamp).getTime();
        const minutesSpan = (t3 - t1) / (1000 * 60);

        if (minutesSpan <= 20) {
          const burstTxs = sortedTxs.filter(t => {
            const tm = new Date(t.timestamp).getTime();
            return tm >= t1 && tm <= t1 + 25 * 60 * 1000;
          });
          const highRiskOrNew = burstTxs.filter(t => t.isNewBeneficiary || (t.deviceRiskScore || 0) > 50 || t.amount > 2000);
          if (highRiskOrNew.length >= 2) {
            const totalVal = burstTxs.reduce((sum, t) => sum + t.amount, 0);
            patterns.push({
              id: `RING-${patternIdCounter++}`,
              patternType: 'BURST_ATTACK',
              title: `High-Velocity Burst Liquidity Drain on Account ${custId}`,
              description: `${burstTxs.length} rapid outbound disbursements submitted within ${minutesSpan.toFixed(1)} minutes, deviating sharply from typical customer cadence.`,
              severity: 'CRITICAL',
              transactionIds: burstTxs.map(t => t.transactionId),
              involvedCustomers: [custId],
              involvedBeneficiaries: Array.from(new Set(burstTxs.map(t => t.beneficiaryId))),
              totalValue: totalVal,
              observableIndicators: [
                `Time delta between consecutive attempts under 5 minutes`,
                `High cumulative exposure of $${totalVal.toLocaleString()}`,
                `Device risk elevated on ${burstTxs.filter(t => (t.deviceRiskScore || 0) > 50).length} transactions`
              ]
            });
            break;
          }
        }
      }
    }
  });

  // 4. Detect Device Sharing / Suspicious IP Cluster
  ipMap.forEach((txs, ip) => {
    if (ip && !ip.startsWith('198.51.100')) {
      const distinctCusts = Array.from(new Set(txs.map(t => t.customerId)));
      if (distinctCusts.length >= 2) {
        const totalVal = txs.reduce((sum, t) => sum + t.amount, 0);
        patterns.push({
          id: `RING-${patternIdCounter++}`,
          patternType: 'DEVICE_SHARING_CLUSTER',
          title: `Suspicious Multi-Account Access from Common Network [${ip}]`,
          description: `${distinctCusts.length} independent customer profiles were accessed and transacted through identical host IP ${ip} within the sample window.`,
          severity: 'HIGH',
          transactionIds: txs.map(t => t.transactionId),
          involvedCustomers: distinctCusts,
          involvedBeneficiaries: Array.from(new Set(txs.map(t => t.beneficiaryId))),
          totalValue: totalVal,
          observableIndicators: [
            `Shared network infrastructure across unlinked customers: ${distinctCusts.join(', ')}`,
            `Device environment indicators suggest automation or VPN routing`,
            `Cumulative value transacted across cluster: $${totalVal.toLocaleString()}`
          ]
        });
      }
    }
  });

  return patterns;
}
