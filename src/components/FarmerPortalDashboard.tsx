import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { Product } from '../core/database/schema';
import { 
  Leaf, 
  PlusCircle, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  FileText, 
  DollarSign, 
  Award, 
  Upload, 
  FileCheck,
  Eye,
  Thermometer,
  Layers
} from 'lucide-react';
import { FileSecurityManager } from '../core/security/fileSecurity';
import { SellerSupplyIntake } from './SellerSupplyIntake';

interface FarmerPortalDashboardProps {
  farmerUserId?: string;
  onInspectTraceability: (lotId: string) => void;
}

export const FarmerPortalDashboard: React.FC<FarmerPortalDashboardProps> = ({
  farmerUserId = 'usr-farmer-01',
  onInspectTraceability,
}) => {
  const [activeTab, setActiveTab] = useState<'LOTS' | 'NEW_BATCH' | 'QUALITY' | 'SETTLEMENTS' | 'PROFILE'>('LOTS');

  // New Batch Form State
  const [selectedProductId, setSelectedProductId] = useState('prod-01');
  const [harvestDate, setHarvestDate] = useState('2026-08-10');
  const [quantityKg, setQuantityKg] = useState(500);
  const [storageTemp, setStorageTemp] = useState(13.0);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [intakeSuccessMsg, setIntakeSuccessMsg] = useState<string | null>(null);

  const farmerProfile = AgriTrustDatabase.getFarmerProfileByUserId(farmerUserId) || {
    id: 'fp-01',
    userId: farmerUserId,
    organisationId: 'org-farmer-01',
    businessName: 'Holder Agricultural Produce',
    contactName: 'Marcus Holder',
    privatePhone: '+1-555-019-4821',
    privateAddress: '742 Evergreen Valley Road, Plot 14',
    privateGpsLat: 13.1939,
    privateGpsLng: -59.5432,
    publicRegion: 'Western Agricultural Zone 4',
    trustScore: 92.5,
    verified: true,
    createdAt: '2026-01-10T08:00:00Z',
  };

  const products = AgriTrustDatabase.getProducts();
  const farmerLots = AgriTrustDatabase.getFarmerLots(farmerProfile.id);
  const farmerSettlements = AgriTrustDatabase.getFarmerSettlements(farmerProfile.id);

  const totalEarnings = farmerSettlements.reduce((acc, s) => acc + s.netPayout, 0);
  const totalQuantityProduced = farmerLots.reduce((acc, l) => acc + (l.initialQuantityKg || 500), 0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validation = FileSecurityManager.validateUpload(file.name, file.type, file.size);
    if (!validation.valid) {
      setFileError(validation.reason || 'File validation failed');
      setUploadedFileName(null);
    } else {
      setFileError(null);
      setUploadedFileName(file.name);
    }
  };

  const handleRegisterBatch = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find((p) => p.id === selectedProductId) || products[0];

    const newLot = AgriTrustDatabase.createHarvestLot(
      farmerProfile.id,
      product.id,
      product.name,
      quantityKg,
      storageTemp
    );

    const hashPreview = (newLot.verificationHash || 'sha256_hash').substring(0, 16);
    setIntakeSuccessMsg(`Harvest Batch Registered Successfully! Cryptographic Lot Token: ${newLot.id} (Hash: ${hashPreview}...)`);
    setActiveTab('LOTS');
  };

  return (
    <div style={{ padding: '2.5rem 0 5rem', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Producer Header Banner */}
        <div style={{
          padding: '2rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-sm)',
          marginBottom: '2rem'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                <span className="badge badge-brand" style={{ backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', fontSize: '0.75rem' }}>
                  VERIFIED AGRICULTURAL PRODUCER
                </span>
                <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
                  <Award size={12} /> Tier 1 Producer
                </span>
              </div>
              <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
                {farmerProfile.businessName}
              </h1>
              <p className="text-secondary text-xs" style={{ marginTop: '0.15rem' }}>
                Lead Producer: {farmerProfile.contactName} • Regional Token: <strong style={{ color: 'var(--brand-primary)' }}>{farmerProfile.publicRegion}</strong>
              </p>
            </div>

            <button onClick={() => setActiveTab('NEW_BATCH')} className="btn btn-primary btn-sm">
              <PlusCircle size={16} /> Register New Harvest Batch
            </button>
          </div>

          {/* Operational Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>Producer Trust Score</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.2rem' }}>
                {farmerProfile.trustScore} / 100
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>Active Intake Lots</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--brand-accent)', marginTop: '0.2rem' }}>
                {farmerLots.length}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>Total Net Payouts</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '0.2rem' }}>
                ${totalEarnings.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>

            <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
              <span className="text-muted text-xs font-semibold" style={{ display: 'block', textTransform: 'uppercase' }}>Total Produced Volume</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, marginTop: '0.2rem' }}>
                {totalQuantityProduced.toLocaleString()} kg
              </div>
            </div>
          </div>
        </div>

        {/* Counterparty Privacy Shield Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '0.875rem 1.25rem',
          backgroundColor: 'var(--brand-primary-light)',
          border: '1px solid rgba(16, 128, 67, 0.2)',
          borderRadius: 'var(--radius-md)',
          marginBottom: '2rem',
          fontSize: '0.8125rem',
          color: 'var(--brand-primary)'
        }}>
          <Lock size={18} style={{ flexShrink: 0 }} />
          <span>
            <strong>Bilateral Privacy Boundary Enforced:</strong> Commercial buyers only see your public regional token (<code>{farmerProfile.publicRegion}</code>). Your private street address, phone number, and exact GPS coordinates are strictly protected inside AgriTrust core.
          </span>
        </div>

        {intakeSuccessMsg && (
          <div style={{
            padding: '1rem 1.25rem',
            backgroundColor: 'var(--brand-primary-light)',
            color: 'var(--brand-primary)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <CheckCircle2 size={18} /> {intakeSuccessMsg}
          </div>
        )}

        {/* Tab Navigation */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveTab('LOTS')}
            className={`btn btn-sm ${activeTab === 'LOTS' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Layers size={16} /> Harvest Intake Lots ({farmerLots.length})
          </button>
          <button
            onClick={() => setActiveTab('NEW_BATCH')}
            className={`btn btn-sm ${activeTab === 'NEW_BATCH' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <PlusCircle size={16} /> Register New Batch
          </button>
          <button
            onClick={() => setActiveTab('QUALITY')}
            className={`btn btn-sm ${activeTab === 'QUALITY' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <ShieldCheck size={16} /> AI Spectrovision Inspections
          </button>
          <button
            onClick={() => setActiveTab('SETTLEMENTS')}
            className={`btn btn-sm ${activeTab === 'SETTLEMENTS' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <DollarSign size={16} /> Settlement Payouts ({farmerSettlements.length})
          </button>
          <button
            onClick={() => setActiveTab('PROFILE')}
            className={`btn btn-sm ${activeTab === 'PROFILE' ? 'btn-primary' : 'btn-secondary'}`}
          >
            <Leaf size={16} /> Farm Profile & Anonymization
          </button>
        </div>

        {/* Tab 1: Harvest Intake Lots */}
        {activeTab === 'LOTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {farmerLots.map((lot) => {
              const quality = AgriTrustDatabase.getLotQuality(lot.id);
              const events = AgriTrustDatabase.getLotEvents(lot.id);

              return (
                <div key={lot.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span className="text-muted text-xs font-bold" style={{ fontFamily: 'monospace' }}>LOT TOKEN: {lot.id}</span>
                        <span className="badge badge-brand">{lot.status}</span>
                      </div>
                      <h3 className="text-lg font-bold" style={{ marginTop: '0.15rem' }}>
                        Batch Quantity: {lot.initialQuantityKg || 500} kg
                      </h3>
                    </div>

                    <button
                      onClick={() => onInspectTraceability(lot.id)}
                      className="btn btn-secondary btn-sm"
                    >
                      <Eye size={14} /> View Provenance Ledger
                    </button>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem' }}>
                    <div>
                      <span className="text-muted text-xs">AI Spectrovision Grade</span>
                      <div className="font-bold text-sm" style={{ color: 'var(--brand-primary)' }}>{quality.grade}</div>
                    </div>
                    <div>
                      <span className="text-muted text-xs">AI Confidence Score</span>
                      <div className="font-semibold">{quality.aiConfidenceScore}%</div>
                    </div>
                    <div>
                      <span className="text-muted text-xs">Intake Location</span>
                      <div className="font-semibold">{events[0]?.locationSummary || farmerProfile.publicRegion}</div>
                    </div>
                    <div>
                      <span className="text-muted text-xs">Cryptographic Hash</span>
                      <div className="font-mono text-xs" style={{ wordBreak: 'break-all', color: 'var(--text-muted)' }}>
                        {(lot.verificationHash || 'sha256_hash').substring(0, 20)}...
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 2: New Batch Intake Registration (Seller Supply Intake) */}
        {activeTab === 'NEW_BATCH' && (
          <SellerSupplyIntake
            sellerId={farmerProfile.id}
            onSuccess={() => setActiveTab('LOTS')}
            onCancel={() => setActiveTab('LOTS')}
          />
        )}

        {/* Tab 3: AI Spectrovision Inspections */}
        {activeTab === 'QUALITY' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {farmerLots.map((lot) => {
              const quality = AgriTrustDatabase.getLotQuality(lot.id);
              return (
                <div key={lot.id} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div>
                      <span className="text-muted text-xs font-mono">INSPECTION ID: {quality.id}</span>
                      <h3 className="text-base font-bold">Lot ID: {lot.id}</h3>
                    </div>
                    <span className="badge badge-success" style={{ fontSize: '0.8125rem' }}>
                      {quality.status}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', fontSize: '0.875rem' }}>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                      <span className="text-muted text-xs">Spectrovision Grade</span>
                      <div className="text-lg font-bold" style={{ color: 'var(--brand-primary)' }}>{quality.grade}</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                      <span className="text-muted text-xs">AI Confidence Score</span>
                      <div className="text-lg font-bold">{quality.aiConfidenceScore}%</div>
                    </div>
                    <div style={{ padding: '1rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                      <span className="text-muted text-xs">Defect Analysis</span>
                      <div className="font-semibold text-xs text-secondary" style={{ marginTop: '0.2rem' }}>
                        {quality.defectsDetected.join(', ')}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 4: Settlement Payouts */}
        {activeTab === 'SETTLEMENTS' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {farmerSettlements.map((set) => (
              <div key={set.id} className="card" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)' }}>
                    <DollarSign size={22} />
                  </div>
                  <div>
                    <span className="text-muted text-xs font-mono">SETTLEMENT: {set.id}</span>
                    <h4 className="font-bold text-base">{set.cropName} ({set.totalUnitsKg} kg)</h4>
                    <span className="text-muted text-xs">Lot Token: {set.lotId} • Payout Date: {new Date(set.payoutDate).toLocaleDateString()}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div className="text-xs text-muted">Gross: ${set.grossAmount.toFixed(2)} • Platform Fee: -${set.platformDeduction.toFixed(2)}</div>
                  <div className="text-xl font-bold" style={{ color: 'var(--status-success)' }}>
                    Net Payout: ${set.netPayout.toFixed(2)}
                  </div>
                  <span className={`badge ${set.status === 'SETTLED' ? 'badge-success' : 'badge-accent'}`} style={{ marginTop: '0.25rem' }}>
                    {set.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 5: Farm Profile & Regional Anonymization */}
        {activeTab === 'PROFILE' && (
          <div className="card" style={{ padding: '2rem' }}>
            <h3 className="text-xl font-bold" style={{ marginBottom: '1.5rem' }}>Producer Farm Profile & Privacy Status</h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.875rem' }}>
              <div>
                <span className="text-muted text-xs">Registered Farm Business Name</span>
                <div className="font-bold text-base">{farmerProfile.businessName}</div>
              </div>
              <div>
                <span className="text-muted text-xs">Lead Producer Contact Name</span>
                <div className="font-bold text-base">{farmerProfile.contactName}</div>
              </div>
              <div>
                <span className="text-muted text-xs">Private Farm Street Address (AgriTrust Logistics Only)</span>
                <div className="font-medium">{farmerProfile.privateAddress}</div>
              </div>
              <div>
                <span className="text-muted text-xs">Public Regional Classification Token (Exposed to Buyers)</span>
                <div className="font-bold text-base" style={{ color: 'var(--brand-primary)' }}>
                  {farmerProfile.publicRegion}
                </div>
              </div>
              <div>
                <span className="text-muted text-xs">Producer Trust Rating</span>
                <div className="font-bold text-base" style={{ color: 'var(--brand-primary)' }}>
                  {farmerProfile.trustScore} / 100 (Tier 1 Certified)
                </div>
              </div>
              <div>
                <span className="text-muted text-xs">Bilateral Counterparty Privacy Status</span>
                <div style={{ marginTop: '0.25rem' }}>
                  <span className="badge badge-success">
                    <Lock size={14} /> Active Protection
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
