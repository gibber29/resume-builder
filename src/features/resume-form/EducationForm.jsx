import React from 'react';
import FormInput from '../../components/FormInput';
import SectionHeader from '../../components/SectionHeader';
import { GraduationCap, Plus, Trash2 } from 'lucide-react';

const EducationForm = ({ data, updateData }) => {
  const handleChange = (id, e) => {
    const { name, value } = e.target;
    const updatedList = data.map(item => 
      item.id === id ? { ...item, [name]: value } : item
    );
    updateData('education', updatedList);
  };

  const addItem = () => {
    updateData('education', [
      ...data,
      {
        id: crypto.randomUUID(),
        school: "",
        degree: "",
        startDate: "",
        endDate: "",
        description: "",
      }
    ]);
  };

  const removeItem = (id) => {
    updateData('education', data.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-150">
      <div className="flex justify-between items-center">
        <SectionHeader icon={GraduationCap} title="Education" />
        <button
          onClick={addItem}
          className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-primary-900/20"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>

      {data.map((edu, index) => (
        <div key={edu.id} className="relative p-6 bg-slate-900/30 rounded-xl border border-slate-700/50 space-y-4 group">
          {data.length > 1 && (
            <button
              onClick={() => removeItem(edu.id)}
              className="absolute top-4 right-4 text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              label="School / University"
              name="school"
              value={edu.school}
              onChange={(e) => handleChange(edu.id, e)}
              placeholder="Stanford University"
            />
            <FormInput
              label="Degree / Certification"
              name="degree"
              value={edu.degree}
              onChange={(e) => handleChange(edu.id, e)}
              placeholder="Bachelor of Science in CS"
            />
            <FormInput
              label="Start Date"
              name="startDate"
              value={edu.startDate}
              onChange={(e) => handleChange(edu.id, e)}
              placeholder="Sep 2020"
            />
            <FormInput
              label="End Date"
              name="endDate"
              value={edu.endDate}
              onChange={(e) => handleChange(edu.id, e)}
              placeholder="May 2024"
            />
          </div>
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-300">Description (Optional)</label>
            <textarea
              name="description"
              value={edu.description}
              onChange={(e) => handleChange(edu.id, e)}
              rows={2}
              placeholder="GPA, relevant coursework, honors..."
              className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export default EducationForm;
