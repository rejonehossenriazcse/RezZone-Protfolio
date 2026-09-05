import React, { useState, useEffect } from 'react';
import { useCMS } from '../../../context/CMSContext';
import {
  ShieldCheck,
  Lock,
  Mail,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Key,
  LogOut,
  Sparkles,
} from 'lucide-react';

export const AdminAuthTab: React.FC = () => {
  const { authConfig, updateAuthSettings, logout } = useCMS();

  // Google settings state
  const [googleEnabled, setGoogleEnabled] = useState(authConfig.googleAuthEnabled);
  const [newGoogleEmail, setNewGoogleEmail] = useState('');
  const [googleEmailsList, setGoogleEmailsList] = useState<string[]>(
    authConfig.authorizedGoogleEmails || ['riazthesigma@gmail.com']
  );
  const [googleClientId, setGoogleClientId] = useState(authConfig.googleClientId || '');

  // Credentials change state
  const [newAdminEmail, setNewAdminEmail] = useState(authConfig.adminEmail || 'admin@rezzone.dev');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (authConfig.adminEmail) {
      setNewAdminEmail(authConfig.adminEmail);
    }
  }, [authConfig.adminEmail]);

  const handleAddGoogleEmail = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newGoogleEmail.trim().toLowerCase();
    if (!clean || !clean.includes('@')) return;

    if (googleEmailsList.includes(clean)) {
      setFeedback({ type: 'error', message: 'This email is already in the authorized list.' });
      return;
    }

    const updated = [...googleEmailsList, clean];
    setGoogleEmailsList(updated);
    setNewGoogleEmail('');

    updateAuthSettings({ authorizedGoogleEmails: updated });
    setFeedback({ type: 'success', message: `Added ${clean} to authorized Google administrators.` });
  };

  const handleRemoveGoogleEmail = (emailToRemove: string) => {
    if (googleEmailsList.length <= 1) {
      setFeedback({ type: 'error', message: 'You must retain at least one authorized Google email.' });
      return;
    }

    const updated = googleEmailsList.filter((e) => e !== emailToRemove);
    setGoogleEmailsList(updated);
    updateAuthSettings({ authorizedGoogleEmails: updated });
    setFeedback({ type: 'success', message: `Removed ${emailToRemove} from authorized Google accounts.` });
  };

  const handleToggleGoogleAuth = async (enabled: boolean) => {
    setGoogleEnabled(enabled);
    const res = await updateAuthSettings({ googleAuthEnabled: enabled });
    if (res.success) {
      setFeedback({
        type: 'success',
        message: enabled ? 'Google Sign-In is now active.' : 'Google Sign-In has been disabled.',
      });
    }
  };

  const handleSaveGoogleConfig = async () => {
    setIsSaving(true);
    setFeedback(null);
    const res = await updateAuthSettings({
      googleAuthEnabled: googleEnabled,
      authorizedGoogleEmails: googleEmailsList,
      googleClientId: googleClientId.trim(),
    });
    setIsSaving(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Google authentication settings updated.' });
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update Google settings.' });
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPassword) {
      setFeedback({ type: 'error', message: 'Current password is required to make changes.' });
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New password and confirmation do not match.' });
      return;
    }

    setIsSaving(true);
    const res = await updateAuthSettings(
      {
        newEmail: newAdminEmail.trim() || undefined,
        newPassword: newPassword || undefined,
      },
      currentPassword
    );
    setIsSaving(false);

    if (res.success) {
      setFeedback({
        type: 'success',
        message: `Admin ID & security settings updated successfully! Your active Admin ID is now "${newAdminEmail.trim()}".`,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setFeedback({ type: 'error', message: res.error || 'Failed to update credentials.' });
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <span>Security &amp; Admin Access Settings</span>
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Change your Admin ID (username/email), update login password, and configure Google Sign-In access.
        </p>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs flex items-start gap-3 border ${
            feedback.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-900'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
          )}
          <div className="font-medium leading-relaxed">{feedback.message}</div>
        </div>
      )}

      {/* TOP CARD: Admin ID & Password Management */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span>Change Admin ID &amp; Password</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Customize your login identifier (Admin ID / Email) and manage your access password.
            </p>
          </div>

          {/* Current Active ID Badge */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 text-blue-700 dark:text-blue-300 text-xs shrink-0">
            <span className="text-[10px] uppercase font-bold text-blue-500">Active ID:</span>
            <span className="font-mono font-semibold">{authConfig.adminEmail || 'admin@rezzone.dev'}</span>
          </div>
        </div>

        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Admin ID (Login Identifier or Email) *
            </label>
            <input
              type="text"
              required
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              placeholder="e.g. admin@rezzone.dev, yourname@gmail.com, or admin"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Enter the new identifier or email address you want to use when signing in.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password (Optional)
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Leave blank to keep current"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <label className="block text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
              Current Password (Authorization Required) *
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password to save changes (temp default: admin123)"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Verification is required to safeguard unauthorized ID or password modifications.
            </p>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full py-2.5 px-4 rounded-xl text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>{isSaving ? 'Saving Changes...' : 'Save New Admin ID & Password'}</span>
          </button>
        </form>
      </div>

      {/* Google Authentication Control */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
              <span>Google Authentication Gateway</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Allow signing in directly through Google with designated administrator Gmail accounts.
            </p>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={googleEnabled}
              onChange={(e) => handleToggleGoogleAuth(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {/* Authorized Google Admin Accounts List */}
        <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Authorized Google Admin Accounts
          </label>

          <form onSubmit={handleAddGoogleEmail} className="flex gap-2">
            <input
              type="email"
              value={newGoogleEmail}
              onChange={(e) => setNewGoogleEmail(e.target.value)}
              placeholder="Add another Google email (e.g. riazthesigma@gmail.com)"
              className="flex-1 px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Account</span>
            </button>
          </form>

          <div className="space-y-2 pt-2">
            {googleEmailsList.map((gEmail) => (
              <div
                key={gEmail}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <Mail className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{gEmail}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Authorized
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveGoogleEmail(gEmail)}
                  className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                  title="Remove account"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Optional Google Client ID */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
            Custom Google OAuth Client ID (Optional)
          </label>
          <input
            type="text"
            value={googleClientId}
            onChange={(e) => setGoogleClientId(e.target.value)}
            placeholder="e.g. 123456789-xxxxxx.apps.googleusercontent.com"
            className="w-full px-3.5 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <p className="text-[11px] text-slate-400">
            Leave empty to use built-in authorized account verification.
          </p>

          <button
            type="button"
            onClick={handleSaveGoogleConfig}
            disabled={isSaving}
            className="mt-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 transition-colors"
          >
            Save Google Configuration
          </button>
        </div>
      </div>

      {/* Active Session & Logout */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-semibold text-slate-900 dark:text-white text-sm">
            Current Administrator Session
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Logged in securely. Terminate session when finished to protect your content.
          </p>
        </div>

        <button
          type="button"
          onClick={logout}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 hover:bg-red-100 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out of Admin</span>
        </button>
      </div>
    </div>
  );
};
