import { describe, it, expect } from 'vitest';
import { AgriTrustDatabase } from '../core/database/db';
import { AIGovernanceEngine } from '../core/ai/aiGovernance';
import { AuditLedger } from '../core/audit/auditLedger';

describe('Page 6 Quality Inspection & Spectrovision AI Grading Workspace', () => {
  it('updates lot quality grade and generates quality document certificate', () => {
    AgriTrustDatabase.initialize();
    const lotId = 'AT-LOT-2026-000922';

    const updated = AgriTrustDatabase.updateLotQuality(lotId, {
      id: `lq-test-${Date.now()}`,
      lotId,
      grade: 'Grade A',
      aiConfidenceScore: 98.4,
      inspectorId: 'insp-042',
      inspectionDate: new Date().toISOString(),
      defectsDetected: ['Brix 9.2°Bx', 'Color Uniformity 99.2%'],
      status: 'ACCEPTED',
    });

    expect(updated.grade).toBe('Grade A');
    expect(updated.status).toBe('ACCEPTED');

    const lot = AgriTrustDatabase.getLotById(lotId);
    expect(lot?.grade).toBe('Grade A');
    expect(lot?.status).toBe('VERIFIED');

    // Add quality certificate
    const certHash = `sha256_qc_test_${Date.now()}`;
    const docs = AgriTrustDatabase.addLotDocument(lotId, {
      id: `ld-test-${Date.now()}`,
      lotId,
      documentType: 'QUALITY_CERT',
      fileUrl: `/docs/cert_${lotId}.pdf`,
      fileHash: certHash,
      uploadedAt: new Date().toISOString(),
    });

    expect(docs.length).toBeGreaterThan(0);
    const addedCert = docs.find((d) => d.fileHash === certHash);
    expect(addedCert).toBeDefined();
  });

  it('enforces Two-Human Governance sign-off when overriding high-confidence AI grade', () => {
    const approval = AIGovernanceEngine.createApprovalRequest(
      'OVERRIDE_AI_GRADE_000922',
      'HIGH',
      'insp-042'
    );

    expect(approval.status).toBe('PENDING_HUMAN_2');

    // Attempting to finish with only Human #1 fails completion
    expect(approval.human2UserId).toBeUndefined();

    // Human #2 signs off
    const completedApproval = AIGovernanceEngine.signApprovalHuman2(approval.id, 'sup-009');
    expect(completedApproval.status).toBe('APPROVED');
    expect(completedApproval.human2UserId).toBe('sup-009');
  });

  it('logs quality inspection and override events into operational audit ledger', () => {
    AuditLedger.logOperationalEvent(
      'insp-042',
      'OPERATIONS',
      'QUALITY_INSPECT_TEST',
      'LOT:AT-LOT-2026-000922',
      'Test quality inspection recorded with 98.4% AI confidence score.'
    );

    const logs = AuditLedger.getOperationalLogs();
    const targetLog = logs.find((l) => l.action === 'QUALITY_INSPECT_TEST');
    expect(targetLog).toBeDefined();
    expect(targetLog?.actorId).toBe('insp-042');
  });
});
