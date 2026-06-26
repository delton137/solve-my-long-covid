import type { Metadata } from "next";
import Link from "next/link";
import { KB } from "@/lib/kb";
import { formatCost, ACCESSIBILITY_LABEL } from "@/components/display";

export const metadata: Metadata = {
  title: "Diagnostic tests & costs",
  description:
    "A catalog of the tests that distinguish Long COVID mechanisms — rough cost, where to get them, and what each one tells you. Testing for everything is expensive; the wizard finds the highest-value test for you.",
};

export default function TestsPage() {
  const tests = [...KB.diagnosticTests].sort((a, b) => (a.costLow + a.costHigh) / 2 - (b.costLow + b.costHigh) / 2);

  return (
    <div className="container max-w-4xl py-12">
      <h1 className="text-3xl font-bold tracking-tight">Diagnostic tests &amp; what they cost</h1>
      <p className="mt-3 text-lg text-muted-foreground prose-readable">
        Testing for every mechanism would cost thousands of dollars. That&apos;s the real bottleneck — so the{" "}
        <Link href="/wizard" className="underline hover:text-foreground">
          wizard
        </Link>{" "}
        works out the single most informative test for <em>your</em> situation. Here&apos;s the full catalog,
        cheapest first.
      </p>

      <div className="mt-8 space-y-3">
        {tests.map((t) => {
          const mechs = [...new Set(t.effects.map((e) => e.mechanismId))]
            .map((id) => KB.mechanismById.get(id))
            .filter(Boolean);
          return (
            <div key={t.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h2 className="font-semibold text-foreground">{t.name}</h2>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  <span className="rounded bg-secondary px-2 py-0.5 font-medium">{formatCost(t.costLow, t.costHigh)}</span>
                  <span className="rounded bg-secondary px-2 py-0.5">{ACCESSIBILITY_LABEL[t.accessibility]}</span>
                </div>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{t.description}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Helps assess:{" "}
                {mechs.map((m, i) => (
                  <span key={m!.id}>
                    <Link href={`/mechanisms/${m!.id}`} className="underline hover:text-foreground">
                      {m!.name}
                    </Link>
                    {i < mechs.length - 1 ? ", " : ""}
                  </span>
                ))}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
