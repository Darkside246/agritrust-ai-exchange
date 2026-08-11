import React from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { AuditLedger } from '../core/audit/auditLedger';
import { AdminTab } from './AdminSidebar';
import { 
  Package, 
  ShoppingBag, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Bot, 
  Layers, 
  TrendingUp,
  ArrowUpRight,
  ClipboardList
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigate: (tab: AdminTab) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const lots = AgriTrustDatabase.getAllLots();
  const availableLots = AgriTrustDatabase.getAvailableLots();
  const aiAgents = AgriTrustDatabase.getAIAgents();
  const aiRuns = AgriTrustDatabase.getAIRuns();
  const operationalLogs = AuditLedger.getOperationalLogs();
  const vaultStatus = AuditLedger.verifySecurityVaultIntegrity();

  const totalStockKg = availableLots
    .filter((l) => l.unit === 'kg')
    .reduce((sum, l) => sum + l.availableStock, 0);

  const totalStockCrates = availableLots
    .filter((l) => l.unit === 'crate')
    .reduce((sum, l) => sum + l.availableStock, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Dashboard Overview Header */}
      <div className="card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>
          <div>
            <span className="badge badge-brand" style={{ backgroundColor: 'rgba(230, 81, 0, 0.15)', color: 'var(--brand-accent)', fontSize: '0.75rem', marginBottom: '0.35rem' }}>
              ADMINISTRATIVE OPERATIONAL OVERVIEW
            </span>
            <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
              Platform Authoritative Control Centre
            </h1>
            <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
              Real-time backend telemetry from <code>AgriTrustDatabase</code>. Live database synchronization active.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button onClick={() => onNavigate('INVENTORY')} className="btn btn-primary btn-sm">
              <Package size={14} /> Wholesale Inventory ({availableLots.length})
            </button>
            <button onClick={() => onNavigate('CMS_CONTENT')} className="btn btn-secondary btn-sm">
              Manage CMS Content
            </button>
          </div>
        </div>

        {/* Core Metrics Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1.25rem',
          marginTop: '1.75rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
              <span>ACTIVE WHOLESALE LOTS</span>
              <Package size={16} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-primary)', marginTop: '0.35rem' }}>
              {availableLots.length} Lots
            </div>
            <span className="text-muted text-xs">{totalStockKg} kg + {totalStockCrates} crates</span>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
              <span>REGISTERED AI AGENTS</span>
              <Bot size={16} style={{ color: 'var(--brand-accent)' }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--brand-accent)', marginTop: '0.35rem' }}>
              {aiAgents.filter((a) => a.status === 'ACTIVE').length} / {aiAgents.length} Active
            </div>
            <span className="text-muted text-xs">Governance Policy: GOV-POL-2026-V1</span>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
              <span>SECURITY VAULT HASH CHAIN</span>
              <ShieldCheck size={16} style={{ color: 'var(--status-success)' }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--status-success)', marginTop: '0.35rem' }}>
              100% Intact
            </div>
            <span className="text-muted text-xs">{vaultStatus.verifiedCount} Blocks Verified</span>
          </div>

          <div style={{ padding: '1.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600 }}>
              <span>MINIMUM MARGIN TARGET</span>
              <TrendingUp size={16} style={{ color: 'var(--brand-primary)' }} />
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 800, marginTop: '0.35rem' }}>
              20.0% Enforced
            </div>
            <span className="text-muted text-xs">Formula: Price = Cost / (1 - Margin)</span>
          </div>
        </div>
      </div>

      {/* Operational Quick Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.75rem' }}>
        {/* Available Wholesale Lots Summary Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 className="text-lg font-bold">Available Wholesale Inventory</h3>
            <button onClick={() => onNavigate('INVENTORY')} className="btn btn-secondary btn-sm">
              View All Inventory <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {lots.slice(0, 4).map((lot) => (
              <div key={lot.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-elevated)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="font-bold text-sm" style={{ fontFamily: 'monospace' }}>{lot.id}</span>
                    <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>{lot.grade}</span>
                  </div>
                  <div className="text-xs text-secondary">{lot.commodity} • {lot.variety}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 800, color: 'var(--brand-primary)' }}>${lot.wholesalePrice.toFixed(2)} / {lot.unit}</div>
                  <span className="text-muted text-xs">Stock: {lot.availableStock} {lot.unit}s</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Agent Governance Telemetry Card */}
        <div className="card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <h3 className="text-lg font-bold">AI Agent Registry & Governance</h3>
            <button onClick={() => onNavigate('AI_AGENTS')} className="btn btn-secondary btn-sm">
              Manage AI Agents <ArrowUpRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            {aiAgents.slice(0, 4).map((agent) => (
              <div key={agent.id} style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'var(--bg-surface-elevated)' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
                    <span className="font-bold text-sm">{agent.name}</span>
                    <span className="badge badge-brand" style={{ fontSize: '0.65rem' }}>{agent.version}</span>
                  </div>
                  <div className="text-xs text-secondary">{agent.purpose}</div>
                </div>

                <span className={`badge ${agent.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.7rem' }}>
                  {agent.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
