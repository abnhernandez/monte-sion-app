import type { ReactNode } from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

type FieldShellProps = {
  label: string;
  hint?: string;
  error?: string;
  valid?: boolean;
  required?: boolean;
  htmlFor?: string;
  hintId?: string;
  errorId?: string;
  children: ReactNode;
};

export default function FieldShell({
  label,
  hint,
  error,
  valid,
  required,
  htmlFor,
  hintId,
  errorId,
  children,
}: FieldShellProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        {htmlFor ? (
          <label htmlFor={htmlFor} className="text-sm font-semibold text-foreground/90">
            {label}
            {required ? " *" : ""}
          </label>
        ) : (
          <p className="text-sm font-semibold text-foreground/90">
            {label}
            {required ? " *" : ""}
          </p>
        )}
        {valid && !error ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-primary">
            <CheckCircle2 className="h-3 w-3" />
            OK
          </span>
        ) : null}
      </div>
      {children}
      <div className="min-h-5">
        {error ? (
          <p id={errorId} className="inline-flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3.5 w-3.5" />
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className="text-xs leading-5 text-muted-foreground">{hint}</p>
        ) : null}
      </div>
    </div>
  );
}
