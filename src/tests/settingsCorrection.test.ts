import { describe, it, expect, beforeEach } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { AuditLedger } from '../core/audit/auditLedger';

describe('AGRITRUST SETTINGS ARCHITECTURE & MY ACCOUNT LOCK (SECTION 29 REGRESSION TESTS)', () => {
  beforeEach(() => {
    AgriTrustDatabase.initialize();
  });

  it('Test Step 1-5: My Account Profile Information & Photo Management', () => {
    const profile = AgriTrustDatabase.getAdminProfile();
    expect(profile.actorId).toBe('usr-admin-sys-001');
    expect(profile.firstName).toBe('Alexander');
    expect(profile.lastName).toBe('Vance');
    expect(profile.jobTitle).toBe('VP of Platform Operations');

    // Update profile
    const updated = AgriTrustDatabase.updateAdminProfile({
      firstName: 'Alex',
      lastName: 'Vance',
      displayName: 'Alex Vance (VP Ops)',
      phone: '+1 (246) 555-9988',
      jobTitle: 'Chief Platform Officer',
    }, 'sys-admin');

    expect(updated.firstName).toBe('Alex');
    expect(updated.displayName).toBe('Alex Vance (VP Ops)');
    expect(updated.actorId).toBe('usr-admin-sys-001'); // Retains immutable actor ID

    // Remove photo test
    const removedPhoto = AgriTrustDatabase.removeAdminProfilePhoto('sys-admin');
    expect(removedPhoto.photoUrl).toBeUndefined();
  });

  it('Test Step 6-10: Email Verification Flow & Username Change Audit Locking', () => {
    // Initiate email change
    const updated = AgriTrustDatabase.updateAdminProfile({
      email: 'alex.vance.new@agritrust.example',
    }, 'sys-admin');

    expect(updated.email).toBe('admin@agritrust.example'); // Old email remains active until verified
    expect(updated.pendingEmail).toBe('alex.vance.new@agritrust.example');
    expect(updated.emailVerified).toBe(false);

    // Verify email
    const verified = AgriTrustDatabase.verifyAdminNewEmail('sys-admin');
    expect(verified.email).toBe('alex.vance.new@agritrust.example');
    expect(verified.emailVerified).toBe(true);
    expect(verified.pendingEmail).toBeUndefined();
  });

  it('Test Step 11-16: TOTP 2FA Enrolment, Recovery Codes & Challenge Flow', () => {
    // Enrol TOTP 2FA
    const enabled = AgriTrustDatabase.enableTOTP2FA('123456', 'sys-admin');
    expect(enabled.isEnabled).toBe(true);
    expect(enabled.recoveryCodes.length).toBe(8);

    // Verify TOTP challenge
    expect(AgriTrustDatabase.verifyTOTPChallenge('123456')).toBe(true);

    // Disable 2FA
    const disabled = AgriTrustDatabase.disableTOTP2FA('sys-admin');
    expect(disabled.isEnabled).toBe(false);
  });

  it('Test Step 17-19: Active Sessions Revocation & Login Activity Trail', () => {
    const sessions = AgriTrustDatabase.getActiveSessions();
    expect(sessions.length).toBeGreaterThan(0);

    const currentSessionId = sessions.find((s) => s.isCurrent)?.id || sessions[0].id;
    const afterRevokeAll = AgriTrustDatabase.revokeAllOtherSessions(currentSessionId, 'sys-admin');
    expect(afterRevokeAll.length).toBe(1);
    expect(afterRevokeAll[0].id).toBe(currentSessionId);

    const authLogs = AgriTrustDatabase.getAuthenticationLogs();
    expect(authLogs.length).toBeGreaterThan(0);
  });

  it('Test Step 20-29: Personal Preferences Management', () => {
    const prefs = AgriTrustDatabase.updateAdminPreferences({
      timeFormat: '12h',
      dateFormat: 'DD/MM/YYYY',
      defaultDashboardView: 'SECURITY',
    }, 'sys-admin');

    expect(prefs.preferences.timeFormat).toBe('12h');
    expect(prefs.preferences.dateFormat).toBe('DD/MM/YYYY');
    expect(prefs.preferences.defaultDashboardView).toBe('SECURITY');
  });

  it('Test Step 30-37: Co-existence of Upload Security, Feature Flags, and System Control', () => {
    // 1. Upload security baseline rules locked
    const baselineRules = AgriTrustDatabase.getProtectedBaselineRules();
    expect(baselineRules.some((r) => r.extension === '.exe')).toBe(true);

    // 2. Feature flags operational
    const flags = AgriTrustDatabase.getFeatureFlagSettings();
    expect(flags.length).toBe(16);

    // 3. AI Kill Switch operational
    expect(AgriTrustDatabase.getAISystemPauseStatus()).toBe(false);
  });
});
