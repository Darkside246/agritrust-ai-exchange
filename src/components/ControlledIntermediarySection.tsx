import React from 'react';
import { CMSPageBlock } from '../core/database/schema';
import { ShieldCheck, Layers, ShoppingBag, Truck, FileCheck, ArrowUp, ArrowDown, Copy, EyeOff, Trash2, Edit3 } from 'lucide-react';

interface ControlledIntermediarySectionProps {
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

export const ControlledIntermediarySection: React.FC<ControlledIntermediarySectionProps> = ({
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
  const eyebrow = block?.content?.eyebrow || 'Controlled Intermediary Model';
  const title = block?.title || 'How AgriTrust Secures Wholesale Agriculture';
  const subtitle = block?.subtitle || 'AgriTrust brings supply, quality, pricing, logistics, and fulfilment together through one coordinated wholesale platform. Businesses get a simpler way to source fresh agricultural produce while AgriTrust manages the complexity behind every transaction.';
  const imageUrl = block?.settings?.imageUrl || 'https://images.unsplash.com/photo-1586771107445-d3ca888129ff?auto=format&fit=crop&w=800&q=80';

  const defaultBenefits = [
    {
      title: 'Quality Controlled',
      description: "Produce is assessed through AgriTrust's quality processes before entering the wholesale marketplace.",
      icon: ShieldCheck,
      color: 'var(--brand-primary)',
    },
    {
      title: 'Supply Coordinated',
      description: 'We coordinate agricultural supply to help businesses access the products and quantities they need.',
      icon: Layers,
      color: 'var(--brand-accent)',
    },
    {
      title: 'Wholesale Focused',
      description: 'Our marketplace is designed around commercial purchasing, bulk quantities, minimum order requirements, and wholesale pricing.',
      icon: ShoppingBag,
      color: 'hsl(38, 92%, 50%)',
    },
    {
      title: 'Fulfilment Managed',
      description: 'AgriTrust coordinates the movement of produce from supply through delivery so buyers have one platform to manage their procurement.',
      icon: Truck,
      color: 'hsl(210, 90%, 48%)',
    },
    {
      title: 'Traceable',
      description: 'Every eligible lot maintains a structured traceability record throughout its journey.',
      icon: FileCheck,
      color: 'hsl(142, 60%, 40%)',
    },
  ];

  const benefits = block?.content?.benefits || defaultBenefits;

  return (
    <section
      id="controlled-intermediary"
      onClick={onSelect}
      style={{
        position: 'relative',
        padding: '4.5rem 0',
        backgroundColor: block?.settings?.bgStyle === 'surface' ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
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
          <span style={{ fontWeight: 700, paddingRight: '0.35rem', borderRight: '1px solid rgba(255,255,255,0.3)' }}>Controlled Intermediary</span>
          {onMoveUp && <button onClick={onMoveUp} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#fff' }} title="Move Up"><ArrowUp size={12} /></button>}
          {onMoveDown && <button onClick={onMoveDown} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#fff' }} title="Move Down"><ArrowDown size={12} /></button>}
          {onDuplicate && <button onClick={onDuplicate} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#fff' }} title="Duplicate"><Copy size={12} /></button>}
          {onHide && <button onClick={onHide} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#fff' }} title="Hide"><EyeOff size={12} /></button>}
          {onDelete && <button onClick={onDelete} className="btn btn-secondary btn-sm" style={{ padding: '0.15rem 0.35rem', color: '#ff6b6b' }} title="Delete"><Trash2 size={12} /></button>}
        </div>
      )}

      <div className="container">
        {/* Section Header */}
        <div style={{ maxWidth: '780px', margin: '0 auto 3.5rem', textAlign: 'center' }}>
          <span className="badge badge-brand" style={{ fontSize: '0.75rem', padding: '0.35rem 0.85rem', marginBottom: '1rem' }}>
            {eyebrow}
          </span>
          <h2 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em', marginBottom: '1rem', color: 'var(--text-primary)' }}>
            {title}
          </h2>
          <p className="text-secondary text-base" style={{ lineHeight: 1.6 }}>
            {subtitle}
          </p>
        </div>

        {/* 5 Customer-Facing Benefit Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
          alignItems: 'stretch'
        }}>
          {benefits.map((b: any, idx: number) => {
            const IconComp = b.icon && typeof b.icon === 'function' ? b.icon : b.icon === 'Layers' ? Layers : b.icon === 'ShoppingBag' ? ShoppingBag : b.icon === 'Truck' ? Truck : b.icon === 'FileCheck' ? FileCheck : ShieldCheck;
            return (
              <div
                key={idx}
                className="card"
                style={{
                  padding: '1.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  backgroundColor: 'var(--bg-surface)'
                }}
              >
                <div style={{
                  width: '2.75rem',
                  height: '2.75rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--brand-primary-light)',
                  color: 'var(--brand-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComp size={22} />
                </div>

                <div>
                  <h3 className="font-bold text-lg" style={{ marginBottom: '0.35rem', color: 'var(--text-primary)' }}>{b.title}</h3>
                  <p className="text-secondary text-xs" style={{ lineHeight: 1.6 }}>
                    {b.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
