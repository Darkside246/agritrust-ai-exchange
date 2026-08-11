import React, { useState } from 'react';
import { MarketingService } from '../core/marketing/marketingService';
import { MarketingAudienceType } from '../core/database/schema';
import { Mail, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

interface NewsletterSubscribeSectionProps {
  sourcePage?: string;
  isEditorMode?: boolean;
  onSelectBlock?: () => void;
}

export const NewsletterSubscribeSection: React.FC<NewsletterSubscribeSectionProps> = ({
  sourcePage = 'homepage',
  isEditorMode = false,
  onSelectBlock,
}) => {
  const [email, setEmail] = useState<string>('');
  const [audienceType, setAudienceType] = useState<MarketingAudienceType | ''>('');
  const [status, setStatus] = useState<'IDLE' | 'SUCCESS' | 'ALREADY_SUBSCRIBED' | 'ERROR'>('IDLE');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await MarketingService.subscribe({
        email,
        audienceType: audienceType || undefined,
        source: 'landing_page',
        sourcePage,
      });

      if (res.alreadySubscribed) {
        setStatus('ALREADY_SUBSCRIBED');
      } else {
        setStatus('SUCCESS');
        setEmail('');
        setAudienceType('');
      }
    } catch (err: any) {
      setStatus('ERROR');
      // Generic customer-facing error message (no technical/stack traces exposed)
      setErrorMessage("We couldn't complete your subscription right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="newsletter-subscribe"
      onClick={onSelectBlock}
      style={{
        padding: '5rem 0',
        backgroundColor: 'var(--bg-surface-elevated)',
        borderTop: '1px solid var(--border-color)',
        borderBottom: '1px solid var(--border-color)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Decorative Accent */}
      <div
        style={{
          position: 'absolute',
          top: '-150px',
          right: '-150px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16, 128, 67, 0.08) 0%, rgba(0,0,0,0) 70%)',
          pointerEvents: 'none',
        }}
      />

      <div className="container" style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1.5rem' }}>
        <div
          className="card"
          style={{
            padding: '3.5rem 3rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: 'var(--shadow-lg)',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3rem',
            alignItems: 'center',
          }}
        >
          {/* Left Column: Heading & Value Proposition */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <span
                className="badge badge-brand"
                style={{
                  fontSize: '0.7rem',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '0.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                }}
              >
                <Sparkles size={12} /> AgriTrust Market Intelligence
              </span>
              <h2 className="text-3xl font-bold" style={{ lineHeight: 1.25, margin: 0 }}>
                Stay Connected to the AgriTrust Market
              </h2>
            </div>

            <p className="text-lg font-semibold" style={{ color: 'var(--brand-primary)', margin: 0 }}>
              Get wholesale availability, new products, market updates and opportunities delivered directly to your inbox.
            </p>

            <p className="text-secondary text-sm" style={{ lineHeight: 1.6, margin: 0 }}>
              Be the first to hear about new wholesale produce, market opportunities, seasonal availability and updates from AgriTrust.
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <ShieldCheck size={16} style={{ color: 'var(--brand-primary)' }} /> Verified Regional Sourcing
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <Mail size={16} style={{ color: 'var(--brand-primary)' }} /> Zero Spam Guarantee
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Email Capture Form */}
          <div>
            {status === 'SUCCESS' ? (
              <div
                style={{
                  padding: '2rem',
                  backgroundColor: 'var(--brand-primary-light)',
                  border: '1px solid var(--brand-primary)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={28} style={{ color: 'var(--brand-primary)' }} />
                  <div>
                    <h3 className="text-xl font-bold" style={{ margin: 0, color: 'var(--brand-primary)' }}>
                      You're In
                    </h3>
                    <span className="text-xs text-muted">Subscription Confirmed</span>
                  </div>
                </div>
                <p className="text-sm text-secondary" style={{ lineHeight: 1.5, margin: 0 }}>
                  Thanks for joining the AgriTrust market. We'll keep you informed about new wholesale opportunities, products and market updates.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('IDLE')}
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: 'flex-start', marginTop: '0.5rem', fontSize: '0.75rem' }}
                >
                  Subscribe Another Email
                </button>
              </div>
            ) : status === 'ALREADY_SUBSCRIBED' ? (
              <div
                style={{
                  padding: '2rem',
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  border: '1px solid var(--brand-accent)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  textAlign: 'left',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <CheckCircle2 size={24} style={{ color: 'var(--brand-accent)' }} />
                  <h3 className="text-lg font-bold" style={{ margin: 0 }}>
                    You're already on the AgriTrust list.
                  </h3>
                </div>
                <p className="text-sm text-secondary" style={{ lineHeight: 1.5, margin: 0 }}>
                  Your email is registered for AgriTrust wholesale market communications. We've updated your audience preferences.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('IDLE')}
                  className="btn btn-secondary btn-sm"
                  style={{ alignSelf: 'flex-start', marginTop: '0.5rem', fontSize: '0.75rem' }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {/* Email Address Input */}
                <div className="input-group">
                  <label className="input-label" style={{ fontWeight: 700, fontSize: '0.875rem' }}>
                    Email Address <span style={{ color: 'var(--status-danger)' }}>*</span>
                  </label>
                  <div style={{ position: 'relative' }}>
                    <Mail
                      size={18}
                      style={{
                        position: 'absolute',
                        left: '0.875rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: 'var(--text-muted)',
                      }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address"
                      required
                      className="input-field"
                      style={{ paddingLeft: '2.5rem', height: '44px', fontSize: '0.9375rem' }}
                    />
                  </div>
                </div>

                {/* Optional Audience Selector */}
                <div>
                  <label className="input-label" style={{ fontWeight: 600, fontSize: '0.8125rem', marginBottom: '0.5rem' }}>
                    I am a: <span className="text-muted font-normal text-xs">(Optional)</span>
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
                      <input
                        type="radio"
                        name="audience"
                        value="BUYER"
                        checked={audienceType === 'BUYER'}
                        onChange={() => setAudienceType('BUYER')}
                      />
                      Buyer
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
                      <input
                        type="radio"
                        name="audience"
                        value="FARMER"
                        checked={audienceType === 'FARMER'}
                        onChange={() => setAudienceType('FARMER')}
                      />
                      Farmer / Producer
                    </label>

                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.8125rem' }}>
                      <input
                        type="radio"
                        name="audience"
                        value="INTERESTED"
                        checked={audienceType === 'INTERESTED'}
                        onChange={() => setAudienceType('INTERESTED')}
                      />
                      Interested in AgriTrust
                    </label>
                  </div>
                </div>

                {/* Error Banner */}
                {status === 'ERROR' && errorMessage && (
                  <div
                    style={{
                      padding: '0.75rem 1rem',
                      backgroundColor: 'rgba(239, 68, 68, 0.1)',
                      border: '1px solid var(--status-danger)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.8125rem',
                      color: 'var(--status-danger)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    <AlertCircle size={16} /> {errorMessage}
                  </div>
                )}

                {/* CTA Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="btn btn-primary btn-md"
                  style={{
                    height: '46px',
                    fontSize: '0.9375rem',
                    fontWeight: 700,
                    justifyContent: 'center',
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-sm)',
                  }}
                >
                  {isSubmitting ? 'Joining List...' : 'Join the AgriTrust List'} <ArrowRight size={16} />
                </button>

                {/* Consent Disclaimer */}
                <p className="text-muted" style={{ fontSize: '0.75rem', lineHeight: 1.4, margin: 0, textAlign: 'left' }}>
                  By subscribing, you agree to receive AgriTrust updates and marketing communications. You can unsubscribe at any time.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
