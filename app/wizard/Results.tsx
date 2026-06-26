"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Printer, Stethoscope, FlaskConical, ShieldAlert } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  BandPill,
  BandBar,
  EvidenceBadge,
  HarmBadge,
  formatCost,
  ACCESSIBILITY_LABEL,
} from "@/components/display";
import { KB } from "@/lib/kb";
import { score } from "@/lib/engine/score";
import { recommendTests } from "@/lib/engine/voi";
import { BAND_THRESHOLDS } from "@/lib/kb/strengths";
import type { Answers, Treatment } from "@/lib/kb/types";
import type { MechanismScore } from "@/lib/engine/types";

const EVIDENCE_RANK: Record<Treatment["evidenceLevel"], number> = {
  strong_rct: 5,
  mixed: 4,
  weak: 3,
  anecdotal: 2,
  rct_negative: 1,
};

export function Results({ answers }: { answers: Answers }) {
  const [rankBy, setRankBy] = useState<"per_dollar" | "information">("per_dollar");

  const result = useMemo(() => score(answers), [answers]);
  const voi = useMemo(() => recommendTests(result, answers, { rankBy, limit: 3 }), [result, answers, rankBy]);

  const completeness = result.applicableCount
    ? Math.round((result.answeredCount / result.applicableCount) * 100)
    : 0;

  const relevant = result.scores.filter((s) => s.probability >= BAND_THRESHOLDS.possible);
  const others = result.scores.filter((s) => s.probability < BAND_THRESHOLDS.possible);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Your picture so far</h1>
        <p className="mt-2 text-muted-foreground prose-readable">
          Based on {result.answeredCount} of {result.applicableCount} relevant questions answered. This is
          a starting point for a conversation with a clinician — not a diagnosis.
        </p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 w-48 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${completeness}%` }} />
          </div>
          <span className="text-sm text-muted-foreground">{completeness}% complete</span>
        </div>
      </header>

      {result.pemActive && <PemBanner />}

      <DisclaimerBanner />

      {/* The headline feature: the single most informative next step. */}
      <section aria-labelledby="next-test">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 id="next-test" className="flex items-center gap-2 text-xl font-semibold">
            <FlaskConical className="h-5 w-5 text-primary" aria-hidden />
            Your most informative next step
          </h2>
          <div className="flex items-center gap-1 rounded-lg border border-border p-1 text-xs">
            <button
              onClick={() => setRankBy("per_dollar")}
              className={`rounded px-2 py-1 ${rankBy === "per_dollar" ? "bg-secondary font-medium" : "text-muted-foreground"}`}
            >
              Best value
            </button>
            <button
              onClick={() => setRankBy("information")}
              className={`rounded px-2 py-1 ${rankBy === "information" ? "bg-secondary font-medium" : "text-muted-foreground"}`}
            >
              Most information
            </button>
          </div>
        </div>
        {voi.recommendations.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No single test stands out right now — answer more questions, or discuss the picture below
            with your clinician.
          </p>
        ) : (
          <div className="space-y-3">
            {voi.recommendations.map((rec, i) => (
              <TestCard key={rec.testId} rec={rec} primary={i === 0} />
            ))}
            {voi.cheapest && voi.cheapest.testId !== voi.recommendations[0]?.testId && (
              <p className="text-sm text-muted-foreground">
                Cost-constrained? The cheapest test that still moves the needle is{" "}
                <span className="font-medium text-foreground">{voi.cheapest.name}</span> (
                {formatCost(voi.cheapest.costLow, voi.cheapest.costHigh)}).
              </p>
            )}
          </div>
        )}
      </section>

      {/* Ranked mechanisms */}
      <section aria-labelledby="mechanisms">
        <h2 id="mechanisms" className="mb-3 text-xl font-semibold">
          Which mechanisms look active
        </h2>
        {relevant.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nothing stands out strongly yet. Answer more questions to sharpen the picture.
          </p>
        )}
        <div className="space-y-3">
          {relevant.map((s) => (
            <MechanismCard key={s.mechanismId} s={s} pemActive={result.pemActive} />
          ))}
        </div>

        {others.length > 0 && (
          <details className="mt-4 rounded-lg border border-border bg-secondary/30 p-4">
            <summary className="cursor-pointer text-sm font-medium">
              Considered unlikely or not enough information ({others.length})
            </summary>
            <ul className="mt-3 space-y-2">
              {others.map((s) => (
                <li key={s.mechanismId} className="flex items-center justify-between gap-3 text-sm">
                  <Link href={`/mechanisms/${s.mechanismId}`} className="hover:underline">
                    {s.name}
                  </Link>
                  <BandPill band={s.band} insufficient={!s.hasEvidence} />
                </li>
              ))}
            </ul>
          </details>
        )}
      </section>

      <div className="flex flex-wrap gap-3 border-t border-border pt-6">
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" aria-hidden /> Print / save as PDF for your doctor
        </Button>
      </div>
    </div>
  );
}

function PemBanner() {
  return (
    <div className="rounded-xl border-2 border-destructive/50 bg-destructive/5 p-5" role="alert">
      <div className="flex gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <div>
          <p className="font-semibold text-foreground">
            You reported post-exertional malaise (a delayed crash after exertion).
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            This is important for safety. When PEM is present, graded or push-through exercise can cause
            lasting harm. The recommended approach is <strong>pacing</strong> — staying within an energy
            envelope — not increasing activity. Any exercise-based treatment below is shown with this
            warning, and you should discuss an activity plan with a clinician familiar with PEM/ME-CFS.
          </p>
        </div>
      </div>
    </div>
  );
}

function DisclaimerBanner() {
  return (
    <div className="flex gap-3 rounded-lg border border-border bg-accent/40 p-4 text-sm">
      <Stethoscope className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
      <p className="text-muted-foreground">
        These estimates come from hand-authored expert judgment, not a validated diagnostic test. Use them
        to ask better questions — take this to a clinician before starting, stopping, or changing any
        treatment.{" "}
        <Link href="/methodology" className="underline hover:text-foreground">
          How this is calculated.
        </Link>
      </p>
    </div>
  );
}

function TestCard({ rec, primary }: { rec: ReturnType<typeof recommendTests>["recommendations"][number]; primary: boolean }) {
  return (
    <div className={`rounded-xl border p-5 ${primary ? "border-primary bg-accent/30" : "border-border bg-card"}`}>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h3 className="font-semibold text-foreground">{rec.name}</h3>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded bg-secondary px-2 py-0.5">{formatCost(rec.costLow, rec.costHigh)}</span>
          <span className="rounded bg-secondary px-2 py-0.5">{ACCESSIBILITY_LABEL[rec.accessibility]}</span>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{rec.description}</p>
      <p className="mt-2 text-sm">{rec.rationale}</p>
    </div>
  );
}

function MechanismCard({ s, pemActive }: { s: MechanismScore; pemActive: boolean }) {
  const mech = KB.mechanismById.get(s.mechanismId)!;
  const treatments = mech.treatmentIds
    .map((id) => KB.treatmentById.get(id))
    .filter((t): t is Treatment => !!t)
    .sort((a, b) => EVIDENCE_RANK[b.evidenceLevel] - EVIDENCE_RANK[a.evidenceLevel]);

  const userContribs = s.contributions.filter((c) => !c.isPrior);

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <Link href={`/mechanisms/${s.mechanismId}`} className="font-semibold text-foreground hover:underline">
            {s.name}
          </Link>
          <p className="mt-0.5 text-sm text-muted-foreground">{mech.shortDescription}</p>
        </div>
        <BandPill band={s.band} probability={s.probability} showPercent insufficient={!s.hasEvidence} />
      </div>

      <div className="mt-3">
        <BandBar band={s.band} probability={s.probability} />
      </div>

      <Accordion type="single" collapsible className="mt-3">
        <AccordionItem value="why" className="border-b-0">
          <AccordionTrigger className="py-2 text-sm">Why this scored {Math.round(s.probability * 100)}%</AccordionTrigger>
          <AccordionContent>
            {s.isExclusionDiagnosis && (
              <p className="mb-2 rounded bg-secondary/60 p-2 text-xs text-muted-foreground">
                This one has no confirmatory test — it&apos;s reached by ruling other things out, and it
                coexists with physical causes rather than replacing them. It is never &quot;all in your head.&quot;
              </p>
            )}
            <ul className="space-y-1.5">
              {userContribs.length === 0 && (
                <li className="text-sm text-muted-foreground">
                  No specific evidence yet — this reflects only the base rate.
                </li>
              )}
              {userContribs.map((c, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className={`mt-1 inline-block h-2 w-2 shrink-0 rounded-full ${c.delta > 0 ? "bg-band-likely" : "bg-band-unlikely"}`} />
                  <span>
                    <span className="text-muted-foreground">{c.detail}</span>
                    {c.factorType && (
                      <span className="ml-1 rounded bg-secondary px-1.5 py-0.5 text-xs text-muted-foreground">
                        {c.factorType}
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {treatments.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Treatment options &amp; their evidence
          </p>
          <ul className="space-y-2">
            {treatments.map((t) => {
              const exerciseRisk = pemActive && /pacing|exercise|rehab/i.test(t.id + t.name) && t.id !== "structured_pacing";
              return (
                <li key={t.id} className="text-sm">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{t.name}</span>
                    <EvidenceBadge level={t.evidenceLevel} />
                    <HarmBadge severity={t.harmSeverity} />
                  </div>
                  <p className="mt-0.5 text-muted-foreground">{t.keyFinding}</p>
                  {t.cautions && (
                    <p className="mt-0.5 text-xs text-amber-700 dark:text-amber-400">Caution: {t.cautions}</p>
                  )}
                  {exerciseRisk && (
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-destructive">
                      <ShieldAlert className="h-3.5 w-3.5" aria-hidden /> You reported PEM — avoid graded
                      exercise; pace instead.
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
