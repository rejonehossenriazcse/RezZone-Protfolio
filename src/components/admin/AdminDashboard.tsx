import React, { useState } from 'react';
import { useCMS } from '../../context/CMSContext';
import {
  Sliders,
  Palette,
  User,
  Image as ImageIcon,
  GraduationCap,
  Code2,
  Globe,
  Share2,
  Inbox,
  ArrowLeft,
  Sun,
  Moon,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Save,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  LogOut,
} from 'lucide-react';

import { SiteSettingsTab } from './tabs/SiteSettingsTab';
import { ThemeTab } from './tabs/ThemeTab';
import { ProfileTab } from './tabs/ProfileTab';
import { MediaLibraryTab } from './tabs/MediaLibraryTab';
import { EducationTab } from './tabs/EducationTab';
import { SkillsTab } from './tabs/SkillsTab';
import { LanguagesTab } from './tabs/LanguagesTab';
import { SocialLinksTab } from './tabs/SocialLinksTab';
import { SocialPlatformsTab } from './tabs/SocialPlatformsTab';
import { AdminAuthTab } from './tabs/AdminAuthTab';
import { SubmissionsTab } from './tabs/SubmissionsTab';
import { AdminLoginPage } from './AdminLoginPage';

export const AdminDashboard: React.FC = () => {
  const {
    cmsData,
    isDarkMode,
    toggleThemeMode,
    navigateTo,
    saveStatus,
    saveError,
    refreshCMSData,
    saveToDatabase,
    isAuthenticated,
    logout,
  } = useCMS();
  const [activeTab, setActiveTab] = useState<string>('settings');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshCMSData();
    setIsRefreshing(false);
  };

  // Protected Route Guard
  if (!isAuthenticated) {
    return <AdminLoginPage />;
  }

  const TABS = [
    { id: 'settings', label: 'Site Settings', icon: Sliders },
    { id: 'theme', label: 'Theme & Colors', icon: Palette },
    { id: 'profile', label: 'Profile & Bio', icon: User },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'education', label: 'Education', icon: GraduationCap, badge: cmsData.education?.length },
    { id: 'skills', label: 'Skills', icon: Code2, badge: cmsData.skills?.length },
    { id: 'languages', label: 'Languages', icon: Globe, badge: cmsData.languages?.length },
    { id: 'social-hub', label: 'Socials Page Hub', icon: Share2, badge: cmsData.socialPlatforms?.length },
    { id: 'social', label: 'Nav & Quick Links', icon: Globe },
    {
      id: 'submissions',
      label: 'Submissions',
      icon: Inbox,
      badge: cmsData.contactSubmissions?.length ? cmsData.contactSubmissions.length : undefined,
    },
    { id: 'security', label: 'Security & Access', icon: ShieldCheck },
  ];

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'settings':
        return <SiteSettingsTab />;
      case 'theme':
        return <ThemeTab />;
      case 'profile':
        return <ProfileTab />;
      case 'media':
        return <MediaLibraryTab />;
      case 'education':
        return <EducationTab />;
      case 'skills':
        return <SkillsTab />;
      case 'languages':
        return <LanguagesTab />;
      case 'social-hub':
        return <SocialPlatformsTab />;
      case 'social':
        return <SocialLinksTab />;
      case 'submissions':
        return <SubmissionsTab />;
      case 'security':
        return <AdminAuthTab />;
      default:
        return <SiteSettingsTab />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-50 h-16 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800"
          >
            {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-xs">
              CMS
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                {cmsData.siteSettings.brandName || 'RezZone'}
              </span>
              <span className="text-[11px] font-medium text-slate-400 ml-1.5 hidden sm:inline">
                Control Studio
              </span>
            </div>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Sync status */}
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-1.5 text-xs text-amber-600 dark:text-amber-400 font-medium px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving to database...</span>
            </div>
          )}
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Saved to database</span>
            </div>
          )}
          {saveStatus === 'error' && (
            <button
              type="button"
              onClick={() => saveToDatabase()}
              className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400 font-medium px-2.5 py-1 rounded-full bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors"
              title={saveError || 'Click to retry saving to database'}
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Save error &bull; Retry</span>
            </button>
          )}
          {saveStatus === 'idle' && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Database synced</span>
            </div>
          )}

          {/* Manual Refresh from Database Button */}
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={isRefreshing || saveStatus === 'saving'}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors disabled:opacity-50"
            title="Fetch latest data from database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-500' : ''}`} />
          </button>

          {/* Manual Force Save Button */}
          <button
            type="button"
            onClick={() => saveToDatabase()}
            disabled={saveStatus === 'saving'}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all disabled:opacity-50"
            title="Force commit changes to database"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Save All</span>
          </button>

          {/* Theme preview toggle */}
          <button
            type="button"
            onClick={toggleThemeMode}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
            title={isDarkMode ? 'Switch to Light Palette' : 'Switch to Dark Palette'}
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-blue-500" />}
          </button>

          {/* View Socials Hub Button */}
          <button
            type="button"
            onClick={() => navigateTo('socials')}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors border border-slate-200 dark:border-slate-700"
            title="View Social Platforms Hub Page"
          >
            <Share2 className="w-3.5 h-3.5 text-blue-500" />
            <span>View Socials</span>
          </button>

          {/* View Live Portfolio Button */}
          <button
            type="button"
            onClick={() => navigateTo('portfolio')}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">View Portfolio</span>
            <span className="sm:hidden">Portfolio</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={logout}
            className="p-2 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/30 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            title="Sign Out of Admin"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:block w-64 border-r border-slate-200 dark:border-slate-800 p-4 space-y-1 shrink-0">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navigation
          </div>
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                </div>
                {tab.badge !== undefined && (
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-md font-mono ${
                      isActive
                        ? 'bg-blue-700 text-blue-100'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Mobile Drawer Navigation */}
        {mobileSidebarOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-black/50 flex">
            <div className="w-64 bg-white dark:bg-slate-900 h-full p-4 space-y-1 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 mb-3">
                <span className="font-bold text-sm">CMS Sections</span>
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded text-slate-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(tab.id);
                      setMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </div>
                    {tab.badge !== undefined && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-mono">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content Canvas */}
        <main className="flex-1 p-4 sm:p-8 overflow-y-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};
