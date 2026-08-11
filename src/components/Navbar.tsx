import React, { useState } from 'react';
import { ShoppingBag, Search, ShieldCheck, User, Menu, X, Leaf, Sun, Moon } from 'lucide-react';

interface NavbarProps {
  cartItemCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  onOpenTraceability: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartItemCount,
  onOpenCart,
  onOpenAuth,
  onOpenTraceability,
  searchQuery,
  onSearchChange,
  theme,
  onToggleTheme,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="header-nav">
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '4.5rem' }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2.5rem' }}>
          <a href="#" style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', textDecoration: 'none' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: 'var(--shadow-sm)'
            }}>
              <Leaf size={22} />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-heading)', fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                Agri<span style={{ color: 'var(--brand-primary)' }}>Trust</span>
              </span>
              <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                Wholesale Intermediary
              </span>
            </div>
          </a>

          {/* Desktop Navigation Links */}
          <nav style={{ display: 'none', gap: '1.5rem', alignItems: 'center' }} className="desktop-nav">
            <a href="#marketplace" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', textDecoration: 'none' }}>Marketplace</a>
            <a href="#how-it-works" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>How It Works</a>
            <a href="#farmers" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>For Farmers</a>
            <a href="#businesses" style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)', textDecoration: 'none' }}>For Businesses</a>
          </nav>
        </div>

        {/* Global Search Bar (Expanded ~30% wider: 520px max-width) */}
        <div style={{ flex: '1', maxWidth: '520px', margin: '0 1.5rem', display: 'none' }} className="desktop-search">
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search products, produce or availability..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem', paddingRight: searchQuery ? '2.25rem' : '0.875rem', borderRadius: 'var(--radius-full)', backgroundColor: 'var(--bg-surface-elevated)' }}
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center'
                }}
                title="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
          {/* Theme Toggle */}
          <button 
            onClick={onToggleTheme}
            className="btn btn-secondary btn-icon"
            title="Toggle theme"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* Cart Button */}
          <button 
            onClick={onOpenCart} 
            className="btn btn-secondary"
            style={{ position: 'relative', padding: '0.5rem 1rem' }}
          >
            <ShoppingBag size={18} />
            <span style={{ display: 'none' }} className="cart-text">Cart</span>
            {cartItemCount > 0 && (
              <span className="badge badge-brand" style={{ position: 'absolute', top: '-0.375rem', right: '-0.375rem', padding: '0.15rem 0.45rem', fontSize: '0.7rem' }}>
                {cartItemCount}
              </span>
            )}
          </button>

          {/* Account Button */}
          <button onClick={onOpenAuth} className="btn btn-primary">
            <User size={16} />
            <span>Sign In</span>
          </button>

          {/* Mobile Menu Toggle */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="btn btn-secondary btn-icon" 
            style={{ display: 'flex' }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div style={{ padding: '1rem 1.5rem', backgroundColor: 'var(--bg-surface)', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="Search products, produce or availability..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.5rem' }}
            />
          </div>
          <a href="#marketplace" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', fontWeight: 600, color: 'var(--text-primary)' }}>Marketplace</a>
          <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>How It Works</a>
          <a href="#farmers" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>For Farmers</a>
          <a href="#businesses" onClick={() => setMobileMenuOpen(false)} style={{ textDecoration: 'none', color: 'var(--text-secondary)' }}>For Businesses</a>
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav { display: flex !important; }
          .desktop-search { display: block !important; }
          .cart-text { display: inline !important; }
        }
      `}</style>
    </header>
  );
};
