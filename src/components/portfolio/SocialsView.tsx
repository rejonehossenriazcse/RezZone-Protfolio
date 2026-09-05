import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import { Header } from './Header';
import { Footer } from './Footer';
import { ExternalLink, ArrowLeft, Globe, Share2, Sparkles, CheckCircle } from 'lucide-react';

export const SocialsView: React.FC = () => {
  const { cmsData, navigateTo } = useCMS();
  const { siteSettings, socialPlatforms = [] } = cmsData;
  const pageSettings = siteSettings.socialsPageSettings || {
    title: 'Social Profiles & Connect',
    subtitle: 'Connect with me across all official platforms, coding repositories, and social channels.',
    layout: 'grid',
  };

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter platforms that are enabled
  const enabledPlatforms = socialPlatforms.filter((p) => p.enabled !== false);

  // Extract unique categories
  const categories = ['all', ...Array.from(new Set(enabledPlatforms.map((p) => p.category || 'Social').filter(Boolean)))];

  const displayedPlatforms =
    selectedCategory === 'all'
      ? enabledPlatforms
      : enabledPlatforms.filter((p) => (p.category || 'Social').toLowerCase() === selectedCategory.toLowerCase());

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div
      id="socials-page-view"
      className="min-h-screen flex flex-col selection:bg-blue-500 selection:text-white transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <Header />

      <main className="flex-1 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Top navigation breadcrumb */}
          <div className="mb-8 flex items-center justify-between">
            <button
              id="socials-back-btn"
              type="button"
              onClick={() => navigateTo('portfolio')}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all hover:scale-105 active:scale-95 border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Portfolio</span>
            </button>

            <div
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold"
              style={{
                backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, transparent)`,
                color: 'var(--color-primary)',
              }}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Platforms Hub</span>
            </div>
          </div>

          {/* Page Hero Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-4">
            <h1
              id="socials-page-headline"
              className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight"
              style={{ color: 'var(--color-text)' }}
            >
              {pageSettings.title}
            </h1>
            <p
              id="socials-page-subtitle"
              className="text-sm sm:text-base md:text-lg font-normal leading-relaxed max-w-2xl mx-auto"
              style={{ color: 'var(--color-muted)' }}
            >
              {pageSettings.subtitle}
            </p>

            {/* Category Filter Pills */}
            {categories.length > 2 && (
              <div className="flex flex-wrap justify-center gap-2 pt-4">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className="px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all border"
                    style={{
                      backgroundColor:
                        selectedCategory === cat
                          ? 'var(--color-primary)'
                          : 'var(--color-surface)',
                      color: selectedCategory === cat ? '#ffffff' : 'var(--color-muted)',
                      borderColor:
                        selectedCategory === cat ? 'var(--color-primary)' : 'var(--color-border)',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Platforms Grid */}
          {displayedPlatforms.length === 0 ? (
            <div
              className="p-12 text-center rounded-2xl border"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <Globe className="w-10 h-10 mx-auto mb-3 opacity-40" style={{ color: 'var(--color-muted)' }} />
              <p className="text-sm font-medium" style={{ color: 'var(--color-muted)' }}>
                No social platforms found in this category. You can add platforms in the CMS admin dashboard.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedPlatforms.map((platform) => (
                <div
                  key={platform.id}
                  id={`social-card-${platform.id}`}
                  className="rounded-2xl p-6 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex flex-col justify-between group"
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
                            className="w-16 h-16 rounded-2xl object-cover shadow-md border group-hover:scale-105 transition-transform duration-300"
                            style={{ borderColor: 'var(--color-border)' }}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-xl shadow-md border"
                            style={{
                              backgroundColor: `color-mix(in srgb, var(--color-primary) 12%, transparent)`,
                              borderColor: 'var(--color-border)',
                              color: 'var(--color-primary)',
                            }}
                          >
                            {platform.name.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Badge / Category Pill */}
                      {platform.badge && (
                        <span
                          className="px-2.5 py-1 rounded-full text-[11px] font-semibold tracking-wide border uppercase"
                          style={{
                            backgroundColor: `color-mix(in srgb, var(--color-primary) 10%, transparent)`,
                            borderColor: `color-mix(in srgb, var(--color-primary) 25%, transparent)`,
                            color: 'var(--color-primary)',
                          }}
                        >
                          {platform.badge}
                        </span>
                      )}
                    </div>

                    {/* Platform Name & Handle */}
                    <div className="space-y-1 mb-3">
                      <h3
                        className="text-lg font-bold tracking-tight group-hover:text-blue-500 transition-colors"
                        style={{ color: 'var(--color-text)' }}
                      >
                        {platform.name}
                      </h3>
                      {platform.handle && (
                        <p className="text-xs font-mono font-medium" style={{ color: 'var(--color-primary)' }}>
                          {platform.handle}
                        </p>
                      )}
                    </div>

                    {/* Description */}
                    {platform.description && (
                      <p
                        className="text-xs leading-relaxed mb-5 line-clamp-3"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        {platform.description}
                      </p>
                    )}
                  </div>

                  {/* Bottom Action: "View" Button & Quick Copy */}
                  <div className="pt-4 border-t flex items-center gap-2" style={{ borderColor: 'var(--color-border)' }}>
                    <a
                      id={`view-platform-btn-${platform.id}`}
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all shadow-sm hover:shadow hover:opacity-95 active:scale-[0.98] flex items-center justify-center gap-2"
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
                      className="p-2.5 rounded-xl border text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                      style={{
                        backgroundColor: 'var(--color-bg)',
                        borderColor: 'var(--color-border)',
                      }}
                      title="Copy link"
                      aria-label="Copy platform link"
                    >
                      {copiedId === platform.id ? (
                        <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                      ) : (
                        <Share2 className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Back Button */}
          <div className="mt-14 text-center">
            <button
              type="button"
              onClick={() => navigateTo('portfolio')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all hover:bg-slate-100 dark:hover:bg-slate-800 shadow-sm"
              style={{
                backgroundColor: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Main Portfolio</span>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
