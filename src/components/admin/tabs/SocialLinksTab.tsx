import React, { useState } from 'react';
import { useCMS } from '../../../context/CMSContext';
import { SocialLink, NavItem } from '../../../types';
import { Plus, Trash2, Share2, Compass, FileText } from 'lucide-react';

export const SocialLinksTab: React.FC = () => {
  const { cmsData, updateCMSData } = useCMS();
  const { profile, siteSettings, footer } = cmsData;

  // Add social link
  const [newPlatform, setNewPlatform] = useState('GitHub');
  const [newUrl, setNewUrl] = useState('https://');

  const handleAddSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlatform.trim() || !newUrl.trim()) return;

    const newLink: SocialLink = {
      id: 'soc-' + Date.now(),
      platform: newPlatform.trim(),
      url: newUrl.trim(),
    };

    updateCMSData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        socialLinks: [...(prev.profile.socialLinks || []), newLink],
      },
    }));

    setNewUrl('https://');
  };

  const handleUpdateSocial = (id: string, updates: Partial<SocialLink>) => {
    updateCMSData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        socialLinks: (prev.profile.socialLinks || []).map((s) =>
          s.id === id ? { ...s, ...updates } : s
        ),
      },
    }));
  };

  const handleDeleteSocial = (id: string) => {
    updateCMSData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        socialLinks: (prev.profile.socialLinks || []).filter((s) => s.id !== id),
      },
    }));
  };

  // Nav Items Manager
  const handleAddNavItem = () => {
    const newItem: NavItem = {
      id: 'nav-' + Date.now(),
      label: 'New Link',
      href: '#',
      openNewTab: false,
    };
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        navItems: [...(prev.siteSettings.navItems || []), newItem],
      },
    }));
  };

  const handleUpdateNavItem = (id: string, updates: Partial<NavItem>) => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        navItems: (prev.siteSettings.navItems || []).map((n) =>
          n.id === id ? { ...n, ...updates } : n
        ),
      },
    }));
  };

  const handleDeleteNavItem = (id: string) => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        navItems: (prev.siteSettings.navItems || []).filter((n) => n.id !== id),
      },
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Social Links, Navigation &amp; Footer
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage social media profiles, header menu items, and footer copyright text.
        </p>
      </div>

      {/* Social Media Links */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Share2 className="w-4 h-4 text-blue-500" />
          <span>Social Media Profiles</span>
        </h3>

        {/* Add Form */}
        <form onSubmit={handleAddSocial} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            value={newPlatform}
            onChange={(e) => setNewPlatform(e.target.value)}
            placeholder="Platform (GitHub, LinkedIn, Twitter...)"
            className="w-full sm:w-1/3 px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
          />
          <input
            type="url"
            required
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            placeholder="https://..."
            className="w-full sm:w-1/2 px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white whitespace-nowrap"
          >
            Add Link
          </button>
        </form>

        {/* Existing links */}
        <div className="space-y-2.5 pt-2">
          {profile.socialLinks &&
            profile.socialLinks.map((link) => (
              <div
                key={link.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
              >
                <input
                  type="text"
                  value={link.platform}
                  onChange={(e) => handleUpdateSocial(link.id, { platform: e.target.value })}
                  className="w-1/3 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => handleUpdateSocial(link.id, { url: e.target.value })}
                  className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteSocial(link.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Header Navigation Menu Items */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-500" />
              <span>Header Navigation Links</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Menu items displayed in the top navbar. Note: Admin dashboard option is intentionally excluded from the public frontend.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddNavItem}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Menu Item</span>
          </button>
        </div>

        <div className="space-y-2.5">
          {siteSettings.navItems &&
            siteSettings.navItems.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
              >
                <input
                  type="text"
                  value={item.label}
                  onChange={(e) => handleUpdateNavItem(item.id, { label: e.target.value })}
                  className="w-1/3 px-2.5 py-1 text-xs font-semibold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <input
                  type="text"
                  value={item.href}
                  onChange={(e) => handleUpdateNavItem(item.id, { href: e.target.value })}
                  placeholder="#home, #about, or URL"
                  className="flex-1 px-2.5 py-1 text-xs font-mono rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => handleDeleteNavItem(item.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
        </div>
      </div>

      {/* Footer Content */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-500" />
          <span>Footer Settings</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Copyright Text Template
            </label>
            <input
              type="text"
              value={footer.copyrightText}
              onChange={(e) =>
                updateCMSData((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, copyrightText: e.target.value },
                }))
              }
              placeholder="e.g. © {year} {brandName}. All rights reserved."
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Tip: Use {'{year}'} and {'{brandName}'} variables for automatic replacement.
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Optional Footer Note / Tagline
            </label>
            <input
              type="text"
              value={footer.tagline || ''}
              onChange={(e) =>
                updateCMSData((prev) => ({
                  ...prev,
                  footer: { ...prev.footer, tagline: e.target.value },
                }))
              }
              placeholder="e.g. Crafted with precision & CMS control"
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
