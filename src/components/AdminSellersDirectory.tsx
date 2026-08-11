import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { FarmerProfile, SellerCategory } from '../core/database/schema';
import { Leaf, Search, Filter, ShieldCheck, MapPin, Award, Edit3, CheckCircle2, X } from 'lucide-react';

export const AdminSellersDirectory: React.FC = () => {
  const [sellers, setSellers] = useState<FarmerProfile[]>(AgriTrustDatabase.getAllSellers());
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingSeller, setEditingSeller] = useState<FarmerProfile | null>(null);

  // Edit form state
  const [category, setCategory] = useState<SellerCategory>('Commercial Farm');
  const [trustScore, setTrustScore] = useState<number>(98.4);
  const [verified, setVerified] = useState<boolean>(true);
  const [farmSizeHectares, setFarmSizeHectares] = useState<number>(45);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refreshSellers = () => {
    setSellers(AgriTrustDatabase.getAllSellers());
  };

  const handleOpenEdit = (seller: FarmerProfile) => {
    setEditingSeller(seller);
    setCategory(seller.category || 'Commercial Farm');
    setTrustScore(seller.trustScore);
    setVerified(seller.verified);
    setFarmSizeHectares(seller.farmSizeHectares || 45);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSeller) return;

    AgriTrustDatabase.updateSellerProfile(editingSeller.id, {
      category,
      trustScore,
      verified,
      farmSizeHectares,
    });

    refreshSellers();
    setSuccessMsg(`Seller profile '${editingSeller.businessName}' updated successfully.`);
    setEditingSeller(null);
  };

  const filtered = sellers.filter((s) => {
    if (categoryFilter !== 'ALL' && s.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.businessName.toLowerCase().includes(q);
      const matchContact = s.contactName.toLowerCase().includes(q);
      return matchName || matchContact;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.35rem', backgroundColor: 'rgba(16, 128, 67, 0.15)', color: 'var(--brand-primary)' }}>
          SUPPLIER NETWORK DIRECTORY
        </span>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
          Registered Produce Sellers & Farmers
        </h1>
        <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
          Authoritative admin directory for agricultural producers, cooperatives, trust scores, and confidential farm profiles.
        </p>
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

      {/* Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Seller Business, Contact Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} className="text-muted" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field" style={{ width: '180px' }}>
            <option value="ALL">All Producer Types</option>
            <option value="Small Farm">Small Farm</option>
            <option value="Commercial Farm">Commercial Farm</option>
            <option value="Cooperative">Cooperative</option>
            <option value="Agricultural Producer">Agricultural Producer</option>
            <option value="Greenhouse">Greenhouse</option>
            <option value="Hydroponic Farm">Hydroponic Farm</option>
            <option value="Organic Producer">Organic Producer</option>
          </select>
        </div>
      </div>

      {/* Seller Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filtered.map((seller) => (
          <div key={seller.id} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-brand" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>
                  {seller.category || 'Commercial Farm'}
                </span>
                <h3 className="font-bold text-lg" style={{ color: 'var(--brand-primary)' }}>{seller.businessName}</h3>
                <div className="text-xs text-muted font-mono">{seller.id}</div>
              </div>
              <span className={`badge ${seller.verified ? 'badge-success' : 'badge-accent'}`} style={{ fontSize: '0.7rem' }}>
                {seller.verified ? 'VERIFIED' : 'PENDING'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }} className="text-secondary">
              <div><strong>Primary Contact:</strong> {seller.contactName}</div>
              <div><strong>Phone:</strong> {seller.privatePhone}</div>
              <div><strong>Private Address:</strong> {seller.privateAddress}</div>
              <div><strong>Public Region:</strong> {seller.publicRegion}</div>
            </div>

            <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div>
                <span className="text-muted block">AgriTrust Trust Score</span>
                <strong style={{ color: 'var(--brand-primary)', fontSize: '0.9375rem' }}>{seller.trustScore}%</strong>
              </div>
              <div>
                <span className="text-muted block">Farm Size</span>
                <strong style={{ fontSize: '0.9375rem' }}>{seller.farmSizeHectares || 45} Hectares</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong>Primary Crops:</strong> {(seller.primaryCrops || ['Tomatoes', 'Lettuce']).join(', ')}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <button onClick={() => handleOpenEdit(seller)} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                <Edit3 size={13} /> Edit Supplier Profile
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Seller Drawer */}
      {editingSeller && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '540px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 className="text-xl font-bold">Edit Seller Profile — {editingSeller.businessName}</h3>
              <button onClick={() => setEditingSeller(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label">Producer Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as SellerCategory)} className="input-field">
                  <option value="Small Farm">Small Farm</option>
                  <option value="Commercial Farm">Commercial Farm</option>
                  <option value="Cooperative">Cooperative</option>
                  <option value="Agricultural Producer">Agricultural Producer</option>
                  <option value="Greenhouse">Greenhouse</option>
                  <option value="Hydroponic Farm">Hydroponic Farm</option>
                  <option value="Organic Producer">Organic Producer</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">AgriTrust Trust Score (%)</label>
                  <input type="number" step="0.1" value={trustScore} onChange={(e) => setTrustScore(parseFloat(e.target.value) || 90)} className="input-field" />
                </div>

                <div className="input-group">
                  <label className="input-label">Farm Size (Hectares)</label>
                  <input type="number" value={farmSizeHectares} onChange={(e) => setFarmSizeHectares(parseInt(e.target.value, 10) || 10)} className="input-field" />
                </div>
              </div>

              <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="sellerVerCheck" checked={verified} onChange={(e) => setVerified(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                <label htmlFor="sellerVerCheck" className="input-label" style={{ margin: 0 }}>Supplier Verified & Approved for AgriTrust Procurement Intake</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setEditingSeller(null)} className="btn btn-secondary btn-md">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  Save Seller Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
