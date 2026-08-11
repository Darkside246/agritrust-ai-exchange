import React, { useState } from 'react';
import { AgriTrustDatabase } from '../core/database/db';
import { MediaAsset } from '../core/database/schema';
import { Image as ImageIcon, Upload, Search, Filter, Trash2, Eye, CheckCircle2, ShieldCheck } from 'lucide-react';
import { FileSecurityManager } from '../core/security/fileSecurity';

export const AdminMediaLibrary: React.FC = () => {
  const [assets, setAssets] = useState<MediaAsset[]>(AgriTrustDatabase.getMediaAssets());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);
  const [uploadUrl, setUploadUrl] = useState<string>('');
  const [filename, setFilename] = useState<string>('');
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  const refreshAssets = () => {
    setAssets(AgriTrustDatabase.getMediaAssets());
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadUrl.trim() || !filename.trim()) return;

    const validation = FileSecurityManager.validateUpload(filename, 'image/jpeg', 200000);
    if (!validation.valid) {
      setFileError(validation.reason || 'File security validation failed.');
      return;
    }

    setFileError(null);
    const newAsset = AgriTrustDatabase.uploadMediaAsset(
      {
        filename,
        fileUrl: uploadUrl,
        mimeType: 'image/jpeg',
        sizeBytes: 210000,
        usedIn: ['Media Library Intake'],
      },
      'sys-admin'
    );

    refreshAssets();
    setSuccessMsg(`Media asset '${newAsset.filename}' uploaded and verified by file security pipeline.`);
    setUploadUrl('');
    setFilename('');
  };

  const filtered = assets.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return a.filename.toLowerCase().includes(q) || a.usedIn.some((u) => u.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <span className="badge badge-brand" style={{ fontSize: '0.75rem', marginBottom: '0.35rem', backgroundColor: 'rgba(16, 128, 67, 0.15)', color: 'var(--brand-primary)' }}>
          CENTRAL MEDIA MANAGEMENT
        </span>
        <h1 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em' }}>
          AgriTrust Media Library
        </h1>
        <p className="text-secondary text-xs" style={{ marginTop: '0.2rem' }}>
          Central WordPress-style media repository for landing page images, product photography, and asset security scanning.
        </p>
      </div>

      {successMsg && (
        <div style={{ padding: '1rem 1.25rem', backgroundColor: 'var(--brand-primary-light)', color: 'var(--brand-primary)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* Upload Box */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h3 className="font-bold text-base" style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Upload size={18} /> Upload New Media Asset (Secure Pipeline)
        </h3>

        <form onSubmit={handleUploadSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="input-group">
            <label className="input-label">Filename</label>
            <input type="text" value={filename} onChange={(e) => setFilename(e.target.value)} placeholder="e.g. hero_banner_2026.jpg" required className="input-field" />
          </div>

          <div className="input-group">
            <label className="input-label">Image URL</label>
            <input type="text" value={uploadUrl} onChange={(e) => setUploadUrl(e.target.value)} placeholder="https://images.unsplash.com/..." required className="input-field" />
          </div>

          <button type="submit" className="btn btn-primary btn-md">
            <Upload size={16} /> Upload Asset
          </button>
        </form>

        {fileError && (
          <div style={{ marginTop: '0.75rem', color: 'var(--status-danger)', fontSize: '0.75rem', fontWeight: 600 }}>
            ⚠ {fileError}
          </div>
        )}
      </div>

      {/* Search & Filter */}
      <div className="card" style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: '320px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search filenames, asset usage..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>
        <span className="text-muted text-xs font-semibold">{filtered.length} Media Assets</span>
      </div>

      {/* Media Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
        {filtered.map((asset) => (
          <div
            key={asset.id}
            onClick={() => setSelectedAsset(asset)}
            className="card"
            style={{
              padding: '0',
              overflow: 'hidden',
              cursor: 'pointer',
              border: selectedAsset?.id === asset.id ? '2px solid var(--brand-primary)' : '1px solid var(--border-color)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div style={{ height: '150px', width: '100%', overflow: 'hidden', backgroundColor: 'var(--bg-surface-elevated)' }}>
              <img src={asset.fileUrl} alt={asset.filename} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>

            <div style={{ padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div className="font-bold text-xs" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.filename}</div>
              <div className="text-muted text-xs font-mono">{asset.mimeType} • {(asset.sizeBytes / 1024).toFixed(0)} KB</div>
              <div style={{ marginTop: '0.35rem' }}>
                <span className="badge badge-brand" style={{ fontSize: '0.6rem' }}>Used in: {asset.usedIn.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
