"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Plus, Check, Loader2 } from "lucide-react";

export default function AddHighlightPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState("");
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    book_name: "",
    page_number: "",
    quote: "",
    category: "",
    why_this_matters: "",
    notes: "",
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  async function fetchCategories() {
    const { data } = await supabase
      .from("categories")
      .select("name")
      .order("name");
    if (data) setCategories(data.map((c) => c.name));
  }

  async function addCategory() {
    if (!newCategory.trim()) return;
    const { error } = await supabase
      .from("categories")
      .insert({ name: newCategory.trim() })
      .select();
    if (!error) {
      const updated = [...categories, newCategory.trim()].sort();
      setCategories(updated);
      setForm({ ...form, category: newCategory.trim() });
      setNewCategory("");
      setShowNewCategory(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.book_name || !form.quote || !form.category || !form.why_this_matters) return;

    setSaving(true);
    const { error } = await supabase.from("highlights").insert({
      date: form.date,
      book_name: form.book_name.trim(),
      page_number: form.page_number ? parseInt(form.page_number) : null,
      quote: form.quote.trim(),
      category: form.category,
      why_this_matters: form.why_this_matters.trim(),
      notes: form.notes.trim() || null,
    });

    setSaving(false);
    if (!error) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/");
      }, 1200);
    }
  }

  const inputClass =
    "w-full bg-parchment-50 border border-parchment-300 rounded px-4 py-2.5 font-sans text-ink-800 text-sm placeholder:text-ink-300 focus:outline-none focus:border-ink-500 transition-colors";
  const labelClass =
    "block text-xs font-sans uppercase tracking-wider text-ink-500 mb-1.5";

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="mb-10">
        <div className="page-header-line mb-3" />
        <h1 className="font-serif text-3xl text-ink-900 mb-2">
          Add a Highlight
        </h1>
        <p className="text-ink-400 font-sans text-sm">
          Capture a quote that moved or challenged you.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Date + Book row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Date *</label>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className={labelClass}>Page Number</label>
            <input
              type="number"
              value={form.page_number}
              onChange={(e) => setForm({ ...form, page_number: e.target.value })}
              placeholder="e.g. 142"
              className={inputClass}
              min="1"
            />
          </div>
        </div>

        {/* Book name */}
        <div>
          <label className={labelClass}>Book Name *</label>
          <input
            type="text"
            value={form.book_name}
            onChange={(e) => setForm({ ...form, book_name: e.target.value })}
            placeholder="e.g. Man's Search for Meaning"
            className={inputClass}
            required
          />
        </div>

        {/* Quote */}
        <div>
          <label className={labelClass}>Quote / Highlight *</label>
          <textarea
            value={form.quote}
            onChange={(e) => setForm({ ...form, quote: e.target.value })}
            placeholder="Paste or type the highlight here..."
            rows={5}
            className={`${inputClass} resize-none leading-relaxed font-serif italic`}
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className={labelClass}>Category *</label>
          <div className="flex gap-2">
            <select
              value={form.category}
              onChange={(e) => {
                if (e.target.value === "__new__") {
                  setShowNewCategory(true);
                } else {
                  setForm({ ...form, category: e.target.value });
                }
              }}
              className={`${inputClass} flex-1`}
              required
            >
              <option value="">Select a category...</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__new__">+ Add new category...</option>
            </select>
          </div>

          {/* New category input */}
          {showNewCategory && (
            <div className="mt-2 flex gap-2">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name..."
                className={`${inputClass} flex-1`}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCategory())}
                autoFocus
              />
              <button
                type="button"
                onClick={addCategory}
                className="bg-ink-900 text-parchment-100 px-4 py-2.5 rounded text-sm font-sans hover:bg-ink-800 transition-colors flex items-center gap-1"
              >
                <Plus size={14} />
                Add
              </button>
              <button
                type="button"
                onClick={() => setShowNewCategory(false)}
                className="border border-parchment-300 text-ink-500 px-3 py-2.5 rounded text-sm font-sans hover:bg-parchment-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Why this matters */}
        <div>
          <label className={labelClass}>Why This Matters To Me *</label>
          <textarea
            value={form.why_this_matters}
            onChange={(e) => setForm({ ...form, why_this_matters: e.target.value })}
            placeholder="Write your personal reflection on why this highlight resonates..."
            rows={3}
            className={`${inputClass} resize-none`}
            required
          />
        </div>

        {/* Notes */}
        <div>
          <label className={labelClass}>Notes (optional)</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any additional context, connections, or ideas..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving || success}
            className="w-full flex items-center justify-center gap-2 bg-ink-900 text-parchment-100 py-3 rounded font-sans text-sm hover:bg-ink-800 transition-all disabled:opacity-60"
          >
            {success ? (
              <>
                <Check size={15} className="text-sage-400" />
                Saved! Redirecting...
              </>
            ) : saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Saving...
              </>
            ) : (
              "Save Highlight"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
