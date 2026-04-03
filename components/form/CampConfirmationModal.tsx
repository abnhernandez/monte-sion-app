"use client";

import { X } from "lucide-react";
import Step4 from "@/components/form/Step4";
import type { CampRegistrationFormValues } from "@/lib/camp/types";

type CampConfirmationModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  deferredValues: CampRegistrationFormValues;
  isSubmitting: boolean;
};

export default function CampConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  deferredValues,
  isSubmitting,
}: CampConfirmationModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="camp-confirmation-title"
    >
      <div className="relative w-full max-w-4xl rounded-[2rem] bg-card p-6 shadow-2xl ring-1 ring-black/5 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
              Confirmación final
            </p>
            <h3 id="camp-confirmation-title" className="mt-2 text-2xl font-semibold text-foreground">
              Revisa todo antes de enviar
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-muted/60 p-2 text-muted-foreground transition hover:text-foreground"
            aria-label="Cerrar confirmación"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 max-h-[70vh] overflow-y-auto pr-1">
          <Step4 deferredValues={deferredValues} />
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-black/5 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full bg-muted px-5 py-3 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            Volver a editar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isSubmitting ? "Generando ticket..." : "Confirmar inscripción"}
          </button>
        </div>
      </div>
    </div>
  );
}