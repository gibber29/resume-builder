import React from 'react';

const FormInput = ({ label, name, value, onChange, placeholder, type = "text", className = "" }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={name} className="text-sm font-medium text-slate-300">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 transition-all"
      />
    </div>
  );
};

export default FormInput;
