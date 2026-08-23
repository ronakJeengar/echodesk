import { describe, it, expect } from 'vitest';
import { IndustryVocabularyService } from '../src/services/industry-vocabulary.service.js';
import { LLMService } from '../src/services/llm.service.js';

describe('Domain Extraction & CRM Integration Tests', () => {
  it('should extract Plumbing service visit with parts and action items', async () => {
    const llm = new LLMService();
    const transcript =
      'Finished service call for Mark Henderson at 742 Evergreen Terrace. Main water pressure was 95 PSI. Replaced the faulty pressure reducing valve with a new 3/4 inch PRV valve. Quoted total was $650.';

    const extraction = await llm.extractEntities(transcript, { industry: 'Plumbing' });

    expect(extraction.customer?.name).toBe('Mark Henderson');
    expect(extraction.customer?.address).toBe('742 Evergreen Terrace');
    expect(extraction.financials?.quotedAmount).toBe(650.0);
    expect(extraction.partsAndServices?.some((p) => p.name.includes('PRV'))).toBe(true);
  });

  it('should extract Electrical service panel upgrade with permit task', async () => {
    const llm = new LLMService();
    const transcript =
      'Completed inspection for David Ramirez at 1204 Oak Ridge Way. Upgraded the main subpanel to a 200 amp Square D breaker panel. Quoted amount was $1450. Tech labor was 4 hours.';

    const extraction = await llm.extractEntities(transcript, { industry: 'Electrical' });

    expect(extraction.customer?.name).toBe('David Ramirez');
    expect(extraction.customer?.address).toBe('1204 Oak Ridge Way');
    expect(extraction.financials?.quotedAmount).toBe(1450.0);
    expect(extraction.job?.laborHours).toBe(4.0);
  });
});
