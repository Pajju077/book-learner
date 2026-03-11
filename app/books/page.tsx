"use client";

import { useEffect, useState } from "react";
import { supabase, type Highlight } from "@/lib/supabase";
import { BookOpen, ChevronDown, ChevronUp, Star } from "lucide-react";
import { format } from "date-fns";
import DeepDiveModal from "@/components/DeepDiveModal";

type BookGroup = {
  book_name: string;
  highlights: Highlight[];
};

export default function BooksPage() {
  const [books, setBooks] = useState<BookGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deepDive, setDeepDive] = useState<Highlight | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from("highlights")
        .select("*")
        .order("created_at", { ascending: false });

      if (data) {
        const map = new Map<string, Highlight[]>();
        for (const h of data) {
          const arr = map.get(h.book_name) || [];
          arr.push(h);
          map.set(h.book_name, arr);
        }
        const grouped = Array.from(map.entries())
          .map(([book_name, highlights]) => ({ book_name, highlights }))
          .sort((a, b) => b.highlights.length - a.highlights.length);
        setBooks(grouped);
      }
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-parchment-100 rounded-lg animate-shimmer" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="page-header-line mb-3" />
        <h1 className="font-serif text-3xl text-ink-900 mb-2">Book Dashboard</h1>
        <p className="text-ink-400 font-sans text-sm">
          {books.length} book{books.length !== 1 ? "s" : ""} in your library
        </p>
      </div>

      {/* Stats row */}
      {books.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-4 text-center">
            <p className="font-serif text-2xl text-ink-800">{books.length}</p>
            <p className="text-xs text-ink-400 font-sans mt-1">Books Read</p>
          </div>
          <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-4 text-center">
            <p className="font-serif text-2xl text-ink-800">
              {books.reduce((s, b) => s + b.highlights.length, 0)}
            </p>
            <p className="text-xs text-ink-400 font-sans mt-1">Total Highlights</p>
          </div>
          <div className="bg-parchment-50 border border-parchment-200 rounded-lg p-4 text-center">
            <p className="font-serif text-2xl text-ink-800">
              {books.length > 0
                ? Math.round(
                    books.reduce((s, b) => s + b.highlights.length, 0) / books.length
                  )
                : 0}
            </p>
            <p className="text-xs text-ink-400 font-sans mt-1">Avg. per Book</p>
          </div>
        </div>
      )}

      {/* Books list */}
      {books.length === 0 ? (
        <div className="text-center py-20 text-ink-400">
          <BookOpen size={32} className="mx-auto mb-3 text-parchment-400" />
          <p className="font-serif italic">No books yet. Start adding highlights!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {books.map((book, idx) => {
            const isOpen = expanded === book.book_name;
            // Pick the "best" quote — the longest why_this_matters
            const best = [...book.highlights].sort(
              (a, b) => b.why_this_matters.length - a.why_this_matters.length
            )[0];

            return (
              <div key={book.book_name} className="border border-parchment-200 rounded-lg overflow-hidden bg-parchment-50">
                <button
                  onClick={() => setExpanded(isOpen ? null : book.book_name)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-parchment-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-ink-300 font-sans w-6">#{idx + 1}</span>
                    <BookOpen size={14} className="text-rust-400" />
                    <span className="font-serif text-ink-800">{book.book_name}</span>
                    <span className="text-xs bg-parchment-200 text-ink-500 px-2 py-0.5 rounded-full font-sans">
                      {book.highlights.length} highlight{book.highlights.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {isOpen ? <ChevronUp size={15} className="text-ink-400" /> : <ChevronDown size={15} className="text-ink-400" />}
                </button>

                {/* Best quote preview when collapsed */}
                {!isOpen && best && (
                  <div className="px-5 pb-4 border-t border-parchment-200 pt-3">
                    <div className="flex items-start gap-2">
                      <Star size={12} className="text-gold-400 mt-1 shrink-0 text-parchment-400" />
                      <p className="quote-text text-ink-500 text-xs leading-relaxed line-clamp-2">
                        {best.quote}
                      </p>
                    </div>
                  </div>
                )}

                {/* All highlights */}
                {isOpen && (
                  <div className="border-t border-parchment-200 divide-y divide-parchment-200">
                    {book.highlights.map((h) => (
                      <div key={h.id} className="px-5 py-4 bg-white">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-parchment-100 text-ink-500 px-2 py-0.5 rounded font-sans">
                              {h.category}
                            </span>
                            {h.page_number && (
                              <span className="text-xs text-ink-300 font-sans">p.{h.page_number}</span>
                            )}
                          </div>
                          <span className="text-xs text-ink-300 font-sans">
                            {format(new Date(h.date), "MMM d, yyyy")}
                          </span>
                        </div>
                        <blockquote className="quote-text text-ink-700 text-sm mb-3 leading-relaxed">
                          "{h.quote}"
                        </blockquote>
                        {h.why_this_matters && (
                          <p className="text-xs text-ink-500 font-sans leading-relaxed mb-3">
                            <span className="text-sage-600 uppercase tracking-wider mr-1">Why:</span>
                            {h.why_this_matters}
                          </p>
                        )}
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
              </div>
            );
          })}
        </div>
      )}

      {deepDive && (
        <DeepDiveModal highlight={deepDive} open={!!deepDive} onClose={() => setDeepDive(null)} />
      )}
    </div>
  );
}
