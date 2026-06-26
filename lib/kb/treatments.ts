import type { TreatmentInput } from "./types";

/**
 * Treatment knowledge base, hand-authored from six evidence-graded research briefs (778-trial
 * dataset + 2024–2026 literature). `evidenceLevel` is honest: `rct_negative` means a treatment
 * was tested in good trial(s) and FAILED — surfaced so the tool counters demand for failed
 * therapies rather than hiding it. `harmSeverity` drives prominent warnings regardless of how
 * likely the target mechanism is.
 */
export const treatments: TreatmentInput[] = [
  // ── Meta / highest-value ─────────────────────────────────────────────
  {
    id: "treat_underlying",
    name: "Treat the underlying condition",
    mechanismIds: ["mistaken_attribution", "sleep_circadian"],
    modality: "procedure",
    evidenceLevel: "strong_rct",
    keyFinding:
      "When a separate condition (thyroid, iron deficiency, sleep apnea, B12, diabetes, depression) is found, treating it directly is well-established and can resolve the symptoms entirely.",
    harmSeverity: "none",
    sources: ["https://www.nature.com/articles/s41598-024-55526-3"],
  },
  {
    id: "deprescribe",
    name: "Deprescribe / stop the offending agent",
    mechanismIds: ["iatrogenic"],
    modality: "procedure",
    evidenceLevel: "strong_rct",
    keyFinding:
      "Stopping harmful or unproven supplements/medications and reconciling interactions removes a cause of symptoms. 'Subtract before you add.'",
    harmSeverity: "none",
    cautions:
      "Some medications must be tapered, not stopped abruptly — do this with a clinician.",
    sources: ["https://www.sciencedirect.com/science/article/pii/S2590170223000316"],
  },

  // ── Autonomic / POTS ─────────────────────────────────────────────────
  {
    id: "salt_fluids",
    name: "Salt and fluid loading",
    mechanismIds: ["autonomic_pots"],
    modality: "lifestyle",
    evidenceLevel: "weak",
    keyFinding:
      "Mechanistically sound first-line for POTS (patients are often hypovolemic); supported by guidelines and physiology rather than high-quality trials.",
    harmSeverity: "low",
    cautions: "Avoid with hypertension, or kidney/heart disease.",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC11775448/"],
  },
  {
    id: "compression",
    name: "Compression garments (abdominal + leg)",
    mechanismIds: ["autonomic_pots"],
    modality: "device",
    evidenceLevel: "mixed",
    keyFinding:
      "Randomized crossover data show full abdominal+leg compression meaningfully lowers standing heart rate; abdominal compression beats calf-only.",
    harmSeverity: "none",
    sources: ["https://www.ahajournals.org/doi/10.1161/JAHA.120.017610"],
  },
  {
    id: "beta_blocker",
    name: "Beta-blockers (low-dose)",
    mechanismIds: ["autonomic_pots"],
    modality: "drug",
    evidenceLevel: "weak",
    keyFinding:
      "Low-dose propranolol reduces standing heart rate and symptoms in POTS reviews (~64% response), but no dedicated Long COVID RCT.",
    harmSeverity: "moderate",
    cautions:
      "Can worsen fatigue and exercise intolerance, and is poorly tolerated if hypotensive or fatigued — use low doses.",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC11775448/"],
  },
  {
    id: "ivabradine",
    name: "Ivabradine",
    mechanismIds: ["autonomic_pots"],
    modality: "drug",
    evidenceLevel: "rct_negative",
    keyFinding:
      "RECOVER-AUTONOMIC (n=181) found ivabradine significantly lowered heart rate but did NOT improve POTS symptoms or quality of life — it fixes the number, not the suffering.",
    harmSeverity: "moderate",
    cautions: "Visual phosphenes; avoid in significant bradyarrhythmia; not in pregnancy.",
    promiseScore: 0,
    nRct: 2,
    sources: ["https://recovercovid.org/news/recover-autonomic-clinical-trial-results-shared-2026-acc-conference"],
  },
  {
    id: "midodrine",
    name: "Midodrine",
    mechanismIds: ["autonomic_pots"],
    modality: "drug",
    evidenceLevel: "weak",
    keyFinding:
      "Highest symptomatic response of the POTS orals in reviews (~78%), but evidence is short-term and physiologic, with no Long COVID-specific RCT.",
    harmSeverity: "moderate",
    cautions: "Supine hypertension — don't dose before lying down; urinary retention, scalp tingling.",
    sources: ["https://www.frontiersin.org/journals/neurology/articles/10.3389/fneur.2024.1515486/full"],
  },
  {
    id: "ivig_autonomic",
    name: "IVIG (intravenous immunoglobulin)",
    mechanismIds: ["autonomic_pots", "immune_dysfunction"],
    modality: "procedure",
    evidenceLevel: "mixed",
    keyFinding:
      "Open-label/case-series benefit in confirmed autoimmune small-fiber neuropathy, but a randomized trial for idiopathic small-fiber pain was negative — reserve for objectively confirmed autoimmune cases.",
    harmSeverity: "high",
    cautions:
      "Thromboembolism, aseptic meningitis, renal injury, anaphylaxis; very expensive and supply-limited.",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC11087046/", "https://www.neurology.org/doi/10.1212/WNL.0000000000011919"],
  },

  // ── Sleep ────────────────────────────────────────────────────────────
  {
    id: "cbti",
    name: "CBT-I (CBT for insomnia)",
    mechanismIds: ["sleep_circadian"],
    modality: "behavioral",
    evidenceLevel: "strong_rct",
    keyFinding:
      "First-line, guideline-recommended for chronic insomnia generally, with durable effects; no completed Long COVID-specific RCT yet but the best-evidenced sleep option here.",
    harmSeverity: "low",
    cautions:
      "The sleep-restriction component can transiently worsen daytime fatigue — pace carefully if PEM is present.",
    sources: ["https://mental.jmir.org/2025/1/e84323"],
  },
  {
    id: "melatonin",
    name: "Melatonin",
    mechanismIds: ["sleep_circadian"],
    modality: "supplement",
    evidenceLevel: "weak",
    keyFinding:
      "Low-risk chronobiotic/hypnotic; no completed Long COVID insomnia RCT (RECOVER-SLEEP pending). Low-dose timed use differs from high-dose hypnotic use.",
    harmSeverity: "low",
    cautions: "Daytime grogginess; OTC dose/content varies widely.",
    sources: ["https://www.nih.gov/news-events/news-releases/nih-open-long-covid-clinical-trials-study-sleep-disturbances-exercise-intolerance-post-exertional-malaise"],
  },
  {
    id: "light_therapy",
    name: "Bright-light therapy",
    mechanismIds: ["sleep_circadian"],
    modality: "device",
    evidenceLevel: "weak",
    keyFinding:
      "Plausible low-risk circadian intervention; the only Long COVID data is a small uncontrolled pre-post study. RECOVER-SLEEP is testing it controlled.",
    harmSeverity: "low",
    cautions: "Mistimed exposure can worsen circadian misalignment; mania risk in bipolar.",
    sources: ["https://www.uhhospitals.org/for-clinicians/articles-and-news/articles/2025/03/recover-sleep-trial-investigates-lingering-effects-of-long-covid"],
  },
  {
    id: "modafinil",
    name: "Modafinil / wakefulness agents",
    mechanismIds: ["sleep_circadian"],
    modality: "drug",
    evidenceLevel: "anecdotal",
    keyFinding:
      "Investigational for Long COVID (RECOVER-SLEEP hypersomnia arm). For genuine excessive daytime sleepiness, not generic fatigue.",
    harmSeverity: "moderate",
    cautions:
      "Can MASK exertional limits and precipitate post-exertional crashes in PEM patients. Headache, anxiety, reduces hormonal-contraceptive efficacy.",
    sources: ["https://www.healthrising.org/blog/2025/09/27/solriamfetol-sunosi-chronic-fatigue-syndrome-me-cfs/"],
  },

  // ── Deconditioning / exertional ──────────────────────────────────────
  {
    id: "structured_pacing",
    name: "Structured pacing (energy-envelope management)",
    mechanismIds: ["deconditioning", "false_fatigue_alarms"],
    modality: "behavioral",
    evidenceLevel: "weak",
    keyFinding:
      "The only approach recommended when post-exertional malaise is present: manage activity within an energy envelope to avoid triggering crashes. The large RECOVER-ENERGIZE pacing RCT is due to report.",
    harmSeverity: "none",
    sources: ["https://clinicaltrials.gov/study/NCT06404073"],
  },
  {
    id: "resistance_exercise",
    name: "Resistance / strength training",
    mechanismIds: ["deconditioning"],
    modality: "behavioral",
    evidenceLevel: "mixed",
    keyFinding:
      "A 3-month personalized resistance program improved walk distance and grip strength (JAMA Netw Open 2025) — but did NOT improve fatigue, and the population was not PEM-screened.",
    harmSeverity: "moderate",
    cautions:
      "If post-exertional malaise is present, graded/fixed-incremental exercise can cause lasting harm — pace instead.",
    promiseScore: 2.0,
    nRct: 1,
    sources: ["https://doi.org/10.1001/jamanetworkopen.2025.34304"],
  },
  {
    id: "inspiratory_muscle_training",
    name: "Inspiratory / respiratory muscle training",
    mechanismIds: ["deconditioning"],
    modality: "behavioral",
    evidenceLevel: "mixed",
    keyFinding:
      "Low-exertion breathing-muscle training improved exercise capacity and quality of life in several trials (though the largest IMT RCT missed its primary QoL endpoint). Low PEM risk.",
    harmSeverity: "low",
    promiseScore: 2.6,
    nRct: 3,
    sources: ["https://doi.org/10.1136/bmjresp-2022-001439"],
  },
  {
    id: "cardiopulmonary_rehab",
    name: "Cardiopulmonary / pulmonary rehabilitation",
    mechanismIds: ["deconditioning"],
    modality: "procedure",
    evidenceLevel: "mixed",
    keyFinding:
      "Benefits breathlessness and capacity in post-hospital, deconditioned (non-PEM) patients. RECOVER-ENERGIZE deliberately routes PEM patients AWAY from rehab into pacing.",
    harmSeverity: "moderate",
    cautions: "Contraindicated as graded exercise where post-exertional malaise is present.",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC11043268/"],
  },

  // ── Brain-based / mood / stress ──────────────────────────────────────
  {
    id: "cbt_fatigue",
    name: "Cognitive behavioral therapy (CBT)",
    mechanismIds: ["false_fatigue_alarms", "depression", "anxiety_somatization", "high_stress"],
    modality: "behavioral",
    evidenceLevel: "strong_rct",
    keyFinding:
      "The best-evidenced behavioral option for fatigue/coping (e.g. the ReCOVer 'Fit after COVID' RCT). It targets perpetuating factors and does NOT assume a psychological cause; note it improves subjective fatigue more than objective activity or cognition.",
    harmSeverity: "low",
    cautions:
      "Must not include graded-activity escalation where PEM is present, and must avoid 'dysfunctional beliefs' framing.",
    promiseScore: 3.0,
    nRct: 2,
    sources: ["https://academic.oup.com/cid/article/77/5/687/7157021"],
  },
  {
    id: "act_coping",
    name: "Acceptance & commitment therapy (ACT)",
    mechanismIds: ["false_fatigue_alarms", "high_stress"],
    modality: "behavioral",
    evidenceLevel: "weak",
    keyFinding:
      "Builds psychological flexibility and reduces symptom-related avoidance; thin Long COVID-specific evidence, mostly extrapolated from chronic-illness literature.",
    harmSeverity: "none",
    cautions: "Acceptance framing should be paired with validation, not 'just give up.'",
    sources: ["https://www.frontiersin.org/journals/human-neuroscience/articles/10.3389/fnhum.2025.1495050/full"],
  },
  {
    id: "antidepressant",
    name: "Antidepressants (e.g. vortioxetine, SSRIs)",
    mechanismIds: ["depression"],
    modality: "drug",
    evidenceLevel: "rct_negative",
    keyFinding:
      "Vortioxetine missed its primary cognitive endpoint for Long COVID (signal only in high-inflammation subgroups). Clearest role is genuine comorbid depression, not Long COVID cognition itself.",
    harmSeverity: "moderate",
    cautions: "SSRIs can worsen fatigue and sexual function; don't overstate subgroup findings.",
    promiseScore: 0,
    nRct: 1,
    sources: ["https://academic.oup.com/brain/article/147/3/849/7344681"],
  },
  {
    id: "meditation",
    name: "Mindfulness / meditation",
    mechanismIds: ["high_stress", "anxiety_somatization"],
    modality: "behavioral",
    evidenceLevel: "mixed",
    keyFinding:
      "An MBSR RCT improved anxiety, depression, and stress (weaker effect on core fatigue/cognition). A useful low-risk adjunct for the mood/stress cluster.",
    harmSeverity: "none",
    promiseScore: 1.22,
    nRct: 1,
    sources: ["https://www.frontiersin.org/journals/neurology"],
  },

  // ── Organ ────────────────────────────────────────────────────────────
  {
    id: "specialist_care",
    name: "Specialist, tissue-specific care",
    mechanismIds: ["organ_damage"],
    modality: "procedure",
    evidenceLevel: "strong_rct",
    keyFinding:
      "Established condition-specific management (e.g. guideline care for pericarditis, heart failure, or lung disease) delivered by the relevant specialist.",
    harmSeverity: "low",
    sources: ["https://jnm.snmjournals.org/content/early/2025"],
  },

  // ── Viral ────────────────────────────────────────────────────────────
  {
    id: "paxlovid_lc",
    name: "Paxlovid (nirmatrelvir-ritonavir) for established LC",
    mechanismIds: ["persistent_virus"],
    modality: "drug",
    evidenceLevel: "rct_negative",
    keyFinding:
      "Three RCTs (STOP-PASC, PAX-LC, RECOVER-VITAL), including extended courses, were all null for established Long COVID. Not justified outside trials.",
    harmSeverity: "moderate",
    cautions: "Strong CYP3A drug interactions via ritonavir (statins, anticoagulants, many others).",
    promiseScore: 0,
    nRct: 3,
    sources: ["https://clinicaltrials.gov/study/NCT05965726"],
  },
  {
    id: "valacyclovir",
    name: "Valacyclovir (anti-herpesvirus)",
    mechanismIds: ["ebv_reactivation"],
    modality: "drug",
    evidenceLevel: "anecdotal",
    keyFinding:
      "Tried by analogy to ME/CFS work; no completed Long COVID RCT, and nucleoside analogues have only modest activity against latent EBV.",
    harmSeverity: "moderate",
    cautions:
      "Renal dose-dependent; the related valganciclovir/ganciclovir carry significant myelosuppression and nephrotoxicity — a real harm-vs-evidence mismatch.",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC12300560/"],
  },

  // ── Immune ───────────────────────────────────────────────────────────
  {
    id: "ldn",
    name: "Low-dose naltrexone (LDN)",
    mechanismIds: ["immune_dysfunction"],
    modality: "drug",
    evidenceLevel: "weak",
    keyFinding:
      "The lowest-risk option in the immune cluster: observational pre-post studies show fatigue improvement; no completed RCT yet, but several are ongoing (prioritized by RECOVER-TLC).",
    harmSeverity: "low",
    cautions: "Vivid dreams, insomnia; contraindicated with opioid use.",
    sources: ["https://www.mdpi.com/2673-8112/5/12/198"],
  },
  {
    id: "rapamycin",
    name: "Low-dose rapamycin / sirolimus",
    mechanismIds: ["immune_dysfunction"],
    modality: "drug",
    evidenceLevel: "anecdotal",
    keyFinding:
      "Strong mechanistic rationale (restoring autophagy); only small uncontrolled pilots so far, with RCTs in progress and no efficacy readout.",
    harmSeverity: "moderate",
    cautions: "Immunosuppression, mouth ulcers, dyslipidemia, impaired wound healing.",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC12155199/"],
  },

  // ── Mitochondrial ────────────────────────────────────────────────────
  {
    id: "coq10",
    name: "CoQ10 / NAD+ precursors / oxaloacetate",
    mechanismIds: ["mitochondrial"],
    modality: "supplement",
    evidenceLevel: "rct_negative",
    keyFinding:
      "The rigorous trials of CoQ10, NR/NAD+, oxaloacetate, and AXA1125 all missed their primary endpoints. Biologically plausible, but unproven and non-trivial in cost.",
    harmSeverity: "low",
    cautions: "Mostly opportunity-cost and expense; quality of OTC products varies.",
    promiseScore: 0,
    nRct: 4,
    sources: ["https://www.sciencedirect.com/science/article/pii/S2666776222002356"],
  },
  {
    id: "l_arginine_vitc",
    name: "L-arginine + vitamin C",
    mechanismIds: ["mitochondrial"],
    modality: "supplement",
    evidenceLevel: "mixed",
    keyFinding:
      "The strongest dataset signal in the metabolic space — improved walk distance, grip, and endothelial function — but from a single-blind, single-centre study needing double-blind replication.",
    harmSeverity: "low",
    cautions: "Caution with hypotension and nitrates.",
    promiseScore: 3.0,
    nRct: 1,
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC9738241/"],
  },
  {
    id: "creatine",
    name: "Creatine monohydrate",
    mechanismIds: ["mitochondrial"],
    modality: "supplement",
    evidenceLevel: "weak",
    keyFinding:
      "Small, inconsistent signals from several high-risk-of-bias trials; cheap and very safe, but no large confirmatory RCT.",
    harmSeverity: "low",
    cautions: "Loading can cause GI upset and water-weight; caution in kidney disease.",
    promiseScore: 1.06,
    nRct: 3,
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC9738241/"],
  },

  // ── Microclots ───────────────────────────────────────────────────────
  {
    id: "antiplatelet",
    name: "Aspirin / nattokinase (antiplatelet, fibrinolytic supplement)",
    mechanismIds: ["microclots"],
    modality: "drug",
    evidenceLevel: "anecdotal",
    keyFinding:
      "No randomized evidence for Long COVID; nattokinase is in-vitro only, and the 'triple therapy' anticoagulation data is a small uncontrolled preprint.",
    harmSeverity: "high",
    cautions:
      "Bleeding risk, additive with other antithrombotics. Never combine anticoagulants/antiplatelets ('triple therapy') outside specialist supervision.",
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC11491705/"],
  },
  {
    id: "anticoagulation_trial",
    name: "Anticoagulation (in a trial) / plasmapheresis",
    mechanismIds: ["microclots"],
    modality: "procedure",
    evidenceLevel: "rct_negative",
    keyFinding:
      "The best randomized test — therapeutic plasma exchange — was negative; the rigorous anticoagulation test (STIMULATE-ICP) has not reported. HELP apheresis evidence is uncontrolled and costly.",
    harmSeverity: "high",
    cautions:
      "Major/fatal bleeding risk; invasive apheresis carries line, citrate, and infection risks plus financial harm. Decisions belong with a physician, never self-directed.",
    promiseScore: 0,
    nRct: 1,
    sources: ["https://pmc.ncbi.nlm.nih.gov/articles/PMC9931100/"],
  },
];
