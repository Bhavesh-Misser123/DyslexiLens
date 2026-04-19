# 🔍 DyslexiLens

**Read anything, more easily.**

DyslexiLens uses your camera or image upload to extract text, then uses Gemini AI to simplify, chunk, and explain it — designed specifically for readers with dyslexia.

---

## 🚀 Quick Setup (5 minutes)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd dyslexilens
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Open `.env.local` and add your Gemini API key:

```
GEMINI_API_KEY=your_key_here
```

Get a free key at: https://aistudio.google.com/app/apikey

### 3. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) on your phone (via local network) or desktop.

---

## 📁 Project Structure

```
dyslexilens/
├── app/
│   ├── layout.tsx              # Root layout, fonts (Lexend + Atkinson Hyperlegible)
│   ├── page.tsx                # Main page — orchestrates the full pipeline
│   ├── globals.css             # Tailwind + dyslexia-friendly reading defaults
│   └── api/
│       └── process-text/
│           └── route.ts        # POST endpoint — calls Gemini, returns DyslexiaResult
├── components/
│   ├── ImageCapture.tsx        # Camera / file upload with preview
│   ├── ResultsView.tsx         # Full results UI with tabs
│   └── FocusMode.tsx           # One-chunk-at-a-time reading overlay
├── lib/
│   ├── ocr.ts                  # OCR layer (Tesseract.js, swappable)
│   ├── gemini.ts               # Gemini API wrapper (server-side only)
│   └── schema.ts               # JSON validation & safe parsing
├── types/
│   └── dyslexia.ts             # All TypeScript interfaces
├── .env.example                # Environment variable template
└── README.md
```

---

## 🔄 Data Flow

```
User selects image
      │
      ▼
[ImageCapture.tsx]  →  File object
      │
      ▼
[lib/ocr.ts]        →  Tesseract.js  →  rawText: string
      │
      ▼
[/api/process-text] →  Gemini 1.5 Flash  →  DyslexiaResult JSON
      │
      ▼
[ResultsView.tsx]   →  Tabs: Simple / Chunks / Words / Tips
      │
      ▼
[FocusMode.tsx]     →  One line at a time + Read Aloud
```

---

## 🔧 Swapping the OCR Provider

The OCR is behind a clean interface in `lib/ocr.ts`.

To swap to a cloud provider (Google Cloud Vision, AWS Textract, etc.):
1. Replace the body of `extractTextFromImage()` with an API call
2. Send the base64 image to a new `/api/ocr` server route
3. Return the extracted text string — nothing else changes

---

## 🎨 Design Decisions

- **Lexend font** — designed to reduce visual stress for dyslexic readers
- **Atkinson Hyperlegible** — designed by the Braille Institute for low-vision readability
- Increased letter-spacing (`0.08em`) and line-height (`1.9`) throughout
- High contrast warm color palette — avoids blue-on-white which triggers visual stress
- Large touch targets (min 48px) for mobile accessibility
- Focus Mode removes all distractions — one thought at a time

---

## 🛠 Built With

- [Next.js 15](https://nextjs.org/) — App Router
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Tesseract.js](https://tesseract.projectnaptha.com/) — browser-based OCR
- [Google Gemini 1.5 Flash](https://ai.google.dev/) — AI simplification
- [Lexend](https://www.lexend.com/) + [Atkinson Hyperlegible](https://brailleinstitute.org/freefont) — accessible fonts

---

## 🏆 HackPrinceton

Built for HackPrinceton. Made with care for the dyslexic community.
