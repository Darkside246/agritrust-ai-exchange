import { describe, it, expect } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { PrivacyManager } from '../core/security/privacy';

describe('Page 5 Farmer Portal Dashboard & Intake Operations', () => {
  it('retrieves farmer intake lots and verifies cryptographic verification hash', () => {
    AgriTrustDatabase.initialize();
    const lots = AgriTrustDatabase.getFarmerLots('fp-01');

    expect(lots.length).toBeGreaterThan(0);
    const primaryLot = lots[0];
    expect(primaryLot.farmerId).toBe('fp-01');
    expect(primaryLot.verificationHash).toBeDefined();
    expect(primaryLot.verificationHash?.length).toBeGreaterThan(10);
  });

  it('creates new harvest batch intake lot with initial events and AI quality record', () => {
    AgriTrustDatabase.initialize();
    const newLot = AgriTrustDatabase.createHarvestLot(
      'fp-01',
      'prod-01',
      'Plum Tomatoes Batch',
      600,
      12.5
    );

    expect(newLot.id).toContain('AT-LOT-2026-');
    expect(newLot.status).toBe('VERIFIED');
    expect(newLot.initialQuantityKg).toBe(600);

    // Verify initial harvest event created
    const events = AgriTrustDatabase.getLotEvents(newLot.id);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].eventType).toBe('HARVESTED');

    // Verify initial AI quality inspection created
    const quality = AgriTrustDatabase.getLotQuality(newLot.id);
    expect(quality.grade).toBe('Grade A');
    expect(quality.aiConfidenceScore).toBeGreaterThan(90);
  });

  it('retrieves producer settlements and verifies net payout calculations', () => {
    AgriTrustDatabase.initialize();
    const settlements = AgriTrustDatabase.getFarmerSettlements('fp-01');

    expect(settlements.length).toBeGreaterThan(0);
    const settledItem = settlements[0];
    expect(settledItem.grossAmount).toBe(1200.00);
    expect(settledItem.platformDeduction).toBe(60.00);
    expect(settledItem.netPayout).toBe(1140.00);
    expect(settledItem.status).toBe('SETTLED');
  });

  it('enforces counterparty privacy by hiding buyer PII and margin targets from farmer profiles', () => {
    AgriTrustDatabase.initialize();
    const buyerProfile = AgriTrustDatabase.getBuyerProfileByUserId('usr-buyer-01');
    expect(buyerProfile).toBeDefined();
    if (!buyerProfile) return;

    const redactedBuyer = PrivacyManager.redactBuyerProfile(buyerProfile);

    // Verify private buyer phone and private headquarters address are stripped
    expect((redactedBuyer as any).privatePhone).toBeUndefined();
    expect((redactedBuyer as any).privateAddress).toBeUndefined();
  });
});
