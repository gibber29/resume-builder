import React from 'react';
import { Copy, Check } from 'lucide-react';

const CodeEditor = ({ code, onChange }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative h-full flex flex-col bg-slate-950 rounded-2xl border border-slate-700 overflow-hidden font-mono shadow-2xl">
      <div className="flex justify-between items-center px-6 py-3 bg-slate-900 border-b border-slate-800">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latex Source</div>
        <button
          onClick={handleCopy}
          className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
          title="Copy to clipboard"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      
      <textarea
        value={code}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        className="flex-1 min-h-[420px] w-full bg-transparent px-8 py-10 text-[15px] leading-8 text-primary-100 placeholder:text-slate-800 focus:outline-none resize-none selection:bg-primary-500/30"
      />
      
      <div className="px-6 py-2 bg-slate-900/50 border-t border-slate-800 text-[9px] text-slate-600 font-bold uppercase tracking-widest">
        Lines: {code.split('\n').length} | Characters: {code.length}
      </div>
    </div>
  );
};

export default CodeEditor;
