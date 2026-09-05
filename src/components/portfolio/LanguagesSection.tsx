import React from 'react';
import { motion } from 'motion/react';
import { useCMS } from '../../context/CMSContext';
import { Languages as LanguagesIcon } from 'lucide-react';
import {
  sectionRevealVariants,
  defaultViewport,
  customEase,
} from '../../utils/animations';

export const LanguagesSection: React.FC = () => {
  const { cmsData } = useCMS();
  const { languages, siteSettings } = cmsData;

  if (!siteSettings.sectionsVisibility.languages || !languages || languages.length === 0) {
    return null;
  }

  const sortedLanguages = [...languages].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <section
      id="languages"
      className="py-16 transition-colors duration-200"
      style={{
        borderTop: `1px solid var(--color-border)`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <motion.div
            className="flex items-center gap-3 mb-6"
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={sectionRevealVariants}
          >
            <h2
              id="languages-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              Languages
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sortedLanguages.map((lang, index) => (
              <motion.div
                key={lang.id}
                id={`lang-item-${lang.id}`}
                className="p-4 rounded-xl flex items-center justify-between transition-all"
                initial={{ opacity: 0, y: 35, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={defaultViewport}
                transition={{
                  duration: 0.5,
                  ease: customEase,
                  delay: index * 0.1,
                }}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid var(--color-border)`,
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="p-2 rounded-lg"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--color-accent) 12%, transparent)`,
                      color: 'var(--color-accent)',
                    }}
                  >
                    <LanguagesIcon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-base" style={{ color: 'var(--color-text)' }}>
                    {lang.name}
                  </span>
                </div>

                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-full"
                  style={{
                    backgroundColor: `color-mix(in srgb, var(--color-primary) 10%, transparent)`,
                    color: 'var(--color-primary)',
                  }}
                >
                  {lang.proficiency}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
