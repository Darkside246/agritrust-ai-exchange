import { describe, it, expect } from 'vitest';
import { PrivacyManager } from '../core/security/privacy';
import { Lot, FarmerProfile } from '../core/database/schema';

describe('Privacy & Counterparty Anonymity', () => {
  const sampleLot: Lot = {
    id: 'AT-LOT-2026-000922',
    productId: 'prod-01',
    harvestId: 'harv-101',
    farmerId: 'fp-secret-99',
    cropName: 'Tomatoes',
    varietyName: 'Roma',
    commodity: 'Tomatoes',
    variety: 'Roma',
    description: 'Sample Grade A tomatoes.',
    harvestDate: '2026-08-08',
    grade: 'Grade A',
    availableStock: 800,
    initialQuantityKg: 1000,
    availableQuantityKg: 800,
    unit: 'kg',
    moq: 50,
    moqUnit: 'kg',
    wholesalePrice: 2.40,
    currency: 'USD',
    productImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea',
    availability: true,
    traceabilityStatus: 'VERIFIED',
    qualityStatus: 'PASSED',
    procurementStatus: 'AVAILABLE',
    status: 'VERIFIED',
    publicationStatus: 'PUBLISHED',
    publicVisibility: true,
    createdAt: '2026-08-08T00:00:00Z',
    updatedAt: '2026-08-08T00:00:00Z',
    verificationHash: 'vhash_123',
    publicRegion: 'Western Agricultural Zone 4',
  };

  it('sanitizes public lot payload without exposing farmer ID', () => {
    const publicView = PrivacyManager.sanitizeLotForPublic(sampleLot);

    expect(publicView.id).toBe('AT-LOT-2026-000922');
    expect(publicView.cropName).toBe('Tomatoes');
    expect(publicView.publicRegion).toBe('Western Agricultural Zone 4');
    expect((publicView as any).farmerId).toBeUndefined();
    expect((publicView as any).privateGpsLat).toBeUndefined();
  });

  it('redacts sensitive PII from farmer profiles', () => {
    const sensitiveProfile: FarmerProfile = {
      id: 'fp-01',
      userId: 'usr-farmer-01',
      organisationId: 'org-01',
      businessName: 'Holder Produce',
      contactName: 'Marcus Holder',
      privatePhone: '+1-555-019-4821',
      privateAddress: '742 Private Lane',
      privateGpsLat: 13.19,
      privateGpsLng: -59.54,
      publicRegion: 'Western Agricultural Zone 4',
      trustScore: 98,
      verified: true,
      createdAt: '2026-01-01',
    };

    const redacted = PrivacyManager.redactFarmerProfile(sensitiveProfile);

    expect(redacted.publicRegion).toBe('Western Agricultural Zone 4');
    expect(redacted.trustScore).toBe(98);
    expect(redacted.privatePhone).toBeUndefined();
    expect(redacted.privateAddress).toBeUndefined();
    expect(redacted.privateGpsLat).toBeUndefined();
  });
});
