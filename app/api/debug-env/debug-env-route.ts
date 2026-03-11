// app/api/debug-env/route.ts
//
// TEMPORARY diagnostic route. Visit /api/debug-env on your production URL
// to confirm env vars are actually reaching the Vercel runtime.
//
// DELETE THIS FILE once the issue is resolved — it exposes partial key info.

import { NextResponse } from "next/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  const mask = (s: string) =>
    s.length > 8 ? `${s.slice(0, 6)}...${s.slice(-4)}` : s ? "[set, short]" : "[MISSING]";

  // Also attempt a real Supabase categories fetch from the server side
  let supabaseReachable = false;
  let categoriesCount: number | null = null;
  let fetchError: string | null = null;

  if (url && key) {
    try {
      const { createClient } = await import("@supabase/supabase-js");
      const client = createClient(url, key);
      const { data, error, count } = await client
        .from("categories")
        .select("name", { count: "exact" });

      if (error) {
        fetchError = error.message;
      } else {
        supabaseReachable = true;
        categoriesCount = count ?? data?.length ?? 0;
      }
    } catch (e) {
      fetchError = e instanceof Error ? e.message : String(e);
    }
  }

  return NextResponse.json({
    env: {
      NEXT_PUBLIC_SUPABASE_URL: mask(url),
      NEXT_PUBLIC_SUPABASE_ANON_KEY: mask(key),
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV ?? "not set",
    },
    supabase: {
      reachable: supabaseReachable,
      categoriesCount,
      error: fetchError,
    },
    timestamp: new Date().toISOString(),
  });
}
