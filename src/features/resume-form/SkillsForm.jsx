import React, { useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Wrench, Plus, X } from 'lucide-react';

const SkillsForm = ({ data, updateData }) => {
  const [skillInput, setSkillInput] = useState("");

  const addSkill = (e) => {
    e.preventDefault();
    if (!skillInput.trim()) return;
    if (data.includes(skillInput.trim())) {
      setSkillInput("");
      return;
    }
    updateData('skills', [...data, skillInput.trim()]);
    setSkillInput("");
  };

  const removeSkill = (skillToRemove) => {
    updateData('skills', data.filter(skill => skill !== skillToRemove));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-500">
      <SectionHeader icon={Wrench} title="Skills" />

      <form onSubmit={addSkill} className="space-y-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            placeholder="e.g. React, Python, AWS, Docker"
            className="flex-1 bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-primary-900/20"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {data.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-700/50 text-slate-200 border border-slate-600 rounded-full text-sm font-medium hover:bg-slate-700 hover:border-primary-500/50 transition-all cursor-default group"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-slate-500 hover:text-red-400 p-0.5 rounded-full hover:bg-slate-600 transition-all"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          {data.length === 0 && (
            <p className="text-slate-500 text-sm italic">No skills added yet.</p>
          )}
        </div>
      </form>
    </div>
  );
};

export default SkillsForm;
