import { RiskLevel, AIApproval } from '../database/schema';

export interface AgentCreationRequest {
  id: string;
  requestedAgentName: string;
  requestedRole: string;
  requestedCapabilities: string[];
  reason: string;
  riskLevel: RiskLevel;
}

export class AIGovernanceEngine {
  private static approvals: Map<string, AIApproval> = new Map();

  /**
   * Enforces non-negotiable agent runtime policies.
   * AI agents are strictly forbidden from performing forbidden meta-actions.
   */
  public static validateAgentActionPermission(
    agentId: string, 
    actionName: string, 
    isSelfModificationAttempt: boolean
  ): { allowed: boolean; reason?: string } {
    const forbiddenActions = [
      'CREATE_AGENT',
      'CREATE_SUB_AGENT',
      'MODIFY_SYSTEM_PROMPT',
      'GRANT_PERMISSIONS',
      'DISABLE_LOGGING',
      'DELETE_AUDIT_LOGS',
      'BYPASS_SECURITY',
      'ACCESS_UNRESTRICTED_PII',
      'APPROVE_OWN_ACTION',
      'MODIFY_MINIMUM_MARGIN',
      'DEPLOY_TO_PRODUCTION',
    ];

    if (forbiddenActions.includes(actionName) || isSelfModificationAttempt) {
      return {
        allowed: false,
        reason: `POLICY VIOLATION: Agent '${agentId}' is strictly prohibited from executing restricted action '${actionName}'. Non-negotiable AI Governance Policy enforced.`,
      };
    }

    return { allowed: true };
  }

  /**
   * Initiates a Two-Human Approval workflow for agent creation or high-risk actions.
   */
  public static initiateTwoHumanApproval(
    request: AgentCreationRequest, 
    human1UserId: string
  ): AIApproval {
    const approval: AIApproval = {
      id: `APPR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId: request.id,
      requestedAction: `CREATE_AGENT:${request.requestedAgentName}`,
      riskLevel: request.riskLevel,
      human1UserId,
      human1Timestamp: new Date().toISOString(),
      status: 'PENDING_HUMAN_2',
      policyVersion: 'GOV-POL-2026-V1',
      createdAt: new Date().toISOString(),
    };

    this.approvals.set(approval.id, approval);
    return approval;
  }

  /**
   * Evaluates Human #2 approval to complete Two-Human Sign-Off.
   * Rejects self-approval by Human #1 and rejects AI-only requests.
   */
  public static approveByHuman2(
    approvalId: string, 
    human2UserId: string, 
    isActorAI: boolean = false
  ): { success: boolean; approval?: AIApproval; reason?: string } {
    if (isActorAI) {
      return {
        success: false,
        reason: 'POLICY VIOLATION: AI agents cannot provide human approvals. Independent human sign-off required.',
      };
    }

    const approval = this.approvals.get(approvalId);
    if (!approval) {
      return { success: false, reason: 'Approval request not found.' };
    }

    if (approval.human1UserId === human2UserId) {
      return {
        success: false,
        reason: 'POLICY VIOLATION: Independent Human #2 required. Human #1 cannot self-approve their own request.',
      };
    }

    approval.human2UserId = human2UserId;
    approval.human2Timestamp = new Date().toISOString();
    approval.status = 'APPROVED';

    this.approvals.set(approvalId, approval);

    return { success: true, approval };
  }

  public static createApprovalRequest(
    requestedAction: string,
    riskLevel: RiskLevel,
    human1UserId: string
  ): AIApproval {
    const approval: AIApproval = {
      id: `APPR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      requestId: `req-${Date.now()}`,
      requestedAction,
      riskLevel,
      human1UserId,
      human1Timestamp: new Date().toISOString(),
      status: 'PENDING_HUMAN_2',
      policyVersion: 'GOV-POL-2026-V1',
      createdAt: new Date().toISOString(),
    };

    this.approvals.set(approval.id, approval);
    return approval;
  }

  public static signApprovalHuman2(approvalId: string, human2UserId: string): AIApproval {
    const result = this.approveByHuman2(approvalId, human2UserId, false);
    if (!result.success || !result.approval) {
      throw new Error(result.reason || 'Failed to complete Two-Human Approval.');
    }
    return result.approval;
  }
}
