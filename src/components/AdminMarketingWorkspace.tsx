import React, { useState, useEffect } from 'react';
import { MarketingService } from '../core/marketing/marketingService';
import { MarketingSubscriber, MarketingMetrics, MarketingAudienceType, SubscriptionStatus } from '../core/database/schema';
import { 
  Users, 
  UserCheck, 
  ShoppingBag, 
  Leaf, 
  UserX, 
  Search, 
  Download, 
  Filter, 
  Mail, 
  CheckCircle2, 
  X, 
  Eye, 
  Edit3, 
  Trash2, 
  Link, 
  ShieldCheck,
  Plus
} from 'lucide-react';

interface AdminMarketingWorkspaceProps {
  adminUserId?: string;
}

export const AdminMarketingWorkspace: React.FC<AdminMarketingWorkspaceProps> = ({
  adminUserId = 'sys-admin',
}) => {
  const [subscribers, setSubscribers] = useState<MarketingSubscriber[]>([]);
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'BUYERS' | 'FARMERS' | 'INTERESTED' | 'ACTIVE' | 'UNSUBSCRIBED'>('ALL');
  
  // Selected subscriber for Detail View / Modal
  const [selectedSub, setSelectedSub] = useState<MarketingSubscriber | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showUnsubSimModal, setShowUnsubSimModal] = useState<boolean>(false);
  const [testTokenInput, setTestTokenInput] = useState<string>('');

  const [notification, setNotification] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const fetchedSubs = await MarketingService.getSubscribers(adminUserId);
      const fetchedMetrics = await MarketingService.getMetrics(adminUserId);
      setSubscribers(fetchedSubs);
      setMetrics(fetchedMetrics);
    } catch (err: any) {
      alert(err.message || 'Access Denied: Subscriber data restricted.');
    }
  };

  useEffect(() => {
    loadData();
  }, [adminUserId]);

  const handleExportCSV = async () => {
    try {
      const csvContent = await MarketingService.exportSubscribersCSV(adminUserId);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `AgriTrust_Marketing_Subscribers_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setNotification('Subscriber list exported successfully to CSV. Event logged to Audit Ledger.');
    } catch (err: any) {
      alert(err.message || 'Failed to export subscribers.');
    }
  };

  const handleUnsubscribe = async (subId: string) => {
    try {
      await MarketingService.updateStatus(subId, 'UNSUBSCRIBED', adminUserId);
      await loadData();
      setNotification('Subscriber status updated to UNSUBSCRIBED.');
    } catch (err: any) {
      alert(err.message || 'Failed to update status.');
    }
  };

  const handleResubscribe = async (subId: string) => {
    try {
      await MarketingService.updateStatus(subId, 'SUBSCRIBED', adminUserId);
      await loadData();
      setNotification('Subscriber resubscribed successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to resubscribe.');
    }
  };

  const handleDelete = async (subId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this subscriber record? This action will be audited.')) return;
    try {
      await MarketingService.deleteSubscriber(subId, adminUserId);
      await loadData();
      if (showDetailModal) setShowDetailModal(false);
      setNotification('Subscriber record permanently deleted.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete subscriber.');
    }
  };

  const handleTestUnsubscribeToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testTokenInput.trim()) return;
    try {
      const result = await MarketingService.unsubscribe(testTokenInput.trim());
      await loadData();
      setShowUnsubSimModal(false);
      setTestTokenInput('');
      setNotification(`Successfully processed token unsubscribe for '${result.emailNormalized}'. Status set to UNSUBSCRIBED.`);
    } catch (err: any) {
      alert(err.message || 'Invalid or expired token.');
    }
  };

  // Filter & Search Logic
  const filteredSubscribers = subscribers.filter((sub) => {
    // 1. Category Filter
    if (activeFilter === 'BUYERS' && sub.audienceType !== 'BUYER') return false;
    if (activeFilter === 'FARMERS' && sub.audienceType !== 'FARMER') return false;
    if (activeFilter === 'INTERESTED' && sub.audienceType !== 'INTERESTED') return false;
    if (activeFilter === 'ACTIVE' && sub.subscriptionStatus !== 'SUBSCRIBED') return false;
    if (activeFilter === 'UNSUBSCRIBED' && sub.subscriptionStatus !== 'UNSUBSCRIBED') return false;

    // 2. Search Query Filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchEmail = sub.emailNormalized.includes(q);
      const matchAudience = sub.audienceType.toLowerCase().includes(q);
      const matchSource = sub.source.toLowerCase().includes(q);
      const matchStatus = sub.subscriptionStatus.toLowerCase().includes(q);
      const matchName = (sub.firstName || '').toLowerCase().includes(q) || (sub.lastName || '').toLowerCase().includes(q);
      return matchEmail || matchAudience || matchSource || matchStatus || matchName;
    }

    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header & Export Action */}
      <div className="card" style={{ padding: '1.5rem 1.75rem', border: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <span className="badge badge-brand" style={{ fontSize: '0.65rem', marginBottom: '0.2rem' }}>
              ADMINISTRATION & LEAD GENERATION
            </span>
            <h1 className="text-2xl font-bold" style={{ margin: 0 }}>
              Marketing Subscribers Management
            </h1>
            <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
              Consented lead database, audience segmentation, consent history tracking, and one-click token unsubscribe manager.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => setShowUnsubSimModal(true)} className="btn btn-secondary btn-md">
              <Link size={16} /> Test Token Unsubscribe
            </button>
            <button onClick={handleExportCSV} className="btn btn-primary btn-md">
              <Download size={16} /> Export Subscribers (CSV)
            </button>
          </div>
        </div>
      </div>

      {notification && (
        <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} /> {notification}
          </div>
          <button onClick={() => setNotification(null)} style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer' }}>
            <X size={14} />
          </button>
        </div>
      )}

      {/* Overview Analytics Cards */}
      {metrics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span className="text-muted text-xs block">Total Subscribers</span>
            <strong className="text-2xl font-bold">{metrics.totalSubscribers}</strong>
          </div>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span className="text-muted text-xs block">Active Subscribers</span>
            <strong className="text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>{metrics.activeSubscribers}</strong>
          </div>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span className="text-muted text-xs block">Buyers</span>
            <strong className="text-2xl font-bold" style={{ color: 'hsl(210, 90%, 48%)' }}>{metrics.buyerSubscribers}</strong>
          </div>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span className="text-muted text-xs block">Farmers</span>
            <strong className="text-2xl font-bold" style={{ color: 'var(--brand-accent)' }}>{metrics.farmerSubscribers}</strong>
          </div>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span className="text-muted text-xs block">General Interested</span>
            <strong className="text-2xl font-bold">{metrics.generalSubscribers}</strong>
          </div>
          <div className="card" style={{ padding: '1.25rem', textAlign: 'center' }}>
            <span className="text-muted text-xs block">Unsubscribed</span>
            <strong className="text-2xl font-bold" style={{ color: 'var(--status-danger)' }}>{metrics.unsubscribedCount}</strong>
          </div>
        </div>
      )}

      {/* Main Table Card */}
      <div className="card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {/* Controls Bar: Filter Tabs & Search */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
          {/* Filter Tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            <button onClick={() => setActiveFilter('ALL')} className={`btn btn-sm ${activeFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
              All ({subscribers.length})
            </button>
            <button onClick={() => setActiveFilter('BUYERS')} className={`btn btn-sm ${activeFilter === 'BUYERS' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
              Buyers ({metrics?.buyerSubscribers || 0})
            </button>
            <button onClick={() => setActiveFilter('FARMERS')} className={`btn btn-sm ${activeFilter === 'FARMERS' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
              Farmers ({metrics?.farmerSubscribers || 0})
            </button>
            <button onClick={() => setActiveFilter('INTERESTED')} className={`btn btn-sm ${activeFilter === 'INTERESTED' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
              Interested ({metrics?.generalSubscribers || 0})
            </button>
            <button onClick={() => setActiveFilter('ACTIVE')} className={`btn btn-sm ${activeFilter === 'ACTIVE' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
              Active ({metrics?.activeSubscribers || 0})
            </button>
            <button onClick={() => setActiveFilter('UNSUBSCRIBED')} className={`btn btn-sm ${activeFilter === 'UNSUBSCRIBED' ? 'btn-primary' : 'btn-secondary'}`} style={{ fontSize: '0.75rem' }}>
              Unsubscribed ({metrics?.unsubscribedCount || 0})
            </button>
          </div>

          {/* Search Bar */}
          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={15} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search email, audience, source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem', fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="table-container">
          <table className="table" style={{ fontSize: '0.8125rem' }}>
            <thead>
              <tr>
                <th>Email Address</th>
                <th>Audience</th>
                <th>Source</th>
                <th>Consent</th>
                <th>Status</th>
                <th>Date Subscribed</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubscribers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    No subscribers found matching the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSubscribers.map((sub) => (
                  <tr key={sub.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{sub.email}</div>
                      <div className="text-xs text-muted font-mono">{sub.emailNormalized}</div>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.65rem',
                          backgroundColor: sub.audienceType === 'BUYER' ? 'rgba(59, 130, 246, 0.15)' : sub.audienceType === 'FARMER' ? 'rgba(234, 179, 8, 0.15)' : 'var(--bg-surface-elevated)',
                          color: sub.audienceType === 'BUYER' ? '#2563eb' : sub.audienceType === 'FARMER' ? '#d97706' : 'var(--text-muted)',
                        }}
                      >
                        {sub.audienceType}
                      </span>
                    </td>
                    <td>
                      <div className="text-xs font-mono">{sub.source}</div>
                      <div className="text-xs text-muted">{sub.sourcePage}</div>
                    </td>
                    <td>
                      <span className="badge badge-brand" style={{ fontSize: '0.6rem' }}>
                        {sub.consentType} ({sub.consentVersion})
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge ${sub.subscriptionStatus === 'SUBSCRIBED' ? 'badge-success' : 'badge-secondary'}`}
                        style={{ fontSize: '0.65rem', backgroundColor: sub.subscriptionStatus === 'UNSUBSCRIBED' ? 'var(--status-danger)' : undefined, color: sub.subscriptionStatus === 'UNSUBSCRIBED' ? '#fff' : undefined }}
                      >
                        {sub.subscriptionStatus}
                      </span>
                    </td>
                    <td className="text-xs text-secondary">
                      {new Date(sub.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.35rem' }}>
                        <button
                          onClick={() => { setSelectedSub(sub); setShowDetailModal(true); }}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.4rem' }}
                          title="View Subscriber Details"
                        >
                          <Eye size={13} />
                        </button>

                        {sub.subscriptionStatus === 'SUBSCRIBED' ? (
                          <button
                            onClick={() => handleUnsubscribe(sub.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.4rem', color: 'var(--status-danger)' }}
                            title="Unsubscribe"
                          >
                            Unsub
                          </button>
                        ) : (
                          <button
                            onClick={() => handleResubscribe(sub.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '0.2rem 0.4rem', color: 'var(--brand-primary)' }}
                            title="Resubscribe"
                          >
                            Resub
                          </button>
                        )}

                        <button
                          onClick={() => handleDelete(sub.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ padding: '0.2rem 0.4rem', color: 'var(--status-danger)' }}
                          title="Delete Record"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {showDetailModal && selectedSub && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '520px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 className="text-xl font-bold">Subscriber Record Details</h3>
              <button onClick={() => setShowDetailModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div><strong>ID:</strong> <span className="font-mono text-xs">{selectedSub.id}</span></div>
              <div><strong>Email:</strong> {selectedSub.email}</div>
              <div><strong>Normalized:</strong> <span className="font-mono text-xs">{selectedSub.emailNormalized}</span></div>
              <div><strong>Audience Segment:</strong> <span className="badge badge-brand">{selectedSub.audienceType}</span></div>
              <div><strong>Consent Status:</strong> {selectedSub.consentStatus} ({selectedSub.consentType})</div>
              <div><strong>Consent Version:</strong> {selectedSub.consentVersion}</div>
              <div><strong>Consent Timestamp:</strong> {new Date(selectedSub.consentTimestamp).toLocaleString()}</div>
              <div><strong>Subscription Status:</strong> {selectedSub.subscriptionStatus}</div>
              {selectedSub.unsubscribedAt && <div><strong>Unsubscribed At:</strong> {new Date(selectedSub.unsubscribedAt).toLocaleString()}</div>}
              <div><strong>Unsubscribe Token:</strong> <span className="font-mono text-xs" style={{ wordBreak: 'break-all' }}>{selectedSub.unsubscribeToken}</span></div>
              <div><strong>Created At:</strong> {new Date(selectedSub.createdAt).toLocaleString()}</div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button onClick={() => setShowDetailModal(false)} className="btn btn-secondary btn-md">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* TOKEN UNSUBSCRIBE SIMULATOR MODAL */}
      {showUnsubSimModal && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100 }}>
          <div className="card" style={{ maxWidth: '480px', width: '90%', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 className="text-xl font-bold">Test Token Unsubscribe</h3>
              <button onClick={() => setShowUnsubSimModal(false)} className="btn btn-secondary btn-sm" style={{ padding: '0.2rem 0.4rem' }}>
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-secondary" style={{ lineHeight: 1.5 }}>
              Enter an unsubscribe token (e.g. <span className="font-mono">unsub_tok_hilton_001</span>) to test the single-click token-based unsubscribe mechanism.
            </p>

            <form onSubmit={handleTestUnsubscribeToken} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div className="input-group">
                <label className="input-label">Unsubscribe Token</label>
                <input
                  type="text"
                  placeholder="e.g. unsub_tok_hilton_001"
                  value={testTokenInput}
                  onChange={(e) => setTestTokenInput(e.target.value)}
                  required
                  className="input-field font-mono"
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setShowUnsubSimModal(false)} className="btn btn-secondary btn-md">Cancel</button>
                <button type="submit" className="btn btn-primary btn-md">Execute Unsubscribe</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
