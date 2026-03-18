import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(req: NextRequest) {
  const { highlight_id, quote, book_name, category } = await req.json();

  if (!quote || !highlight_id) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }

  try {
    // 🔍 STEP 1: Check if deep dive already exists
    const { data: existing } = await supabase
      .from("deep_dives")
      .select("*")
      .eq("highlight_id", highlight_id)
      .single();

    if (existing) {
      return NextResponse.json(existing);
    }

    // 🤖 STEP 2: Call Claude
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        system: `You are a knowledge explainer. No hallucination. Structured output only.`,
        messages: [
          {
            role: "user",
            content: `Quote: "${quote}"`,
          },
        ],
      }),
    });

    const data = await response.json();
    const text = data.content?.[0]?.text;

    if (!text) throw new Error("No AI response");

    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    // 💾 STEP 3: Save structured fields
    const { error } = await supabase.from("deep_dives").insert({
      highlight_id,
      topic: parsed.topic,
      context: parsed.context,
      explanation: parsed.explanation,
      examples: parsed.examples,
      why_it_matters: parsed.why_it_matters,
      memory_reinforcement: parsed.memory_reinforcement,
      sources: parsed.sources,
    });

    if (error) throw error;

    return NextResponse.json(parsed);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
