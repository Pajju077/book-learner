import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { quote, book_name, category } = await req.json();

  if (!quote) {
    return NextResponse.json({ error: "Quote is required" }, { status: 400 });
  }

  const systemPrompt = `You are a knowledge explainer. Explain the following quote clearly and educationally.

Rules:
- Only analyze the quote provided. Do not invent research or statistics.
- Do NOT fabricate links, citations, or studies.
- Avoid motivational fluff or vague writing.
- Use clear reasoning and concrete, grounded examples.
- Keep explanations precise and educational.
- If sources are uncertain, write exactly: "No verified sources available"

Respond ONLY with a valid JSON object. No preamble, no markdown fences. The JSON must have exactly these keys:
{
  "topic": "The core concept or subject of this quote (1-2 sentences)",
  "context": "The intellectual or historical context in which this idea exists (2-3 sentences)",
  "explanation": "A clear, logical breakdown of what the quote means (3-5 sentences)",
  "examples": "1-2 concrete real-world examples that illustrate this idea",
  "why_it_matters": "Why this idea is practically important (2-3 sentences)",
  "memory_reinforcement": "A vivid mental model, analogy, or mnemonic to remember this idea",
  "sources": "Only verified thinkers, books, or fields — or write: No verified sources available"
}`;

  const userMessage = `Quote: "${quote}"
Book: ${book_name}
Category: ${category}

Please provide a deep-dive explanation of this quote following the output format.`;

  try {
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
        system: systemPrompt,
        messages: [{ role: "user", content: userMessage }],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || "Anthropic API error");
    }

    const text = data.content?.[0]?.text;
    if (!text) throw new Error("No response from AI");

    // Parse JSON from response
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
