import React, { useState } from 'react';
import { AuthManager } from '../core/identity/auth';
import { ShieldCheck, Lock, Mail, Key, AlertCircle, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: (adminUserId: string, role: string) => void;
  onCancel?: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onSuccess, onCancel }) => {
  const [email, setEmail] = useState('admin@agritrust.com');
  const [password, setPassword] = useState('AdminSecure2026!');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      // Authenticate via AuthManager
      const authResult = AuthManager.authenticateUser(email, password);
      
      if (!authResult.success || !authResult.user) {
        setErrorMsg(authResult.error || 'Invalid administrator credentials.');
        setIsLoading(false);
        return;
      }

      if (authResult.user.role !== 'ADMIN' && authResult.user.role !== 'OPERATIONS') {
        setErrorMsg('ACCESS DENIED: Account lacks administrative authorization privileges.');
        setIsLoading(false);
        return;
      }

      onSuccess(authResult.user.id, authResult.user.role);
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during administrator authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      backgroundColor: 'var(--bg-primary)'
    }}>
      <div className="card" style={{
        maxWidth: '460px',
        width: '100%',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-lg)',
        backgroundColor: 'var(--bg-surface)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '3.5rem',
            height: '3.5rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'rgba(230, 81, 0, 0.12)',
            color: 'var(--brand-accent)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem'
          }}>
            <Lock size={28} />
          </div>
          <span className="badge badge-brand" style={{ display: 'inline-block', marginBottom: '0.5rem', backgroundColor: 'rgba(230, 81, 0, 0.15)', color: 'var(--brand-accent)', fontSize: '0.75rem' }}>
            AUTHORITATIVE CONTROL CENTRE
          </span>
          <h2 className="text-2xl font-bold" style={{ letterSpacing: '-0.02em' }}>
            Admin Portal Authentication
          </h2>
          <p className="text-secondary text-xs" style={{ marginTop: '0.25rem' }}>
            Protected operational area. Server-side authorization required.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            padding: '0.875rem 1rem',
            backgroundColor: 'rgba(211, 47, 47, 0.1)',
            color: 'var(--status-danger)',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            fontSize: '0.8125rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontWeight: 600
          }}>
            <AlertCircle size={18} /> {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Mail size={14} /> Administrator Email / Username
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@agritrust.com"
              className="input-field"
            />
          </div>

          <div className="input-group">
            <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Key size={14} /> Security Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="input-field"
            />
          </div>

          <div style={{ padding: '0.75rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.2rem' }}>
              <ShieldCheck size={12} style={{ display: 'inline', marginRight: '0.25rem' }} /> Password Hashing & Encryption Active
            </div>
            Passwords salted with SHA-256 before verification. Sessions monitored by Security Audit Vault.
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.875rem', fontSize: '0.9375rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}
          >
            {isLoading ? 'Authenticating...' : <>Sign In to Admin Portal <ArrowRight size={16} /></>}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary btn-sm"
              style={{ width: '100%' }}
            >
              Return to Marketplace
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
