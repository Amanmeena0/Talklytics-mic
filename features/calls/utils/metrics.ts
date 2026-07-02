// features/calls/utils/metrics.ts

export interface BantAssessment {
  bantBudget: string;
  bantBudgetMet: boolean;
  bantAuthority: string;
  bantAuthorityMet: boolean;
  bantNeed: string;
  bantNeedMet: boolean;
  bantTimeline: string;
  bantTimelineMet: boolean;
}

export interface ClientTitleInfo {
  title: string;
  clientName: string;
}

/** Calculates the mathematical average for a specific key in engagement records */
export function calculateAverage(records: any[], key: string): number {
  if (!records || records.length === 0) return 0;
  const sum = records.reduce((acc: number, r: any) => acc + (r[key] || 0), 0);
  return parseFloat((sum / records.length).toFixed(2));
}

/** Calculates call session duration (max timestamp from records) */
export function calculateDuration(records: any[]): number {
  if (!records || records.length === 0) return 0;
  return Math.max(...records.map((r: any) => r.timestamp || 0));
}

/** Determines dominant sentiment value based on occurrence frequency */
export function determineDominantSentiment(records: any[]): string {
  if (!records || records.length === 0) return 'Neutral';
  
  const freq: Record<string, number> = {};
  records.forEach((r: any) => {
    const s = r.sentiment || 'Neutral';
    freq[s] = (freq[s] || 0) + 1;
  });
  
  let max = 0;
  let dominant = 'Neutral';
  Object.entries(freq).forEach(([k, v]) => {
    if (v > max) {
      max = v;
      dominant = k;
    }
  });
  
  return dominant;
}

/** Assesses dialogue intent triggers and scans transcript keywords to match BANT criteria */
export function evaluateBantCriteria(records: any[]): BantAssessment {
  let bantBudgetMet = false;
  let bantAuthorityMet = false;
  let bantNeedMet = false;
  let bantTimelineMet = false;

  if (records && records.length > 0) {
    records.forEach((r: any) => {
      const txt = (r.transcript || '').toLowerCase();
      const intents = (r.detected_intents || []).map((i: string) => i.toUpperCase());
      
      if (intents.includes('PRICING') || txt.includes('price') || txt.includes('budget')) {
        bantBudgetMet = true;
      }
      if (txt.includes('decision') || txt.includes('approve') || txt.includes('authority')) {
        bantAuthorityMet = true;
      }
      if (intents.includes('INFORMATION') || txt.includes('need') || txt.includes('want')) {
        bantNeedMet = true;
      }
      if (intents.includes('COMMITMENT') || txt.includes('timeline') || txt.includes('schedule')) {
        bantTimelineMet = true;
      }
    });
  }

  return {
    bantBudget: bantBudgetMet ? 'Pricing Discussion Detected' : 'No Budget Details',
    bantBudgetMet,
    bantAuthority: bantAuthorityMet ? 'Commitment Signals Found' : 'Authority Unverified',
    bantAuthorityMet,
    bantNeed: bantNeedMet ? 'Active Inquiry Detected' : 'No Clear Need',
    bantNeedMet,
    bantTimeline: bantTimelineMet ? 'Urgency Indicators Present' : 'No Timeline Discussed',
    bantTimelineMet,
  };
}

/** Extracts the client name and cleanses the call title based on separator syntax */
export function parseClientName(title: string): ClientTitleInfo {
  let clientName = 'Prospective Client';
  let displayTitle = title || '';
  
  if (title && title.includes(' - ')) {
    const parts = title.split(' - ');
    displayTitle = parts[0];
    clientName = parts.slice(1).join(' - ');
  }
  
  return {
    title: displayTitle,
    clientName,
  };
}
