import { describe, it, expect } from 'vitest';
import { AIGovernanceEngine } from '../core/ai/aiGovernance';

describe('AI Governance & Two-Human Approval Engine', () => {
  it('blocks forbidden agent meta-actions (e.g. CREATE_AGENT, BYPASS_SECURITY)', () => {
    const result = AIGovernanceEngine.validateAgentActionPermission('PricingAgent', 'CREATE_AGENT', false);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain('POLICY VIOLATION');
  });

  it('enforces independent Two-Human approval for agent requests', () => {
    const request = {
      id: 'REQ-001',
      requestedAgentName: 'QualityInspectorAgent',
      requestedRole: 'INSPECTOR',
      requestedCapabilities: ['READ_IMAGES'],
      reason: 'Automated grading assistance',
      riskLevel: 'HIGH' as const,
    };

    // Human #1 initiates approval
    const approval = AIGovernanceEngine.initiateTwoHumanApproval(request, 'usr-admin-01');
    expect(approval.status).toBe('PENDING_HUMAN_2');

    // Attempt self-approval by Human #1 (MUST BE REJECTED)
    const selfApproveResult = AIGovernanceEngine.approveByHuman2(approval.id, 'usr-admin-01', false);
    expect(selfApproveResult.success).toBe(false);
    expect(selfApproveResult.reason).toContain('Human #1 cannot self-approve');

    // AI attempt to approve (MUST BE REJECTED)
    const aiApproveResult = AIGovernanceEngine.approveByHuman2(approval.id, 'usr-admin-02', true);
    expect(aiApproveResult.success).toBe(false);
    expect(aiApproveResult.reason).toContain('AI agents cannot provide human approvals');

    // Independent Human #2 approves (MUST SUCCEED)
    const validResult = AIGovernanceEngine.approveByHuman2(approval.id, 'usr-admin-02', false);
    expect(validResult.success).toBe(true);
    expect(validResult.approval?.status).toBe('APPROVED');
  });
});
