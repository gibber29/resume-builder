import React from 'react';

const cleanLatexText = (value = '') => {
  let output = `${value}`;

  output = output.replace(/\\href\{[^}]*\}\{([^}]*)\}/g, '$1');
  output = output.replace(/\\textbf\{([^}]*)\}/g, '$1');
  output = output.replace(/\\textit\{([^}]*)\}/g, '$1');
  output = output.replace(/\\underline\{([^}]*)\}/g, '$1');
  output = output.replace(/\\emph\{([^}]*)\}/g, '$1');
  output = output.replace(/\\small\{([^}]*)\}/g, '$1');
  output = output.replace(/\\Huge\s+/g, '');
  output = output.replace(/\\scshape/g, '');
  output = output.replace(/\\fa[A-Za-z]+/g, '');
  output = output.replace(/\\textbullet/g, '•');
  output = output.replace(/\$\|\$/g, ' | ');
  output = output.replace(/\\\\/g, '\n');
  output = output.replace(/\\[a-zA-Z]+\*?(?:\[[^\]]*\])?(?:\{[^}]*\})?/g, ' ');
  output = output.replace(/[{}]/g, ' ');
  output = output.replace(/\s+\n/g, '\n');
  output = output.replace(/\n\s+/g, '\n');
  output = output.replace(/[ \t]{2,}/g, ' ');

  return output
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
};

const parseHeader = (latexCode = '') => {
  const match = latexCode.match(/\\begin\{center\}([\s\S]*?)\\end\{center\}/);
  if (!match) return [];

  return cleanLatexText(match[1])
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
};

const parseSections = (latexCode = '') => {
  const sections = [];
  const sectionRegex = /\\section\*?\{([^}]*)\}([\s\S]*?)(?=\\section\*?\{|\\end\{document\})/g;
  let match;

  while ((match = sectionRegex.exec(latexCode)) !== null) {
    const title = cleanLatexText(match[1]);
    const lines = cleanLatexText(match[2])
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (title || lines.length > 0) {
      sections.push({ title, lines });
    }
  }

  return sections;
};

const LatexLivePreview = ({ code }) => {
  const headerLines = parseHeader(code);
  const sections = parseSections(code);

  return (
    <div className="min-h-full bg-white text-slate-900 px-10 py-10">
      <div className="border-b border-slate-200 pb-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
          Live Code Preview
        </div>
        <div className="mt-2 text-sm text-slate-500">
          Manual LaTeX edits are being previewed here in real time.
        </div>
      </div>

      {headerLines.length > 0 && (
        <div className="py-6 text-center border-b border-slate-100">
          {headerLines.map((line, index) => (
            <div
              key={`${line}-${index}`}
              className={index === 0 ? 'text-3xl font-black tracking-tight text-slate-900' : 'mt-1 text-sm text-slate-500'}
            >
              {line}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-8 py-8">
        {sections.map((section, sectionIndex) => (
          <section key={`${section.title || 'section'}-${sectionIndex}`}>
            <h3 className="text-xs font-extrabold uppercase tracking-[0.24em] text-slate-700">
              {section.title || 'Section'}
            </h3>
            <div className="mt-2 h-px bg-slate-200" />
            <div className="mt-4 space-y-3">
              {section.lines.map((line, index) => (
                <p key={`${section.title}-${index}`} className="text-sm leading-6 text-slate-700">
                  {line}
                </p>
              ))}
            </div>
          </section>
        ))}

        {sections.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-8 text-center text-sm text-slate-500">
            No previewable LaTeX content was detected yet. Keep typing and this panel will update.
          </div>
        )}
      </div>
    </div>
  );
};

export default LatexLivePreview;
