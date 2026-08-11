import React, { useState } from 'react';
import { Product } from '../core/database/schema';
import { X, ShieldCheck, Calendar, MapPin, Truck, Plus, Minus, CheckCircle, Info } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onOpenTraceability: (lotId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onOpenTraceability,
}) => {
  if (!product) return null;

  const [quantity, setQuantity] = useState<number>(product.moqUnits);

  const handleIncrement = () => {
    if (quantity < product.availableUnits) {
      setQuantity((prev) => prev + 10);
    }
  };

  const handleDecrement = () => {
    if (quantity > product.moqUnits) {
      setQuantity((prev) => Math.max(product.moqUnits, prev - 10));
    }
  };

  const lineSubtotal = Number((quantity * product.pricePerUnit).toFixed(2));

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '720px', padding: '0' }}
      >
        {/* Header Banner */}
        <div style={{ position: 'relative', height: '240px', backgroundColor: 'var(--bg-surface-elevated)' }}>
          <img
            src={product.imageUrl}
            alt={product.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              width: '2.25rem',
              height: '2.25rem',
              borderRadius: '50%',
              backgroundColor: 'rgba(0,0,0,0.6)',
              color: '#ffffff',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-success">{product.grade}</span>
            <span className="badge badge-brand">
              <ShieldCheck size={13} /> {product.lotId}
            </span>
          </div>

          <h2 className="text-2xl font-bold" style={{ marginBottom: '0.25rem' }}>
            {product.name}
          </h2>
          <div className="text-muted text-sm font-medium" style={{ marginBottom: '1.25rem' }}>
            Variety: {product.variety} • Category: {product.category}
          </div>

          <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
            {product.description}
          </p>

          {/* Traceability Summary Card */}
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--brand-primary-light)',
            border: '1px solid rgba(16, 128, 67, 0.2)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-primary)' }}>
                <ShieldCheck size={18} />
                <span className="font-bold text-sm">Verified AgriTrust Lot Provenance</span>
              </div>
              <button
                onClick={() => onOpenTraceability(product.lotId)}
                className="btn btn-outline btn-sm"
                style={{ backgroundColor: 'var(--bg-surface)' }}
              >
                Inspect Public Ledger
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.75rem', fontSize: '0.8125rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={14} className="text-muted" /> Harvested: <strong>{product.harvestDate}</strong>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={14} className="text-muted" /> Origin: <strong>{product.publicRegion}</strong>
              </div>
            </div>
          </div>

          {/* Wholesale Pricing & MOQ Selector */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '1.25rem',
            padding: '1.25rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '1.75rem'
          }}>
            <div>
              <span className="text-muted text-xs font-medium">Wholesale Unit Price</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                ${product.pricePerUnit.toFixed(2)} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ {product.unit}</span>
              </div>
              <span className="text-muted text-xs" style={{ display: 'block', marginTop: '0.25rem' }}>
                Available Stock: {product.availableUnits.toLocaleString()} {product.unit}s
              </span>
            </div>

            <div>
              <span className="text-muted text-xs font-medium" style={{ display: 'block', marginBottom: '0.35rem' }}>
                Order Quantity (MOQ: {product.moqUnits} {product.unit}s)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  onClick={handleDecrement}
                  className="btn btn-secondary btn-icon"
                  disabled={quantity <= product.moqUnits}
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || product.moqUnits;
                    setQuantity(Math.max(product.moqUnits, Math.min(product.availableUnits, val)));
                  }}
                  className="input-field"
                  style={{ textAlign: 'center', fontWeight: 700, fontSize: '1rem', padding: '0.35rem' }}
                />
                <button
                  onClick={handleIncrement}
                  className="btn btn-secondary btn-icon"
                  disabled={quantity >= product.availableUnits}
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Total & Action Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <span className="text-muted text-xs">Estimated Order Subtotal</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800 }}>
                ${lineSubtotal.toFixed(2)}
              </div>
            </div>

            <button
              onClick={() => {
                onAddToCart(product, quantity);
                onClose();
              }}
              className="btn btn-primary btn-lg"
            >
              <Plus size={18} />
              <span>Add {quantity} {product.unit}s to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
