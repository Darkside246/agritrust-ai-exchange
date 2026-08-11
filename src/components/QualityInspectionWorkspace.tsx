import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { ProduceGrade, LotQuality } from '../core/database/schema';
import { FileSecurityManager } from '../core/security/fileSecurity';
import { AuditLedger } from '../core/audit/auditLedger';
import { AIGovernanceEngine } from '../core/ai/aiGovernance';
import { 
  ShieldCheck, 
  Cpu, 
  Upload, 
  FileCheck, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Lock, 
  FileText, 
  Activity,
  Award,
  RefreshCw,
  Eye
} from 'lucide-react';

interface QualityInspectionWorkspaceProps {
  inspectorId?: string;
  initialLotId?: string;
  onInspectTraceability: (lotId: string) => void;
}

export const QualityInspectionWorkspace: React.FC<QualityInspectionWorkspaceProps> = ({
  inspectorId = 'insp-042',
  initialLotId = 'AT-LOT-2026-000922',
  onInspectTraceability,
}) => {
  const [selectedLotId, setSelectedLotId] = useState<string>(initialLotId);
  const [isScanning, setIsScanning] = useState(false);
  const [scannedFileName, setScannedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Spectral Analysis State
  const [spectralBrix, setSpectralBrix] = useState<number>(9.2);
  const [colorUniformity, setColorUniformity] = useState<number>(99.2);
  const [surfaceDefectsPercent, setSurfaceDefectsPercent] = useState<number>(0.35);
  const [aiConfidence, setAiConfidence] = useState<number>(98.4);
  const [aiRecommendedGrade, setAiRecommendedGrade] = useState<ProduceGrade>('Grade A');

  // Governance & Override State
  const [isOverrideModalOpen, setIsOverrideModalOpen] = useState(false);
  const [overrideGrade, setOverrideGrade] = useState<ProduceGrade>('Grade B');
  const [human1Signature, setHuman1Signature] = useState('insp-042 (Lead Inspector)');
  const [human2Signature, setHuman2Signature] = useState('');
  const [overrideReason, setOverrideReason] = useState('Minor skin blemish under ambient light');
  const [inspectionSuccessMsg, setInspectionSuccessMsg] = useState<string | null>(null);

  const activeLot = AgriTrustDatabase.getLotById(selectedLotId) || AgriTrustDatabase.getFarmerLots('fp-01')[0];
  const lotQuality = AgriTrustDatabase.getLotQuality(selectedLotId);
  const lotDocuments = AgriTrustDatabase.getLotDocuments(selectedLotId);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = FileSecurityManager.validateUpload(file.name, file.type, file.size);
    if (!validation.valid) {
      setFileError(validation.reason || 'File security check failed');
      setScannedFileName(null);
    } else {
      setFileError(null);
      setScannedFileName(file.name);
      runSpectrovisionScan();
    }
  };

  const runSpectrovisionScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      // Simulate spectral variation
      setSpectralBrix(+(8.8 + Math.random() * 1.0).toFixed(1));
      setColorUniformity(+(98.5 + Math.random() * 1.0).toFixed(1));
      setSurfaceDefectsPercent(+(0.2 + Math.random() * 0.4).toFixed(2));
      setAiConfidence(+(97.5 + Math.random() * 1.5).toFixed(1));
    }, 1200);
  };

  const handleAcceptAIGrade = () => {
    const updatedQuality: LotQuality = {
      id: `lq-inspect-${Date.now()}`,
      lotId: selectedLotId,
      grade: aiRecommendedGrade,
      aiConfidenceScore: aiConfidence,
      inspectorId,
      inspectionDate: new Date().toISOString(),
      defectsDetected: [`Surface defects ${surfaceDefectsPercent}%`, `Brix firmness ${spectralBrix}°Bx`],
      status: 'ACCEPTED',
    };

    AgriTrustDatabase.updateLotQuality(selectedLotId, updatedQuality);

    // Add Quality Cert Document
    const certHash = `sha256_qc_${selectedLotId}_${Math.random().toString(36).substring(2, 8)}`;
    AgriTrustDatabase.addLotDocument(selectedLotId, {
      id: `ld-cert-${Date.now()}`,
      lotId: selectedLotId,
      documentType: 'QUALITY_CERT',
      fileUrl: `/docs/quality_cert_${selectedLotId}.pdf`,
      fileHash: certHash,
      uploadedAt: new Date().toISOString(),
    });

    AuditLedger.logOperationalEvent(
      inspectorId,
      'OPERATIONS',
      'ACCEPT_AI_GRADE',
      `LOT:${selectedLotId}`,
      `Inspector accepted AI spectrovision grade '${aiRecommendedGrade}' (Confidence: ${aiConfidence}%). Certificate hash: ${certHash}`
    );

    setInspectionSuccessMsg(`Quality Inspection Certified! Approved Grade: ${aiRecommendedGrade}. Cryptographic Quality Certificate Hash: ${certHash}`);
  };

  const handleExecuteTwoHumanOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!human2Signature) {
      alert('Two-Human Governance Rule: Human #2 Supervisor sign-off signature is required when AI confidence > 90%.');
      return;
    }

    // Two-Human Approval Engine Check
    const approval = AIGovernanceEngine.createApprovalRequest(
      `OVERRIDE_AI_GRADE_${selectedLotId}`,
      'HIGH',
      human1Signature
    );
    AIGovernanceEngine.signApprovalHuman2(approval.id, human2Signature);

    const updatedQuality: LotQuality = {
      id: `lq-override-${Date.now()}`,
      lotId: selectedLotId,
      grade: overrideGrade,
      aiConfidenceScore: aiConfidence,
      inspectorId,
      inspectionDate: new Date().toISOString(),
      defectsDetected: [`Override Reason: ${overrideReason}`, `Human 1: ${human1Signature}`, `Human 2: ${human2Signature}`],
      status: 'ACCEPTED',
    };

    AgriTrustDatabase.updateLotQuality(selectedLotId, updatedQuality);

    const certHash = `sha256_qc_override_${selectedLotId}_${Math.random().toString(36).substring(2, 8)}`;
    AgriTrustDatabase.addLotDocument(selectedLotId, {
      id: `ld-cert-override-${Date.now()}`,
      lotId: selectedLotId,
      documentType: 'QUALITY_CERT',
      fileUrl: `/docs/quality_cert_override_${selectedLotId}.pdf`,
      fileHash: certHash,
      uploadedAt: new Date().toISOString(),
    });

    AuditLedger.logOperationalEvent(
      inspectorId,
      'OPERATIONS',
      'OVERRIDE_AI_GRADE',
      `LOT:${selectedLotId}`,
      `Two-Human Grade Override Executed (${human1Signature} + ${human2Signature}). Grade overridden from ${aiRecommendedGrade} to ${overrideGrade}.`
    );

    setIsOverrideModalOpen(false);
    setInspectionSuccessMsg(`Two-Human Grade Override Executed! Certified Grade: ${overrideGrade}. Quality Certificate Hash: ${certHash}`);
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Workspace Header */}
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-brand" style={{ fontSize: '0.75rem' }}>
                  QUALITY INSPECTION WORKSPACE
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                  <Cpu size={12} /> AI Spectrovision Active
                </span>
              </div>
              <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
                Spectrovision Quality Inspection & AI Grading
              </h1>
              <p className="text-secondary text-xs" style={{ marginTop: '0.15rem' }}>
                Lead Inspector ID: <strong>{inspectorId}</strong> • Protocol Version: <strong>AGRI-SPEC-v4.2</strong>
              </p>
            </div>

            {/* Lot Selector */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <label className="text-xs font-semibold text-muted">Target Lot:</label>
              <select
                value={selectedLotId}
                onChange={(e) => setSelectedLotId(e.target.value)}
                className="input-field"
                style={{ width: '220px', fontFamily: 'monospace', fontWeight: 600 }}
              >
                <option value="AT-LOT-2026-000922">AT-LOT-2026-000922</option>
                <option value="AT-LOT-2026-000923">AT-LOT-2026-000923</option>
                <option value="AT-LOT-2026-000924">AT-LOT-2026-000924</option>
              </select>
            </div>
          </div>
        </div>

        {inspectionSuccessMsg && (
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--brand-primary-light)',
            color: 'var(--brand-primary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '2rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={18} /> {inspectionSuccessMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Panel 1: Spectrovision Scan Input */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3 className="text-xl font-bold">1. Spectrovision Scan Input</h3>
              <button
                onClick={runSpectrovisionScan}
                className="btn btn-secondary btn-sm"
                disabled={isScanning}
              >
                <RefreshCw size={14} className={isScanning ? 'spin' : ''} /> Simulate Wavelength Scan
              </button>
            </div>

            <div style={{
              padding: '2rem',
              border: '2px dashed var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              textAlign: 'center',
              backgroundColor: 'var(--bg-surface-elevated)',
              marginBottom: '1.25rem'
            }}>
              <Upload size={36} color="var(--brand-primary)" style={{ marginBottom: '0.75rem' }} />
              <p className="font-semibold text-sm">Upload Produce Sample Scan File</p>
              <p className="text-muted text-xs" style={{ marginTop: '0.25rem' }}>NIR Wavelength Spectral File (.PDF, .JPG, .PNG under 10MB)</p>

              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileUpload}
                style={{ marginTop: '1rem' }}
              />

              {scannedFileName && (
                <div style={{ marginTop: '1rem', color: 'var(--status-success)', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem' }}>
                  <FileCheck size={16} /> File Security Validated: {scannedFileName}
                </div>
              )}

              {fileError && (
                <div style={{ marginTop: '1rem', color: 'var(--status-danger)', fontSize: '0.8125rem' }}>
                  {fileError}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <span>Target Lot: <strong style={{ fontFamily: 'monospace' }}>{selectedLotId}</strong></span>
              <span>Intake Status: <span className="badge badge-brand">{activeLot?.status || 'VERIFIED'}</span></span>
            </div>
          </div>

          {/* Panel 2: AI Spectrovision Spectral Analysis */}
          <div className="card" style={{ padding: '2rem' }}>
            <h3 className="text-xl font-bold" style={{ marginBottom: '1.25rem' }}>2. Wavelength Reflectance Analysis</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>NIR Firmness (Brix)</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                  {spectralBrix}°Bx
                </div>
                <span className="text-muted text-xs">Optimum Range: 8.5 - 10.0°Bx</span>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>RGB Color Uniformity</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                  {colorUniformity}%
                </div>
                <span className="text-muted text-xs">Surface Uniformity Grade A</span>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>Surface Defects</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '0.2rem' }}>
                  {surfaceDefectsPercent}%
                </div>
                <span className="text-muted text-xs">Threshold: &lt;1.5%</span>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>AI Model Confidence</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-accent)', marginTop: '0.2rem' }}>
                  {aiConfidence}%
                </div>
                <span className="text-muted text-xs">Model: Spectro-v4.2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Panel 3 & 4: AI Grade Recommendation & Two-Human Governance */}
        <div className="card" style={{ padding: '2rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
            <div>
              <span className="text-muted text-xs font-bold" style={{ textTransform: 'uppercase' }}>AI OFFICIAL GRADE RECOMMENDATION</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem' }}>
                <span className="text-3xl font-bold" style={{ color: 'var(--brand-primary)' }}>
                  {aiRecommendedGrade}
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.8125rem' }}>
                  <CheckCircle2 size={14} /> High AI Confidence ({aiConfidence}%)
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={handleAcceptAIGrade} className="btn btn-primary">
                <CheckCircle2 size={16} /> Accept & Certify AI Grade A
              </button>
              <button onClick={() => setIsOverrideModalOpen(true)} className="btn btn-secondary">
                <AlertTriangle size={16} /> Request Two-Human Override
              </button>
            </div>
          </div>
        </div>

        {/* Two-Human Override Governance Modal */}
        {isOverrideModalOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}>
            <div className="card" style={{ maxWidth: '540px', width: '100%', padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
                <div style={{ padding: '0.625rem', borderRadius: 'var(--radius-md)', backgroundColor: 'rgba(230, 81, 0, 0.1)', color: 'var(--brand-accent)' }}>
                  <Lock size={22} />
                </div>
                <div>
                  <h3 className="text-xl font-bold">Two-Human Grade Override Governance</h3>
                  <p className="text-secondary text-xs">AI Confidence &gt; 90% requires dual independent cryptographic sign-off.</p>
                </div>
              </div>

              <form onSubmit={handleExecuteTwoHumanOverride}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div className="input-group">
                    <label className="input-label">Target Overridden Grade</label>
                    <select
                      value={overrideGrade}
                      onChange={(e) => setOverrideGrade(e.target.value as ProduceGrade)}
                      className="input-field"
                    >
                      <option value="Grade B">Grade B (Minor Defect Variance)</option>
                      <option value="Grade C">Grade C (Processing Quality)</option>
                      <option value="REJECTED">REJECTED (Failed Quality Standards)</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label className="input-label">Human #1 Signature (Lead Inspector)</label>
                    <input
                      type="text"
                      value={human1Signature}
                      onChange={(e) => setHuman1Signature(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Human #2 Signature (Quality Supervisor)</label>
                    <input
                      type="text"
                      placeholder="e.g. sup-009 (Operations Supervisor)"
                      value={human2Signature}
                      onChange={(e) => setHuman2Signature(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label className="input-label">Override Justification Reason</label>
                    <input
                      type="text"
                      value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setIsOverrideModalOpen(false)} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary">
                    <UserCheck size={16} /> Execute Dual Sign-Off Override
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
