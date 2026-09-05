import React from 'react';
import { motion } from 'motion/react';
import { useCMS } from '../../context/CMSContext';
import { GraduationCap, Calendar, Building2 } from 'lucide-react';
import {
  sectionRevealVariants,
  cardRevealVariants,
  defaultViewport,
  customEase,
} from '../../utils/animations';

export const EducationSection: React.FC = () => {
  const { cmsData } = useCMS();
  const { education, siteSettings } = cmsData;

  if (!siteSettings.sectionsVisibility.education || !education || education.length === 0) {
    return null;
  }

  // Sort by order
  const sortedEducation = [...education].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <section
      id="education"
      className="py-20 transition-colors duration-200"
      style={{
        borderTop: `1px solid var(--color-border)`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-3xl">
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={sectionRevealVariants}
          >
            <h2
              id="education-heading"
              className="text-2xl sm:text-3xl font-bold tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              Education Timeline
            </h2>
          </motion.div>

          <div className="space-y-6">
            {sortedEducation.map((item, index) => (
              <motion.div
                key={item.id}
                id={`edu-item-${item.id}`}
                className="group relative p-6 rounded-2xl transition-all duration-200 hover:shadow-md"
                initial={{ opacity: 0, y: 35, scale: 0.95 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={defaultViewport}
                transition={{
                  duration: 0.55,
                  ease: customEase,
                  delay: index * 0.1,
                }}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: `1px solid var(--color-border)`,
                }}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span
                        className="px-2.5 py-0.5 text-xs font-semibold rounded-md uppercase tracking-wider"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, transparent)`,
                          color: 'var(--color-primary)',
                        }}
                      >
                        {item.level}
                      </span>
                      <h3
                        className="text-lg sm:text-xl font-bold tracking-tight"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {item.degree}
                      </h3>
                    </div>

                    <div
                      className="flex items-center gap-2 mt-1.5 text-sm font-medium"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      <Building2 className="w-4 h-4 opacity-75 shrink-0" />
                      <span>{item.institution}</span>
                    </div>
                  </div>

                  <div
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full shrink-0 self-start"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--color-muted) 10%, transparent)`,
                      color: 'var(--color-text)',
                    }}
                  >
                    <Calendar className="w-3.5 h-3.5 opacity-70" />
                    <span>Passing: {item.passingYear}</span>
                  </div>
                </div>

                {item.details && (
                  <p
                    className="text-sm leading-relaxed mt-3 pt-3 border-t"
                    style={{
                      color: 'var(--color-muted)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    {item.details}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
