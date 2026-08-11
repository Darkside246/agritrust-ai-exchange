import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { SupplySubmission, SupplySubmissionStatus, Lot } from '../core/database/schema';
import { 
  Inbox, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Bot, 
  DollarSign, 
  TrendingUp, 
  ShieldCheck, 
  FileText, 
  Eye, 
  RefreshCw,
  X,
  Layers,
  ArrowRight
} from 'lucide-react';

export const AdminSupplyInbox: React.FC = () => {
  const [submissions, setSubmissions] = useState<SupplySubmission[]>(AgriTrustDatabase.getSupplySubmissions());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubmission, setSelectedSubmission] = useState<SupplySubmission | null>(null);

  // Commercial Pricing & Margin Calculator State
  const [sellingPrice, setSellingPrice] = useState<number>(2.40);
  const [procurementPrice, setProcurementPrice] = useState<number>(1.60);
  const [logisticsCost, setLogisticsCost] = useState<number>(0.25);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refreshData = () => {
    setSubmissions(AgriTrustDatabase.getSupplySubmissions());
  };

  const handleOpenReview = (sub: SupplySubmission) => {
    setSelectedSubmission(sub);
    setSellingPrice(sub.aiRecommendation?.suggestedPrice || 2.40);
    setProcurementPrice(1.60);
    setLogisticsCost(0.25);
  };

  const handleApprove = () => {
    if (!selectedSubmission) return;

    try {
      const createdLot = AgriTrustDatabase.approveSupplySubmissionAndCreateLot(selectedSubmission.id, 'sys-admin');
      refreshData();
      setSuccessMsg(`Supply submission ${selectedSubmission.id} successfully APPROVED! Created Lot ${createdLot.id} with HIDDEN publication status.`);
      setSelectedSubmission(null);
    } catch (err: any) {
      alert(err.message || 'Approval failed.');
    }
  };

  const handleReject = () => {
    if (!selectedSubmission) return;
    AgriTrustDatabase.updateSupplySubmissionStatus(selectedSubmission.id, 'REJECTED', 'sys-admin', 'Quality or commercial criteria not satisfied.');
    refreshData();
    setSuccessMsg(`Supply submission ${selectedSubmission.id} REJECTED.`);
    setSelectedSubmission(null);
  };

  const filtered = submissions.filter((sub) => {
    if (statusFilter !== 'ALL' && sub.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = sub.id.toLowerCase().includes(q);
      const matchComm = sub.commodity.toLowerCase().includes(q);
      const matchSeller = (sub.sellerName || '').toLowerCase().includes(q);
      return matchId || matchComm || matchSeller;
    }
    return true;
  });

  const marginCalc = selectedSubmission 
    ? AgriTrustDatabase.calculateLotProfitability(selectedSubmission.id, sellingPrice, procurementPrice, logisticsCost)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.35rem', backgroundColor: 'rgba(16, 128, 67, 0.15)', color: 'var(--brand-primary)' }}>
          PROCUREMENT SUPPLY INBOX
        </span>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
          Seller Supply Submissions
        </h1>
        <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
          Operational inbox for incoming agricultural produce submissions. Verify quality, margins, and convert to wholesale inventory.
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

      {/* Filter Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        {['ALL', 'UNDER_REVIEW', 'SUBMITTED', 'QUALITY_REVIEW', 'COMMERCIAL_REVIEW', 'APPROVED', 'REJECTED', 'QUARANTINED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem' }}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Search & Actions Bar */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search Submission ID, Seller, Commodity..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <button onClick={refreshData} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Inbox
        </button>
      </div>

      {/* Main Submissions Table (Section 11) */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-elevated)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.875rem 1rem' }}>Submission ID</th>
              <th style={{ padding: '0.875rem 1rem' }}>Seller (Authorised View)</th>
              <th style={{ padding: '0.875rem 1rem' }}>Commodity & Variety</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Est. Quantity</th>
              <th style={{ padding: '0.875rem 1rem' }}>Harvest Date</th>
              <th style={{ padding: '0.875rem 1rem' }}>Status</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((sub) => (
              <tr key={sub.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-primary)' }}>
                  {sub.id}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 700 }}>{sub.sellerName}</div>
                  <span className="text-muted text-xs font-mono">{sub.sellerId}</span>
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <div style={{ fontWeight: 700 }}>{sub.commodity}</div>
                  <span className="text-secondary text-xs">{sub.variety}</span>
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                  {sub.estimatedQuantity.toLocaleString()} {sub.unit}s
                </td>
                <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>
                  {sub.expectedHarvestDate}
                </td>
                <td style={{ padding: '0.875rem 1rem' }}>
                  <span className={`badge ${sub.status === 'APPROVED' ? 'badge-success' : sub.status === 'REJECTED' ? 'badge-danger' : 'badge-brand'}`} style={{ fontSize: '0.7rem' }}>
                    {sub.status}
                  </span>
                </td>
                <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                  <button onClick={() => handleOpenReview(sub)} className="btn btn-primary btn-sm" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}>
                    <Eye size={13} /> Review Submission
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Drawer Modal (Section 12, 13, 14, 46) */}
      {selectedSubmission && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '780px', width: '92%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>PROCUREMENT REVIEW WORKSPACE</span>
                <h3 className="text-xl font-bold">Review Submission — {selectedSubmission.id}</h3>
              </div>
              <button onClick={() => setSelectedSubmission(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                <X size={16} />
              </button>
            </div>

            {/* Submission Overview Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8125rem' }}>
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted text-xs font-semibold block">SELLER IDENTITY (ADMIN CONFIDENTIAL VIEW)</span>
                <div className="font-bold text-sm" style={{ color: 'var(--brand-primary)', marginTop: '0.25rem' }}>{selectedSubmission.sellerName}</div>
                <div className="text-xs text-muted font-mono">{selectedSubmission.sellerId} • Region: {selectedSubmission.location.region}</div>
              </div>

              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                <span className="text-muted text-xs font-semibold block">PRODUCE & QUANTITY</span>
                <div className="font-bold text-sm" style={{ marginTop: '0.25rem' }}>{selectedSubmission.commodity} - {selectedSubmission.variety}</div>
                <div className="text-xs text-secondary">{selectedSubmission.estimatedQuantity} {selectedSubmission.unit}s (MOQ: {selectedSubmission.minimumQuantity} {selectedSubmission.unit}s)</div>
              </div>
            </div>

            {/* AI Analysis Box (Section 44) */}
            {selectedSubmission.aiRecommendation && (
              <div style={{ padding: '1rem 1.25rem', backgroundColor: 'rgba(16, 128, 67, 0.08)', border: '1px solid rgba(16, 128, 67, 0.2)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'flex-start', gap: '0.75rem', fontSize: '0.8125rem' }}>
                <Bot size={22} style={{ color: 'var(--brand-primary)', flexShrink: 0, marginTop: '0.1rem' }} />
                <div>
                  <div className="font-bold" style={{ color: 'var(--brand-primary)' }}>AgriTrust AI Intake Analysis (Confidence: {selectedSubmission.aiRecommendation.confidence}%)</div>
                  <p className="text-secondary text-xs" style={{ marginTop: '0.25rem', lineHeight: 1.5 }}>
                    Recommendation: <strong>APPROVE</strong> for Grade A wholesale distribution. Suggested Selling Price: <strong>${selectedSubmission.aiRecommendation.suggestedPrice.toFixed(2)}/{selectedSubmission.unit}</strong>.
                  </p>
                </div>
              </div>
            )}

            {/* Profitability Calculator (Section 46) */}
            <div style={{ padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <h4 className="font-bold text-sm style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}">
                  <TrendingUp size={16} /> Commercial Profitability & Margin Engine
                </h4>
                {marginCalc && (
                  <span className={`badge ${marginCalc.satisfiesTargetMargin ? 'badge-success' : 'badge-accent'}`} style={{ fontSize: '0.7rem' }}>
                    {marginCalc.marginPercent.toFixed(1)}% Estimated Margin {marginCalc.satisfiesTargetMargin ? '✓ Target Satisfied' : '⚠ Below 20% Target'}
                  </span>
                )}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Public Wholesale Price ($)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Est. Procurement Cost ($)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={procurementPrice}
                    onChange={(e) => setProcurementPrice(parseFloat(e.target.value) || 0)}
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Est. Logistics & Handling ($)</label>
                  <input
                    type="number"
                    step="0.05"
                    value={logisticsCost}
                    onChange={(e) => setLogisticsCost(parseFloat(e.target.value) || 0)}
                    className="input-field"
                  />
                </div>
              </div>

              {marginCalc && !marginCalc.satisfiesTargetMargin && (
                <div style={{ padding: '0.75rem', backgroundColor: 'var(--status-danger-bg)', color: 'var(--status-danger)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <AlertTriangle size={16} /> Warning: Selling price of ${sellingPrice.toFixed(2)} yields {marginCalc.marginPercent.toFixed(1)}% margin. Minimum floor price for 20% target margin is ${marginCalc.minimumPermittedPrice.toFixed(2)}.
                </div>
              )}
            </div>

            {/* Mandatory Requirement Note */}
            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <strong>Mandatory Rule:</strong> Approving this submission converts it into Lot inventory with status <strong style={{ color: 'var(--brand-accent)' }}>HIDDEN</strong>. It will NOT appear publicly until an administrator prepares and publishes the listing.
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)' }}>
              <button onClick={handleReject} className="btn btn-secondary btn-md" style={{ color: 'var(--status-danger)' }}>
                <XCircle size={16} /> Reject Submission
              </button>
              <button onClick={handleApprove} className="btn btn-primary btn-md" style={{ padding: '0.65rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle2 size={16} /> Approve & Create Lot (HIDDEN)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
