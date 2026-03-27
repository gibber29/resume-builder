import React from 'react';

const SectionHeader = ({ icon: Icon, title }) => {
  return (
    <div className="flex items-center gap-2 pb-2 border-b border-slate-700 mb-6">
      <Icon className="w-5 h-5 text-primary-400" />
      <h3 className="text-xl font-bold text-slate-100 uppercase tracking-wide">{title}</h3>
    </div>
  );
};

export default SectionHeader;
