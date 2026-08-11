import React from 'react';
import { ShoppingBag, ShieldCheck, Truck, ArrowRight } from 'lucide-react';

export const HowItWorks: React.FC = () => {
  return (
    <section id="how-it-works" style={{ padding: '5rem 0', backgroundColor: 'var(--bg-surface-elevated)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
      <div className="container">
        <div style={{ maxWidth: '720px', margin: '0 auto 3.5rem', textAlign: 'center' }}>
          <span className="badge badge-brand" style={{ marginBottom: '1rem' }}>Commercial Agriculture Made Simple</span>
          <h2 className="text-3xl font-bold" style={{ letterSpacing: '-0.02em', marginBottom: '1rem' }}>
            How AgriTrust Simplifies Wholesale Procurement
          </h2>
          <p className="text-secondary text-base">
            Sourcing high-quality agricultural produce for hotels, restaurants, supermarkets, and commercial distributors through a reliable, streamlined marketplace.
          </p>
        </div>

        {/* Visual Flow Architecture */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '2rem',
          position: 'relative'
        }}>
          {/* Step 1: Browse Available Inventory */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-primary-light)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <ShoppingBag size={24} />
            </div>
            <span className="text-muted text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>STEP 01</span>
            <h3 className="text-xl font-bold" style={{ margin: '0.25rem 0 0.75rem' }}>Browse Wholesale Inventory</h3>
            <p className="text-secondary text-sm" style={{ lineHeight: 1.6 }}>
              Explore live available fresh produce, check transparent wholesale prices, minimum order quantities (MOQ), and current harvest availability in real time.
            </p>
          </div>

          {/* Step 2: Quality Certified Produce */}
          <div className="card" style={{ padding: '2rem', border: '2px solid var(--brand-primary)', boxShadow: 'var(--shadow-glow)' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-primary)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <ShieldCheck size={24} />
            </div>
            <span className="text-muted text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--brand-primary)' }}>STEP 02</span>
            <h3 className="text-xl font-bold" style={{ margin: '0.25rem 0 0.75rem' }}>Verified Quality Standards</h3>
            <p className="text-secondary text-sm" style={{ lineHeight: 1.6 }}>
              Every lot listed on AgriTrust is quality-assessed and graded (Grade A / Grade B) to ensure consistent standards for your commercial business needs.
            </p>
          </div>

          {/* Step 3: Reliable Delivery */}
          <div className="card" style={{ padding: '2rem' }}>
            <div style={{
              width: '3rem',
              height: '3rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-accent-light)',
              color: 'var(--brand-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1.25rem'
            }}>
              <Truck size={24} />
            </div>
            <span className="text-muted text-xs font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>STEP 03</span>
            <h3 className="text-xl font-bold" style={{ margin: '0.25rem 0 0.75rem' }}>Fast Commercial Fulfilment</h3>
            <p className="text-secondary text-sm" style={{ lineHeight: 1.6 }}>
              Place orders easily online and rely on managed cold-chain logistics to deliver fresh agricultural produce directly to your facility or loading dock.
            </p>
          </div>
        </div>

        {/* Customer Callout Banner */}
        <div style={{
          marginTop: '3.5rem',
          padding: '1.5rem 2rem',
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem'
        }}>
          <div>
            <h4 className="font-bold text-base">Ready to source fresh commercial produce?</h4>
            <p className="text-secondary text-xs" style={{ marginTop: '0.15rem' }}>
              Access transparent wholesale pricing, guaranteed quality grades, and dependable delivery schedules today.
            </p>
          </div>
          <a href="#marketplace" className="btn btn-primary">
            Browse Wholesale Catalog <ArrowRight size={16} />
          </a>
        </div>
      </div>
    </section>
  );
};
