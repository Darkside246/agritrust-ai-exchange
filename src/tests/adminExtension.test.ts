import { describe, it, expect, beforeEach } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { AuthManager } from '../core/identity/auth';
import { AuditLedger } from '../core/audit/auditLedger';
import { PrivacyManager } from '../core/security/privacy';

describe('AgriTrust Admin Control Centre & Content Management Extension', () => {
  beforeEach(() => {
    AgriTrustDatabase.initialize();
  });

  it('verifies admin authentication and RBAC boundary enforcement', () => {
    const authResult = AuthManager.authenticateUser('admin@agritrust.com', 'AdminSecure2026!');
    expect(authResult.success).toBe(true);
    expect(authResult.user?.role).toBe('ADMIN');
  });

  it('initializes the 5 development seed lots in database', () => {
    const lots = AgriTrustDatabase.getAllLots();
    expect(lots.length).toBeGreaterThanOrEqual(5);

    const lot922 = AgriTrustDatabase.getAllLots().find((l) => l.id === 'AT-LOT-2026-000922');
    expect(lot922?.commodity).toBe('Tomatoes');
    expect(lot922?.variety).toBe('Vine Ripened Regular');
    expect(lot922?.wholesalePrice).toBe(2.40);
    expect(lot922?.availableStock).toBe(1200);

    const lot924 = AgriTrustDatabase.getAllLots().find((l) => l.id === 'AT-LOT-2026-000924');
    expect(lot924?.commodity).toBe('Lettuce');
    expect(lot924?.unit).toBe('crate');
    expect(lot924?.wholesalePrice).toBe(34.50);
  });

  it('updates lot wholesale price and stock via admin control centre and syncs to public marketplace', () => {
    // Admin updates price from $2.40 to $2.65 and stock from 1200 to 900, and publishes lot
    AgriTrustDatabase.updateLotPublicationStatus(
      'AT-LOT-2026-000922',
      'PUBLISHED',
      'sys-admin'
    );
    const updated = AgriTrustDatabase.updateLotInventory(
      'AT-LOT-2026-000922',
      { wholesalePrice: 2.65, availableStock: 900 },
      'sys-admin'
    );

    expect(updated.wholesalePrice).toBe(2.65);
    expect(updated.availableStock).toBe(900);

    // Public marketplace consumes backend data directly
    const publicLots = AgriTrustDatabase.getAvailableLots();
    const public922 = publicLots.find((l) => l.id === 'AT-LOT-2026-000922');
    expect(public922?.wholesalePrice).toBe(2.65);
    expect(public922?.availableStock).toBe(900);

    // Verify product price was automatically synchronized
    const product01 = AgriTrustDatabase.getProductById('prod-01');
    expect(product01?.pricePerUnit).toBe(2.65);
    expect(product01?.availableUnits).toBe(900);
  });

  it('creates an audit event log entry whenever an admin modifies inventory', () => {
    const initialLogsCount = AuditLedger.getOperationalLogs().length;

    AgriTrustDatabase.updateLotInventory(
      'AT-LOT-2026-000923',
      { wholesalePrice: 2.95 },
      'sys-admin'
    );

    const logs = AuditLedger.getOperationalLogs();
    expect(logs.length).toBeGreaterThan(initialLogsCount);

    const latestLog = logs[logs.length - 1];
    expect(latestLog.action).toBe('ADMIN-CHANGE');
    expect(latestLog.targetEntity).toBe('LOT:AT-LOT-2026-000923');
  });

  it('manages CMS content dynamically via backend database', () => {
    const cms = AgriTrustDatabase.getCMSContent();
    expect(cms.headline).toBeDefined();

    const updatedCms = AgriTrustDatabase.updateCMSContent(
      { headline: 'Custom Published Headline 2026' },
      'sys-admin'
    );

    expect(updatedCms.headline).toBe('Custom Published Headline 2026');
    expect(AgriTrustDatabase.getCMSContent().headline).toBe('Custom Published Headline 2026');
  });

  it('registers AI agents and executes emergency status controls', () => {
    const agents = AgriTrustDatabase.getAIAgents();
    expect(agents.length).toBeGreaterThanOrEqual(7);

    const spectroAgent = agents.find((a) => a.id === 'agent-spectro-01');
    expect(spectroAgent?.status).toBe('ACTIVE');

    // Admin pauses AI Agent
    const paused = AgriTrustDatabase.updateAIAgentStatus('agent-spectro-01', 'PAUSED', 'sys-admin');
    expect(paused.status).toBe('PAUSED');
  });

  it('enforces counterparty privacy shield concealing seller private identity from buyers', () => {
    const farmerProfile = AgriTrustDatabase.getFarmerProfileByUserId('usr-farmer-01');
    expect(farmerProfile).toBeDefined();

    if (farmerProfile) {
      const redacted = PrivacyManager.redactFarmerIdentity(farmerProfile);
      expect(redacted.privatePhone).toBeUndefined();
      expect(redacted.privateAddress).toBeUndefined();
      expect(redacted.privateGpsLat).toBeUndefined();
      expect(redacted.privateGpsLng).toBeUndefined();
      expect(redacted.publicRegion).toBe('Western Agricultural Zone 4');
    }
  });
});
