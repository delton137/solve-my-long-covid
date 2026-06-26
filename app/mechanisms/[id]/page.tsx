import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { KB } from "@/lib/kb";
import { EvidenceBadge, HarmBadge, formatCost, ACCESSIBILITY_LABEL } from "@/components/display";
import type { Treatment } from "@/lib/kb/types";

export function generateStaticParams() {
  return KB.mechanisms.map((m) => ({ id: m.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const m = KB.mechanismById.get(id as never);
  if (!m) return { title: "Mechanism not found" };
  return { title: m.name, description: m.shortDescription };
}

const EVIDENCE_RANK: Record<Treatment["evidenceLevel"], number> = {
  strong_rct: 5,
  mixed: 4,
  weak: 3,
  anecdotal: 2,
  rct_negative: 1,
};

export default async function MechanismDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const m = KB.mechanismById.get(id as never);
  if (!m) notFound();

  const tests = m.testIds.map((id) => KB.testById.get(id)).filter(Boolean);
  const treatments = m.treatmentIds
    .map((id) => KB.treatmentById.get(id))
    .filter((t): t is Treatment => !!t)
    .sort((a, b) => EVIDENCE_RANK[b.evidenceLevel] - EVIDENCE_RANK[a.evidenceLevel]);

  return (
    <div className="container max-w-3xl py-10">
      <Link href="/mechanisms" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" aria-hidden /> All mechanisms
      </Link>

      <h1 className="mt-4 text-3xl font-bold tracking-tight">{m.name}</h1>
      <p className="mt-2 text-lg text-muted-foreground">{m.shortDescription}</p>

      <div className="mt-6 prose-readable text-foreground">
        <p className="leading-relaxed text-muted-foreground">{m.detail}</p>
      </div>

      {m.isExclusionDiagnosis && (
        <div className="mt-6 rounded-lg border border-border bg-secondary/40 p-4 text-sm text-muted-foreground">
          This mechanism has <strong>no confirmatory test</strong>. It&apos;s reached by ruling other things
          out, and it coexists with physical causes rather than replacing them.
        </div>
      )}

      {tests.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">How it&apos;s tested</h2>
          <div className="mt-3 space-y-3">
            {tests.map((t) => (
              <div key={t!.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-medium">{t!.name}</h3>
                  <div className="flex gap-2 text-xs text-muted-foreground">
                    <span className="rounded bg-secondary px-2 py-0.5">{formatCost(t!.costLow, t!.costHigh)}</span>
                    <span className="rounded bg-secondary px-2 py-0.5">{ACCESSIBILITY_LABEL[t!.accessibility]}</span>
                  </div>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t!.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {treatments.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold">Treatment options &amp; their evidence</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Graded honestly — including treatments that <em>failed</em> in good trials, which is worth
            knowing.
          </p>
          <div className="mt-3 space-y-3">
            {treatments.map((t) => (
              <div key={t.id} className="rounded-lg border border-border bg-card p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{t.name}</h3>
                  <EvidenceBadge level={t.evidenceLevel} />
                  <HarmBadge severity={t.harmSeverity} />
                  {t.promiseScore !== undefined && (
                    <span className="rounded bg-secondary px-2 py-0.5 text-xs text-muted-foreground">
                      promise {t.promiseScore}
                      {t.nRct !== undefined ? ` · ${t.nRct} RCT${t.nRct === 1 ? "" : "s"}` : ""}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{t.keyFinding}</p>
                {t.cautions && (
                  <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">Caution: {t.cautions}</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-10 border-t border-border pt-6">
        <Link
          href="/wizard"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          See if this applies to you →
        </Link>
      </div>
    </div>
  );
}
