import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetailModal } from './components/ProductDetailModal';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ExtendedTraceabilityView } from './components/ExtendedTraceabilityView';
import { AccountSelectionPage } from './components/AccountSelectionPage';
import { BuyerOnboardingWizard } from './components/BuyerOnboardingWizard';
import { FarmerOnboardingWizard } from './components/FarmerOnboardingWizard';
import { BuyerPortalDashboard } from './components/BuyerPortalDashboard';
import { FarmerPortalDashboard } from './components/FarmerPortalDashboard';
import { QualityInspectionWorkspace } from './components/QualityInspectionWorkspace';
import { AdminCommandCenter } from './components/AdminCommandCenter';
import { AdminLogin } from './components/AdminLogin';
import { AdminShell } from './components/AdminShell';
import { CartDrawer, CartItem } from './components/CartDrawer';
import { AuthModal } from './components/AuthModal';
import { TraceabilityModal } from './components/TraceabilityModal';
import { HowItWorks } from './components/HowItWorks';
import { ControlledIntermediarySection } from './components/ControlledIntermediarySection';
import { NewsletterSubscribeSection } from './components/NewsletterSubscribeSection';
import { AgriTrustDatabase } from './core/database/db';
import { Product } from './core/database/schema';
import { ShieldCheck, Leaf, Lock, CheckCircle2, UserCheck, Sliders, ShieldAlert } from 'lucide-react';

export type AppView = 
  | 'MARKETPLACE' 
  | 'PRODUCT_DETAIL' 
  | 'TRACEABILITY_LEDGER' 
  | 'ACCOUNT_SELECTION' 
  | 'BUYER_ONBOARDING' 
  | 'FARMER_ONBOARDING'
  | 'BUYER_PORTAL'
  | 'FARMER_PORTAL'
  | 'QUALITY_WORKSPACE'
  | 'ADMIN_COMMAND_CENTER'
  | 'ADMIN_LOGIN'
  | 'ADMIN_SHELL';

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Navigation View Routing
  const [currentView, setCurrentView] = useState<AppView>('MARKETPLACE');
  const [activeProductId, setActiveProductId] = useState<string>('prod-01');
  const [activeLotId, setActiveLotId] = useState<string>('AT-LOT-2026-000922');
  const [authenticatedAdminUser, setAuthenticatedAdminUser] = useState<string | null>(null);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isTraceabilityOpen, setIsTraceabilityOpen] = useState(false);
  const [selectedProductForModal, setSelectedProductForModal] = useState<Product | null>(null);

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const refreshProductsFromDatabase = async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/products?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        return;
      }
    } catch {
      // fall through to in-memory fallback
    }
    // In-memory fallback (e.g. when server isn't running in dev)
    AgriTrustDatabase.initialize();
    const searchResult = AgriTrustDatabase.searchPublicMarketplace(searchQuery);
    setProducts([...searchResult.products]);
  };

  useEffect(() => {
    refreshProductsFromDatabase();
  }, [currentView, searchQuery]);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  const handleAddToCart = (product: Product, quantityToAdd?: number) => {
    const qty = quantityToAdd || product.moqUnits;
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { product, quantity: qty }];
    });
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item))
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleOpenTraceabilityModal = (lotId?: string) => {
    if (lotId) setActiveLotId(lotId);
    setIsTraceabilityOpen(true);
  };

  const handleOpenProductDetailPage = (product: Product) => {
    setActiveProductId(product.id);
    setCurrentView('PRODUCT_DETAIL');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenDeepTraceabilityPage = (lotId: string) => {
    setActiveLotId(lotId);
    setCurrentView('TRACEABILITY_LEDGER');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartItemCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const activeProduct = products.find((p) => p.id === activeProductId) || products[0];

  // Full Screen Admin Shell Mode
  if (currentView === 'ADMIN_SHELL') {
    return (
      <AdminShell
        adminUserId={authenticatedAdminUser || 'sys-admin'}
        onLogout={() => {
          setAuthenticatedAdminUser(null);
          setCurrentView('MARKETPLACE');
        }}
      />
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Global Navigation Header */}
      <Navbar
        cartItemCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAuth={() => setCurrentView('ACCOUNT_SELECTION')}
        onOpenTraceability={() => handleOpenTraceabilityModal()}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          if (currentView !== 'MARKETPLACE') setCurrentView('MARKETPLACE');
        }}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Dynamic View Switcher */}
      <main style={{ flex: 1 }}>
        {currentView === 'MARKETPLACE' && (
          <>
            {AgriTrustDatabase.getPublishedLandingPageBlocks()
              .filter((b) => b.settings.visible)
              .map((block) => (
                <React.Fragment key={block.id}>
                  {block.type === 'HERO' && (
                    <Hero
                      block={block}
                      onBrowseClick={() => {
                        const el = document.getElementById('marketplace');
                        if (el) el.scrollIntoView({ behavior: 'smooth' });
                      }}
                      onOpenBuyerAuth={() => setCurrentView('BUYER_ONBOARDING')}
                      onOpenSellerAuth={() => setCurrentView('FARMER_ONBOARDING')}
                    />
                  )}

                  {block.type === 'HOW_IT_WORKS' && (
                    <HowItWorks />
                  )}

                  {block.type === 'PRODUCT_GRID' && (
                    <ProductGrid
                      block={block}
                      products={products}
                      searchQuery={searchQuery}
                      onAddToCart={(product) => handleAddToCart(product)}
                      onViewDetails={(product) => handleOpenProductDetailPage(product)}
                    />
                  )}

                  {block.type === 'NEWSLETTER_SUBSCRIBE' && (
                    <NewsletterSubscribeSection sourcePage="homepage" />
                  )}
                </React.Fragment>
              ))}
          </>
        )}

        {currentView === 'PRODUCT_DETAIL' && activeProduct && (
          <ProductDetailPage
            product={activeProduct}
            onBack={() => setCurrentView('MARKETPLACE')}
            onAddToCart={(product, qty) => handleAddToCart(product, qty)}
            onInspectTraceability={(lotId) => handleOpenDeepTraceabilityPage(lotId)}
          />
        )}

        {currentView === 'TRACEABILITY_LEDGER' && (
          <ExtendedTraceabilityView
            lotId={activeLotId}
            onBack={() => setCurrentView(activeProduct ? 'PRODUCT_DETAIL' : 'MARKETPLACE')}
          />
        )}

        {currentView === 'ACCOUNT_SELECTION' && (
          <AccountSelectionPage
            onSelectBuyer={() => setCurrentView('BUYER_ONBOARDING')}
            onSelectFarmer={() => setCurrentView('FARMER_ONBOARDING')}
            onBackToMarketplace={() => setCurrentView('MARKETPLACE')}
          />
        )}

        {currentView === 'BUYER_ONBOARDING' && (
          <BuyerOnboardingWizard
            onComplete={async (data) => {
              try {
                const res = await fetch('/api/auth/register/buyer', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                const json = await res.json();
                if (!json.success) throw new Error(json.error || 'Registration failed');
                alert(`Commercial Buyer Account Registered for '${json.profile?.businessName || data.businessName}'. Navigating to Buyer Portal.`);
                setCurrentView('BUYER_PORTAL');
              } catch (err: any) {
                alert(`Registration failed: ${err.message}`);
              }
            }}
            onCancel={() => setCurrentView('ACCOUNT_SELECTION')}
          />
        )}

        {currentView === 'FARMER_ONBOARDING' && (
          <FarmerOnboardingWizard
            onComplete={async (data) => {
              try {
                const res = await fetch('/api/auth/register/farmer', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                });
                const json = await res.json();
                if (!json.success) throw new Error(json.error || 'Registration failed');
                alert(`Producer Account Registered for '${json.profile?.businessName || data.businessName}'. Navigating to Farmer Portal.`);
                setCurrentView('FARMER_PORTAL');
              } catch (err: any) {
                alert(`Registration failed: ${err.message}`);
              }
            }}
            onCancel={() => setCurrentView('ACCOUNT_SELECTION')}
          />
        )}

        {currentView === 'BUYER_PORTAL' && (
          <BuyerPortalDashboard
            onBrowseMarketplace={() => setCurrentView('MARKETPLACE')}
            onInspectTraceability={(lotId) => handleOpenDeepTraceabilityPage(lotId)}
          />
        )}

        {currentView === 'FARMER_PORTAL' && (
          <FarmerPortalDashboard
            onInspectTraceability={(lotId) => handleOpenDeepTraceabilityPage(lotId)}
          />
        )}

        {currentView === 'QUALITY_WORKSPACE' && (
          <QualityInspectionWorkspace
            initialLotId={activeLotId}
            onInspectTraceability={(lotId) => handleOpenDeepTraceabilityPage(lotId)}
          />
        )}

        {currentView === 'ADMIN_COMMAND_CENTER' && (
          <AdminCommandCenter />
        )}

        {currentView === 'ADMIN_LOGIN' && (
          <AdminLogin
            onSuccess={(adminId) => {
              setAuthenticatedAdminUser(adminId);
              setCurrentView('ADMIN_SHELL');
            }}
            onCancel={() => setCurrentView('MARKETPLACE')}
          />
        )}
      </main>

      {/* Global Footer */}
      <footer style={{ backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', padding: '4rem 0 2rem' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem', marginBottom: '3rem' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--brand-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Leaf size={18} />
                </div>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800 }}>AgriTrust</span>
              </div>
              <p className="text-secondary text-xs" style={{ lineHeight: 1.6 }}>
                Production-grade B2B wholesale agricultural commerce platform. Authoritative intake, AI quality grading, minimum margin protection, and end-to-end lot provenance.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-sm" style={{ marginBottom: '1rem' }}>Platform Features</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }}>
                <li><button onClick={() => setCurrentView('MARKETPLACE')} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>Wholesale Marketplace</button></li>
                <li><button onClick={() => setCurrentView('BUYER_PORTAL')} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Buyer Portal Dashboard (Page 4)</button></li>
                <li><button onClick={() => setCurrentView('FARMER_PORTAL')} style={{ background: 'none', border: 'none', color: 'var(--brand-primary)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>Farmer Portal Dashboard (Page 5)</button></li>
                <li><button onClick={() => setCurrentView('QUALITY_WORKSPACE')} style={{ background: 'none', border: 'none', color: 'var(--brand-accent)', fontWeight: 600, cursor: 'pointer', padding: 0 }}>AI Quality Workspace (Page 6)</button></li>
                <li><button onClick={() => setCurrentView('ADMIN_LOGIN')} style={{ background: 'none', border: 'none', color: 'var(--brand-accent)', fontWeight: 700, cursor: 'pointer', padding: 0 }}>Admin Portal Authentication (/admin/login)</button></li>
                <li><button onClick={() => handleOpenTraceabilityModal()} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: 0 }}>Public Lot Verification</button></li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm" style={{ marginBottom: '1rem' }}>Security & Governance</h4>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.8125rem' }} className="text-secondary">
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><Lock size={12} /> Bilateral Privacy Protection</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><ShieldCheck size={12} /> Immutable Security Audit Vault</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}><CheckCircle2 size={12} /> Minimum Margin Engine (Formula Configured)</li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-sm" style={{ marginBottom: '1rem' }}>Platform Core Status</h4>
              <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--status-success)', fontWeight: 600, marginBottom: '0.25rem' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
                  Authoritative Admin Control Centre Active
                </div>
                <span className="text-muted">Dynamic Backend Synchronization Live</span>
              </div>
            </div>
          </div>

          <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <div>© 2026 AgriTrust Commercial Platform. All rights reserved.</div>
            <div>One platform core. One authoritative data model. One permission model.</div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
        onAddToCart={(product, qty) => handleAddToCart(product, qty)}
        onOpenTraceability={(lotId) => handleOpenDeepTraceabilityPage(lotId)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsAuthOpen(true);
        }}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={(email, role) => {
          alert(`Signed in as ${email} (${role}). Procurement account active.`);
          if (role === 'BUYER') setCurrentView('BUYER_PORTAL');
          if (role === 'FARMER' || role === 'SELLER') setCurrentView('FARMER_PORTAL');
          if (role === 'ADMIN' || role === 'OPERATIONS') setCurrentView('ADMIN_SHELL');
        }}
      />

      <TraceabilityModal
        isOpen={isTraceabilityOpen}
        onClose={() => setIsTraceabilityOpen(false)}
        initialLotId={activeLotId}
      />
    </div>
  );
};
