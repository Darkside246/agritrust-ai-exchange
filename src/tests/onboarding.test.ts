import { describe, it, expect } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { AuthManager } from '../core/identity/auth';
import { PrivacyManager } from '../core/security/privacy';
import { FileSecurityManager } from '../core/security/fileSecurity';

describe('Page 3 Registration & Onboarding Flow', () => {
  it('strictly blocks self-registration attempts for ADMIN or SYSTEM privileges', () => {
    const role1 = AuthManager.sanitizeRegisterRole('ADMIN');
    expect(role1).toBe('BUYER'); // Sanitized back to BUYER

    const role2 = AuthManager.sanitizeRegisterRole('SYSTEM');
    expect(role2).toBe('BUYER');

    const role3 = AuthManager.sanitizeRegisterRole('FARMER');
    expect(role3).toBe('FARMER');
  });

  it('creates and sanitizes new Buyer profile', () => {
    AgriTrustDatabase.initialize();
    const result = AgriTrustDatabase.createBuyerAccount(
      'procurement@testbuyer.com',
      'Test Buyer Corp',
      'Alex Mercer',
      '+1-555-099-1234',
      '100 Main St, Suite 500'
    );

    expect(result.user.role).toBe('BUYER');
    expect(result.profile.businessName).toBe('Test Buyer Corp');

    const redacted = PrivacyManager.redactBuyerProfile(result.profile);
    expect(redacted.businessName).toBe('Test Buyer Corp');
    expect((redacted as any).privatePhone).toBeUndefined();
    expect((redacted as any).privateAddress).toBeUndefined();
  });

  it('creates and sanitizes new Farmer profile with regional anonymization', () => {
    AgriTrustDatabase.initialize();
    const result = AgriTrustDatabase.createFarmerAccount(
      'farmer@testfarm.com',
      'Green Valley Farm',
      'David Miller',
      '+1-555-088-4321',
      '55 Secret Farm Road',
      14.05,
      -60.95,
      'Southern Agricultural Region'
    );

    expect(result.user.role).toBe('FARMER');
    expect(result.profile.publicRegion).toBe('Southern Agricultural Region');

    const redacted = PrivacyManager.redactFarmerProfile(result.profile);
    expect(redacted.publicRegion).toBe('Southern Agricultural Region');
    expect((redacted as any).privatePhone).toBeUndefined();
    expect((redacted as any).privateAddress).toBeUndefined();
    expect((redacted as any).privateGpsLat).toBeUndefined();
  });

  it('validates uploaded license/certification documents via FileSecurityManager', () => {
    const validResult = FileSecurityManager.validateUpload('license.pdf', 'application/pdf', 2 * 1024 * 1024);
    expect(validResult.valid).toBe(true);

    const oversizedResult = FileSecurityManager.validateUpload('large.pdf', 'application/pdf', 15 * 1024 * 1024);
    expect(oversizedResult.valid).toBe(false);
    expect(oversizedResult.reason).toContain('exceeds maximum allowed threshold');

    const invalidTypeResult = FileSecurityManager.validateUpload('script.xyz', 'application/x-xyz', 1024);
    expect(invalidTypeResult.valid).toBe(false);
    expect(invalidTypeResult.reason).toContain('is not in approved upload list');
  });
});
