import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { MarginEngine, CostBreakdownInput } from '../core/pricing/marginEngine';
import { AuditLedger } from '../core/audit/auditLedger';
import { AIGovernanceEngine } from '../core/ai/aiGovernance';
import { FeatureFlagManager } from '../core/config/featureFlags';
import { FeatureFlags } from '../core/database/schema';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  FileText, 
  Activity, 
  Sliders, 
  ToggleLeft, 
  ToggleRight, 
  Calculator, 
  Database,
  Cpu,
  RefreshCw,
  Server
} from 'lucide-react';

interface AdminCommandCenterProps {
  adminUserId?: string;
}

export const AdminCommandCenter: React.FC<AdminCommandCenterProps> = ({
  adminUserId = 'sys-admin',
}) => {
  const [activeTab, setActiveTab] = useState<'MARGIN' | 'APPROVALS' | 'AUDIT' | 'FLAGS' | 'HEALTH'>('MARGIN');

  // Margin Engine Calculator State
  const [procurementCost, setProcurementCost] = useState(2.00);
  const [gradingCost, setGradingCost] = useState(0.10);
  const [packagingCost, setPackagingCost] = useState(0.15);
  const [storageCost, setStorageCost] = useState(0.08);
  const [transportCost, setTransportCost] = useState(0.12);
  const [paymentCost, setPaymentCost] = useState(0.05);
  const [platformCost, setPlatformCost] = useState(0.06);
  const [spoilageCost, setSpoilageCost] = useState(0.04);
  const [riskReserveCost, setRiskReserveCost] = useState(0.05);
  const [allocatedCost, setAllocatedCost] = useState(0.05);
  const [proposedSellingPrice, setProposedSellingPrice] = useState(3.40);
  const [targetMarginPercent, setTargetMarginPercent] = useState(20);

  // Feature Flags State
  const [flags, setFlags] = useState<FeatureFlags>(FeatureFlagManager.getFlags());

  // Approval Sign-Off State
  const [human2Input, setHuman2Input] = useState('sup-009 (Operations Lead)');
  const [approvalSuccessMsg, setApprovalSuccessMsg] = useState<string | null>(null);

  const costBreakdown: CostBreakdownInput = {
    farmerProcurementCost: procurementCost,
    gradingCost,
    packagingCost,
    storageCost,
    transportCost,
    paymentProcessingCost: paymentCost,
    platformCost,
    expectedSpoilageLossCost: spoilageCost,
    riskReserveCost,
    otherAllocatedCost: allocatedCost,
  };

  const marginEvaluation = MarginEngine.evaluateMargin(
    'CE-ADMIN-CALC',
    costBreakdown,
    proposedSellingPrice,
    targetMarginPercent
  );

  const operationalLogs = AuditLedger.getOperationalLogs();
  const vaultStatus = AuditLedger.verifySecurityVaultIntegrity();

  const handleToggleFlag = (flagKey: keyof FeatureFlags) => {
    const updated = FeatureFlagManager.setFlag(flagKey, !flags[flagKey]);
    setFlags({ ...updated });
    AuditLedger.logOperationalEvent(
      adminUserId,
      'ADMIN',
      'TOGGLE_FEATURE_FLAG',
      `FLAG:${flagKey}`,
      `Admin toggled feature flag '${flagKey}' to ${updated[flagKey]}`
    );
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Admin Command Center Header */}
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-brand" style={{ backgroundColor: 'rgba(230, 81, 0, 0.15)', color: 'var(--brand-accent)', fontSize: '0.75rem' }}>
                  ADMINISTRATIVE COMMAND CENTER
                </span>
                <span className={`badge ${vaultStatus.intact ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.75rem' }}>
                  <ShieldCheck size={12} /> Security Vault: {vaultStatus.intact ? '100% Intact' : 'Tampered!'}
                </span>
              </div>
              <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
                AgriTrust Governance & Operations Console
              </h1>
              <p className="text-secondary text-xs" style={{ marginTop: '0.15rem' }}>
                Authenticated Role: <strong>ADMIN / OPERATIONS LEAD</strong> • Active Session: <strong>{adminUserId}</strong>
              </p>
            </div>

            <div style={{ padding: '0.75rem 1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', textAlign: 'right', fontSize: '0.75rem' }}>
              <div style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>Minimum Margin Formula Active</div>
              <span className="text-muted">Target Margin: {targetMarginPercent}% (Enforced)</span>
            </div>
          </div>

          {/* Core Admin Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>Target Margin Target</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                {targetMarginPercent}%
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>Audit Logs Recorded</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-accent)', marginTop: '0.2rem' }}>
                {operationalLogs.length} Events
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>Security Vault Hash Chain</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '0.2rem' }}>
                {vaultStatus.verifiedCount} Blocks
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>Active Feature Flags</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {Object.values(flags).filter(Boolean).length} / {Object.keys(flags).length}
              </div>
            </div>
          </div>
        </div>

        {approvalSuccessMsg && (
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--brand-primary-light)',
            color: 'var(--brand-primary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={18} /> {approvalSuccessMsg}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('MARGIN')}
            className={`btn btn-sm ${activeTab === 'MARGIN' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Calculator size={16} /> Minimum Margin Protection Engine
          </button>
          <button
            onClick={() => setActiveTab('APPROVALS')}
            className={`btn btn-sm ${activeTab === 'APPROVALS' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <UserCheck size={16} /> Two-Human Governance Sign-Off
          </button>
          <button
            onClick={() => setActiveTab('AUDIT')}
            className={`btn btn-sm ${activeTab === 'AUDIT' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Lock size={16} /> Immutable Security Audit Vault ({operationalLogs.length})
          </button>
          <button
            onClick={() => setActiveTab('FLAGS')}
            className={`btn btn-sm ${activeTab === 'FLAGS' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Sliders size={16} /> Dynamic Feature Flags
          </button>
          <button
            onClick={() => setActiveTab('HEALTH')}
            className={`btn btn-sm ${activeTab === 'HEALTH' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Server size={16} /> System Health & Metrics
          </button>
        </div>

        {/* Tab 1: Minimum Margin Protection Engine */}
        {activeTab === 'MARGIN' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
            <div className="card" style={{ padding: '2rem' }}>
              <h3 className="text-xl font-bold" style={{ marginBottom: '0.35rem' }}>True Landed Cost Breakdown</h3>
              <p className="text-secondary text-xs" style={{ marginBottom: '1.5rem' }}>
                Formula: True Landed Cost = Procurement + Grading + Packaging + Storage + Transport + Payment + Platform + Spoilage + Risk Reserve + Allocated Costs
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8125rem' }}>
                <div className="input-group">
                  <label className="input-label">Procurement Cost ($/unit)</label>
                  <input type="number" step="0.01" value={procurementCost} onChange={(e) => setProcurementCost(parseFloat(e.target.value) || 0)} className="input-field" />
                </div>

                <div className="input-group">
                  <label className="input-label">Grading & Intake ($/unit)</label>
                  <input type="number" step="0.01" value={gradingCost} onChange={(e) => setGradingCost(parseFloat(e.target.value) || 0)} className="input-field" />
                </div>

                <div className="input-group">
                  <label className="input-label">Packaging ($/unit)</label>
                  <input type="number" step="0.01" value={packagingCost} onChange={(e) => setPackagingCost(parseFloat(e.target.value) || 0)} className="input-field" />
                </div>

                <div className="input-group">
                  <label className="input-label">Storage Cold-Chain ($/unit)</label>
                  <input type="number" step="0.01" value={storageCost} onChange={(e) => setStorageCost(parseFloat(e.target.value) || 0)} className="input-field" />
                </div>

                <div className="input-group">
                  <label className="input-label">Transport Logistics ($/unit)</label>
                  <input type="number" step="0.01" value={transportCost} onChange={(e) => setTransportCost(parseFloat(e.target.value) || 0)} className="input-field" />
                </div>

                <div className="input-group">
                  <label className="input-label">Payment & Escrow ($/unit)</label>
                  <input type="number" step="0.01" value={paymentCost} onChange={(e) => setPaymentCost(parseFloat(e.target.value) || 0)} className="input-field" />
                </div>
              </div>
            </div>

            {/* Evaluation Results Card */}
            <div className="card" style={{ padding: '2rem' }}>
              <h3 className="text-xl font-bold" style={{ marginBottom: '0.35rem' }}>Margin Engine Evaluation Result</h3>
              <p className="text-secondary text-xs" style={{ marginBottom: '1.5rem' }}>
                Formula: Minimum Selling Price = True Landed Cost / (1 - Target Margin)
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div className="input-group">
                  <label className="input-label">Proposed Selling Price ($/unit)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={proposedSellingPrice}
                    onChange={(e) => setProposedSellingPrice(parseFloat(e.target.value) || 0)}
                    className="input-field"
                    style={{ fontSize: '1.125rem', fontWeight: 700 }}
                  />
                </div>

                <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-muted">Calculated True Landed Cost:</span>
                    <span className="font-bold">${marginEvaluation.trueLandedCost.toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span className="text-muted">Required Minimum Selling Price ({targetMarginPercent}% Margin):</span>
                    <span className="font-bold" style={{ color: 'var(--brand-primary)' }}>
                      ${marginEvaluation.minimumSellingPrice.toFixed(2)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
                    <span className="text-muted">Achieved Margin:</span>
                    <span className="font-bold">{marginEvaluation.calculatedMarginPercent.toFixed(1)}%</span>
                  </div>
                </div>

                <div style={{
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: marginEvaluation.isMarginSatisfied ? 'var(--brand-primary-light)' : 'rgba(211, 47, 47, 0.1)',
                  color: marginEvaluation.isMarginSatisfied ? 'var(--brand-primary)' : 'var(--status-danger)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontWeight: 700
                }}>
                  {marginEvaluation.isMarginSatisfied ? (
                    <><CheckCircle2 size={18} /> TRANSACTION APPROVED: Minimum Margin Rule Satisfied</>
                  ) : (
                    <><AlertTriangle size={18} /> TRANSACTION REJECTED: Proposed price below minimum margin threshold</>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Two-Human Governance Sign-Off */}
        {activeTab === 'APPROVALS' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 className="text-xl font-bold" style={{ marginBottom: '0.35rem' }}>Two-Human Sign-Off Approval Queue</h3>
            <p className="text-secondary text-xs" style={{ marginBottom: '1.5rem' }}>
              High-risk actions (AI agent creation, high-confidence grade overrides, system config changes) require independent Human #1 + Human #2 signatures.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-surface-elevated)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="badge badge-accent" style={{ marginBottom: '0.25rem' }}>HIGH RISK • PENDING HUMAN #2</span>
                    <h4 className="font-bold text-base">Request: Create Autonomous AI Intake Agent 'SpectroAgent-09'</h4>
                  </div>
                  <span className="text-muted text-xs">Requested: 2026-08-10 04:15 UTC</span>
                </div>

                <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Human #1 Requester: <strong>insp-042 (Lead Inspector)</strong> • Status: <strong>PENDING_HUMAN_2</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <input
                    type="text"
                    value={human2Input}
                    onChange={(e) => setHuman2Input(e.target.value)}
                    className="input-field"
                    style={{ maxWidth: '280px' }}
                  />
                  <button
                    onClick={() => {
                      const approval = AIGovernanceEngine.createApprovalRequest('CREATE_AGENT:SpectroAgent-09', 'HIGH', 'insp-042');
                      AIGovernanceEngine.signApprovalHuman2(approval.id, human2Input);
                      setApprovalSuccessMsg(`Two-Human Approval Executed! AI Agent 'SpectroAgent-09' authorized by Human 1 (insp-042) + Human 2 (${human2Input}).`);
                    }}
                    className="btn btn-primary btn-sm"
                  >
                    <UserCheck size={14} /> Execute Human #2 Sign-Off
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Immutable Security Audit Vault */}
        {activeTab === 'AUDIT' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h3 className="text-xl font-bold">Immutable Security Audit Vault</h3>
                <p className="text-secondary text-xs">Dual Audit Architecture: SHA-256 hash-chained security vault inaccessible to AI agents.</p>
              </div>

              <div className="badge badge-success" style={{ padding: '0.5rem 0.875rem' }}>
                <ShieldCheck size={16} /> Vault Integrity: {vaultStatus.verifiedCount} Blocks Verified
              </div>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.625rem' }}>Timestamp</th>
                    <th style={{ padding: '0.625rem' }}>Actor</th>
                    <th style={{ padding: '0.625rem' }}>Action</th>
                    <th style={{ padding: '0.625rem' }}>Target Entity</th>
                    <th style={{ padding: '0.625rem' }}>Audit Log Details</th>
                  </tr>
                </thead>
                <tbody>
                  {operationalLogs.map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.625rem', fontFamily: 'monospace', color: 'var(--text-muted)' }}>
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: '0.625rem', fontWeight: 600 }}>{log.actorId} ({log.actorRole})</td>
                      <td style={{ padding: '0.625rem' }}>
                        <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>{log.action}</span>
                      </td>
                      <td style={{ padding: '0.625rem', fontFamily: 'monospace' }}>{log.targetEntity}</td>
                      <td style={{ padding: '0.625rem', color: 'var(--text-secondary)' }}>{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Dynamic Feature Flags */}
        {activeTab === 'FLAGS' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 className="text-xl font-bold" style={{ marginBottom: '0.35rem' }}>Dynamic System Feature Flags</h3>
            <p className="text-secondary text-xs" style={{ marginBottom: '1.5rem' }}>
              Enable or disable platform capabilities dynamically in real time without downtime.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              {(Object.keys(flags) as Array<keyof FeatureFlags>).map((key) => (
                <div key={key} style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-elevated)' }}>
                  <div>
                    <h4 className="font-bold text-sm" style={{ fontFamily: 'monospace' }}>{key}</h4>
                    <span className="text-muted text-xs">Status: {flags[key] ? 'ENABLED' : 'DISABLED'}</span>
                  </div>

                  <button
                    onClick={() => handleToggleFlag(key)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: flags[key] ? 'var(--brand-primary)' : 'var(--text-muted)' }}
                  >
                    {flags[key] ? <ToggleRight size={36} /> : <ToggleLeft size={36} />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: System Health & Metrics */}
        {activeTab === 'HEALTH' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 className="text-xl font-bold" style={{ marginBottom: '1.5rem' }}>System Health & Database Relational Metrics</h3>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase' }}>Relational Entities</span>
                <div className="text-2xl font-bold" style={{ color: 'var(--brand-primary)', marginTop: '0.2rem' }}>40+ Active</div>
              </div>
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase' }}>OAuth Provider Boundaries</span>
                <div className="text-2xl font-bold" style={{ color: 'var(--brand-accent)', marginTop: '0.2rem' }}>CONFIG REQUIRED</div>
              </div>
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase' }}>File Security Upload Limit</span>
                <div className="text-2xl font-bold" style={{ marginTop: '0.2rem' }}>10 MB Max</div>
              </div>
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase' }}>AI Governance State</span>
                <div className="text-2xl font-bold" style={{ color: 'var(--status-success)', marginTop: '0.2rem' }}>Strict Boundary</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
