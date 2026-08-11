import React from 'react';
import { Lot } from '../core/database/schema';
import { Eye, Edit3, CheckCircle2, XCircle, ShieldCheck, MapPin, Calendar, Lock } from 'lucide-react';

interface AdminPreviewModalProps {
  isOpen: boolean;
  lot: Lot | null;
  previewToken?: string;
  onClose: () => void;
  onEdit: (lot: Lot) => void;
  onPublish: (lotId: string) => void;
}

export const AdminPreviewModal: React.FC<AdminPreviewModalProps> = ({
  isOpen,
  lot,
  previewToken,
  onClose,
  onEdit,
  onPublish,
}) => {
  if (!isOpen || !lot) return null;

  return (
    <div className="modal-backdrop" style={{ display: 'flex', flexDirection: 'column', zIndex: 1200, backgroundColor: 'rgba(0, 0, 0, 0.85)', overflowY: 'auto' }}>
      {/* Top Banner: PREVIEW MODE */}
      <div style={{
        backgroundColor: '#E65100',
        color: '#FFFFFF',
        padding: '0.875rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 700, fontSize: '0.875rem' }}>
          <Eye size={20} />
          <span>PREVIEW MODE — This product is not currently published. Only authorised AgriTrust administrators can view this preview.</span>
          {previewToken && <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', backgroundColor: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>Token: {previewToken.substring(0, 14)}...</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button
            onClick={() => onEdit(lot)}
            className="btn btn-sm"
            style={{ backgroundColor: '#FFFFFF', color: '#E65100', fontWeight: 700, border: 'none' }}
          >
            <Edit3 size={14} /> Edit
          </button>
          {lot.publicationStatus !== 'PUBLISHED' && (
            <button
              onClick={() => onPublish(lot.id)}
              className="btn btn-sm"
              style={{ backgroundColor: '#108043', color: '#FFFFFF', fontWeight: 700, border: 'none' }}
            >
              <CheckCircle2 size={14} /> Publish Now
            </button>
          )}
          <button
            onClick={onClose}
            className="btn btn-sm"
            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFFFFF', border: 'none' }}
          >
            <XCircle size={14} /> Exit Preview
          </button>
        </div>
      </div>

      {/* Preview Container */}
      <div className="container" style={{ margin: '2rem auto', maxWidth: '850px' }}>
        <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Header Badge */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}>
                ADMIN PREVIEW VIEW • {lot.publicationStatus}
              </span>
              <h1 className="text-3xl font-bold">{lot.commodity} - {lot.variety}</h1>
              <p className="text-secondary text-sm" style={{ fontFamily: 'monospace', marginTop: '0.25rem' }}>
                Cryptographic Token: {lot.id}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                ${lot.wholesalePrice.toFixed(2)} <span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--text-muted)' }}>/ {lot.unit}</span>
              </div>
              <div className="text-xs text-muted">MOQ: {lot.moq} {lot.moqUnit}s</div>
            </div>
          </div>

          {/* Product Image & Specs */}
          <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
            <img
              src={lot.productImage}
              alt={lot.commodity}
              style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p className="text-secondary text-sm" style={{ lineHeight: 1.6 }}>{lot.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', fontSize: '0.8125rem' }}>
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <span className="text-muted text-xs block">Quality Grade</span>
                  <strong style={{ color: 'var(--brand-primary)' }}>{lot.grade}</strong>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <span className="text-muted text-xs block">Available Stock</span>
                  <strong>{lot.availableStock.toLocaleString()} {lot.unit}s</strong>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <span className="text-muted text-xs block">Intake Zone</span>
                  <strong>{lot.publicRegion || 'Western Agricultural Zone 4'}</strong>
                </div>

                <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <span className="text-muted text-xs block">Harvest Date</span>
                  <strong>{lot.harvestDate}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Governance Footer */}
          <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--brand-primary-light)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--brand-primary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShieldCheck size={18} />
              <span>AgriTrust Verified Wholesale Intermediary Provenance Protected</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={14} /> Bilateral Privacy Shield Active
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
