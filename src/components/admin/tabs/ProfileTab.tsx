import React, { useState, useRef } from 'react';
import { useCMS } from '../../../context/CMSContext';
import { User, Plus, Trash2, ExternalLink, Upload, Loader2, Check, AlertCircle } from 'lucide-react';
import { CTAButton } from '../../../types';

export const ProfileTab: React.FC = () => {
  const { cmsData, updateCMSData } = useCMS();
  const { profile } = cmsData;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleProfileFieldChange = (field: keyof typeof profile, val: any) => {
    updateCMSData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: val,
      },
    }));
  };

  const handleAddCTA = () => {
    const newBtn: CTAButton = {
      id: 'cta-' + Date.now(),
      label: 'New Action',
      href: '#contact',
      variant: 'primary',
      openNewTab: false,
    };
    updateCMSData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ctaButtons: [...(prev.profile.ctaButtons || []), newBtn],
      },
    }));
  };

  const handleUpdateCTA = (id: string, updates: Partial<CTAButton>) => {
    updateCMSData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ctaButtons: (prev.profile.ctaButtons || []).map((b) =>
          b.id === id ? { ...b, ...updates } : b
        ),
      },
    }));
  };

  const handleRemoveCTA = (id: string) => {
    updateCMSData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        ctaButtons: (prev.profile.ctaButtons || []).filter((b) => b.id !== id),
      },
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Profile &amp; Biography Information
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Edit personal brand details, hero headline, bio, location, contact channels, and CTA buttons.
        </p>
      </div>

      {/* Main Profile Fields */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <User className="w-4 h-4 text-blue-500" />
          <span>Core Bio &amp; Identity</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Full Name / Headline
            </label>
            <input
              type="text"
              value={profile.fullName}
              onChange={(e) => handleProfileFieldChange('fullName', e.target.value)}
              placeholder="e.g. RezZone"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Tagline / Subheadline
            </label>
            <input
              type="text"
              value={profile.tagline}
              onChange={(e) => handleProfileFieldChange('tagline', e.target.value)}
              placeholder="e.g. CSE Student | Developer"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Home District
            </label>
            <input
              type="text"
              value={profile.district}
              onChange={(e) => handleProfileFieldChange('district', e.target.value)}
              placeholder="e.g. Feni"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Current Role / Study Focus
            </label>
            <input
              type="text"
              value={profile.currentRole || ''}
              onChange={(e) => handleProfileFieldChange('currentRole', e.target.value)}
              placeholder="e.g. Computer Science & Engineering Student"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            About / Bio Description
          </label>
          <textarea
            rows={4}
            value={profile.bio}
            onChange={(e) => handleProfileFieldChange('bio', e.target.value)}
            placeholder="Write a bio or story..."
            className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Profile Picture Direct Input & Device Upload */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
            Profile Picture
          </label>

          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            className="hidden"
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              if (!file.type.startsWith('image/')) {
                setUploadError('Please select a valid image file (JPG, PNG, WebP).');
                return;
              }

              setIsUploading(true);
              setUploadError(null);
              setUploadMessage('Compressing and applying profile photo...');

              try {
                // Compress via HTML Canvas for fast loading and local storage compatibility
                const dataUrl = await new Promise<string>((resolve, reject) => {
                  const reader = new FileReader();
                  reader.onerror = reject;
                  reader.onload = (loadEvt) => {
                    const img = new Image();
                    img.onerror = reject;
                    img.onload = () => {
                      const maxDim = 800;
                      let w = img.width;
                      let h = img.height;
                      if (w > maxDim || h > maxDim) {
                        if (w > h) {
                          h = Math.round((h * maxDim) / w);
                          w = maxDim;
                        } else {
                          w = Math.round((w * maxDim) / h);
                          h = maxDim;
                        }
                      }
                      const canvas = document.createElement('canvas');
                      canvas.width = w;
                      canvas.height = h;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) {
                        resolve(loadEvt.target?.result as string);
                        return;
                      }
                      ctx.drawImage(img, 0, 0, w, h);
                      resolve(canvas.toDataURL('image/jpeg', 0.85));
                    };
                    img.src = loadEvt.target?.result as string;
                  };
                  reader.readAsDataURL(file);
                });

                // Apply to profile picture and media library (persists to backend database)
                const newItem = {
                  id: 'media-' + Date.now(),
                  name: file.name,
                  url: dataUrl,
                  createdAt: new Date().toISOString(),
                };

                await updateCMSData((prev) => ({
                  ...prev,
                  mediaLibrary: [newItem, ...(prev.mediaLibrary || [])],
                  profile: {
                    ...prev.profile,
                    profilePicture: dataUrl,
                  },
                }));

                try {
                  const storageKey = 'rezzone_uploaded_media_v1';
                  const saved = localStorage.getItem(storageKey);
                  const list = saved ? JSON.parse(saved) : [];
                  localStorage.setItem(storageKey, JSON.stringify([newItem, ...list]));
                } catch {
                  // ignore
                }

                setUploadMessage('Profile photo successfully updated!');
                setTimeout(() => setUploadMessage(null), 3500);
              } catch (err: any) {
                console.error(err);
                setUploadError(err.message || 'Failed to process photo.');
              } finally {
                setIsUploading(false);
                if (fileInputRef.current) {
                  fileInputRef.current.value = '';
                }
              }
            }}
          />

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative group shrink-0">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt="Profile Preview"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/50 shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400">
                  <User className="w-7 h-7" />
                </div>
              )}
            </div>

            <div className="flex-1 w-full space-y-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm transition-all inline-flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Photo...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Photo from Device</span>
                    </>
                  )}
                </button>
              </div>

              <input
                type="text"
                value={profile.profilePicture}
                onChange={(e) => handleProfileFieldChange('profilePicture', e.target.value)}
                placeholder="Or paste an image link (Unsplash, Imgur, Cloudinary, etc.)"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
              />
            </div>
          </div>

          {uploadMessage && (
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>{uploadMessage}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact Channels */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base">Contact Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Contact Email
            </label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => handleProfileFieldChange('email', e.target.value)}
              placeholder="contact@example.com"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Phone Number (Optional)
            </label>
            <input
              type="text"
              value={profile.phone || ''}
              onChange={(e) => handleProfileFieldChange('phone', e.target.value)}
              placeholder="+880..."
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Location / Address (Optional)
            </label>
            <input
              type="text"
              value={profile.address || ''}
              onChange={(e) => handleProfileFieldChange('address', e.target.value)}
              placeholder="Feni, Bangladesh"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Hero CTA Buttons */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base">Hero Action Buttons (CTA)</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage the call-to-action buttons shown in the hero section.
            </p>
          </div>
          <button
            type="button"
            onClick={handleAddCTA}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Button</span>
          </button>
        </div>

        <div className="space-y-3">
          {profile.ctaButtons &&
            profile.ctaButtons.map((btn) => (
              <div
                key={btn.id}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex flex-col sm:flex-row items-center gap-3"
              >
                <div className="w-full sm:w-1/3">
                  <input
                    type="text"
                    value={btn.label}
                    onChange={(e) => handleUpdateCTA(btn.id, { label: e.target.value })}
                    placeholder="Button Label"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
                <div className="w-full sm:w-1/3">
                  <input
                    type="text"
                    value={btn.href}
                    onChange={(e) => handleUpdateCTA(btn.id, { href: e.target.value })}
                    placeholder="#contact or https://..."
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono"
                  />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={btn.variant}
                    onChange={(e) => handleUpdateCTA(btn.id, { variant: e.target.value as any })}
                    className="px-2.5 py-1.5 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="primary">Primary</option>
                    <option value="outline">Outline</option>
                    <option value="secondary">Secondary</option>
                  </select>

                  <label className="flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={!!btn.openNewTab}
                      onChange={(e) => handleUpdateCTA(btn.id, { openNewTab: e.target.checked })}
                      className="rounded"
                    />
                    <span>New tab</span>
                  </label>

                  <button
                    type="button"
                    onClick={() => handleRemoveCTA(btn.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg ml-auto"
                    title="Delete Button"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};
