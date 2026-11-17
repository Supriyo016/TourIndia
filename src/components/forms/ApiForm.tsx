"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useForm, type FieldValues, type Path } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { DancerCharacter } from "@/components/characters/lazy";

export interface FieldConfig {
  name: string;
  label: string;
  type?: "text" | "email" | "textarea" | "checkbox";
  placeholder?: string;
  hint?: string;
  autoComplete?: string;
}

/**
 * Shared form shell: validates in the browser with the same schema the server
 * enforces, and reports real outcomes from the API. Includes a hidden honeypot.
 */
export function ApiForm<T extends FieldValues>({
  schema,
  fields,
  endpoint,
  submitLabel,
  successTitle,
  successBody,
  defaultValues,
  layout = "stack",
}: {
  schema: z.ZodType<T, FieldValues>;
  fields: FieldConfig[];
  endpoint: string;
  submitLabel: string;
  successTitle: string;
  successBody: string;
  defaultValues: FieldValues;
  layout?: "stack" | "inline";
}) {
  const [failure, setFailure] = useState("");
  const [done, setDone] = useState(false);
  const form = useForm<FieldValues, unknown, T>({
    resolver: zodResolver(schema as never) as never,
    defaultValues,
  });

  const onSubmit = form.handleSubmit(async (values) => {
    setFailure("");
    const honeypot = (document.querySelector(`[data-hp="${endpoint}"]`) as HTMLInputElement | null)?.value ?? "";
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: honeypot }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        setFailure(body.error ?? "Something went wrong. Please try again.");
        return;
      }
      setDone(true);
      form.reset();
    } catch {
      setFailure("We could not reach the server. Check your connection and try again.");
    }
  });

  if (done) {
    return (
      <div role="status" className="anim-pop flex items-center gap-4 rounded-[var(--radius-md)] bg-brand-soft p-4 text-ink">
        <DancerCharacter className="h-20 w-auto shrink-0" />
        <div>
          <p className="font-semibold">{successTitle}</p>
          <p className="text-[0.97rem] text-ink-2">{successBody}</p>
        </div>
      </div>
    );
  }

  const inline = layout === "inline";

  return (
    <form onSubmit={onSubmit} noValidate className={inline ? "flex flex-col gap-3 sm:flex-row sm:items-start" : "space-y-4"}>
      <div aria-hidden className="absolute left-[-9999px] h-px w-px overflow-hidden">
        <label>
          Company
          <input data-hp={endpoint} type="text" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {fields.map((field) => {
        const id = `${endpoint}-${field.name}`.replace(/[^a-z0-9-]/gi, "-");
        const error = form.formState.errors[field.name]?.message as string | undefined;
        const describedBy = error ? `${id}-err` : field.hint ? `${id}-hint` : undefined;
        const name = field.name as Path<FieldValues>;

        if (field.type === "checkbox") {
          return (
            <div key={field.name}>
              <label className="flex cursor-pointer items-start gap-2.5 text-[0.97rem] text-ink-2">
                <input type="checkbox" className="mt-1 size-4 shrink-0 accent-[var(--brand)]" aria-invalid={Boolean(error)} aria-describedby={describedBy} {...form.register(name)} />
                <span>{field.label}</span>
              </label>
              {error && <p id={`${id}-err`} className="field-error mt-1">{error}</p>}
            </div>
          );
        }

        return (
          <div key={field.name} className={inline ? "field flex-1" : "field"}>
            <label className={inline ? "sr-only" : "field-label"} htmlFor={id}>{field.label}</label>
            {field.type === "textarea" ? (
              <textarea id={id} rows={5} className="input" placeholder={field.placeholder} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...form.register(name)} />
            ) : (
              <input id={id} type={field.type ?? "text"} autoComplete={field.autoComplete} className="input" placeholder={field.placeholder} aria-invalid={Boolean(error)} aria-describedby={describedBy} {...form.register(name)} />
            )}
            {error ? <p id={`${id}-err`} className="field-error">{error}</p> : field.hint && <p id={`${id}-hint`} className="field-hint">{field.hint}</p>}
          </div>
        );
      })}

      <button type="submit" className="btn btn-primary" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && <Loader2 className="size-4 animate-spin" aria-hidden />}
        {submitLabel}
      </button>
      {failure && <p role="alert" className="field-error">{failure}</p>}
    </form>
  );
}
