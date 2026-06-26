import Link from "next/link";
import { ArrowRight, Search, ShieldAlert, Layers } from "lucide-react";

export default function HomePage() {
  return (
    <div className="container py-12 md:py-16">
      <section className="prose-readable">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Educational tool · not medical advice
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Long COVID isn&apos;t one disease. Figure out which mechanisms are driving{" "}
          <span className="text-primary">your</span> symptoms.
        </h1>
        <p className="mt-5 text-lg text-muted-foreground">
          Researchers have identified roughly a dozen distinct ways COVID can leave you unwell —
          from microclots and autonomic dysfunction to persistent virus, mitochondrial damage,
          sleep disruption, and an over-protective nervous system. Any given person may have one,
          several, or many at once. The hard part is working out which ones are yours — and testing
          for everything costs thousands of dollars.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/wizard"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
          >
            Start the wizard
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
          <Link
            href="/mechanisms"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-5 py-3 font-medium text-foreground transition-colors hover:bg-secondary"
          >
            Browse the mechanisms
          </Link>
        </div>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          {
            icon: Layers,
            title: "Reason across mechanisms",
            body: "Answer questions about your history, symptoms, time course, and any test results. The tool estimates which mechanisms are likely active — and shows you exactly why each one scored the way it did.",
          },
          {
            icon: Search,
            title: "Find the most informative test",
            body: "When the picture is unclear, it recommends the single test that would buy the most clarity per dollar — instead of an open-ended list of expensive workups.",
          },
          {
            icon: ShieldAlert,
            title: "Subtract before you add",
            body: "Many “Long COVID” cases are something else, or are worsened by well-meaning supplements. The tool flags cheap, high-yield checks and steers you away from common harms.",
          },
        ].map(({ icon: Icon, title, body }) => (
          <div key={title} className="rounded-xl border border-border bg-card p-6">
            <Icon className="h-6 w-6 text-primary" aria-hidden />
            <h2 className="mt-4 text-lg font-semibold text-foreground">{title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          </div>
        ))}
      </section>

      <section className="mt-16 rounded-xl border border-border bg-secondary/40 p-6 prose-readable">
        <h2 className="text-xl font-semibold text-foreground">An honest word on what this can do</h2>
        <p className="mt-3 text-muted-foreground">
          Across hundreds of clinical trials, very few Long COVID treatments have held up in
          rigorous testing — and several widely-promoted ones have <em>failed</em> their best
          trials. So this tool doesn&apos;t promise a cure. Its honest value is to help you and your
          clinician match your situation to the right diagnostic workup, and to avoid wasting money
          and risking harm. That mirrors what the research actually supports.
        </p>
        <p className="mt-3 text-sm text-muted-foreground">
          It is not a diagnosis, and its estimates come from expert judgment rather than a validated
          algorithm.{" "}
          <Link href="/methodology" className="underline hover:text-foreground">
            See how it works and where it can be wrong.
          </Link>
        </p>
      </section>
    </div>
  );
}
