import React, { useState, useEffect } from 'react';
import { useCMS } from '../../context/CMSContext';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowLeft, AlertCircle, CheckCircle2, Clock, ShieldAlert } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, loginWithGoogle, authConfig, navigateTo, checkLockoutStatus } = useCMS();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Brute-force & Lockout state
  const [isLocked, setIsLocked] = useState(false);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);
  const [remainingTimeText, setRemainingTimeText] = useState<string>('');
  const [remainingAttempts, setRemainingAttempts] = useState<number | null>(null);

  // Google Sign-in modal state
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [googleEmailInput, setGoogleEmailInput] = useState('');
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Check initial lockout status on mount
  useEffect(() => {
    checkLockoutStatus().then((status) => {
      if (status.isLocked && status.lockedUntil) {
        setIsLocked(true);
        setLockedUntil(status.lockedUntil);
        setRemainingAttempts(0);
      } else {
        setIsLocked(false);
        setLockedUntil(null);
        setRemainingAttempts(status.remainingAttempts);
      }
    });
  }, [checkLockoutStatus]);

  // Live countdown timer when locked
  useEffect(() => {
    if (!isLocked || !lockedUntil) {
      setRemainingTimeText('');
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const diffSec = Math.ceil((lockedUntil - now) / 1000);

      if (diffSec <= 0) {
        // Cooldown period expired! Automatically re-enable inputs and reset attempt counter
        setIsLocked(false);
        setLockedUntil(null);
        setRemainingAttempts(5);
        setRemainingTimeText('');
        setError(null);
        setSuccessNotice('Cooldown period expired. Login inputs have been re-enabled.');
        setTimeout(() => setSuccessNotice(null), 6000);
        return;
      }

      const m = Math.floor(diffSec / 60);
      const s = diffSec % 60;
      setRemainingTimeText(`${m}m ${s < 10 ? '0' : ''}${s}s`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockedUntil]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLocked) {
      return;
    }

    if (!email.trim() || !password) {
      setError('Please enter both your administrator email and password.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessNotice(null);

    try {
      const res = await login(email.trim(), password);
      if (!res.success) {
        if (res.isLocked && res.lockedUntil) {
          setIsLocked(true);
          setLockedUntil(res.lockedUntil);
          setRemainingAttempts(0);
          setError(res.error || 'Account temporarily locked due to too many failed attempts.');
        } else {
          if (typeof res.remainingAttempts === 'number') {
            setRemainingAttempts(res.remainingAttempts);
          }
          setError(res.error || 'Invalid administrator credentials. Access denied.');
        }
      } else {
        // Successful login: counter is reset
        setIsLocked(false);
        setLockedUntil(null);
        setRemainingAttempts(5);
      }
    } catch {
      setError('An error occurred during authentication. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async (chosenEmail: string) => {
    setGoogleLoading(true);
    setGoogleError(null);

    try {
      const res = await loginWithGoogle(chosenEmail.trim());
      if (res.success) {
        setIsGoogleModalOpen(false);
      } else {
        setGoogleError(res.error || 'Unauthorized Google account.');
      }
    } catch {
      setGoogleError('Failed to authenticate with Google.');
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div
      id="admin-login-page"
      className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12 transition-colors duration-200"
      style={{
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Background radial highlight */}
      <div
        className="fixed inset-0 pointer-events-none filter blur-3xl opacity-20 -z-10"
        style={{
          background: `radial-gradient(circle at 50% 35%, var(--color-primary) 0%, transparent 60%)`,
        }}
      />

      <div className="w-full max-w-md">
        {/* Back to Portfolio Link */}
        <div className="mb-6 flex justify-between items-center">
          <button
            id="back-to-portfolio-btn"
            type="button"
            onClick={() => navigateTo('portfolio')}
            className="inline-flex items-center gap-2 text-xs font-medium transition-colors hover:opacity-100"
            style={{ color: 'var(--color-muted)' }}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Portfolio</span>
          </button>

          <span
            className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full border"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-muted)',
            }}
          >
            Encrypted CMS
          </span>
        </div>

        {/* Card Container */}
        <div
          id="login-card"
          className="p-8 sm:p-10 rounded-2xl shadow-xl transition-all border"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderColor: 'var(--color-border)',
          }}
        >
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div
              className="inline-flex items-center justify-center w-12 h-12 rounded-2xl shadow-sm mx-auto"
              style={{
                backgroundColor: isLocked
                  ? 'rgba(239, 68, 68, 0.15)'
                  : `color-mix(in srgb, var(--color-primary) 15%, transparent)`,
                color: isLocked ? '#ef4444' : 'var(--color-primary)',
                border: isLocked
                  ? '1px solid rgba(239, 68, 68, 0.3)'
                  : `1px solid color-mix(in srgb, var(--color-primary) 30%, transparent)`,
              }}
            >
              {isLocked ? <ShieldAlert className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Admin Authentication
            </h1>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Sign in with your authorized administrator credentials to manage your portfolio content.
            </p>
          </div>

          {/* TEMPORARY LOCKOUT BANNER (Live Countdown) */}
          {isLocked && (
            <div
              id="lockout-countdown-banner"
              className="mb-6 p-4 rounded-xl text-xs bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800/80 shadow-sm space-y-2.5 animate-pulse"
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <Clock className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>Security Lockout Active</span>
              </div>
              <p className="leading-relaxed text-red-600 dark:text-red-300">
                Account temporarily locked due to too many failed attempts. Try again in{' '}
                <span className="font-mono font-bold text-red-700 dark:text-red-100 bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded border border-red-300 dark:border-red-700">
                  {remainingTimeText || 'calculating...'}
                </span>
              </p>
              <p className="text-[11px] opacity-80">
                Form inputs and login submission are disabled for security during the cooldown period.
              </p>
            </div>
          )}

          {/* Success / Cooldown Expired Notice */}
          {successNotice && (
            <div
              id="login-success-notice"
              className="mb-6 p-3.5 rounded-xl text-xs flex items-start gap-2.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/60"
            >
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <div className="flex-1 font-medium leading-relaxed">{successNotice}</div>
            </div>
          )}

          {/* Error Alert */}
          {error && !isLocked && (
            <div
              id="login-error-alert"
              className="mb-6 p-3.5 rounded-xl text-xs flex items-start gap-2.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Remaining Attempts Indicator (if attempts < 5 and not locked) */}
          {!isLocked && remainingAttempts !== null && remainingAttempts < 5 && (
            <div
              id="remaining-attempts-badge"
              className="mb-4 px-3 py-1.5 rounded-lg text-xs flex items-center justify-between border bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800/50 font-medium"
            >
              <span>Brute-force protection:</span>
              <span className="font-semibold">
                {remainingAttempts} attempt{remainingAttempts === 1 ? '' : 's'} remaining
              </span>
            </div>
          )}

          {/* Login Form (Disabled if locked) */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="admin-email-input"
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--color-text)' }}
              >
                Admin ID or Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="admin-email-input"
                  type="text"
                  value={email}
                  disabled={isLoading || isLocked}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  placeholder="Admin ID or email"
                  required
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-sm transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800"
                  style={{
                    backgroundColor: isLocked ? undefined : 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="admin-password-input"
                className="block text-xs font-semibold uppercase tracking-wider mb-1.5"
                style={{ color: 'var(--color-text)' }}
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={isLoading || isLocked}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-11 py-2.5 rounded-xl text-sm transition-colors border focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-100 dark:disabled:bg-slate-800"
                  style={{
                    backgroundColor: isLocked ? undefined : 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
                <button
                  type="button"
                  id="toggle-password-visibility-btn"
                  disabled={isLocked}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button (Disabled if locked) */}
            <button
              id="admin-login-submit-btn"
              type="submit"
              disabled={isLoading || isLocked}
              className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all duration-150 shadow-sm hover:shadow active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                backgroundColor: isLocked ? '#94a3b8' : 'var(--color-primary)',
              }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : isLocked ? (
                <>
                  <Clock className="w-4 h-4" />
                  <span>Temporarily Locked ({remainingTimeText || '15m'})</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          {/* Google Sign-in Option */}
          {authConfig.googleAuthEnabled && (
            <div className="mt-6 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="relative flex justify-center text-xs uppercase mb-4">
                <span
                  className="px-2 text-slate-400 dark:text-slate-500 font-medium"
                  style={{ backgroundColor: 'var(--color-surface)' }}
                >
                  Or authorize with
                </span>
              </div>

              <button
                id="google-signin-btn"
                type="button"
                onClick={() => {
                  setGoogleEmailInput(authConfig.authorizedGoogleEmails?.[0] || '');
                  setGoogleError(null);
                  setIsGoogleModalOpen(true);
                }}
                className="w-full py-2.5 px-4 rounded-xl text-sm font-medium transition-all duration-150 border flex items-center justify-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                {/* Official Google 'G' Logo SVG */}
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>
          )}
        </div>

        {/* Security Footnote */}
        <p className="text-center text-[11px] text-slate-400 dark:text-slate-500 mt-6">
          Access is monitored and restricted to authorized administrative accounts only.
        </p>
      </div>

      {/* Google Sign-in Dialog Modal */}
      {isGoogleModalOpen && (
        <div
          id="google-auth-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in"
        >
          <div
            className="w-full max-w-sm rounded-2xl p-6 shadow-2xl border transition-all"
            style={{
              backgroundColor: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-sm border border-slate-200">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-sm text-slate-900 dark:text-white">
                  Google Account Verification
                </h3>
                <p className="text-xs text-slate-500">Sign in with authorized Google email</p>
              </div>
            </div>

            {googleError && (
              <div className="mb-4 p-3 rounded-xl text-xs bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 flex items-start gap-2">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                <div className="flex-1">{googleError}</div>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-slate-700 dark:text-slate-300">
                  Google Account Email
                </label>
                <input
                  type="email"
                  value={googleEmailInput}
                  onChange={(e) => setGoogleEmailInput(e.target.value)}
                  placeholder="your-google-account@gmail.com"
                  className="w-full px-3 py-2 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-blue-500"
                  style={{
                    backgroundColor: 'var(--color-bg)',
                    borderColor: 'var(--color-border)',
                    color: 'var(--color-text)',
                  }}
                />
              </div>

              {/* Quick-select if authorized emails are configured */}
              {authConfig.authorizedGoogleEmails && authConfig.authorizedGoogleEmails.length > 0 && (
                <div>
                  <div className="text-[11px] font-medium text-slate-500 mb-1.5">Authorized Accounts:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {authConfig.authorizedGoogleEmails.map((acc) => (
                      <button
                        key={acc}
                        type="button"
                        onClick={() => setGoogleEmailInput(acc)}
                        className="text-xs px-2.5 py-1 rounded-lg border text-left transition-colors hover:border-blue-500"
                        style={{
                          backgroundColor: googleEmailInput === acc ? 'var(--color-primary)' : 'var(--color-bg)',
                          color: googleEmailInput === acc ? '#ffffff' : 'var(--color-text)',
                          borderColor: 'var(--color-border)',
                        }}
                      >
                        {acc}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsGoogleModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={googleLoading || !googleEmailInput.trim()}
                onClick={() => handleGoogleSignIn(googleEmailInput)}
                className="px-4 py-1.5 rounded-xl text-xs font-semibold text-white disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {googleLoading ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Authorize</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
