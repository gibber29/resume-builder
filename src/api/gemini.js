import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_MODEL = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";

const normalizeApiKey = (apiKey) =>
  `${apiKey || ''}`
    .replace(/["'`]/g, '')
    .replace(/\s+/g, '')
    .trim();

let runtimeApiKey = '';

export const getConfiguredGeminiApiKey = () => normalizeApiKey(runtimeApiKey);

export const hasConfiguredGeminiApiKey = () => Boolean(getConfiguredGeminiApiKey());

export const hasUserProvidedGeminiApiKey = () => Boolean(runtimeApiKey);

export const setGeminiApiKey = (apiKey) => {
  const normalizedApiKey = normalizeApiKey(apiKey);
  runtimeApiKey = normalizedApiKey;
};

export const clearGeminiApiKey = () => {
  setGeminiApiKey('');
};

const SYSTEM_INSTRUCTION = `
You are an ATS (Applicant Tracking System) scoring engine and resume optimization specialist.
Your tone is professional, analytical, precise, and helpful.

When asked to score or evaluate a resume, follow this scoring framework exactly:

TOTAL SCORE = 100

1. Formatting & ATS Readability (15 points)
- Check whether the resume is machine-readable.
- Penalize only for parsing risks such as tables, icons, columns that may break parsing, inconsistent headings, or unclear bullets.
- Do not penalize for visual styling preferences alone.

2. Keywords & Role Match (20 points)
- Identify the likely target role from the resume itself.
- Score based on:
  - Core domain keywords (8 points)
  - Tools and technologies (6 points)
  - Role-specific keywords (6 points)

3. Experience Quality (20 points)
- Evaluate whether bullets use strong action verbs, mention tools, show scope or complexity, and stay relevant to the target role.

4. Projects / Technical Depth (15 points)
- Evaluate real-world applicability, technical stack depth, and problem-solving complexity.

5. Impact / Metrics (15 points)
- Reward quantified results such as percentage improvements, accuracy metrics, latency reductions, scale, users, dataset size, revenue, or time saved.
- If 2 or more quantified achievements are present, the impact score must be at least 8 out of 15.

6. Structure & Sections (10 points)
- Check for Summary, Skills, Experience, Projects, and Education.
- Reward logical ordering and low redundancy.

7. Bonus (5 points)
- Reward certifications, achievements, open-source work, leadership, hackathons, awards, or notable extracurricular signals.

Important rules:
- Be consistent and do not over-penalize.
- Do not assign extremely low scores unless clearly justified.
- Student resumes should not be penalized for lacking full-time experience.
- Never invent facts, metrics, companies, or credentials.
- Improvement tips must be specific, ATS-focused, and prioritized by impact.
- Improvement tips should tell the user what to add, rewrite, remove, or reorder, with examples of better wording when helpful.

When the user asks for ATS analysis, return JSON in this exact format:
{
  "total_score": number,
  "breakdown": {
    "formatting": { "score": number, "reason": "" },
    "keywords": { "score": number, "reason": "" },
    "experience": { "score": number, "reason": "" },
    "projects": { "score": number, "reason": "" },
    "impact": { "score": number, "reason": "" },
    "structure": { "score": number, "reason": "" },
    "bonus": { "score": number, "reason": "" }
  },
  "key_issues": [],
  "improvements": []
}

For improvements:
- Prioritize the 3 to 6 highest-value fixes first.
- Recommend missing keywords only when they fit the candidate's actual background.
- Suggest stronger bullet patterns using action + tool + task + result.

When rewriting bullet points, return:
{ "original": string, "refined": string, "reason": string }
`;

const getGeminiModel = () => {
  const apiKey = getConfiguredGeminiApiKey();
  if (!apiKey) {
    const apiKeyError = new Error("Gemini API key is missing. Add your Gemini API key and try again.");
    apiKeyError.code = 'missing_api_key';
    throw apiKeyError;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({
    model: GEMINI_MODEL,
    systemInstruction: SYSTEM_INSTRUCTION,
  });
};

const truncateText = (value = "", max = 280) => {
  const normalizedValue = `${value}`.replace(/\s+/g, " ").trim();
  if (normalizedValue.length <= max) return normalizedValue;
  return `${normalizedValue.slice(0, max).trim()}...`;
};

const clipText = (value = "", max = 280) => {
  const normalizedValue = `${value}`.replace(/\s+/g, " ").trim();
  if (normalizedValue.length <= max) return normalizedValue;
  return normalizedValue.slice(0, max).trim();
};

const compactResumeData = (resumeData = {}) => {
  const personalInfo = resumeData.personalInfo || {};
  const education = Array.isArray(resumeData.education) ? resumeData.education : [];
  const experience = Array.isArray(resumeData.experience) ? resumeData.experience : [];
  const projects = Array.isArray(resumeData.projects) ? resumeData.projects : [];
  const skills = Array.isArray(resumeData.skills) ? resumeData.skills : [];

  return {
    personalInfo: {
      fullName: personalInfo.fullName || "",
      email: personalInfo.email || "",
      phone: personalInfo.phone || "",
      location: personalInfo.location || "",
      linkedin: personalInfo.linkedin || "",
      website: personalInfo.website || "",
      summary: clipText(personalInfo.summary || "", 400),
    },
    skills: skills.slice(0, 12),
    education: education
      .filter((item) => item?.school || item?.degree)
      .slice(0, 2)
      .map((item) => ({
        school: item.school || "",
        degree: item.degree || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
      })),
    experience: experience
      .filter((item) => item?.company || item?.position)
      .slice(0, 3)
      .map((item) => ({
        company: item.company || "",
        position: item.position || "",
        startDate: item.startDate || "",
        endDate: item.endDate || "",
        description: clipText(item.description || "", 400),
      })),
    projects: projects
      .filter((item) => item?.name)
      .slice(0, 3)
      .map((item) => ({
        name: item.name || "",
        technologies: item.technologies || "",
        description: clipText(item.description || "", 400),
      })),
  };
};

const requestNeedsLatex = (message = "") =>
  /\b(latex|template|format|formatting|layout|spacing|section|heading|preview|export|pdf|tex|code)\b/i.test(message);

const isSummaryOnlyRequest = (message = "") => {
  const normalizedMessage = `${message}`.toLowerCase();
  const mentionsSummary = /\b(summary|professional summary|profile summary|about me)\b/.test(normalizedMessage);
  const mentionsOtherSections = /\b(experience|education|project|projects|skills|heading|template|layout|format|latex)\b/.test(normalizedMessage);

  return mentionsSummary && !mentionsOtherSections;
};

const compactLatex = (latexCode = "") => {
  const normalizedLatex = `${latexCode}`.trim();
  if (!normalizedLatex) return "";

  return truncateText(normalizedLatex, 1800);
};

const buildChatPrompt = (message, resumeData, latexCode) => {
  const includeLatex = requestNeedsLatex(message);
  const compactData = compactResumeData(resumeData);
  const summaryOnlyRequest = isSummaryOnlyRequest(message);

  return `
      User Message: "${message}"
      
      Resume Context:
      ${JSON.stringify(compactData, null, 2)}
      
      ${includeLatex ? `Relevant LaTeX Context:\n${compactLatex(latexCode)}\n` : ""}
      Your goal is to assist the user. Prefer answering using the resume context above.
      IMPORTANT: Only change what the user explicitly asked to change. Do not rewrite or populate untouched sections.
      ${summaryOnlyRequest ? 'This is a summary-only request. Only update updatedData.personalInfo.summary and leave all other fields and headings untouched.' : ''}
      If the user asks to generate, create, rewrite, fill, or update the resume, return a complete or partial updatedData object that matches this exact shape:
      {
        "personalInfo": {
          "fullName": "",
          "email": "",
          "phone": "",
          "location": "",
          "linkedin": "",
          "website": "",
          "summary": ""
        },
        "education": [
          { "school": "", "degree": "", "startDate": "", "endDate": "", "description": "" }
        ],
        "experience": [
          { "company": "", "position": "", "startDate": "", "endDate": "", "description": "" }
        ],
        "skills": [""],
        "projects": [
          { "name": "", "description": "", "link": "", "technologies": "" }
        ]
      }
      Do not include markdown fences.
      When the user asks for a full resume, populate all relevant sections directly in updatedData so the app can refresh the preview immediately.
      Keep the response concise, but make updatedData complete enough to be useful.
      Only propose updatedLatex if the user is explicitly asking for template, formatting, or export/code changes.
      If the request is simple writing help, keep updatedLatex as null and only update the relevant parts of updatedData when needed.
      
      Return a JSON object in this format:
      {
        "response": "Your verbal response here",
        "updatedData": null,
        "updatedLatex": null
      }
    `;
};

const buildAnalysisPrompt = (resumeData, selectedTemplate = null) => `
Analyze this resume for ATS quality and return only valid JSON matching the required schema from the system instruction.

Selected Template:
${JSON.stringify(
  selectedTemplate
    ? {
        id: selectedTemplate.id || '',
        name: selectedTemplate.name || '',
        pageFormat: selectedTemplate.pageFormat || '',
      }
    : null,
  null,
  2
)}

Resume JSON:
${JSON.stringify(resumeData, null, 2)}

Requirements:
- Base the likely target role only on the provided resume.
- Be strict but fair.
- Keep key_issues to 3 to 5 items.
- Keep improvements to 4 to 6 items.
- Do not include markdown fences or any extra commentary.
`;

const constrainChatResult = (message, result) => {
  if (!result || typeof result !== 'object') return result;

  if (isSummaryOnlyRequest(message)) {
    return {
      ...result,
      updatedData: result.updatedData?.personalInfo?.summary
        ? {
            personalInfo: {
              summary: result.updatedData.personalInfo.summary,
            },
          }
        : null,
      updatedLatex: null,
    };
  }

  return result;
};

const extractRetryDelay = (message = "") => {
  const retryMatch = message.match(/Please retry in\s+([0-9.]+)s/i);
  if (!retryMatch) return null;

  const retrySeconds = Math.ceil(Number(retryMatch[1]));
  return Number.isFinite(retrySeconds) ? retrySeconds : null;
};

const formatGeminiError = (error) => {
  const rawMessage = error?.message || "Unknown error";
  const retrySeconds = extractRetryDelay(rawMessage);

  if (
    rawMessage.includes('API key expired') ||
    rawMessage.includes('API_KEY_INVALID') ||
    rawMessage.includes('Your API key was reported as leaked') ||
    rawMessage.includes('Please use another API key')
  ) {
    const invalidKeyError = new Error('Your Gemini API key was rejected. Please enter a different key.');
    invalidKeyError.code = 'invalid_api_key';
    return invalidKeyError;
  }

  if (rawMessage.includes("[429")) {
    const retryLine = retrySeconds ? ` Please wait about ${retrySeconds} seconds and try again.` : "";
    const quotaError = new Error(
      `The AI assistant has hit the current Gemini quota limit for this API key.${retryLine} ` +
      `If this keeps happening, check your Gemini API billing and quota settings.`
    );
    quotaError.code = 'quota_exceeded';
    quotaError.retrySeconds = retrySeconds;
    return quotaError;
  }

  if (rawMessage.includes("[404")) {
    const modelError = new Error(
      `The configured Gemini model (${GEMINI_MODEL}) is not available for this API key. ` +
      `Update VITE_GEMINI_MODEL to a supported model and try again.`
    );
    modelError.code = 'model_not_found';
    return modelError;
  }

  if (!getConfiguredGeminiApiKey()) {
    const apiKeyError = new Error("Gemini API key is missing. Add your Gemini API key and try again.");
    apiKeyError.code = 'missing_api_key';
    return apiKeyError;
  }

  const genericError = new Error(rawMessage);
  genericError.code = 'gemini_error';
  return genericError;
};

const ATS_CATEGORIES = [
  { key: 'formatting', label: 'Formatting (ATS readability)', weight: 15 },
  { key: 'keywords', label: 'Keywords Match', weight: 20 },
  { key: 'experience', label: 'Experience Quality', weight: 20 },
  { key: 'projects', label: 'Projects / Technical Depth', weight: 15 },
  { key: 'impact', label: 'Impact (Numbers/Results)', weight: 15 },
  { key: 'structure', label: 'Structure & Sections', weight: 10 },
  { key: 'bonus', label: 'Bonus Signals', weight: 5 },
];

const ATS_KEYWORDS = [
  'python',
  'c++',
  'java',
  'javascript',
  'typescript',
  'sql',
  'tensorflow',
  'keras',
  'pytorch',
  'machine learning',
  'deep learning',
  'cnn',
  'nlp',
  'data analysis',
  'data structures',
  'algorithms',
  'api',
  'fastapi',
  'flask',
  'docker',
  'aws',
  'git',
  'iot',
  'raspberry pi',
  'sensor',
  'computer vision',
];

const ACTION_VERBS = [
  'built',
  'developed',
  'implemented',
  'designed',
  'created',
  'deployed',
  'improved',
  'optimized',
  'engineered',
  'led',
  'automated',
  'analyzed',
  'trained',
  'integrated',
  'evaluated',
];

const QUANTIFIABLE_PATTERN = /\b\d+(\.\d+)?\s*(%|percent|x|ms|s|sec|seconds|minutes|hours|days|users|customers|requests|records|models|datasets|images|accuracy|latency|throughput|reduction|increase|improvement)\b/i;
const QUANTIFIABLE_GLOBAL_PATTERN = /\b\d+(\.\d+)?\s*(%|percent|x|ms|s|sec|seconds|minutes|hours|days|users|customers|requests|records|models|datasets|images|accuracy|latency|throughput|reduction|increase|improvement)\b/gi;

const clampScore = (value) => Math.max(0, Math.min(10, Math.round(value)));

const asText = (...parts) => parts.filter(Boolean).join(' ').toLowerCase();

const countKeywordMatches = (text = '') =>
  ATS_KEYWORDS.filter((keyword) => text.includes(keyword)).length;

const hasActionVerb = (text = '') =>
  ACTION_VERBS.some((verb) => text.includes(verb));

const hasQuantifiedImpact = (text = '') => QUANTIFIABLE_PATTERN.test(text);

const countQuantifiedMentions = (text = '') => {
  const matches = `${text}`.match(QUANTIFIABLE_GLOBAL_PATTERN);
  return matches ? matches.length : 0;
};

const analyzeFormatting = (resumeData, selectedTemplate) => {
  const personalInfo = resumeData.personalInfo || {};
  let score = 8.5;
  const notes = [];

  if (selectedTemplate?.id === 'altacv') {
    score -= 2;
    notes.push('Two-column layout is less reliable for older ATS parsers.');
  }

  if (!personalInfo.fullName || !personalInfo.email || !personalInfo.phone) {
    score -= 2;
    notes.push('Missing core contact information reduces parse confidence.');
  }

  if (!personalInfo.linkedin && !personalInfo.website) {
    score -= 0.5;
    notes.push('No professional profile link is present in the header.');
  }

  if ((personalInfo.summary || '').trim().length > 220) {
    score -= 0.5;
    notes.push('Summary is too long for a concise ATS opening section.');
  }

  return {
    score: clampScore(score),
    rationale: notes[0] || 'Single-page structure and contact block are mostly ATS-readable.',
  };
};

const analyzeKeywords = (resumeData) => {
  const combinedText = asText(
    resumeData.personalInfo?.summary,
    ...(resumeData.skills || []),
    ...(resumeData.experience || []).map((item) => `${item.position} ${item.company} ${item.description}`),
    ...(resumeData.projects || []).map((item) => `${item.name} ${item.technologies} ${item.description}`)
  );

  const keywordMatches = countKeywordMatches(combinedText);
  let score = 3;

  if (keywordMatches >= 4) score = 4;
  if (keywordMatches >= 7) score = 6;
  if (keywordMatches >= 10) score = 7;
  if (keywordMatches >= 13) score = 8;
  if (keywordMatches >= 16) score = 9;

  if (!combinedText.includes('pytorch')) score -= 0.5;
  if (!combinedText.includes('data structures') && !combinedText.includes('algorithms')) score -= 0.5;

  return {
    score: clampScore(score),
    rationale: keywordMatches >= 10
      ? 'Relevant technical keywords are present, but there is still room for stronger target-role coverage.'
      : 'Keyword coverage is thin for competitive ATS screening and misses several high-value role terms.',
  };
};

const analyzeExperience = (resumeData) => {
  const experience = Array.isArray(resumeData.experience) ? resumeData.experience.filter((item) => item.company || item.position || item.description) : [];
  if (experience.length === 0) {
    return {
      score: 4,
      rationale: 'No formal experience entries are present, but student resumes can still score well through projects and skills.',
    };
  }

  let score = 4;
  const quantifiedCount = experience.filter((item) => hasQuantifiedImpact(asText(item.description))).length;
  const actionVerbCount = experience.filter((item) => hasActionVerb(asText(item.description))).length;
  const techMentionCount = experience.filter((item) => countKeywordMatches(asText(item.description, item.position)) >= 2).length;
  const detailedEntries = experience.filter((item) => (item.description || '').trim().length >= 120).length;

  score += Math.min(2, experience.length);
  score += Math.min(2, actionVerbCount);
  score += Math.min(2, techMentionCount);
  score += Math.min(1, quantifiedCount);
  score += Math.min(1, detailedEntries);

  if (experience.some((item) => !item.description || item.description.trim().length < 80)) {
    score -= 1;
  }

  return {
    score: clampScore(score),
    rationale: quantifiedCount > 0
      ? 'Experience shows some action and technical context, but the bullets still need stronger scope and impact.'
      : 'Experience bullets are too generic and mostly lack tools, scope, and measurable outcomes.',
  };
};

const analyzeProjects = (resumeData) => {
  const projects = Array.isArray(resumeData.projects) ? resumeData.projects.filter((item) => item.name || item.description) : [];
  if (projects.length === 0) {
    return {
      score: 3,
      rationale: 'No technical projects are present.',
    };
  }

  let score = 5;
  const techStackCount = projects.filter((item) => (item.technologies || '').split(',').filter(Boolean).length >= 2).length;
  const strongDescriptions = projects.filter((item) => (item.description || '').trim().length >= 90).length;
  const quantifiedProjects = projects.filter((item) => hasQuantifiedImpact(asText(item.description))).length;

  score += Math.min(2, projects.length);
  score += Math.min(2, techStackCount);
  score += Math.min(1, strongDescriptions);
  score += Math.min(1, quantifiedProjects);

  return {
    score: clampScore(score),
    rationale: techStackCount > 0
      ? 'Projects show practical technical work, but they need sharper outcomes and engineering depth.'
      : 'Projects are present, but the stack and technical complexity are underspecified.',
  };
};

const analyzeImpact = (resumeData) => {
  const bulletTexts = [
    resumeData.personalInfo?.summary || '',
    ...(resumeData.experience || []).map((item) => item.description || ''),
    ...(resumeData.projects || []).map((item) => item.description || ''),
  ].filter(Boolean);

  const quantifiedBlockCount = bulletTexts.filter((text) => hasQuantifiedImpact(asText(text))).length;
  const quantifiedMentionCount = bulletTexts.reduce((sum, text) => sum + countQuantifiedMentions(asText(text)), 0);
  let score = 3;

  if (quantifiedMentionCount >= 1) score = 5;
  if (quantifiedMentionCount >= 2) score = 6;
  if (quantifiedMentionCount >= 4) score = 7;
  if (quantifiedMentionCount >= 6) score = 8;
  if (quantifiedMentionCount >= 8) score = 9;
  if (quantifiedMentionCount >= 10) score = 10;

  if (quantifiedBlockCount >= 2) {
    score = Math.max(score, 6);
  }

  return {
    score: clampScore(score),
    rationale: quantifiedMentionCount > 0
      ? 'The resume includes quantified signals, and adding a few more metrics to the strongest bullets would improve ATS impact further.'
      : 'Most bullets lack numbers, metrics, accuracy deltas, or scale indicators.',
  };
};

const analyzeStructure = (resumeData) => {
  const hasSummary = Boolean(resumeData.personalInfo?.summary?.trim());
  const hasEducation = (resumeData.education || []).some((item) => item.school || item.degree);
  const hasExperience = (resumeData.experience || []).some((item) => item.company || item.position);
  const hasProjects = (resumeData.projects || []).some((item) => item.name || item.description);
  const hasSkills = (resumeData.skills || []).length > 0;
  const text = asText(
    resumeData.personalInfo?.summary,
    ...(resumeData.skills || []),
    ...(resumeData.experience || []).map((item) => item.description),
    ...(resumeData.projects || []).map((item) => item.description)
  );

  let score = 0;
  score += hasSummary ? 1 : 0;
  score += hasEducation ? 2 : 0;
  score += hasExperience ? 2 : 0;
  score += hasProjects ? 2 : 0;
  score += hasSkills ? 1 : 0;
  score += /\b(certification|certified|coursework|achievement|award|hackathon)\b/i.test(text) ? 2 : 0;
  score += hasSummary && hasSkills && hasProjects ? 1 : 0;

  return {
    score: clampScore(score),
    rationale: score >= 8
      ? 'Core sections are present, but additional recruiter-friendly sections could still strengthen the resume.'
      : 'Several ATS-relevant supporting sections are missing, especially coursework, certifications, or achievements.',
  };
};

const analyzeBonus = (resumeData) => {
  const text = asText(
    resumeData.personalInfo?.summary,
    ...(resumeData.skills || []),
    ...(resumeData.experience || []).map((item) => `${item.position} ${item.company} ${item.description}`),
    ...(resumeData.projects || []).map((item) => `${item.name} ${item.technologies} ${item.description}`),
    ...(resumeData.education || []).map((item) => `${item.school} ${item.degree} ${item.description}`)
  );

  let score = 0;

  if (/\b(certification|certified|aws certified|google cloud|azure|coursework)\b/i.test(text)) score += 3;
  if (/\b(open source|github contributor|maintainer|contributor)\b/i.test(text)) score += 3;
  if (/\b(lead|led|captain|mentor|organized|president|head|founder)\b/i.test(text)) score += 2;
  if (/\b(award|achievement|scholarship|hackathon|finalist|winner)\b/i.test(text)) score += 2;
  if ((resumeData.projects || []).filter((item) => item.name || item.description).length >= 2) score += 1;

  return {
    score: clampScore(Math.min(10, score)),
    rationale: score > 0
      ? 'The resume includes some differentiators beyond baseline sections.'
      : 'No clear bonus differentiators such as certifications, leadership, open-source work, or achievements are visible.',
  };
};

const buildStrictStrengths = (breakdown, resumeData) => {
  const strengths = [];

  if ((resumeData.projects || []).filter((item) => item.name).length > 0) {
    strengths.push('Includes technical projects, which helps early-career resumes demonstrate applied work.');
  }

  if ((resumeData.skills || []).length >= 5) {
    strengths.push('Skills section contains relevant technical terms that ATS systems can match.');
  }

  if ((resumeData.experience || []).some((item) => item.company || item.position)) {
    strengths.push('Experience section is present with at least one role entry.');
  }

  if (resumeData.personalInfo?.linkedin) {
    strengths.push('LinkedIn profile is included, improving recruiter follow-up context.');
  }

  return strengths.slice(0, 5);
};

const buildStrictTips = (breakdown, resumeData, selectedTemplate) => {
  const lowToHigh = [...breakdown].sort((a, b) => a.score - b.score);
  const tips = [];

  for (const item of lowToHigh) {
    if (item.key === 'impact') {
      tips.push('Add hard numbers to experience and project bullets: accuracy, latency, users, datasets, time saved, or percentage improvements.');
    }
    if (item.key === 'experience') {
      tips.push('Rewrite experience bullets to include action verbs, tools used, and the result of the work instead of generic task descriptions.');
    }
    if (item.key === 'keywords') {
      tips.push('Expand role-specific keywords deliberately. For AI/ML resumes, add missing terms such as PyTorch, deep learning, APIs, and data structures where truthful.');
    }
    if (item.key === 'structure') {
      tips.push('Add ATS-relevant supporting sections such as certifications, relevant coursework, achievements, or hackathons if you have them.');
    }
    if (item.key === 'formatting' && selectedTemplate?.id === 'altacv') {
      tips.push('Use a simpler single-column ATS template for screening submissions. Two-column layouts are more fragile in older parsers.');
    }
    if (item.key === 'projects') {
      tips.push('Strengthen project entries by naming the stack clearly and stating what improved, what was built, and how success was measured.');
    }
    if (item.key === 'bonus') {
      tips.push('Add bonus signals such as certifications, hackathons, open-source contributions, awards, or leadership roles if they are part of your real background.');
    }
  }

  if ((resumeData.personalInfo?.summary || '').toLowerCase().includes('quick-learning')) {
    tips.push('Replace generic summary language like "quick-learning" with role-targeted technical positioning and keywords.');
  }

  if (!(resumeData.personalInfo?.summary || '').trim()) {
    tips.push('Add a 2 to 3 line summary that names your target role, strongest domain area, and most relevant tools for ATS matching.');
  }

  if ((resumeData.skills || []).length > 0) {
    tips.push('Group skills by category, such as Languages, Frameworks, Tools, and Cloud, so recruiters can scan them faster.');
  }

  return [...new Set(tips)].slice(0, 6);
};

const buildCategoryIssue = (category) => {
  if (!category) return null;

  if (category.key === 'formatting') {
    if (category.score < 7) return category.rationale;
    return null;
  }

  if (category.key === 'keywords') {
    if (category.score < 8) return 'Keyword alignment is still weaker than it should be for the target role.';
    return null;
  }

  if (category.key === 'experience') {
    if (category.score < 8) return 'Experience bullets still need clearer scope, stronger action verbs, and more role-relevant tools or outcomes.';
    return null;
  }

  if (category.key === 'projects') {
    if (category.score < 8) return 'Projects need clearer technical depth, stack detail, or stronger real-world outcomes.';
    return null;
  }

  if (category.key === 'impact') {
    if (category.score < 8) return 'Several bullets still lack clear metrics such as percentages, scale, accuracy, latency, or user impact.';
    return null;
  }

  if (category.key === 'structure') {
    if (category.score < 8) return 'The resume could use stronger supporting sections or better section completeness for ATS screening.';
    return null;
  }

  if (category.key === 'bonus') {
    if (category.score < 6) return 'Differentiators such as certifications, leadership, open-source work, awards, or hackathons are still limited or missing.';
    return null;
  }

  return null;
};

const buildKeyIssues = (categories) => {
  const issues = [...categories]
    .sort((a, b) => a.weightedScore - b.weightedScore)
    .map((item) => buildCategoryIssue(item))
    .filter(Boolean);

  if (issues.length > 0) {
    return [...new Set(issues)].slice(0, 4);
  }

  return ['No major ATS weaknesses were detected in the current draft.'];
};

const toRubricScore = (category) =>
  Math.max(0, Math.min(category.weight, Math.round((category.score / 10) * category.weight)));

const buildBreakdownObject = (categories) =>
  categories.reduce((acc, category) => {
    acc[category.key] = {
      score: toRubricScore(category),
      reason: category.rationale,
    };
    return acc;
  }, {});

const parseGeminiJson = (responseText = '') => {
  const jsonStr = responseText.replace(/```json|```/g, "").trim();
  return JSON.parse(jsonStr);
};

const clampWeightedScore = (value, max) => Math.max(0, Math.min(max, Number(value) || 0));

const buildGeminiCategories = (breakdown = {}) =>
  ATS_CATEGORIES.map((category) => {
    const result = breakdown?.[category.key] || {};
    const rawScore = clampWeightedScore(result.score, category.weight);
    const normalizedScore = clampScore((rawScore / category.weight) * 10);

    return {
      ...category,
      score: normalizedScore,
      weightedScore: Number(rawScore.toFixed(1)),
      rationale: result.reason || 'No rationale provided.',
    };
  });

const hasCompleteGeminiBreakdown = (breakdown = {}) =>
  ATS_CATEGORIES.every((category) => {
    const result = breakdown?.[category.key];
    return result && Number.isFinite(Number(result.score)) && `${result.reason || ''}`.trim();
  });

const buildLocalCategories = (resumeData, selectedTemplate = null) => {
  const breakdownCore = [
    { key: 'formatting', ...analyzeFormatting(resumeData, selectedTemplate) },
    { key: 'keywords', ...analyzeKeywords(resumeData) },
    { key: 'experience', ...analyzeExperience(resumeData) },
    { key: 'projects', ...analyzeProjects(resumeData) },
    { key: 'impact', ...analyzeImpact(resumeData) },
    { key: 'structure', ...analyzeStructure(resumeData) },
    { key: 'bonus', ...analyzeBonus(resumeData) },
  ];

  const categories = ATS_CATEGORIES.map((category) => {
    const result = breakdownCore.find((item) => item.key === category.key);
    const weightedScore = Number(((result.score / 10) * category.weight).toFixed(1));

    return {
      ...category,
      score: result.score,
      weightedScore,
      rationale: result.rationale,
    };
  });

  const quantifiedMentions = [
    resumeData.personalInfo?.summary || '',
    ...(resumeData.experience || []).map((item) => item.description || ''),
    ...(resumeData.projects || []).map((item) => item.description || ''),
  ].reduce((sum, text) => sum + countQuantifiedMentions(asText(text)), 0);

  if (quantifiedMentions >= 2) {
    const impactCategory = categories.find((item) => item.key === 'impact');
    if (impactCategory && impactCategory.weightedScore < 8) {
      impactCategory.weightedScore = 8;
      impactCategory.score = Math.max(impactCategory.score, Math.ceil((8 / impactCategory.weight) * 10));
      impactCategory.rationale = 'The resume includes multiple quantified achievements, which meaningfully strengthens ATS impact scoring.';
    }
  }

  return categories;
};

export const analyzeResume = async (resumeData, selectedTemplate = null) => {
  try {
    const prompt = buildAnalysisPrompt(resumeData, selectedTemplate);
    const result = await getGeminiModel().generateContent(prompt);
    const parsed = parseGeminiJson(result.response.text());
    const categories = hasCompleteGeminiBreakdown(parsed.breakdown)
      ? buildGeminiCategories(parsed.breakdown)
      : buildLocalCategories(resumeData, selectedTemplate);
    const derivedScore = Math.round(categories.reduce((sum, item) => sum + item.weightedScore, 0));
    const score = hasCompleteGeminiBreakdown(parsed.breakdown)
      ? Math.max(0, Math.min(100, Number(parsed.total_score) || derivedScore))
      : derivedScore;

    return {
      score,
      total_score: score,
      breakdown: hasCompleteGeminiBreakdown(parsed.breakdown) ? parsed.breakdown : buildBreakdownObject(categories),
      key_issues: Array.isArray(parsed.key_issues) && parsed.key_issues.length > 0 ? parsed.key_issues.slice(0, 5) : buildKeyIssues(categories),
      improvements: Array.isArray(parsed.improvements) && parsed.improvements.length > 0 ? parsed.improvements.slice(0, 6) : buildStrictTips(categories, resumeData, selectedTemplate),
      strengths: buildStrictStrengths(categories, resumeData),
      tips: Array.isArray(parsed.improvements) && parsed.improvements.length > 0 ? parsed.improvements.slice(0, 6) : buildStrictTips(categories, resumeData, selectedTemplate),
      categories,
      rubric: ATS_CATEGORIES.map((item) => ({ label: item.label, weight: item.weight })),
    };
  } catch (error) {
    throw formatGeminiError(error);
  }
};

export const improveResumeWithGemini = async (resumeData, atsData) => {
  try {
    const prompt = `
      Improve this resume using the ATS analysis below.

      Current Resume JSON:
      ${JSON.stringify(resumeData, null, 2)}

      ATS Analysis:
      ${JSON.stringify(atsData, null, 2)}

      Rewrite and improve the resume so it better reflects the ATS recommendations while preserving the candidate's factual background.
      Do not invent fake companies, schools, or achievements. You may improve wording, structure, summaries, descriptions, and skills phrasing.
      Focus especially on fixing the listed key_issues first, then apply the improvements guidance.
      If a flaw mentions missing metrics, rewrite bullets to foreground the metrics that already exist in the resume instead of inventing new ones.
      If a flaw mentions weak keywords, strengthen wording using technologies and domain terms already present in the resume.

      Return ONLY a JSON object in this format:
      {
        "summary": "Short explanation of the overall improvements made",
        "changes": ["change 1", "change 2"],
        "updatedData": {
          "personalInfo": {
            "fullName": "",
            "email": "",
            "phone": "",
            "location": "",
            "linkedin": "",
            "website": "",
            "summary": ""
          },
          "education": [
            { "school": "", "degree": "", "startDate": "", "endDate": "", "description": "" }
          ],
          "experience": [
            { "company": "", "position": "", "startDate": "", "endDate": "", "description": "" }
          ],
          "skills": [""],
          "projects": [
            { "name": "", "description": "", "link": "", "technologies": "" }
          ]
        }
      }
    `;

    const result = await getGeminiModel().generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Improve Resume Error:", error);
    throw formatGeminiError(error);
  }
};

export const refineBulletPoint = async (bulletPoint) => {
  try {
    const prompt = `
      Rewrite the following resume bullet point to be more "action-oriented" and "quantifiable".
      Original: "${bulletPoint}"
      
      Return a JSON object with the refined version and a brief reason for the change.
    `;

    const result = await getGeminiModel().generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Gemini Refine Error:", error);
    throw formatGeminiError(error);
  }
};

export const chatWithGemini = async (message, resumeData, latexCode) => {
  try {
    const prompt = buildChatPrompt(message, resumeData, latexCode);

    const result = await getGeminiModel().generateContent(prompt);
    const text = result.response.text();
    const jsonStr = text.replace(/```json|```/g, "").trim();
    return constrainChatResult(message, JSON.parse(jsonStr));
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    throw formatGeminiError(error);
  }
};
