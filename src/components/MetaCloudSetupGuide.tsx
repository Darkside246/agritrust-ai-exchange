import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, AlertCircle, ExternalLink,
  Copy, ChevronDown, ChevronUp, Zap, Cloud, Smartphone
} from 'lucide-react';

interface EnvVar {
  name: string;
  set: boolean;
  description: string;
}

interface SetupGuide {
  activeProvider: string;
  metaConfigured: boolean;
  webhookUrl: string;
  webhookVerifyToken: string;
  requiredEnvVars: EnvVar[];
  steps: string[];
}

export const MetaCloudSetupGuide: React.FC = () => {
  const [guide, setGuide] = useState<SetupGuide | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<string | null>(null);
  const [stepsOpen, setStepsOpen] = useState(false);

  useEffect(() => {
    fetch('/api/admin/whatsapp/setup-guide')
      .then(r => r.json())
      .then(d => { if (d.success) setGuide(d); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  if (loading) return (
    <div style={{ padding: '2rem', textAlign: 'center', color: '#667781' }}>Loading setup guide…</div>
  );

  if (!guide) return null;

  const allSet = guide.requiredEnvVars.every(v => v.set);
  const setCount = guide.requiredEnvVars.filter(v => v.set).length;

  return (
    <div className="card" style={{ padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: '2.5rem', height: '2.5rem', borderRadius: 'var(--radius-md)', backgroundColor: '#1877F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cloud size={20} color="#fff" />
          </div>
          <div>
            <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>Meta WhatsApp Cloud API</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>Production provider — no Puppeteer, works on Railway free tier</p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {guide.metaConfigured ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', backgroundColor: 'rgba(34,197,94,0.1)', color: '#16a34a', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700 }}>
              <CheckCircle2 size={14} /> ACTIVE
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.85rem', backgroundColor: 'rgba(234,179,8,0.1)', color: '#a16207', borderRadius: 99, fontSize: '0.8rem', fontWeight: 700 }}>
              <AlertCircle size={14} /> NOT CONFIGURED
            </span>
          )}
        </div>
      </div>

      {/* Active provider notice */}
      <div style={{ padding: '0.875rem', borderRadius: 'var(--radius-sm)', backgroundColor: guide.metaConfigured ? 'rgba(34,197,94,0.08)' : 'rgba(59,130,246,0.08)', border: `1px solid ${guide.metaConfigured ? '#bbf7d0' : '#bfdbfe'}`, display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        {guide.metaConfigured ? <Cloud size={16} color="#16a34a" style={{ marginTop: '0.1rem', flexShrink: 0 }} /> : <Smartphone size={16} color="#2563eb" style={{ marginTop: '0.1rem', flexShrink: 0 }} />}
        <div>
          <div style={{ fontWeight: 700, fontSize: '0.875rem', color: guide.metaConfigured ? '#16a34a' : '#1d4ed8' }}>
            Active Provider: {guide.metaConfigured ? 'Meta Cloud API (Production)' : 'WhatsApp Web (Development)'}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            {guide.metaConfigured
              ? 'Messages are flowing through the official Meta WhatsApp Business Cloud API.'
              : 'Configure the environment variables below to switch to Meta Cloud API. No code changes needed — the app auto-detects credentials on startup.'}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Configuration Progress</span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{setCount} / {guide.requiredEnvVars.length} variables set</span>
        </div>
        <div style={{ height: 6, backgroundColor: '#e2e8f0', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(setCount / guide.requiredEnvVars.length) * 100}%`, backgroundColor: allSet ? '#22c55e' : '#3b82f6', borderRadius: 99, transition: 'width 0.3s' }} />
        </div>
      </div>

      {/* Environment variables checklist */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem', marginBottom: '0.25rem' }}>
          Railway Environment Variables
          <a href="https://railway.app/dashboard" target="_blank" rel="noopener noreferrer"
            style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#3b82f6', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
            Set in Railway <ExternalLink size={11} />
          </a>
        </div>
        {guide.requiredEnvVars.map(v => (
          <div key={v.name} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', border: `1px solid ${v.set ? '#bbf7d0' : '#fde68a'}` }}>
            {v.set
              ? <CheckCircle2 size={16} color="#16a34a" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
              : <XCircle size={16} color="#f59e0b" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <code style={{ fontSize: '0.8rem', fontWeight: 700, backgroundColor: v.set ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)', padding: '0.1rem 0.4rem', borderRadius: 4, color: v.set ? '#16a34a' : '#92400e' }}>
                {v.name}
              </code>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{v.description}</div>
            </div>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: v.set ? '#16a34a' : '#92400e', flexShrink: 0, alignSelf: 'center' }}>
              {v.set ? 'SET ✓' : 'MISSING'}
            </span>
          </div>
        ))}
      </div>

      {/* Webhook URL */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ fontWeight: 700, fontSize: '0.875rem' }}>Webhook URL <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>(paste in Meta Developer Console)</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.875rem', backgroundColor: '#1e293b', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.8rem', color: '#7dd3fc' }}>
          <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{guide.webhookUrl}</span>
          <button onClick={() => copyToClipboard(guide.webhookUrl, 'url')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'url' ? '#22c55e' : '#94a3b8', flexShrink: 0 }}>
            {copied === 'url' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          </button>
        </div>

        <div style={{ fontWeight: 700, fontSize: '0.875rem', marginTop: '0.25rem' }}>Webhook Verify Token</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 0.875rem', backgroundColor: '#1e293b', borderRadius: 'var(--radius-sm)', fontFamily: 'monospace', fontSize: '0.8rem', color: '#7dd3fc' }}>
          <span style={{ flex: 1 }}>{guide.webhookVerifyToken}</span>
          <button onClick={() => copyToClipboard(guide.webhookVerifyToken, 'token')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: copied === 'token' ? '#22c55e' : '#94a3b8' }}>
            {copied === 'token' ? <CheckCircle2 size={14} /> : <Copy size={14} />}
          </button>
        </div>
      </div>

      {/* Steps collapsible */}
      <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        <button onClick={() => setStepsOpen(o => !o)}
          style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.875rem 1rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 700, fontSize: '0.875rem' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={16} color="#f59e0b" /> Step-by-step setup guide
          </span>
          {stepsOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {stepsOpen && (
          <div style={{ padding: '0 1rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {guide.steps.map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: '0.75rem', padding: '0.5rem 0', borderBottom: i < guide.steps.length - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <span style={{ width: 22, height: 22, borderRadius: '50%', backgroundColor: '#3b82f6', color: '#fff', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{i + 1}</span>
                <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{step.replace(/^\d+\. /, '')}</span>
              </div>
            ))}
            <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#3b82f6', marginTop: '0.5rem' }}>
              Official Meta Cloud API docs <ExternalLink size={12} />
            </a>
          </div>
        )}
      </div>

      {/* Quick benefit callout */}
      <div style={{ padding: '0.875rem', backgroundColor: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        <strong>Why Meta Cloud API instead of WhatsApp Web?</strong>
        <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <li>No Puppeteer / Chromium — works on Railway free tier (512MB RAM)</li>
          <li>Officially supported by Meta — no risk of account ban</li>
          <li>Supports multiple users, templates, and business features</li>
          <li>Webhook-based — no polling, instant message delivery</li>
        </ul>
      </div>
    </div>
  );
};

export default MetaCloudSetupGuide;
