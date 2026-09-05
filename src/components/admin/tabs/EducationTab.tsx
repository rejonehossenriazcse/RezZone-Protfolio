import React, { useState } from 'react';
import { useCMS } from '../../../context/CMSContext';
import { EducationItem } from '../../../types';
import { Plus, Trash2, ArrowUp, ArrowDown, GraduationCap, Edit3, Check } from 'lucide-react';

export const EducationTab: React.FC = () => {
  const { cmsData, updateCMSData } = useCMS();
  const { education } = cmsData;

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states for new entry
  const [institution, setInstitution] = useState('');
  const [degree, setDegree] = useState('');
  const [level, setLevel] = useState('BSc');
  const [passingYear, setPassingYear] = useState<string | number>('2024');
  const [details, setDetails] = useState('');

  const handleAddEducation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!institution.trim() || !degree.trim()) return;

    const newItem: EducationItem = {
      id: 'edu-' + Date.now(),
      institution: institution.trim(),
      degree: degree.trim(),
      level: level.trim() || 'BSc',
      passingYear: passingYear,
      details: details.trim(),
      order: (education?.length || 0) + 1,
    };

    updateCMSData((prev) => ({
      ...prev,
      education: [...(prev.education || []), newItem],
    }));

    setInstitution('');
    setDegree('');
    setLevel('BSc');
    setPassingYear('2024');
    setDetails('');
    setIsAdding(false);
  };

  const handleUpdateItem = (id: string, updates: Partial<EducationItem>) => {
    updateCMSData((prev) => ({
      ...prev,
      education: (prev.education || []).map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const handleDeleteItem = (id: string) => {
    updateCMSData((prev) => ({
      ...prev,
      education: (prev.education || []).filter((item) => item.id !== id),
    }));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const list = [...(education || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // re-assign orders
    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    updateCMSData((prev) => ({
      ...prev,
      education: updated,
    }));
  };

  const sortedEducation = [...(education || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Education Timeline
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage academic institutions, degrees, qualifications, passing years, and order.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Add Education'}</span>
        </button>
      </div>

      {/* Add New Education Form */}
      {isAdding && (
        <form
          onSubmit={handleAddEducation}
          className="p-6 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 shadow-sm space-y-4"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">
            Add New Academic Record
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Institution Name
              </label>
              <input
                type="text"
                required
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                placeholder="e.g. Northern University Bangladesh"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Degree / Examination
              </label>
              <input
                type="text"
                required
                value={degree}
                onChange={(e) => setDegree(e.target.value)}
                placeholder="e.g. BSc in Computer Science & Engineering (CSE)"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Level / Badge
              </label>
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="BSc, HSC, SSC, etc."
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Passing Year / Period
              </label>
              <input
                type="text"
                value={passingYear}
                onChange={(e) => setPassingYear(e.target.value)}
                placeholder="2022, 2024, or Ongoing"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
              Description / Highlights (Optional)
            </label>
            <textarea
              rows={2}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Key concentrations, distinctions, or courses..."
              className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
              Save Education Entry
            </button>
          </div>
        </form>
      )}

      {/* Existing Education List */}
      <div className="space-y-3">
        {sortedEducation.map((item, index) => {
          const isEditing = editingId === item.id;

          return (
            <div
              key={item.id}
              className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col gap-3 transition-all"
            >
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={item.institution}
                      onChange={(e) => handleUpdateItem(item.id, { institution: e.target.value })}
                      placeholder="Institution"
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={item.degree}
                      onChange={(e) => handleUpdateItem(item.id, { degree: e.target.value })}
                      placeholder="Degree"
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={item.level}
                      onChange={(e) => handleUpdateItem(item.id, { level: e.target.value })}
                      placeholder="Level (BSc, HSC, SSC)"
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      value={item.passingYear}
                      onChange={(e) => handleUpdateItem(item.id, { passingYear: e.target.value })}
                      placeholder="Passing Year"
                      className="px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                    />
                  </div>
                  <textarea
                    rows={2}
                    value={item.details || ''}
                    onChange={(e) => handleUpdateItem(item.id, { details: e.target.value })}
                    placeholder="Details"
                    className="w-full px-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Done Editing</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                          {item.level}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                          {item.degree}
                        </h4>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-0.5">
                        {item.institution} &bull; Passing Year: <span className="font-semibold">{item.passingYear}</span>
                      </p>
                      {item.details && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {item.details}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMove(index, 'up')}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === sortedEducation.length - 1}
                      onClick={() => handleMove(index, 'down')}
                      className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(item.id)}
                      className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg ml-1"
                      title="Edit Item"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteItem(item.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg"
                      title="Delete Item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
