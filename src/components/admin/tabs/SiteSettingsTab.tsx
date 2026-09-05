import React, { useState } from 'react';
import { useCMS } from '../../../context/CMSContext';
import { Layout, Box, Eye, Sparkles, Upload, Image, Trash2, CheckCircle2 } from 'lucide-react';

export const SiteSettingsTab: React.FC = () => {
  const { cmsData, updateCMSData } = useCMS();
  const { siteSettings } = cmsData;

  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);

  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: { ...prev.siteSettings, brandName: val },
    }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoUploadError('Please select a valid image file (PNG, SVG, JPG, WebP).');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      setLogoUploadError('Logo file size exceeds 8MB limit.');
      return;
    }

    setLogoUploadError(null);
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      updateCMSData((prev) => ({
        ...prev,
        siteSettings: {
          ...prev.siteSettings,
          logoUrl: dataUrl,
          logoHeight: prev.siteSettings.logoHeight || 36,
        },
      }));
    };
    reader.onerror = () => {
      setLogoUploadError('Failed to read logo image.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        logoUrl: '',
      },
    }));
  };

  const handleLogoHeightChange = (height: number) => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        logoHeight: height,
      },
    }));
  };

  const handleHeroLayoutChange = (layout: 'imageLeft' | 'imageRight' | 'imageCenter') => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: { ...prev.siteSettings, heroLayout: layout },
    }));
  };

  const handleImageShapeChange = (shape: 'circle' | 'rounded' | 'square') => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: { ...prev.siteSettings, profileImageShape: shape },
    }));
  };

  const handleToggle3D = (enabled: boolean) => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: { ...prev.siteSettings, enable3D: enabled },
    }));
  };

  const handleThreeStyleChange = (style: 'torus' | 'particles' | 'rings') => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: { ...prev.siteSettings, threeStyle: style },
    }));
  };

  const handleSkillsStyleChange = (style: 'cards' | 'bars' | 'tags') => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: { ...prev.siteSettings, skillsDisplayStyle: style },
    }));
  };

  const handleSectionVisibility = (section: keyof typeof siteSettings.sectionsVisibility) => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        sectionsVisibility: {
          ...prev.siteSettings.sectionsVisibility,
          [section]: !prev.siteSettings.sectionsVisibility[section],
        },
      },
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          General Site Settings &amp; Layout
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure global brand identity, layout structures, 3D accents, and section visibility.
        </p>
      </div>

      {/* Brand Identity & Active Logo Customization */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Brand Identity &amp; Active Logo Customization</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Upload and refine your custom brand logo. You can adjust the display height, upload a new image directly from your device, or paste a URL.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Brand / Display Name
            </label>
            <input
              type="text"
              value={siteSettings.brandName}
              onChange={handleBrandChange}
              placeholder="e.g. RezZone"
              className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Logo Height in Header ({siteSettings.logoHeight || 36}px)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="24"
                max="64"
                step="2"
                value={siteSettings.logoHeight || 36}
                onChange={(e) => handleLogoHeightChange(Number(e.target.value))}
                className="w-full accent-blue-600 cursor-pointer"
              />
              <span className="text-xs font-mono font-semibold px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 min-w-[50px] text-center">
                {siteSettings.logoHeight || 36}px
              </span>
            </div>
          </div>
        </div>

        {/* Logo Upload & Management */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Active Brand Logo File
          </label>

          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            {/* Upload Button */}
            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all shrink-0">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Custom Logo</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleLogoUpload}
              />
            </label>

            {/* URL Input */}
            <input
              type="text"
              value={siteSettings.logoUrl || ''}
              onChange={(e) =>
                updateCMSData((prev) => ({
                  ...prev,
                  siteSettings: { ...prev.siteSettings, logoUrl: e.target.value },
                }))
              }
              placeholder="Or paste direct image URL (https://...)"
              className="flex-1 w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            {siteSettings.logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 hover:bg-red-100 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Remove Logo</span>
              </button>
            )}
          </div>

          {logoUploadError && (
            <p className="text-xs text-red-500 font-medium">{logoUploadError}</p>
          )}

          {/* Dual Live Preview Box */}
          <div className="mt-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Real-Time Navbar Logo Preview
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Light Background Preview */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {siteSettings.logoUrl ? (
                    <img
                      src={siteSettings.logoUrl}
                      alt="Brand Logo Preview Light"
                      style={{ height: `${siteSettings.logoHeight || 36}px` }}
                      className="w-auto object-contain"
                    />
                  ) : (
                    <span className="font-extrabold text-base tracking-tight text-slate-900">
                      {siteSettings.brandName || 'RezZone'}
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                  Light Nav
                </span>
              </div>

              {/* Dark Background Preview */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 shadow-sm flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {siteSettings.logoUrl ? (
                    <img
                      src={siteSettings.logoUrl}
                      alt="Brand Logo Preview Dark"
                      style={{ height: `${siteSettings.logoHeight || 36}px` }}
                      className="w-auto object-contain"
                    />
                  ) : (
                    <span className="font-extrabold text-base tracking-tight text-white">
                      {siteSettings.brandName || 'RezZone'}
                    </span>
                  )}
                </div>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                  Dark Nav
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Layout & Profile Image Shape */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Layout className="w-4 h-4 text-blue-500" />
            <span>Hero Section Layout</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose how the hero profile picture and intro text are arranged.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'imageRight', label: 'Image on Right (Default)', desc: 'Text on left, picture on right' },
            { id: 'imageLeft', label: 'Image on Left', desc: 'Picture on left, text on right' },
            { id: 'imageCenter', label: 'Image Centered', desc: 'Centered avatar with headline underneath' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleHeroLayoutChange(item.id as any)}
              className={`p-4 rounded-xl text-left border transition-all ${
                siteSettings.heroLayout === item.id
                  ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-sm text-slate-900 dark:text-white">{item.label}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</div>
            </button>
          ))}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
            Profile Picture Shape
          </label>
          <div className="flex flex-wrap gap-3">
            {[
              { id: 'circle', label: 'Circle' },
              { id: 'rounded', label: 'Rounded Rectangle' },
              { id: 'square', label: 'Sharp Square' },
            ].map((shape) => (
              <button
                key={shape.id}
                type="button"
                onClick={() => handleImageShapeChange(shape.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-medium border transition-all ${
                  siteSettings.profileImageShape === shape.id
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                    : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {shape.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3D Visual Accents */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span>3D Interactive Accents (Three.js)</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Renders subtle, lightweight WebGL geometric elements that respond to cursor movement.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={siteSettings.enable3D}
              onChange={(e) => handleToggle3D(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {siteSettings.enable3D && (
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
              3D Visual Style
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'torus', label: 'Torus Knot', desc: 'Smooth geometric knot with dual wireframe & phong core' },
                { id: 'particles', label: 'Starfield Cloud', desc: 'Floating cosmic particle sphere' },
                { id: 'rings', label: 'Gyroscopic Rings', desc: 'Triple concentric orbiting rings' },
              ].map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => handleThreeStyleChange(style.id as any)}
                  className={`p-3 rounded-xl text-left border transition-all ${
                    siteSettings.threeStyle === style.id
                      ? 'border-purple-500 bg-purple-50/50 dark:bg-purple-950/30'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="font-semibold text-xs text-slate-900 dark:text-white">{style.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Skills Display Style */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Box className="w-4 h-4 text-emerald-500" />
            <span>Skills Display Format</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Select the visual format for rendering skills on the frontend.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'cards', label: 'Bento Cards', desc: 'Cards with category & progress bar' },
            { id: 'bars', label: 'Linear Progress Bars', desc: 'Two-column horizontal meters' },
            { id: 'tags', label: 'Interactive Badges', desc: 'Minimalist pill tags' },
          ].map((style) => (
            <button
              key={style.id}
              type="button"
              onClick={() => handleSkillsStyleChange(style.id as any)}
              className={`p-3 rounded-xl text-left border transition-all ${
                siteSettings.skillsDisplayStyle === style.id
                  ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="font-semibold text-xs text-slate-900 dark:text-white">{style.label}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">{style.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Section Visibility Toggles */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Eye className="w-4 h-4 text-amber-500" />
            <span>Section Visibility</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turn sections on or off without deleting any content.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {Object.entries(siteSettings.sectionsVisibility).map(([key, isVisible]) => (
            <button
              key={key}
              type="button"
              onClick={() => handleSectionVisibility(key as any)}
              className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                isVisible
                  ? 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60'
                  : 'border-slate-200 dark:border-slate-800 opacity-50'
              }`}
            >
              <span className="text-xs font-semibold capitalize text-slate-800 dark:text-slate-200">
                {key}
              </span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                  isVisible
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                }`}
              >
                {isVisible ? 'Enabled' : 'Hidden'}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
