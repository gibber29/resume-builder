# Smart Resume Builder

A Vite + React resume builder with ATS analysis, AI-assisted drafting, LaTeX export, and print-ready resume previews.

## Features

- ATS analysis with Gemini plus a safe local scoring fallback when Gemini returns incomplete score data.
- Runtime Gemini API key entry through the app UI.
- AI-assisted resume improvement and contextual chat.
- Print-friendly preview and editable LaTeX output.
- Browser-based save and load using `localStorage`.

## Local Development

### Prerequisites

- Node.js 18+

### Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```
3. Open the app and click `Analyze with Gemini` to enter a Gemini API key.

## Vercel Deployment

This project is a frontend app and is best deployed on Vercel.

### Recommended Vercel Settings

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

### Gemini API Key Safety

Do not deploy a real `VITE_GEMINI_API_KEY` in Vercel environment variables for this frontend app. Vite exposes `VITE_` variables to the browser bundle.

The safer production flow in this app is the current one: each user enters their own Gemini API key at runtime in the UI.

## Project Structure

```text
src/
|-- api/
|-- features/
|-- utils/
|-- App.jsx
|-- main.jsx
`-- index.css
```
