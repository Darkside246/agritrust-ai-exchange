import { describe, it, expect } from 'vitest';
import { MarginEngine } from '../core/pricing/marginEngine';
import { AIGovernanceEngine } from '../core/ai/aiGovernance';
import { AuditLedger } from '../core/audit/auditLedger';
import { FeatureFlagManager } from '../core/config/featureFlags';

describe('Page 7 Operational & Administrative Command Center', () => {
  it('evaluates minimum margin protection calculations accurately in admin console', () => {
    const evaluation = MarginEngine.evaluateMargin(
      'CE-TEST-ADMIN',
      {
        farmerProcurementCost: 2.00,
        gradingCost: 0.10,
        packagingCost: 0.15,
        storageCost: 0.08,
        transportCost: 0.12,
        paymentProcessingCost: 0.05,
        platformCost: 0.06,
        expectedSpoilageLossCost: 0.04,
        riskReserveCost: 0.05,
        otherAllocatedCost: 0.05,
      },
      3.40,
      20
    );

    expect(evaluation.trueLandedCost).toBe(2.70);
    expect(evaluation.minimumSellingPrice).toBe(3.38);
    expect(evaluation.isMarginSatisfied).toBe(true);
  });

  it('resolves Two-Human sign-off approval requests from admin queue', () => {
    const approval = AIGovernanceEngine.createApprovalRequest(
      'DEPLOY_PRODUCTION_AI_AGENT',
      'HIGH',
      'sys-admin'
    );

    expect(approval.status).toBe('PENDING_HUMAN_2');

    const completed = AIGovernanceEngine.signApprovalHuman2(approval.id, 'sup-009');
    expect(completed.status).toBe('APPROVED');
    expect(completed.human2UserId).toBe('sup-009');
  });

  it('verifies SHA-256 hash chain integrity of Immutable Security Audit Vault', () => {
    AuditLedger.logOperationalEvent(
      'sys-admin',
      'ADMIN',
      'VERIFY_VAULT_TEST',
      'SYSTEM:VAULT',
      'Security vault integrity test initiated.'
    );

    const vaultStatus = AuditLedger.verifySecurityVaultIntegrity();
    expect(vaultStatus.intact).toBe(true);
    expect(vaultStatus.verifiedCount).toBeGreaterThan(0);
  });

  it('mutates and persists dynamic feature flags from admin console', () => {
    const initialFlags = FeatureFlagManager.getFlags();
    const currentVal = initialFlags.AI_GRADING;

    const updated = FeatureFlagManager.setFlag('AI_GRADING', !currentVal);
    expect(updated.AI_GRADING).toBe(!currentVal);

    // Reset back
    FeatureFlagManager.setFlag('AI_GRADING', currentVal);
  });
});
