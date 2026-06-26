import type { Metadata } from "next";
import Link from "next/link";
import { STRENGTH_TO_LOGIT, BAND_THRESHOLDS, BAND_LABELS, sigmoid } from "@/lib/kb/strengths";
import { KB } from "@/lib/kb";

export const metadata: Metadata = {
  title: "How it works (and where it can be wrong)",
  description:
    "The reasoning engine behind Solve My Long COVID, in full: a transparent weighted log-odds model, the value-of-information test recommender, every strength weight, and its limitations.",
};

function probFromStrength(logit: number) {
  // probability shift from a neutral 50% starting point, for intuition
  return Math.round(sigmoid(logit) * 100);
}

export default function MethodologyPage() {
  return (
    <div className="container max-w-3xl py-12 prose-readable">
      <h1 className="text-3xl font-bold tracking-tight">How it works — and where it can be wrong</h1>
      <p className="mt-3 text-lg text-muted-foreground">
        This tool is deliberately transparent. There is no machine learning and no black box — every score
        is a sum of hand-authored weights you can inspect right here.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">The model: adding up evidence</h2>
      <p className="mt-2 text-muted-foreground">
        Each mechanism starts at a base rate and accumulates <strong>log-odds</strong> from your answers:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-secondary/60 p-4 text-sm">
{`logit(mechanism) = base rate
                 + Σ (weights from your answers)
                 + Σ (causal-web propagation)
                 + Σ (exclusion-diagnosis boost)

probability = sigmoid(logit)`}
      </pre>
      <p className="mt-2 text-muted-foreground">
        Because evidence simply adds up, a mechanism&apos;s score is exactly the list of things that pushed it
        up or down — which is why every result comes with a &quot;why this scored&quot; breakdown.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">The strength scale</h2>
      <p className="mt-2 text-muted-foreground">
        Authors never pick raw numbers — they choose a coarse strength, which maps to log-odds in one place.
        Here is that entire table (and what each does to a 50/50 starting point):
      </p>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="py-2 pr-4 font-medium">Strength</th>
              <th className="py-2 pr-4 font-medium">Log-odds</th>
              <th className="py-2 font-medium">From 50% →</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(STRENGTH_TO_LOGIT).map(([k, v]) => (
              <tr key={k} className="border-b border-border/60">
                <td className="py-2 pr-4">{k.replace(/_/g, " ")}</td>
                <td className="py-2 pr-4 tabular-nums">{v > 0 ? `+${v}` : v}</td>
                <td className="py-2 tabular-nums text-muted-foreground">{probFromStrength(v)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mt-10 text-xl font-semibold text-foreground">Probability bands</h2>
      <p className="mt-2 text-muted-foreground">
        We show bands rather than false-precision percentages by default:
      </p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
        {(["unlikely", "possible", "likely", "very_likely"] as const).map((b) => (
          <li key={b}>
            <strong className="text-foreground">{BAND_LABELS[b]}</strong> — {Math.round(BAND_THRESHOLDS[b] * 100)}% and up
          </li>
        ))}
      </ul>
      <p className="mt-2 text-muted-foreground">
        A mechanism with no relevant answers is shown as <em>&quot;not enough info yet&quot;</em> rather than
        &quot;unlikely&quot; — absence of evidence isn&apos;t evidence of absence.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">The causal web</h2>
      <p className="mt-2 text-muted-foreground">
        Mechanisms influence each other. After the independent scores are computed, we run one bounded pass:
        if a mechanism is likely (&gt;60%), it nudges the mechanisms it&apos;s known to drive. The pass reads the
        pre-propagation scores, so it can&apos;t run away even when two mechanisms point at each other. There are{" "}
        {KB.influences.length} such links — for example, sustained stress nudging sleep disruption, or
        autonomic dysfunction nudging deconditioning.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">The &quot;most informative test&quot; calculation</h2>
      <p className="mt-2 text-muted-foreground">
        For each test you haven&apos;t done, we simulate both outcomes against your current scores and estimate
        how much it would move your beliefs, weighted by how useful resolving that mechanism is, and divided
        by cost:
      </p>
      <pre className="mt-3 overflow-x-auto rounded-lg bg-secondary/60 p-4 text-sm">
{`uncertainty = 4 · P · (1 − P)          (peaks at 50/50)
swing       = expected change in P if you took the test
value       = Σ  uncertainty · swing · actionability
score       = value / cost`}
      </pre>
      <p className="mt-2 text-muted-foreground">
        This is why cheap, high-yield checks — ruling out look-alike conditions, reviewing your supplements,
        a standing-heart-rate test — tend to come first. You can toggle between &quot;best value&quot; and &quot;most
        information&quot; on the results page.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">The post-exertional-malaise safety rule</h2>
      <p className="mt-2 text-muted-foreground">
        One rule overrides the scoring entirely. If you report post-exertional malaise — a delayed crash after
        exertion — the tool will not recommend graded or push-through exercise, because that can cause lasting
        harm. This reflects strong evidence and guideline changes, and it&apos;s the single most important safety
        behavior here.
      </p>

      <h2 className="mt-10 text-xl font-semibold text-foreground">Where this can be wrong</h2>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
        <li>
          <strong className="text-foreground">The weights are expert judgment, not fitted to data.</strong>{" "}
          There is no validated ground truth for Long COVID mechanisms, so these numbers are considered
          estimates and will be revised.
        </li>
        <li>
          It can only reason about what you tell it, and self-reported symptoms are imperfect.
        </li>
        <li>
          It is not a diagnosis and cannot replace a clinician&apos;s judgment, examination, or the tests
          themselves.
        </li>
        <li>
          The treatment evidence is summarized from the literature as of early 2026 and will go out of date.
        </li>
      </ul>

      <div className="mt-10 rounded-lg border border-border bg-secondary/40 p-5">
        <p className="text-sm text-muted-foreground">
          Built on a review of 778 Long COVID clinical-trial extractions plus 2024–2026 literature.{" "}
          <Link href="/about" className="underline hover:text-foreground">
            More about the sources and the project.
          </Link>
        </p>
      </div>
    </div>
  );
}
