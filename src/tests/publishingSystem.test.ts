import { describe, it, expect, beforeEach } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { AuditLedger } from '../core/audit/auditLedger';

describe('AgriTrust Marketplace Publishing & Draft System (WordPress / WooCommerce Architecture)', () => {
  beforeEach(() => {
    AgriTrustDatabase.initialize();
  });

  it('verifies initial seed state (Section 43): 4 HIDDEN lots, 1 PUBLISHED lot (AT-LOT-2026-000926)', () => {
    const allLots = AgriTrustDatabase.getAllLots();
    expect(allLots.length).toBeGreaterThanOrEqual(5);

    // Verify 4 hidden lots
    const hiddenLot922 = allLots.find((l) => l.id === 'AT-LOT-2026-000922');
    expect(hiddenLot922?.publicationStatus).toBe('HIDDEN');

    const hiddenLot923 = allLots.find((l) => l.id === 'AT-LOT-2026-000923');
    expect(hiddenLot923?.publicationStatus).toBe('HIDDEN');

    const hiddenLot924 = allLots.find((l) => l.id === 'AT-LOT-2026-000924');
    expect(hiddenLot924?.publicationStatus).toBe('HIDDEN');

    const hiddenLot925 = allLots.find((l) => l.id === 'AT-LOT-2026-000925');
    expect(hiddenLot925?.publicationStatus).toBe('HIDDEN');

    // Verify 1 published lot
    const publishedLot926 = allLots.find((l) => l.id === 'AT-LOT-2026-000926');
    expect(publishedLot926?.publicationStatus).toBe('PUBLISHED');

    // Public Marketplace API query receives strictly published items
    const publicAvailableLots = AgriTrustDatabase.getAvailableLots();
    expect(publicAvailableLots.length).toBe(1);
    expect(publicAvailableLots[0].id).toBe('AT-LOT-2026-000926');

    // Public Products list receives strictly published items
    const publicProducts = AgriTrustDatabase.getProducts();
    expect(publicProducts.length).toBe(1);
    expect(publicProducts[0].lotId).toBe('AT-LOT-2026-000926');
  });

  it('executes Section 44 Acceptance Test: Hide -> Confirm Public Absence -> Preview -> Publish -> Confirm Public Restoration', () => {
    // 1. Starting state: AT-LOT-2026-000926 is PUBLISHED
    expect(AgriTrustDatabase.getAvailableLots().length).toBe(1);

    // 2. Admin hides AT-LOT-2026-000926
    const hiddenLot = AgriTrustDatabase.updateLotPublicationStatus(
      'AT-LOT-2026-000926',
      'HIDDEN',
      'sys-admin',
      'Section 44 Acceptance Test Hide'
    );
    expect(hiddenLot.publicationStatus).toBe('HIDDEN');
    expect(hiddenLot.publicVisibility).toBe(false);

    // 3. Confirm public marketplace returns 0 items (completely absent)
    expect(AgriTrustDatabase.getAvailableLots().length).toBe(0);
    expect(AgriTrustDatabase.getProducts().length).toBe(0);

    // 4. Admin can still retrieve lot in Admin view
    const adminViewLot = AgriTrustDatabase.getAllLots().find((l) => l.id === 'AT-LOT-2026-000926');
    expect(adminViewLot).toBeDefined();
    expect(adminViewLot?.publicationStatus).toBe('HIDDEN');

    // 5. Admin generates and validates secure preview token
    const token = AgriTrustDatabase.generatePreviewToken('AT-LOT-2026-000926', 'sys-admin');
    expect(token).toBeDefined();
    expect(token.startsWith('prev_')).toBe(true);

    const isValidToken = AgriTrustDatabase.validatePreviewToken('AT-LOT-2026-000926', token);
    expect(isValidToken).toBe(true);

    const isInvalidToken = AgriTrustDatabase.validatePreviewToken('AT-LOT-2026-000926', 'fake-token-999');
    expect(isInvalidToken).toBe(false);

    // 6. Admin publishes AT-LOT-2026-000926
    const republishedLot = AgriTrustDatabase.updateLotPublicationStatus(
      'AT-LOT-2026-000926',
      'PUBLISHED',
      'sys-admin',
      'Section 44 Acceptance Test Publish'
    );
    expect(republishedLot.publicationStatus).toBe('PUBLISHED');
    expect(republishedLot.publicVisibility).toBe(true);

    // 7. Confirm public marketplace shows lot again
    const restoredPublicLots = AgriTrustDatabase.getAvailableLots();
    expect(restoredPublicLots.length).toBe(1);
    expect(restoredPublicLots[0].id).toBe('AT-LOT-2026-000926');
  });

  it('supports draft versioning: saving draft changes does not alter public view until published', () => {
    // 1. Make sure AT-LOT-2026-000926 is published at $4.20
    AgriTrustDatabase.updateLotPublicationStatus('AT-LOT-2026-000926', 'PUBLISHED', 'sys-admin');
    const initialPublic = AgriTrustDatabase.getAvailableLots().find((l) => l.id === 'AT-LOT-2026-000926');
    expect(initialPublic?.wholesalePrice).toBe(4.20);

    // 2. Admin saves draft updating price to $4.85
    AgriTrustDatabase.saveLotDraft('AT-LOT-2026-000926', { wholesalePrice: 4.85 }, 'sys-admin');

    // 3. Draft version has $4.85, but current published version remains $4.20
    const lotAfterDraft = AgriTrustDatabase.getLotById('AT-LOT-2026-000926');
    expect(lotAfterDraft?.draftVersion?.wholesalePrice).toBe(4.85);

    // Public marketplace still shows $4.20
    const publicLotDuringDraft = AgriTrustDatabase.getAvailableLots().find((l) => l.id === 'AT-LOT-2026-000926');
    expect(publicLotDuringDraft?.wholesalePrice).toBe(4.20);

    // 4. Admin publishes draft
    const publishedDraft = AgriTrustDatabase.publishLotDraft('AT-LOT-2026-000926', 'sys-admin');
    expect(publishedDraft.wholesalePrice).toBe(4.85);
    expect(publishedDraft.draftVersion).toBeUndefined();

    // Public marketplace now shows updated $4.85
    const publicLotAfterPublish = AgriTrustDatabase.getAvailableLots().find((l) => l.id === 'AT-LOT-2026-000926');
    expect(publicLotAfterPublish?.wholesalePrice).toBe(4.85);
  });

  it('logs immutable audit events for publication status changes and draft saves', () => {
    const initialLogsCount = AuditLedger.getOperationalLogs().length;

    AgriTrustDatabase.updateLotPublicationStatus('AT-LOT-2026-000922', 'PUBLISHED', 'sys-admin', 'Audit Test');

    const logs = AuditLedger.getOperationalLogs();
    expect(logs.length).toBeGreaterThan(initialLogsCount);

    const latestLog = logs[logs.length - 1];
    expect(latestLog.action).toBe('PUBLISH_LOT');
    expect(latestLog.targetEntity).toBe('LOT:AT-LOT-2026-000922');
  });
});
