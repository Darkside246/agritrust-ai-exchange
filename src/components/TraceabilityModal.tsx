import React, { useState } from 'react';
import { X, ShieldCheck, Search, CheckCircle2, Lock, FileText, Calendar, MapPin } from 'lucide-react';
import { AgriTrustDatabase } from '../core/database/db';
import { PrivacyManager } from '../core/security/privacy';

interface TraceabilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLotId?: string;
}

export const TraceabilityModal: React.FC<TraceabilityModalProps> = ({
  isOpen,
  onClose,
  initialLotId = 'AT-LOT-2026-000922',
}) => {
  if (!isOpen) return null;

  const [lotIdQuery, setLotIdQuery] = useState(initialLotId);
  const [activeLotId, setActiveLotId] = useState(initialLotId);

  const lotData = AgriTrustDatabase.getLotById(activeLotId);
  const lotEvents = lotData ? AgriTrustDatabase.getLotEvents(activeLotId) : [];
  const publicView = lotData ? PrivacyManager.sanitizeLotForPublic(lotData) : null;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (lotIdQuery.trim()) {
      setActiveLotId(lotIdQuery.trim().toUpperCase());
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', padding: '2rem' }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--brand-primary-light)',
            color: 'var(--brand-primary)'
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 className="text-xl font-bold">Public Traceability Ledger</h3>
            <p className="text-secondary text-xs">Verify harvest origin, quality grade, and lot status.</p>
          </div>
        </div>

        {/* Lot ID Search Form */}
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem' }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Enter Lot ID (e.g. AT-LOT-2026-000922)"
              value={lotIdQuery}
              onChange={(e) => setLotIdQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem', textTransform: 'uppercase', fontFamily: 'monospace', fontWeight: 600 }}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Verify Lot
          </button>
        </form>

        {/* Lot Verification Result */}
        {publicView ? (
          <div>
            {/* Status Summary Banner */}
            <div style={{
              padding: '1.25rem',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-lg)',
              marginBottom: '1.5rem'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>LOT IDENTIFIER</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                    {publicView.id}
                  </span>
                </div>
                <span className="badge badge-success" style={{ fontSize: '0.8125rem' }}>
                  <CheckCircle2 size={14} /> VERIFIED & ACTIVE
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.875rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
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
                  <span className="text-muted text-xs">Origin Region</span>
                  <div className="font-medium" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MapPin size={14} className="text-muted" /> {publicView.publicRegion}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Redaction Notice */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.625rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--brand-accent-light)',
              border: '1px solid rgba(30, 120, 220, 0.2)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.5rem',
              fontSize: '0.75rem',
              color: 'var(--brand-accent)'
            }}>
              <Lock size={16} style={{ flexShrink: 0 }} />
              <span>
                <strong>Counterparty Privacy Enforced:</strong> Producer identity, precise GPS coordinates, phone numbers, and address details remain securely protected inside AgriTrust core.
              </span>
            </div>

            {/* Event Timeline */}
            <h4 className="text-sm font-bold" style={{ marginBottom: '1rem' }}>Provenience Audit Event Timeline</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingLeft: '0.5rem' }}>
              {lotEvents.map((evt, idx) => (
                <div key={evt.id} style={{ display: 'flex', gap: '1rem', position: 'relative' }}>
                  <div style={{
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--brand-primary)',
                    marginTop: '0.25rem',
                    flexShrink: 0
                  }} />
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="font-bold text-sm">{evt.eventType}</span>
                      <span className="text-muted text-xs">{new Date(evt.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-secondary text-xs" style={{ marginTop: '0.15rem' }}>{evt.locationSummary}</p>
                    {evt.notes && <p className="text-muted text-xs" style={{ fontStyle: 'italic', marginTop: '0.15rem' }}>{evt.notes}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <FileText size={40} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <p className="font-medium text-base">Lot identifier not found</p>
            <p className="text-xs" style={{ marginTop: '0.25rem' }}>Please verify the lot identifier and try again. Example: AT-LOT-2026-000922</p>
          </div>
        )}
      </div>
    </div>
  );
};
