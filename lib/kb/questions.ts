import type { QuestionInput } from "./types";

/**
 * The wizard's inputs. Each question carries `evidence` links: when the user's answer matches
 * `whenAnswer`, the linked mechanism gets that strength's log-odds delta, with `rationale`
 * shown in the "why this scored" ledger. Multiple links can share a `whenAnswer` (one symptom
 * implicating several mechanisms).
 *
 * Weights are deliberately coarse and conservative — single-symptom links are usually weak;
 * structured/near-confirmatory inputs (orthostatic HR, lab results) carry the strong weights.
 */
export const questions: QuestionInput[] = [
  // ════════════════════ HISTORY ════════════════════
  {
    id: "confirmed_infection",
    section: "history",
    prompt: "Was the start of your illness linked to a COVID-19 infection?",
    answerType: "single",
    options: [
      { value: "confirmed", label: "Yes — confirmed by a test" },
      { value: "probable", label: "Probably — I was sick but didn't test" },
      { value: "no_clear", label: "No clear infection / not sure" },
    ],
    evidence: [
      {
        whenAnswer: "no_clear",
        mechanismId: "mistaken_attribution",
        strength: "moderate_for",
        rationale: "Without a clear COVID infection, another cause becomes more likely.",
      },
    ],
  },
  {
    id: "acute_severity",
    section: "history",
    prompt: "How severe was your acute (initial) COVID infection?",
    answerType: "single",
    options: [
      { value: "hospitalized", label: "Hospitalized" },
      { value: "severe", label: "Severe but managed at home" },
      { value: "moderate", label: "Moderate" },
      { value: "mild", label: "Mild or asymptomatic" },
    ],
    evidence: [
      {
        whenAnswer: "hospitalized",
        mechanismId: "organ_damage",
        strength: "moderate_for",
        factorType: "precipitating",
        rationale: "Hospitalized/severe infection raises the chance of structural organ injury.",
      },
      {
        whenAnswer: "mild",
        mechanismId: "organ_damage",
        strength: "weak_against",
        rationale: "A mild acute infection makes major organ damage less likely.",
      },
    ],
  },
  {
    id: "prior_mood_history",
    section: "history",
    prompt: "Before COVID, did you have a history of depression or anxiety?",
    answerType: "single",
    options: [
      { value: "depression", label: "Depression" },
      { value: "anxiety", label: "Anxiety" },
      { value: "both", label: "Both" },
      { value: "neither", label: "Neither" },
    ],
    evidence: [
      { whenAnswer: "depression", mechanismId: "depression", strength: "weak_for", factorType: "predisposing", rationale: "A prior history of depression is a predisposing factor." },
      { whenAnswer: "both", mechanismId: "depression", strength: "weak_for", factorType: "predisposing", rationale: "A prior history of depression is a predisposing factor." },
      { whenAnswer: "anxiety", mechanismId: "anxiety_somatization", strength: "weak_for", factorType: "predisposing", rationale: "A prior history of anxiety is a predisposing factor." },
      { whenAnswer: "both", mechanismId: "anxiety_somatization", strength: "weak_for", factorType: "predisposing", rationale: "A prior history of anxiety is a predisposing factor." },
      { whenAnswer: "neither", mechanismId: "depression", strength: "weak_against", rationale: "No prior mood history slightly lowers the prior for depression." },
    ],
  },
  {
    id: "prior_ebv",
    section: "history",
    prompt: "Have you ever had mononucleosis (\"mono\" / glandular fever) or a known EBV infection?",
    answerType: "boolean",
    evidence: [
      { whenAnswer: true, mechanismId: "ebv_reactivation", strength: "weak_for", factorType: "predisposing", rationale: "Prior EBV is required for reactivation and is a predisposing factor." },
    ],
  },
  {
    id: "ongoing_stress",
    section: "history",
    prompt: "Are you under significant ongoing life stress (work, caregiving, finances, grief)?",
    answerType: "boolean",
    evidence: [
      { whenAnswer: true, mechanismId: "high_stress", strength: "moderate_for", factorType: "perpetuating", rationale: "Sustained stress can drive fatigue and burnout and slow recovery." },
    ],
  },

  // ════════════════════ TIME COURSE ════════════════════
  {
    id: "onset_timing",
    section: "timecourse",
    prompt: "When did your main lingering symptoms start?",
    answerType: "single",
    options: [
      { value: "during_after", label: "During or right after the infection" },
      { value: "weeks_after", label: "Weeks after I'd recovered from the infection" },
      { value: "no_clear_link", label: "No clear link to the infection's timing" },
    ],
    evidence: [
      { whenAnswer: "weeks_after", mechanismId: "mistaken_attribution", strength: "weak_for", rationale: "Symptoms starting well after recovery weaken the link to COVID." },
      { whenAnswer: "no_clear_link", mechanismId: "mistaken_attribution", strength: "moderate_for", rationale: "No temporal link to the infection points toward another cause." },
    ],
  },
  {
    id: "trajectory",
    section: "timecourse",
    prompt: "How have your symptoms changed over time?",
    answerType: "single",
    options: [
      { value: "improving", label: "Gradually improving" },
      { value: "plateaued", label: "Plateaued / stable" },
      { value: "relapsing", label: "Relapsing-remitting (good and bad spells)" },
      { value: "worsening", label: "Progressively worsening" },
    ],
    evidence: [
      { whenAnswer: "relapsing", mechanismId: "mitochondrial", strength: "weak_for", rationale: "A relapsing-remitting, exertion-linked pattern fits an energy-production problem." },
      { whenAnswer: "worsening", mechanismId: "mistaken_attribution", strength: "moderate_for", rationale: "Progressive worsening is a red flag for a separate, undiagnosed condition — get reviewed by a doctor." },
    ],
  },
  {
    id: "inactive_weeks",
    section: "timecourse",
    prompt: "Were you largely inactive or in bed for two or more weeks during your illness?",
    answerType: "boolean",
    evidence: [
      { whenAnswer: true, mechanismId: "deconditioning", strength: "moderate_for", factorType: "precipitating", rationale: "Even a couple of weeks of inactivity causes measurable deconditioning." },
      { whenAnswer: true, mechanismId: "sleep_circadian", strength: "weak_for", rationale: "Extended time in bed commonly disrupts sleep and circadian rhythm." },
    ],
  },

  // ════════════════════ SYMPTOMS ════════════════════
  {
    id: "pem",
    section: "symptoms",
    prompt:
      "After physical or mental exertion, do you get a delayed crash — disproportionate fatigue and worsening of symptoms that comes on hours to a day later and can last days?",
    help: "This is called post-exertional malaise (PEM). It's important for safety: if present, pushing through exercise can cause lasting harm.",
    answerType: "single",
    isPemScreen: true,
    options: [
      { value: "yes_clearly", label: "Yes, clearly" },
      { value: "sometimes", label: "Sometimes / mild" },
      { value: "no", label: "No" },
    ],
    evidence: [
      { whenAnswer: "yes_clearly", mechanismId: "mitochondrial", strength: "weak_for", rationale: "Post-exertional crashes fit an energy-production/recovery problem." },
      { whenAnswer: "yes_clearly", mechanismId: "immune_dysfunction", strength: "weak_for", rationale: "PEM is associated with immune/inflammatory dysregulation." },
      { whenAnswer: "yes_clearly", mechanismId: "deconditioning", strength: "moderate_against", rationale: "A true post-exertional crash is more than simple deconditioning, which improves with activity." },
    ],
  },
  {
    id: "orthostatic",
    section: "symptoms",
    prompt:
      "When you stand up, do you get a racing or pounding heart, lightheadedness, or a need to sit or lie down — relieved by lying flat?",
    answerType: "single",
    options: [
      { value: "yes_strongly", label: "Yes, strongly / most days" },
      { value: "sometimes", label: "Sometimes" },
      { value: "no", label: "No" },
    ],
    evidence: [
      { whenAnswer: "yes_strongly", mechanismId: "autonomic_pots", strength: "strong_for", rationale: "Classic orthostatic intolerance strongly suggests autonomic dysfunction / POTS." },
      { whenAnswer: "sometimes", mechanismId: "autonomic_pots", strength: "moderate_for", rationale: "Intermittent orthostatic symptoms suggest possible autonomic involvement." },
    ],
  },
  {
    id: "symptoms_core",
    section: "symptoms",
    prompt: "Which of these symptoms do you currently have? Select all that apply.",
    answerType: "multi",
    options: [
      { value: "fatigue", label: "Fatigue / low energy" },
      { value: "brain_fog", label: "Brain fog / poor concentration" },
      { value: "palpitations", label: "Palpitations / racing heart" },
      { value: "breathless", label: "Breathlessness / shortness of breath" },
      { value: "chest_pain", label: "Chest pain or tightness" },
      { value: "unrefreshing_sleep", label: "Unrefreshing sleep" },
      { value: "insomnia", label: "Trouble falling or staying asleep" },
      { value: "low_mood", label: "Low mood / loss of interest" },
      { value: "anxious", label: "Anxiety / feeling on edge" },
      { value: "joint_muscle_pain", label: "Joint or muscle pain" },
      { value: "sore_throat_glands", label: "Recurrent sore throat / swollen glands" },
      { value: "gi_symptoms", label: "Gut symptoms (nausea, bloating, bowel changes)" },
      { value: "neuropathy", label: "Tingling, numbness, or burning (nerve pain)" },
      { value: "anosmia", label: "Loss or distortion of smell/taste" },
    ],
    evidence: [
      { whenAnswer: "brain_fog", mechanismId: "bbb_damage", strength: "weak_for", rationale: "Brain fog is associated with measurable blood-brain-barrier leakage in some patients." },
      { whenAnswer: "brain_fog", mechanismId: "mitochondrial", strength: "weak_for", rationale: "Cognitive fatigue can reflect impaired cellular energy supply to the brain." },
      { whenAnswer: "palpitations", mechanismId: "autonomic_pots", strength: "weak_for", rationale: "Palpitations are common in autonomic dysfunction." },
      { whenAnswer: "palpitations", mechanismId: "anxiety_somatization", strength: "weak_for", rationale: "Palpitations are also a common physical sign of anxiety." },
      { whenAnswer: "breathless", mechanismId: "deconditioning", strength: "weak_for", rationale: "Breathlessness on exertion is a hallmark of deconditioning." },
      { whenAnswer: "breathless", mechanismId: "organ_damage", strength: "weak_for", rationale: "Breathlessness can reflect lung or heart involvement." },
      { whenAnswer: "chest_pain", mechanismId: "organ_damage", strength: "weak_for", rationale: "Chest pain warrants ruling out cardiac/pulmonary involvement." },
      { whenAnswer: "chest_pain", mechanismId: "anxiety_somatization", strength: "weak_for", rationale: "A large fraction of non-cardiac chest pain is driven by anxiety." },
      { whenAnswer: "unrefreshing_sleep", mechanismId: "sleep_circadian", strength: "moderate_for", rationale: "Unrefreshing sleep is a core feature of a sleep/circadian problem (and sleep apnea)." },
      { whenAnswer: "insomnia", mechanismId: "sleep_circadian", strength: "moderate_for", rationale: "Insomnia is a direct sleep-disruption symptom." },
      { whenAnswer: "low_mood", mechanismId: "depression", strength: "weak_for", rationale: "Low mood and loss of interest are core depressive symptoms." },
      { whenAnswer: "anxious", mechanismId: "anxiety_somatization", strength: "weak_for", rationale: "Persistent anxiety supports an anxiety/somatization contribution." },
      { whenAnswer: "joint_muscle_pain", mechanismId: "immune_dysfunction", strength: "weak_for", rationale: "Diffuse joint/muscle pain can reflect ongoing immune activation." },
      { whenAnswer: "sore_throat_glands", mechanismId: "ebv_reactivation", strength: "weak_for", rationale: "Recurrent sore throat / swollen glands fit herpesvirus reactivation." },
      { whenAnswer: "gi_symptoms", mechanismId: "persistent_virus", strength: "weak_for", rationale: "The gut is a proposed site of a viral reservoir." },
      { whenAnswer: "neuropathy", mechanismId: "immune_dysfunction", strength: "weak_for", rationale: "Nerve symptoms can reflect autoimmune small-fiber neuropathy." },
      { whenAnswer: "neuropathy", mechanismId: "iatrogenic", strength: "weak_for", rationale: "Tingling/numbness can be caused by supplement toxicity (e.g. high-dose vitamin B6)." },
      { whenAnswer: "anosmia", mechanismId: "persistent_virus", strength: "weak_for", rationale: "Persistent smell loss may reflect ongoing local viral effects." },
    ],
  },

  // ════════════════════ LABS / RESULTS YOU ALREADY HAVE ════════════════════
  {
    id: "lab_alt_dx",
    section: "labs",
    prompt: "Have you had a basic blood panel (thyroid, iron/ferritin, B12, vitamin D, blood sugar, blood count)?",
    answerType: "single",
    options: [
      { value: "not_done", label: "Not done / not sure" },
      { value: "all_normal", label: "Done — all normal" },
      { value: "found_cause", label: "Done — found an abnormality (e.g. low thyroid, low iron)" },
    ],
    evidence: [
      { whenAnswer: "found_cause", mechanismId: "mistaken_attribution", strength: "strong_for", rationale: "A found abnormality may explain symptoms directly — treat it and reassess." },
      { whenAnswer: "all_normal", mechanismId: "mistaken_attribution", strength: "moderate_against", rationale: "A normal first-tier panel makes common mimics less likely." },
    ],
  },
  {
    id: "lab_osa",
    section: "labs",
    prompt: "Have you been tested for sleep apnea (a sleep study or home sleep test)?",
    answerType: "single",
    options: [
      { value: "not_done", label: "Not done" },
      { value: "negative", label: "Done — no sleep apnea" },
      { value: "positive", label: "Done — sleep apnea found" },
    ],
    evidence: [
      { whenAnswer: "positive", mechanismId: "sleep_circadian", strength: "strong_for", rationale: "Diagnosed sleep apnea is a treatable driver of fatigue and brain fog." },
      { whenAnswer: "positive", mechanismId: "mistaken_attribution", strength: "moderate_for", rationale: "Sleep apnea can account for symptoms attributed to Long COVID." },
      { whenAnswer: "negative", mechanismId: "sleep_circadian", strength: "weak_against", rationale: "A negative sleep-apnea test lowers (but doesn't remove) the chance of a sleep cause." },
    ],
  },
  {
    id: "lab_standing_hr",
    section: "labs",
    prompt: "If you've measured it: how much does your heart rate rise from lying to standing (over ~10 minutes), in beats per minute?",
    help: "Leave blank if you haven't measured this. A sustained rise of ≥30 bpm (≥40 in teens) suggests POTS.",
    answerType: "numeric",
    unit: "bpm",
    min: 0,
    max: 120,
    evidence: [
      { whenAnswer: { gte: 30 }, mechanismId: "autonomic_pots", strength: "strong_for", rationale: "A sustained standing heart-rate rise ≥30 bpm meets the POTS threshold." },
      { whenAnswer: { lte: 15 }, mechanismId: "autonomic_pots", strength: "moderate_against", rationale: "A small standing heart-rate rise argues against POTS." },
    ],
  },
  {
    id: "lab_ebv",
    section: "labs",
    prompt: "Have you had EBV antibody testing (for recent reactivation)?",
    answerType: "single",
    options: [
      { value: "not_done", label: "Not done" },
      { value: "negative", label: "Done — no reactivation" },
      { value: "positive", label: "Done — signs of reactivation" },
    ],
    evidence: [
      { whenAnswer: "positive", mechanismId: "ebv_reactivation", strength: "moderate_for", rationale: "Serology suggesting recent EBV reactivation supports this mechanism (association, not proof)." },
      { whenAnswer: "negative", mechanismId: "ebv_reactivation", strength: "moderate_against", rationale: "No serological reactivation makes this mechanism less likely." },
    ],
  },
  {
    id: "lab_crp",
    section: "labs",
    prompt: "Do you know your inflammatory markers (e.g. CRP)?",
    answerType: "single",
    options: [
      { value: "not_done", label: "Not done / don't know" },
      { value: "normal", label: "Normal" },
      { value: "elevated", label: "Elevated" },
    ],
    evidence: [
      { whenAnswer: "elevated", mechanismId: "immune_dysfunction", strength: "moderate_for", rationale: "Elevated inflammatory markers support ongoing immune activation." },
      { whenAnswer: "normal", mechanismId: "immune_dysfunction", strength: "weak_against", rationale: "Normal CRP slightly lowers the chance of active inflammation." },
    ],
  },
  {
    id: "lab_dimer",
    section: "labs",
    prompt: "Do you know your D-dimer result?",
    answerType: "single",
    options: [
      { value: "not_done", label: "Not done / don't know" },
      { value: "normal", label: "Normal" },
      { value: "elevated", label: "Elevated" },
    ],
    evidence: [
      { whenAnswer: "elevated", mechanismId: "microclots", strength: "weak_for", rationale: "An elevated D-dimer is a weak, indirect signal toward a clotting abnormality." },
      { whenAnswer: "normal", mechanismId: "microclots", strength: "weak_against", rationale: "A normal D-dimer slightly lowers the chance of a clotting contribution." },
    ],
  },
  {
    id: "lab_phq9",
    section: "labs",
    prompt: "Have you completed a depression screen (e.g. PHQ-9)?",
    answerType: "single",
    options: [
      { value: "not_done", label: "Not done" },
      { value: "low", label: "Done — low / minimal" },
      { value: "elevated", label: "Done — moderate or high" },
    ],
    evidence: [
      { whenAnswer: "elevated", mechanismId: "depression", strength: "strong_for", rationale: "A positive depression screen strongly supports a depressive contribution." },
      { whenAnswer: "low", mechanismId: "depression", strength: "moderate_against", rationale: "A low depression screen makes depression less likely." },
    ],
  },
  {
    id: "lab_gad7",
    section: "labs",
    prompt: "Have you completed an anxiety screen (e.g. GAD-7)?",
    answerType: "single",
    options: [
      { value: "not_done", label: "Not done" },
      { value: "low", label: "Done — low / minimal" },
      { value: "elevated", label: "Done — moderate or high" },
    ],
    evidence: [
      { whenAnswer: "elevated", mechanismId: "anxiety_somatization", strength: "strong_for", rationale: "A positive anxiety screen strongly supports an anxiety/somatization contribution." },
      { whenAnswer: "low", mechanismId: "anxiety_somatization", strength: "moderate_against", rationale: "A low anxiety screen makes this mechanism less likely." },
    ],
  },

  // ════════════════════ MEDICATIONS & SUPPLEMENTS ════════════════════
  {
    id: "supplement_count",
    section: "meds",
    prompt: "How many supplements or unproven treatments are you currently taking?",
    answerType: "single",
    options: [
      { value: "none", label: "None" },
      { value: "few", label: "1–3" },
      { value: "many", label: "4 or more" },
    ],
    evidence: [
      { whenAnswer: "many", mechanismId: "iatrogenic", strength: "moderate_for", rationale: "Taking many supplements raises the risk of toxicity and interactions." },
      { whenAnswer: "few", mechanismId: "iatrogenic", strength: "weak_for", rationale: "Even a few unproven treatments can cause harm worth reviewing." },
    ],
  },
  {
    id: "risky_meds",
    section: "meds",
    prompt: "Are you taking any of these? Select all that apply.",
    answerType: "multi",
    dependsOn: { questionId: "supplement_count", equals: ["few", "many"] },
    options: [
      { value: "high_dose_b6", label: "High-dose vitamin B6 (or a B-complex / energy stack)" },
      { value: "high_dose_zinc", label: "High-dose zinc, long-term" },
      { value: "high_dose_vitd", label: "High-dose vitamin D (megadose)" },
      { value: "multi_anticoag", label: "More than one blood thinner / antiplatelet" },
      { value: "mms", label: "Chlorine dioxide / \"MMS\"" },
      { value: "other_unproven", label: "Other unproven \"protocol\" treatments" },
    ],
    evidence: [
      { whenAnswer: "high_dose_b6", mechanismId: "iatrogenic", strength: "moderate_for", rationale: "Chronic high-dose B6 can cause a reversible sensory neuropathy." },
      { whenAnswer: "high_dose_zinc", mechanismId: "iatrogenic", strength: "moderate_for", rationale: "Long-term high-dose zinc causes copper deficiency and can cause a myeloneuropathy." },
      { whenAnswer: "high_dose_vitd", mechanismId: "iatrogenic", strength: "moderate_for", rationale: "Vitamin-D megadosing can cause hypercalcemia." },
      { whenAnswer: "multi_anticoag", mechanismId: "iatrogenic", strength: "strong_for", rationale: "Combining blood thinners/antiplatelets risks serious bleeding — review urgently with a clinician." },
      { whenAnswer: "mms", mechanismId: "iatrogenic", strength: "strong_for", rationale: "Chlorine dioxide/MMS is a toxic bleach and is never appropriate — stop and seek advice." },
      { whenAnswer: "other_unproven", mechanismId: "iatrogenic", strength: "weak_for", rationale: "Unproven protocol treatments carry harm and interaction risks." },
    ],
  },
  {
    id: "lab_med_review",
    section: "meds",
    prompt: "Has an expert (doctor or pharmacist) reviewed all your medications and supplements together?",
    answerType: "single",
    options: [
      { value: "not_done", label: "Not done" },
      { value: "no_issues", label: "Done — no issues found" },
      { value: "found_issue", label: "Done — found a problem to address" },
    ],
    evidence: [
      { whenAnswer: "found_issue", mechanismId: "iatrogenic", strength: "strong_for", rationale: "A review found a medication/supplement problem — addressing it may help directly." },
      { whenAnswer: "no_issues", mechanismId: "iatrogenic", strength: "moderate_against", rationale: "An expert review with no issues lowers the chance of treatment-caused harm." },
    ],
  },
];
