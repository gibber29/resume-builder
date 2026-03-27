import { useEffect, useMemo, useState, useRef } from 'react'
import { Briefcase, GraduationCap, Layout, Rocket, User, Wrench, Sparkles, Loader2, Target, CheckCircle2, ChevronRight, Code, Eye, RefreshCw, Save, FolderOpen, Download, Wand2, Check, X } from 'lucide-react'
import PersonalInfoForm from './features/resume-form/PersonalInfoForm'
import EducationForm from './features/resume-form/EducationForm'
import ExperienceForm from './features/resume-form/ExperienceForm'
import SkillsForm from './features/resume-form/SkillsForm'
import ProjectsForm from './features/resume-form/ProjectsForm'
import { analyzeResume, improveResumeWithGemini, hasUserProvidedGeminiApiKey, setGeminiApiKey, clearGeminiApiKey } from './api/gemini'
import TemplateGallery from './features/templates/TemplateGallery'
import { TEMPLATES } from './features/templates/templateDefinitions'
import { generateLatex } from './utils/latexGenerator'
import { UniversalPreview, getPageSize } from './features/templates/UniversalPreview'
import CodeEditor from './features/code-editor/CodeEditor'
import ChatAi from './features/chat/ChatAi'
import LatexLivePreview from './features/preview/LatexLivePreview'

const INITIAL_RESUME_DATA = {
  personalInfo: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    linkedin: "",
    website: "",
    summary: "",
  },
  education: [
    {
      id: crypto.randomUUID(),
      school: "",
      degree: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ],
  experience: [
    {
      id: crypto.randomUUID(),
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ],
  skills: [],
  projects: [
    {
      id: crypto.randomUUID(),
      name: "",
      description: "",
      link: "",
      technologies: "",
    },
  ],
};

const createEducationItem = (item = {}) => ({
  id: item.id || crypto.randomUUID(),
  school: item.school || "",
  degree: item.degree || "",
  startDate: item.startDate || "",
  endDate: item.endDate || "",
  description: item.description || "",
});

const createExperienceItem = (item = {}) => ({
  id: item.id || crypto.randomUUID(),
  company: item.company || "",
  position: item.position || "",
  startDate: item.startDate || "",
  endDate: item.endDate || "",
  description: item.description || "",
});

const createProjectItem = (item = {}) => ({
  id: item.id || crypto.randomUUID(),
  name: item.name || "",
  description: item.description || "",
  link: item.link || "",
  technologies: item.technologies || "",
});

const normalizeResumeData = (data = {}, previousData = INITIAL_RESUME_DATA) => {
  const personalInfo = {
    ...previousData.personalInfo,
    ...(data.personalInfo || {}),
  };

  const education = Array.isArray(data.education)
    ? data.education.map(createEducationItem)
    : previousData.education;

  const experience = Array.isArray(data.experience)
    ? data.experience.map(createExperienceItem)
    : previousData.experience;

  const projects = Array.isArray(data.projects)
    ? data.projects.map(createProjectItem)
    : previousData.projects;

  const skills = Array.isArray(data.skills)
    ? data.skills.filter(Boolean).map((skill) => `${skill}`.trim()).filter(Boolean)
    : previousData.skills;

  return {
    personalInfo,
    education: education.length > 0 ? education : [createEducationItem()],
    experience: experience.length > 0 ? experience : [createExperienceItem()],
    skills,
    projects: projects.length > 0 ? projects : [createProjectItem()],
  };
};

const RESUME_PROGRESS_KEY = 'resume_builder_progress_v1';

// ── App ───────────────────────────────────────────────────────────────────────
function App() {
  const [resumeData, setResumeData] = useState(INITIAL_RESUME_DATA);
  const [activeTab, setActiveTab] = useState('personal');
  const [atsData, setAtsData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isApplyingImprovements, setIsApplyingImprovements] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [savedProgressInfo, setSavedProgressInfo] = useState(null);
  const [suggestedResumeData, setSuggestedResumeData] = useState(null);
  const [suggestedChangeSummary, setSuggestedChangeSummary] = useState(null);
  const [viewMode, setViewMode] = useState('preview');
  const [latexCode, setLatexCode] = useState("");
  const [showGeminiKeyPrompt, setShowGeminiKeyPrompt] = useState(false);
  const [geminiApiKeyInput, setGeminiApiKeyInput] = useState("");
  const [geminiApiKeyError, setGeminiApiKeyError] = useState("");
  const [shouldForceGeminiKeyPrompt, setShouldForceGeminiKeyPrompt] = useState(false);
  const previewRef = useRef(null);
  const containerRef = useRef(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [previewHeight, setPreviewHeight] = useState(1123);
  const activeResumeData = suggestedResumeData || resumeData;
  const previewPageSize = getPageSize(selectedTemplate?.pageFormat || 'letter');
  const generatedLatexPreview = useMemo(() => {
    if (!selectedTemplate) return '';

    try {
      return generateLatex(activeResumeData, selectedTemplate.id);
    } catch (error) {
      console.error('LaTeX preview comparison failed for template:', selectedTemplate?.id, error);
      return '';
    }
  }, [activeResumeData, selectedTemplate]);
  const hasManualLatexEdits = Boolean(
    latexCode.trim() &&
    generatedLatexPreview &&
    latexCode !== generatedLatexPreview
  );

  // Sync LaTeX whenever data or template changes
  useEffect(() => {
    if (!selectedTemplate) return;

    try {
      setLatexCode(generateLatex(activeResumeData, selectedTemplate.id));
    } catch (error) {
      console.error('LaTeX generation failed for template:', selectedTemplate?.id, error);
      setLatexCode('% Unable to generate LaTeX for this template right now.');
    }
  }, [activeResumeData, selectedTemplate]);

  useEffect(() => {
    if (!containerRef.current) return;
    
    let isUpdating = false;
    const observer = new ResizeObserver((entries) => {
      if (isUpdating) return;
      isUpdating = true;
      requestAnimationFrame(() => {
        if (!containerRef.current) {
          isUpdating = false;
          return;
        }
        const parentWidth = containerRef.current.clientWidth;
        const nativeWidth = previewPageSize.width;
        let scale = Math.min(1, (parentWidth - 10) / nativeWidth);
        if (scale < 0.2) scale = 0.2;
        setPreviewScale(scale);
        
        if (previewRef.current) {
          setPreviewHeight(previewRef.current.offsetHeight);
        }
        isUpdating = false;
      });
    });
    
    observer.observe(containerRef.current);
    if (previewRef.current) observer.observe(previewRef.current);
    
    return () => observer.disconnect();
  }, [previewPageSize.width, viewMode]);

  useEffect(() => {
    try {
      const savedProgressRaw = localStorage.getItem(RESUME_PROGRESS_KEY);
      if (!savedProgressRaw) return;

      const savedProgress = JSON.parse(savedProgressRaw);
      if (savedProgress?.updatedAt) {
        setSavedProgressInfo(savedProgress.updatedAt);
      }
    } catch (error) {
      console.error('Failed to read saved progress:', error);
    }
  }, []);

  const refreshAtsAnalysis = async (dataToAnalyze) => {
    const result = await analyzeResume(dataToAnalyze, selectedTemplate);
    setAtsData(result);
    return result;
  };

  const updateData = (section, newValue) => {
    const nextResumeData = { ...activeResumeData, [section]: newValue };
    setSuggestedResumeData(null);
    setSuggestedChangeSummary(null);
    setResumeData(nextResumeData);
  };

  const handleAiUpdateData = (incomingData) => {
    setSuggestedResumeData(null);
    setSuggestedChangeSummary(null);
    setResumeData((previousData) => normalizeResumeData(incomingData, previousData));
  };

  const handleSaveProgress = () => {
    const payload = {
      resumeData,
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem(RESUME_PROGRESS_KEY, JSON.stringify(payload));
    setSavedProgressInfo(payload.updatedAt);
  };

  const handleLoadProgress = () => {
    try {
      const savedProgressRaw = localStorage.getItem(RESUME_PROGRESS_KEY);
      if (!savedProgressRaw) return;

      const savedProgress = JSON.parse(savedProgressRaw);
      setResumeData(normalizeResumeData(savedProgress.resumeData, INITIAL_RESUME_DATA));
      setSuggestedResumeData(null);
      setSuggestedChangeSummary(null);
      setSavedProgressInfo(savedProgress.updatedAt || null);
    } catch (error) {
      console.error('Failed to load saved progress:', error);
      alert('Could not load saved resume progress.');
    }
  };

  const handleDownloadPdf = () => {
    if (!previewRef.current) return;

    const clone = previewRef.current.cloneNode(true);
    clone.id = 'print-mount';
    document.body.appendChild(clone);

    document.body.classList.add('printing-resume');
    window.print();
    
    window.setTimeout(() => {
      document.body.classList.remove('printing-resume');
      const mount = document.getElementById('print-mount');
      if (mount) {
        document.body.removeChild(mount);
      }
    }, 100);
  };

  const runAnalyze = async () => {
    setIsAnalyzing(true);
    try {
      await refreshAtsAnalysis(activeResumeData);
    } catch (error) {
      if (error?.code === 'invalid_api_key' || error?.code === 'missing_api_key') {
        clearGeminiApiKey();
        setShouldForceGeminiKeyPrompt(true);
        setGeminiApiKeyInput("");
        setGeminiApiKeyError(error.message || 'Please enter a valid Gemini API key.');
        setShowGeminiKeyPrompt(true);
        return;
      }
      alert(`Analysis Error: ${error.message || error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // ATS analysis is now triggered manually via the "Check ATS & Improve" button.
  const handleAnalyze = async () => {
    if (shouldForceGeminiKeyPrompt || !hasUserProvidedGeminiApiKey()) {
      setGeminiApiKeyError("");
      setGeminiApiKeyInput("");
      setShowGeminiKeyPrompt(true);
      return;
    }

    await runAnalyze();
  };

  const handleSaveGeminiApiKey = async () => {
    const normalizedApiKey = geminiApiKeyInput.trim();
    if (!normalizedApiKey) {
      setGeminiApiKeyError('Please enter your Gemini API key to continue.');
      return;
    }

    setGeminiApiKey(normalizedApiKey);
    setShouldForceGeminiKeyPrompt(false);
    setGeminiApiKeyError("");
    setShowGeminiKeyPrompt(false);
    await runAnalyze();
  };

  const handleApplyImprovements = async () => {
    if (!atsData) return;

    setIsApplyingImprovements(true);
    try {
      const result = await improveResumeWithGemini(resumeData, atsData);
      setSuggestedResumeData(normalizeResumeData(result.updatedData, resumeData));
      setSuggestedChangeSummary({
        summary: result.summary || 'AI improvements prepared from the current ATS recommendations.',
        changes: Array.isArray(result.changes) ? result.changes : [],
      });
      setViewMode('preview');
    } catch (error) {
      alert(`Improve Error: ${error.message || error}`);
    } finally {
      setIsApplyingImprovements(false);
    }
  };

  const handleAcceptImprovements = async () => {
    if (!suggestedResumeData) return;

    const acceptedResumeData = suggestedResumeData;

    setResumeData(acceptedResumeData);
    setSuggestedResumeData(null);
    setSuggestedChangeSummary(null);

    setIsAnalyzing(true);
    try {
      await refreshAtsAnalysis(acceptedResumeData);
    } catch (error) {
      alert(`Analysis Error: ${error.message || error}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleRejectImprovements = () => {
    setSuggestedResumeData(null);
    setSuggestedChangeSummary(null);
  };

  const tabs = [
    { id: 'personal',   label: 'Personal',   icon: User },
    { id: 'education',  label: 'Education',  icon: GraduationCap },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'skills',     label: 'Skills',     icon: Wrench },
    { id: 'projects',   label: 'Projects',   icon: Rocket },
  ];

  // ── Template Gallery ────────────────────────────────────────────────────────
  if (!selectedTemplate) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
        <header className="max-w-4xl mx-auto pt-12 pb-6 px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Layout className="w-3 h-3" /> Resume Builder v2.0
          </div>
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-primary-400 via-indigo-500 to-purple-400 bg-clip-text text-transparent tracking-tight">
            Smart Resume Builder
          </h1>
          <p className="mt-3 text-slate-400 font-medium text-lg italic">"Your career, augmented by intelligence."</p>
          {savedProgressInfo && (
            <div className="mt-5">
              <button
                onClick={handleLoadProgress}
                className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 transition-all border border-slate-700"
              >
                <FolderOpen className="w-3 h-3" /> Load Saved Resume
              </button>
            </div>
          )}
        </header>
        <TemplateGallery onSelectTemplate={setSelectedTemplate} />
      </div>
    );
  }

  // ── Main Editor ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8 font-sans selection:bg-primary-500/30">
      {showGeminiKeyPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-6 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary-500/20 bg-primary-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-primary-300">
              <Sparkles className="w-3 h-3" /> Gemini Setup
            </div>
            <h3 className="mt-4 text-2xl font-bold text-slate-100">Enter your Gemini API key</h3>
            <p className="mt-3 text-sm leading-6 text-slate-300">
              This is required before your first Gemini analysis. It is recommended to use a Tier 1 billing key for a smooth experience.
            </p>
            <div className="mt-5">
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">
                Gemini API Key
              </label>
              <input
                type="password"
                value={geminiApiKeyInput}
                onChange={(event) => {
                  setGeminiApiKeyInput(event.target.value);
                  if (geminiApiKeyError) {
                    setGeminiApiKeyError("");
                  }
                }}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    handleSaveGeminiApiKey();
                  }
                }}
                placeholder="Paste your Gemini API key"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              />
              {geminiApiKeyError && (
                <p className="mt-2 text-xs text-red-300">{geminiApiKeyError}</p>
              )}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => {
                  clearGeminiApiKey();
                  setShouldForceGeminiKeyPrompt(true);
                  setShowGeminiKeyPrompt(false);
                  setGeminiApiKeyError("");
                  setGeminiApiKeyInput("");
                }}
                className="flex-1 rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-xs font-bold uppercase tracking-widest text-slate-200 transition-all hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveGeminiApiKey}
                className="flex-1 rounded-xl border border-white/10 bg-gradient-to-r from-primary-600 to-indigo-600 px-4 py-3 text-xs font-bold uppercase tracking-widest text-white transition-all hover:from-primary-500 hover:to-indigo-500"
              >
                Save And Analyze
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-xs font-bold uppercase tracking-widest mb-3">
            <Layout className="w-3 h-3" /> {selectedTemplate.name}
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-primary-400 via-indigo-500 to-purple-400 bg-clip-text text-transparent tracking-tight">
            Smart Resume Builder
          </h1>
        </div>
        <div className="flex flex-wrap justify-end gap-3">
          {savedProgressInfo && (
            <button
              onClick={handleLoadProgress}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 transition-all border border-slate-700"
            >
              <FolderOpen className="w-3 h-3" /> Load Saved
            </button>
          )}
          <button
            onClick={handleSaveProgress}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 transition-all border border-slate-700"
          >
            <Save className="w-3 h-3" /> Save Progress
          </button>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-xl text-xs font-bold uppercase tracking-widest text-white transition-all border border-white/10 shadow-lg shadow-primary-900/30"
          >
            <Download className="w-3 h-3" /> Download PDF
          </button>
          <button
            onClick={() => setSelectedTemplate(null)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold uppercase tracking-widest text-slate-300 transition-all border border-slate-700"
          >
            <RefreshCw className="w-3 h-3" /> Change Template
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-32">
        {/* ── Editor Sidebar ── */}
        <div className="lg:col-span-5 space-y-6">
          <section className="bg-slate-800/50 rounded-2xl border border-slate-700/50 backdrop-blur-xl shadow-2xl overflow-hidden">
            <div className="flex flex-wrap border-b border-slate-700/50">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 min-w-[100px] flex items-center justify-center gap-2 py-4 text-xs font-bold uppercase tracking-wider transition-all ${
                    activeTab === tab.id
                      ? 'text-primary-400 bg-primary-500/5 border-b-2 border-primary-500'
                      : 'text-slate-500 hover:text-slate-200 hover:bg-slate-700/30'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>
            <div className="p-8">
              {activeTab === 'personal'   && <PersonalInfoForm data={activeResumeData.personalInfo} updateData={updateData} />}
              {activeTab === 'education'  && <EducationForm    data={activeResumeData.education}    updateData={updateData} />}
              {activeTab === 'experience' && <ExperienceForm   data={activeResumeData.experience}   updateData={updateData} />}
              {activeTab === 'skills'     && <SkillsForm       data={activeResumeData.skills}       updateData={updateData} />}
              {activeTab === 'projects'   && <ProjectsForm     data={activeResumeData.projects}     updateData={updateData} />}
            </div>
          </section>

          {/* ── ATS Panel ── */}
          <div className="p-6 bg-slate-800/80 rounded-2xl border border-slate-700 shadow-xl overflow-hidden relative">
            <div className="flex justify-between items-center mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-primary-400" />
                <h4 className="font-bold text-slate-100 uppercase tracking-wider text-sm">ATS Analysis</h4>
              </div>
              <div className="text-3xl font-black text-primary-400 drop-shadow-[0_0_10px_rgba(14,165,233,0.3)]">
                {atsData ? `${atsData.score}%` : '--'}
              </div>
            </div>

            {atsData ? (
              <div className="space-y-6 relative z-10 animate-in fade-in slide-in-from-top-4">
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-primary-500 transition-all duration-1000 ease-out" style={{ width: `${atsData.score}%` }} />
                </div>
                {atsData.categories?.length > 0 && (
                  <div className="rounded-xl border border-slate-700/80 bg-slate-900/40 overflow-hidden">
                    <div className="grid grid-cols-[minmax(0,1.8fr)_72px_72px_80px] gap-3 px-4 py-3 bg-slate-900/80 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                      <div>Category</div>
                      <div className="text-right">Weight</div>
                      <div className="text-right">Score</div>
                      <div className="text-right">Weighted</div>
                    </div>
                    <div className="divide-y divide-slate-800">
                      {atsData.categories.map((category) => (
                        <div key={category.key} className="px-4 py-3">
                          <div className="grid grid-cols-[minmax(0,1.8fr)_72px_72px_80px] gap-3 text-[11px] text-slate-200">
                            <div className="font-semibold text-slate-100">{category.label}</div>
                            <div className="text-right text-slate-400">{category.weight}%</div>
                            <div className="text-right text-slate-300">{category.score}/10</div>
                            <div className="text-right font-bold text-primary-300">{category.weightedScore}</div>
                          </div>
                          <p className="mt-2 text-[10px] leading-5 text-slate-500">{category.rationale}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-green-400" /> Strengths
                  </h5>
                  <div className="flex flex-wrap gap-2">
                    {atsData.strengths?.map((s, i) => (
                      <span key={i} className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-bold rounded-md border border-green-500/20">{s}</span>
                    ))}
                  </div>
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <X className="w-3 h-3 text-red-400" /> Resume Flaws
                  </h5>
                  <ul className="space-y-2">
                    {(atsData.key_issues || []).map((issue, i) => (
                      <li key={i} className="text-[11px] text-red-300 flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-red-400 mt-0.5 shrink-0" /> {issue}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-primary-400" /> How To Improve
                  </h5>
                  <ul className="space-y-2">
                    {(atsData.improvements || atsData.tips || []).map((tip, i) => (
                      <li key={i} className="text-[11px] text-slate-300 flex items-start gap-2">
                        <ChevronRight className="w-3 h-3 text-primary-500 mt-0.5 shrink-0" /> {tip}
                      </li>
                    ))}
                  </ul>
                </div>
                {suggestedChangeSummary && (
                  <div className="rounded-xl border border-primary-500/20 bg-primary-500/5 p-4 space-y-3">
                    <div>
                      <h5 className="text-[10px] font-bold text-primary-300 uppercase tracking-widest mb-1">AI Draft Ready</h5>
                      <p className="text-xs text-slate-300">{suggestedChangeSummary.summary}</p>
                    </div>
                    {suggestedChangeSummary.changes?.length > 0 && (
                      <ul className="space-y-2">
                        {suggestedChangeSummary.changes.map((change, index) => (
                          <li key={index} className="text-[11px] text-slate-300 flex items-start gap-2">
                            <ChevronRight className="w-3 h-3 text-primary-500 mt-0.5 shrink-0" /> {change}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="flex gap-2">
                      <button
                        onClick={handleAcceptImprovements}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-[11px] font-bold uppercase tracking-widest text-white transition-all"
                      >
                        <Check className="w-3 h-3" /> Accept
                      </button>
                      <button
                        onClick={handleRejectImprovements}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-[11px] font-bold uppercase tracking-widest text-slate-100 transition-all"
                      >
                        <X className="w-3 h-3" /> Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-slate-400 text-xs italic relative z-10">
                Fill in your details and analysis will appear automatically.
              </p>
            )}

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full mt-6 py-3 bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-xl shadow-primary-900/40 border border-white/10 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
            >
              {isAnalyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><Sparkles className="w-4 h-4" /> Analyze with Gemini</>}
            </button>
            {atsData && (
              <button
                onClick={handleApplyImprovements}
                disabled={isApplyingImprovements}
                className="w-full mt-3 py-3 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white font-bold rounded-xl transition-all border border-slate-600 flex items-center justify-center gap-2 uppercase tracking-widest text-xs"
              >
                {isApplyingImprovements ? <><Loader2 className="w-4 h-4 animate-spin" /> Applying...</> : <><Wand2 className="w-4 h-4" /> Apply Recommended Changes</>}
              </button>
            )}
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
          </div>
        </div>

        {/* ── Preview / Code Panel ── */}
        <div className="lg:col-span-7 sticky top-8 flex flex-col gap-4">
          <div className="flex bg-slate-800/50 p-1.5 rounded-xl border border-slate-700/50 backdrop-blur-sm self-end">
            <button
              onClick={() => setViewMode('preview')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                viewMode === 'preview' ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
            <button
              onClick={() => setViewMode('code')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                viewMode === 'code' ? 'bg-primary-600 text-white shadow-lg shadow-primary-900/40' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Code className="w-3 h-3" /> Code
            </button>
          </div>

          <div className="relative min-h-[850px]">
            {viewMode === 'preview' ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-4 duration-500">
                <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 text-center">
                  Preview is auto-condensed to keep this template on one page
                </p>
                <div ref={containerRef} className="w-full relative flex justify-center transition-all duration-300" style={{ height: `${Math.max(previewHeight * previewScale, 500)}px` }}>
                  <div
                    style={{
                      transform: `scale(${previewScale})`,
                      transformOrigin: 'top center',
                      width: `${previewPageSize.width}px`,
                      position: 'absolute',
                      top: 0
                    }}
                  >
                    <div
                      ref={previewRef}
                      data-resume-print="true"
                      className="rounded-2xl shadow-[0_30px_60px_rgba(0,0,0,0.6)] w-full mx-auto border border-slate-200 overflow-hidden bg-white"
                      style={{
                        width: `${previewPageSize.width}px`,
                        minHeight: `${previewPageSize.height}px`,
                      }}
                    >
                      {hasManualLatexEdits ? (
                        <LatexLivePreview code={latexCode} />
                      ) : (
                        <UniversalPreview data={activeResumeData} template={selectedTemplate} />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="min-h-[920px] animate-in fade-in slide-in-from-left-4 duration-500">
                <CodeEditor code={latexCode} onChange={setLatexCode} />
              </div>
            )}
          </div>
        </div>
      </main>

      <ChatAi
        resumeData={activeResumeData}
        latexCode={latexCode}
        onUpdateData={handleAiUpdateData}
        onUpdateLatex={(newLatex) => setLatexCode(newLatex)}
      />
    </div>
  );
}

export default App
