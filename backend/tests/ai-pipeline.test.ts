import { describe, it, expect } from 'vitest';
import { STTService } from '../src/services/stt.service.js';
import { LLMService } from '../src/services/llm.service.js';
import { IndustryVocabularyService } from '../src/services/industry-vocabulary.service.js';
import { Sentiment, JobStatus, Priority } from '@prisma/client';

describe('AI Processing Pipeline Tests', () => {
  describe('Industry Vocabulary Boosting', () => {
    it('should return HVAC vocabulary for HVAC industry', () => {
      const vocab = IndustryVocabularyService.getVocabulary('HVAC');
      expect(vocab.keywords).toContain('capacitor');
      expect(vocab.keywords).toContain('45/5 MFD');
      expect(vocab.keywords).toContain('refrigerant R-410A');
    });

    it('should return Plumbing vocabulary for plumbing industry', () => {
      const vocab = IndustryVocabularyService.getVocabulary('Plumbing');
      expect(vocab.keywords).toContain('PEX');
      expect(vocab.keywords).toContain('PRV valve');
    });

    it('should return Electrical vocabulary for electrical industry', () => {
      const vocab = IndustryVocabularyService.getVocabulary('Electrical');
      expect(vocab.keywords).toContain('breaker panel');
      expect(vocab.keywords).toContain('GFCI');
    });
  });

  describe('Speech-to-Text (STT) Service', () => {
    it('should generate transcript with word-level timestamps and duration', async () => {
      const stt = new STTService();
      const result = await stt.transcribe({
        audioKey: 'audio/w-1/rec-1.m4a',
        industry: 'HVAC',
        durationSec: 45,
      });

      expect(result.transcript).toBeDefined();
      expect(result.transcript.length).toBeGreaterThan(20);
      expect(result.wordTimestamps.length).toBeGreaterThan(5);

      const firstWord = result.wordTimestamps[0];
      expect(firstWord).toHaveProperty('word');
      expect(firstWord).toHaveProperty('start');
      expect(firstWord).toHaveProperty('end');
      expect(firstWord).toHaveProperty('confidence');
      expect(firstWord.end).toBeGreaterThan(firstWord.start);
    });
  });

  describe('LLM Structured Entity Extraction', () => {
    it('should extract structured JSON entities from an HVAC transcript', async () => {
      const llm = new LLMService();
      const transcript =
        "Just wrapped up at Sarah Jenkins' office at Apex Logistics. Replaced the 45/5 MFD dual run capacitor on the outdoor condenser unit. Quoted total is $285. Labor was 1.5 hours. Send invoice #4092 by Friday.";

      const extraction = await llm.extractEntities(transcript, { industry: 'HVAC' });

      expect(extraction.summary).toBeDefined();
      expect(extraction.customer?.name).toBe('Sarah Jenkins');
      expect(extraction.customer?.companyName).toBe('Apex Logistics');
      expect(extraction.financials?.quotedAmount).toBe(285.0);
      expect(extraction.partsAndServices?.length).toBeGreaterThan(0);
      expect(extraction.actionItems?.length).toBeGreaterThan(0);
      expect(extraction.sentiment).toBeDefined();
      expect(extraction.confidenceScore).toBeGreaterThanOrEqual(0.9);
    });

    it('should adjust quoted amount when user provides a correction prompt', async () => {
      const llm = new LLMService();
      const transcript =
        "Finished service at Mark Henderson's home. Quoted $285 for the diagnostic.";

      const extraction = await llm.extractEntities(transcript, {
        industry: 'HVAC',
        promptAdjustment: 'The quoted amount was $340 because of emergency weekend labor.',
      });

      expect(extraction.financials?.quotedAmount).toBe(340.0);
    });
  });
});
