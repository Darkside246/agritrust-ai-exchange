import React, { useState } from 'react';
import { AdminLandingPageBuilder } from './AdminLandingPageBuilder';
import { AdminMediaLibrary } from './AdminMediaLibrary';
import { AdminNavigationEditor } from './AdminNavigationEditor';
import { AdminFooterEditor } from './AdminFooterEditor';
import { AdminSEOEditor } from './AdminSEOEditor';
import { Layout, Image as ImageIcon, Menu, FileText, Globe } from 'lucide-react';

export const AdminCMSManager: React.FC<{ initialTab?: string }> = ({ initialTab = 'BUILDER' }) => {
  const [activeTab, setActiveTab] = useState<'BUILDER' | 'MEDIA' | 'NAVIGATION' | 'FOOTER' | 'SEO'>(initialTab as any);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* CMS Sub-Navigation Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        <button
          onClick={() => setActiveTab('BUILDER')}
          className={`btn btn-sm ${activeTab === 'BUILDER' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Layout size={14} /> Landing Page Builder
        </button>

        <button
          onClick={() => setActiveTab('MEDIA')}
          className={`btn btn-sm ${activeTab === 'MEDIA' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <ImageIcon size={14} /> Media Library
        </button>

        <button
          onClick={() => setActiveTab('NAVIGATION')}
          className={`btn btn-sm ${activeTab === 'NAVIGATION' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Menu size={14} /> Navigation Menu
        </button>

        <button
          onClick={() => setActiveTab('FOOTER')}
          className={`btn btn-sm ${activeTab === 'FOOTER' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <FileText size={14} /> Footer Builder
        </button>

        <button
          onClick={() => setActiveTab('SEO')}
          className={`btn btn-sm ${activeTab === 'SEO' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
        >
          <Globe size={14} /> SEO & Meta
        </button>
      </div>

      {/* Dynamic Sub-tab Workspace */}
      {activeTab === 'BUILDER' && <AdminLandingPageBuilder />}
      {activeTab === 'MEDIA' && <AdminMediaLibrary />}
      {activeTab === 'NAVIGATION' && <AdminNavigationEditor />}
      {activeTab === 'FOOTER' && <AdminFooterEditor />}
      {activeTab === 'SEO' && <AdminSEOEditor />}
    </div>
  );
};
