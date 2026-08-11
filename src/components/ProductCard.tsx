import React from 'react';
import { Product } from '../core/database/schema';
import { ShieldCheck, Plus, Eye, Truck, Calendar } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onViewDetails,
}) => {
  const productImage = product.imageUrl || 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Product Image & Badges Overlay */}
      <div style={{ position: 'relative', height: '180px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-surface-elevated)' }}>
        <img
          src={productImage}
          alt={product.name}
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=800&q=80';
          }}
        />
        
        {/* Grade Badge */}
        <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
          <span className="badge badge-success">
            {product.grade}
          </span>
        </div>

        {/* Traceability Lot Badge */}
        <div style={{ position: 'absolute', top: '0.75rem', right: '0.75rem' }}>
          <span className="badge badge-brand" style={{ backdropFilter: 'blur(8px)', backgroundColor: 'rgba(255,255,255,0.9)', boxShadow: 'var(--shadow-sm)' }}>
            <ShieldCheck size={13} />
            {product.lotId}
          </span>
        </div>
      </div>

      {/* Product Details Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: '1', justifyContent: 'space-between' }}>
        <div>
          {/* Category & Variety */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span className="text-muted text-xs font-medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {product.category} • {product.variety}
            </span>
            <span className="text-muted text-xs" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Calendar size={12} /> {product.harvestDate}
            </span>
          </div>

          {/* Product Name */}
          <h3 className="text-base font-bold" style={{ marginBottom: '0.5rem', lineHeight: 1.3 }}>
            {product.name}
          </h3>

          <p className="text-secondary text-xs" style={{
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            height: '2.4em'
          }}>
            {product.description}
          </p>
        </div>

        <div>
          {/* Wholesale Specs Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '0.5rem',
            padding: '0.625rem 0.75rem',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.75rem'
          }}>
            <div>
              <span className="text-muted" style={{ display: 'block' }}>Min Order (MOQ)</span>
              <span className="font-semibold">{product.moqUnits} {product.unit}s</span>
            </div>
            <div>
              <span className="text-muted" style={{ display: 'block' }}>Available Stock</span>
              <span className="font-semibold">{product.availableUnits.toLocaleString()} {product.unit}s</span>
            </div>
          </div>

          {/* Price & Primary Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
            <div>
              <span className="text-muted text-xs">Wholesale Price</span>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--brand-primary)', lineHeight: 1.1 }}>
                ${product.pricePerUnit.toFixed(2)}
                <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}> / {product.unit}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                onClick={() => onViewDetails(product)}
                className="btn btn-secondary btn-icon"
                title="View Lot & Quality Details"
              >
                <Eye size={16} />
              </button>
              <button
                onClick={() => onAddToCart(product)}
                className="btn btn-primary"
                style={{ padding: '0.5rem 0.875rem' }}
              >
                <Plus size={16} />
                <span>Add</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
