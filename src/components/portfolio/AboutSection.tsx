import React from 'react';
import { motion } from 'motion/react';
import { useCMS } from '../../context/CMSContext';
import { MapPin, GraduationCap } from 'lucide-react';
import {
  sectionRevealVariants,
  cardRevealVariants,
  defaultViewport,
  customEase,
} from '../../utils/animations';

export const AboutSection: React.FC = () => {
  const { cmsData } = useCMS();
  const { profile, siteSettings } = cmsData;

  if (!siteSettings.sectionsVisibility.about) return null;

  return (
    <section
      id="about"
      className="py-20 transition-colors duration-200"
      style={{
        borderTop: `1px solid var(--color-border)`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div
          className="max-w-3xl"
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={sectionRevealVariants}
        >
          <motion.h2
            id="about-heading"
            className="text-2xl sm:text-3xl font-bold tracking-tight mb-6"
            style={{ color: 'var(--color-text)' }}
            variants={sectionRevealVariants}
          >
            About
          </motion.h2>

          <motion.div
            id="about-bio-text"
            className="text-base sm:text-lg leading-relaxed space-y-4 mb-8"
            style={{ color: 'var(--color-muted)' }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={defaultViewport}
            transition={{ duration: 0.55, ease: customEase }}
          >
            {profile.bio.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph}</p>
            ))}
          </motion.div>

          {/* Key Facts / Highlights with Staggered Card Reveal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {profile.district && (
              <motion.div
                id="about-district-card"
                className="p-4 rounded-xl flex items-center gap-3 transition-colors"
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewport}
                variants={cardRevealVariants}
                transition={{ duration: 0.5, ease: customEase, delay: 0.1 }}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid var(--color-border)`,
                }}
              >
                <div
                  className="p-2.5 rounded-lg"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, transparent)`,
                    color: 'var(--color-primary)',
                  }}
                >
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-muted)' }}>
                    Home District
                  </div>
                  <div className="font-semibold text-sm sm:text-base" style={{ color: 'var(--color-text)' }}>
                    {profile.district}
                  </div>
                </div>
              </motion.div>
            )}

            {profile.currentRole && (
              <motion.div
                id="about-role-card"
                className="p-4 rounded-xl flex items-center gap-3 transition-colors"
                initial="hidden"
                whileInView="visible"
                viewport={defaultViewport}
                variants={cardRevealVariants}
                transition={{ duration: 0.5, ease: customEase, delay: 0.2 }}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid var(--color-border)`,
                }}
              >
                <div
                  className="p-2.5 rounded-lg"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--color-accent) 12%, transparent)`,
                    color: 'var(--color-accent)',
                  }}
                >
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: 'var(--color-muted)' }}>
                    Current Focus
                  </div>
                  <div className="font-semibold text-sm sm:text-base" style={{ color: 'var(--color-text)' }}>
                    {profile.currentRole}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
