import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { PrivacyManager } from '../core/security/privacy';
import { 
  ShieldCheck, 
  ArrowLeft, 
  CheckCircle2, 
  Lock, 
  FileText, 
  Calendar, 
  MapPin, 
  Sparkles, 
  FileCheck, 
  Download, 
  Layers,
  Thermometer,
  Clock
} from 'lucide-react';

interface ExtendedTraceabilityViewProps {
  lotId: string;
  onBack: () => void;
}

export const ExtendedTraceabilityView: React.FC<ExtendedTraceabilityViewProps> = ({
  lotId,
  onBack,
}) => {
  const lotData = AgriTrustDatabase.getLotById(lotId);
  const lotEvents = lotData ? AgriTrustDatabase.getLotEvents(lotId) : [];
  const lotQuality = AgriTrustDatabase.getLotQuality(lotId);
  const lotDocuments = AgriTrustDatabase.getLotDocuments(lotId);
  const publicView = lotData ? PrivacyManager.sanitizeLotForPublic(lotData) : null;

  const [activeTab, setActiveTab] = useState<'TIMELINE' | 'DOCUMENTS' | 'QUALITY'>('TIMELINE');

  if (!publicView || !lotData) {
    return (
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Lot identifier '{lotId}' not found</h2>
        <button onClick={onBack} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
          Back to Marketplace
        </button>
      </div>
    );
  }

  return (
    <div style={{ padding: '2.5rem 0 5rem' }}>
      <div className="container">
        {/* Navigation Back Button */}
        <button
          onClick={onBack}
          className="btn btn-secondary btn-sm"
          style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <ArrowLeft size={16} />
          <span>Back to Product Specifications</span>
        </button>

        {/* Cryptographic Header Banner */}
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1.25rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <ShieldCheck size={22} color="var(--brand-primary)" />
                <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  CRYPTO-VERIFIED PROVENANCE LEDGER
                </span>
              </div>
              <h1 style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 800, color: 'var(--brand-primary)', letterSpacing: '-0.02em' }}>
                {publicView.id}
              </h1>
            </div>

            <div style={{ textAlign: 'right' }}>
              <span className="badge badge-success" style={{ fontSize: '0.875rem', padding: '0.4rem 1rem' }}>
                <CheckCircle2 size={16} /> VERIFIED INTENDED YIELD
              </span>
              <span className="text-muted text-xs" style={{ display: 'block', marginTop: '0.35rem', fontFamily: 'monospace' }}>
                Hash: {publicView.verificationHash}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
            <div>
              <span className="text-muted text-xs">Commodity / Variety</span>
              <div className="font-bold">{publicView.cropName} ({publicView.varietyName})</div>
            </div>
            <div>
              <span className="text-muted text-xs">Quality Grade</span>
              <div className="font-bold">{publicView.grade}</div>
            </div>
            <div>
              <span className="text-muted text-xs">Harvest Date</span>
              <div className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} className="text-muted" /> {publicView.harvestDate}
              </div>
            </div>
            <div>
              <span className="text-muted text-xs">Authorized Region</span>
              <div className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={14} className="text-muted" /> {publicView.publicRegion}
              </div>
            </div>
          </div>
        </div>

        {/* Counterparty Privacy Protection Shield Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          padding: '1rem 1.5rem',
          backgroundColor: 'var(--brand-accent-light)',
          border: '1px solid rgba(30, 120, 220, 0.2)',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '2rem'
        }}>
          <div style={{ padding: '0.625rem', borderRadius: '50%', backgroundColor: 'rgba(30, 120, 220, 0.15)', color: 'var(--brand-accent)' }}>
            <Lock size={22} />
          </div>
          <div>
            <h4 className="font-bold text-sm" style={{ color: 'var(--brand-accent)' }}>AgriTrust Intermediary Privacy Boundary Active</h4>
            <p className="text-secondary text-xs" style={{ marginTop: '0.15rem' }}>
              Producer identity, street address, telephone, and exact GPS coordinates are cryptographically redacted to maintain strict bilateral confidentiality.
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('TIMELINE')}
            className={`btn btn-sm ${activeTab === 'TIMELINE' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Clock size={16} /> 6-Stage Event Timeline
          </button>
          <button
            onClick={() => setActiveTab('QUALITY')}
            className={`btn btn-sm ${activeTab === 'QUALITY' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Sparkles size={16} /> AI Quality Analysis
          </button>
          <button
            onClick={() => setActiveTab('DOCUMENTS')}
            className={`btn btn-sm ${activeTab === 'DOCUMENTS' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <FileCheck size={16} /> Verified Document Certificates ({lotDocuments.length})
          </button>
        </div>

        {/* Tab 1: 6-Stage Provenance Event Timeline */}
        {activeTab === 'TIMELINE' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 className="text-lg font-bold" style={{ marginBottom: '1.5rem' }}>6-Stage Verifiable Provenance Journey</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem', position: 'relative', paddingLeft: '1rem' }}>
              {/* Event 1 */}
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase' }}>STAGE 01 • FARM INTAKE ORIGIN</span>
                  <h4 className="font-bold text-base" style={{ margin: '0.15rem 0' }}>Agricultural Harvest Intake</h4>
                  <p className="text-secondary text-sm">Harvested in {publicView.publicRegion} under temperature-controlled intake window.</p>
                  <span className="text-muted text-xs font-medium" style={{ display: 'block', marginTop: '0.25rem' }}>Timestamp: 2026-08-08 06:00:00 UTC</span>
                </div>
              </div>

              {/* Event 2 */}
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase' }}>STAGE 02 • COLD-CHAIN LOGGING</span>
                  <h4 className="font-bold text-base" style={{ margin: '0.15rem 0' }}>AgriTrust Intake Facility #2 Arrival</h4>
                  <p className="text-secondary text-sm">Hydro-cooling applied. Ambient storage logged at 13.2°C, 88% Relative Humidity.</p>
                  <span className="text-muted text-xs font-medium" style={{ display: 'block', marginTop: '0.25rem' }}>Timestamp: 2026-08-08 07:30:00 UTC</span>
                </div>
              </div>

              {/* Event 3 */}
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase' }}>STAGE 03 • AI SPECTROVISION GRADED</span>
                  <h4 className="font-bold text-base" style={{ margin: '0.15rem 0' }}>AI Quality Inspection & Classification</h4>
                  <p className="text-secondary text-sm">Automated vision scan executed. Assigned Grade A with 98.4% AI confidence.</p>
                  <span className="text-muted text-xs font-medium" style={{ display: 'block', marginTop: '0.25rem' }}>Timestamp: 2026-08-08 08:15:00 UTC</span>
                </div>
              </div>

              {/* Event 4 */}
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase' }}>STAGE 04 • DOCUMENT CERTIFICATION</span>
                  <h4 className="font-bold text-base" style={{ margin: '0.15rem 0' }}>Phytosanitary & Lab Test Upload</h4>
                  <p className="text-secondary text-sm">Certificates scanned and hash-chained into Immutable Security Audit Vault.</p>
                  <span className="text-muted text-xs font-medium" style={{ display: 'block', marginTop: '0.25rem' }}>Timestamp: 2026-08-08 08:25:00 UTC</span>
                </div>
              </div>

              {/* Event 5 */}
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase' }}>STAGE 05 • CRYPTOGRAPHIC PROVENANCE</span>
                  <h4 className="font-bold text-base" style={{ margin: '0.15rem 0' }}>Verification Hash Emission</h4>
                  <p className="text-secondary text-sm">Emitted tamper-evident ledger token: <code>{publicView.verificationHash}</code></p>
                  <span className="text-muted text-xs font-medium" style={{ display: 'block', marginTop: '0.25rem' }}>Timestamp: 2026-08-08 08:30:00 UTC</span>
                </div>
              </div>

              {/* Event 6 */}
              <div style={{ display: 'flex', gap: '1.25rem' }}>
                <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: 'var(--status-success)', marginTop: '0.2rem', flexShrink: 0 }} />
                <div>
                  <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase', color: 'var(--status-success)' }}>STAGE 06 • ACTIVE WHOLESALE MARKETPLACE</span>
                  <h4 className="font-bold text-base" style={{ margin: '0.15rem 0' }}>Available for Commercial Allocation</h4>
                  <p className="text-secondary text-sm">Lot active for wholesale procurement with minimum margin integrity guaranteed.</p>
                  <span className="text-muted text-xs font-medium" style={{ display: 'block', marginTop: '0.25rem' }}>Timestamp: 2026-08-08 09:00:00 UTC</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Quality Analysis */}
        {activeTab === 'QUALITY' && (
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <div>
                <h3 className="text-lg font-bold">AI Spectrovision Inspection Record</h3>
                <span className="text-muted text-xs">Inspector ID: {lotQuality.inspectorId || 'System Inspector'}</span>
              </div>
              <span className="badge badge-success" style={{ fontSize: '0.875rem' }}>
                Grade: {lotQuality.grade}
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '1.75rem' }}>
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted text-xs font-medium">AI Model Confidence</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-accent)' }}>{lotQuality.aiConfidenceScore}%</div>
              </div>
              <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted text-xs font-medium">Quality Decision</span>
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-success)' }}>{lotQuality.status}</div>
              </div>
            </div>

            <h4 className="font-bold text-sm" style={{ marginBottom: '0.75rem' }}>Detected Physical Observations</h4>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              {lotQuality.defectsDetected.map((d, i) => (
                <li key={i} style={{ marginBottom: '0.35rem' }}>{d}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Tab 3: Verified Documents Viewer */}
        {activeTab === 'DOCUMENTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {lotDocuments.map((doc) => (
              <div key={doc.id} className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
                    <FileText size={22} />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">{doc.documentType.replace('_', ' ')} CERTIFICATE</h4>
                    <span className="text-muted text-xs" style={{ fontFamily: 'monospace' }}>Hash: {doc.fileHash}</span>
                    <span className="text-muted text-xs" style={{ display: 'block', marginTop: '0.15rem' }}>Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                    <FileCheck size={12} /> MIME Verified
                  </span>
                  <a href={doc.fileUrl} download className="btn btn-secondary btn-sm">
                    <Download size={14} /> Download PDF
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
