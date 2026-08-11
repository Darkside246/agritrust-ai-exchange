import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { CMSSEOConfig } from '../core/database/schema';
import { Globe, Save, CheckCircle2, ShieldCheck } from 'lucide-react';

export const AdminSEOEditor: React.FC = () => {
  const [seo, setSeo] = useState<CMSSEOConfig>(AgriTrustDatabase.getSEOConfig());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    AgriTrustDatabase.updateSEOConfig(seo);
    setSuccessMsg('SEO configuration saved successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px' }}>
      <div>
        <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>SEARCH ENGINE OPTIMIZATION</span>
        <h1 className="text-3xl font-bold">SEO & Social Sharing Control</h1>
      </div>

      {successMsg && (
        <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="input-group">
          <label className="input-label">Meta Page Title</label>
          <input
            type="text"
            value={seo.pageTitle}
            onChange={(e) => setSeo({ ...seo, pageTitle: e.target.value })}
            required
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Meta Description</label>
          <textarea
            value={seo.metaDescription}
            onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })}
            rows={3}
            required
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Canonical URL</label>
          <input
            type="text"
            value={seo.canonicalUrl || ''}
            onChange={(e) => setSeo({ ...seo, canonicalUrl: e.target.value })}
            className="input-field"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Open Graph (OG) Title</label>
            <input
              type="text"
              value={seo.ogTitle || ''}
              onChange={(e) => setSeo({ ...seo, ogTitle: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label">OG Social Image URL</label>
            <input
              type="text"
              value={seo.ogImage || ''}
              onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label">Robots Index Directive</label>
          <select
            value={seo.robots || 'index, follow'}
            onChange={(e) => setSeo({ ...seo, robots: e.target.value })}
            className="input-field"
          >
            <option value="index, follow">index, follow (Allow Search Engines)</option>
            <option value="noindex, nofollow">noindex, nofollow (Disallow Indexing)</option>
          </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary btn-md">
            <Save size={16} /> Save SEO Settings
          </button>
        </div>
      </form>
    </div>
  );
};
