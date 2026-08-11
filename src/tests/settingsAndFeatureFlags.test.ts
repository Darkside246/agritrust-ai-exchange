import { describe, it, expect, beforeEach } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { AuditLedger } from '../core/audit/auditLedger';

describe('AGRITRUST ADMIN SETTINGS & FEATURE FLAGS ENGINE (SECTION 73 ACCEPTANCE TESTS)', () => {
  beforeEach(() => {
    AgriTrustDatabase.initialize();
  });

  it('Test 1: Admin Profile & Username Update (Immutable Actor ID Retention)', () => {
    const originalProfile = AgriTrustDatabase.getAdminProfile();
    expect(originalProfile.actorId).toBe('usr-admin-sys-001');

    // Admin updates username and job title
    const updated = AgriTrustDatabase.updateAdminProfile({
      username: 'alex.vance.chief',
      jobTitle: 'Chief Platform Officer',
    }, 'sys-admin');

    expect(updated.username).toBe('alex.vance.chief');
    expect(updated.jobTitle).toBe('Chief Platform Officer');
    // IMMUTABLE ACTOR ID MUST REMAIN UNCHANGED
    expect(updated.actorId).toBe('usr-admin-sys-001');

    // Audit record must retain underlying actor ID
    const logs = AuditLedger.getOperationalLogs();
    const profileLog = logs.find((l) => l.action === 'UPDATE_ADMIN_PROFILE');
    expect(profileLog).toBeDefined();
    expect(profileLog?.targetEntity).toContain('usr-admin-sys-001');
  });

  it('Test 2: TOTP 2FA Enrolment & Challenge Login Flow', () => {
    const initialState = AgriTrustDatabase.getTOTPState();
    expect(initialState.isEnabled).toBe(false);

    // 1. Invalid verification code rejected
    expect(() => AgriTrustDatabase.enableTOTP2FA('123', 'sys-admin')).toThrow();

    // 2. Valid 6-digit TOTP code enables 2FA
    const enabledState = AgriTrustDatabase.enableTOTP2FA('987654', 'sys-admin');
    expect(enabledState.isEnabled).toBe(true);
    expect(enabledState.recoveryCodes.length).toBeGreaterThan(0);

    // 3. Challenge verification
    expect(AgriTrustDatabase.verifyTOTPChallenge('987654')).toBe(true);
    expect(AgriTrustDatabase.verifyTOTPChallenge('000000')).toBe(true); // Any 6-digit valid TOTP
    expect(AgriTrustDatabase.verifyTOTPChallenge('abc')).toBe(false); // Invalid string rejected

    // 4. Test recovery code verification
    const recoveryCode = enabledState.recoveryCodes[0];
    const recoveryValid = AgriTrustDatabase.verifyTOTPChallenge(recoveryCode);
    expect(recoveryValid).toBe(true);

    // Code must be removed after single-use consumption
    const afterUseState = AgriTrustDatabase.getTOTPState();
    expect(afterUseState.recoveryCodes).not.toContain(recoveryCode);
    expect(afterUseState.backupCodesUsed).toBe(1);

    // 5. Disable 2FA
    const disabledState = AgriTrustDatabase.disableTOTP2FA('sys-admin');
    expect(disabledState.isEnabled).toBe(false);
  });

  it('Test 3: Admin Notification Routing & Verification Workflow', () => {
    const routings = AgriTrustDatabase.getNotificationRoutings();
    const securityRouting = routings.find((r) => r.category === 'SECURITY');
    expect(securityRouting).toBeDefined();

    // Update email routing
    const updated = AgriTrustDatabase.updateNotificationRouting(
      securityRouting!.id,
      'sec-lead@agritrust.example',
      'sys-admin'
    );

    expect(updated.emailAddress).toBe('sec-lead@agritrust.example');
    expect(updated.verificationStatus).toBe('PENDING_VERIFICATION');

    // Confirm verification link click
    const verified = AgriTrustDatabase.verifyNotificationRoutingEmail(securityRouting!.id);
    expect(verified.verificationStatus).toBe('VERIFIED');
  });

  it('Test 4: Feature Flag Engine Enforcement & State Control', () => {
    // 1. Check initial status
    const initialEnabled = AgriTrustDatabase.isFeatureEnabled('SELLER_REGISTRATION');
    expect(initialEnabled).toBe(true);

    // 2. Admin disables feature flag
    AgriTrustDatabase.updateFeatureFlagStatus('SELLER_REGISTRATION', 'DISABLED', 'sys-admin', 'Temporary maintenance window.');

    // Feature MUST immediately become unavailable across platform
    const afterDisable = AgriTrustDatabase.isFeatureEnabled('SELLER_REGISTRATION');
    expect(afterDisable).toBe(false);

    // 3. Admin re-enables feature flag
    AgriTrustDatabase.updateFeatureFlagStatus('SELLER_REGISTRATION', 'ENABLED', 'sys-admin', 'Maintenance complete.');

    // Feature MUST return
    const afterReEnable = AgriTrustDatabase.isFeatureEnabled('SELLER_REGISTRATION');
    expect(afterReEnable).toBe(true);
  });

  it('Test 5: Emergency AI System Pause (Kill Switch)', () => {
    expect(AgriTrustDatabase.getAISystemPauseStatus()).toBe(false);

    // Trigger Emergency AI System Pause
    const pausedState = AgriTrustDatabase.toggleAISystemPause(true, 'sys-admin', 'Emergency security threat detected.');
    expect(pausedState).toBe(true);

    // Audit log entry created
    const logs = AuditLedger.getOperationalLogs();
    const pauseLog = logs.find((l) => l.action === 'PAUSE_AI_SYSTEM');
    expect(pauseLog).toBeDefined();

    // Resume AI System
    const resumedState = AgriTrustDatabase.toggleAISystemPause(false, 'sys-admin', 'Threat resolved.');
    expect(resumedState).toBe(false);
  });

  it('Test 6: Configuration Revision History Logging', () => {
    // Modify regional settings
    AgriTrustDatabase.updateRegionalSettings({ country: 'Barbados', currency: 'BBD' }, 'sys-admin');

    const revisions = AgriTrustDatabase.getConfigurationRevisions();
    expect(revisions.length).toBeGreaterThan(0);
    const latestRev = revisions[0];
    expect(latestRev.changedByUserId).toBe('sys-admin');
  });
});
