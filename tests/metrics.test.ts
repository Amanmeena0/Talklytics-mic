import { describe, it, expect } from 'vitest';
import { 
  calculateAverage, 
  calculateDuration, 
  determineDominantSentiment, 
  evaluateBantCriteria, 
  parseClientName 
} from '@/features/calls/utils/metrics';

describe('Metrics Utilities', () => {
  describe('calculateAverage', () => {
    it('returns 0 for empty or null records', () => {
      expect(calculateAverage([], 'score')).toBe(0);
      expect(calculateAverage(null as any, 'score')).toBe(0);
    });

    it('calculates average score correctly', () => {
      const records = [
        { score: 3.5 },
        { score: 4.5 },
        { score: 1.0 }
      ];
      expect(calculateAverage(records, 'score')).toBe(3.0);
    });

    it('handles decimal precision formatting', () => {
      const records = [
        { score: 4.123 },
        { score: 4.567 }
      ];
      expect(calculateAverage(records, 'score')).toBe(4.35); // (4.123 + 4.567) / 2 = 4.345 -> 4.35
    });
  });

  describe('calculateDuration', () => {
    it('returns 0 for empty records', () => {
      expect(calculateDuration([])).toBe(0);
    });

    it('finds maximum timestamp correctly', () => {
      const records = [
        { timestamp: 12 },
        { timestamp: 120 },
        { timestamp: 45 }
      ];
      expect(calculateDuration(records)).toBe(120);
    });
  });

  describe('determineDominantSentiment', () => {
    it('returns Neutral for empty records', () => {
      expect(determineDominantSentiment([])).toBe('Neutral');
    });

    it('calculates dominant sentiment correctly', () => {
      const records = [
        { sentiment: 'Positive' },
        { sentiment: 'Neutral' },
        { sentiment: 'Positive' },
        { sentiment: 'Negative' }
      ];
      expect(determineDominantSentiment(records)).toBe('Positive');
    });
  });

  describe('evaluateBantCriteria', () => {
    it('identifies pricing intent and budget keywords', () => {
      const records = [{ transcript: 'What is your budget?', detected_intents: ['PRICING'] }];
      const result = evaluateBantCriteria(records);
      expect(result.bantBudgetMet).toBe(true);
      expect(result.bantBudget).toBe('Pricing Discussion Detected');
    });

    it('identifies authority keywords', () => {
      const records = [{ transcript: 'I need to get approval from the decision maker.', detected_intents: [] }];
      const result = evaluateBantCriteria(records);
      expect(result.bantAuthorityMet).toBe(true);
      expect(result.bantAuthority).toBe('Commitment Signals Found');
    });

    it('identifies need keywords', () => {
      const records = [{ transcript: 'We have a strong need for integration.', detected_intents: [] }];
      const result = evaluateBantCriteria(records);
      expect(result.bantNeedMet).toBe(true);
    });

    it('identifies timeline keywords', () => {
      const records = [{ transcript: 'We are looking to schedule a launch timeline.', detected_intents: [] }];
      const result = evaluateBantCriteria(records);
      expect(result.bantTimelineMet).toBe(true);
    });
  });

  describe('parseClientName', () => {
    it('handles titles with client names separated by dash', () => {
      const { title, clientName } = parseClientName('Discovery Call - Acme Corp');
      expect(title).toBe('Discovery Call');
      expect(clientName).toBe('Acme Corp');
    });

    it('handles title strings without separators', () => {
      const { title, clientName } = parseClientName('Discovery Call');
      expect(title).toBe('Discovery Call');
      expect(clientName).toBe('Prospective Client');
    });
  });
});
