import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useCMS } from '../../context/CMSContext';
import { ExternalLink, Share2, Copy, Check, ArrowRight } from 'lucide-react';
import {
  sectionRevealVariants,
  defaultViewport,
  customEase,
} from '../../utils/animations';

export const SocialsSection: React.FC = () => {
  const { cmsData, navigateTo } = useCMS();
  const { siteSettings, socialPlatforms = [] } = cmsData;
  const isVisible = siteSettings.sectionsVisibility?.socials !== false;

  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isVisible) return null;

  const enabledPlatforms = socialPlatforms.filter((p) => p.enabled !== false);
  const pageSettings = siteSettings.socialsPageSettings || {
    title: 'Social Media & Networks',
    subtitle: 'Connect with me directly across all official channels, social profiles, and networks.',
    layout: 'grid',
  };

  const handleCopyLink = (url: string, id: string) => {
    try {
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <section
      id="socials"
      className="py-20 px-4 sm:px-6 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-bg)',
        borderTop: '1px solid var(--color-border)',
      }}
    >
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Section Header */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-6"
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          variants={sectionRevealVariants}
        >
          <div className="space-y-3 max-w-2xl">
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider"
              style={{
                backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, transparent)`,
                color: 'var(--color-primary)',
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Connect Everywhere</span>
            </div>

            <h2
              id="socials-section-title"
              className="text-3xl sm:text-4xl font-extrabold tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              {pageSettings.title || 'Social Media & Channels'}
            </h2>

            <p
              id="socials-section-subtitle"
              className="text-base text-slate-600 dark:text-slate-400 leading-relaxed"
              style={{ color: 'var(--color-muted)' }}
            >
              {pageSettings.subtitle ||
                'Find and follow me on my official profiles, development logs, and social communities.'}
            </p>
          </div>

          <button
            id="view-full-socials-page-btn"
            type="button"
            onClick={() => navigateTo('socials')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border hover:shadow-md hover:scale-[1.02] active:scale-[0.98] self-start md:self-auto"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            <span>Open Dedicated Socials Hub</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </motion.div>

        {/* Platforms Showcase Cards */}
        {enabledPlatforms.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {enabledPlatforms.map((platform, index) => (
              <motion.div
                key={platform.id}
                id={`social-card-${platform.id}`}
                className="rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between group"
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
                  borderColor: 'var(--color-border)',
                }}
              >
                <div>
                  {/* Top row: Picture + Badge */}
                  <div className="flex items-start justify-between gap-4 mb-4">
                    {/* Platform Picture / Custom Avatar */}
                    <div className="relative">
                      {platform.pictureUrl ? (
                        <img
                          src={platform.pictureUrl}
                          alt={platform.name}
                          className="w-14 h-14 rounded-2xl object-cover shadow-sm border group-hover:scale-105 transition-transform duration-300"
                          style={{ borderColor: 'var(--color-border)' }}
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div
                          className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg shadow-sm border"
                          style={{
                            backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, transparent)`,
                            borderColor: 'var(--color-border)',
                            color: 'var(--color-primary)',
                          }}
                        >
                          {platform.name ? platform.name.charAt(0) : 'S'}
                        </div>
                      )}
                    </div>

                    {/* Badge / Category Pill */}
                    {platform.category && (
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold tracking-wide border uppercase"
                        style={{
                          backgroundColor: `color-mix(in srgb, var(--color-primary) 10%, transparent)`,
                          borderColor: `color-mix(in srgb, var(--color-primary) 20%, transparent)`,
                          color: 'var(--color-primary)',
                        }}
                      >
                        {platform.category}
                      </span>
                    )}
                  </div>

                  {/* Platform Name & Handle */}
                  <div className="space-y-1 mb-2">
                    <h3
                      className="text-lg font-bold tracking-tight group-hover:text-blue-500 transition-colors"
                      style={{ color: 'var(--color-text)' }}
                    >
                      {platform.name}
                    </h3>
                    {platform.handle && (
                      <p
                        className="text-xs font-mono font-medium truncate"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        {platform.handle}
                      </p>
                    )}
                  </div>

                  {/* Description if present */}
                  {platform.description && (
                    <p
                      className="text-xs leading-relaxed mb-4 line-clamp-2"
                      style={{ color: 'var(--color-muted)' }}
                    >
                      {platform.description}
                    </p>
                  )}
                </div>

                {/* Bottom Action: "View" Button & Quick Copy */}
                <div
                  className="pt-4 mt-2 border-t flex items-center gap-2"
                  style={{ borderColor: 'var(--color-border)' }}
                >
                  <a
                    id={`visit-social-btn-${platform.id}`}
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-semibold text-white transition-all shadow-sm hover:opacity-95 active:scale-[0.98] flex items-center justify-center gap-2"
                    style={{
                      backgroundColor: 'var(--color-primary)',
                    }}
                  >
                    <span>{platform.buttonLabel || 'View Profile'}</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => handleCopyLink(platform.url, platform.id)}
                    className="p-2 rounded-xl border transition-colors hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: 'var(--color-bg)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-muted)',
                    }}
                    title="Copy profile link"
                    aria-label="Copy platform link"
                  >
                    {copiedId === platform.id ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div
            className="text-center py-12 px-6 rounded-2xl border border-dashed"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <Share2
              className="w-10 h-10 mx-auto mb-3 opacity-40"
              style={{ color: 'var(--color-muted)' }}
            />
            <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              No social platforms configured yet.
            </p>
            <p className="text-xs mt-1" style={{ color: 'var(--color-muted)' }}>
              Add platforms in the Admin Dashboard under Socials Page Hub.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
