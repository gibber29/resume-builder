const createId = (prefix) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`;

const buildSample = ({
  fullName,
  email,
  phone,
  location,
  linkedin = '',
  website = '',
  summary,
  education,
  experience,
  skills,
  projects,
}) => ({
  personalInfo: {
    fullName,
    email,
    phone,
    location,
    linkedin,
    website,
    summary,
  },
  education: education.map((item) => ({ id: createId('edu'), description: '', ...item })),
  experience: experience.map((item) => ({ id: createId('exp'), ...item })),
  skills,
  projects: projects.map((item) => ({ id: createId('proj'), link: '', ...item })),
});

export const TEMPLATE_CATEGORIES = [
  {
    id: 'tech',
    label: 'IT / Software / Data Science',
    subtitle: 'ATS-focused templates',
    colorFrom: '#2563EB',
    colorTo: '#06B6D4',
  },
  {
    id: 'academic',
    label: 'Academic / Professor / Research',
    subtitle: 'Research-ready CV layouts',
    colorFrom: '#4F46E5',
    colorTo: '#8B5CF6',
  },
  {
    id: 'creative',
    label: 'Product Manager / Design / Creative',
    subtitle: 'Structured modern resume styles',
    colorFrom: '#EA580C',
    colorTo: '#EF4444',
  },
];

const SAMPLE_RESUMES = {
  ats_technical: buildSample({
    fullName: 'Alex Webb',
    email: 'alex@email.com',
    phone: '555-123-4567',
    location: 'San Francisco, CA',
    linkedin: 'linkedin.com/in/alexwebbx',
    website: 'github.com/alexwebbx',
    summary:
      'AI/ML engineer focused on deep learning, computer vision, and NLP with production experience across Python, TensorFlow, and PyTorch.',
    education: [
      {
        school: 'Stanford University',
        degree: 'M.S. in Computer Science, Artificial Intelligence',
        startDate: 'Aug 2019',
        endDate: 'May 2021',
      },
      {
        school: 'UC Berkeley',
        degree: 'B.S. in EECS',
        startDate: 'Aug 2015',
        endDate: 'May 2019',
      },
    ],
    experience: [
      {
        company: 'DeepMind',
        position: 'AI Research Intern',
        startDate: 'Jun 2022',
        endDate: 'Aug 2022',
        description:
          'Conducted reinforcement learning research for robotics and evaluated deep RL models in PyTorch and RLlib.',
      },
      {
        company: 'Acme AI Solutions',
        position: 'Machine Learning Engineer',
        startDate: 'Jan 2021',
        endDate: 'May 2022',
        description:
          'Developed and deployed applied ML systems while optimizing model quality and collaborating with product teams.',
      },
    ],
    skills: [
      'Python',
      'C++',
      'SQL',
      'TensorFlow',
      'PyTorch',
      'Keras',
      'OpenCV',
      'Docker',
    ],
    projects: [
      {
        name: 'Image Captioning System',
        technologies: 'Python, TensorFlow, OpenCV',
        description:
          'Built an end-to-end captioning pipeline using CNN and LSTM models for descriptive image understanding.',
      },
      {
        name: 'Sentiment Analysis API',
        technologies: 'Python, Flask, Hugging Face',
        description:
          'Created a transformer-backed API for sentiment prediction and deployed it for downstream product usage.',
      },
    ],
  }),
  swe_lato: buildSample({
    fullName: 'First Last',
    email: 'firstlast@gmail.com',
    phone: 'XXX-XXX-XXXX',
    location: 'City, State',
    linkedin: 'linkedin.com/in/firstlast',
    website: 'github.com/firstlast',
    summary:
      'Software engineer building full-stack platforms, API systems, and reliable developer workflows.',
    education: [
      {
        school: 'University Name',
        degree: 'B.S. in Computer Science',
        startDate: 'Aug 20XX',
        endDate: 'May 20XX',
      },
    ],
    experience: [
      {
        company: 'Company Name 1',
        position: 'Software Engineer',
        startDate: 'Jan 20XX',
        endDate: 'May 20XX',
        description:
          'Implemented microservices with Node.js and Express, improved API response time, and led a React feature launch.',
      },
      {
        company: 'Company Name 2',
        position: 'Software Engineer Intern',
        startDate: 'May 20XX',
        endDate: 'Aug 20XX',
        description:
          'Built responsive Angular UIs, expanded test coverage with Jest, and supported agile delivery improvements.',
      },
    ],
    skills: [
      'Rust',
      'Kotlin',
      'Swift',
      'Go',
      'TypeScript',
      'React.js',
      'Node.js',
      'Docker',
      'AWS',
    ],
    projects: [
      {
        name: 'Project Name 1',
        technologies: 'React.js, Django, Flask',
        description:
          'Led development of a microservices commerce platform and launched a scalable REST API for real-time data.',
      },
      {
        name: 'Project Name 2',
        technologies: 'Spring Boot, TensorFlow',
        description:
          'Built a data dashboard and CI/CD workflow that improved release speed and stakeholder visibility.',
      },
    ],
  }),
  data_science: buildSample({
    fullName: 'Taylor Morgan',
    email: 'taylor@analytics.dev',
    phone: '(555) 204-8812',
    location: 'Boston, MA',
    linkedin: 'linkedin.com/in/taylormorgan',
    website: 'taylormorgan.dev',
    summary:
      'Data scientist experienced in experimentation, forecasting, and production ML systems for customer and operations teams.',
    education: [
      {
        school: 'Columbia University',
        degree: 'M.S. in Data Science',
        startDate: '2020',
        endDate: '2022',
      },
      {
        school: 'Boston University',
        degree: 'B.A. in Statistics',
        startDate: '2016',
        endDate: '2020',
      },
    ],
    experience: [
      {
        company: 'Nimbus Health',
        position: 'Senior Data Scientist',
        startDate: '2023',
        endDate: 'Present',
        description:
          'Shipped churn and risk models, designed experiments, and automated executive reporting pipelines in Python and SQL.',
      },
      {
        company: 'Blue Peak Analytics',
        position: 'Data Scientist',
        startDate: '2022',
        endDate: '2023',
        description:
          'Built forecasting workflows, dashboard tooling, and segmentation analyses for revenue planning and marketing teams.',
      },
    ],
    skills: [
      'Python',
      'SQL',
      'Pandas',
      'scikit-learn',
      'TensorFlow',
      'Airflow',
      'Tableau',
      'A/B Testing',
    ],
    projects: [
      {
        name: 'Experimentation Platform',
        technologies: 'Python, dbt, BigQuery',
        description:
          'Developed a reusable metrics and testing framework used by growth and product teams.',
      },
      {
        name: 'Demand Forecasting',
        technologies: 'Prophet, XGBoost',
        description:
          'Produced weekly forecasts that improved staffing and inventory planning across operations.',
      },
    ],
  }),
  academic_researcher: buildSample({
    fullName: 'Dr. Mira Patel',
    email: 'mira.patel@research.edu',
    phone: '+1 617 555 9081',
    location: 'Cambridge, MA',
    linkedin: '',
    website: 'mirapatellab.com',
    summary:
      'Research interests in trustworthy machine learning, interpretable NLP, and human-centered evaluation for deployed systems.',
    education: [
      {
        school: 'MIT',
        degree: 'Ph.D. in Computer Science',
        startDate: '2018',
        endDate: '2023',
      },
      {
        school: 'University of Toronto',
        degree: 'B.S. in Computer Science',
        startDate: '2014',
        endDate: '2018',
      },
    ],
    experience: [
      {
        company: 'MIT CSAIL',
        position: 'Postdoctoral Researcher',
        startDate: '2023',
        endDate: 'Present',
        description:
          'Lead projects on evaluation pipelines, publish at top NLP venues, and mentor graduate researchers.',
      },
      {
        company: 'Google Research',
        position: 'Research Intern',
        startDate: '2022',
        endDate: '2022',
        description:
          'Studied robustness of transformer systems and collaborated on internal evaluation benchmarks.',
      },
    ],
    skills: ['PyTorch', 'JAX', 'NLP', 'Human Evaluation', 'Experiment Design', 'Mentoring'],
    projects: [
      {
        name: 'Trust Bench',
        technologies: 'ACL 2025',
        description:
          'Benchmark suite for evaluating calibration and failure recovery in assistant-style language systems.',
      },
      {
        name: 'Explainable Summaries',
        technologies: 'EMNLP 2024',
        description:
          'Research project on evidence-grounded summarization with user-readable rationales.',
      },
    ],
  }),
  modular_cv: buildSample({
    fullName: 'Jordan Rivera',
    email: 'jordan.rivera@faculty.org',
    phone: '+1 212 555 0102',
    location: 'New Haven, CT',
    linkedin: '',
    website: 'jordanrivera.org',
    summary:
      'Faculty candidate combining research, teaching, and applied collaboration across computation and public-interest technology.',
    education: [
      {
        school: 'Yale University',
        degree: 'Ph.D. in Information Science',
        startDate: '2017',
        endDate: '2022',
      },
      {
        school: 'UCLA',
        degree: 'B.S. in Applied Mathematics',
        startDate: '2013',
        endDate: '2017',
      },
    ],
    experience: [
      {
        company: 'Yale University',
        position: 'Lecturer',
        startDate: '2022',
        endDate: 'Present',
        description:
          'Teach project-based data courses, advise capstones, and coordinate research partnerships with civic organizations.',
      },
      {
        company: 'Civic Futures Lab',
        position: 'Research Fellow',
        startDate: '2020',
        endDate: '2022',
        description:
          'Designed field studies, wrote grant reports, and translated technical findings for policy stakeholders.',
      },
    ],
    skills: ['Teaching', 'R', 'Python', 'Qualitative Methods', 'Research Design', 'Grant Writing'],
    projects: [
      {
        name: 'Public Data Commons',
        technologies: 'Open data',
        description:
          'Built a modular research initiative for reproducible public-interest analytics and student collaboration.',
      },
    ],
  }),
  sfiucr_cv: buildSample({
    fullName: 'Ava Kim',
    email: 'ava.kim@college.edu',
    phone: '+1 408 555 8821',
    location: 'Irvine, CA',
    linkedin: 'linkedin.com/in/avakim',
    website: 'github.com/avakim',
    summary:
      'Undergraduate researcher interested in computer vision, biomedical imaging, and accessible ML applications.',
    education: [
      {
        school: 'UC Irvine',
        degree: 'B.S. in Computer Science',
        startDate: '2022',
        endDate: '2026',
      },
    ],
    experience: [
      {
        company: 'Vision + Health Lab',
        position: 'Research Assistant',
        startDate: '2024',
        endDate: 'Present',
        description:
          'Prepared datasets, evaluated segmentation models, and summarized experiment results for faculty meetings.',
      },
      {
        company: 'Code4Community',
        position: 'Volunteer Developer',
        startDate: '2023',
        endDate: '2024',
        description:
          'Built internal tools and documentation for campus programs serving first-generation students.',
      },
    ],
    skills: ['Python', 'OpenCV', 'PyTorch', 'MATLAB', 'Git', 'Research Writing'],
    projects: [
      {
        name: 'Retina Segmentation Study',
        technologies: 'U-Net, PyTorch',
        description:
          'Compared segmentation architectures for retinal imaging and documented reproducible experiments.',
      },
    ],
  }),
  modern_simple_ats: buildSample({
    fullName: 'Priya Shah',
    email: 'priya@productops.io',
    phone: '+1 917 555 4170',
    location: 'New York, NY',
    linkedin: 'linkedin.com/in/priyashah',
    website: 'priyashah.com',
    summary:
      'Product and operations leader with a structured approach to cross-functional launches, analytics, and stakeholder communication.',
    education: [
      {
        school: 'NYU Stern',
        degree: 'B.S. in Business and Technology',
        startDate: '2015',
        endDate: '2019',
      },
    ],
    experience: [
      {
        company: 'LaunchPad',
        position: 'Senior Product Operations Manager',
        startDate: '2022',
        endDate: 'Present',
        description:
          'Scaled launch planning, KPI review, and process design across product, sales, and support teams.',
      },
      {
        company: 'Orbit Commerce',
        position: 'Product Manager',
        startDate: '2019',
        endDate: '2022',
        description:
          'Owned roadmap communication, release coordination, and experiment analysis for a multi-team platform.',
      },
    ],
    skills: ['Roadmapping', 'SQL', 'Notion', 'Figma', 'Stakeholder Management', 'Experimentation'],
    projects: [
      {
        name: 'Launch Review System',
        technologies: 'Notion, SQL',
        description:
          'Built a lightweight launch readiness workflow that improved visibility and reduced blocked releases.',
      },
    ],
  }),
  altacv: buildSample({
    fullName: 'Nora Bennett',
    email: 'nora@designops.co',
    phone: '+1 646 555 2224',
    location: 'Brooklyn, NY',
    linkedin: 'linkedin.com/in/norabennett',
    website: 'norabennett.design',
    summary:
      'Product designer blending systems thinking, brand sensitivity, and measurable UX improvements across complex flows.',
    education: [
      {
        school: 'Parsons School of Design',
        degree: 'B.F.A. Communication Design',
        startDate: '2014',
        endDate: '2018',
      },
    ],
    experience: [
      {
        company: 'Northstar',
        position: 'Lead Product Designer',
        startDate: '2022',
        endDate: 'Present',
        description:
          'Own end-to-end design for platform workflows, partner closely with PMs, and maintain the product design system.',
      },
      {
        company: 'Bright Path',
        position: 'Senior UX Designer',
        startDate: '2019',
        endDate: '2022',
        description:
          'Redesigned onboarding journeys and collaborated with research and engineering to improve activation.',
      },
    ],
    skills: ['Design Systems', 'Figma', 'User Research', 'Prototyping', 'Information Architecture', 'Workshop Facilitation'],
    projects: [
      {
        name: 'Onboarding Redesign',
        technologies: 'Product growth',
        description:
          'Created a modular onboarding experience that increased completion and reduced support tickets.',
      },
      {
        name: 'Component Library',
        technologies: 'Figma, Tokens',
        description:
          'Built a shared system that improved handoff consistency and accelerated new feature design.',
      },
    ],
  }),
  jakes_resume: buildSample({
    fullName: 'Jake Ryan',
    email: 'jake@ryan.dev',
    phone: '(555) 123-4567',
    location: 'Austin, TX',
    linkedin: 'linkedin.com/in/jakeryan',
    website: 'github.com/jakeryan',
    summary:
      'Full-stack builder with strong ownership across backend APIs, frontend systems, and product-minded execution.',
    education: [
      {
        school: 'University of Texas at Austin',
        degree: 'B.S. in Computer Science',
        startDate: '2016',
        endDate: '2020',
      },
    ],
    experience: [
      {
        company: 'Cedar Labs',
        position: 'Software Engineer',
        startDate: '2022',
        endDate: 'Present',
        description:
          'Delivered user-facing features, improved service reliability, and partnered with product on roadmap execution.',
      },
      {
        company: 'Pine Systems',
        position: 'Software Engineer Intern',
        startDate: '2021',
        endDate: '2022',
        description:
          'Implemented internal tools, wrote tests, and supported API and dashboard improvements across the stack.',
      },
    ],
    skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'PostgreSQL', 'AWS', 'Docker'],
    projects: [
      {
        name: 'Realtime Collaboration Suite',
        technologies: 'React, WebSocket, Redis',
        description:
          'Built a shared workspace experience with low-latency updates and usage analytics instrumentation.',
      },
      {
        name: 'Developer Portal',
        technologies: 'Next.js, Prisma',
        description:
          'Created a self-service portal for docs, API keys, and deployment insights used by partner teams.',
      },
    ],
  }),
};

export const TEMPLATES = [
  {
    id: 'ats_technical',
    category: 'tech',
    name: 'ATS Friendly Technical Resume',
    description: 'Built for AI/ML and SDE roles with dedicated sections for skills, projects, experience, and education.',
    bestFor: 'AI/ML Engineers, Software Engineers, Applied Scientists',
    overleafUrl: 'https://www.overleaf.com/latex/templates/ats-friendly-technical-resume/yrhtcnjyzgsf',
    previewMode: 'atsTechnical',
    pageFormat: 'a4',
    isATSFriendly: true,
    sampleData: SAMPLE_RESUMES.ats_technical,
  },
  {
    id: 'swe_lato',
    category: 'tech',
    name: 'SWE Resume Template',
    description: 'Clean, minimal, and explicitly optimized for ATS parsing with a polished engineering layout.',
    bestFor: 'Backend Engineers, Full-Stack Engineers, New Grad SWE roles',
    overleafUrl: 'https://www.overleaf.com/latex/templates/swe-resume-template/bznbzdprjfyy',
    previewMode: 'swe',
    pageFormat: 'a4',
    isATSFriendly: true,
    sampleData: SAMPLE_RESUMES.swe_lato,
  },
  {
    id: 'data_science',
    category: 'tech',
    name: 'Data Science Tech Resume',
    description: 'Structured specifically around data science workflows, tooling, and project outcomes.',
    bestFor: 'Data Scientists, ML Engineers, Analytics roles',
    overleafUrl: 'https://www.overleaf.com/latex/templates/data-science-tech-resume-template/zcdmpfxrzjhv',
    previewMode: 'dataScience',
    pageFormat: 'a4',
    isATSFriendly: true,
    sampleData: SAMPLE_RESUMES.data_science,
  },
  {
    id: 'academic_researcher',
    category: 'academic',
    name: 'Curriculum Vitae for Researchers',
    description: 'Modern academic CV style for publications, research experience, and scholarly achievements.',
    bestFor: 'Researchers, Postdocs, PhD applicants',
    overleafUrl: 'https://www.overleaf.com/latex/templates/curriculum-vitae-for-researchers/',
    previewMode: 'researcherCv',
    pageFormat: 'a4',
    isATSFriendly: true,
    sampleData: SAMPLE_RESUMES.academic_researcher,
  },
  {
    id: 'modular_cv',
    category: 'academic',
    name: 'Modular Professional CV',
    description: 'A flexible hybrid CV for academic and industry-facing profiles with modular sections.',
    bestFor: 'Faculty, applied researchers, academic-industry hybrids',
    overleafUrl: 'https://www.overleaf.com/latex/templates/modular-professional-cv/',
    previewMode: 'modularCv',
    pageFormat: 'a4',
    isATSFriendly: true,
    sampleData: SAMPLE_RESUMES.modular_cv,
  },
  {
    id: 'sfiucr_cv',
    category: 'academic',
    name: 'SFIUCR Academic CV Template',
    description: 'Simple academic CV well suited to undergrad research and early-career lab applications.',
    bestFor: 'Undergraduate researchers, assistants, early academic applicants',
    overleafUrl: 'https://www.overleaf.com/latex/templates/sfiucr-template-cv-resume/',
    previewMode: 'sfiucrCv',
    pageFormat: 'a4',
    isATSFriendly: true,
    sampleData: SAMPLE_RESUMES.sfiucr_cv,
  },
  {
    id: 'modern_simple_ats',
    category: 'creative',
    name: 'Modern Simple ATS Friendly CV',
    description: 'Minimal, structured, and easy to scan with a polished banking-style presentation.',
    bestFor: 'Product Managers, operations, business-facing tech roles',
    overleafUrl: 'https://www.overleaf.com/latex/templates/modern-simple-ats-friendly-latex-cv/fqxnznxhvdgp',
    previewMode: 'modernSimple',
    pageFormat: 'a4',
    isATSFriendly: true,
    sampleData: SAMPLE_RESUMES.modern_simple_ats,
  },
  {
    id: 'altacv',
    category: 'creative',
    name: 'AltaCV Template',
    description: 'A modern two-column layout with stronger visual personality while keeping sections structured.',
    bestFor: 'Product Designers, PMs, creative-tech hybrid roles',
    overleafUrl: 'https://www.overleaf.com/latex/templates/altacv-template/trgqjpwnmtgv',
    previewMode: 'altacv',
    pageFormat: 'a4',
    isATSFriendly: true,
    sampleData: SAMPLE_RESUMES.altacv,
  },
  {
    id: 'jakes_resume',
    category: 'creative',
    name: "Jake's Resume",
    description: 'Very clean single-column resume with ATS-friendly structure and strong readability.',
    bestFor: 'PM roles, SWE roles, hybrid product-technical applicants',
    overleafUrl: 'https://www.overleaf.com/latex/templates/jakes-resume/syzfjbzwjncs',
    previewMode: 'jakes',
    pageFormat: 'a4',
    isATSFriendly: true,
    sampleData: SAMPLE_RESUMES.jakes_resume,
  },
];
