import React, { useState } from 'react';
import { useCMS } from '../../../context/CMSContext';
import { SkillItem } from '../../../types';
import { Plus, Trash2, ArrowUp, ArrowDown, Code2 } from 'lucide-react';

export const SkillsTab: React.FC = () => {
  const { cmsData, updateCMSData } = useCMS();
  const { skills } = cmsData;

  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Programming Language');
  const [proficiency, setProficiency] = useState(85);

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newSkill: SkillItem = {
      id: 'skill-' + Date.now(),
      name: name.trim(),
      category: category.trim() || 'General',
      proficiency: Number(proficiency) || 80,
      order: (skills?.length || 0) + 1,
    };

    updateCMSData((prev) => ({
      ...prev,
      skills: [...(prev.skills || []), newSkill],
    }));

    setName('');
    setIsAdding(false);
  };

  const handleUpdateSkill = (id: string, updates: Partial<SkillItem>) => {
    updateCMSData((prev) => ({
      ...prev,
      skills: (prev.skills || []).map((s) => (s.id === id ? { ...s, ...updates } : s)),
    }));
  };

  const handleDeleteSkill = (id: string) => {
    updateCMSData((prev) => ({
      ...prev,
      skills: (prev.skills || []).filter((s) => s.id !== id),
    }));
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    const list = [...(skills || [])];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    const updated = list.map((item, idx) => ({ ...item, order: idx + 1 }));
    updateCMSData((prev) => ({
      ...prev,
      skills: updated,
    }));
  };

  const sortedSkills = [...(skills || [])].sort((a, b) => (a.order || 0) - (b.order || 0));

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Technical Skills
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage competencies, languages, frameworks, categories, and proficiency percentages.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAdding(!isAdding)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>{isAdding ? 'Cancel' : 'Add Skill'}</span>
        </button>
      </div>

      {/* Add New Skill Form */}
      {isAdding && (
        <form
          onSubmit={handleAddSkill}
          className="p-6 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900 shadow-sm space-y-4"
        >
          <h3 className="font-semibold text-slate-900 dark:text-white text-sm">Add New Skill</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Skill Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. C, Python, React"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Category
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Programming Language, Frontend, Tools"
                className="w-full px-3 py-2 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                Proficiency ({proficiency}%)
              </label>
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={proficiency}
                onChange={(e) => setProficiency(Number(e.target.value))}
                className="w-full mt-2"
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
              Save Skill
            </button>
          </div>
        </form>
      )}

      {/* Skills Table / List */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        {sortedSkills.map((skill, index) => (
          <div
            key={skill.id}
            className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3 w-full sm:w-1/3">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
                <Code2 className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={skill.name}
                onChange={(e) => handleUpdateSkill(skill.id, { name: e.target.value })}
                className="w-full px-2.5 py-1 text-xs font-bold rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="w-full sm:w-1/4">
              <input
                type="text"
                value={skill.category}
                onChange={(e) => handleUpdateSkill(skill.id, { category: e.target.value })}
                placeholder="Category"
                className="w-full px-2.5 py-1 text-xs rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-1/4">
              <input
                type="range"
                min="10"
                max="100"
                step="5"
                value={skill.proficiency || 80}
                onChange={(e) =>
                  handleUpdateSkill(skill.id, { proficiency: Number(e.target.value) })
                }
                className="w-full"
              />
              <span className="text-xs font-mono w-10 text-right text-slate-600 dark:text-slate-300">
                {skill.proficiency || 80}%
              </span>
            </div>

            <div className="flex items-center gap-1 shrink-0 ml-auto sm:ml-0">
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
                disabled={index === sortedSkills.length - 1}
                onClick={() => handleMove(index, 'down')}
                className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
                title="Move Down"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => handleDeleteSkill(skill.id)}
                className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg ml-1"
                title="Delete Skill"
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
