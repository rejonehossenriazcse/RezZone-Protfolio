import React from 'react';
import { useCMS } from '../../context/CMSContext';
import { Github, Linkedin, Twitter, Globe } from 'lucide-react';

export const Footer: React.FC = () => {
  const { cmsData } = useCMS();
  const { footer, siteSettings, profile } = cmsData;

  const currentYear = new Date().getFullYear();
  const renderedCopyright = (footer.copyrightText || '© {year} {brandName}. All rights reserved.')
    .replace('{year}', currentYear.toString())
    .replace('{brandName}', siteSettings.brandName || 'RezZone');

  const getSocialIcon = (platform: string) => {
    const lower = platform.toLowerCase();
    if (lower.includes('github')) return <Github className="w-4 h-4" />;
    if (lower.includes('linkedin')) return <Linkedin className="w-4 h-4" />;
    if (lower.includes('twitter') || lower.includes('x')) return <Twitter className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <footer
      id="site-footer"
      className="py-12 transition-colors duration-200"
      style={{
        borderTop: `1px solid var(--color-border)`,
        backgroundColor: 'var(--color-bg)',
      }}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--color-muted)' }}>
            <span id="footer-copyright">{renderedCopyright}</span>
          </div>

          {/* Tagline if provided in CMS */}
          {footer.tagline && (
            <div className="text-xs font-medium" style={{ color: 'var(--color-muted)' }}>
              {footer.tagline}
            </div>
          )}

          {/* Social Icons */}
          {profile.socialLinks && profile.socialLinks.length > 0 && (
            <div className="flex items-center gap-3">
              {profile.socialLinks.map((social) => (
                <a
                  key={social.id}
                  id={`footer-social-${social.id}`}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg transition-colors hover:opacity-80"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid var(--color-border)`,
                    color: 'var(--color-muted)',
                  }}
                  aria-label={social.platform}
                >
                  {getSocialIcon(social.platform)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
