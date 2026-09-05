import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCMS } from '../../context/CMSContext';
import {
  sectionRevealVariants,
  defaultViewport,
  customEase,
} from '../../utils/animations';

export const SkillsSection: React.FC = () => {
  const { cmsData } = useCMS();
  const { skills, siteSettings } = cmsData;
  const { skillsDisplayStyle = 'cards', sectionsVisibility } = siteSettings;

  if (!sectionsVisibility.skills || !skills || skills.length === 0) {
    return null;
  }

  // Extract unique categories for optional filter tabs
  const categories = Array.from(new Set(skills.map((s) => s.category || 'General')));
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const filteredSkills =
    activeCategory === 'All'
      ? skills
      : skills.filter((s) => (s.category || 'General') === activeCategory);

  const sortedSkills = [...filteredSkills].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <section
      id="skills"
      className="py-20 transition-colors duration-200"
      style={{
        borderTop: `1px solid var(--color-border)`,
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="max-w-4xl">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8"
            initial="hidden"
            whileInView="visible"
            viewport={defaultViewport}
            variants={sectionRevealVariants}
          >
            <div>
              <h2
                id="skills-heading"
                className="text-2xl sm:text-3xl font-bold tracking-tight"
                style={{ color: 'var(--color-text)' }}
              >
                Technical Skills
              </h2>
            </div>

            {/* Category Filter Pills (if multiple categories exist) */}
            {categories.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setActiveCategory('All')}
                  className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                  style={{
                    backgroundColor:
                      activeCategory === 'All'
                        ? 'var(--color-primary)'
                        : 'var(--color-surface)',
                    color: activeCategory === 'All' ? '#ffffff' : 'var(--color-muted)',
                    border: `1px solid var(--color-border)`,
                  }}
                >
                  All
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className="px-3 py-1 rounded-lg text-xs font-semibold transition-colors"
                    style={{
                      backgroundColor:
                        activeCategory === cat
                          ? 'var(--color-primary)'
                          : 'var(--color-surface)',
                      color: activeCategory === cat ? '#ffffff' : 'var(--color-muted)',
                      border: `1px solid var(--color-border)`,
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Cards Display Style */}
          {skillsDisplayStyle === 'cards' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {sortedSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  id={`skill-card-${skill.id}`}
                  className="p-5 rounded-xl transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md flex flex-col justify-between"
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
                  <div>
                    <span
                      className="text-[11px] font-semibold tracking-wider uppercase block mb-1 opacity-75"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      {skill.category}
                    </span>
                    <h3
                      className="font-bold text-base sm:text-lg"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {skill.name}
                    </h3>
                  </div>

                  {typeof skill.proficiency === 'number' && skill.proficiency > 0 && (
                    <div className="mt-4 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                      <div className="flex justify-between text-xs font-semibold mb-1">
                        <span style={{ color: 'var(--color-muted)' }}>Proficiency</span>
                        <span style={{ color: 'var(--color-primary)' }}>{skill.proficiency}%</span>
                      </div>
                      <div
                        className="w-full h-1.5 rounded-full overflow-hidden"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--color-border) 80%, transparent)`,
                        }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${skill.proficiency}%`,
                            backgroundColor: 'var(--color-primary)',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Progress Bars Display Style */}
          {skillsDisplayStyle === 'bars' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {sortedSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  id={`skill-bar-${skill.id}`}
                  className="p-4 rounded-xl"
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
                  <div className="flex justify-between items-baseline mb-2">
                    <div>
                      <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                        {skill.name}
                      </span>
                      <span
                        className="text-xs ml-2 opacity-70"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        ({skill.category})
                      </span>
                    </div>
                    {typeof skill.proficiency === 'number' && (
                      <span className="text-xs font-bold" style={{ color: 'var(--color-primary)' }}>
                        {skill.proficiency}%
                      </span>
                    )}
                  </div>
                  <div
                    className="w-full h-2 rounded-full overflow-hidden"
                    style={{
                      backgroundColor: `color-mix(in srgb, var(--color-border) 70%, transparent)`,
                    }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${skill.proficiency || 80}%`,
                        backgroundColor: 'var(--color-primary)',
                      }}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {/* Tags Display Style */}
          {skillsDisplayStyle === 'tags' && (
            <div className="flex flex-wrap gap-2.5">
              {sortedSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  id={`skill-tag-${skill.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all hover:scale-105"
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
                    border: `1.5px solid var(--color-border)`,
                    color: 'var(--color-text)',
                  }}
                >
                  <span>{skill.name}</span>
                  {typeof skill.proficiency === 'number' && skill.proficiency > 0 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-md font-mono"
                      style={{
                        backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, transparent)`,
                        color: 'var(--color-primary)',
                      }}
                    >
                      {skill.proficiency}%
                    </span>
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
