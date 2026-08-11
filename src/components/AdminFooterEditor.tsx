import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { CMSFooterConfig } from '../core/database/schema';
import { FileText, Save, CheckCircle2 } from 'lucide-react';

export const AdminFooterEditor: React.FC = () => {
  const [config, setConfig] = useState<CMSFooterConfig>(AgriTrustDatabase.getFooterConfig());
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    AgriTrustDatabase.updateFooterConfig(config);
    setSuccessMsg('Public footer configuration saved successfully!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '720px' }}>
      <div>
        <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.35rem' }}>FOOTER MANAGEMENT</span>
        <h1 className="text-3xl font-bold">Public Footer Builder</h1>
      </div>

      {successMsg && (
        <div style={{ padding: '0.875rem 1.25rem', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="input-group">
          <label className="input-label">Company Description</label>
          <textarea
            value={config.companyDescription}
            onChange={(e) => setConfig({ ...config, companyDescription: e.target.value })}
            rows={3}
            className="input-field"
          />
        </div>

        <div className="input-group">
          <label className="input-label">Copyright Notice</label>
          <input
            type="text"
            value={config.copyrightText}
            onChange={(e) => setConfig({ ...config, copyrightText: e.target.value })}
            className="input-field"
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="input-group">
            <label className="input-label">Privacy Policy URL</label>
            <input
              type="text"
              value={config.privacyPolicyUrl}
              onChange={(e) => setConfig({ ...config, privacyPolicyUrl: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label">Terms of Service URL</label>
            <input
              type="text"
              value={config.termsUrl}
              onChange={(e) => setConfig({ ...config, termsUrl: e.target.value })}
              className="input-field"
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
          <button type="submit" className="btn btn-primary btn-md">
            <Save size={16} /> Save Footer Configuration
          </button>
        </div>
      </form>
    </div>
  );
};
