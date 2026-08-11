import React from 'react';
import { Product } from '../core/database/schema';
import { X, Trash2, Plus, Minus, ShieldCheck, ShoppingBag, ArrowRight, AlertTriangle } from 'lucide-react';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onProceedToCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
}) => {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.product.pricePerUnit * item.quantity, 0);
  const estimatedLogisticsFee = subtotal > 0 ? 45.00 : 0.00;
  const platformFee = subtotal > 0 ? Number((subtotal * 0.025).toFixed(2)) : 0.00; // 2.5% platform fee
  const grandTotal = subtotal + estimatedLogisticsFee + platformFee;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ justifyContent: 'flex-end', padding: 0 }}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '480px',
          height: '100vh',
          maxHeight: '100vh',
          borderRadius: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Cart Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
            <ShoppingBag size={20} color="var(--brand-primary)" />
            <h2 className="text-lg font-bold">Wholesale Procurement Cart</h2>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon">
            <X size={18} />
          </button>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: '1', overflowY: 'auto', padding: '1.25rem' }}>
          {cartItems.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {cartItems.map(({ product, quantity }) => {
                const isBelowMOQ = quantity < product.moqUnits;

                return (
                  <div
                    key={product.id}
                    style={{
                      padding: '1rem',
                      backgroundColor: 'var(--bg-surface-elevated)',
                      border: `1px solid ${isBelowMOQ ? 'var(--status-danger)' : 'var(--border-color)'}`,
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      gap: '1rem'
                    }}
                  >
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: 'var(--radius-md)' }}
                    />

                    <div style={{ flex: '1' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <h4 className="text-sm font-bold">{product.name}</h4>
                          <span className="text-muted text-xs">Variety: {product.variety}</span>
                        </div>
                        <button
                          onClick={() => onRemoveItem(product.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      {/* Lot Identifier Badge */}
                      <div style={{ marginTop: '0.25rem', marginBottom: '0.5rem' }}>
                        <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>
                          <ShieldCheck size={11} /> {product.lotId}
                        </span>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity - 5)}
                            className="btn btn-secondary btn-icon btn-sm"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="font-bold text-sm" style={{ width: '40px', textAlign: 'center' }}>
                            {quantity}
                          </span>
                          <button
                            onClick={() => onUpdateQuantity(product.id, quantity + 5)}
                            className="btn btn-secondary btn-icon btn-sm"
                          >
                            <Plus size={12} />
                          </button>
                          <span className="text-muted text-xs">{product.unit}s</span>
                        </div>

                        <span className="font-bold text-sm" style={{ color: 'var(--brand-primary)' }}>
                          ${(quantity * product.pricePerUnit).toFixed(2)}
                        </span>
                      </div>

                      {/* MOQ Validation Warning */}
                      {isBelowMOQ && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-danger)', fontSize: '0.75rem', marginTop: '0.5rem' }}>
                          <AlertTriangle size={12} /> Must order minimum {product.moqUnits} {product.unit}s
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
              <ShoppingBag size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
              <p className="font-medium text-base">Your procurement cart is empty</p>
              <p className="text-xs" style={{ marginTop: '0.25rem' }}>Browse wholesale lots and add items to begin procurement.</p>
            </div>
          )}
        </div>

        {/* Cart Summary Footer */}
        {cartItems.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            backgroundColor: 'var(--bg-surface)',
            borderTop: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.625rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span className="text-muted">Subtotal</span>
              <span className="font-medium">${subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span className="text-muted">Est. Cold-Chain Logistics</span>
              <span className="font-medium">${estimatedLogisticsFee.toFixed(2)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span className="text-muted">Platform Intermediary Fee (2.5%)</span>
              <span className="font-medium">${platformFee.toFixed(2)}</span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.25rem',
              fontWeight: 800,
              paddingTop: '0.75rem',
              borderTop: '1px dashed var(--border-color)',
              marginTop: '0.25rem'
            }}>
              <span>Total Landed Price</span>
              <span style={{ color: 'var(--brand-primary)' }}>${grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={onProceedToCheckout}
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '0.75rem' }}
            >
              <span>Proceed to Account Gate</span>
              <ArrowRight size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
