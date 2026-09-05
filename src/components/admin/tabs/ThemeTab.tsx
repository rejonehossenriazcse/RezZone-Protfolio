import React from 'react';
import { useCMS } from '../../../context/CMSContext';
import { THEME_PRESETS } from '../../../defaultData';
import { Palette, Sun, Moon, Sparkles } from 'lucide-react';

export const ThemeTab: React.FC = () => {
  const { cmsData, updateCMSData, setThemePreset, isDarkMode, toggleThemeMode } = useCMS();
  const { theme } = cmsData.siteSettings;

  const handleColorChange = (key: 'primaryColor' | 'secondaryColor' | 'accentColor', val: string) => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        theme: {
          ...prev.siteSettings.theme,
          [key]: val,
          presetName: 'Custom',
        },
      },
    }));
  };

  const handleLightModeColorChange = (
    key: 'background' | 'surface' | 'text' | 'mutedText' | 'border',
    val: string
  ) => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        theme: {
          ...prev.siteSettings.theme,
          presetName: 'Custom',
          lightMode: {
            ...prev.siteSettings.theme.lightMode,
            [key]: val,
          },
        },
      },
    }));
  };

  const handleDarkModeColorChange = (
    key: 'background' | 'surface' | 'text' | 'mutedText' | 'border',
    val: string
  ) => {
    updateCMSData((prev) => ({
      ...prev,
      siteSettings: {
        ...prev.siteSettings,
        theme: {
          ...prev.siteSettings.theme,
          presetName: 'Custom',
          darkMode: {
            ...prev.siteSettings.theme.darkMode,
            [key]: val,
          },
        },
      },
    }));
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Theme &amp; Color System
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Full control over brand accents, light mode palette, and dark mode palette. Changes apply instantly.
        </p>
      </div>

      {/* Theme Presets */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-500" />
              <span>Theme Presets</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Select a curated color scheme as a base, then fine-tune any color as you wish.
            </p>
          </div>
          {theme.presetName && (
            <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-900">
              Active: {theme.presetName}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {Object.entries(THEME_PRESETS).map(([key, preset]) => {
            const isSelected = theme.presetName === preset.presetName;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setThemePreset(key)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-1 ring-blue-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-inner"
                    style={{ backgroundColor: preset.primaryColor }}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-inner"
                    style={{ backgroundColor: preset.accentColor }}
                  />
                  <div
                    className="w-3.5 h-3.5 rounded-full shadow-inner"
                    style={{ backgroundColor: preset.darkMode.background }}
                  />
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white">
                  {preset.presetName}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Brand Accent Colors */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
          <Palette className="w-4 h-4 text-indigo-500" />
          <span>Brand Core Accents</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: 'primaryColor', label: 'Primary Accent', val: theme.primaryColor },
            { key: 'secondaryColor', label: 'Secondary Tone', val: theme.secondaryColor },
            { key: 'accentColor', label: 'Highlight / Accent', val: theme.accentColor },
          ].map((item) => (
            <div
              key={item.key}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60"
            >
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-2">
                {item.label}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={item.val}
                  onChange={(e) => handleColorChange(item.key as any, e.target.value)}
                  className="w-9 h-9 rounded-lg border-0 cursor-pointer p-0 bg-transparent"
                />
                <input
                  type="text"
                  value={item.val}
                  onChange={(e) => handleColorChange(item.key as any, e.target.value)}
                  className="w-full px-2.5 py-1 text-xs font-mono uppercase rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Light Mode vs Dark Mode Palette Customization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Light Mode Palette */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span>Light Mode Palette</span>
            </h3>
            {!isDarkMode && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                Active in Preview
              </span>
            )}
          </div>

          <div className="space-y-3">
            {[
              { key: 'background', label: 'Background' },
              { key: 'surface', label: 'Cards / Surface' },
              { key: 'text', label: 'Heading / Main Text' },
              { key: 'mutedText', label: 'Muted Text' },
              { key: 'border', label: 'Border Color' },
            ].map((field) => {
              const val = (theme.lightMode as any)[field.key] || '#ffffff';
              return (
                <div key={field.key} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{field.label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={val}
                      onChange={(e) => handleLightModeColorChange(field.key as any, e.target.value)}
                      className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleLightModeColorChange(field.key as any, e.target.value)}
                      className="w-20 px-2 py-1 text-xs font-mono uppercase rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Dark Mode Palette */}
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-400" />
              <span>Dark Mode Palette</span>
            </h3>
            {isDarkMode && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">
                Active in Preview
              </span>
            )}
          </div>

          <div className="space-y-3">
            {[
              { key: 'background', label: 'Background' },
              { key: 'surface', label: 'Cards / Surface' },
              { key: 'text', label: 'Heading / Main Text' },
              { key: 'mutedText', label: 'Muted Text' },
              { key: 'border', label: 'Border Color' },
            ].map((field) => {
              const val = (theme.darkMode as any)[field.key] || '#000000';
              return (
                <div key={field.key} className="flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">{field.label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={val}
                      onChange={(e) => handleDarkModeColorChange(field.key as any, e.target.value)}
                      className="w-7 h-7 rounded border-0 cursor-pointer p-0 bg-transparent"
                    />
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleDarkModeColorChange(field.key as any, e.target.value)}
                      className="w-20 px-2 py-1 text-xs font-mono uppercase rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Switcher Button */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40">
        <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">
          Toggle theme mode to test both palettes right now:
        </span>
        <button
          type="button"
          onClick={toggleThemeMode}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
        >
          {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-blue-500" />}
          <span>{isDarkMode ? 'Switch to Light' : 'Switch to Dark'}</span>
        </button>
      </div>
    </div>
  );
};
