import React from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { CMSPageBlock } from '../core/database/schema';
import { ArrowRight, ShoppingBag, ArrowUp, ArrowDown, Copy, EyeOff, Trash2 } from 'lucide-react';

interface HeroProps {
  block?: CMSPageBlock;
  onBrowseClick: () => void;
  onOpenBuyerAuth: () => void;
  onOpenSellerAuth: () => void;
  isEditorMode?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDuplicate?: () => void;
  onHide?: () => void;
  onDelete?: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  block,
  onBrowseClick,
  onOpenBuyerAuth,
  onOpenSellerAuth,
  isEditorMode = false,
  isSelected = false,
  onSelect,
  onMoveUp,
  onMoveDown,
  onDuplicate,
  onHide,
  onDelete,
}) => {
  const publishedBlocks = AgriTrustDatabase.getPublishedLandingPageBlocks();
  const heroBlock = block || publishedBlocks.find((b) => b.type === 'HERO') || {
    title: 'Wholesale Produce. Ready for Business.',
    subtitle: 'Fresh agricultural products available in bulk for hotels, restaurants, retailers, distributors and commercial buyers.',
    settings: {
      primaryButtonText: 'BUY NOW',
      secondaryButtonText: 'BECOME A BUYER',
      textLinkText: 'SELL YOUR PRODUCE',
      imageUrl: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1200&q=80',
    },
  };

  const title = heroBlock.title || 'Wholesale Produce. Ready for Business.';
  const subtitle = heroBlock.subtitle || 'Fresh agricultural products available in bulk for hotels, restaurants, retailers, distributors and commercial buyers.';
  const primaryBtn = heroBlock.settings?.primaryButtonText || 'BUY NOW';
  const secondaryBtn = heroBlock.settings?.secondaryButtonText || 'BECOME A BUYER';
  const textLink = heroBlock.settings?.textLinkText || 'SELL YOUR PRODUCE';
  const imageUrl = heroBlock.settings?.imageUrl || 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1200&q=80';

  const availableLots = AgriTrustDatabase.getAvailableLots();

  return (
    <section
      onClick={onSelect}
      style={{
        position: 'relative',
        padding: '4rem 0 3.5rem',
        overflow: 'hidden',
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
          <span style={{ fontWeight: 700, paddingRight: '0.35rem', borderRight: '1px solid rgba(255,255,255,0.3)' }}>Hero Block</span>
          {onMoveUp && <button onClick={onMoveUp} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#fff' }} title="Move Up"><ArrowUp size={12} /></button>}
          {onMoveDown && <button onClick={onMoveDown} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#fff' }} title="Move Down"><ArrowDown size={12} /></button>}
          {onDuplicate && <button onClick={onDuplicate} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#fff' }} title="Duplicate"><Copy size={12} /></button>}
          {onHide && <button onClick={onHide} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#fff' }} title="Hide"><EyeOff size={12} /></button>}
          {onDelete && <button onClick={onDelete} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#ff6b6b' }} title="Delete"><Trash2 size={12} /></button>}
        </div>
      )}

      {/* Background Decorative Blur Gradients */}
      <div style={{
        position: 'absolute',
        top: '-10%',
        right: '-5%',
        width: '500px',
        height: '500px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(16, 128, 67, 0.12) 0%, rgba(255, 255, 255, 0) 70%)',
        zIndex: -1,
        pointerEvents: 'none'
      }} />

      <div className="container">
        {/* Symmetrical 2-Column Balanced Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '3rem',
          alignItems: 'center'
        }}>
          {/* LEFT COLUMN: Headlines & CTAs */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.25rem' }}>
            <span className="badge badge-brand" style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem' }}>
              AGRITRUST WHOLESALE COMMERCE
            </span>

            <h1 style={{
              fontSize: 'clamp(2.25rem, 4.5vw, 3.25rem)',
              letterSpacing: '-0.03em',
              lineHeight: 1.15,
              fontWeight: 800,
              color: 'var(--text-primary)'
            }}>
              {title}
            </h1>

            <p className="text-secondary text-lg" style={{ lineHeight: 1.6, maxWidth: '540px' }}>
              {subtitle}
            </p>

            {/* Primary & Secondary Buttons */}
            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', marginTop: '0.75rem' }}>
              <button onClick={onBrowseClick} className="btn btn-primary btn-lg" style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}>
                <span>{primaryBtn}</span>
                <ArrowRight size={18} />
              </button>

              <button onClick={onOpenBuyerAuth} className="btn btn-secondary btn-lg" style={{ padding: '0.875rem 1.75rem', fontSize: '1rem' }}>
                <span>{secondaryBtn}</span>
              </button>
            </div>

            {/* Text Link for Sellers */}
            <div style={{ marginTop: '0.5rem' }}>
              <button
                onClick={onOpenSellerAuth}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  fontWeight: 700,
                  fontSize: '0.9375rem',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                {textLink} →
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: Large Professional Image & Live Inventory Preview */}
          <div style={{ position: 'relative' }}>
            <div className="card" style={{ padding: '0', overflow: 'hidden', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)' }}>
              <div style={{ position: 'relative', height: '320px', width: '100%', overflow: 'hidden' }}>
                <img
                  src={imageUrl}
                  alt="Wholesale Produce"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)'
                }} />
                <div style={{ position: 'absolute', bottom: '1.25rem', left: '1.25rem', right: '1.25rem', color: '#ffffff' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem', marginBottom: '0.35rem' }}>LIVE MARKETPLACE INVENTORY</span>
                  <h3 className="text-xl font-bold" style={{ color: '#ffffff' }}>Fresh Commercial Sourcing</h3>
                  <p style={{ fontSize: '0.8125rem', opacity: 0.9, marginTop: '0.2rem' }}>
                    Direct B2B distribution from certified agricultural producers.
                  </p>
                </div>
              </div>

              <div style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-elevated)', fontSize: '0.8125rem' }}>
                <div>
                  <span className="text-muted block text-xs">Currently Published</span>
                  <strong style={{ color: 'var(--brand-primary)', fontSize: '1rem' }}>{availableLots.length} Wholesale Lots Ready</strong>
                </div>
                <button onClick={onBrowseClick} className="btn btn-primary btn-sm" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                  <ShoppingBag size={13} /> Buy Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
