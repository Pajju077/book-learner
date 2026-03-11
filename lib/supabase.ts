import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Highlight = {
  id: string;
  date: string;
  book_name: string;
  page_number: number | null;
  quote: string;
  category: string;
  why_this_matters: string;
  notes: string | null;
  created_at: string;
};

export type Category = {
  id: string;
  name: string;
  created_at: string;
};

export type DeepDive = {
  id: string;
  highlight_id: string;
  topic: string;
  context: string;
  explanation: string;
  examples: string;
  why_it_matters: string;
  memory_reinforcement: string;
  sources: string;
  created_at: string;
};
