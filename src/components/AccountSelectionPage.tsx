import React from 'react';
import { ShoppingBag, Leaf, ShieldCheck, Lock, ArrowRight, CheckCircle2, UserCheck } from 'lucide-react';

interface AccountSelectionPageProps {
  onSelectBuyer: () => void;
  onSelectFarmer: () => void;
  onBackToMarketplace: () => void;
}

export const AccountSelectionPage: React.FC<AccountSelectionPageProps> = ({
  onSelectBuyer,
  onSelectFarmer,
  onBackToMarketplace,
}) => {
  return (
    <div style={{ padding: '4rem 0 6rem', backgroundColor: 'var(--bg-primary)' }}>
      <div className="container">
        {/* Header */}
        <div style={{ maxWidth: '720px', margin: '0 auto 3.5rem', textAlign: 'center' }}>
          <span className="badge badge-brand" style={{ marginBottom: '1rem', padding: '0.4rem 1rem' }}>
            <ShieldCheck size={16} /> AgriTrust Bilateral Portal Registration
          </span>
          <h1 className="text-4xl font-bold" style={{ letterSpacing: '-0.03em', marginBottom: '1rem' }}>
            Select Your Commercial Account Privilege
          </h1>
          <p className="text-secondary text-base" style={{ lineHeight: 1.6 }}>
            AgriTrust operates as a controlled intermediary. Farmers and buyers never see each other's private contact information, exact locations, or internal pricing strategies.
          </p>
        </div>

        {/* Account Choice Cards Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '2.5rem',
          maxWidth: '960px',
          margin: '0 auto 3rem'
        }}>
          {/* Card 1: Commercial Buyer */}
          <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2px solid var(--border-color)' }}>
            <div>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--brand-accent-light)',
                color: 'var(--brand-accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <ShoppingBag size={28} />
              </div>

              <span className="text-muted text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>FOR COMMERCIAL BUYERS</span>
              <h2 className="text-2xl font-bold" style={{ margin: '0.25rem 0 1rem' }}>Commercial Buyer Account</h2>
              <p className="text-secondary text-sm" style={{ lineHeight: 1.6, marginBottom: '1.5rem' }}>
                For hospitality groups, supermarket chains, food processors, and wholesale distributors seeking certified, traceable produce intake.
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '2rem' }} className="text-secondary">
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--brand-primary)" /> Verified Grade A produce inventory access
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--brand-primary)" /> Minimum Order Quantity (MOQ) guarantees
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--brand-primary)" /> Cold-chain logistics tracking & proof of delivery
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={16} color="var(--brand-accent)" /> Producer identity anonymization enforced
                </li>
              </ul>
            </div>

            <button onClick={onSelectBuyer} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              <span>Register as Commercial Buyer</span>
              <ArrowRight size={18} />
            </button>
          </div>

          {/* Card 2: Agricultural Farmer */}
          <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '2px solid var(--brand-primary)', boxShadow: 'var(--shadow-glow)' }}>
            <div>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: 'var(--radius-lg)',
                backgroundColor: 'var(--brand-primary-light)',
                color: 'var(--brand-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.5rem'
              }}>
                <Leaf size={28} />
              </div>

              <span className="text-muted text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-primary)' }}>FOR AGRICULTURAL PRODUCERS</span>
              <h2 className="text-2xl font-bold" style={{ margin: '0.25rem 0 1rem' }}>Agricultural Farmer Account</h2>
              <p className="text-secondary text-sm" style={{ lineHeight: 1.6, marginBottom: '1.5rem' }}>
                For individual farmers, agricultural estates, and producer co-operatives seeking direct market access and fair pricing guarantees.
              </p>

              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.875rem', marginBottom: '2rem' }} className="text-secondary">
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--brand-primary)" /> Minimum Margin Protection (No forced low-ball pricing)
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--brand-primary)" /> AI Spectrovision automated quality grading
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={16} color="var(--brand-primary)" /> Immediate settlement upon intake verification
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Lock size={16} color="var(--brand-primary)" /> Private address, phone & GPS completely protected
                </li>
              </ul>
            </div>

            <button onClick={onSelectFarmer} className="btn btn-primary btn-lg" style={{ width: '100%', backgroundColor: 'var(--brand-primary)' }}>
              <span>Register as Producer / Farmer</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        {/* Security Policy Reminder */}
        <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
          <button onClick={onBackToMarketplace} className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }}>
            Back to Public Marketplace
          </button>
          <div className="text-muted text-xs">
            Notice: Self-registration is restricted to Buyer and Farmer roles. Administrative (`ADMIN`) and System (`SYSTEM`) account privileges require two-human authorization.
          </div>
        </div>
      </div>
    </div>
  );
};
