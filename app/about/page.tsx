import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About & sources",
  description:
    "Why Solve My Long COVID exists, what it can and can't do, how it was built, and the disclaimers that matter.",
};

export default function AboutPage() {
  return (
    <div className="container max-w-3xl py-12 prose-readable">
      <h1 className="text-3xl font-bold tracking-tight">About this project</h1>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Why it exists</h2>
      <p className="mt-2 text-muted-foreground">
        Long COVID is defined broadly — &quot;symptoms lasting months after COVID, not explained by something
        else&quot; — and over 200 symptoms have been reported. Behind that label sit roughly a dozen distinct
        causal mechanisms: organ damage, persistent virus, herpesvirus reactivation, immune and autoimmune
        dysfunction, mitochondrial problems, microclots, autonomic dysfunction, sleep disruption,
        deconditioning, an over-protective nervous system, depression, anxiety, and more. A given person may
        have one, several, or many at once.
      </p>
      <p className="mt-2 text-muted-foreground">
        Most of these have established ways to be tested for — but testing for all of them costs thousands of
        dollars. So the real bottleneck is figuring out <em>which</em> mechanisms are active for a particular
        person, cheaply. That&apos;s what this tool tries to help with.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">An honest word on what it can do</h2>
      <p className="mt-2 text-muted-foreground">
        We reviewed 778 Long COVID clinical-trial extractions (267 randomized trials) alongside the 2024–2026
        literature. The sobering finding: very few treatments have held up in rigorous testing, and several
        widely-promoted ones — including Paxlovid for established Long COVID, CoQ10, several supplements, and
        therapeutic plasma exchange — actually <em>failed</em> their best trials.
      </p>
      <p className="mt-2 text-muted-foreground">
        So this tool does not promise a cure. Its honest, defensible value is to help you and a clinician match
        your situation to the right diagnostic workup, and to steer you away from wasted money and avoidable
        harm. That mirrors what the evidence actually supports.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Two things it takes seriously</h2>
      <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
        <li>
          <strong className="text-foreground">It&apos;s never &quot;all in your head.&quot;</strong> Brain- and
          nervous-system-based contributions are real and treatable, and they coexist with physical causes
          rather than replacing them. Physical and brain-based mechanisms are always shown together, never
          segregated.
        </li>
        <li>
          <strong className="text-foreground">Subtract before you add.</strong> The most common, cheapest wins
          are ruling out look-alike conditions and reviewing the supplements and medications people are already
          taking — a frequent and avoidable source of harm.
        </li>
      </ul>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Privacy</h2>
      <p className="mt-2 text-muted-foreground">
        The wizard runs entirely in your browser. Your answers are saved only in this browser&apos;s local
        storage and are never uploaded. There is no account and no server collecting your health information.
      </p>

      <h2 className="mt-8 text-xl font-semibold text-foreground">Important disclaimer</h2>
      <p className="mt-2 text-muted-foreground">
        This is an educational tool, not medical advice, and it does not diagnose you. Its estimates come from
        hand-authored expert judgment, not a validated clinical algorithm, and can be wrong. Always consult a
        qualified clinician before starting, stopping, or changing any test or treatment. If you have severe or
        rapidly worsening symptoms, seek medical care.
      </p>

      <p className="mt-8 text-sm text-muted-foreground">
        See exactly{" "}
        <Link href="/methodology" className="underline hover:text-foreground">
          how the reasoning works
        </Link>
        , or{" "}
        <Link href="/wizard" className="underline hover:text-foreground">
          start the wizard
        </Link>
        .
      </p>
    </div>
  );
}
