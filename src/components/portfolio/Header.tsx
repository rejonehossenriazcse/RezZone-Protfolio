import React, { useState } from 'react';
import { Sun, Moon, Menu, X } from 'lucide-react';
import { useCMS } from '../../context/CMSContext';

export const Header: React.FC = () => {
  const { cmsData, isDarkMode, toggleThemeMode, navigateTo, currentView } = useCMS();
  const { brandName, logoUrl, navItems } = cmsData.siteSettings;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // If it's an external link or normal path (doesn't start with #), let browser handle it
    if (!href.startsWith('#')) return;

    e.preventDefault();
    setMobileMenuOpen(false);

    // If explicit socials view page route
    if (href === '#/socials') {
      navigateTo('socials');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const targetId = href.replace(/^#\/?/, ''); // 'contact', 'socials', 'skills', etc.

    // If we're on socials view or admin view, switch to portfolio first
    if (currentView !== 'portfolio') {
      navigateTo('portfolio');
      setTimeout(() => {
        if (targetId === 'home' || targetId === '') {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          const elem = document.getElementById(targetId);
          if (elem) {
            elem.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }, 120);
      return;
    }

    // We are currently on portfolio view
    if (targetId === 'home' || targetId === '') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      window.history.pushState(null, '', '#home');
    } else {
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth' });
        window.history.pushState(null, '', '#' + targetId);
      } else if (targetId === 'socials') {
        // Fallback to socials view if section is not found
        navigateTo('socials');
      }
    }
  };

  return (
    <header
      id="site-header"
      className="sticky top-0 z-40 w-full backdrop-blur-md transition-colors duration-200"
      style={{
        backgroundColor: `color-mix(in srgb, var(--color-bg) 85%, transparent)`,
        borderBottom: `1px solid var(--color-border)`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <a
          id="header-brand-logo"
          href="#home"
          onClick={(e) => handleNavClick(e, '#home')}
          className="flex items-center gap-3 group focus:outline-none"
        >
          {logoUrl ? (
            <img
              id="header-logo-image"
              src={logoUrl}
              alt={brandName}
              style={{ height: `${cmsData.siteSettings.logoHeight || 36}px` }}
              className="w-auto max-w-[200px] object-contain transition-transform duration-200 group-hover:scale-105"
            />
          ) : (
            <div
              id="header-brand-text"
              className="font-bold text-xl tracking-tight transition-transform duration-200 group-hover:scale-105"
              style={{ color: 'var(--color-primary)' }}
            >
              {brandName}
            </div>
          )}
        </a>

        {/* Desktop Navigation Links (From CMS) */}
        <nav id="desktop-nav" className="hidden md:flex items-center gap-7">
          {navItems &&
            navItems.map((item) => {
              return (
                <a
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  href={item.href}
                  target={item.openNewTab ? '_blank' : '_self'}
                  rel={item.openNewTab ? 'noopener noreferrer' : undefined}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="text-sm font-medium transition-colors duration-150 hover:opacity-100 cursor-pointer"
                  style={{
                    color: 'var(--color-muted)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--color-primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--color-muted)';
                  }}
                >
                  {item.label}
                </a>
              );
            })}
        </nav>

        {/* Right Action: Theme Mode Toggle only (Clean front-end, no admin option) */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            id="theme-toggle-btn"
            type="button"
            onClick={toggleThemeMode}
            className="p-2 rounded-lg transition-colors duration-150 focus:outline-none focus:ring-2"
            style={{
              color: 'var(--color-text)',
              border: `1px solid var(--color-border)`,
              backgroundColor: 'var(--color-surface)',
            }}
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Mobile Menu Trigger */}
          <button
            id="mobile-menu-btn"
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg transition-colors focus:outline-none"
            style={{
              color: 'var(--color-text)',
              border: `1px solid var(--color-border)`,
              backgroundColor: 'var(--color-surface)',
            }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div
          id="mobile-nav-drawer"
          className="md:hidden px-4 pt-2 pb-6 space-y-2 border-b"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          {navItems &&
            navItems.map((item) => {
              return (
                <a
                  key={item.id}
                  id={`mobile-nav-link-${item.id}`}
                  href={item.href}
                  target={item.openNewTab ? '_blank' : '_self'}
                  rel={item.openNewTab ? 'noopener noreferrer' : undefined}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className="block px-3 py-2 rounded-md text-base font-medium transition-colors"
                  style={{ color: 'var(--color-text)' }}
                >
                  {item.label}
                </a>
              );
            })}
        </div>
      )}
    </header>
  );
};
