import React, { useState, useRef, useMemo } from 'react';
import { useCMS } from '../../../context/CMSContext';
import {
  Image as ImageIcon,
  Upload,
  Check,
  Trash2,
  Link as LinkIcon,
  Copy,
  Loader2,
  HardDrive,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { MediaItem } from '../../../types';

const LOCAL_MEDIA_STORAGE_KEY = 'rezzone_uploaded_media_v1';

export const MediaLibraryTab: React.FC = () => {
  const { cmsData, updateCMSData } = useCMS();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [customUrl, setCustomUrl] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Synchronize media list directly with cmsData (database source of truth)
  const mediaList: MediaItem[] = useMemo(() => {
    if (cmsData.mediaLibrary && cmsData.mediaLibrary.length > 0) {
      return cmsData.mediaLibrary;
    }
    try {
      const saved = localStorage.getItem(LOCAL_MEDIA_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  }, [cmsData.mediaLibrary]);

  // Preset developer/tech avatar collection for quick selection
  const PRESET_MEDIA = [
    {
      id: 'preset-1',
      title: 'Modern Developer (Casual)',
      url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-2',
      title: 'Tech Professional (Studio)',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-3',
      title: 'Creative Technologist',
      url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'preset-4',
      title: 'Software Engineer',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    },
  ];

  // Helper to resize and compress images using HTML5 Canvas so they safely fit inside localStorage
const compressImageFile = (file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.85): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const mimeType = file.type === 'image/png' ? 'image/png' : 'image/jpeg';
        resolve(canvas.toDataURL(mimeType, quality));
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

// Handle local image upload (encoded to DataURL and persisted in localStorage)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select a valid image file (PNG, JPG, WebP, SVG).');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setUploadError('File size exceeds 15MB. Please choose a smaller photo.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadStatus('Optimizing and saving photo...');

    try {
      // Compress and resize image so it fits comfortably in localStorage
      const publicUrl = await compressImageFile(file, 900, 900, 0.82);

      const newMediaItem: MediaItem = {
        id: 'media-' + Date.now(),
        name: file.name,
        url: publicUrl,
        createdAt: new Date().toISOString(),
      };

      // Automatically persist to database and apply as active profile picture
      await updateCMSData((prev) => ({
        ...prev,
        mediaLibrary: [newMediaItem, ...(prev.mediaLibrary || mediaList)],
        profile: {
          ...prev.profile,
          profilePicture: publicUrl,
        },
      }));

      try {
        localStorage.setItem(LOCAL_MEDIA_STORAGE_KEY, JSON.stringify([newMediaItem, ...mediaList]));
      } catch (storageErr) {
        // ignore
      }

      setUploadStatus('Image added to library and set as profile picture successfully!');
      setTimeout(() => setUploadStatus(null), 3500);
    } catch (err: any) {
      console.error('Image upload error:', err);
      setUploadError(err.message || 'Failed to process image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleApplyAsProfile = (url: string) => {
    updateCMSData((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        profilePicture: url,
      },
    }));
  };

  const handleApplyAsLogo = (url: string) => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        logoUrl: url,
      },
    }));
  };

  const handleCopyUrl = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteItem = async (item: MediaItem) => {
    if (!window.confirm(`Remove "${item.name}" from the media library?`)) return;

    await updateCMSData((prev) => ({
      ...prev,
      mediaLibrary: (prev.mediaLibrary || mediaList).filter((m) => m.id !== item.id && m.url !== item.url),
    }));

    try {
      const updated = mediaList.filter((m) => m.id !== item.id && m.url !== item.url);
      localStorage.setItem(LOCAL_MEDIA_STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleAddCustomUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) return;

    const url = customUrl.trim();
    const newMediaItem: MediaItem = {
      id: 'custom-' + Date.now(),
      name: url.split('/').pop() || 'Custom URL',
      url,
      createdAt: new Date().toISOString(),
    };

    await updateCMSData((prev) => ({
      ...prev,
      mediaLibrary: [newMediaItem, ...(prev.mediaLibrary || mediaList)],
      profile: {
        ...prev.profile,
        profilePicture: url,
      },
    }));

    try {
      localStorage.setItem(LOCAL_MEDIA_STORAGE_KEY, JSON.stringify([newMediaItem, ...mediaList]));
    } catch {
      // ignore
    }

    setCustomUrl('');
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header with Local Storage Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Media Library &amp; Asset Management
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload images, paste external URLs, or choose curated developer avatars saved directly to your database.
          </p>
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
            <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
            <span>Browser LocalStorage Persistence</span>
          </span>
        </div>
      </div>

      {/* Active Assets Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Profile Picture */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <img
            src={cmsData.profile.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80'}
            alt="Current Profile"
            className="w-16 h-16 rounded-2xl object-cover border border-slate-300 dark:border-slate-700 shadow-sm shrink-0"
          />
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
              Active Profile Picture
            </span>
            <p className="text-xs text-slate-500 truncate mt-0.5 font-mono" title={cmsData.profile.profilePicture}>
              {cmsData.profile.profilePicture.startsWith('data:')
                ? 'Local Upload (Stored in browser)'
                : cmsData.profile.profilePicture}
            </p>
          </div>
        </div>

        {/* Current Brand Logo */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          {cmsData.siteSettings.logoUrl ? (
            <img
              src={cmsData.siteSettings.logoUrl}
              alt="Brand Logo"
              className="w-16 h-16 rounded-2xl object-contain p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 shadow-sm shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg text-blue-600 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-900 shrink-0">
              {cmsData.siteSettings.brandName.slice(0, 2)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">
              Active Brand Logo
            </span>
            <p className="text-xs text-slate-500 truncate mt-0.5 font-mono">
              {cmsData.siteSettings.logoUrl ? cmsData.siteSettings.logoUrl : 'Using Text Brand Name'}
            </p>
          </div>
        </div>
      </div>

      {/* Image Upload Box */}
      <div className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 bg-white dark:bg-slate-900/50 text-center transition-colors">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950 flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Upload className="w-6 h-6" />
            )}
          </div>
          <div>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white shadow-sm transition-all inline-flex items-center gap-2"
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processing Image...</span>
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>Upload Local Image</span>
                </>
              )}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Upload PNG, JPG, WebP, or SVG directly from your device.
            </p>
          </div>

          {/* Feedback messages */}
          {uploadStatus && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-medium flex items-center justify-center gap-2">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>{uploadStatus}</span>
            </div>
          )}

          {uploadError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-medium flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{uploadError}</span>
            </div>
          )}
        </div>
      </div>

      {/* Uploaded Media Library List */}
      {mediaList.length > 0 && (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-blue-500" />
              <span>Uploaded Media Assets ({mediaList.length})</span>
            </h3>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Persisted in Database</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mediaList.map((item) => {
              const isCurrentProfile = cmsData.profile.profilePicture === item.url;
              const isCurrentLogo = cmsData.siteSettings.logoUrl === item.url;

              return (
                <div
                  key={item.id}
                  className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/40 flex flex-col"
                >
                  <div className="aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800 relative group">
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-white/90 text-slate-800 hover:bg-white text-xs font-medium"
                        title="Open image in new tab"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between space-y-2.5">
                    <div>
                      <p className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate" title={item.name}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-mono truncate mt-0.5" title={item.url}>
                        {item.url.startsWith('data:') ? 'Local Base64 image' : item.url}
                      </p>
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-slate-200/80 dark:border-slate-700/80">
                      <div className="flex gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleCopyUrl(item.url, item.id)}
                          className="flex-1 py-1.5 px-2 rounded-lg text-[10px] font-semibold bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-600 flex items-center justify-center gap-1 transition-colors"
                        >
                          {copiedId === item.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy URL</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          title="Delete image"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleApplyAsProfile(item.url)}
                          className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold transition-colors flex items-center justify-center gap-1 ${
                            isCurrentProfile
                              ? 'bg-blue-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-blue-500'
                          }`}
                        >
                          {isCurrentProfile && <Check className="w-3 h-3" />}
                          <span>{isCurrentProfile ? 'Profile' : 'Set Profile'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApplyAsLogo(item.url)}
                          className={`py-1 px-1.5 rounded-lg text-[10px] font-semibold transition-colors flex items-center justify-center gap-1 ${
                            isCurrentLogo
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:border-emerald-500'
                          }`}
                        >
                          {isCurrentLogo && <Check className="w-3 h-3" />}
                          <span>{isCurrentLogo ? 'Logo' : 'Set Logo'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Or Paste Direct URL */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <LinkIcon className="w-4 h-4 text-blue-500" />
          <span>Add via Direct Image URL</span>
        </h3>
        <form onSubmit={handleAddCustomUrl} className="flex gap-3">
          <input
            type="url"
            value={customUrl}
            onChange={(e) => setCustomUrl(e.target.value)}
            placeholder="https://... (Unsplash, Imgur, GitHub, Cloudinary, or any image URL)"
            className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 transition-opacity"
          >
            Apply to Profile
          </button>
        </form>
      </div>

      {/* Preset Curated Avatars */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base">
            Preset Developer Portraits
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Click to immediately set as your profile picture or logo.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {PRESET_MEDIA.map((preset) => {
            const isCurrentProfile = cmsData.profile.profilePicture === preset.url;
            return (
              <div
                key={preset.id}
                className="group relative rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden bg-slate-50 dark:bg-slate-800/50 flex flex-col"
              >
                <div className="aspect-square w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
                  <img
                    src={preset.url}
                    alt={preset.title}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div className="text-[11px] font-semibold text-slate-900 dark:text-white truncate">
                    {preset.title}
                  </div>
                  <div className="flex flex-col gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => handleApplyAsProfile(preset.url)}
                      className={`w-full py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 ${
                        isCurrentProfile
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 hover:bg-blue-50 hover:text-blue-600'
                      }`}
                    >
                      {isCurrentProfile ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Active</span>
                        </>
                      ) : (
                        <span>Set as Profile</span>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleApplyAsLogo(preset.url)}
                      className="w-full py-1 px-2 rounded-lg text-[10px] font-medium text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-center"
                    >
                      Set as Logo
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
