import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { Product, ProduceGrade, ProductUnit } from '../core/database/schema';
import { Package, Plus, Search, Filter, Edit3, Eye, CheckCircle2, AlertTriangle, TrendingUp, Save, Send, X, Layers } from 'lucide-react';

export const AdminProductCatalogue: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(AgriTrustDatabase.getProducts());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreatingProduct, setIsCreatingProduct] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Manual Product Creation Form State
  const [name, setName] = useState<string>('Plum Roma Tomatoes');
  const [commodity, setCommodity] = useState<string>('Tomatoes');
  const [variety, setVariety] = useState<string>('Plum Roma');
  const [category, setCategory] = useState<string>('Fresh Produce');
  const [description, setDescription] = useState<string>('High-density Roma tomatoes for commercial processing and hospitality.');
  const [unit, setUnit] = useState<ProductUnit>('kg');
  const [unitWeightKg, setUnitWeightKg] = useState<number>(1);
  const [pricePerUnit, setPricePerUnit] = useState<number>(2.80);
  const [moqUnits, setMoqUnits] = useState<number>(40);
  const [availableUnits, setAvailableUnits] = useState<number>(850);
  const [grade, setGrade] = useState<ProduceGrade>('Grade A');
  const [imageUrl, setImageUrl] = useState<string>('https://images.unsplash.com/photo-1582284540020-8acbe03f4924');

  const refreshProducts = () => {
    setProducts(AgriTrustDatabase.getProducts());
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const createdProduct = AgriTrustDatabase.createProductManual(
      {
        name,
        variety,
        category,
        description,
        unit,
        unitWeightKg,
        pricePerUnit,
        moqUnits,
        availableUnits,
        grade,
        imageUrl,
      },
      'sys-admin'
    );

    refreshProducts();
    setSuccessMsg(`Commercial Product '${createdProduct.name}' created! Associated Lot ${createdProduct.lotId} initialized in HIDDEN publication state.`);
    setIsCreatingProduct(false);
  };

  const marginCalc = AgriTrustDatabase.calculateLotProfitability('prod-manual', pricePerUnit, 1.60, 0.25);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.35rem', backgroundColor: 'rgba(16, 128, 67, 0.15)', color: 'var(--brand-primary)' }}>
            PRODUCT CATALOGUE MANAGEMENT
          </span>
          <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
            Marketplace Commercial Products
          </h1>
          <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
            Reusable commercial product catalogue definitions connected to backend agricultural harvest lots.
          </p>
        </div>

        <button onClick={() => setIsCreatingProduct(true)} className="btn btn-primary btn-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Plus size={16} /> Create Product
        </button>
      </div>

      {successMsg && (
        <div style={{
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--brand-primary-light)',
          color: 'var(--brand-primary)',
          borderRadius: 'var(--radius-md)',
          fontSize: '0.875rem',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Product List Table */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-elevated)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.875rem 1rem' }}>Product Name</th>
              <th style={{ padding: '0.875rem 1rem' }}>Associated Lot ID</th>
              <th style={{ padding: '0.875rem 1rem' }}>Grade</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>MOQ</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Available Units</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Wholesale Price</th>
              <th style={{ padding: '0.875rem 1rem' }}>Availability</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>{prod.name}</div>
                  <span className="text-secondary text-xs">{prod.variety} • {prod.category}</span>
                </td>
                <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: 700 }}>
                  {prod.lotId}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>{prod.grade}</span>
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                  {prod.moqUnits} {prod.unit}s
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                  {prod.availableUnits.toLocaleString()} {prod.unit}s
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--brand-primary)' }}>
                  ${prod.pricePerUnit.toFixed(2)} / {prod.unit}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                    {prod.availabilityStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Product Modal (Section 50) */}
      {isCreatingProduct && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '720px', width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>COMMERCIAL CATALOGUE WIZARD</span>
                <h3 className="text-xl font-bold">Create New Commercial Product</h3>
              </div>
              <button onClick={() => setIsCreatingProduct(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Product Commercial Name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="input-field" />
                </div>

                <div className="input-group">
                  <label className="input-label">Variety</label>
                  <input type="text" value={variety} onChange={(e) => setVariety(e.target.value)} required className="input-field" />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Wholesale Price ($/unit)</label>
                  <input type="number" step="0.05" value={pricePerUnit} onChange={(e) => setPricePerUnit(parseFloat(e.target.value) || 0)} required className="input-field" />
                </div>

                <div className="input-group">
                  <label className="input-label">MOQ (Units)</label>
                  <input type="number" value={moqUnits} onChange={(e) => setMoqUnits(parseInt(e.target.value, 10) || 1)} required className="input-field" />
                </div>

                <div className="input-group">
                  <label className="input-label">Initial Stock (Units)</label>
                  <input type="number" value={availableUnits} onChange={(e) => setAvailableUnits(parseInt(e.target.value, 10) || 0)} required className="input-field" />
                </div>
              </div>

              {/* Profitability Warning Banner */}
              {!marginCalc.satisfiesTargetMargin && (
                <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={16} /> Profitability Warning: Price of ${pricePerUnit.toFixed(2)} yields {marginCalc.marginPercent.toFixed(1)}% margin. Configured target is 20.0%. Minimum price floor is ${marginCalc.minimumPermittedPrice.toFixed(2)}.
                </div>
              )}

              <div className="input-group">
                <label className="input-label">Product Description</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="input-field" />
              </div>

              <div className="input-group">
                <label className="input-label">Product Image URL</label>
                <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="input-field" />
              </div>

              <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <strong>Note:</strong> Manually created products automatically initialize their associated Lot in publication status <strong style={{ color: 'var(--brand-accent)' }}>HIDDEN</strong>. You may preview and publish when ready.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <button type="button" onClick={() => setIsCreatingProduct(false)} className="btn btn-secondary btn-md">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Save size={16} /> Create Product (HIDDEN Lot)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
