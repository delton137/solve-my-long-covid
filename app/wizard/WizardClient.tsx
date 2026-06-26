"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, RotateCcw, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { BandPill } from "@/components/display";
import { QuestionField } from "./QuestionField";
import { Results } from "./Results";
import { KB } from "@/lib/kb";
import { score } from "@/lib/engine/score";
import { isQuestionApplicable } from "@/lib/engine/score";
import { BAND_THRESHOLDS } from "@/lib/kb/strengths";
import type { Answers, AnswerValue, Section } from "@/lib/kb/types";
import {
  STEPS,
  SECTION_META,
  emptyBlob,
  loadBlob,
  saveBlob,
  clearBlob,
  type AssessmentBlob,
} from "@/lib/wizard/state";

export function WizardClient() {
  const [blob, setBlob] = useState<AssessmentBlob>(emptyBlob);
  const [stepIndex, setStepIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);

  // Load saved progress after mount (static export → no SSR access to localStorage).
  useEffect(() => {
    const loaded = loadBlob();
    setBlob(loaded);
    if (loaded.consented) setStepIndex(1);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveBlob(blob);
  }, [blob, hydrated]);

  const step = STEPS[stepIndex];

  const setAnswer = (id: string, value: AnswerValue | undefined) =>
    setBlob((b) => {
      const answers: Answers = { ...b.answers };
      if (value === undefined) delete answers[id];
      else answers[id] = value;
      return { ...b, answers };
    });

  const goNext = () => setStepIndex((i) => Math.min(STEPS.length - 1, i + 1));
  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const reset = () => {
    clearBlob();
    setBlob(emptyBlob());
    setStepIndex(0);
  };

  if (!hydrated) {
    return <div className="container py-16 text-muted-foreground">Loading…</div>;
  }

  // ── Consent gate ───────────────────────────────────────────────────────
  if (step === "consent") {
    return (
      <div className="container max-w-2xl py-12">
        <ConsentGate
          consented={blob.consented}
          onConsentChange={(c) => setBlob((b) => ({ ...b, consented: c }))}
          onStart={() => {
            setBlob((b) => ({ ...b, consented: true }));
            goNext();
          }}
        />
      </div>
    );
  }

  // ── Results ────────────────────────────────────────────────────────────
  if (step === "results") {
    return (
      <div className="container max-w-3xl py-10">
        <StepProgress index={stepIndex} />
        <Results answers={blob.answers} />
        <div className="mt-8 flex flex-wrap gap-3">
          <Button variant="outline" onClick={goBack}>
            <ArrowLeft className="h-4 w-4" aria-hidden /> Back to questions
          </Button>
          <Button variant="ghost" onClick={reset}>
            <RotateCcw className="h-4 w-4" aria-hidden /> Start over
          </Button>
        </div>
      </div>
    );
  }

  // ── A section of questions ─────────────────────────────────────────────
  const section = step as Section;
  const meta = SECTION_META[section];
  const sectionQuestions = KB.questions.filter(
    (q) => q.section === section && isQuestionApplicable(q, blob.answers),
  );

  return (
    <div className="container py-10">
      <StepProgress index={stepIndex} />
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{meta.title}</h1>
          <p className="mt-2 text-muted-foreground prose-readable">{meta.description}</p>

          <div className="mt-6 space-y-4">
            {sectionQuestions.map((q) => (
              <QuestionField
                key={q.id}
                question={q}
                value={blob.answers[q.id]}
                onChange={(v) => setAnswer(q.id, v)}
              />
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={goBack}>
              <ArrowLeft className="h-4 w-4" aria-hidden /> Back
            </Button>
            <Button onClick={goNext}>
              {STEPS[stepIndex + 1] === "results" ? "See your results" : "Next"}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Button>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Every question is optional — skip anything that doesn&apos;t apply. Your answers stay on this
            device.
          </p>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-20">
            <LivePanel answers={blob.answers} />
          </div>
        </aside>
      </div>
    </div>
  );
}

function StepProgress({ index }: { index: number }) {
  // Steps 1..(n-1) are question sections; show progress across them.
  const sectionSteps = STEPS.length - 2; // exclude consent & results
  const current = Math.min(index, sectionSteps);
  const pct = (current / sectionSteps) * 100;
  return (
    <div className="mb-8">
      <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Step {Math.min(index, sectionSteps)} of {sectionSteps}
        </span>
        <Link href="/" className="hover:text-foreground">
          Exit
        </Link>
      </div>
      <Progress value={pct} />
    </div>
  );
}

function LivePanel({ answers }: { answers: Answers }) {
  const result = useMemo(() => score(answers), [answers]);
  const top = result.scores.filter((s) => s.hasEvidence && s.probability >= BAND_THRESHOLDS.possible).slice(0, 6);
  const completeness = result.applicableCount
    ? Math.round((result.answeredCount / result.applicableCount) * 100)
    : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold">Your picture so far</h2>
      <p className="mt-1 text-xs text-muted-foreground">{completeness}% of relevant questions answered</p>
      {top.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">
          Answer a few questions and likely mechanisms will appear here.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {top.map((s) => (
            <li key={s.mechanismId} className="flex items-center justify-between gap-2 text-sm">
              <span className="truncate">{s.name}</span>
              <BandPill band={s.band} />
            </li>
          ))}
        </ul>
      )}
      {result.pemActive && (
        <p className="mt-3 rounded bg-destructive/10 p-2 text-xs text-destructive">
          PEM reported — exercise advice will be flagged for safety.
        </p>
      )}
    </div>
  );
}

function ConsentGate({
  consented,
  onConsentChange,
  onStart,
}: {
  consented: boolean;
  onConsentChange: (c: boolean) => void;
  onStart: () => void;
}) {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Before you start</h1>
      <div className="mt-6 space-y-4 text-muted-foreground prose-readable">
        <p>
          This tool asks about your history, symptoms, time course, any test results, and medications. It
          then estimates which Long COVID mechanisms might be active for you and suggests the most useful
          next test.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-foreground">It is not medical advice and does not diagnose you.</strong>{" "}
            Its estimates are expert judgment, not a validated algorithm, and can be wrong.
          </li>
          <li>
            <strong className="text-foreground">Your answers never leave your device.</strong> Everything
            runs in your browser and is saved only in this browser&apos;s local storage. No account, no
            server.
          </li>
          <li>
            Use the results to have a better conversation with a clinician — not to start, stop, or change
            any treatment on your own.
          </li>
        </ul>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-lg border border-border p-4">
        <Checkbox checked={consented} onCheckedChange={(c) => onConsentChange(!!c)} className="mt-0.5" />
        <span className="text-sm">
          I understand this is an educational tool, not medical advice, and that I should consult a
          clinician before acting on it.
        </span>
      </label>

      <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3.5 w-3.5" aria-hidden /> Private by design — nothing is uploaded.
      </div>

      <Button className="mt-4" size="lg" disabled={!consented} onClick={onStart}>
        Start <ArrowRight className="h-4 w-4" aria-hidden />
      </Button>
    </div>
  );
}
