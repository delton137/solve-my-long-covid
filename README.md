# Solve My Long COVID

An educational decision-support **wizard** (explicitly *not* medical advice) that helps a person reason
about which of the ~16 causal mechanisms of Long COVID may be active for them — and, when the picture is
unclear, recommends the single most informative next test (weighted by cost).

> Long COVID isn't one disease. It's a label for symptoms that can be produced by roughly a dozen distinct
> mechanisms, and any given person may have one, several, or many at once. Testing for everything costs
> thousands of dollars, so the real bottleneck is figuring out *which* mechanisms are active. This tool
> helps with that — and, honestly, with avoiding harm — rather than promising a cure.

## Stack

- **Next.js 15** (App Router). Pages are statically prerendered (SSG); no user-specific server runtime.
- TypeScript · Tailwind · Radix UI · zod · Vitest.
- **Privacy by design:** the knowledge base and inference engine are pure functions bundled to the client.
  No user health data leaves the browser; the wizard persists a versioned blob to `localStorage` only.
- Deploy target: **Vercel** (Next.js framework preset).

## Commands

```bash
npm install
npm run dev          # local dev server
npm run build        # production build → ./.next
npm run test         # Vitest (engine + VOI unit tests)
npm run typecheck    # tsc --noEmit
npm run lint         # next lint
npm run validate:kb  # validate the knowledge base (zod + referential integrity)
```

> **Dropbox note:** the repo lives in a Dropbox-synced folder. Dropbox racing the `.next` build dir
> caused `Cannot find module './102.js'`-style corruption. `scripts/ensure-build-dir.mjs` (run
> automatically via `predev`/`prebuild`) marks `.next`/`out`/`node_modules` as Dropbox-ignored
> (`com.dropbox.ignored` xattr) so they're never synced — while staying in the repo so module
> resolution works. macOS-only, no-op in CI. If you still see chunk errors, fully quit Dropbox, run
> `rm -rf .next`, and rebuild.

## How it works

The inference engine is a **transparent weighted log-odds model** (no ML, no black box):

```
logit(mechanism) = base rate
                 + Σ(weights from answers)        # lib/kb/questions.ts
                 + Σ(causal-web propagation)      # lib/kb/influences.ts  (one bounded pass)
                 + Σ(exclusion-diagnosis boost)   # false_fatigue_alarms rises as organics are ruled out
probability      = sigmoid(logit)
```

Every score returns an **evidence ledger** (the list of contributions), so the "why this scored" UI is
free. The **value-of-information** recommender (`lib/engine/voi.ts`) simulates each not-yet-done test's two
outcomes and ranks by `uncertainty · swing · actionability / cost`. A **PEM hard-branch** overrides scoring
to suppress graded-exercise recommendations when post-exertional malaise is reported.

Full, user-facing explanation lives at `/methodology`.

## Project layout

```
app/                     # routes (landing, wizard, mechanisms, tests, methodology, about)
  wizard/                # client wizard: WizardClient, QuestionField, Results
lib/
  kb/                    # the knowledge base — hand-authored, zod-validated
    strengths.ts         # the single strength→log-odds calibration table + bands
    mechanisms.ts        # the 16 mechanisms (priors, actionability, detail)
    questions.ts         # inputs + evidence links to mechanisms
    tests.ts             # diagnostic-test catalog (cost, accessibility, effects)
    treatments.ts        # treatments graded honestly (incl. `rct_negative`) + harm flags
    influences.ts        # causal-web edges
    index.ts             # validates everything + exports typed KB
  engine/
    score.ts             # log-odds scoring + propagation + ledger
    voi.ts               # "most informative next test" recommender
components/ui/           # Radix + CVA primitives
scripts/validate-kb.ts   # CI KB validation
```

## Editing the knowledge base

All clinical content is in `lib/kb/*` as typed TS, validated by zod at load. Authors choose **coarse
strength labels** (`strong_for`, `excludes`, …) rather than raw numbers; the mapping lives in one place
(`strengths.ts`). A malformed edit fails `npm run validate:kb`, the tests, and the build.

The content is hand-curated from six evidence-graded research briefs (a review of 778 Long COVID
clinical-trial extractions plus 2024–2026 literature).

## ⚠️ Disclaimer

Educational tool, **not medical advice**. It does not diagnose. Its estimates are hand-authored expert
judgment, not a validated clinical algorithm, and can be wrong. A clinician review of the knowledge-base
weights and a legal review of the framing are recommended **before any public launch**.
# solve-my-long-covid
