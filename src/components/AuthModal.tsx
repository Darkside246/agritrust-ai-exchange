import React, { useState } from 'react';
import { X, Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AuthManager } from '../core/identity/auth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (email: string, role: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState<'BUYER' | 'FARMER'>('BUYER');
  const [businessName, setBusinessName] = useState('');

  const oauthStatus = AuthManager.getOAuthConfigStatus();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    onSuccess(email, accountType);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', padding: '2rem' }}
      >
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: '3rem',
            height: '3rem',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-primary-light)',
            color: 'var(--brand-primary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <Lock size={22} />
          </div>
          <h3 className="text-xl font-bold">
            {mode === 'LOGIN' ? 'Sign into AgriTrust' : 'Create Verified Account'}
          </h3>
          <p className="text-secondary text-xs" style={{ marginTop: '0.25rem' }}>
            {mode === 'LOGIN'
              ? 'Access wholesale procurement and order management.'
              : 'Register as a verified commercial Buyer or Producer.'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', padding: '0.25rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <button
            onClick={() => setMode('LOGIN')}
            className={`btn btn-sm ${mode === 'LOGIN' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('REGISTER')}
            className={`btn btn-sm ${mode === 'REGISTER' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ border: 'none' }}
          >
            Register
          </button>
        </div>

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {mode === 'REGISTER' && (
            <>
              <div className="input-group">
                <label className="input-label">Account Privilege Type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => setAccountType('BUYER')}
                    className={`btn btn-sm ${accountType === 'BUYER' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Commercial Buyer
                  </button>
                  <button
                    type="button"
                    onClick={() => setAccountType('FARMER')}
                    className={`btn btn-sm ${accountType === 'FARMER' ? 'btn-primary' : 'btn-secondary'}`}
                  >
                    Agricultural Farmer
                  </button>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Business / Farm Name</label>
                <input
                  type="text"
                  placeholder="e.g. Island Fresh Hospitality"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label className="input-label">Work Email Address</label>
            <input
              type="email"
              placeholder="name@business.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.5rem' }}>
            <span>{mode === 'LOGIN' ? 'Sign In to Account' : 'Complete Registration'}</span>
            <ArrowRight size={18} />
          </button>
        </form>

        {/* OAuth Section with Configuration Boundaries */}
        <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)' }}>
          <span className="text-muted text-xs font-semibold" style={{ display: 'block', textAlign: 'center', marginBottom: '1rem' }}>
            OR CONTINUE WITH FEDERATED IDENTITY
          </span>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Google OAuth Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', opacity: oauthStatus.googleEnabled ? 1 : 0.65, cursor: oauthStatus.googleEnabled ? 'pointer' : 'not-allowed' }}
                disabled={!oauthStatus.googleEnabled}
              >
                <span>Continue with Google</span>
              </button>
              {!oauthStatus.googleEnabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-warning)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                  <ShieldAlert size={12} /> {oauthStatus.googleStatusMessage}
                </div>
              )}
            </div>

            {/* Apple OAuth Button */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ width: '100%', opacity: oauthStatus.appleEnabled ? 1 : 0.65, cursor: oauthStatus.appleEnabled ? 'pointer' : 'not-allowed' }}
                disabled={!oauthStatus.appleEnabled}
              >
                <span>Continue with Apple</span>
              </button>
              {!oauthStatus.appleEnabled && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--status-warning)', fontSize: '0.7rem', marginTop: '0.25rem' }}>
                  <ShieldAlert size={12} /> {oauthStatus.appleStatusMessage}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
