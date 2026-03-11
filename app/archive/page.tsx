"use client";

import { useEffect, useState } from "react";
import { supabase, type Highlight } from "@/lib/supabase";
import { Search, Filter, BookOpen, Edit2, Check, X } from "lucide-react";
import { format } from "date-fns";
import DeepDiveModal from "@/components/DeepDiveModal";

export default function ArchivePage() {
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [filtered, setFiltered] = useState<Highlight[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [books, setBooks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [deepDive, setDeepDive] = useState<Highlight | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesValue, setNotesValue] = useState("");

  const [filters, setFilters] = useState({
    keyword: "",
    book: "",
    category: "",
    dateFrom: "",
    dateTo: "",
  });

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("highlights")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        setHighlights(data);
        setFiltered(data);
        setCategories([...new Set(data.map((h) => h.category))].sort());
        setBooks([...new Set(data.map((h) => h.book_name))].sort());
      }
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    let result = [...highlights];

    if (filters.keyword) {
      const q = filters.keyword.toLowerCase();
      result = result.filter(
        (h) =>
          h.quote.toLowerCase().includes(q) ||
          h.why_this_matters.toLowerCase().includes(q) ||
          (h.notes || "").toLowerCase().includes(q) ||
          h.book_name.toLowerCase().includes(q)
      );
    }
    if (filters.book) result = result.filter((h) => h.book_name === filters.book);
    if (filters.category) result = result.filter((h) => h.category === filters.category);
    if (filters.dateFrom) result = result.filter((h) => h.date >= filters.dateFrom);
    if (filters.dateTo) result = result.filter((h) => h.date <= filters.dateTo);

    setFiltered(result);
  }, [filters, highlights]);

  async function saveNotes(id: string) {
    await supabase.from("highlights").update({ notes: notesValue }).eq("id", id);
    setHighlights((prev) =>
      prev.map((h) => (h.id === id ? { ...h, notes: notesValue } : h))
    );
    setEditingNotes(null);
  }

  const inputClass =
    "bg-parchment-50 border border-parchment-300 rounded px-3 py-2 text-sm font-sans text-ink-700 focus:outline-none focus:border-ink-500 transition-colors";

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-parchment-100 rounded-lg animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="page-header-line mb-3" />
        <h1 className="font-serif text-3xl text-ink-900 mb-2">Thought Archive</h1>
        <p className="text-ink-400 font-sans text-sm">
          {highlights.length} total highlight{highlights.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-4 mb-8 space-y-3">
        <div className="flex items-center gap-2 text-xs text-ink-400 font-sans uppercase tracking-wider mb-1">
          <Filter size={12} />
          Filters
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
            <input
              type="text"
              placeholder="Search keywords..."
              value={filters.keyword}
              onChange={(e) => setFilters({ ...filters, keyword: e.target.value })}
              className={`${inputClass} w-full pl-9`}
            />
          </div>
          <select
            value={filters.book}
            onChange={(e) => setFilters({ ...filters, book: e.target.value })}
            className={`${inputClass} w-full`}
          >
            <option value="">All books</option>
            {books.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className={`${inputClass} w-full`}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className={`${inputClass} flex-1`}
              title="From date"
            />
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className={`${inputClass} flex-1`}
              title="To date"
            />
          </div>
        </div>
        {(filters.keyword || filters.book || filters.category || filters.dateFrom || filters.dateTo) && (
          <button
            onClick={() => setFilters({ keyword: "", book: "", category: "", dateFrom: "", dateTo: "" })}
            className="text-xs text-rust-500 font-sans hover:text-rust-600 transition-colors"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* Results count */}
      <p className="text-xs text-ink-400 font-sans mb-4">
        Showing {filtered.length} of {highlights.length} highlights
      </p>

      {/* Highlights list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-ink-400">
          <p className="font-serif italic">No highlights match your filters.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((h) => (
            <div
              key={h.id}
              className="bg-white border border-parchment-200 rounded-lg p-5 card-hover"
            >
              {/* Meta row */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-parchment-100 text-ink-500 px-2 py-0.5 rounded font-sans">
                    {h.category}
                  </span>
                  <div className="flex items-center gap-1 text-xs text-ink-400 font-sans">
                    <BookOpen size={11} />
                    <span className="italic">{h.book_name}</span>
                    {h.page_number && <span>· p.{h.page_number}</span>}
                  </div>
                </div>
                <span className="text-xs text-ink-300 font-sans">
                  {format(new Date(h.date), "MMM d, yyyy")}
                </span>
              </div>

              {/* Quote */}
              <blockquote className="quote-text text-ink-700 text-sm leading-relaxed mb-3">
                "{h.quote}"
              </blockquote>

              {/* Why this matters */}
              {h.why_this_matters && (
                <div className="bg-sage-500/5 border-l-2 border-sage-400 pl-3 py-1 mb-3">
                  <p className="text-xs text-ink-500 font-sans leading-relaxed">
                    <span className="text-sage-600 uppercase tracking-wider mr-1">Why:</span>
                    {h.why_this_matters}
                  </p>
                </div>
              )}

              {/* Notes */}
              <div className="mb-3">
                {editingNotes === h.id ? (
                  <div className="flex gap-2">
                    <textarea
                      value={notesValue}
                      onChange={(e) => setNotesValue(e.target.value)}
                      rows={2}
                      className="flex-1 bg-parchment-50 border border-parchment-300 rounded px-3 py-2 text-sm font-sans text-ink-700 focus:outline-none resize-none"
                      placeholder="Add notes..."
                      autoFocus
                    />
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => saveNotes(h.id)}
                        className="p-1.5 bg-sage-500 text-white rounded hover:bg-sage-600 transition-colors"
                      >
                        <Check size={13} />
                      </button>
                      <button
                        onClick={() => setEditingNotes(null)}
                        className="p-1.5 bg-parchment-200 text-ink-500 rounded hover:bg-parchment-300 transition-colors"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingNotes(h.id);
                      setNotesValue(h.notes || "");
                    }}
                    className="flex items-center gap-1.5 text-xs text-ink-400 hover:text-ink-600 font-sans transition-colors"
                  >
                    <Edit2 size={11} />
                    {h.notes ? h.notes : "Add notes..."}
                  </button>
                )}
              </div>

              {/* Actions */}
              <button
                onClick={() => setDeepDive(h)}
                className="text-xs text-ink-500 border border-parchment-300 px-3 py-1 rounded font-sans hover:bg-parchment-100 transition-colors"
              >
                Deep Dive →
              </button>
            </div>
          ))}
        </div>
      )}

      {deepDive && (
        <DeepDiveModal highlight={deepDive} open={!!deepDive} onClose={() => setDeepDive(null)} />
      )}
    </div>
  );
}
