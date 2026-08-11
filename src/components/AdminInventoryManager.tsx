import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { Lot, ProduceGrade, PublicationStatus } from '../core/database/schema';
import { HideConfirmationModal } from './HideConfirmationModal';
import { AdminPreviewModal } from './AdminPreviewModal';
import { 
  Package, 
  Search, 
  Filter, 
  Edit3, 
  Eye, 
  EyeOff, 
  DollarSign, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  ClipboardList, 
  X, 
  Save, 
  ShieldAlert,
  Archive,
  RefreshCw,
  Clock,
  RotateCcw,
  Send
} from 'lucide-react';

export const AdminInventoryManager: React.FC = () => {
  const [allLots, setAllLots] = useState<Lot[]>(AgriTrustDatabase.getAllLots());
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [commodityFilter, setCommodityFilter] = useState<string>('ALL');
  const [gradeFilter, setGradeFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [hidingLot, setHidingLot] = useState<Lot | null>(null);
  const [previewingLot, setPreviewingLot] = useState<Lot | null>(null);
  const [previewToken, setPreviewToken] = useState<string>('');

  // Form State
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);
  const [editGrade, setEditGrade] = useState<ProduceGrade>('Grade A');
  const [editDescription, setEditDescription] = useState<string>('');
  const [editMoq, setEditMoq] = useState<number>(10);
  const [editNotes, setEditNotes] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const refreshLots = () => {
    setAllLots(AgriTrustDatabase.getAllLots());
  };

  const handleOpenEditModal = (lot: Lot) => {
    setEditingLot(lot);
    setEditPrice(lot.wholesalePrice);
    setEditStock(lot.availableStock);
    setEditGrade(lot.grade);
    setEditDescription(lot.description || '');
    setEditMoq(lot.moq);
    setEditNotes(lot.internalNotes || '');
    setSuccessMsg(null);
  };

  const handleSaveDraft = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLot) return;

    AgriTrustDatabase.saveLotDraft(
      editingLot.id,
      {
        wholesalePrice: editPrice,
        availableStock: editStock,
        grade: editGrade,
        description: editDescription,
        moq: editMoq,
        internalNotes: editNotes,
      },
      'sys-admin'
    );

    refreshLots();
    setSuccessMsg(`Draft changes saved for Lot ${editingLot.id}. The live public marketplace remains unchanged until Published.`);
    setEditingLot(null);
  };

  const handlePublishNow = (lotId: string) => {
    try {
      AgriTrustDatabase.publishLotDraft(lotId, 'sys-admin');
      refreshLots();
      setSuccessMsg(`Lot ${lotId} has been successfully Published to the public marketplace!`);
      if (editingLot) setEditingLot(null);
      if (previewingLot) setPreviewingLot(null);
    } catch (err: any) {
      alert(err.message || 'Publication failed validation checks.');
    }
  };

  const handleConfirmHide = () => {
    if (!hidingLot) return;

    AgriTrustDatabase.updateLotPublicationStatus(hidingLot.id, 'HIDDEN', 'sys-admin', 'Administrator requested hide from marketplace.');
    refreshLots();
    setSuccessMsg(`Lot ${hidingLot.id} has been set to HIDDEN and immediately removed from the public marketplace.`);
    setHidingLot(null);
  };

  const handleOpenPreview = (lot: Lot) => {
    const token = AgriTrustDatabase.generatePreviewToken(lot.id, 'sys-admin');
    setPreviewToken(token);
    setPreviewingLot(lot);
  };

  const handleUpdateStatusDirect = (lotId: string, targetStatus: PublicationStatus, reason?: string) => {
    AgriTrustDatabase.updateLotPublicationStatus(lotId, targetStatus, 'sys-admin', reason);
    refreshLots();
    setSuccessMsg(`Lot ${lotId} publication status changed to ${targetStatus}.`);
  };

  // Filtering Logic
  const filteredLots = allLots.filter((lot) => {
    const currentPubStatus = lot.publicationStatus || (lot.publicVisibility ? 'PUBLISHED' : 'HIDDEN');

    // Status Tab Filter
    if (statusFilter !== 'ALL' && currentPubStatus !== statusFilter) {
      return false;
    }
    // Commodity Filter
    if (commodityFilter !== 'ALL' && lot.commodity !== commodityFilter) {
      return false;
    }
    // Grade Filter
    if (gradeFilter !== 'ALL' && lot.grade !== gradeFilter) {
      return false;
    }
    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchId = lot.id.toLowerCase().includes(q);
      const matchComm = lot.commodity.toLowerCase().includes(q);
      const matchVar = lot.variety.toLowerCase().includes(q);
      return matchId || matchComm || matchVar;
    }
    return true;
  });

  const getStatusBadgeClass = (status: PublicationStatus) => {
    switch (status) {
      case 'PUBLISHED': return 'badge-success';
      case 'HIDDEN': return 'badge-accent';
      case 'DRAFT': return 'badge-brand';
      case 'SCHEDULED': return 'badge-brand';
      case 'ARCHIVED': return 'badge-secondary';
      case 'QUARANTINED': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-brand" style={{ fontSize: '0.75rem', backgroundColor: 'rgba(16, 128, 67, 0.15)', color: 'var(--brand-primary)' }}>
            CMS PUBLISHING ARCHITECTURE
          </span>
          <span className="text-xs text-muted font-mono">WordPress / WooCommerce Engine</span>
        </div>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
          Wholesale Market Inventory
        </h1>
        <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
          Showing {filteredLots.length} of {allLots.length} available wholesale lots in backend database.
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

      {/* Status Filter Tabs (WordPress-Style) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        {['ALL', 'PUBLISHED', 'HIDDEN', 'DRAFT', 'PENDING_REVIEW', 'SCHEDULED', 'ARCHIVED', 'QUARANTINED'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.75rem', textTransform: 'capitalize' }}
          >
            {st.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Commodity & Grade Filter Bar */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', flex: 1 }}>
          <div style={{ position: 'relative', minWidth: '260px', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search Lot ID, Commodity, Variety..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Filter size={16} className="text-muted" />
            <select value={commodityFilter} onChange={(e) => setCommodityFilter(e.target.value)} className="input-field" style={{ width: '160px' }}>
              <option value="ALL">All Commodities</option>
              <option value="Tomatoes">Tomatoes</option>
              <option value="Lettuce">Lettuce</option>
              <option value="Cucumbers">Cucumbers</option>
              <option value="Peppers">Peppers</option>
            </select>

            <select value={gradeFilter} onChange={(e) => setGradeFilter(e.target.value)} className="input-field" style={{ width: '140px' }}>
              <option value="ALL">All Grades</option>
              <option value="Grade A">Grade A Only</option>
              <option value="Grade B">Grade B</option>
              <option value="Premium">Premium</option>
              <option value="Standard">Standard</option>
            </select>
          </div>
        </div>

        <button onClick={refreshLots} className="btn btn-secondary btn-sm">
          <RefreshCw size={14} /> Refresh Data
        </button>
      </div>

      {/* Main Admin Inventory Table (Section 13) */}
      <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-surface-elevated)', textAlign: 'left', color: 'var(--text-muted)' }}>
              <th style={{ padding: '0.875rem 1rem' }}>Lot ID</th>
              <th style={{ padding: '0.875rem 1rem' }}>Commodity & Variety</th>
              <th style={{ padding: '0.875rem 1rem' }}>Grade</th>
              <th style={{ padding: '0.875rem 1rem' }}>Harvest Date</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Available Stock</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Wholesale Price</th>
              <th style={{ padding: '0.875rem 1rem' }}>Publication</th>
              <th style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLots.map((lot) => {
              const pubStatus: PublicationStatus = lot.publicationStatus || (lot.publicVisibility ? 'PUBLISHED' : 'HIDDEN');

              return (
                <tr key={lot.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '0.875rem 1rem', fontFamily: 'monospace', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    {lot.id}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ fontWeight: 700 }}>{lot.commodity}</div>
                    <div className="text-secondary text-xs">{lot.variety}</div>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span className="badge badge-brand" style={{ fontSize: '0.7rem' }}>{lot.grade}</span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', color: 'var(--text-muted)' }}>
                    {lot.harvestDate}
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 700 }}>
                    {lot.availableStock.toLocaleString()} {lot.unit}s
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right', fontWeight: 700, color: 'var(--brand-primary)' }}>
                    ${lot.wholesalePrice.toFixed(2)} / {lot.unit}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span className={`badge ${getStatusBadgeClass(pubStatus)}`} style={{ fontSize: '0.7rem' }}>
                      {pubStatus}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.35rem' }}>
                      <button onClick={() => handleOpenEditModal(lot)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        <Edit3 size={13} /> Edit
                      </button>

                      <button onClick={() => handleOpenPreview(lot)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                        <Eye size={13} /> Preview
                      </button>

                      {/* Contextual Action Buttons (Section 14) */}
                      {pubStatus === 'PUBLISHED' && (
                        <button onClick={() => setHidingLot(lot)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', color: 'var(--brand-accent)' }}>
                          <EyeOff size={13} /> Hide
                        </button>
                      )}

                      {(pubStatus === 'HIDDEN' || pubStatus === 'DRAFT' || pubStatus === 'UNPUBLISHED') && (
                        <button onClick={() => handlePublishNow(lot.id)} className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          <Send size={13} /> Publish
                        </button>
                      )}

                      {pubStatus === 'SCHEDULED' && (
                        <button onClick={() => handlePublishNow(lot.id)} className="btn btn-primary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          Publish Now
                        </button>
                      )}

                      {pubStatus === 'ARCHIVED' && (
                        <button onClick={() => handleUpdateStatusDirect(lot.id, 'DRAFT', 'Restored from archived state')} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                          <RotateCcw size={13} /> Restore
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Edit Drawer Modal */}
      {editingLot && (
        <div className="modal-backdrop" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ maxWidth: '640px', width: '90%', maxHeight: '90vh', overflowY: 'auto', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <div>
                <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>DRAFT / PUBLISHING EDITOR</span>
                <h3 className="text-xl font-bold">Edit Lot Parameters — {editingLot.id}</h3>
              </div>
              <button onClick={() => setEditingLot(null)} className="btn btn-secondary btn-sm" style={{ padding: '0.25rem 0.5rem' }}>
                <X size={16} />
              </button>
            </div>

            <form style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Wholesale Price (${editingLot.currency} / {editingLot.unit})</label>
                  <input
                    type="number"
                    step="0.05"
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                    required
                    className="input-field"
                  />
                </div>

                <div className="input-group">
                  <label className="input-label">Available Stock ({editingLot.unit}s)</label>
                  <input
                    type="number"
                    value={editStock}
                    onChange={(e) => setEditStock(parseInt(e.target.value, 10) || 0)}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label className="input-label">Produce Grade</label>
                  <select
                    value={editGrade}
                    onChange={(e) => setEditGrade(e.target.value as ProduceGrade)}
                    className="input-field"
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Premium">Premium</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>

                <div className="input-group">
                  <label className="input-label">Minimum Order Quantity (MOQ)</label>
                  <input
                    type="number"
                    value={editMoq}
                    onChange={(e) => setEditMoq(parseInt(e.target.value, 10) || 1)}
                    required
                    className="input-field"
                  />
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Public Product Description</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="input-field"
                  style={{ resize: 'vertical' }}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Internal Operational Notes</label>
                <input
                  type="text"
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="input-field"
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={handleSaveDraft}
                  className="btn btn-secondary btn-md"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Save size={16} /> Save Draft
                </button>

                <button
                  type="button"
                  onClick={() => handlePublishNow(editingLot.id)}
                  className="btn btn-primary btn-md"
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
                >
                  <Send size={16} /> Publish Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Hide Confirmation Dialog */}
      <HideConfirmationModal
        isOpen={Boolean(hidingLot)}
        lotId={hidingLot?.id || ''}
        commodity={hidingLot?.commodity || ''}
        onConfirm={handleConfirmHide}
        onCancel={() => setHidingLot(null)}
      />

      {/* Secure Admin Preview Modal */}
      <AdminPreviewModal
        isOpen={Boolean(previewingLot)}
        lot={previewingLot}
        previewToken={previewToken}
        onClose={() => setPreviewingLot(null)}
        onEdit={(lot) => {
          setPreviewingLot(null);
          handleOpenEditModal(lot);
        }}
        onPublish={(lotId) => handlePublishNow(lotId)}
      />
    </div>
  );
};
