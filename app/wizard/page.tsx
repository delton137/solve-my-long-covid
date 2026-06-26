import type { Metadata } from "next";
import { WizardClient } from "./WizardClient";

export const metadata: Metadata = {
  title: "Symptom & mechanism wizard",
  description:
    "Answer questions about your history, symptoms, and test results to see which Long COVID mechanisms may be active and the most informative next test. Private, in your browser, not medical advice.",
};

export default function WizardPage() {
  return <WizardClient />;
}
