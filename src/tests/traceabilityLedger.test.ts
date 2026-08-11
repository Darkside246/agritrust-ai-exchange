import { describe, it, expect } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { PrivacyManager } from '../core/security/privacy';

describe('Deep Lot Traceability & Provenance Ledger', () => {
  it('fetches AI spectrovision quality analysis and certified document records', () => {
    AgriTrustDatabase.initialize();
    const lotId = 'AT-LOT-2026-000922';

    const quality = AgriTrustDatabase.getLotQuality(lotId);
    expect(quality).toBeDefined();
    expect(quality.grade).toBe('Grade A');
    expect(quality.aiConfidenceScore).toBe(98.4);
    expect(quality.status).toBe('ACCEPTED');

    const docs = AgriTrustDatabase.getLotDocuments(lotId);
    expect(docs.length).toBeGreaterThan(0);
    expect(docs.some((d) => d.documentType === 'QUALITY_CERT')).toBe(true);
    expect(docs.some((d) => d.documentType === 'PHYTOSANITARY')).toBe(true);
  });

  it('strictly redacts counterparty PII on deep provenance views', () => {
    AgriTrustDatabase.initialize();
    const lot = AgriTrustDatabase.getLotById('AT-LOT-2026-000922');
    expect(lot).toBeDefined();
    if (!lot) return;

    const publicView = PrivacyManager.sanitizeLotForPublic(lot);

    expect(publicView.id).toBe('AT-LOT-2026-000922');
    expect(publicView.publicRegion).toBe('Western Agricultural Zone 4');
    expect((publicView as any).farmerId).toBeUndefined();
    expect((publicView as any).privatePhone).toBeUndefined();
    expect((publicView as any).privateAddress).toBeUndefined();
    expect((publicView as any).privateGpsLat).toBeUndefined();
  });
});
