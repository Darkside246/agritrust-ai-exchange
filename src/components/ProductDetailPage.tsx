import React, { useState } from 'react';
import { Product } from '../core/database/schema';
import { AgriTrustDatabase } from '../core/database/db';
import { 
  ShieldCheck, 
  Calendar, 
  MapPin, 
  Truck, 
  Plus, 
  Minus, 
  ArrowLeft, 
  Sparkles, 
  Thermometer, 
  CheckCircle2, 
  FileText,
  Lock,
  Layers
} from 'lucide-react';

interface ProductDetailPageProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onInspectTraceability: (lotId: string) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  product,
  onBack,
  onAddToCart,
  onInspectTraceability,
}) => {
  const [quantity, setQuantity] = useState<number>(product.moqUnits);

  const lotQuality = AgriTrustDatabase.getLotQuality(product.lotId);

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
  const totalWeightKg = quantity * product.unitWeightKg;
  const estimatedPallets = Math.ceil(totalWeightKg / 500); // 500kg per pallet estimate

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
          <span>Back to Marketplace</span>
        </button>

        {/* Main Product Showcase Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem'
        }}>
          {/* Left Column: Product Image & Certified Badges */}
          <div>
            <div style={{
              position: 'relative',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-md)',
              height: '380px',
              backgroundColor: 'var(--bg-surface-elevated)'
            }}>
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              <div style={{ position: 'absolute', top: '1rem', left: '1rem' }}>
                <span className="badge badge-success" style={{ fontSize: '0.875rem', padding: '0.35rem 0.85rem' }}>
                  {product.grade} Certified
                </span>
              </div>

              <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                <span className="badge badge-brand" style={{ backgroundColor: 'rgba(255,255,255,0.95)', fontSize: '0.875rem' }}>
                  <ShieldCheck size={16} />
                  {product.lotId}
                </span>
              </div>
            </div>

            {/* Storage & Handling Specifications */}
            <div className="card" style={{ padding: '1.5rem', marginTop: '1.5rem' }}>
              <h4 className="font-bold text-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <Thermometer size={18} color="var(--brand-primary)" />
                Cold-Chain Storage & Handling Standards
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8125rem' }}>
                <div>
                  <span className="text-muted text-xs">Optimal Temperature</span>
                  <div className="font-semibold">12°C - 14°C (Cool & Dry)</div>
                </div>
                <div>
                  <span className="text-muted text-xs">Relative Humidity</span>
                  <div className="font-semibold">85% - 90% RH</div>
                </div>
                <div>
                  <span className="text-muted text-xs">Shelf-Life Stability</span>
                  <div className="font-semibold">14 Days Post-Intake</div>
                </div>
                <div>
                  <span className="text-muted text-xs">Packaging Unit</span>
                  <div className="font-semibold">{product.unitWeightKg} kg / {product.unit}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Wholesale Specifications & Order Calculator */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {product.category} • {product.variety}
                </span>
              </div>

              <h1 className="text-3xl font-bold" style={{ marginBottom: '0.75rem', letterSpacing: '-0.02em' }}>
                {product.name}
              </h1>

              <p className="text-secondary text-base" style={{ lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {product.description}
              </p>

              {/* Verified Provenance Header Box */}
              <div style={{
                padding: '1.25rem',
                backgroundColor: 'var(--brand-primary-light)',
                border: '1px solid rgba(16, 128, 67, 0.2)',
                borderRadius: 'var(--radius-lg)',
                marginBottom: '1.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--brand-primary)' }}>
                    <ShieldCheck size={20} />
                    <span className="font-bold text-base">AgriTrust Certified Lot Provenance</span>
                  </div>
                  <button
                    onClick={() => onInspectTraceability(product.lotId)}
                    className="btn btn-primary btn-sm"
                  >
                    <span>Inspect Deep Ledger</span>
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.875rem', fontSize: '0.8125rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Calendar size={15} className="text-muted" /> Harvested: <strong>{product.harvestDate}</strong>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <MapPin size={15} className="text-muted" /> Origin: <strong>{product.publicRegion}</strong>
                  </div>
                </div>
              </div>

              {/* AI Spectrovision Quality Inspection Card */}
              <div className="card" style={{ padding: '1.5rem', marginBottom: '1.75rem', backgroundColor: 'var(--bg-surface)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Sparkles size={18} color="var(--brand-accent)" />
                    <h4 className="font-bold text-sm">AI Spectrovision Quality Breakdown</h4>
                  </div>
                  <span className="badge badge-accent" style={{ fontSize: '0.8125rem' }}>
                    {lotQuality.aiConfidenceScore}% AI Confidence
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1rem', fontSize: '0.8125rem' }}>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <span className="text-muted text-xs">Color Uniformity</span>
                    <div className="font-bold text-sm" style={{ color: 'var(--status-success)', marginTop: '0.15rem' }}>99.2% Optimal</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <span className="text-muted text-xs">Surface Defects</span>
                    <div className="font-bold text-sm" style={{ marginTop: '0.15rem' }}>0.4% Minor</div>
                  </div>
                  <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                    <span className="text-muted text-xs">Mould / Damage</span>
                    <div className="font-bold text-sm" style={{ color: 'var(--status-success)', marginTop: '0.15rem' }}>0.0% Detected</div>
                  </div>
                </div>
              </div>

              {/* Interactive Wholesale Order Calculator */}
              <div style={{
                padding: '1.5rem',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-lg)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div>
                    <span className="text-muted text-xs font-semibold" style={{ textTransform: 'uppercase' }}>Wholesale Price</span>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                      ${product.pricePerUnit.toFixed(2)} <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>/ {product.unit}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-muted text-xs font-medium" style={{ display: 'block', marginBottom: '0.35rem' }}>
                      Quantity ({product.unit}s)
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
                        style={{ width: '80px', textAlign: 'center', fontWeight: 700 }}
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

                {/* Calculation Summary Bar */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr 1fr',
                  gap: '0.75rem',
                  padding: '0.875rem',
                  backgroundColor: 'var(--bg-surface)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.8125rem',
                  marginBottom: '1.25rem'
                }}>
                  <div>
                    <span className="text-muted text-xs">Total Yield Weight</span>
                    <div className="font-semibold">{totalWeightKg.toLocaleString()} kg</div>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Est. Pallets</span>
                    <div className="font-semibold">{estimatedPallets} Pallets</div>
                  </div>
                  <div>
                    <span className="text-muted text-xs">Calculated Subtotal</span>
                    <div className="font-bold text-sm" style={{ color: 'var(--brand-primary)' }}>${lineSubtotal.toFixed(2)}</div>
                  </div>
                </div>

                <button
                  onClick={() => onAddToCart(product, quantity)}
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                >
                  <Plus size={18} />
                  <span>Add {quantity} {product.unit}s to Cart (${lineSubtotal.toFixed(2)})</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
