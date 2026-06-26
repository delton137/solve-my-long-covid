"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import type { Question, AnswerValue } from "@/lib/kb/types";

export function QuestionField({
  question,
  value,
  onChange,
}: {
  question: Question;
  value: AnswerValue | undefined;
  onChange: (v: AnswerValue | undefined) => void;
}) {
  const labelId = `q-${question.id}`;
  return (
    <fieldset className="rounded-xl border border-border bg-card p-5">
      <legend className="sr-only">{question.prompt}</legend>
      <p id={labelId} className="font-medium text-foreground">
        {question.prompt}
      </p>
      {question.help && <p className="mt-1 text-sm text-muted-foreground">{question.help}</p>}

      <div className="mt-4">
        {question.answerType === "boolean" && (
          <RadioGroup
            aria-labelledby={labelId}
            value={value === true ? "yes" : value === false ? "no" : ""}
            onValueChange={(v) => onChange(v === "yes")}
            className="flex gap-2"
          >
            {[
              ["yes", "Yes"],
              ["no", "No"],
            ].map(([v, label]) => (
              <label
                key={v}
                className="flex flex-1 cursor-pointer items-center gap-3 rounded-lg border border-border px-4 py-3 hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-accent/50"
              >
                <RadioGroupItem value={v} />
                <span className="text-sm">{label}</span>
              </label>
            ))}
          </RadioGroup>
        )}

        {question.answerType === "single" && question.options && (
          <RadioGroup
            aria-labelledby={labelId}
            value={typeof value === "string" ? value : ""}
            onValueChange={(v) => onChange(v)}
            className="gap-2"
          >
            {question.options.map((opt) => (
              <label
                key={opt.value}
                className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-4 py-3 hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-accent/50"
              >
                <RadioGroupItem value={opt.value} className="mt-0.5" />
                <span className="text-sm">
                  {opt.label}
                  {opt.help && <span className="mt-0.5 block text-xs text-muted-foreground">{opt.help}</span>}
                </span>
              </label>
            ))}
          </RadioGroup>
        )}

        {question.answerType === "multi" && question.options && (
          <div className="grid gap-2 sm:grid-cols-2" role="group" aria-labelledby={labelId}>
            {question.options.map((opt) => {
              const arr = Array.isArray(value) ? value : [];
              const checked = arr.includes(opt.value);
              return (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-start gap-3 rounded-lg border border-border px-4 py-3 hover:bg-secondary has-[:checked]:border-primary has-[:checked]:bg-accent/50"
                >
                  <Checkbox
                    className="mt-0.5"
                    checked={checked}
                    onCheckedChange={(c) => {
                      const next = c ? [...arr, opt.value] : arr.filter((x) => x !== opt.value);
                      onChange(next.length ? next : undefined);
                    }}
                  />
                  <span className="text-sm">{opt.label}</span>
                </label>
              );
            })}
          </div>
        )}

        {(question.answerType === "numeric" ||
          question.answerType === "scale" ||
          question.answerType === "duration") && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              aria-labelledby={labelId}
              min={question.min}
              max={question.max}
              value={typeof value === "number" ? value : ""}
              onChange={(e) => {
                const v = e.target.value;
                onChange(v === "" ? undefined : Number(v));
              }}
              className="h-11 w-32 rounded-lg border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            {question.unit && <span className="text-sm text-muted-foreground">{question.unit}</span>}
          </div>
        )}
      </div>
    </fieldset>
  );
}
