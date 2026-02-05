/**
 * @file audit.ts
 * @deprecated Legacy facade. Please import from 'services/scraperService', 'services/aiService', or 'controllers/auditController' directly.
 */

export { performScrape, performPerformanceCheck } from './services/scraperService';
export { performAnalysis } from './services/aiService';
export { handleAuditRequest } from './controllers/auditController';
