"use client";

import { useEffect, useState } from "react";
import { type Highlight } from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { X, Brain, Loader2, BookOpen, AlertCircle, Lightbulb, Globe, Zap, HelpCircle, Anchor } from "lucide-react";

type DeepDiveResult = {
  topic: string;
  context: string;
  explanation: string;
  examples: string;
  why_it_matters: string;
  memory_reinforcement: string;
  sources: string;
};

type Props = {
  highlight: Highlight;
  open: boolean;
  onClose: () => void;
};

const sections: {
  key: keyof DeepDiveResult;
  label: string;
  icon: React.ReactNode;
  color: string;
}[] = [
  { key: "topic", label: "Topic", icon: <HelpCircle size={14} />, color: "text-rust-500" },
  { key: "context", label: "Context", icon: <Globe size={14} />, color: "text-ink-500" },
  { key: "explanation", label: "Explanation", icon: <Brain size={14} />, color: "text-ink-600" },
  { key: "examples", label: "Examples", icon: <Lightbulb size={14} />, color: "text-gold-600 text-parchment-600" },
  { key: "why_it_matters", label: "Why It Matters", icon: <Zap size={14} />, color: "text-sage-600" },
  { key: "memory_reinforcement", label: "Memory Reinforcement", icon: <Anchor size={14} />, color: "text-rust-400" },
  { key: "sources", label: "Sources", icon: <BookOpen size={14} />, color: "text-ink-400" },
];

export default function DeepDiveModal({ highlight, open, onClose }: Props) {
  const [result, setResult] = useState<DeepDiveResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setResult(null);
    setError(null);
    loadDeepDive();
  }, [open, highlight.id]);

  async function loadDeepDive() {
    // Check if cached in DB
    const { data: cached } = await supabase
      .from("deep_dives")
      .select("*")
      .eq("highlight_id", highlight.id)
      .order("created_at", { ascending: false })
      .limit(1);

    if (cached && cached.length > 0) {
      const c = cached[0];
      setResult({
        topic: c.topic,
        context: c.context,
        explanation: c.explanation,
        examples: c.examples,
        why_it_matters: c.why_it_matters,
        memory_reinforcement: c.memory_reinforcement,
        sources: c.sources,
      });
      return;
    }

    // Generate fresh
    setLoading(true);
    try {
      const res = await fetch("/api/deep-dive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quote: highlight.quote,
          book_name: highlight.book_name,
          category: highlight.category,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "AI generation failed");

      setResult(data);

      // Cache in DB
      await supabase.from("deep_dives").insert({
        highlight_id: highlight.id,
        topic: data.topic,
        context: data.context,
        explanation: data.explanation,
        examples: data.examples,
        why_it_matters: data.why_it_matters,
        memory_reinforcement: data.memory_reinforcement,
        sources: data.sources,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-12 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative bg-white rounded-xl border border-parchment-200 shadow-2xl w-full max-w-2xl my-4 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-parchment-200">
          <div className="flex items-center gap-2">
            <Brain size={16} className="text-rust-400" />
            <span className="font-sans text-sm font-medium text-ink-700 uppercase tracking-wider">
              Deep Dive
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-ink-300 hover:text-ink-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Quote */}
        <div className="px-6 py-4 bg-parchment-50 border-b border-parchment-200">
          <div className="flex items-center gap-2 text-xs text-ink-400 font-sans mb-2">
            <BookOpen size={11} />
            <span className="italic">{highlight.book_name}</span>
            {highlight.page_number && <span>· p.{highlight.page_number}</span>}
          </div>
          <blockquote className="quote-text text-ink-700 text-sm leading-relaxed">
            "{highlight.quote}"
          </blockquote>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="flex flex-col items-center py-12 gap-4">
              <Loader2 size={24} className="animate-spin text-rust-400" />
              <p className="text-sm text-ink-400 font-sans">
                Claude is analyzing this quote...
              </p>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
              <AlertCircle size={16} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-sans text-red-700 font-medium mb-1">Generation failed</p>
                <p className="text-xs text-red-500 font-sans">{error}</p>
                <button
                  onClick={loadDeepDive}
                  className="mt-2 text-xs text-red-600 underline font-sans hover:text-red-700"
                >
                  Try again
                </button>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-5">
              {sections.map(({ key, label, icon, color }) => (
                <div key={key} className="deep-dive-section">
                  <div className={`flex items-center gap-1.5 ${color} mb-1.5`}>
                    {icon}
                    <span className="text-xs font-sans uppercase tracking-widest font-medium">
                      {label}
                    </span>
                  </div>
                  <p className="text-ink-700 text-sm font-sans leading-relaxed">
                    {result[key]}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
