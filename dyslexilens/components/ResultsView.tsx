"use client";
// components/ResultsView.tsx
// ─────────────────────────────────────────────────────────────
// Displays all output from the Gemini pipeline:
//   - Simplified text
//   - Chunked reading mode (inline)
//   - Hard words with expandable definitions
//   - Reading tips
//   - Focus Mode launcher
//   - Read Aloud (browser speech synthesis)
// ─────────────────────────────────────────────────────────────

import { useState, useCallback } from "react";
import FocusMode from "@/components/FocusMode";
import type { DyslexiaResult, HardWord } from "@/types/dyslexia";

interface ResultsViewProps {
  result:   DyslexiaResult;
  rawText:  string;
  imageUrl: string;
  onReset:  () => void;
}

type Tab = "simplified" | "chunked" | "words" | "tips";

export default function ResultsView({
  result,
  rawText,
  imageUrl,
  onReset,
}: ResultsViewProps) {
  const [activeTab, setActiveTab]     = useState<Tab>("simplified");
  const [focusOpen, setFocusOpen]     = useState(false);
  const [rawVisible, setRawVisible]   = useState(false);
  const [isSpeaking, setIsSpeaking]   = useState(false);

  // ── Read full simplified text aloud
  const handleReadAloud = useCallback(() => {
    if (!("speechSynthesis" in window)) {
      alert("Speech synthesis is not supported in your browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utt = new SpeechSynthesisUtterance(result.simplified_text);
    utt.rate  = 0.85;
    utt.pitch = 1.0;
    utt.onend = () => setIsSpeaking(false);
    utt.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utt);
  }, [isSpeaking, result.simplified_text]);

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: "simplified", label: "Simple",  emoji: "📖" },
    { id: "chunked",    label: "Chunks",  emoji: "🧩" },
    { id: "words",      label: "Words",   emoji: "💡" },
    { id: "tips",       label: "Tips",    emoji: "✅" },
  ];

  return (
    <div className="space-y-5">
      {/* ── Focus Mode overlay ── */}
      {focusOpen && (
        <FocusMode
          lines={result.chunked_lines}
          onClose={() => setFocusOpen(false)}
        />
      )}

      {/* ── Header card ── */}
      <div className="card">
        <div className="flex items-start gap-3">
          {/* Thumbnail */}
          {imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt="Source image"
              className="w-16 h-16 rounded-xl object-cover flex-shrink-0 border border-cream-200"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink-300 uppercase tracking-wider mb-1 font-medium">
              Processed
            </p>
            <h2 className="font-display text-xl font-bold text-ink-900 leading-tight">
              {result.title}
            </h2>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setFocusOpen(true)}
            className="btn-primary flex-1 flex items-center justify-center gap-2 py-3"
            aria-label="Open Focus Mode"
          >
            <span>🎯</span>
            <span>Focus Mode</span>
          </button>
          <button
            onClick={handleReadAloud}
            className="btn-ghost flex-1 flex items-center justify-center gap-2 py-3"
            aria-label={isSpeaking ? "Stop reading" : "Read text aloud"}
          >
            <span>{isSpeaking ? "⏹" : "🔊"}</span>
            <span>{isSpeaking ? "Stop" : "Read Aloud"}</span>
          </button>
        </div>
      </div>

      {/* ── Tab navigation ── */}
      <div
        className="grid grid-cols-4 gap-2"
        role="tablist"
        aria-label="Reading mode tabs"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={activeTab === tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex flex-col items-center gap-1 py-3 rounded-xl text-xs font-display font-medium
              transition-all duration-150
              ${activeTab === tab.id
                ? "bg-focus text-white shadow-sm"
                : "bg-white border border-cream-200 text-ink-500 hover:bg-cream-100"
              }
            `}
          >
            <span className="text-lg">{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Tab content ── */}

      {/* SIMPLIFIED TEXT */}
      {activeTab === "simplified" && (
        <div className="card space-y-3">
          <h3 className="font-display font-semibold text-ink-700 text-sm uppercase tracking-wider">
            Simplified Text
          </h3>
          <p className="text-ink-900 text-lg reading-text">
            {result.simplified_text}
          </p>
        </div>
      )}

      {/* CHUNKED LINES */}
      {activeTab === "chunked" && (
        <div className="card space-y-3">
          <h3 className="font-display font-semibold text-ink-700 text-sm uppercase tracking-wider">
            Reading Chunks
          </h3>
          <p className="text-ink-400 text-xs">
            Each block is one idea. Read at your own pace.
          </p>
          <ol className="space-y-3" aria-label="Text chunks">
            {result.chunked_lines.map((line, i) => (
              <li
                key={i}
                className="flex gap-3 items-start"
              >
                <span className="text-focus font-display font-bold text-sm mt-1 min-w-[1.5rem]">
                  {i + 1}.
                </span>
                <p className="text-ink-900 text-lg reading-text leading-relaxed">
                  {line}
                </p>
              </li>
            ))}
          </ol>
        </div>
      )}

      {/* HARD WORDS */}
      {activeTab === "words" && (
        <div className="space-y-3">
          {result.hard_words.length === 0 ? (
            <div className="card text-center py-8">
              <span className="text-3xl block mb-2">🎉</span>
              <p className="text-ink-500">No particularly difficult words found!</p>
            </div>
          ) : (
            result.hard_words.map((hw, i) => (
              <HardWordCard key={i} word={hw} />
            ))
          )}
        </div>
      )}

      {/* READING TIPS */}
      {activeTab === "tips" && (
        <div className="card space-y-4">
          <h3 className="font-display font-semibold text-ink-700 text-sm uppercase tracking-wider">
            Reading Tips
          </h3>
          <ul className="space-y-3" aria-label="Reading tips">
            {result.reading_tips.map((tip, i) => (
              <li key={i} className="flex gap-3 items-start">
                <span
                  className="w-6 h-6 rounded-full bg-leaf-light text-leaf flex items-center justify-center text-sm flex-shrink-0 mt-0.5"
                  aria-hidden="true"
                >
                  ✓
                </span>
                <p className="text-ink-900 reading-text">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Raw extracted text (collapsible) ── */}
      <div className="card">
        <button
          onClick={() => setRawVisible((v) => !v)}
          className="w-full flex items-center justify-between text-left"
          aria-expanded={rawVisible}
          aria-controls="raw-text-section"
        >
          <span className="font-display font-medium text-ink-600 text-sm">
            Original extracted text
          </span>
          <span className="text-ink-400 text-sm">{rawVisible ? "▲ Hide" : "▼ Show"}</span>
        </button>
        {rawVisible && (
          <div
            id="raw-text-section"
            className="mt-3 pt-3 border-t border-cream-200"
          >
            <p className="text-ink-500 text-sm reading-text whitespace-pre-wrap">
              {rawText}
            </p>
          </div>
        )}
      </div>

      {/* ── Start over ── */}
      <button
        onClick={onReset}
        className="btn-ghost w-full"
        aria-label="Scan a new image"
      >
        ← Scan New Image
      </button>
    </div>
  );
}

// ── Hard word expandable card ──────────────────────────────────
function HardWordCard({ word }: { word: HardWord }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between text-left gap-3"
        aria-expanded={open}
      >
        <div>
          <span className="font-display text-lg font-bold text-ink-900">
            {word.word}
          </span>
          <span className="ml-3 text-ink-400 text-sm italic">
            {word.syllables.join(" · ")}
          </span>
        </div>
        <span
          className="text-focus text-xl transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          ▾
        </span>
      </button>

      {open && (
        <div className="mt-4 space-y-3 pt-4 border-t border-cream-100">
          {/* Pronunciation */}
          <div className="flex items-center gap-2">
            <span className="text-sky text-sm font-medium">Say it:</span>
            <span className="font-display text-ink-700 text-sm bg-sky-light px-2 py-0.5 rounded-md">
              {word.pronunciation}
            </span>
          </div>

          {/* Meaning */}
          <p className="text-ink-900 reading-text">
            <span className="font-medium text-ink-600">Means: </span>
            {word.simple_meaning}
          </p>

          {/* Example */}
          <div className="bg-cream-100 rounded-xl p-3">
            <p className="text-ink-500 text-sm italic reading-text">
              "{word.example_sentence}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
