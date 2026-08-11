import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { BuyerProfile, BuyerCategory } from '../core/database/schema';
import { Users, Search, Filter, ShieldCheck, CreditCard, Calendar, Edit3, CheckCircle2, X } from 'lucide-react';

export const AdminBuyersDirectory: React.FC = () => {
  const [buyers, setBuyers] = useState<BuyerProfile[]>(AgriTrustDatabase.getAllBuyers());
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [editingBuyer, setEditingBuyer] = useState<BuyerProfile | null>(null);

  // Edit form state
  const [creditLimit, setCreditLimit] = useState<number>(50000);
  const [paymentTerms, setPaymentTerms] = useState<string>('Net 30');
  const [category, setCategory] = useState<BuyerCategory>('Hotels');
  const [verified, setVerified] = useState<boolean>(true);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refreshBuyers = () => {
    setBuyers(AgriTrustDatabase.getAllBuyers());
  };

  const handleOpenEdit = (buyer: BuyerProfile) => {
    setEditingBuyer(buyer);
    setCreditLimit(buyer.creditLimit);
    setPaymentTerms(buyer.paymentTerms || 'Net 30');
    setCategory(buyer.category || 'Hotels');
    setVerified(buyer.verified);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingBuyer) return;

    AgriTrustDatabase.updateBuyerProfile(editingBuyer.id, {
      creditLimit,
      paymentTerms,
      category,
      verified,
    });

    refreshBuyers();
    setSuccessMsg(`Buyer account '${editingBuyer.businessName}' profile updated successfully.`);
    setEditingBuyer(null);
  };

  const filtered = buyers.filter((b) => {
    if (categoryFilter !== 'ALL' && b.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = b.businessName.toLowerCase().includes(q);
      const matchContact = b.contactName.toLowerCase().includes(q);
      return matchName || matchContact;
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.35rem', backgroundColor: 'rgba(230, 81, 0, 0.15)', color: 'var(--brand-accent)' }}>
          CUSTOMER RELATIONSHIP MANAGEMENT
        </span>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
          Commercial Buyers Directory
        </h1>
        <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
          Authoritative admin directory for commercial buyers, credit limits, payment terms, and verification status.
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
            placeholder="Search Buyer Business, Contact Name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} className="text-muted" />
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="input-field" style={{ width: '180px' }}>
            <option value="ALL">All Categories</option>
            <option value="Hotels">Hotels</option>
            <option value="Restaurants">Restaurants</option>
            <option value="Supermarkets">Supermarkets</option>
            <option value="Distributors">Distributors</option>
            <option value="Food Processors">Food Processors</option>
            <option value="Caterers">Caterers</option>
            <option value="Institutions">Institutions</option>
          </select>
        </div>
      </div>

      {/* Buyer Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {filtered.map((buyer) => (
          <div key={buyer.id} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="badge badge-brand" style={{ fontSize: '0.65rem', marginBottom: '0.25rem' }}>
                  {buyer.category || 'Hotels'}
                </span>
                <h3 className="font-bold text-lg" style={{ color: 'var(--brand-primary)' }}>{buyer.businessName}</h3>
                <div className="text-xs text-muted font-mono">{buyer.id}</div>
              </div>
              <span className={`badge ${buyer.verified ? 'badge-success' : 'badge-accent'}`} style={{ fontSize: '0.7rem' }}>
                {buyer.verified ? 'VERIFIED' : 'PENDING'}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.8125rem' }} className="text-secondary">
              <div><strong>Primary Contact:</strong> {buyer.contactName}</div>
              <div><strong>Phone:</strong> {buyer.privatePhone}</div>
              <div><strong>Billing Address:</strong> {buyer.privateAddress}</div>
            </div>

            <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.75rem' }}>
              <div>
                <span className="text-muted block">Credit Limit</span>
                <strong style={{ color: 'var(--brand-primary)', fontSize: '0.9375rem' }}>${buyer.creditLimit.toLocaleString()}</strong>
              </div>
              <div>
                <span className="text-muted block">Payment Terms</span>
                <strong style={{ fontSize: '0.9375rem' }}>{buyer.paymentTerms || 'Net 30'}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '0.5rem' }}>
              <button onClick={() => handleOpenEdit(buyer)} className="btn btn-secondary btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                <Edit3 size={13} /> Edit Account Terms
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Buyer Drawer */}
      {editingBuyer && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '540px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 className="text-xl font-bold">Edit Buyer Profile — {editingBuyer.businessName}</h3>
              <button onClick={() => setEditingBuyer(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div className="input-group">
                <label className="input-label">Buyer Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value as BuyerCategory)} className="input-field">
                  <option value="Hotels">Hotels</option>
                  <option value="Restaurants">Restaurants</option>
                  <option value="Supermarkets">Supermarkets</option>
                  <option value="Distributors">Distributors</option>
                  <option value="Food Processors">Food Processors</option>
                  <option value="Caterers">Caterers</option>
                  <option value="Institutions">Institutions</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Approved Credit Limit ($)</label>
                  <input type="number" value={creditLimit} onChange={(e) => setCreditLimit(parseFloat(e.target.value) || 0)} className="input-field" />
                </div>

                <div className="input-group">
                  <label className="input-label">Payment Terms</label>
                  <select value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} className="input-field">
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 45">Net 45</option>
                    <option value="Prepaid">Prepaid</option>
                  </select>
                </div>
              </div>

              <div className="input-group" style={{ flexDirection: 'row', alignItems: 'center', gap: '0.5rem' }}>
                <input type="checkbox" id="verCheck" checked={verified} onChange={(e) => setVerified(e.target.checked)} style={{ width: '16px', height: '16px' }} />
                <label htmlFor="verCheck" className="input-label" style={{ margin: 0 }}>Account Verified & Approved for Commercial Wholesale Purchasing</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                <button type="button" onClick={() => setEditingBuyer(null)} className="btn btn-secondary btn-md">
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md">
                  Save Buyer Profile
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
