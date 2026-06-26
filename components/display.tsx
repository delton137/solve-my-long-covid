import { cn } from "@/lib/utils";
import { BAND_LABELS, type Band } from "@/lib/kb/strengths";
import type { EvidenceLevel } from "@/lib/kb/types";
import type { DiagnosticTest } from "@/lib/kb/types";

// ── Likelihood bands ─────────────────────────────────────────────────────

const BAND_CLASSES: Record<Band, string> = {
  unlikely: "bg-band-unlikely/15 text-band-unlikely border-band-unlikely/30",
  possible: "bg-band-possible/15 text-band-possible border-band-possible/40",
  likely: "bg-band-likely/15 text-band-likely border-band-likely/40",
  very_likely: "bg-band-very-likely/15 text-band-very-likely border-band-very-likely/40",
};

export function BandPill({
  band,
  probability,
  showPercent = false,
  insufficient = false,
}: {
  band: Band;
  probability?: number;
  showPercent?: boolean;
  insufficient?: boolean;
}) {
  if (insufficient) {
    return (
      <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
        Not enough info yet
      </span>
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        BAND_CLASSES[band],
      )}
    >
      {BAND_LABELS[band]}
      {showPercent && probability !== undefined ? ` · ${Math.round(probability * 100)}%` : ""}
    </span>
  );
}

/** A thin horizontal probability bar, colored by band. */
export function BandBar({ band, probability }: { band: Band; probability: number }) {
  const fill: Record<Band, string> = {
    unlikely: "bg-band-unlikely",
    possible: "bg-band-possible",
    likely: "bg-band-likely",
    very_likely: "bg-band-very-likely",
  };
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-secondary"
      role="meter"
      aria-valuenow={Math.round(probability * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${BAND_LABELS[band]} (${Math.round(probability * 100)}%)`}
    >
      <div className={cn("h-full rounded-full transition-all", fill[band])} style={{ width: `${Math.round(probability * 100)}%` }} />
    </div>
  );
}

// ── Evidence level ───────────────────────────────────────────────────────

const EVIDENCE_META: Record<EvidenceLevel, { label: string; className: string }> = {
  strong_rct: { label: "Strong evidence", className: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30" },
  mixed: { label: "Mixed evidence", className: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/30" },
  weak: { label: "Weak evidence", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30" },
  anecdotal: { label: "Anecdotal only", className: "bg-zinc-500/15 text-zinc-600 dark:text-zinc-400 border-zinc-500/30" },
  rct_negative: { label: "Failed in trials", className: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/40" },
};

export function EvidenceBadge({ level }: { level: EvidenceLevel }) {
  const m = EVIDENCE_META[level];
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", m.className)}>
      {m.label}
    </span>
  );
}

// ── Harm severity ────────────────────────────────────────────────────────

export function HarmBadge({ severity }: { severity: "none" | "low" | "moderate" | "high" }) {
  if (severity === "none" || severity === "low") return null;
  const meta =
    severity === "high"
      ? { label: "Serious harm risk", className: "bg-destructive/15 text-destructive border-destructive/40" }
      : { label: "Caution", className: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/40" };
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold", meta.className)}>
      {meta.label}
    </span>
  );
}

// ── Cost / accessibility ─────────────────────────────────────────────────

export function formatCost(low: number, high: number): string {
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  if (low === 0 && high === 0) return "Free";
  if (low === 0) return `Up to ${fmt(high)}`;
  if (low === high) return fmt(low);
  return `${fmt(low)}–${fmt(high)}`;
}

export const ACCESSIBILITY_LABEL: Record<DiagnosticTest["accessibility"], string> = {
  home: "At home",
  gp_orderable: "Your GP can order",
  specialist: "Specialist referral",
  research_only: "Mostly research-only",
};
