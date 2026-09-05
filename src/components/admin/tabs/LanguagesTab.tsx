import React, { useState } from 'react';
import { useCMS } from '../../../context/CMSContext';
import { LanguageItem } from '../../../types';
import { Plus, Trash2, ArrowUp, ArrowDown, Globe } from 'lucide-react';

export const LanguagesTab: React.FC = () => {
  const { cmsData, updateCMSData } = useCMS();
  const { languages } = cmsData;

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [proficiency, setProficiency] = useState('Native');

  const handleAddLanguage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newLang: LanguageItem = {
      id: 'lang-' + Date.now(),
      name: name.trim(),
      proficiency: proficiency.trim() || 'Fluent',
      order: (languages?.length || 0) + 1,
    };

    updateCMSData((prev) => ({
      ...prev,
      languages: [...(prev.languages || []), newLang],
    }));

    setName('');
    setIsAdding(false);
  };

  const handleUpdateLanguage = (id: string, updates: Partial<LanguageItem>) => {
    updateCMSData((prev) => ({
      ...prev,
      languages: (prev.languages || []).map((l) => (l.id === id ? { ...l, ...updates } : l)),
    }));
  };

  const handleDeleteLanguage = (id: string) => {
    updateCMSData((prev) => ({
      ...prev,
      languages: (prev.languages || []).filter((l) => l.id !== id),
    }));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const list = [...(languages || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    updateCMSData((prev) => ({
      ...prev,
      languages: updated,
    }));
  };

  const sortedLanguages = [...(languages || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Language Fluency
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage spoken and written languages and fluency proficiency levels.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Add Language'}</span>
        </button>
      </div>

      {/* Add New Language Form */}
      {isAdding && (
        <form
          onSubmit={handleAddLanguage}
          className="p-6 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 shadow-sm space-y-4"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Add New Language</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Language Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Bengali, English, German"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Proficiency Level
              </label>
              <input
                type="text"
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value)}
                placeholder="Native, Fluent, Professional Working, Intermediate"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200/50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
            >
              Save Language
            </button>
          </div>
        </form>
      )}

      {/* Languages List */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {sortedLanguages.map((lang, index) => (
          <div
            key={lang.id}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 w-1/2">
              <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 shrink-0">
                <Globe className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={lang.name}
                onChange={(e) => handleUpdateLanguage(lang.id, { name: e.target.value })}
                className="w-full px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="w-1/3">
              <input
                type="text"
                value={lang.proficiency}
                onChange={(e) => handleUpdateLanguage(lang.id, { proficiency: e.target.value })}
                className="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-1 shrink-0">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => handleMove(index, 'up')}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                title="Move Up"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                disabled={index === sortedLanguages.length - 1}
                onClick={() => handleMove(index, 'down')}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteLanguage(lang.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg ml-1"
                title="Delete Language"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
