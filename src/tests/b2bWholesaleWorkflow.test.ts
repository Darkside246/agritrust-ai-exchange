import { describe, it, expect, beforeEach } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { AuditLedger } from '../core/audit/auditLedger';

describe('AGRITRUST B2B WHOLESALE & SUPPLY MANAGEMENT WORKFLOW (SECTION 60 ACCEPETANCE TESTS A - J)', () => {
  beforeEach(() => {
    AgriTrustDatabase.initialize();
  });

  it('Test A: Seller Supply Submission Intake', () => {
    const submission = AgriTrustDatabase.createSupplySubmission(
      {
        commodity: 'Sweet Peppers',
        variety: 'California Wonder Red',
        description: 'Greenhouse crisp red bell peppers packed in 15kg crates.',
        expectedGrade: 'Grade A',
        estimatedQuantity: 600,
        unit: 'crate',
        minimumQuantity: 10,
        expectedHarvestDate: '2026-08-15',
      },
      'fp-01'
    );

    expect(submission.id).toMatch(/^SUP-2026-\d{6}$/);
    expect(submission.status).toBe('UNDER_REVIEW');
    expect(submission.commodity).toBe('Sweet Peppers');
    expect(submission.estimatedQuantity).toBe(600);
  });

  it('Test B & C: Admin Supply Approval & Approved != Published Verification', () => {
    // 1. Submit supply
    const submission = AgriTrustDatabase.createSupplySubmission(
      {
        commodity: 'Cucumbers',
        variety: 'English Seedless',
        estimatedQuantity: 1200,
        unit: 'kg',
      },
      'fp-01'
    );

    // 2. Admin approves supply
    const createdLot = AgriTrustDatabase.approveSupplySubmissionAndCreateLot(submission.id, 'sys-admin');

    expect(submission.status).toBe('APPROVED');
    expect(createdLot.id).toMatch(/^AT-LOT-2026-\d{6}$/);

    // 3. MANDATORY RULE VERIFICATION: Approved != Published (Lot MUST enter inventory as HIDDEN)
    expect(createdLot.publicationStatus).toBe('HIDDEN');
    expect(createdLot.publicVisibility).toBe(false);

    // 4. Verify public marketplace query excludes HIDDEN lot
    const publicAvailableLots = AgriTrustDatabase.getAvailableLots();
    const isVisiblePublicly = publicAvailableLots.some((l) => l.id === createdLot.id);
    expect(isVisiblePublicly).toBe(false);
  });

  it('Test D: Product Catalogue Manual Creation', () => {
    const product = AgriTrustDatabase.createProductManual(
      {
        name: 'Hydroponic Butterhead Lettuce',
        variety: 'Butterhead Crisp',
        category: 'Fresh Leafy Greens',
        pricePerUnit: 3.20,
        moqUnits: 25,
        availableUnits: 450,
      },
      'sys-admin'
    );

    expect(product.id).toMatch(/^prod-manual-\d+$/);
    expect(product.name).toBe('Hydroponic Butterhead Lettuce');

    // Associated lot must be HIDDEN
    const associatedLot = AgriTrustDatabase.getLotById(product.lotId);
    expect(associatedLot).toBeDefined();
    expect(associatedLot?.publicationStatus).toBe('HIDDEN');
  });

  it('Test E: Commercial Profitability & Margin Engine', () => {
    // Below 20% target margin: selling $2.10 vs cost $1.60 + $0.25 + $0.15 = $2.00 -> 4.76% margin
    const lowMargin = AgriTrustDatabase.calculateLotProfitability('lot-test-1', 2.10, 1.60, 0.25, 0.15, 20.0);
    expect(lowMargin.marginPercent).toBeCloseTo(4.76, 1);
    expect(lowMargin.satisfiesTargetMargin).toBe(false);

    // Above 20% target margin: selling $2.80 vs cost $2.00 -> 28.57% margin
    const highMargin = AgriTrustDatabase.calculateLotProfitability('lot-test-2', 2.80, 1.60, 0.25, 0.15, 20.0);
    expect(highMargin.marginPercent).toBeCloseTo(28.57, 1);
    expect(highMargin.satisfiesTargetMargin).toBe(true);
  });

  it('Test F: Commercial Buyers Directory', () => {
    const buyers = AgriTrustDatabase.getAllBuyers();

    expect(buyers.length).toBeGreaterThanOrEqual(3);
    const buyerNames = buyers.map((b) => b.businessName);
    expect(buyerNames).toContain('Island Fresh Hospitality Group');
    expect(buyerNames).toContain('Coral Bay Hotel & Resort');
    expect(buyerNames).toContain('Barbados Fresh Foods Distributor');
  });

  it('Test G: Registered Sellers Directory', () => {
    const sellers = AgriTrustDatabase.getAllSellers();

    expect(sellers.length).toBeGreaterThanOrEqual(3);
    const sellerNames = sellers.map((s) => s.businessName);
    expect(sellerNames).toContain('Holder Agricultural Produce');
    expect(sellerNames).toContain('Sunrise Agricultural Cooperative');
    expect(sellerNames).toContain('Island Harvest Hydroponics');
  });

  it('Test H: Intermediary Privacy Shield', () => {
    const availableLots = AgriTrustDatabase.getAvailableLots();

    availableLots.forEach((lot) => {
      // Public lot must display only public region, never private GPS or phone
      expect(lot.publicRegion).toBeDefined();
      expect((lot as any).privatePhone).toBeUndefined();
      expect((lot as any).privateGpsLat).toBeUndefined();
    });
  });

  it('Test I: Audit Ledger Logging for Supply Mutations', () => {
    const submission = AgriTrustDatabase.createSupplySubmission({ commodity: 'Carrots' }, 'fp-01');
    AgriTrustDatabase.approveSupplySubmissionAndCreateLot(submission.id, 'sys-admin');

    const logs = AuditLedger.getOperationalLogs();
    const actions = logs.map((l) => l.action);

    expect(actions).toContain('SUBMIT_SUPPLY');
    expect(actions).toContain('APPROVE_SUPPLY_CREATE_LOT');
  });

  it('Test J: Commercial Publication & Public Marketplace Sync', () => {
    // 1. Submit & Approve Lot (HIDDEN state)
    const submission = AgriTrustDatabase.createSupplySubmission({ commodity: 'Eggplants' }, 'fp-01');
    const createdLot = AgriTrustDatabase.approveSupplySubmissionAndCreateLot(submission.id, 'sys-admin');
    expect(createdLot.publicationStatus).toBe('HIDDEN');

    // 2. Admin publishes the lot
    const publishedLot = AgriTrustDatabase.updateLotPublicationStatus(createdLot.id, 'PUBLISHED', 'sys-admin', 'Commercial preparation complete.');
    expect(publishedLot.publicationStatus).toBe('PUBLISHED');
    expect(publishedLot.publicVisibility).toBe(true);

    // 3. Public marketplace query now includes the lot
    const publicAvailableLots = AgriTrustDatabase.getAvailableLots();
    const isNowVisible = publicAvailableLots.some((l) => l.id === publishedLot.id);
    expect(isNowVisible).toBe(true);
  });
});
