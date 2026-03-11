# 📖 Book Learner

**Your Personal Knowledge Engine for Book Highlights**

Read → Highlight → Understand → Reflect → Store → Revisit

---

## Features

- **Daily Thought** — One highlight each day for focused reflection
- **Random Wisdom** — Discover a random quote from your library
- **AI Deep Dive** — Claude Haiku explains any quote: topic, context, examples, memory reinforcement
- **Category Browser** — Browse highlights by topic with search
- **Book Dashboard** — See all books, highlight counts, and best quotes
- **Thought Archive** — Searchable archive with filters by keyword, book, category, date
- **Notes Editing** — Update personal notes on any highlight

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router) + React + Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| AI | Claude Haiku via Anthropic API |
| Hosting | Vercel |

---

## Setup Instructions

### 1. Clone the repository

```bash
git clone <your-repo-url>
cd book-learner
npm install
```

### 2. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. In the **SQL Editor**, run the contents of `supabase-schema.sql`
3. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon / public` key

### 3. Get your Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Create an API key

### 4. Configure environment variables

Copy the example file:

```bash
cp .env.local.example .env.local
```

Fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
ANTHROPIC_API_KEY=sk-ant-...
```

### 5. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Deploying to Vercel

### Option A: One-click (recommended)

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project**
3. Import your GitHub repo
4. Add environment variables (same as `.env.local`)
5. Deploy ✓

### Option B: CLI

```bash
npm install -g vercel
vercel
```

Follow the prompts and add your environment variables when asked.

---

## Database Schema

### `highlights`
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| date | DATE | When you read it |
| book_name | TEXT | Book title |
| page_number | INTEGER | Page (optional) |
| quote | TEXT | The highlight |
| category | TEXT | Topic category |
| why_this_matters | TEXT | Your reflection |
| notes | TEXT | Optional extra notes |
| created_at | TIMESTAMPTZ | Auto-generated |

### `categories`
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| name | TEXT | Category name (unique) |
| created_at | TIMESTAMPTZ | Auto-generated |

### `deep_dives`
| Column | Type | Description |
|---|---|---|
| id | UUID | Primary key |
| highlight_id | UUID | FK → highlights |
| topic | TEXT | Core concept |
| context | TEXT | Intellectual context |
| explanation | TEXT | Logical breakdown |
| examples | TEXT | Real-world examples |
| why_it_matters | TEXT | Practical importance |
| memory_reinforcement | TEXT | Mental model/analogy |
| sources | TEXT | Verified sources |
| created_at | TIMESTAMPTZ | Auto-generated |

---

## AI Rules

The Deep Dive AI (Claude Haiku) follows strict anti-hallucination guidelines:
- Only analyzes the provided quote
- Does NOT invent statistics or fake studies
- Does NOT generate fake links
- Outputs "No verified sources available" when uncertain
- Avoids motivational fluff
- Deep dives are cached in the database after first generation

---

## Project Structure

```
book-learner/
├── app/
│   ├── page.tsx              # Homepage (Daily Thought)
│   ├── add-highlight/        # Add new highlight
│   ├── categories/           # Browse by category
│   ├── books/                # Book dashboard
│   ├── archive/              # Full searchable archive
│   └── api/deep-dive/        # Claude Haiku API route
├── components/
│   ├── NavBar.tsx            # Navigation
│   └── DeepDiveModal.tsx     # AI explanation modal
├── lib/
│   └── supabase.ts           # Supabase client + types
├── supabase-schema.sql       # Run this in Supabase SQL editor
└── .env.local.example        # Environment variable template
```
