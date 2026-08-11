import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Truck, 
  Users, 
  DollarSign, 
  Bot, 
  ShieldAlert, 
  FileText, 
  Settings, 
  Layers, 
  Search,
  ChevronRight,
  ClipboardList,
  Cpu,
  Lock,
  Activity,
  Inbox,
  Mail,
  MessageSquare
} from 'lucide-react';

export type AdminTab = 
  | 'DASHBOARD'
  | 'SUPPLY_SUBMISSIONS'
  | 'INVENTORY'
  | 'PRODUCT_CATALOGUE'
  | 'QUALITY'
  | 'TRACEABILITY'
  | 'BUYERS'
  | 'SELLERS'
  | 'AI_AGENTS'
  | 'AI_RUNS'
  | 'CMS_CONTENT'
  | 'CMS_BUILDER'
  | 'CMS_MEDIA'
  | 'CMS_NAVIGATION'
  | 'CMS_FOOTER'
  | 'CMS_SEO'
  | 'MARKETING'
  | 'WHATSAPP_CONVERSATIONS'
  | 'ORDERS'
  | 'CUSTOMERS'
  | 'FINANCE'
  | 'SECURITY'
  | 'SYSTEM';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ activeTab, onSelectTab }) => {
  const menuGroups = [
    {
      title: 'OVERVIEW',
      items: [
        { id: 'DASHBOARD' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
      ],
    },
    {
      title: 'PROCUREMENT',
      items: [
        { id: 'SUPPLY_SUBMISSIONS' as AdminTab, label: 'Supply Submissions', icon: Inbox, badge: 'Inbox' },
      ],
    },
    {
      title: 'MARKETPLACE',
      items: [
        { id: 'INVENTORY' as AdminTab, label: 'Wholesale Inventory', icon: Package, badge: '5 Lots' },
        { id: 'PRODUCT_CATALOGUE' as AdminTab, label: 'Product Catalogue', icon: Layers },
        { id: 'ORDERS' as AdminTab, label: 'Wholesale Orders', icon: ShoppingBag },
      ],
    },
    {
      title: 'QUALITY',
      items: [
        { id: 'QUALITY' as AdminTab, label: 'Quality Inspection', icon: ClipboardList, badge: 'AI Spectro' },
      ],
    },
    {
      title: 'TRACEABILITY',
      items: [
        { id: 'TRACEABILITY' as AdminTab, label: 'Lot Ledger Traceability', icon: Layers, badge: 'SHA-256' },
      ],
    },
    {
      title: 'DIRECTORY & PARTIES',
      items: [
        { id: 'BUYERS' as AdminTab, label: 'Buyers Directory', icon: Users },
        { id: 'SELLERS' as AdminTab, label: 'Sellers Directory', icon: Users },
      ],
    },
    {
      title: 'FINANCE',
      items: [
        { id: 'FINANCE' as AdminTab, label: 'Margins & Settlements', icon: DollarSign },
      ],
    },
    {
      title: 'AI CONTROL',
      items: [
        { id: 'AI_AGENTS' as AdminTab, label: 'AI Agents Registry', icon: Bot, badge: '7 Active' },
        { id: 'AI_RUNS' as AdminTab, label: 'AI Execution Runs', icon: Activity },
      ],
    },
    {
      title: 'SECURITY',
      items: [
        { id: 'SECURITY' as AdminTab, label: 'Security Audit Vault', icon: Lock, badge: 'Intact' },
      ],
    },
    {
      title: 'COMMUNICATIONS',
      items: [
        { id: 'WHATSAPP_CONVERSATIONS' as AdminTab, label: 'WhatsApp Business AI', icon: MessageSquare, badge: 'Official API' },
      ],
    },
    {
      title: 'MARKETING & LEADS',
      items: [
        { id: 'MARKETING' as AdminTab, label: 'Marketing Subscribers', icon: Mail, badge: 'Leads' },
      ],
    },
    {
      title: 'CONTENT & PAGE BUILDER',
      items: [
        { id: 'CMS_BUILDER' as AdminTab, label: 'Landing Page Builder', icon: FileText, badge: 'Visual' },
        { id: 'CMS_MEDIA' as AdminTab, label: 'Media Library', icon: Layers },
        { id: 'CMS_NAVIGATION' as AdminTab, label: 'Navigation Menu', icon: Layers },
        { id: 'CMS_FOOTER' as AdminTab, label: 'Footer Builder', icon: FileText },
        { id: 'CMS_SEO' as AdminTab, label: 'SEO Control', icon: Lock },
      ],
    },
    {
      title: 'SYSTEM',
      items: [
        { id: 'SYSTEM' as AdminTab, label: 'Settings & Feature Flags', icon: Settings },
      ],
    },
  ];

  return (
    <aside style={{
      width: '260px',
      backgroundColor: 'var(--bg-surface)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      overflowY: 'auto'
    }}>
      {/* Sidebar Header */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.625rem'
      }}>
        <div style={{
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: 'var(--radius-md)',
          backgroundColor: 'var(--brand-accent)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800
        }}>
          <ShieldAlert size={20} />
        </div>
        <div>
          <h3 className="font-bold text-sm" style={{ letterSpacing: '-0.01em', lineHeight: 1.2 }}>AgriTrust Admin</h3>
          <span className="text-muted text-xs" style={{ fontSize: '0.7rem' }}>Authoritative Command Centre</span>
        </div>
      </div>

      {/* Sidebar Navigation Menu */}
      <nav style={{ flex: 1, padding: '1rem 0.75rem' }}>
        {menuGroups.map((group, groupIdx) => (
          <div key={groupIdx} style={{ marginBottom: '1.25rem' }}>
            <div style={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              color: 'var(--text-muted)',
              letterSpacing: '0.05em',
              padding: '0.35rem 0.75rem 0.5rem',
              textTransform: 'uppercase'
            }}>
              {group.title}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => onSelectTab(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '0.625rem 0.75rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: isActive ? 'var(--brand-primary-light)' : 'transparent',
                      color: isActive ? 'var(--brand-primary)' : 'var(--text-secondary)',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.8125rem',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'background-color 0.15s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                      <Icon size={16} style={{ color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)' }} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span className="badge" style={{
                        fontSize: '0.65rem',
                        padding: '0.15rem 0.4rem',
                        backgroundColor: isActive ? 'var(--brand-primary)' : 'var(--bg-surface-elevated)',
                        color: isActive ? '#fff' : 'var(--text-muted)'
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Sidebar Footer */}
      <div style={{
        padding: '1rem 1.25rem',
        borderTop: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-surface-elevated)',
        fontSize: '0.75rem'
      }}>
        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Role: ADMIN / SYS_ADMIN</div>
        <div className="text-muted" style={{ fontSize: '0.7rem' }}>Session: Authenticated</div>
      </div>
    </aside>
  );
};
