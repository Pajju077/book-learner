"use client";

import { useEffect, useState } from "react";
import { supabase, type Highlight } from "@/lib/supabase";
import { Tag, ChevronDown, ChevronUp, Search, BookOpen } from "lucide-react";
import { format } from "date-fns";
import DeepDiveModal from "@/components/DeepDiveModal";

type CategoryWithHighlights = {
  name: string;
  highlights: Highlight[];
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithHighlights[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [searchField, setSearchField] = useState<"keyword" | "book" | "date">("keyword");
  const [deepDive, setDeepDive] = useState<Highlight | null>(null);

  useEffect(() => {
    async function load() {
      const { data: cats } = await supabase.from("categories").select("name").order("name");
      const { data: highlights } = await supabase.from("highlights").select("*").order("created_at", { ascending: false });

      if (cats && highlights) {
        const grouped = cats.map((c) => ({
          name: c.name,
          highlights: highlights.filter((h) => h.category === c.name),
        })).filter((c) => c.highlights.length > 0);
        setCategories(grouped);
      }
      setLoading(false);
    }
    load();
  }, []);

  function filterHighlights(highlights: Highlight[]) {
    if (!search.trim()) return highlights;
    const q = search.toLowerCase();
    return highlights.filter((h) => {
      if (searchField === "keyword") return h.quote.toLowerCase().includes(q) || h.why_this_matters.toLowerCase().includes(q);
      if (searchField === "book") return h.book_name.toLowerCase().includes(q);
      if (searchField === "date") return h.date.includes(q);
      return true;
    });
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-shimmer space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-parchment-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="page-header-line mb-3" />
        <h1 className="font-serif text-3xl text-ink-900 mb-2">Categories</h1>
        <p className="text-ink-400 font-sans text-sm">Browse your highlights by topic.</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-8">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search by ${searchField}...`}
            className="w-full bg-parchment-50 border border-parchment-300 rounded pl-9 pr-4 py-2 text-sm font-sans text-ink-800 focus:outline-none focus:border-ink-500"
          />
        </div>
        <select
          value={searchField}
          onChange={(e) => setSearchField(e.target.value as "keyword" | "book" | "date")}
          className="bg-parchment-50 border border-parchment-300 rounded px-3 py-2 text-sm font-sans text-ink-600 focus:outline-none"
        >
          <option value="keyword">Keyword</option>
          <option value="book">Book</option>
          <option value="date">Date</option>
        </select>
      </div>

      {/* Categories list */}
      {categories.length === 0 ? (
        <div className="text-center py-20 text-ink-400">
          <Tag size={32} className="mx-auto mb-3 text-parchment-400" />
          <p className="font-serif italic">No categories yet. Add some highlights to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => {
            const isOpen = expanded === cat.name;
            const filtered = filterHighlights(cat.highlights);

            return (
              <div key={cat.name} className="border border-parchment-200 rounded-lg overflow-hidden bg-parchment-50">
                {/* Category header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : cat.name)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-parchment-100 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <Tag size={14} className="text-gold-500 text-parchment-500" />
                    <span className="font-serif text-ink-800">{cat.name}</span>
                    <span className="text-xs bg-parchment-200 text-ink-500 px-2 py-0.5 rounded-full font-sans">
                      {cat.highlights.length}
                    </span>
                  </div>
                  {isOpen ? <ChevronUp size={15} className="text-ink-400" /> : <ChevronDown size={15} className="text-ink-400" />}
                </button>

                {/* Highlights */}
                {isOpen && (
                  <div className="border-t border-parchment-200 divide-y divide-parchment-200">
                    {filtered.length === 0 ? (
                      <p className="px-5 py-4 text-sm text-ink-400 font-sans italic">No highlights match your search.</p>
                    ) : (
                      filtered.map((h) => (
                        <div key={h.id} className="px-5 py-4 bg-white">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex items-center gap-2 text-xs text-ink-400 font-sans">
                              <BookOpen size={12} />
                              <span className="italic">{h.book_name}</span>
                              {h.page_number && <span>· p.{h.page_number}</span>}
                            </div>
                            <span className="text-xs text-ink-300 font-sans whitespace-nowrap">
                              {format(new Date(h.date), "MMM d, yyyy")}
                            </span>
                          </div>
                          <blockquote className="quote-text text-ink-700 text-sm mb-2 leading-relaxed">
                            "{h.quote}"
                          </blockquote>
                          {h.why_this_matters && (
                            <p className="text-xs text-ink-500 font-sans leading-relaxed mb-2">
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
                      ))
                    )}
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
