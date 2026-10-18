/**
 * Sentinel AI - Synthetic Banking Dataset Generator
 * Generates ~1,000 realistic synthetic banking transactions with realistic distributions,
 * known behavioral patterns, legitimate edge cases, and simulated fraud labels.
 * 
 * DISCLAIMER: All data generated is 100% synthetic for testing and evaluation.
 * No real customer, banking, or account information is used.
 */

import { Transaction, TransactionType, ChannelType } from '../types/fraud';

interface CustomerProfile {
  id: string;
  name: string;
  segment: 'RETAIL' | 'SME' | 'PREMIUM' | 'RETIREE';
  avgSpend: number;
  homeLocation: string;
  primaryDevice: string;
  regularBeneficiaries: string[];
}

const CUSTOMER_PROFILES: CustomerProfile[] = [
  { id: 'CUST-1001', name: 'Elena Rostova', segment: 'RETAIL', avgSpend: 85, homeLocation: 'New York, USA', primaryDevice: 'iPhone 15 Pro', regularBeneficiaries: ['BEN-GROCERY-01', 'BEN-UTIL-NY', 'BEN-LANDLORD-1'] },
  { id: 'CUST-1002', name: 'Marcus Chen', segment: 'PREMIUM', avgSpend: 1450, homeLocation: 'San Francisco, USA', primaryDevice: 'MacBook Pro / Chrome', regularBeneficiaries: ['BEN-INVEST-SF', 'BEN-MORTGAGE-SF', 'BEN-AUTO-LEASE'] },
  { id: 'CUST-1003', name: 'Sarah Jenkins', segment: 'SME', avgSpend: 3200, homeLocation: 'Chicago, USA', primaryDevice: 'ThinkPad / Edge', regularBeneficiaries: ['BEN-SUPPLIER-CH', 'BEN-PAYROLL-CH', 'BEN-TAX-FED'] },
  { id: 'CUST-1004', name: 'David Al-Mansoor', segment: 'RETAIL', avgSpend: 120, homeLocation: 'London, UK', primaryDevice: 'Samsung Galaxy S24', regularBeneficiaries: ['BEN-TFL-METRO', 'BEN-TESCO-UK', 'BEN-RENT-LON'] },
  { id: 'CUST-1005', name: 'Chloe Dubois', segment: 'RETAIL', avgSpend: 95, homeLocation: 'Paris, France', primaryDevice: 'iPhone 14', regularBeneficiaries: ['BEN-CARREFOUR', 'BEN-EDF-POWER', 'BEN-METRO-PARIS'] },
  { id: 'CUST-1006', name: 'Amit Patel', segment: 'PREMIUM', avgSpend: 2100, homeLocation: 'Singapore', primaryDevice: 'iPad Pro / Safari', regularBeneficiaries: ['BEN-DBS-WEALTH', 'BEN-CONDO-SG', 'BEN-CLUB-SG'] },
  { id: 'CUST-1007', name: 'Emma Wilson', segment: 'RETIREE', avgSpend: 65, homeLocation: 'Boston, USA', primaryDevice: 'iPad 9th Gen', regularBeneficiaries: ['BEN-PHARM-BOS', 'BEN-EVERSOURCE', 'BEN-MARKET-BOS'] },
  { id: 'CUST-1008', name: 'Carlos Mendez', segment: 'SME', avgSpend: 2800, homeLocation: 'Miami, USA', primaryDevice: 'Dell XPS / Chrome', regularBeneficiaries: ['BEN-LOGISTICS-FL', 'BEN-SUPPLY-MIA', 'BEN-STAFF-MIA'] },
  { id: 'CUST-1009', name: 'Yuki Tanaka', segment: 'RETAIL', avgSpend: 140, homeLocation: 'Tokyo, Japan', primaryDevice: 'Sony Xperia', regularBeneficiaries: ['BEN-SUICA-TOKYO', 'BEN-SEVEN-MART', 'BEN-APART-TYO'] },
  { id: 'CUST-1010', name: 'Lars Lindqvist', segment: 'PREMIUM', avgSpend: 1800, homeLocation: 'Stockholm, Sweden', primaryDevice: 'iPhone 15', regularBeneficiaries: ['BEN-AVANZA-INV', 'BEN-TELIA-FIBER', 'BEN-HOUSING-STK'] },
  { id: 'CUST-1011', name: 'Fatima Zahra', segment: 'RETAIL', avgSpend: 110, homeLocation: 'Dubai, UAE', primaryDevice: 'iPhone 15 Pro Max', regularBeneficiaries: ['BEN-DEWA-UTIL', 'BEN-LULU-HYPER', 'BEN-EMAAR-RENT'] },
  { id: 'CUST-1012', name: 'Mateo Rossi', segment: 'RETAIL', avgSpend: 75, homeLocation: 'Milan, Italy', primaryDevice: 'Google Pixel 8', regularBeneficiaries: ['BEN-ENEL-ENERGY', 'BEN-COOP-MILANO', 'BEN-ATM-MILAN'] },
  { id: 'CUST-1013', name: 'Jessica Vance', segment: 'PREMIUM', avgSpend: 1950, homeLocation: 'Seattle, USA', primaryDevice: 'MacBook Air / Safari', regularBeneficiaries: ['BEN-VANGUARD-US', 'BEN-SEATTLE-CITY', 'BEN-HEALTH-PREM'] },
  { id: 'CUST-1014', name: 'Lucas Ferreira', segment: 'SME', avgSpend: 3100, homeLocation: 'São Paulo, Brazil', primaryDevice: 'Lenovo / Chrome', regularBeneficiaries: ['BEN-DISTRIB-SP', 'BEN-ITA-SUPPLY', 'BEN-FOLHA-PAG'] },
  { id: 'CUST-1015', name: 'Hannah Schmidt', segment: 'RETAIL', avgSpend: 130, homeLocation: 'Frankfurt, Germany', primaryDevice: 'iPhone 13', regularBeneficiaries: ['BEN-REWE-SUPER', 'BEN-MAIN-POWER', 'BEN-MIETE-FRA'] },
  { id: 'CUST-1016', name: 'Tariq Al-Sabah', segment: 'PREMIUM', avgSpend: 4200, homeLocation: 'Kuwait City, Kuwait', primaryDevice: 'iPhone 15 Pro', regularBeneficiaries: ['BEN-NBK-INVEST', 'BEN-MARINA-PROP', 'BEN-LUX-KWT'] },
  { id: 'CUST-1017', name: 'Sophia Kim', segment: 'RETAIL', avgSpend: 105, homeLocation: 'Seoul, South Korea', primaryDevice: 'Galaxy S23 Ultra', regularBeneficiaries: ['BEN-EMART-SEOUL', 'BEN-KEPCO-POWER', 'BEN-METRO-KOR'] },
  { id: 'CUST-1018', name: 'Oliver Wright', segment: 'RETIREE', avgSpend: 55, homeLocation: 'Manchester, UK', primaryDevice: 'HP Desktop / Chrome', regularBeneficiaries: ['BEN-BOOTS-PHARM', 'BEN-BRITISH-GAS', 'BEN-COUNCIL-MAN'] },
  { id: 'CUST-1019', name: 'Nadia Petrov', segment: 'SME', avgSpend: 2500, homeLocation: 'Toronto, Canada', primaryDevice: 'MacBook Pro / Chrome', regularBeneficiaries: ['BEN-ROGERS-CORP', 'BEN-ONTARIO-PWR', 'BEN-VENDOR-CA'] },
  { id: 'CUST-1020', name: 'Liam O\'Connor', segment: 'RETAIL', avgSpend: 80, homeLocation: 'Dublin, Ireland', primaryDevice: 'iPhone 14', regularBeneficiaries: ['BEN-DUNNES-STORE', 'BEN-ELECTRIC-IRE', 'BEN-DUBLIN-BUS'] },
  { id: 'CUST-1021', name: 'Ananya Sharma', segment: 'PREMIUM', avgSpend: 1650, homeLocation: 'Bengaluru, India', primaryDevice: 'OnePlus 12', regularBeneficiaries: ['BEN-ZERODHA-INV', 'BEN-BESCOM-PWR', 'BEN-PRESTIGE-APT'] },
  { id: 'CUST-1022', name: 'Gabriel Santos', segment: 'RETAIL', avgSpend: 90, homeLocation: 'Lisbon, Portugal', primaryDevice: 'Xiaomi 13T', regularBeneficiaries: ['BEN-PINGO-DOCE', 'BEN-EDP-PORTUGAL', 'BEN-CARRIS-METRO'] },
  { id: 'CUST-1023', name: 'Zoe Andersen', segment: 'RETAIL', avgSpend: 115, homeLocation: 'Copenhagen, Denmark', primaryDevice: 'iPhone 14 Pro', regularBeneficiaries: ['BEN-NETTO-DK', 'BEN-ORSTED-UTIL', 'BEN-BOLIG-CPH'] },
  { id: 'CUST-1024', name: 'Klaus Fischer', segment: 'SME', avgSpend: 3400, homeLocation: 'Munich, Germany', primaryDevice: 'ThinkStation / Firefox', regularBeneficiaries: ['BEN-BAVARIA-TECH', 'BEN-SWM-MUNICH', 'BEN-GEHALT-DE'] },
  { id: 'CUST-1025', name: 'Isabella Taylor', segment: 'PREMIUM', avgSpend: 2200, homeLocation: 'Sydney, Australia', primaryDevice: 'MacBook Pro / Safari', regularBeneficiaries: ['BEN-COMMSEC-INV', 'BEN-ENERGY-AUS', 'BEN-HARBOUR-RENT'] },
  { id: 'CUST-1026', name: 'Hassan Mahmoud', segment: 'RETAIL', avgSpend: 70, homeLocation: 'Cairo, Egypt', primaryDevice: 'Samsung Galaxy A54', regularBeneficiaries: ['BEN-KAZYON-MART', 'BEN-EGYPT-GAS', 'BEN-WE-TELECOM'] },
  { id: 'CUST-1027', name: 'Elena Popova', segment: 'RETIREE', avgSpend: 60, homeLocation: 'Prague, Czechia', primaryDevice: 'Lenovo Laptop / Chrome', regularBeneficiaries: ['BEN-ALBERT-CZ', 'BEN-PRE-POWER', 'BEN-LEKARNA-PRG'] },
  { id: 'CUST-1028', name: 'James Thornton', segment: 'SME', avgSpend: 2900, homeLocation: 'Atlanta, USA', primaryDevice: 'Surface Laptop 5', regularBeneficiaries: ['BEN-GEORGIA-PWR', 'BEN-DELTA-CORP', 'BEN-PEACH-SUPPLY'] },
  { id: 'CUST-1029', name: 'Aaliyah Jones', segment: 'RETAIL', avgSpend: 125, homeLocation: 'Philadelphia, USA', primaryDevice: 'iPhone 15', regularBeneficiaries: ['BEN-GIANT-FOODS', 'BEN-PECO-ENERGY', 'BEN-SEPTA-TRANS'] },
  { id: 'CUST-1030', name: 'Victor Hugo Ramos', segment: 'PREMIUM', avgSpend: 1750, homeLocation: 'Madrid, Spain', primaryDevice: 'iPad Pro / Chrome', regularBeneficiaries: ['BEN-IBERDROLA-ES', 'BEN-MERCADONA-ES', 'BEN-BBVA-VALORES'] }
];

const TRANSACTION_TYPES: TransactionType[] = ['TRANSFER', 'CARD_PAYMENT', 'WIRE', 'ATM_WITHDRAWAL', 'ONLINE_PURCHASE'];
const CHANNELS: ChannelType[] = ['MOBILE_APP', 'WEB_BANKING', 'API', 'POS', 'BRANCH'];

export function generateSyntheticDataset(targetCount: number = 1000): Transaction[] {
  const transactions: Transaction[] = [];
  const baseTime = new Date('2026-09-15T08:00:00Z').getTime();
  const dayMs = 24 * 60 * 60 * 1000;

  let currentId = 1000;

  // 1. Generate ~860 baseline legitimate transactions across 30 days
  for (let i = 0; i < 860; i++) {
    currentId++;
    const cust = CUSTOMER_PROFILES[i % CUSTOMER_PROFILES.length];
    
    // Spread timestamp across 30 days
    const dayOffset = (i * 0.035) % 30;
    const hour = 7 + (i % 14); // 7am to 9pm local
    const minute = (i * 17) % 60;
    const second = (i * 23) % 60;
    const txTime = new Date(baseTime + dayOffset * dayMs + (hour * 3600 + minute * 60 + second) * 1000);

    // Realistic normal amount distribution around cust.avgSpend
    const variation = 0.4 + ((i * 31) % 100) / 75; // 0.4 to 1.7x
    let amount = Number((cust.avgSpend * variation).toFixed(2));
    if (amount < 5) amount = 12.50;

    const isCard = (i % 3 === 0);
    const txType: TransactionType = isCard ? 'CARD_PAYMENT' : (i % 5 === 0 ? 'TRANSFER' : (i % 7 === 0 ? 'ONLINE_PURCHASE' : 'ATM_WITHDRAWAL'));
    const channel: ChannelType = isCard ? 'POS' : (i % 2 === 0 ? 'MOBILE_APP' : 'WEB_BANKING');
    const beneficiaryId = cust.regularBeneficiaries[i % cust.regularBeneficiaries.length];

    transactions.push({
      transactionId: `TXN${currentId}`,
      customerId: cust.id,
      amount,
      timestamp: txTime.toISOString(),
      transactionType: txType,
      beneficiaryId,
      beneficiaryName: getBeneficiaryDisplayName(beneficiaryId),
      isNewBeneficiary: false,
      location: cust.homeLocation,
      channel,
      deviceRiskScore: Math.floor((i * 13) % 18), // Low device risk (0-17)
      deviceType: cust.primaryDevice,
      deviceIp: `198.51.100.${(i % 150) + 1}`,
      fraudLabel: 0,
      description: `Routine ${txType.toLowerCase().replace('_', ' ')}`
    });
  }

  // 2. Generate ~50 Legitimate Edge Cases (Benign anomalies to test false-positive avoidance)
  // These look unusual (high amount, new beneficiary, travel) but have legitimate context
  const edgeCases: Partial<Transaction>[] = [
    // Vacation travel with notification
    { customerId: 'CUST-1001', amount: 450.00, location: 'London, UK', isNewBeneficiary: true, beneficiaryId: 'BEN-HOTEL-LON', description: 'Overseas Hotel Booking (Travel Alert Active)' },
    { customerId: 'CUST-1001', amount: 120.00, location: 'London, UK', isNewBeneficiary: true, beneficiaryId: 'BEN-RESTO-LON', description: 'Restaurant London West End' },
    // Home improvement / annual tax payment
    { customerId: 'CUST-1002', amount: 14800.00, location: 'San Francisco, USA', isNewBeneficiary: true, beneficiaryId: 'BEN-ESCROW-SF', description: 'Annual Property Tax / Escrow Payment' },
    { customerId: 'CUST-1003', amount: 18500.00, location: 'Chicago, USA', isNewBeneficiary: true, beneficiaryId: 'BEN-EQUIP-ILL', description: 'Commercial Kitchen Refrigeration Purchase' },
    // Wedding gift to family member
    { customerId: 'CUST-1004', amount: 2500.00, location: 'London, UK', isNewBeneficiary: true, beneficiaryId: 'BEN-FAMILY-WED', description: 'Wedding Gift wire to Sister' },
    // Senior purchasing medical equipment
    { customerId: 'CUST-1007', amount: 890.00, location: 'Boston, USA', isNewBeneficiary: true, beneficiaryId: 'BEN-MED-EQUIP', description: 'Prescription mobility equipment' },
    // Annual insurance premium
    { customerId: 'CUST-1010', amount: 3400.00, location: 'Stockholm, Sweden', isNewBeneficiary: true, beneficiaryId: 'BEN-TRYGG-HANS', description: 'Comprehensive Annual Home Insurance' }
  ];

  edgeCases.forEach((ec, idx) => {
    currentId++;
    const cust = CUSTOMER_PROFILES.find(c => c.id === ec.customerId)!;
    const txTime = new Date(baseTime + (10 + idx) * dayMs + (14 * 3600 + idx * 600) * 1000);
    transactions.push({
      transactionId: `TXN${currentId}`,
      customerId: ec.customerId!,
      amount: ec.amount!,
      timestamp: txTime.toISOString(),
      transactionType: ec.amount! > 5000 ? 'WIRE' : 'TRANSFER',
      beneficiaryId: ec.beneficiaryId!,
      beneficiaryName: getBeneficiaryDisplayName(ec.beneficiaryId!),
      isNewBeneficiary: ec.isNewBeneficiary || false,
      location: ec.location || cust.homeLocation,
      channel: 'WEB_BANKING',
      deviceRiskScore: 12 + (idx % 10),
      deviceType: cust.primaryDevice,
      deviceIp: `198.51.100.${200 + idx}`,
      fraudLabel: 0, // Legitimate!
      description: ec.description || 'Verified customer transaction'
    });
  });

  // 3. Generate Simulated Fraud Clusters & Attacks (Ground truth fraudLabel = 1, ~50 transactions)
  // Pattern A: Account Takeover (ATO) Burst on CUST-1001
  const atoTime = new Date(baseTime + 18 * dayMs + 3 * 3600 * 1000); // 3am overnight
  const atoAmounts = [4850.00, 4900.00, 4800.00, 3950.00];
  atoAmounts.forEach((amt, idx) => {
    currentId++;
    const t = new Date(atoTime.getTime() + idx * 4 * 60 * 1000); // Every 4 mins
    transactions.push({
      transactionId: `TXN${currentId}`,
      customerId: 'CUST-1001',
      amount: amt,
      timestamp: t.toISOString(),
      transactionType: 'WIRE',
      beneficiaryId: 'BEN-OFFSHORE-CRYPTO',
      beneficiaryName: 'BitVenture Liquidators Ltd',
      isNewBeneficiary: true,
      location: 'Lagos, Nigeria', // Sudden foreign location jump
      channel: 'WEB_BANKING',
      deviceRiskScore: 89, // High device risk (emulator / proxy)
      deviceType: 'Unknown Android Emulated / Tor Exit Node',
      deviceIp: '185.220.101.45',
      fraudLabel: 1,
      description: 'Urgent Wire Transfer Authorization'
    });
  });

  // Pattern B: Structuring / Smurfing just under $10,000 reporting threshold (CUST-1008)
  const smurfTime = new Date(baseTime + 21 * dayMs + 11 * 3600 * 1000);
  const smurfAmounts = [9850.00, 9920.00, 9780.00, 9900.00, 9650.00];
  smurfAmounts.forEach((amt, idx) => {
    currentId++;
    const t = new Date(smurfTime.getTime() + idx * 18 * 60 * 1000); // within 90 minutes
    transactions.push({
      transactionId: `TXN${currentId}`,
      customerId: 'CUST-1008',
      amount: amt,
      timestamp: t.toISOString(),
      transactionType: 'WIRE',
      beneficiaryId: 'BEN-SHELL-PANAMA',
      beneficiaryName: 'Pacific Holdings Intermediary',
      isNewBeneficiary: true,
      location: 'Miami, USA',
      channel: 'WEB_BANKING',
      deviceRiskScore: 65,
      deviceType: 'Dell XPS / Chrome',
      deviceIp: '198.51.100.88',
      fraudLabel: 1,
      description: 'Consulting Advisory Retainer Split'
    });
  });

  // Pattern C: Mule Account Rapid Funneling (Multiple distinct senders funneling into BEN-MULE-991)
  const muleTime = new Date(baseTime + 23 * dayMs + 15 * 3600 * 1000);
  const muleSenders = ['CUST-1005', 'CUST-1009', 'CUST-1012', 'CUST-1015', 'CUST-1020', 'CUST-1022'];
  muleSenders.forEach((senderId, idx) => {
    currentId++;
    const cust = CUSTOMER_PROFILES.find(c => c.id === senderId)!;
    const t = new Date(muleTime.getTime() + idx * 8 * 60 * 1000); // within 45 mins
    transactions.push({
      transactionId: `TXN${currentId}`,
      customerId: senderId,
      amount: 2450.00, // Identical rapid round numbers
      timestamp: t.toISOString(),
      transactionType: 'TRANSFER',
      beneficiaryId: 'BEN-MULE-991',
      beneficiaryName: 'Apex QuickPay Escrow',
      isNewBeneficiary: true,
      location: cust.homeLocation,
      channel: 'MOBILE_APP',
      deviceRiskScore: 78,
      deviceType: 'Virtual Device Host / Proxy',
      deviceIp: '104.244.72.115',
      fraudLabel: 1,
      description: 'P2P Quick Clearance Fund Transfer'
    });
  });

  // Pattern D: Geo-Impossible Velocity (CUST-1002 in San Francisco, then Hong Kong 20 mins later)
  const geoTime = new Date(baseTime + 25 * dayMs + 14 * 3600 * 1000);
  currentId++;
  transactions.push({
    transactionId: `TXN${currentId}`,
    customerId: 'CUST-1002',
    amount: 150.00,
    timestamp: geoTime.toISOString(),
    transactionType: 'CARD_PAYMENT',
    beneficiaryId: 'BEN-COFFEE-SF',
    beneficiaryName: 'Blue Bottle Coffee SF',
    isNewBeneficiary: false,
    location: 'San Francisco, USA',
    channel: 'POS',
    deviceRiskScore: 5,
    deviceType: 'Apple Pay / iPhone 15 Pro',
    deviceIp: '198.51.100.12',
    fraudLabel: 0,
    description: 'In-store chip & PIN purchase'
  });

  currentId++;
  const geoTime2 = new Date(geoTime.getTime() + 22 * 60 * 1000); // 22 minutes later in Hong Kong
  transactions.push({
    transactionId: `TXN${currentId}`,
    customerId: 'CUST-1002',
    amount: 8850.00,
    timestamp: geoTime2.toISOString(),
    transactionType: 'ATM_WITHDRAWAL',
    beneficiaryId: 'BEN-ATM-HK-CENTRAL',
    beneficiaryName: 'Central Branch ATM Terminal HK',
    isNewBeneficiary: true,
    location: 'Hong Kong SAR',
    channel: 'ATM',
    deviceRiskScore: 92,
    deviceType: 'Cloned Magnetic Stripe / Standalone ATM',
    deviceIp: '202.125.80.14',
    fraudLabel: 1,
    description: 'Foreign Currency Cash Outburst'
  });

  // Pattern E: High-Velocity Rapid Balance Drain on Senior Account (CUST-1018)
  const drainTime = new Date(baseTime + 27 * dayMs + 22 * 3600 * 1000); // 10pm
  const drainAmounts = [1200.00, 1500.00, 1800.00, 2000.00];
  drainAmounts.forEach((amt, idx) => {
    currentId++;
    const t = new Date(drainTime.getTime() + idx * 3 * 60 * 1000); // every 3 mins
    transactions.push({
      transactionId: `TXN${currentId}`,
      customerId: 'CUST-1018',
      amount: amt,
      timestamp: t.toISOString(),
      transactionType: 'WIRE',
      beneficiaryId: 'BEN-CRYPTO-P2P',
      beneficiaryName: 'Global Peer Remittance',
      isNewBeneficiary: true,
      location: 'Manchester, UK',
      channel: 'WEB_BANKING',
      deviceRiskScore: 84,
      deviceType: 'Headless Chromium / Automated Script',
      deviceIp: '45.154.255.77',
      fraudLabel: 1,
      description: 'Expedited Express Transfer'
    });
  });

  // Fill up remaining to targetCount (around 1000) with ordinary retail noise
  while (transactions.length < targetCount) {
    currentId++;
    const cust = CUSTOMER_PROFILES[transactions.length % CUSTOMER_PROFILES.length];
    const dayOffset = (transactions.length * 0.029) % 30;
    const hour = 8 + (transactions.length % 12);
    const minute = (transactions.length * 13) % 60;
    const txTime = new Date(baseTime + dayOffset * dayMs + (hour * 3600 + minute * 60) * 1000);
    const amount = Number((cust.avgSpend * (0.5 + (transactions.length % 50) / 45)).toFixed(2));
    const ben = cust.regularBeneficiaries[transactions.length % cust.regularBeneficiaries.length];

    transactions.push({
      transactionId: `TXN${currentId}`,
      customerId: cust.id,
      amount: Math.max(15, amount),
      timestamp: txTime.toISOString(),
      transactionType: 'TRANSFER',
      beneficiaryId: ben,
      beneficiaryName: getBeneficiaryDisplayName(ben),
      isNewBeneficiary: false,
      location: cust.homeLocation,
      channel: 'MOBILE_APP',
      deviceRiskScore: 10 + (transactions.length % 15),
      deviceType: cust.primaryDevice,
      deviceIp: `198.51.100.${(transactions.length % 180) + 1}`,
      fraudLabel: 0,
      description: 'Regular payment'
    });
  }

  // Sort chronologically
  return transactions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

function getBeneficiaryDisplayName(id: string): string {
  const map: Record<string, string> = {
    'BEN-GROCERY-01': 'Whole Foods Market NY',
    'BEN-UTIL-NY': 'ConEdison Electric NY',
    'BEN-LANDLORD-1': 'Metropolitan Realty Partners',
    'BEN-INVEST-SF': 'Schwab Institutional Brokerage',
    'BEN-MORTGAGE-SF': 'First Republic Mortgage',
    'BEN-AUTO-LEASE': 'Tesla Financial Services',
    'BEN-SUPPLIER-CH': 'Midwest Industrial Supplies',
    'BEN-PAYROLL-CH': 'ADP Payroll Processing',
    'BEN-TAX-FED': 'IRS Electronic Federal Tax',
    'BEN-TFL-METRO': 'Transport for London',
    'BEN-TESCO-UK': 'Tesco Superstores UK',
    'BEN-RENT-LON': 'Mayfair Properties Ltd',
    'BEN-CARREFOUR': 'Carrefour Supermarché',
    'BEN-EDF-POWER': 'Électricité de France',
    'BEN-METRO-PARIS': 'RATP Billetterie Paris',
    'BEN-DBS-WEALTH': 'DBS Private Wealth Mgmt',
    'BEN-CONDO-SG': 'Marina Bay Residences MCST',
    'BEN-CLUB-SG': 'Singapore Cricket Club',
    'BEN-PHARM-BOS': 'CVS Pharmacy Boston',
    'BEN-EVERSOURCE': 'Eversource Energy Corp',
    'BEN-MARKET-BOS': 'Trader Joe\'s Boston',
    'BEN-OFFSHORE-CRYPTO': 'BitVenture Liquidators Ltd',
    'BEN-SHELL-PANAMA': 'Pacific Holdings Intermediary',
    'BEN-MULE-991': 'Apex QuickPay Escrow',
    'BEN-ATM-HK-CENTRAL': 'Central Branch ATM Terminal HK',
    'BEN-CRYPTO-P2P': 'Global Peer Remittance'
  };
  return map[id] || `Merchant / Beneficiary ${id}`;
}

export function transactionsToCSV(transactions: Transaction[]): string {
  const headers = [
    'transactionId',
    'customerId',
    'amount',
    'timestamp',
    'transactionType',
    'beneficiaryId',
    'beneficiaryName',
    'isNewBeneficiary',
    'location',
    'channel',
    'deviceRiskScore',
    'deviceType',
    'deviceIp',
    'fraudLabel',
    'description'
  ];

  const rows = transactions.map(t => [
    t.transactionId,
    t.customerId,
    t.amount.toFixed(2),
    t.timestamp,
    t.transactionType,
    t.beneficiaryId,
    `"${(t.beneficiaryName || '').replace(/"/g, '""')}"`,
    t.isNewBeneficiary ? 'true' : 'false',
    `"${(t.location || '').replace(/"/g, '""')}"`,
    t.channel,
    t.deviceRiskScore ?? 0,
    `"${(t.deviceType || '').replace(/"/g, '""')}"`,
    t.deviceIp || '',
    t.fraudLabel ?? 0,
    `"${(t.description || '').replace(/"/g, '""')}"`
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}
