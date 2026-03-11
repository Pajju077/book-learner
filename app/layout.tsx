import type { Metadata } from "next";
import "./globals.css";
import NavBar from "@/components/NavBar";

export const metadata: Metadata = {
  title: "Book Learner — Your Personal Knowledge Engine",
  description:
    "Capture, organize and deeply understand your book highlights with AI.",
  icons: { icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>📖</text></svg>" },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <NavBar />
        <main className="min-h-screen">{children}</main>
        <footer className="border-t border-parchment-200 mt-16 py-8 text-center text-ink-400 text-sm font-sans">
          <p className="font-serif italic text-ink-300">
            "The more that you read, the more things you will know."
          </p>
          <p className="mt-1 text-xs text-ink-300">— Book Learner · Your Personal Knowledge Engine</p>
        </footer>
      </body>
    </html>
  );
}
