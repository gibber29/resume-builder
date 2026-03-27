import React from 'react';
import FormInput from '../../components/FormInput';
import { User, Mail, Phone, MapPin, Linkedin, Globe, FileText } from 'lucide-react';

const PersonalInfoForm = ({ data, updateData }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateData('personalInfo', { ...data, [name]: value });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-2 pb-2 border-b border-slate-700">
        <User className="w-5 h-5 text-primary-400" />
        <h3 className="text-xl font-semibold text-slate-100">Personal Information</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Full Name"
          name="fullName"
          value={data.fullName}
          onChange={handleChange}
          placeholder="John Doe"
        />
        <FormInput
          label="Email Address"
          name="email"
          type="email"
          value={data.email}
          onChange={handleChange}
          placeholder="john@example.com"
        />
        <FormInput
          label="Phone Number"
          name="phone"
          value={data.phone}
          onChange={handleChange}
          placeholder="+1 (555) 000-0000"
        />
        <FormInput
          label="Location"
          name="location"
          value={data.location}
          onChange={handleChange}
          placeholder="New York, NY"
        />
        <FormInput
          label="LinkedIn Profile"
          name="linkedin"
          value={data.linkedin}
          onChange={handleChange}
          placeholder="linkedin.com/in/johndoe"
        />
        <FormInput
          label="Portfolio / Website"
          name="website"
          value={data.website}
          onChange={handleChange}
          placeholder="johndoe.com"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="summary" className="text-sm font-medium text-slate-300 flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary-400" />
          Professional Summary
        </label>
        <textarea
          id="summary"
          name="summary"
          value={data.summary}
          onChange={handleChange}
          rows={4}
          placeholder="Briefly describe your career goals and key achievements..."
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all resize-none"
        />
      </div>
    </div>
  );
};

export default PersonalInfoForm;
