import React from 'react';
import { motion } from 'motion/react';
import { useCMS } from '../../context/CMSContext';
import { ThreeCanvas } from '../ThreeCanvas';
import { ExternalLink } from 'lucide-react';
import {
  sectionRevealVariants,
  cardRevealVariants,
  defaultViewport,
  customEase,
} from '../../utils/animations';

export const HeroSection: React.FC = () => {
  const { cmsData, navigateTo } = useCMS();
  const { profile, siteSettings } = cmsData;
  const { heroLayout, profileImageShape, enable3D } = siteSettings;

  if (!siteSettings.sectionsVisibility.hero) return null;

  // Determine image corner radius based on CMS setting
  const getImageShapeClass = () => {
    switch (profileImageShape) {
      case 'circle':
        return 'rounded-full';
      case 'square':
        return 'rounded-none';
      case 'rounded':
      default:
        return 'rounded-2xl';
    }
  };

  const imageElement = (
    <motion.div
      id="hero-image-wrapper"
      className="relative flex items-center justify-center p-4"
      initial={{ opacity: 0, y: 35, scale: 0.95 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={defaultViewport}
      transition={{ duration: 0.65, ease: customEase }}
    >
      {/* Glow aura */}
      <div
        className="absolute inset-0 filter blur-3xl opacity-25 -z-10 rounded-full"
        style={{
          background: `radial-gradient(circle, var(--color-primary) 0%, var(--color-accent) 70%, transparent 100%)`,
        }}
      />
      {profile.profilePicture ? (
        <img
          id="hero-profile-image"
          src={profile.profilePicture}
          alt={profile.fullName}
          className={`w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 object-cover shadow-2xl transition-all duration-300 ${getImageShapeClass()}`}
          style={{
            border: `3px solid var(--color-border)`,
          }}
          referrerPolicy="no-referrer"
        />
      ) : (
        <div
          id="hero-profile-placeholder"
          className={`w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 flex items-center justify-center text-4xl font-bold ${getImageShapeClass()}`}
          style={{
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-primary)',
            border: `3px solid var(--color-border)`,
          }}
        >
          {profile.fullName ? profile.fullName.charAt(0) : 'R'}
        </div>
      )}
    </motion.div>
  );

  const textContent = (
    <motion.div
      id="hero-text-content"
      className={`space-y-5 ${
        heroLayout === 'imageCenter' ? 'text-center max-w-2xl mx-auto' : 'text-left max-w-xl'
      }`}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      variants={sectionRevealVariants}
    >
      {profile.district && (
        <motion.div
          id="hero-location-badge"
          className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full tracking-wide uppercase"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={defaultViewport}
          transition={{ duration: 0.45, ease: customEase }}
          style={{
            backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, transparent)`,
            color: 'var(--color-primary)',
            border: `1px solid color-mix(in srgb, var(--color-primary) 25%, transparent)`,
          }}
        >
          <span>Based in {profile.district}</span>
        </motion.div>
      )}

      <motion.h1
        id="hero-headline"
        className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight"
        style={{ color: 'var(--color-text)' }}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={defaultViewport}
        transition={{ duration: 0.55, ease: customEase, delay: 0.05 }}
      >
        {profile.fullName}
      </motion.h1>

      <motion.p
        id="hero-tagline"
        className="text-lg sm:text-xl md:text-2xl font-normal leading-relaxed"
        style={{ color: 'var(--color-muted)' }}
        initial={{ opacity: 0, y: 25 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={defaultViewport}
        transition={{ duration: 0.55, ease: customEase, delay: 0.1 }}
      >
        {profile.tagline}
      </motion.p>

      {/* CTA Buttons with staggered animation */}
      {profile.ctaButtons && profile.ctaButtons.length > 0 && (
        <motion.div
          id="hero-cta-group"
          className={`pt-2 flex flex-wrap gap-4 ${
            heroLayout === 'imageCenter' ? 'justify-center' : 'justify-start'
          }`}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={defaultViewport}
          transition={{ duration: 0.5, ease: customEase, delay: 0.15 }}
        >
          {profile.ctaButtons.map((btn, idx) => {
            const isPrimary = btn.variant === 'primary';
            const isOutline = btn.variant === 'outline';
            const isSocials = btn.href === '#socials' || btn.href === '#/socials';

            return (
              <motion.a
                key={btn.id}
                id={`hero-cta-${btn.id}`}
                href={btn.href}
                target={btn.openNewTab ? '_blank' : '_self'}
                rel={btn.openNewTab ? 'noopener noreferrer' : undefined}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={defaultViewport}
                transition={{ duration: 0.45, ease: customEase, delay: 0.15 + idx * 0.1 }}
                onClick={(e) => {
                  if (btn.href.startsWith('#')) {
                    e.preventDefault();
                    if (isSocials) {
                      const elem = document.getElementById('socials');
                      if (elem) {
                        elem.scrollIntoView({ behavior: 'smooth' });
                        window.history.pushState(null, '', '#socials');
                        return;
                      }
                      navigateTo('socials');
                      return;
                    }
                    const targetId = btn.href.replace('#', '');
                    const elem = document.getElementById(targetId);
                    if (elem) {
                      elem.scrollIntoView({ behavior: 'smooth' });
                      window.history.pushState(null, '', btn.href);
                    }
                  }
                }}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-md hover:scale-[1.02] active:scale-[0.98]"
                style={{
                  backgroundColor: isPrimary
                    ? 'var(--color-primary)'
                    : isOutline
                    ? 'transparent'
                    : 'var(--color-surface)',
                  color: isPrimary
                    ? '#ffffff'
                    : 'var(--color-text)',
                  border: isOutline
                    ? `1.5px solid var(--color-border)`
                    : isPrimary
                    ? 'none'
                    : `1px solid var(--color-border)`,
                }}
              >
                <span>{btn.label}</span>
                {btn.openNewTab && <ExternalLink className="w-3.5 h-3.5 opacity-70" />}
              </motion.a>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );

  return (
    <section
      id="home"
      className="relative min-h-[85vh] flex items-center justify-center py-16 sm:py-24 overflow-hidden"
    >
      {/* 3D Canvas Background Accent */}
      {enable3D && (
        <div className="absolute inset-0 -z-10 flex items-center justify-center pointer-events-none opacity-40 md:opacity-60">
          <ThreeCanvas className="w-full h-full max-w-4xl" />
        </div>
      )}

      <div className="max-w-6xl w-full mx-auto px-4 sm:px-6 relative z-10">
        {heroLayout === 'imageCenter' ? (
          <div className="flex flex-col items-center gap-8">
            {imageElement}
            {textContent}
          </div>
        ) : heroLayout === 'imageLeft' ? (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-5 flex justify-center md:justify-start">
              {imageElement}
            </div>
            <div className="md:col-span-7">{textContent}</div>
          </div>
        ) : (
          /* Default: imageRight */
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-center">
            <div className="md:col-span-7 order-2 md:order-1">{textContent}</div>
            <div className="md:col-span-5 order-1 md:order-2 flex justify-center md:justify-end">
              {imageElement}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
