// Escape special LaTeX characters
const escape = (text) => {
  if (!text) return "";
  return text
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/\{/g, '\\{')
    .replace(/\}/g, '\\}')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
};

const normalizeText = (value = '') =>
  value
    .replace(/\r/g, '')
    .replace(/\s+/g, ' ')
    .trim();

const truncate = (value = '', max = 160) => {
  const normalized = normalizeText(value);
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max).trim().replace(/[.,;:!?-]*$/, '')}...`;
};

const cleanItems = (items, predicate) => items.filter(predicate);

const optimizeSkills = (skills = [], maxSkills = 10) =>
  [...new Set(skills.map(normalizeText).filter(Boolean))].slice(0, maxSkills);

const optimizeEntries = (items, config, kind) =>
  cleanItems(items, kind === 'education' ? (item) => item.school : kind === 'experience' ? (item) => item.company : (item) => item.name)
    .slice(0, config.maxItems)
    .map((item) => ({
      ...item,
      school: truncate(item.school, config.schoolMax || 60),
      degree: truncate(item.degree, config.degreeMax || 90),
      company: truncate(item.company, config.companyMax || 60),
      position: truncate(item.position, config.positionMax || 60),
      name: truncate(item.name, config.nameMax || 60),
      technologies: truncate(item.technologies, config.technologiesMax || 65),
      location: truncate(item.location, config.locationMax || 40),
      startDate: truncate(item.startDate, 18),
      endDate: truncate(item.endDate, 18),
      description: normalizeText(item.description || ''),
      link: truncate(item.link, 70),
    }));

const OPTIMIZATION_PROFILES = {
  ats_technical: { summaryMax: 180, skillMax: 8, experience: { maxItems: 2, descriptionMax: 155 }, projects: { maxItems: 2, descriptionMax: 145 }, education: { maxItems: 2, degreeMax: 78 } },
  swe_lato: { summaryMax: 170, skillMax: 10, experience: { maxItems: 2, descriptionMax: 150 }, projects: { maxItems: 2, descriptionMax: 140 }, education: { maxItems: 1, degreeMax: 82 } },
  data_science: { summaryMax: 175, skillMax: 8, experience: { maxItems: 2, descriptionMax: 145 }, projects: { maxItems: 2, descriptionMax: 135 }, education: { maxItems: 2, degreeMax: 70 } },
  academic_researcher: { summaryMax: 180, skillMax: 6, experience: { maxItems: 2, descriptionMax: 150 }, projects: { maxItems: 2, descriptionMax: 120, technologiesMax: 30 }, education: { maxItems: 2, degreeMax: 72 } },
  modular_cv: { summaryMax: 170, skillMax: 6, experience: { maxItems: 2, descriptionMax: 145 }, projects: { maxItems: 1, descriptionMax: 110 }, education: { maxItems: 2, degreeMax: 70 } },
  sfiucr_cv: { summaryMax: 160, skillMax: 6, experience: { maxItems: 2, descriptionMax: 138 }, projects: { maxItems: 1, descriptionMax: 105 }, education: { maxItems: 1, degreeMax: 68 } },
  modern_simple_ats: { summaryMax: 165, skillMax: 6, experience: { maxItems: 2, descriptionMax: 145 }, projects: { maxItems: 1, descriptionMax: 110 }, education: { maxItems: 1, degreeMax: 70 } },
  altacv: { summaryMax: 150, skillMax: 8, experience: { maxItems: 2, descriptionMax: 135 }, projects: { maxItems: 2, descriptionMax: 110 }, education: { maxItems: 1, degreeMax: 68 } },
  jakes_resume: { summaryMax: 165, skillMax: 8, experience: { maxItems: 2, descriptionMax: 145 }, projects: { maxItems: 2, descriptionMax: 130 }, education: { maxItems: 1, degreeMax: 78 } },
};

export const optimizeResumeData = (data, templateId = 'jakes_resume') => {
  const profile = OPTIMIZATION_PROFILES[templateId] || OPTIMIZATION_PROFILES.jakes_resume;

  return {
    ...data,
    personalInfo: {
      ...data.personalInfo,
      fullName: truncate(data.personalInfo?.fullName, 40),
      email: truncate(data.personalInfo?.email, 45),
      phone: truncate(data.personalInfo?.phone, 24),
      location: truncate(data.personalInfo?.location, 32),
      linkedin: truncate(data.personalInfo?.linkedin, 42),
      website: truncate(data.personalInfo?.website, 42),
      summary: normalizeText(data.personalInfo?.summary || ''),
    },
    skills: optimizeSkills(data.skills, profile.skillMax),
    education: optimizeEntries(data.education || [], profile.education, 'education'),
    experience: optimizeEntries(data.experience || [], profile.experience, 'experience'),
    projects: optimizeEntries(data.projects || [], profile.projects, 'projects'),
  };
};

// ─── TEMPLATE 1: ATS Friendly Technical (Roboto, single-column) ───────────────
const generateAtsTechnical = (data) => {
  const { personalInfo, education, experience, skills, projects } = data;
  return `\\documentclass[a4paper,11pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}
\\usepackage[sfdefault]{roboto}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}
\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{\\Large\\bfseries\\scshape\\raggedright}{}{0em}{}[\\titlerule]
\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{\\item\\small{#1}}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
  \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{#3} & \\textit{#4} \\\\
  \\end{tabular*}\\vspace{-7pt}
}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingList}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}

\\begin{document}

\\begin{center}
  \\textbf{\\Huge ${escape(personalInfo.fullName) || 'Your Name'}} \\\\
  \\small ${escape(personalInfo.phone)} $|$ \\href{mailto:${personalInfo.email}}{${escape(personalInfo.email)}} $|$ ${escape(personalInfo.location)}
\\end{center}

${personalInfo.summary ? `\\section*{Summary}\n${escape(personalInfo.summary)}\n` : ''}

\\section{Technical Skills}
\\resumeSubHeadingList
${skills.map(s => `  \\resumeItem{${escape(s)}}`).join('\n')}
\\resumeSubHeadingListEnd

\\section{Experience}
\\resumeSubHeadingList
${experience.filter(e => e.company).map(exp => `
  \\resumeSubheading
    {${escape(exp.company)}}{${escape(exp.startDate)} -- ${escape(exp.endDate)}}
    {${escape(exp.position)}}{}
  \\begin{itemize}
    \\resumeItem{\\textbullet\\ ${escape(exp.description)}}
  \\end{itemize}
`).join('')}
\\resumeSubHeadingListEnd

\\section{Projects}
\\resumeSubHeadingList
${projects.filter(p => p.name).map(proj => `
  \\resumeSubheading
    {${escape(proj.name)}}{${escape(proj.technologies)}}
    {${escape(proj.description)}}{}
`).join('')}
\\resumeSubHeadingListEnd

\\section{Education}
\\resumeSubHeadingList
${education.filter(e => e.school).map(edu => `
  \\resumeSubheading
    {${escape(edu.school)}}{${escape(edu.startDate)} -- ${escape(edu.endDate)}}
    {${escape(edu.degree)}}{}
`).join('')}
\\resumeSubHeadingListEnd

\\end{document}`;
};

// ─── TEMPLATE 2: SWE Resume (Lato font, same structure) ──────────────────────
const generateSweResume = (data) => {
  const { personalInfo, education, experience, skills, projects } = data;
  return `\\documentclass[a4paper,12pt]{article}
\\usepackage{fontawesome5}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}
\\usepackage[default]{lato}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}
\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule\\vspace{-5pt}]
\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{\\item\\small{{#1 \\vspace{-2pt}}}}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
  \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{\\small#3} & \\textit{\\small #4} \\\\
  \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeProjectHeading}[2]{
  \\item \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\small#1 & #2 \\\\
  \\end{tabular*}\\vspace{-7pt}
}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
  \\textbf{\\Huge \\scshape ${escape(personalInfo.fullName) || 'Your Name'}} \\\\ \\vspace{1pt}
  \\small \\faPhone\\ ${escape(personalInfo.phone)} $|$ \\faEnvelope\\ \\href{mailto:${personalInfo.email}}{${escape(personalInfo.email)}} $|$
  \\faMapMarker\\ ${escape(personalInfo.location)}
\\end{center}

${personalInfo.summary ? `\\section{Summary}\n  \\small{${escape(personalInfo.summary)}}\n` : ''}

\\section{Education}
\\resumeSubHeadingListStart
${education.filter(e => e.school).map(edu => `
  \\resumeSubheading
    {${escape(edu.school)}}{${escape(edu.startDate)} -- ${escape(edu.endDate)}}
    {${escape(edu.degree)}}{}
`).join('')}
\\resumeSubHeadingListEnd

\\section{Experience}
\\resumeSubHeadingListStart
${experience.filter(e => e.company).map(exp => `
  \\resumeSubheading
    {${escape(exp.position)}}{${escape(exp.startDate)} -- ${escape(exp.endDate)}}
    {${escape(exp.company)}}{}
  \\resumeItemListStart
    \\resumeItem{${escape(exp.description)}}
  \\resumeItemListEnd
`).join('')}
\\resumeSubHeadingListEnd

\\section{Projects}
\\resumeSubHeadingListStart
${projects.filter(p => p.name).map(proj => `
  \\resumeProjectHeading
    {\\textbf{${escape(proj.name)}} $|$ \\emph{${escape(proj.technologies)}}}{}
  \\resumeItemListStart
    \\resumeItem{${escape(proj.description)}}
  \\resumeItemListEnd
`).join('')}
\\resumeSubHeadingListEnd

\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\small{\\item{
    \\textbf{Skills}{ : ${skills.map(escape).join(', ')}}
  }}
\\end{itemize}

\\end{document}`;
};

// ─── TEMPLATE 3: Data Science Tech Resume ────────────────────────────────────
const generateDataScience = (data) => {
  const { personalInfo, education, experience, skills, projects } = data;
  return `\\documentclass[a4paper,11pt]{article}
\\usepackage[utf8]{inputenc}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\usepackage[sfdefault]{roboto}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{2pt}
\\renewcommand{\\footrulewidth}{0pt}
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}
\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{\\large\\bfseries}{}{0em}{}[{\\color{black}\\titlerule[0.8pt]}]

\\begin{document}

\\begin{center}
  {\\Huge\\bfseries ${escape(personalInfo.fullName) || 'Your Name'}} \\\\[4pt]
  {\\large\\itshape Data Scientist} \\\\[4pt]
  \\small ${escape(personalInfo.phone)} $\\cdot$ ${escape(personalInfo.email)} $\\cdot$ ${escape(personalInfo.location)}
\\end{center}
\\vspace{4pt}

${personalInfo.summary ? `\\section{Objective}\n${escape(personalInfo.summary)}\n\n` : ''}

\\section{Skills}
\\begin{tabular}{@{}>{}l @{\\hspace{6ex}} l}
  Technical Skills & ${skills.slice(0, Math.ceil(skills.length / 2)).map(escape).join(', ')} \\\\
  ${skills.length > 1 ? `Additional Skills & ${skills.slice(Math.ceil(skills.length / 2)).map(escape).join(', ')} \\\\` : ''}
\\end{tabular}

\\section{Technical Experience}
${experience.filter(e => e.company).map(exp => `
\\textbf{${escape(exp.position)}} \\hfill ${escape(exp.startDate)} -- ${escape(exp.endDate)} \\\\
\\textit{${escape(exp.company)}} \\\\[2pt]
${escape(exp.description)} \\\\[6pt]
`).join('')}

${projects.filter(p => p.name).length > 0 ? `\\section{Projects}
${projects.filter(p => p.name).map(proj => `
\\textbf{${escape(proj.name)}} \\hfill \\textit{${escape(proj.technologies)}} \\\\
${escape(proj.description)} \\\\[6pt]
`).join('')}` : ''}

\\section{Education}
${education.filter(e => e.school).map(edu => `
\\textbf{${escape(edu.degree)}} \\hfill ${escape(edu.startDate)} -- ${escape(edu.endDate)} \\\\
\\textit{${escape(edu.school)}} \\\\[4pt]
`).join('')}

\\end{document}`;
};

// ─── TEMPLATE 4: Curriculum Vitae for Researchers (ModernCV) ─────────────────
const generateResearcherCV = (data) => {
  const { personalInfo, education, experience, skills, projects } = data;
  return `\\documentclass[12pt,a4paper,sans]{moderncv}
\\moderncvstyle{classic}
\\moderncvcolor{blue}
\\nopagenumbers{}
\\usepackage[utf8]{inputenc}
\\usepackage[margin=0.5in]{geometry}
\\usepackage{enumitem}

\\firstname{${escape(personalInfo.fullName?.split(' ')[0] || 'First')}}
\\familyname{${escape(personalInfo.fullName?.split(' ').slice(1).join(' ') || 'Last')}}
\\title{Researcher}
\\address{${escape(personalInfo.location)}}{}
\\phone{${escape(personalInfo.phone)}}
\\email{${escape(personalInfo.email)}}

\\begin{document}
\\makecvtitle

${personalInfo.summary ? `\\section{Research Interests}\n\\cvitem{}{${escape(personalInfo.summary)}}\n` : ''}

\\section{Education}
${education.filter(e => e.school).map(edu => `
\\cventry{${escape(edu.startDate)}--${escape(edu.endDate)}}{${escape(edu.degree)}}{${escape(edu.school)}}{}{}{}`).join('\n')}

\\section{Research Experience}
${experience.filter(e => e.company).map(exp => `
\\cventry{${escape(exp.startDate)}--${escape(exp.endDate)}}{${escape(exp.position)}}{${escape(exp.company)}}{}{}{
  ${escape(exp.description)}
}`).join('\n')}

\\section{Publications \\& Projects}
${projects.filter(p => p.name).map(proj => `
\\cvitem{${escape(proj.technologies)}}{\\textbf{${escape(proj.name)}}: ${escape(proj.description)}}`).join('\n')}

\\section{Skills}
\\cvitem{Technical}{${skills.map(escape).join(', ')}}

\\end{document}`;
};

// ─── TEMPLATE 5: Modular Professional CV ─────────────────────────────────────
const generateModularCV = (data) => {
  const { personalInfo, education, experience, skills, projects } = data;
  return `\\documentclass[12pt,a4paper]{article}
\\usepackage[utf8]{inputenc}
\\usepackage[T1]{fontenc}
\\usepackage{charter}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{\\vspace{-4pt}\\bfseries\\large}{}{0em}{}[{\\color{black}\\titlerule[0.8pt]}\\vspace{4pt}]

\\begin{document}

\\begin{center}
  {\\LARGE\\bfseries ${escape(personalInfo.fullName) || 'Full Name'}} \\\\[4pt]
  ${escape(personalInfo.phone)} $\\cdot$ ${escape(personalInfo.email)} $\\cdot$ ${escape(personalInfo.location)}
\\end{center}
\\vspace{6pt}
\\hrule
\\vspace{10pt}

${personalInfo.summary ? `\\section{Profile}\n${escape(personalInfo.summary)}\n\n` : ''}

\\section{Education}
${education.filter(e => e.school).map(edu => `
\\begin{tabularx}{\\textwidth}{@{}p{1.4in}X}
  \\textbf{${escape(edu.startDate)}} & \\textbf{${escape(edu.degree)}} \\\\
                     & \\textit{${escape(edu.school)}}
\\end{tabularx}\\vspace{4pt}
`).join('')}

\\section{Professional Experience}
${experience.filter(e => e.company).map(exp => `
\\begin{tabularx}{\\textwidth}{@{}p{1.4in}X}
  \\textbf{${escape(exp.startDate)}--} & \\textbf{${escape(exp.position)}} \\\\
  \\textit{${escape(exp.endDate)}} & \\textit{${escape(exp.company)}} \\\\
   & ${escape(exp.description)}
\\end{tabularx}\\vspace{6pt}
`).join('')}

\\section{Research \\& Projects}
\\begin{itemize}[leftmargin=*]
${projects.filter(p => p.name).map(proj => `  \\item \\textbf{${escape(proj.name)}}: ${escape(proj.description)}`).join('\n')}
\\end{itemize}

\\section{Skills}
${skills.map(escape).join(' $\\cdot$ ')}

\\end{document}`;
};

// ─── TEMPLATE 6: SFIUCR Academic CV ──────────────────────────────────────────
const generateSfiucrCV = (data) => {
  const { personalInfo, education, experience, skills, projects } = data;
  return `\\documentclass[a4paper,12pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[pdftex]{hyperref}
\\usepackage{fancyhdr}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}
\\urlstyle{rm}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{\\vspace{-10pt}\\scshape\\raggedright\\large}{}{0em}{}[\\color{black}\\titlerule \\vspace{-6pt}]

\\newcommand{\\resumeItem}[2]{\\item\\small{\\textbf{#1}{: #2 \\vspace{-2pt}}}}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
  \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{#3} & \\textit{#4} \\\\
  \\end{tabular*}\\vspace{-5pt}
}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
  \\textbf{{\\LARGE ${escape(personalInfo.fullName) || 'Your Name'}}} & Email: \\href{mailto:${personalInfo.email}}{${escape(personalInfo.email)}} \\\\
  & Mobile: ${escape(personalInfo.phone)} \\\\
  & ${escape(personalInfo.location)} \\\\
\\end{tabular*}

\\section{~~Education}
\\resumeSubHeadingListStart
${education.filter(e => e.school).map(edu => `
  \\resumeSubheading
    {${escape(edu.school)}}{${escape(edu.location || '')}}
    {${escape(edu.degree)}}{${escape(edu.startDate)} -- ${escape(edu.endDate)}}
`).join('')}
\\resumeSubHeadingListEnd
\\vspace{-5pt}

\\section{Skills Summary}
\\resumeSubHeadingListStart
  \\resumeItem{Technical Skills}{${skills.slice(0, Math.ceil(skills.length / 2)).map(escape).join(', ')}}
  ${skills.length > 2 ? `\\resumeItem{Tools \\& Platforms}{${skills.slice(Math.ceil(skills.length / 2)).map(escape).join(', ')}}` : ''}
\\resumeSubHeadingListEnd
\\vspace{-5pt}

\\section{Experience}
\\resumeSubHeadingListStart
${experience.filter(e => e.company).map(exp => `
  \\resumeSubheading{${escape(exp.company)}}{${escape(exp.location || '')}}
    {${escape(exp.position)}}{${escape(exp.startDate)} -- ${escape(exp.endDate)}}
  \\resumeItemListStart
    \\resumeItem{Responsibilities}{${escape(exp.description)}}
  \\resumeItemListEnd
  \\vspace{-5pt}
`).join('')}
\\resumeSubHeadingListEnd

\\section{Projects}
\\resumeSubHeadingListStart
${projects.filter(p => p.name).map(proj => `
  \\resumeItem{${escape(proj.name)} (${escape(proj.technologies)})}{${escape(proj.description)}}
  \\vspace{2pt}
`).join('')}
\\resumeSubHeadingListEnd

\\end{document}`;
};

// ─── TEMPLATE 7: Modern Simple ATS CV (moderncv banking) ─────────────────────
const generateModernSimpleAts = (data) => {
  const { personalInfo, education, experience, skills, projects } = data;
  return `\\documentclass[12pt,a4paper,sans]{moderncv}
\\moderncvstyle{banking}
\\moderncvcolor{black}
\\nopagenumbers{}
\\usepackage[utf8]{inputenc}
\\usepackage{ragged2e}
\\usepackage[margin=0.5in]{geometry}
\\usepackage{import}
\\usepackage{multicol}
\\usepackage{enumitem}
\\usepackage{amssymb}

\\name{${escape(personalInfo.fullName?.split(' ')[0] || 'First')}}{${escape(personalInfo.fullName?.split(' ').slice(1).join(' ') || 'Last')}}

\\newcommand*{\\customcventry}[7][.13em]{
  \\begin{tabular}{@{}l}
    {\\bfseries #4} \\\\
    {\\itshape #3}
  \\end{tabular}
  \\hfill
  \\begin{tabular}{l@{}}
    {\\bfseries #5} \\\\
    {\\itshape #2}
  \\end{tabular}
  \\ifx&#7&%
  \\else{\\\\
    \\begin{minipage}{\\maincolumnwidth}%
      \\small#7%
    \\end{minipage}}\\fi%
  \\par\\addvspace{#1}
}

\\begin{document}
\\makecvtitle
\\vspace*{-16mm}

\\begin{center}
  \\begin{tabular}{ c c c }
    ${escape(personalInfo.phone)} & ${escape(personalInfo.email)} & ${escape(personalInfo.location)}
  \\end{tabular}
\\end{center}

${personalInfo.summary ? `\\section{Profile}\n{${escape(personalInfo.summary)}}\n` : ''}

\\section{Professional Experience}
${experience.filter(e => e.company).map(exp => `
\\customcventry{${escape(exp.startDate)} -- ${escape(exp.endDate)}}{{${escape(exp.company)}}}{${escape(exp.position)},}{}{}{
  {\\begin{itemize}[leftmargin=0.6cm, label={\\textbullet}]
    \\item ${escape(exp.description)}
  \\end{itemize}}
}
`).join('')}

\\section{Projects}
${projects.filter(p => p.name).map(proj => `
\\customcventry{}{}{${escape(proj.name)},}{${escape(proj.technologies)}}{}{
  {\\begin{itemize}[leftmargin=0.6cm, label={\\textbullet}]
    \\item ${escape(proj.description)}
  \\end{itemize}}
}
`).join('')}

\\section{Education}
${education.filter(e => e.school).map(edu => `
\\customcventry{${escape(edu.startDate)}--${escape(edu.endDate)}}{${escape(edu.school)}}{${escape(edu.degree)},}{}{}{}
`).join('')}

\\section{Skills}
{\\begin{itemize}[label=\\textbullet]
${skills.map(s => `  \\item ${escape(s)}`).join('\n')}
\\end{itemize}}

\\end{document}`;
};

// ─── TEMPLATE 8: AltaCV (paracol two-column) ─────────────────────────────────
const generateAltaCV = (data) => {
  const { personalInfo, education, experience, skills, projects } = data;
  return `\\documentclass[11pt,a4paper,withhyper]{altacv}
\\geometry{left=0.5in,right=0.5in,top=0.5in,bottom=0.5in,columnsep=0.5in}
\\usepackage{paracol}
\\usepackage[rm]{roboto}
\\usepackage[defaultsans]{lato}
\\renewcommand{\\familydefault}{\\sfdefault}

\\definecolor{SlateGrey}{HTML}{2E2E2E}
\\definecolor{LightGrey}{HTML}{666666}
\\definecolor{DarkPastelRed}{HTML}{450808}
\\definecolor{PastelRed}{HTML}{8F0D0D}
\\definecolor{GoldenEarth}{HTML}{E7D192}
\\colorlet{name}{black}
\\colorlet{tagline}{PastelRed}
\\colorlet{heading}{DarkPastelRed}
\\colorlet{headingrule}{GoldenEarth}
\\colorlet{subheading}{PastelRed}
\\colorlet{accent}{PastelRed}
\\colorlet{emphasis}{SlateGrey}
\\colorlet{body}{LightGrey}

\\renewcommand{\\namefont}{\\Huge\\rmfamily\\bfseries}
\\renewcommand{\\personalinfofont}{\\footnotesize}
\\renewcommand{\\cvsectionfont}{\\LARGE\\rmfamily\\bfseries}
\\renewcommand{\\cvsubsectionfont}{\\large\\bfseries}
\\renewcommand{\\cvItemMarker}{{\\small\\textbullet}}

\\begin{document}
\\name{${escape(personalInfo.fullName) || 'Your Name'}}
\\tagline{${escape(personalInfo.summary?.split('.')[0] || 'Your Title')}}

\\personalinfo{
  \\email{${escape(personalInfo.email)}}
  \\phone{${escape(personalInfo.phone)}}
  \\location{${escape(personalInfo.location)}}
}

\\makecvheader
\\columnratio{0.6}
\\begin{paracol}{2}

\\cvsection{Experience}
${experience.filter(e => e.company).map(exp => `
\\cvevent{${escape(exp.position)}}{${escape(exp.company)}}{${escape(exp.startDate)} -- ${escape(exp.endDate)}}{}
\\begin{itemize}
  \\item ${escape(exp.description)}
\\end{itemize}
\\divider
`).join('')}

\\cvsection{Projects}
${projects.filter(p => p.name).map(proj => `
\\cvevent{${escape(proj.name)}}{${escape(proj.technologies)}}{}{}
\\begin{itemize}
  \\item ${escape(proj.description)}
\\end{itemize}
\\divider
`).join('')}

\\switchcolumn

\\cvsection{About Me}
\\begin{quote}
``${escape(personalInfo.summary)}''
\\end{quote}

\\cvsection{Education}
${education.filter(e => e.school).map(edu => `
\\cvevent{${escape(edu.degree)}}{${escape(edu.school)}}{${escape(edu.startDate)} -- ${escape(edu.endDate)}}{}
\\divider
`).join('')}

\\cvsection{Skills}
${skills.map(s => `\\cvtag{${escape(s)}}`).join('\n')}

\\end{paracol}
\\end{document}`;
};

// ─── TEMPLATE 9: Jake's Resume (clean single-column) ─────────────────────────
const generateJakesResume = (data) => {
  const { personalInfo, education, experience, skills, projects } = data;
  return `\\documentclass[a4paper,12pt]{article}
\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}
\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1.0in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}
\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]
\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{\\item\\small{{#1 \\vspace{-2pt}}}}
\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
  \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2 \\\\
    \\textit{\\small#3} & \\textit{\\small #4} \\\\
  \\end{tabular*}\\vspace{-7pt}
}
\\newcommand{\\resumeProjectHeading}[2]{
  \\item \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\small#1 & #2 \\\\
  \\end{tabular*}\\vspace{-7pt}
}
\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}
\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

\\begin{center}
  \\textbf{\\Huge \\scshape ${escape(personalInfo.fullName) || 'Jake Ryan'}} \\\\ \\vspace{1pt}
  \\small ${escape(personalInfo.phone)} $|$ \\href{mailto:${personalInfo.email}}{\\underline{${escape(personalInfo.email)}}} $|$
  \\href{https://linkedin.com}{\\underline{linkedin.com/in/${escape(personalInfo.fullName?.split(' ').join('').toLowerCase() || 'yourname')}}} $|$
  \\href{https://github.com}{\\underline{github.com/${escape(personalInfo.fullName?.split(' ').join('').toLowerCase() || 'yourname')}}}
\\end{center}

\\section{Education}
\\resumeSubHeadingListStart
${education.filter(e => e.school).map(edu => `
  \\resumeSubheading
    {${escape(edu.school)}}{${escape(edu.startDate)} -- ${escape(edu.endDate)}}
    {${escape(edu.degree)}}{}
`).join('')}
\\resumeSubHeadingListEnd

\\section{Experience}
\\resumeSubHeadingListStart
${experience.filter(e => e.company).map(exp => `
  \\resumeSubheading
    {${escape(exp.position)}}{${escape(exp.startDate)} -- ${escape(exp.endDate)}}
    {${escape(exp.company)}}{}
  \\resumeItemListStart
    \\resumeItem{${escape(exp.description)}}
  \\resumeItemListEnd
`).join('')}
\\resumeSubHeadingListEnd

\\section{Projects}
\\resumeSubHeadingListStart
${projects.filter(p => p.name).map(proj => `
  \\resumeProjectHeading
    {\\textbf{${escape(proj.name)}} $|$ \\emph{${escape(proj.technologies)}}}{}
  \\resumeItemListStart
    \\resumeItem{${escape(proj.description)}}
  \\resumeItemListEnd
`).join('')}
\\resumeSubHeadingListEnd

\\section{Technical Skills}
\\begin{itemize}[leftmargin=0.15in, label={}]
  \\small{\\item{
    \\textbf{Languages \& Skills}{: ${skills.map(escape).join(', ')}}
  }}
\\end{itemize}

\\end{document}`;
};

// ─── Main Export ──────────────────────────────────────────────────────────────
export const generateLatex = (data, templateId = 'jakes_resume') => {
  const optimizedData = optimizeResumeData(data, templateId);

  switch (templateId) {
    case 'ats_technical':   return generateAtsTechnical(optimizedData);
    case 'swe_lato':        return generateSweResume(optimizedData);
    case 'data_science':    return generateDataScience(optimizedData);
    case 'academic_researcher': return generateResearcherCV(optimizedData);
    case 'modular_cv':      return generateModularCV(optimizedData);
    case 'sfiucr_cv':       return generateSfiucrCV(optimizedData);
    case 'modern_simple_ats': return generateModernSimpleAts(optimizedData);
    case 'altacv':          return generateAltaCV(optimizedData);
    case 'jakes_resume':
    default:                return generateJakesResume(optimizedData);
  }
};
