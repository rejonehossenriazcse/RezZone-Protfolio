import React, { useState } from 'react';
import { useCMS } from '../../../context/CMSContext';
import { Inbox, Trash2, Mail, Calendar, Download, RefreshCw, AlertTriangle } from 'lucide-react';

export const SubmissionsTab: React.FC = () => {
  const { cmsData, deleteSubmission, resetToDefaults, updateCMSData } = useCMS();
  const submissions = cmsData.contactSubmissions || [];
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(cmsData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `rezzone-cms-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && parsed.siteSettings && parsed.profile) {
          updateCMSData(() => parsed);
          alert('CMS Data restored successfully!');
        } else {
          alert('Invalid CMS backup file format.');
        }
      } catch (err) {
        alert('Could not parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  const handleReset = async () => {
    await resetToDefaults();
    setConfirmReset(false);
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Inbox &amp; Data Operations
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Review visitor contact inquiries, export CMS backups, or restore default seed data.
        </p>
      </div>

      {/* Contact Inquiries */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-slate-900 dark:text-white text-base flex items-center gap-2">
            <Inbox className="w-4 h-4 text-blue-500" />
            <span>Visitor Submissions ({submissions.length})</span>
          </h3>
        </div>

        {submissions.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            <Mail className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              No message submissions yet.
            </p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Messages sent from the Contact form on the live site will show up here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {submissions.map((sub) => (
              <div
                key={sub.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {sub.name}
                    </h4>
                    <a
                      href={`mailto:${sub.email}`}
                      className="text-xs text-blue-600 dark:text-blue-400 font-medium hover:underline flex items-center gap-1 mt-0.5"
                    >
                      <Mail className="w-3 h-3" />
                      <span>{sub.email}</span>
                    </a>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                      <Calendar className="w-3 h-3" />
                      <span>{new Date(sub.createdAt).toLocaleDateString()}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => deleteSubmission(sub.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                      title="Delete Submission"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                  {sub.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Backup & Reset Utilities */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-semibold text-slate-900 dark:text-white text-base">
          Data Export, Import &amp; Reset
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export */}
          <button
            type="button"
            onClick={handleExportJSON}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors flex items-center gap-3"
          >
            <Download className="w-5 h-5 text-blue-500 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Export Backup
              </div>
              <div className="text-[11px] text-slate-400">Save CMS data as JSON</div>
            </div>
          </button>

          {/* Import */}
          <label className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-left transition-colors flex items-center gap-3 cursor-pointer">
            <RefreshCw className="w-5 h-5 text-emerald-500 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                Import JSON
              </div>
              <div className="text-[11px] text-slate-400">Restore from backup</div>
            </div>
            <input
              type="file"
              accept=".json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          {/* Reset */}
          <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-950/60 bg-red-50/50 dark:bg-red-950/20 text-left flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
            <div className="flex-1 min-w-0">
              {confirmReset ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="px-2 py-1 bg-red-600 text-white rounded text-[10px] font-bold"
                  >
                    Confirm Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="text-[10px] text-slate-500"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                >
                  Reset to Initial Seed
                </button>
              )}
              <div className="text-[11px] text-red-400/80">Restores RezZone defaults</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
