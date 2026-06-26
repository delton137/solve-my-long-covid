import type { Metadata } from "next";
import Link from "next/link";
import { KB } from "@/lib/kb";
import type { Mechanism } from "@/lib/kb/types";

export const metadata: Metadata = {
  title: "The mechanisms of Long COVID",
  description:
    "Long COVID isn't one disease. Browse the ~16 distinct causal mechanisms — what each is, how it's tested, and what the evidence says about treating it.",
};

const CATEGORY_META: Record<Mechanism["category"], { title: string; blurb: string }> = {
  diagnostic: {
    title: "Check these first",
    blurb: "Cheap, high-yield steps that can explain symptoms or prevent harm before anything else.",
  },
  organic: {
    title: "Physical / organic mechanisms",
    blurb: "Tissue, immune, vascular, and viral processes — some measurable, most without a proven cure yet.",
  },
  mixed: {
    title: "Mixed mechanisms",
    blurb: "Drivers with both physical and brain/behavioral components that feed back on each other.",
  },
  brain_based: {
    title: "Nervous-system / brain-based mechanisms",
    blurb:
      "Real, treatable contributors that coexist with physical causes — never 'all in your head.'",
  },
};

const ORDER: Mechanism["category"][] = ["diagnostic", "organic", "mixed", "brain_based"];

export default function MechanismsPage() {
  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">The mechanisms of Long COVID</h1>
      <p className="mt-3 text-lg text-muted-foreground prose-readable">
        Long COVID isn&apos;t one disease — it&apos;s a label for symptoms that can be produced by roughly a
        dozen distinct mechanisms. Any given person may have one, several, or many at once. The goal isn&apos;t
        to pick a single culprit, but to work out which ones are active for you.
      </p>
      <p className="mt-4">
        <Link
          href="/wizard"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try the wizard
        </Link>
      </p>

      {ORDER.map((cat) => {
        const items = KB.mechanisms.filter((m) => m.category === cat);
        if (!items.length) return null;
        const meta = CATEGORY_META[cat];
        return (
          <section key={cat} className="mt-10">
            <h2 className="text-xl font-semibold">{meta.title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{meta.blurb}</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {items.map((m) => (
                <Link
                  key={m.id}
                  href={`/mechanisms/${m.id}`}
                  className="rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent/20"
                >
                  <h3 className="font-semibold text-foreground">{m.name}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{m.shortDescription}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
