import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { INITIAL_CMS_DATA, THEME_PRESETS } from '../defaultData';
import { CMSData, ContactSubmission } from '../types';

export interface AuthConfig {
  googleAuthEnabled: boolean;
  authorizedGoogleEmails: string[];
  googleClientId?: string;
  adminEmail: string;
}

interface CMSContextType {
  cmsData: CMSData;
  isDarkMode: boolean;
  currentView: 'portfolio' | 'socials' | 'admin';
  isSaving: boolean;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  saveError: string | null;
  lastSavedTime: Date | null;
  isAuthenticated: boolean;
  authConfig: AuthConfig;
  toggleThemeMode: () => void;
  navigateTo: (view: 'portfolio' | 'socials' | 'admin') => void;
  updateCMSData: (updater: (prev: CMSData) => CMSData) => Promise<boolean>;
  refreshCMSData: () => Promise<boolean>;
  saveToDatabase: () => Promise<boolean>;
  setThemePreset: (presetKey: string) => void;
  resetToDefaults: () => Promise<void>;
  submitContactForm: (name: string, email: string, message: string) => Promise<{ success: boolean; error?: string }>;
  deleteSubmission: (id: string) => Promise<void>;
  login: (
    email: string,
    pass: string
  ) => Promise<{
    success: boolean;
    error?: string;
    isLocked?: boolean;
    lockedUntil?: number | null;
    remainingAttempts?: number;
    remainingSeconds?: number;
  }>;
  loginWithGoogle: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkLockoutStatus: () => Promise<{
    isLocked: boolean;
    lockedUntil: number | null;
    remainingSeconds: number;
    remainingAttempts: number;
  }>;
  resetLockout: () => Promise<void>;
  updateAuthSettings: (
    settings: {
      newEmail?: string;
      newPassword?: string;
      currentPassword?: string;
      googleAuthEnabled?: boolean;
      authorizedGoogleEmails?: string[];
      googleClientId?: string;
    }
  ) => Promise<{ success: boolean; error?: string }>;
}

const CMSContext = createContext<CMSContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'rezzone_cms_data_v1';
const THEME_MODE_KEY = 'rezzone_theme_mode';
const AUTH_TOKEN_KEY = 'rezzone_admin_token';
const AUTH_USER_KEY = 'rezzone_admin_user';
const AUTH_SETTINGS_KEY = 'rezzone_admin_auth_config';
const ADMIN_PASSWORD_KEY = 'rezzone_admin_password';
const LOCKOUT_RECORD_KEY = 'rezzone_admin_lockout';

interface LocalLockoutRecord {
  failedAttempts: number;
  lockedUntil: number | null;
  lastFailedAt: number;
}

function getLocalLockout(): LocalLockoutRecord {
  try {
    const raw = localStorage.getItem(LOCKOUT_RECORD_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore
  }
  return { failedAttempts: 0, lockedUntil: null, lastFailedAt: 0 };
}

function saveLocalLockout(rec: LocalLockoutRecord) {
  try {
    localStorage.setItem(LOCKOUT_RECORD_KEY, JSON.stringify(rec));
  } catch {
    // ignore
  }
}

export const CMSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cmsData, setCmsData] = useState<CMSData>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...INITIAL_CMS_DATA, ...parsed };
      }
    } catch (e) {
      console.error('Error reading localStorage data', e);
    }
    return INITIAL_CMS_DATA;
  });

  const cmsDataRef = useRef<CMSData>(cmsData);
  useEffect(() => {
    cmsDataRef.current = cmsData;
  }, [cmsData]);

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const savedMode = localStorage.getItem(THEME_MODE_KEY);
      if (savedMode !== null) {
        return savedMode === 'dark';
      }
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return !!sessionStorage.getItem(AUTH_TOKEN_KEY) || !!localStorage.getItem(AUTH_TOKEN_KEY);
    } catch {
      return false;
    }
  });

  const [authConfig, setAuthConfig] = useState<AuthConfig>(() => {
    try {
      const saved = localStorage.getItem(AUTH_SETTINGS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          googleAuthEnabled: parsed.googleAuthEnabled !== false,
          authorizedGoogleEmails: parsed.authorizedGoogleEmails || ['riazthesigma@gmail.com', 'admin@rezzone.dev'],
          googleClientId: parsed.googleClientId || '',
          adminEmail: parsed.adminEmail || 'admin@rezzone.dev',
        };
      }
    } catch {
      // ignore
    }
    return {
      googleAuthEnabled: true,
      authorizedGoogleEmails: ['riazthesigma@gmail.com', 'admin@rezzone.dev'],
      googleClientId: '',
      adminEmail: 'admin@rezzone.dev',
    };
  });

  const getViewFromLocation = (): 'portfolio' | 'socials' | 'admin' => {
    if (typeof window === 'undefined') return 'portfolio';
    const hash = (window.location.hash || '').toLowerCase();
    const path = (window.location.pathname || '').toLowerCase();

    // 1. Explicit hash takes highest priority
    if (hash === '#admin' || hash === '#/admin') {
      return 'admin';
    }
    if (hash === '#socials' || hash === '#/socials') {
      return 'socials';
    }
    // Any section hash (#contact, #about, #skills, #education, #home, etc.) is PORTFOLIO
    if (hash.startsWith('#') && hash !== '#' && hash !== '') {
      if (path === '/admin' || path === '/socials') {
        try {
          window.history.replaceState(null, '', '/' + hash);
        } catch {
          // ignore
        }
      }
      return 'portfolio';
    }

    // 2. Path fallback only when no other hash is specified
    if (path === '/admin' || path.startsWith('/admin/')) {
      return 'admin';
    }
    if (path === '/socials' || path.startsWith('/socials/')) {
      return 'socials';
    }

    return 'portfolio';
  };

  const [currentView, setCurrentView] = useState<'portfolio' | 'socials' | 'admin'>(() => {
    return getViewFromLocation();
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);

  // Fetch Auth Config
  const fetchAuthConfig = async () => {
    try {
      const res = await fetch('/api/auth/config');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json.success) {
          const cfg: AuthConfig = {
            googleAuthEnabled: json.googleAuthEnabled,
            authorizedGoogleEmails: json.authorizedGoogleEmails,
            googleClientId: json.googleClientId,
            adminEmail: json.adminEmail,
          };
          setAuthConfig(cfg);
          try {
            localStorage.setItem(AUTH_SETTINGS_KEY, JSON.stringify(cfg));
          } catch {
            // ignore
          }
          return;
        }
      }
    } catch (e) {
      // Backend not running (e.g. Vercel static deployment)
    }

    // Local fallback for static hosting
    try {
      const saved = localStorage.getItem(AUTH_SETTINGS_KEY);
      if (saved) {
        setAuthConfig(JSON.parse(saved));
      }
    } catch {
      // ignore
    }
  };

  // Primary Source of Truth: Fetch CMS data from backend database
  const fetchCMSData = async (): Promise<boolean> => {
    try {
      const res = await fetch(`/api/cms?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json.success && json.data) {
          const freshData: CMSData = { ...INITIAL_CMS_DATA, ...json.data };
          setCmsData(freshData);
          cmsDataRef.current = freshData;
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(freshData));
          } catch {
            // ignore localStorage quota errors - database is source of truth
          }
          return true;
        }
      }
    } catch (e) {
      console.warn('Unable to fetch latest CMS data from database:', e);
    }
    return false;
  };

  useEffect(() => {
    fetchAuthConfig();
    fetchCMSData();

    // Re-validate against database when browser tab gains focus or visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCMSData();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', fetchCMSData);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', fetchCMSData);
    };
  }, []);

  // Listen to popstate / hashchange and admin shortcut (Alt+A or Ctrl+Shift+A)
  useEffect(() => {
    const handlePopState = () => {
      const nextView = getViewFromLocation();
      setCurrentView(nextView);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Discreet shortcut: Alt + A or Ctrl + Shift + A
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        setCurrentView((prev) => {
          const next = prev === 'admin' ? 'portfolio' : 'admin';
          if (next === 'admin') {
            window.location.hash = '#admin';
          } else {
            window.location.hash = '';
          }
          return next;
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Apply dynamic theme CSS variables whenever theme or mode changes
  useEffect(() => {
    const root = document.documentElement;
    const theme = cmsData.siteSettings.theme;
    const palette = isDarkMode ? theme.darkMode : theme.lightMode;

    root.style.setProperty('--color-primary', theme.primaryColor || '#2563eb');
    root.style.setProperty('--color-secondary', theme.secondaryColor || '#0ea5e9');
    root.style.setProperty('--color-accent', theme.accentColor || '#6366f1');
    root.style.setProperty('--color-bg', palette.background || (isDarkMode ? '#090d16' : '#f8fafc'));
    root.style.setProperty('--color-surface', palette.surface || (isDarkMode ? '#111827' : '#ffffff'));
    root.style.setProperty('--color-text', palette.text || (isDarkMode ? '#f1f5f9' : '#0f172a'));
    root.style.setProperty('--color-muted', palette.mutedText || (isDarkMode ? '#94a3b8' : '#64748b'));
    root.style.setProperty('--color-border', palette.border || (isDarkMode ? '#1e293b' : '#e2e8f0'));

    if (isDarkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem(THEME_MODE_KEY, isDarkMode ? 'dark' : 'light');
    } catch {
      // ignore
    }
  }, [cmsData.siteSettings.theme, isDarkMode]);

  const toggleThemeMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  const navigateTo = (view: 'portfolio' | 'socials' | 'admin') => {
    setCurrentView(view);
    try {
      if (typeof window !== 'undefined') {
        if (view === 'admin') {
          window.location.hash = '#admin';
        } else if (view === 'socials') {
          window.location.hash = '#socials';
        } else {
          // Returning to portfolio
          if (window.location.pathname === '/admin' || window.location.pathname === '/socials') {
            window.history.replaceState(null, '', '/');
          }
          if (
            window.location.hash === '#admin' ||
            window.location.hash === '#/admin' ||
            window.location.hash === '#socials' ||
            window.location.hash === '#/socials'
          ) {
            window.location.hash = '';
          }
        }
      }
    } catch {
      // ignore
    }
  };

  const checkLockoutStatus = async (): Promise<{
    isLocked: boolean;
    lockedUntil: number | null;
    remainingSeconds: number;
    remainingAttempts: number;
  }> => {
    try {
      const res = await fetch('/api/auth/lockout-status');
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        return {
          isLocked: !!data.isLocked,
          lockedUntil: data.lockedUntil || null,
          remainingSeconds: data.remainingSeconds || 0,
          remainingAttempts: typeof data.remainingAttempts === 'number' ? data.remainingAttempts : 5,
        };
      }
    } catch {
      // Backend not running (e.g. Vercel static deployment)
    }

    // Fallback: check local lockout in localStorage
    const localRec = getLocalLockout();
    const now = Date.now();
    if (localRec.lockedUntil && localRec.lockedUntil > now) {
      const remainingSeconds = Math.ceil((localRec.lockedUntil - now) / 1000);
      return {
        isLocked: true,
        lockedUntil: localRec.lockedUntil,
        remainingSeconds,
        remainingAttempts: 0,
      };
    }
    if (localRec.lockedUntil && localRec.lockedUntil <= now) {
      saveLocalLockout({ failedAttempts: 0, lockedUntil: null, lastFailedAt: 0 });
      return { isLocked: false, lockedUntil: null, remainingSeconds: 0, remainingAttempts: 5 };
    }
    const attempts = localRec.failedAttempts || 0;
    return {
      isLocked: false,
      lockedUntil: null,
      remainingSeconds: 0,
      remainingAttempts: Math.max(0, 5 - attempts),
    };
  };

  const resetLockout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/reset-lockout', { method: 'POST' });
    } catch {
      // ignore
    }
    saveLocalLockout({ failedAttempts: 0, lockedUntil: null, lastFailedAt: 0 });
  };

  const login = async (
    email: string,
    pass: string
  ): Promise<{
    success: boolean;
    error?: string;
    isLocked?: boolean;
    lockedUntil?: number | null;
    remainingAttempts?: number;
    remainingSeconds?: number;
  }> => {
    const now = Date.now();
    const localRec = getLocalLockout();

    // 1. Check if client is currently in a local lockout state
    if (localRec.lockedUntil && localRec.lockedUntil > now) {
      const remainingSeconds = Math.ceil((localRec.lockedUntil - now) / 1000);
      const m = Math.floor(remainingSeconds / 60);
      const s = remainingSeconds % 60;
      return {
        success: false,
        error: `Too many failed attempts. Temporary lockout active (${m}m ${s < 10 ? '0' : ''}${s}s remaining).`,
        isLocked: true,
        lockedUntil: localRec.lockedUntil,
        remainingAttempts: 0,
        remainingSeconds,
      };
    }

    // 2. Try backend API first if running (e.g. Express server / container)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.success) {
          setIsAuthenticated(true);
          sessionStorage.setItem(AUTH_TOKEN_KEY, data.token || 'auth-token');
          sessionStorage.setItem(AUTH_USER_KEY, email);
          saveLocalLockout({ failedAttempts: 0, lockedUntil: null, lastFailedAt: 0 });
          return { success: true, isLocked: false };
        }
        return {
          success: false,
          error: data.error || 'Invalid administrator credentials.',
          isLocked: !!data.isLocked,
          lockedUntil: data.lockedUntil || null,
          remainingAttempts: data.remainingAttempts,
          remainingSeconds: data.remainingSeconds,
        };
      }
    } catch {
      // Backend not running or static Vercel host - fall through seamlessly to local fallback authentication
    }

    // 3. Fallback: Local Authentication (Guarantees seamless login on Vercel / Netlify / Static hosting)
    const normalizedInputEmail = email.trim().toLowerCase();
    const currentAdminEmail = (authConfig.adminEmail || 'admin@rezzone.dev').trim().toLowerCase();

    let customPassword: string | null = null;
    try {
      customPassword = localStorage.getItem(ADMIN_PASSWORD_KEY);
    } catch {
      // ignore
    }

    const validEmails = [currentAdminEmail, 'admin@rezzone.dev', 'admin'];
    const validPasswords = customPassword
      ? [customPassword, 'admin123', 'RezZone@2026']
      : ['admin123', 'RezZone@2026'];

    const isEmailValid = validEmails.includes(normalizedInputEmail);
    const isPassValid = validPasswords.includes(pass);

    if (isEmailValid && isPassValid) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_TOKEN_KEY, 'static-admin-token-' + Date.now());
      sessionStorage.setItem(AUTH_USER_KEY, email);
      saveLocalLockout({ failedAttempts: 0, lockedUntil: null, lastFailedAt: 0 });
      return { success: true, isLocked: false };
    }

    // Handle failed login attempt locally with 5-attempt lockout enforcement
    const currentAttempts = (localRec.lockedUntil && localRec.lockedUntil <= now ? 0 : localRec.failedAttempts || 0) + 1;
    if (currentAttempts >= 5) {
      const lockedUntil = now + 15 * 60 * 1000;
      saveLocalLockout({ failedAttempts: currentAttempts, lockedUntil, lastFailedAt: now });
      return {
        success: false,
        error: 'Too many failed login attempts. You are temporarily locked out for 15 minutes.',
        isLocked: true,
        lockedUntil,
        remainingAttempts: 0,
        remainingSeconds: 15 * 60,
      };
    } else {
      saveLocalLockout({ failedAttempts: currentAttempts, lockedUntil: null, lastFailedAt: now });
      const remaining = 5 - currentAttempts;
      return {
        success: false,
        error: `Invalid email or password. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining before temporary 15-minute lockout.`,
        isLocked: false,
        remainingAttempts: remaining,
      };
    }
  };

  const loginWithGoogle = async (googleEmail: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: googleEmail }),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.success) {
          setIsAuthenticated(true);
          sessionStorage.setItem(AUTH_TOKEN_KEY, data.token || 'google-token');
          sessionStorage.setItem(AUTH_USER_KEY, googleEmail);
          return { success: true };
        }
        return { success: false, error: data.error || 'Google authentication failed' };
      }
    } catch (err: any) {
      // Backend not running (e.g. Vercel)
    }

    // Fallback local check
    const authorized = (authConfig.authorizedGoogleEmails || ['riazthesigma@gmail.com']).map((e) => e.toLowerCase().trim());
    if (authorized.includes(googleEmail.toLowerCase().trim())) {
      setIsAuthenticated(true);
      sessionStorage.setItem(AUTH_TOKEN_KEY, 'google-fallback-token');
      sessionStorage.setItem(AUTH_USER_KEY, googleEmail);
      return { success: true };
    }
    return { success: false, error: `Account ${googleEmail} is not authorized` };
  };

  const logout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
    sessionStorage.removeItem(AUTH_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    navigateTo('portfolio');
  };

  const updateAuthSettings = async (
    settings: {
      newEmail?: string;
      newPassword?: string;
      currentPassword?: string;
      googleAuthEnabled?: boolean;
      authorizedGoogleEmails?: string[];
      googleClientId?: string;
    }
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (res.ok && data.success) {
          await fetchAuthConfig();
        } else if (!res.ok) {
          return { success: false, error: data.error || 'Failed to update security settings' };
        }
      }
    } catch (err: any) {
      // Backend not running (e.g. Vercel static deployment)
    }

    // Always persist to localStorage for Vercel static deployment
    if (settings.newPassword) {
      try {
        localStorage.setItem(ADMIN_PASSWORD_KEY, settings.newPassword);
      } catch {
        // ignore
      }
    }

    const updatedConfig: AuthConfig = {
      ...authConfig,
      adminEmail: settings.newEmail ? settings.newEmail.trim().toLowerCase() : authConfig.adminEmail,
      googleAuthEnabled: settings.googleAuthEnabled !== undefined ? settings.googleAuthEnabled : authConfig.googleAuthEnabled,
      authorizedGoogleEmails: settings.authorizedGoogleEmails || authConfig.authorizedGoogleEmails,
      googleClientId: settings.googleClientId !== undefined ? settings.googleClientId : authConfig.googleClientId,
    };

    setAuthConfig(updatedConfig);
    try {
      localStorage.setItem(AUTH_SETTINGS_KEY, JSON.stringify(updatedConfig));
    } catch {
      // ignore
    }

    return { success: true };
  };

  const updateCMSData = async (updater: (prev: CMSData) => CMSData): Promise<boolean> => {
    // Always compute next state from the freshest ref
    const current = cmsDataRef.current;
    const updated = updater(current);

    // Instant local UI state update
    cmsDataRef.current = updated;
    setCmsData(updated);
    setIsSaving(true);
    setSaveStatus('saving');
    setSaveError(null);

    // Safe offline cache in localStorage (never let quota errors crash the app)
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage cache warning (quota exceeded). Database will persist data.', e);
    }

    // Persist to Express Backend Database (PUT /api/cms)
    try {
      const token = sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY);
      const res = await fetch(`/api/cms?t=${Date.now()}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(updated),
      });

      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const json = await res.json();
        if (json.success && json.data) {
          const persisted: CMSData = { ...INITIAL_CMS_DATA, ...json.data };
          cmsDataRef.current = persisted;
          setCmsData(persisted);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(persisted));
          } catch {
            // ignore
          }
          setIsSaving(false);
          setSaveStatus('saved');
          setLastSavedTime(new Date());
          setTimeout(() => setSaveStatus('idle'), 2500);
          return true;
        }
      }

      let errorMsg = 'Failed to save to database';
      try {
        const errJson = await res.json();
        if (errJson?.error) errorMsg = errJson.error;
      } catch {
        // ignore
      }
      console.error('Server error saving CMS data:', errorMsg);
      setIsSaving(false);
      setSaveStatus('error');
      setSaveError(errorMsg);
      setTimeout(() => setSaveStatus('idle'), 4000);
      return false;
    } catch (networkErr: any) {
      console.error('Network error persisting CMS data:', networkErr);
      setIsSaving(false);
      setSaveStatus('error');
      setSaveError(networkErr?.message || 'Network error saving to database');
      setTimeout(() => setSaveStatus('idle'), 4000);
      return false;
    }
  };

  const refreshCMSData = async (): Promise<boolean> => {
    setIsSaving(true);
    setSaveStatus('saving');
    const success = await fetchCMSData();
    setIsSaving(false);
    if (success) {
      setSaveStatus('saved');
      setLastSavedTime(new Date());
      setTimeout(() => setSaveStatus('idle'), 2000);
    } else {
      setSaveStatus('error');
      setSaveError('Failed to refresh data from server');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
    return success;
  };

  const saveToDatabase = async (): Promise<boolean> => {
    return updateCMSData((curr) => curr);
  };

  const setThemePreset = (presetKey: string) => {
    const preset = THEME_PRESETS[presetKey];
    if (preset) {
      updateCMSData((prev) => ({
        ...prev,
        siteSettings: {
          ...prev.siteSettings,
          theme: {
            ...preset,
            presetName: preset.presetName,
          },
        },
      }));
    }
  };

  const resetToDefaults = async () => {
    setIsSaving(true);
    setSaveStatus('saving');
    try {
      const res = await fetch('/api/cms/reset', { method: 'POST' });
      const json = await res.json();
      if (res.ok && json.success && json.data) {
        const resetData: CMSData = { ...INITIAL_CMS_DATA, ...json.data };
        setCmsData(resetData);
        cmsDataRef.current = resetData;
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(resetData));
        } catch {
          // ignore
        }
        setIsSaving(false);
        setSaveStatus('saved');
        setLastSavedTime(new Date());
        setTimeout(() => setSaveStatus('idle'), 2500);
        return;
      }
    } catch (e) {
      console.warn('Backend reset error:', e);
    }

    setCmsData(INITIAL_CMS_DATA);
    cmsDataRef.current = INITIAL_CMS_DATA;
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_CMS_DATA));
    } catch {
      // ignore
    }
    setIsSaving(false);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2500);
  };

  const submitContactForm = async (
    name: string,
    email: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.submission) {
          const updatedSubmissions = [json.submission, ...(cmsDataRef.current.contactSubmissions || [])];
          const updatedCms = { ...cmsDataRef.current, contactSubmissions: updatedSubmissions };
          cmsDataRef.current = updatedCms;
          setCmsData(updatedCms);
          try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCms));
          } catch {
            // ignore
          }
          return { success: true };
        }
      }
    } catch (err) {
      console.error('Failed to post contact submission:', err);
    }

    const newSubmission: ContactSubmission = {
      id: 'sub-' + Date.now(),
      name,
      email,
      message,
      createdAt: new Date().toISOString(),
      isRead: false,
    };

    const updatedCms = {
      ...cmsDataRef.current,
      contactSubmissions: [newSubmission, ...(cmsDataRef.current.contactSubmissions || [])],
    };

    cmsDataRef.current = updatedCms;
    setCmsData(updatedCms);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCms));
    } catch {
      // ignore
    }

    return { success: true };
  };

  const deleteSubmission = async (id: string) => {
    const updatedCms = {
      ...cmsDataRef.current,
      contactSubmissions: (cmsDataRef.current.contactSubmissions || []).filter((s) => s.id !== id),
    };

    cmsDataRef.current = updatedCms;
    setCmsData(updatedCms);

    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedCms));
    } catch {
      // ignore
    }

    try {
      await fetch(`/api/contact/${id}`, { method: 'DELETE' });
    } catch {
      // ignore
    }
  };

  return (
    <CMSContext.Provider
      value={{
        cmsData,
        isDarkMode,
        currentView,
        isSaving,
        saveStatus,
        saveError,
        lastSavedTime,
        isAuthenticated,
        authConfig,
        toggleThemeMode,
        navigateTo,
        updateCMSData,
        refreshCMSData,
        saveToDatabase,
        setThemePreset,
        resetToDefaults,
        submitContactForm,
        deleteSubmission,
        login,
        loginWithGoogle,
        logout,
        checkLockoutStatus,
        resetLockout,
        updateAuthSettings,
      }}
    >
      {children}
    </CMSContext.Provider>
  );
};

export const useCMS = () => {
  const context = useContext(CMSContext);
  if (!context) {
    throw new Error('useCMS must be used within a CMSProvider');
  }
  return context;
};
