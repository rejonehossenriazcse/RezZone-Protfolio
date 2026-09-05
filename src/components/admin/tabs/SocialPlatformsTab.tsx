import React, { useState } from 'react';
import { useCMS } from '../../../context/CMSContext';
import { SocialPlatformCard } from '../../../types';
import {
  Share2,
  Plus,
  Trash2,
  Upload,
  ArrowUp,
  ArrowDown,
  Eye,
  ExternalLink,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const SocialPlatformsTab: React.FC = () => {
  const { cmsData, updateCMSData } = useCMS();
  const { socialPlatforms = [], siteSettings } = cmsData;

  const [editingId, setEditingId] = useState<string | null>(null);

  // New platform form state
  const [name, setName] = useState('');
  const [handle, setHandle] = useState('');
  const [url, setUrl] = useState('https://');
  const [pictureUrl, setPictureUrl] = useState('');
  const [buttonLabel, setButtonLabel] = useState('View Profile');
  const [category, setCategory] = useState('Social');
  const [badge, setBadge] = useState('');
  const [description, setDescription] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);

  // File upload for new platform picture
  const handleImageFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isNew: boolean, id?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, SVG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setUploadError('Image size exceeds 8MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      if (isNew) {
        setPictureUrl(dataUrl);
      } else if (id) {
        handleUpdatePlatform(id, { pictureUrl: dataUrl });
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleAddPlatform = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim()) return;

    const newPlatform: SocialPlatformCard = {
      id: 'plat-' + Date.now(),
      name: name.trim(),
      handle: handle.trim() || undefined,
      url: url.trim(),
      pictureUrl: pictureUrl || 'https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?auto=format&fit=crop&w=400&q=80',
      buttonLabel: buttonLabel.trim() || 'View Profile',
      category: category.trim() || 'Social',
      badge: badge.trim() || undefined,
      description: description.trim() || undefined,
      order: socialPlatforms.length + 1,
      enabled: true,
    };

    updateCMSData((prev) => ({
      ...prev,
      socialPlatforms: [...(prev.socialPlatforms || []), newPlatform],
    }));

    // Reset form
    setName('');
    setHandle('');
    setUrl('https://');
    setPictureUrl('');
    setButtonLabel('View Profile');
    setCategory('Social');
    setBadge('');
    setDescription('');
    setUploadError(null);
  };

  const handleUpdatePlatform = (id: string, updates: Partial<SocialPlatformCard>) => {
    updateCMSData((prev) => ({
      ...prev,
      socialPlatforms: (prev.socialPlatforms || []).map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    }));
  };

  const handleDeletePlatform = (id: string) => {
    updateCMSData((prev) => ({
      ...prev,
      socialPlatforms: (prev.socialPlatforms || []).filter((p) => p.id !== id),
    }));
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const list = [...socialPlatforms];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // re-assign orders
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    updateCMSData((prev) => ({ ...prev, socialPlatforms: updated }));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <span>Social Platforms &amp; Connect Page</span>
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your dedicated Social Hub page where visitors view your official accounts, custom profile pictures, and direct View buttons.
          </p>
        </div>

        <a
          href="#/socials"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors shrink-0"
        >
          <span>Open Live Socials Page</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Socials Page Header Customization */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base">
          Socials Showcase Page Header
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Page Headline
            </label>
            <input
              type="text"
              value={siteSettings.socialsPageSettings?.title || ''}
              onChange={(e) =>
                updateCMSData((prev) => ({
                  ...prev,
                  siteSettings: {
                    ...prev.siteSettings,
                    socialsPageSettings: {
                      title: e.target.value,
                      subtitle: prev.siteSettings.socialsPageSettings?.subtitle || '',
                      layout: 'grid',
                    },
                  },
                }))
              }
              placeholder="e.g. Social Profiles & Connect"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Page Subtitle
            </label>
            <input
              type="text"
              value={siteSettings.socialsPageSettings?.subtitle || ''}
              onChange={(e) =>
                updateCMSData((prev) => ({
                  ...prev,
                  siteSettings: {
                    ...prev.siteSettings,
                    socialsPageSettings: {
                      title: prev.siteSettings.socialsPageSettings?.title || '',
                      subtitle: e.target.value,
                      layout: 'grid',
                    },
                  },
                }))
              }
              placeholder="e.g. Connect with me across all official platforms."
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Add New Platform Card */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Add New Social Platform</span>
        </h3>

        <form onSubmit={handleAddPlatform} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Platform Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. YouTube, GitHub, Instagram, Discord"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Handle / Username
              </label>
              <input
                type="text"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="e.g. @rezzone"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Profile URL *
              </label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                View Button Label
              </label>
              <input
                type="text"
                value={buttonLabel}
                onChange={(e) => setButtonLabel(e.target.value)}
                placeholder="e.g. View Profile, Watch Channel, Join Discord"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Platform Picture Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Platform Picture / Logo (Upload from Device or paste URL)
            </label>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-colors">
                <Upload className="w-3.5 h-3.5 text-blue-600" />
                <span>Upload Picture</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageFileUpload(e, true)}
                />
              </label>

              <input
                type="text"
                value={pictureUrl}
                onChange={(e) => setPictureUrl(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="flex-1 w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />

              {pictureUrl && (
                <div className="flex items-center gap-2">
                  <img
                    src={pictureUrl}
                    alt="Preview"
                    className="w-9 h-9 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setPictureUrl('')}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Category Filter
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Coding, Social, Media, Career"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Badge / Tag (Optional)
              </label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="e.g. Official, Developer, Community"
                className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Short Description (Optional)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Check out my repositories, code commits, and project demos."
              className="w-full px-3.5 py-2 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Platform to Socials Hub</span>
          </button>
        </form>
      </div>

      {/* Existing Social Platforms List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
            Active Social Platforms ({socialPlatforms.length})
          </h3>
          <span className="text-xs text-slate-400">Drag/reorder using arrows</span>
        </div>

        {socialPlatforms.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500 text-xs">
            No social platforms added yet. Add your first platform above.
          </div>
        ) : (
          <div className="space-y-3">
            {socialPlatforms.map((platform, index) => (
              <div
                key={platform.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
              >
                {/* Left: Picture, Name, Handle, URL */}
                <div className="flex items-center gap-4 flex-1">
                  <div className="relative group">
                    <img
                      src={platform.pictureUrl}
                      alt={platform.name}
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-slate-700 shadow-sm"
                    />
                    {/* Quick upload trigger on avatar */}
                    <label className="absolute inset-0 bg-black/40 text-white rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity">
                      <Upload className="w-4 h-4" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFileUpload(e, false, platform.id)}
                      />
                    </label>
                  </div>

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {platform.name}
                      </h4>
                      {platform.badge && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900">
                          {platform.badge}
                        </span>
                      )}
                      {!platform.enabled && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                          Hidden
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
                      <span>{platform.handle || platform.name}</span>
                      <span>•</span>
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline flex items-center gap-1 text-blue-500"
                      >
                        <span className="truncate max-w-[200px]">{platform.url}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    {platform.description && (
                      <p className="text-xs text-slate-400 line-clamp-1">{platform.description}</p>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  {/* Button preview pill */}
                  <span className="hidden md:inline-flex text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 border border-blue-200 dark:border-blue-900">
                    Button: "{platform.buttonLabel || 'View'}"
                  </span>

                  {/* Toggle Visibility */}
                  <button
                    type="button"
                    onClick={() => handleUpdatePlatform(platform.id, { enabled: !platform.enabled })}
                    className={`p-2 rounded-xl border text-xs font-medium transition-colors ${
                      platform.enabled
                        ? 'border-emerald-300 dark:border-emerald-800 text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30'
                        : 'border-slate-300 dark:border-slate-700 text-slate-400 bg-slate-100 dark:bg-slate-800'
                    }`}
                    title={platform.enabled ? 'Click to hide' : 'Click to show'}
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  {/* Reorder Up */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => handleMoveOrder(index, 'up')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                    title="Move up"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>

                  {/* Reorder Down */}
                  <button
                    type="button"
                    disabled={index === socialPlatforms.length - 1}
                    onClick={() => handleMoveOrder(index, 'down')}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-30"
                    title="Move down"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => handleDeletePlatform(platform.id)}
                    className="p-2 rounded-xl border border-red-200 dark:border-red-900/60 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
                    title="Delete platform"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
