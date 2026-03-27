import React from 'react';
import { ExternalLink, CheckCircle, Sparkles } from 'lucide-react';
import { TEMPLATES, TEMPLATE_CATEGORIES } from './templateDefinitions';
import { UniversalPreview } from './UniversalPreview';

const TemplateCard = ({ template, onSelect }) => {
  const pageWidth = template.pageFormat === 'a4' ? 794 : 816;
  const pageHeight = template.pageFormat === 'a4' ? 1123 : 1056;
  const scale = template.pageFormat === 'a4' ? 0.24 : 0.25;
  const scaledWidth = Math.round(pageWidth * scale);
  const scaledHeight = Math.round(pageHeight * scale);

  return (
    <div
      className="group relative bg-slate-800/60 border border-slate-700/50 rounded-2xl p-4 cursor-pointer
                 hover:border-blue-500/60 hover:bg-slate-800 hover:-translate-y-1 transition-all duration-300
                 flex flex-col gap-3"
      onClick={() => onSelect(template)}
    >
      {template.isATSFriendly && (
        <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500/10 border border-green-500/30 rounded-full px-2 py-0.5 text-[9px] font-bold text-green-400 uppercase tracking-wider z-10">
          <CheckCircle className="w-2.5 h-2.5" /> ATS
        </div>
      )}

      <div className="w-full h-[320px] bg-slate-900 rounded-xl border border-slate-700/50 overflow-hidden relative flex items-center justify-center">
        <div style={{ width: `${scaledWidth}px`, height: `${scaledHeight}px` }} className="relative">
          <div
            className="absolute top-0 left-0 bg-white shadow-[0_5px_15px_rgba(0,0,0,0.5)] overflow-hidden origin-top-left"
            style={{ width: `${pageWidth}px`, height: `${pageHeight}px`, transform: `scale(${scale})` }}
          >
            <UniversalPreview data={template.sampleData} template={template} />
          </div>
        </div>

        <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
          <div className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
            <Sparkles className="w-3 h-3" /> Use Template
          </div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-slate-100 text-sm leading-tight">{template.name}</h3>
        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed line-clamp-2">{template.description}</p>
      </div>

      <div className="mt-auto flex items-center justify-between gap-3">
        <span className="text-[10px] text-blue-400/80 font-medium leading-tight">
          Best for: {template.bestFor.split(',')[0]}
        </span>
        <a
          href={template.overleafUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-slate-500 hover:text-blue-400 transition-colors"
          title="View on Overleaf"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};

const TemplateGallery = ({ onSelectTemplate }) => (
  <div className="px-6 pb-16 space-y-12">
    {TEMPLATE_CATEGORIES.map((category) => {
      const categoryTemplates = TEMPLATES.filter((template) => template.category === category.id);

      return (
        <div key={category.id}>
          <div className="flex items-center gap-3 mb-6">
            <div
              className="rounded-xl px-4 py-2"
              style={{
                background: `linear-gradient(135deg, ${category.colorFrom}22, ${category.colorTo}22)`,
                border: `1px solid ${category.colorFrom}44`,
              }}
            >
              <p className="font-black text-white text-sm">{category.label}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: category.colorFrom }}>
                {category.subtitle}
              </p>
            </div>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {categoryTemplates.map((template) => (
              <TemplateCard key={template.id} template={template} onSelect={onSelectTemplate} />
            ))}
          </div>
        </div>
      );
    })}
  </div>
);

export default TemplateGallery;
