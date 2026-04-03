import type {
  FieldPath,
  FieldValues,
  UseFormReturn,
} from "react-hook-form";
import { cn } from "@/lib/utils";

function hasMeaningfulValue(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value instanceof File) {
    return value.size > 0;
  }

  return String(value ?? "").trim().length > 0;
}

export function getFieldFeedback<TFieldValues extends FieldValues>(
  methods: UseFormReturn<TFieldValues>,
  name: FieldPath<TFieldValues>
) {
  const fieldState = methods.getFieldState(name, methods.formState);
  const value = methods.getValues(name);

  return {
    error: fieldState.error?.message,
    invalid: fieldState.invalid,
    valid: fieldState.isTouched && !fieldState.invalid && hasMeaningfulValue(value),
  };
}

export function getInputClasses({
  invalid,
  valid,
  className,
}: {
  invalid?: boolean;
  valid?: boolean;
  className?: string;
}) {
  return cn(
    "w-full rounded-2xl border border-white/12 bg-[#18181a] px-4 py-3 text-sm text-foreground outline-none transition duration-200 placeholder:text-muted-foreground/80",
    "focus:border-white/25 focus:ring-2 focus:ring-white/10",
    invalid
      ? "border-destructive/60 bg-destructive/10"
      : valid
        ? "border-emerald-500/40 bg-emerald-500/10"
        : "hover:border-white/20",
    className
  );
}
