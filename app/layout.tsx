import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://solvemylongcovid.com"),
  title: {
    default: "Solve My Long COVID — figure out which mechanisms are driving your symptoms",
    template: "%s · Solve My Long COVID",
  },
  description:
    "An educational tool that walks you through the possible causal mechanisms of Long COVID, helps you reason about which are active for you, and recommends the single most informative next test. Not medical advice.",
  openGraph: {
    title: "Solve My Long COVID",
    description:
      "Figure out which Long COVID mechanisms are driving your symptoms — and the most informative next test. Educational, not medical advice.",
    url: "https://solvemylongcovid.com",
    siteName: "Solve My Long COVID",
    type: "website",
  },
  robots: { index: true, follow: true },
};

function SiteHeader() {
  return (
    <header className="border-b border-border bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/60 sticky top-0 z-40">
      <nav
        className="container flex h-14 items-center justify-between gap-4"
        aria-label="Primary"
      >
        <Link href="/" className="font-semibold tracking-tight text-foreground">
          Solve My Long COVID
        </Link>
        <ul className="flex items-center gap-1 text-sm">
          {[
            ["Wizard", "/wizard"],
            ["Mechanisms", "/mechanisms"],
            ["Tests", "/tests"],
            ["Method", "/methodology"],
            ["About", "/about"],
          ].map(([label, href]) => (
            <li key={href}>
              <Link
                href={href}
                className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-secondary/40">
      <div className="container py-8 text-sm text-muted-foreground prose-readable">
        <p className="font-medium text-foreground">
          This is an educational tool, not medical advice.
        </p>
        <p className="mt-2">
          Solve My Long COVID helps you reason about possible mechanisms behind your symptoms. It
          does not diagnose you, and its estimates are based on hand-authored expert judgment, not a
          validated clinical algorithm. Always discuss decisions about testing and treatment with a
          qualified clinician. Nothing here should be used to start, stop, or change any treatment
          on your own.
        </p>
        <p className="mt-4">
          <Link href="/methodology" className="underline hover:text-foreground">
            How the reasoning works
          </Link>{" "}
          ·{" "}
          <Link href="/about" className="underline hover:text-foreground">
            About &amp; sources
          </Link>
        </p>
      </div>
    </footer>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
