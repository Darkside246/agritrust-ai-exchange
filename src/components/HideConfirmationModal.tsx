import React from 'react';
import { EyeOff, AlertTriangle } from 'lucide-react';

interface HideConfirmationModalProps {
  isOpen: boolean;
  lotId: string;
  commodity: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const HideConfirmationModal: React.FC<HideConfirmationModalProps> = ({
  isOpen,
  lotId,
  commodity,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
      <div className="card" style={{ maxWidth: '480px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', boxShadow: 'var(--shadow-lg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--brand-accent)' }}>
          <div style={{ padding: '0.625rem', borderRadius: '50%', backgroundColor: 'rgba(230, 81, 0, 0.15)' }}>
            <EyeOff size={24} />
          </div>
          <h3 className="text-xl font-bold">Hide Wholesale Lot?</h3>
        </div>

        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <p style={{ fontWeight: 700, fontFamily: 'monospace', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
            {lotId} ({commodity})
          </p>
          The lot will immediately disappear from the public marketplace, search results, category listings, and public APIs. It will remain fully available, editable, and traceable inside the Admin Portal.
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.875rem', marginTop: '0.5rem' }}>
          <button onClick={onCancel} className="btn btn-secondary btn-md">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="btn btn-primary btn-md"
            style={{ backgroundColor: 'var(--brand-accent)', borderColor: 'var(--brand-accent)', color: '#fff' }}
          >
            Hide Lot
          </button>
        </div>
      </div>
    </div>
  );
};
