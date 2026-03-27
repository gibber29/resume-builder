import React, { useState } from 'react';
import FormInput from '../../components/FormInput';
import SectionHeader from '../../components/SectionHeader';
import { Briefcase, Plus, Trash2, Sparkles, Loader2 } from 'lucide-react';
import { refineBulletPoint } from '../../api/gemini';

const ExperienceForm = ({ data, updateData }) => {
  const [refiningId, setRefiningId] = useState(null);

  const handleChange = (id, e) => {
    const { name, value } = e.target;
    const updatedList = data.map(item => 
      item.id === id ? { ...item, [name]: value } : item
    );
    updateData('experience', updatedList);
  };

  const handleRefine = async (id, currentText) => {
    if (!currentText.trim()) return;
    
    setRefiningId(id);
    try {
      const result = await refineBulletPoint(currentText);
      const updatedList = data.map(item => 
        item.id === id ? { ...item, description: result.refined } : item
      );
      updateData('experience', updatedList);
    } catch (error) {
      alert(`Refine Error: ${error.message || error}`);
    } finally {
      setRefiningId(null);
    }
  };

  const addItem = () => {
    updateData('experience', [
      ...data,
      {
        id: crypto.randomUUID(),
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        description: "",
      }
    ]);
  };

  const removeItem = (id) => {
    updateData('experience', data.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-300">
      <div className="flex justify-between items-center">
        <SectionHeader icon={Briefcase} title="Experience" />
        <button
          onClick={addItem}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-900/20"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {data.map((exp, index) => (
        <div key={exp.id} className="relative p-6 bg-slate-900/30 rounded-xl border border-slate-700/50 space-y-4 group">
          {data.length > 1 && (
            <button
              onClick={() => removeItem(exp.id)}
              className="absolute top-4 right-4 text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="Company"
              name="company"
              value={exp.company}
              onChange={(e) => handleChange(exp.id, e)}
              placeholder="Google / Freelance"
            />
            <FormInput
              label="Position"
              name="position"
              value={exp.position}
              onChange={(e) => handleChange(exp.id, e)}
              placeholder="Senior Software Engineer"
            />
            <FormInput
              label="Start Date"
              name="startDate"
              value={exp.startDate}
              onChange={(e) => handleChange(exp.id, e)}
              placeholder="Jan 2022"
            />
            <FormInput
              label="End Date"
              name="endDate"
              value={exp.endDate}
              onChange={(e) => handleChange(exp.id, e)}
              placeholder="Present"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-slate-300">Description / Responsibilities</label>
              <button 
                onClick={() => handleRefine(exp.id, exp.description)}
                disabled={refiningId === exp.id || !exp.description}
                className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-primary-400 hover:text-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refiningId === exp.id ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Sparkles className="w-3 h-3" />
                )}
                AI Refine
              </button>
            </div>
            <textarea
              name="description"
              value={exp.description}
              onChange={(e) => handleChange(exp.id, e)}
              rows={4}
              placeholder="Developed and maintained cloud-scale applications using React and Node.js..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExperienceForm;
