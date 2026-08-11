import React, { useState, useEffect } from 'react';
import { AdminSidebar, AdminTab } from './AdminSidebar';
import { AdminDashboard } from './AdminDashboard';
import { AdminInventoryManager } from './AdminInventoryManager';
import { AdminCMSManager } from './AdminCMSManager';
import { AdminSettingsWorkspace } from './AdminSettingsWorkspace';
import { AdminQualityWorkspace } from './AdminQualityWorkspace';
import { AdminTraceabilityWorkspace } from './AdminTraceabilityWorkspace';
import { AdminAIMonitoring } from './AdminAIMonitoring';
import { AdminSupplyInbox } from './AdminSupplyInbox';
import { AdminProductCatalogue } from './AdminProductCatalogue';
import { AdminBuyersDirectory } from './AdminBuyersDirectory';
import { AdminSellersDirectory } from './AdminSellersDirectory';
import { AdminMarketingWorkspace } from './AdminMarketingWorkspace';
import { AdminWhatsAppWorkspace } from './AdminWhatsAppWorkspace';
import { AgriTrustDatabase } from '../core/database/db';
import { AdminProfile } from '../core/database/schema';
import { ShieldCheck, LogOut, Search, Bell, Activity, User, ChevronDown, Key, Laptop, ShieldAlert } from 'lucide-react';

interface AdminShellProps {
  adminUserId?: string;
  onLogout?: () => void;
}

export const AdminShell: React.FC<AdminShellProps> = ({
  adminUserId = 'sys-admin',
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('DASHBOARD');
  const [initialSettingsCat, setInitialSettingsCat] = useState<string>('MY_ACCOUNT');
  const [initialAccountSubtab, setInitialAccountSubtab] = useState<string>('PROFILE');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);
  const [adminProfile, setAdminProfile] = useState<AdminProfile>(AgriTrustDatabase.getAdminProfile());

  useEffect(() => {
    setAdminProfile(AgriTrustDatabase.getAdminProfile());
  }, [activeTab, showAccountDropdown]);

  const handleNavigateToAccount = (cat: string = 'MY_ACCOUNT', subtab: string = 'PROFILE') => {
    setInitialSettingsCat(cat);
    setInitialAccountSubtab(subtab);
    setActiveTab('SYSTEM');
    setShowAccountDropdown(false);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--bg-primary)' }}>
      {/* Persistent Left Navigation Sidebar */}
      <AdminSidebar activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        {/* Top Header Navigation Bar */}
        <header style={{
          height: '64px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 2rem',
          position: 'relative'
        }}>
          {/* Global Administrative Search Bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, maxWidth: '400px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Global admin search (Lots, Orders, Users, AI Runs)..."
                className="input-field"
                style={{ paddingLeft: '2.35rem', fontSize: '0.8125rem', height: '36px' }}
              />
            </div>
          </div>

          {/* Right Header Status Bar & Authenticated Admin Account Menu (Section 21) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
              <Activity size={14} /> System Status: Operational
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', backgroundColor: 'rgba(230, 81, 0, 0.15)', color: 'var(--brand-accent)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 600 }}>
              <ShieldCheck size={14} /> Security Vault: Protected
            </div>

            {/* Authenticated Administrator Profile Component (Section 21) */}
            <div style={{ position: 'relative', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.25rem' }}>
              <button
                onClick={() => setShowAccountDropdown(!showAccountDropdown)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem 0.5rem',
                  borderRadius: 'var(--radius-md)',
                }}
                className="hover-bg-surface-elevated"
              >
                {adminProfile.photoUrl ? (
                  <img
                    src={adminProfile.photoUrl}
                    alt={adminProfile.displayName}
                    style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--brand-primary)' }}
                  />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', backgroundColor: 'var(--brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.875rem' }}>
                    {adminProfile.firstName ? adminProfile.firstName[0] : 'A'}{adminProfile.lastName ? adminProfile.lastName[0] : 'V'}
                  </div>
                )}

                <div style={{ textAlign: 'left', fontSize: '0.75rem' }}>
                  <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{adminProfile.firstName} {adminProfile.lastName}</div>
                  <div className="text-muted" style={{ fontSize: '0.6875rem' }}>{adminProfile.jobTitle}</div>
                </div>

                <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />
              </button>

              {/* Profile Account Dropdown Menu (Section 21) */}
              {showAccountDropdown && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: '100%',
                  marginTop: '0.5rem',
                  width: '220px',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                  zIndex: 1000,
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '0.5rem 0',
                  fontSize: '0.8125rem'
                }}>
                  <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', marginBottom: '0.25rem' }}>
                    <div style={{ fontWeight: 700 }}>{adminProfile.displayName}</div>
                    <div className="text-muted text-xs font-mono">{adminProfile.email}</div>
                  </div>

                  <button
                    onClick={() => handleNavigateToAccount('MY_ACCOUNT', 'PROFILE')}
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--text-primary)' }}
                    className="hover-bg-surface"
                  >
                    <User size={14} /> My Account
                  </button>

                  <button
                    onClick={() => handleNavigateToAccount('MY_ACCOUNT', 'SECURITY')}
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--text-primary)' }}
                    className="hover-bg-surface"
                  >
                    <ShieldCheck size={14} /> Security & 2FA
                  </button>

                  <button
                    onClick={() => handleNavigateToAccount('MY_ACCOUNT', 'SESSIONS')}
                    style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--text-primary)' }}
                    className="hover-bg-surface"
                  >
                    <Laptop size={14} /> Active Sessions
                  </button>

                  {onLogout && (
                    <button
                      onClick={() => { setShowAccountDropdown(false); onLogout(); }}
                      style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', color: 'var(--status-danger)', borderTop: '1px solid var(--border-color)', marginTop: '0.25rem' }}
                      className="hover-bg-surface"
                    >
                      <LogOut size={14} /> Logout
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Workspace Container */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          {activeTab === 'DASHBOARD' && (
            <AdminDashboard onNavigate={(tab) => setActiveTab(tab)} />
          )}

          {activeTab === 'SUPPLY_SUBMISSIONS' && (
            <AdminSupplyInbox />
          )}

          {activeTab === 'INVENTORY' && (
            <AdminInventoryManager />
          )}

          {activeTab === 'PRODUCT_CATALOGUE' && (
            <AdminProductCatalogue />
          )}

          {activeTab === 'QUALITY' && (
            <AdminQualityWorkspace />
          )}

          {activeTab === 'TRACEABILITY' && (
            <AdminTraceabilityWorkspace />
          )}

          {activeTab === 'BUYERS' && (
            <AdminBuyersDirectory />
          )}

          {activeTab === 'SELLERS' && (
            <AdminSellersDirectory />
          )}

          {(activeTab === 'AI_AGENTS' || activeTab === 'AI_RUNS') && (
            <AdminAIMonitoring defaultTab={activeTab === 'AI_RUNS' ? 'RUNS' : 'AGENTS'} />
          )}

          {activeTab === 'CMS_CONTENT' && (
            <AdminCMSManager initialTab="BUILDER" />
          )}

          {activeTab === 'CMS_BUILDER' && (
            <AdminCMSManager initialTab="BUILDER" />
          )}

          {activeTab === 'CMS_MEDIA' && (
            <AdminCMSManager initialTab="MEDIA" />
          )}

          {activeTab === 'CMS_NAVIGATION' && (
            <AdminCMSManager initialTab="NAVIGATION" />
          )}

          {activeTab === 'CMS_FOOTER' && (
            <AdminCMSManager initialTab="FOOTER" />
          )}

          {activeTab === 'CMS_SEO' && (
            <AdminCMSManager initialTab="SEO" />
          )}

          {activeTab === 'MARKETING' && (
            <AdminMarketingWorkspace adminUserId={adminUserId} />
          )}

          {activeTab === 'WHATSAPP_CONVERSATIONS' && (
            <AdminWhatsAppWorkspace />
          )}

          {activeTab === 'SYSTEM' && (
            <AdminSettingsWorkspace initialCategory={initialSettingsCat as any} initialAccountSubtab={initialAccountSubtab as any} />
          )}

          {(activeTab === 'ORDERS' || activeTab === 'CUSTOMERS' || activeTab === 'FINANCE' || activeTab === 'SECURITY') && (
            <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
              <h2 className="text-2xl font-bold" style={{ marginBottom: '0.5rem' }}>
                {activeTab} Management Workspace
              </h2>
              <p className="text-secondary text-sm" style={{ marginBottom: '1.5rem' }}>
                Administrative workspace connected to authoritative `AgriTrustDatabase` core.
              </p>
              <div style={{ display: 'inline-flex', gap: '0.5rem' }}>
                <button onClick={() => setActiveTab('INVENTORY')} className="btn btn-primary btn-sm">
                  Manage Wholesale Inventory
                </button>
                <button onClick={() => setActiveTab('CMS_CONTENT')} className="btn btn-secondary btn-sm">
                  Manage CMS Content
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
