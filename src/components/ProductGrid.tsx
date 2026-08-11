import React, { useState, useMemo } from 'react';
import { Product } from '../core/database/schema';
import { ProductCard } from './ProductCard';
import { Filter, SlidersHorizontal, PackageX } from 'lucide-react';

import { CMSPageBlock } from '../core/database/schema';
import { ArrowUp, ArrowDown, Copy, EyeOff, Trash2 } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  searchQuery: string;
  onAddToCart: (product: Product) => void;
  onViewDetails: (product: Product) => void;
  block?: CMSPageBlock;
  isEditorMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onHide?: () => void;
  onDelete?: () => void;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  searchQuery,
  onAddToCart,
  onViewDetails,
  block,
  isEditorMode = false,
  isSelected = false,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onHide,
  onDelete,
}) => {
  const title = block?.title || 'Fresh Produce. Ready for Wholesale.';
  const subtitle = block?.subtitle || 'Browse currently available produce from the AgriTrust wholesale marketplace and find the products your business needs.';
  const displayLimit = block?.settings?.limit || products.length;
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedGrade, setSelectedGrade] = useState<string>('ALL');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(products.map((p) => p.category)));
    return ['ALL', ...cats];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category Filter
      if (selectedCategory !== 'ALL' && product.category !== selectedCategory) {
        return false;
      }
      // Grade Filter
      if (selectedGrade !== 'ALL' && product.grade !== selectedGrade) {
        return false;
      }
      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesVariety = product.variety.toLowerCase().includes(q);
        const matchesLot = product.lotId.toLowerCase().includes(q);
        const matchesRegion = product.publicRegion.toLowerCase().includes(q);
        return matchesName || matchesVariety || matchesLot || matchesRegion;
      }
      return true;
    });
  }, [products, selectedCategory, selectedGrade, searchQuery]);

  return (
    <section
      id="marketplace"
      onClick={onSelect}
      style={{
        position: 'relative',
        padding: '3rem 0 5rem',
        outline: isEditorMode && isSelected ? '2px solid var(--brand-primary)' : isEditorMode ? '1px dashed rgba(16, 128, 67, 0.4)' : 'none',
        outlineOffset: '-2px',
        cursor: isEditorMode ? 'pointer' : 'default',
        transition: 'outline 0.15s ease'
      }}
    >
      {/* Contextual Floating Block Toolbar in Editor Mode */}
      {isEditorMode && isSelected && (
        <div style={{
          position: 'absolute',
          top: '0.75rem',
          right: '1rem',
          backgroundColor: 'var(--brand-primary)',
          color: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '0.3rem 0.6rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.75rem',
          boxShadow: 'var(--shadow-md)',
          zIndex: 10
        }} onClick={(e) => e.stopPropagation()}>
          <span style={{ fontWeight: 700, paddingRight: '0.35rem', borderRight: '1px solid rgba(255,255,255,0.3)' }}>Wholesale Product Grid</span>
          {onMoveUp && <button onClick={onMoveUp} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#fff' }} title="Move Up"><ArrowUp size={12} /></button>}
          {onMoveDown && <button onClick={onMoveDown} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#fff' }} title="Move Down"><ArrowDown size={12} /></button>}
          {onDuplicate && <button onClick={onDuplicate} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#fff' }} title="Duplicate"><Copy size={12} /></button>}
          {onHide && <button onClick={onHide} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#fff' }} title="Hide"><EyeOff size={12} /></button>}
          {onDelete && <button onClick={onDelete} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#ff6b6b' }} title="Delete"><Trash2 size={12} /></button>}
        </div>
      )}

      <div className="container">
        {/* Section Header */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: '2rem', gap: '1rem' }}>
          <div>
            <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.35rem', backgroundColor: 'rgba(16, 128, 67, 0.15)', color: 'var(--brand-primary)' }}>
              {subtitle}
            </span>
            <h2 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
              {title}
            </h2>
          </div>

          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredProducts.length}</strong> of {products.length} available wholesale products
          </div>
        </div>

        {/* Filters Toolbar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          marginBottom: '2rem',
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Category Pills */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)' }}
              >
                {cat === 'ALL' ? 'All Commodities' : cat}
              </button>
            ))}
          </div>

          {/* Grade Selector Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SlidersHorizontal size={16} color="var(--text-muted)" />
            <span className="text-xs font-medium text-muted">Grade:</span>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="input-field"
              style={{ width: 'auto', padding: '0.35rem 0.75rem', fontSize: '0.8125rem' }}
            >
              <option value="ALL">All Quality Grades</option>
              <option value="Grade A">Grade A Only</option>
              <option value="Grade B">Grade B</option>
            </select>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '1.75rem'
            }}>
              {filteredProducts.slice(0, displayLimit).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewDetails}
                />
              ))}
            </div>

            {/* Catalog Action CTA Bar */}
            <div style={{
              marginTop: '3rem',
              textAlign: 'center',
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '1rem'
            }}>
              <a href="#marketplace" className="btn btn-primary btn-lg" style={{ padding: '0.875rem 2.25rem' }}>
                Browse Wholesale Catalog
              </a>
              <button
                onClick={() => { setSelectedCategory('ALL'); setSelectedGrade('ALL'); }}
                className="btn btn-secondary btn-lg"
                style={{ padding: '0.875rem 1.75rem' }}
              >
                View All Products
              </button>
            </div>
          </>
        ) : (
          /* Empty State */
          <div style={{
            padding: '4rem 2rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-surface)',
            border: '1px border-dashed var(--border-color)',
            borderRadius: 'var(--radius-lg)'
          }}>
            <div style={{
              width: '3.5rem',
              height: '3.5rem',
              borderRadius: '50%',
              backgroundColor: 'var(--bg-surface-elevated)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem',
              color: 'var(--text-muted)'
            }}>
              <PackageX size={28} />
            </div>
            <h3 className="text-lg font-bold" style={{ marginBottom: '0.5rem' }}>No wholesale produce currently listed</h3>
            <p className="text-secondary text-sm" style={{ maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              No produce matching your filter criteria is currently available in the active marketplace inventory.
            </p>
            <button
              onClick={() => { setSelectedCategory('ALL'); setSelectedGrade('ALL'); }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
