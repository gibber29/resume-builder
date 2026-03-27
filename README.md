# Smart Resume Builder (v2.0)

A next-generation, AI-augmented resume and CV builder designed for engineers, researchers, and professionals. Smart Resume Builder generates **pixel-perfect A4** vector PDFs and **raw LaTeX** source code simultaneously, while leveraging Google's Gemini AI to provide real-time ATS analysis and automated content drafting.

## 🚀 Features & Technologies Used

This project was built using a lightweight, lightning-fast modern stack: **React 18**, **Vite**, and **Tailwind CSS**. It consciously avoids bloated PDF libraries, instead opting for raw DOM manipulation and CSS Print mapping to generate PDFs.

### 1. 🤖 AI-Powered ATS Analysis & Drafting
* **Tech Used:** `@google/generative-ai` (Gemini Pro), React State
* **How it works:** The application streams your current resume JSON data directly to the Gemini API. It evaluates your text against industry standards, generating a weighted ATS score, highlighting flaws, and proactively drafting optimized bullet points that you can accept or reject with a single click.

### 2. 💬 Context-Aware AI Chat Assistant
* **Tech Used:** `@google/generative-ai` (Gemini Pro), Tailwind CSS
* **How it works:** A dedicated chat interface (`ChatAi.jsx`) is injected with the context of your entire resume data and current LaTeX source. You can converse naturally with the AI to ask formatting questions, rewrite specific sections, or generate complex LaTeX macros dynamically.

### 3. 📄 Pixel-Perfect PDF Generation
* **Tech Used:** Native Browser Print API (`window.print()`), Advanced CSS (`@media print`, `zoom`)
* **How it works:** Rather than using heavy dependencies like `html2pdf` or `puppeteer`, the application intercepts the print dialog, clones the exact A4 React layout natively into an isolated `document.body` DOM portal, and scales the elements via CSS so that it seamlessly occupies an 8.5x11 / A4 physical sheet at standard 96 DPI.

### 4. Responsive Universal Preview
* **Tech Used:** React `ResizeObserver`, CSS `transform`
* **How it works:** The internal Layout engine processes components exclusively at `794x1123` (native A4). A `ResizeObserver` on the viewing column intelligently sizes the visual container using `transform: scale()` so it remains compact and fully visible on any screen size without destroying the strict aspect ratio required for printing.

### 5. 📝 Native LaTeX Source Code Generation
* **Tech Used:** Vanilla JavaScript (Template Literals)
* **How it works:** The `latexGenerator.js` module dynamically compiles your form inputs into 9 distinct professional LaTeX classes (e.g. `moderncv`, `altacv`, Jake's Resume). A toggleable code editor allows users to override and manually refine the raw `.tex` source before porting it over to services like Overleaf.

### 6. Local Storage Persistence
* **Tech Used:** Browser `localStorage`
* **How it works:** Progress is automatically structured into a centralized JSON payload and cached locally, minimizing backend overhead and allowing users to restore their draft effortlessly across browser sessions.

## 💻 Getting Started

### Prerequisites
- Node.js (v16+)
- A Google Gemini API Key (Required for ATS and Chat features)

### Installation
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your environment variables (e.g., `.env.local`):
   ```env
   VITE_GEMINI_API_KEY=your_api_key_here
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🛠️ Project Architecture

```text
src/
├── api/             # Gemini API integration and prompt engineering
├── features/        
│   ├── chat/        # Context-aware AI Chatbot components
│   ├── code-editor/ # LaTeX raw code view and editing
│   ├── preview/     # Live evaluation blocks
│   ├── resume-form/ # React input components (Education, Experience, etc.)
│   └── templates/   # Universal A4 Preview generation and Gallery UI
├── utils/
│   └── latexGenerator.js # Core generation logic mapping JSON to .tex 
├── App.jsx          # Main application rendering and state bus
└── index.css        # Base Tailwind imports and bespoke PDF print styling
```
