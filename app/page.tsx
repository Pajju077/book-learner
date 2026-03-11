"use client";

import { useEffect, useState, useCallback } from "react";
import { supabase, type Highlight } from "@/lib/supabase";
import { Shuffle, Brain, BookOpen, Sparkles } from "lucide-react";
import DeepDiveModal from "@/components/DeepDiveModal";
import Link from "next/link";
import { format } from "date-fns";

export default function HomePage() {
  const [highlight, setHighlight] = useState<Highlight | null>(null);
  const [loading, setLoading] = useState(true);
  const [deepDiveOpen, setDeepDiveOpen] = useState(false);
  const [totalCount, setTotalCount] = useState(0);

  const fetchRandom = useCallback(async () => {
    setLoading(true);
    const { count } = await supabase
      .from("highlights")
      .select("*", { count: "exact", head: true });

    if (!count) {
      setLoading(false);
      setTotalCount(0);
      return;
    }

    setTotalCount(count);
    const randomOffset = Math.floor(Math.random() * count);
    const { data } = await supabase
      .from("highlights")
      .select("*")
      .range(randomOffset, randomOffset);

    if (data && data.length > 0) setHighlight(data[0]);
    setLoading(false);
  }, []);

  const fetchDaily = useCallback(async () => {
    setLoading(true);
    // Use day of year as seed for "daily" consistency
    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) /
        86400000
    );

    const { count } = await supabase
      .from("highlights")
      .select("*", { count: "exact", head: true });

    if (!count) {
      setLoading(false);
      setTotalCount(0);
      return;
    }

    setTotalCount(count);
    const offset = dayOfYear % count;
    const { data } = await supabase
      .from("highlights")
      .select("*")
      .order("created_at", { ascending: true })
      .range(offset, offset);

    if (data && data.length > 0) setHighlight(data[0]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDaily();
  }, [fetchDaily]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="page-header-line mx-auto mb-3" />
        <p className="text-xs font-sans uppercase tracking-widest text-ink-400 mb-2">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </p>
        <h1 className="font-serif text-4xl text-ink-900 mb-3">
          Daily Thought
        </h1>
        <p className="text-ink-400 font-sans text-sm max-w-sm mx-auto">
          One highlight, chosen each day to anchor your reading practice.
        </p>
      </div>

      {/* Highlight Card */}
      {loading ? (
        <div className="bg-parchment-100 border border-parchment-200 rounded-lg p-10 animate-shimmer">
          <div className="h-4 bg-parchment-300 rounded w-3/4 mb-4" />
          <div className="h-4 bg-parchment-300 rounded w-full mb-2" />
          <div className="h-4 bg-parchment-300 rounded w-2/3" />
        </div>
      ) : totalCount === 0 ? (
        <div className="text-center py-20 bg-parchment-50 border border-parchment-200 rounded-lg">
          <BookOpen size={40} className="mx-auto text-parchment-400 mb-4" />
          <h2 className="font-serif text-2xl text-ink-700 mb-2">
            Your library is empty
          </h2>
          <p className="text-ink-400 text-sm mb-6">
            Begin by adding your first book highlight.
          </p>
          <Link
            href="/add-highlight"
            className="inline-flex items-center gap-2 bg-ink-900 text-parchment-100 px-6 py-2.5 rounded font-sans text-sm hover:bg-ink-800 transition-colors"
          >
            Add Your First Highlight
          </Link>
        </div>
      ) : highlight ? (
        <div className="animate-fade-in-up">
          {/* Category badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-block bg-parchment-200 text-ink-600 text-xs font-sans px-3 py-1 rounded-full uppercase tracking-wider">
              {highlight.category}
            </span>
            <span className="text-xs text-ink-300 font-sans">
              p. {highlight.page_number ?? "—"}
            </span>
          </div>

          {/* Quote */}
          <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-8 mb-6 relative">
            <span className="absolute top-4 left-6 text-5xl text-parchment-300 font-serif leading-none select-none">
              "
            </span>
            <blockquote className="quote-text text-ink-800 text-xl leading-relaxed pt-6 pb-2">
              {highlight.quote}
            </blockquote>
            <span className="absolute bottom-4 right-6 text-5xl text-parchment-300 font-serif leading-none select-none rotate-180">
              "
            </span>
          </div>

          {/* Book info */}
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={14} className="text-ink-400" />
            <p className="font-serif italic text-ink-600 text-sm">
              {highlight.book_name}
            </p>
          </div>

          {/* Why this matters */}
          {highlight.why_this_matters && (
            <div className="bg-sage-500/5 border border-sage-400/20 rounded-lg px-5 py-4 mb-6">
              <p className="text-xs font-sans uppercase tracking-widest text-sage-600 mb-1">
                Why This Matters
              </p>
              <p className="text-ink-700 text-sm leading-relaxed font-sans">
                {highlight.why_this_matters}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => setDeepDiveOpen(true)}
              className="flex items-center gap-2 bg-ink-900 text-parchment-100 px-5 py-2.5 rounded font-sans text-sm hover:bg-ink-800 transition-colors"
            >
              <Brain size={15} />
              Deep Dive
            </button>
            <button
              onClick={fetchRandom}
              className="flex items-center gap-2 border border-parchment-300 text-ink-600 px-5 py-2.5 rounded font-sans text-sm hover:bg-parchment-100 transition-colors"
            >
              <Shuffle size={15} />
              Random Wisdom
            </button>
          </div>
        </div>
      ) : null}

      {/* Stats footer */}
      {totalCount > 0 && (
        <div className="mt-16 pt-8 border-t border-parchment-200">
          <div className="ornamental-rule text-parchment-400 text-xs uppercase tracking-widest mb-8">
            Your Library
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="font-serif text-3xl text-ink-800">{totalCount}</p>
              <p className="text-xs text-ink-400 font-sans mt-1">Highlights</p>
            </div>
            <div>
              <Link href="/books">
                <p className="font-serif text-3xl text-ink-800 hover:text-rust-500 transition-colors cursor-pointer">→</p>
                <p className="text-xs text-ink-400 font-sans mt-1">Books</p>
              </Link>
            </div>
            <div>
              <Link href="/archive">
                <p className="font-serif text-3xl text-ink-800 hover:text-rust-500 transition-colors cursor-pointer">→</p>
                <p className="text-xs text-ink-400 font-sans mt-1">Archive</p>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Deep Dive Modal */}
      {highlight && (
        <DeepDiveModal
          highlight={highlight}
          open={deepDiveOpen}
          onClose={() => setDeepDiveOpen(false)}
        />
      )}
    </div>
  );
}
