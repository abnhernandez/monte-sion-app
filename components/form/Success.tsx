"use client";

import { CheckCircle2 } from "lucide-react";
import type { CampApiSuccess } from "@/lib/camp/types";

type SuccessProps = {
  result: CampApiSuccess;
  onReset: () => void;
};

export default function Success({ result, onReset }: SuccessProps) {
  const attendeeName = result.ticket.attendeeName || "Tu registro";

  return (
    <div className="mx-auto w-full max-w-xl rounded-[1.5rem] bg-background/90 p-8 text-center ring-1 ring-border/70">
      <CheckCircle2 className="mx-auto h-16 w-16 text-emerald-500" />
      <h3 className="mt-5 text-3xl font-semibold text-foreground">
        Registro completado
      </h3>
      <p className="mt-4 text-xl text-foreground">{attendeeName}</p>
      <p className="mt-2 text-base text-muted-foreground">
        Hemos guardado tu registro correctamente.
      </p>

      <button
        type="button"
        onClick={onReset}
        className="mt-8 inline-flex w-full items-center justify-center rounded-xl bg-primary px-6 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/90"
      >
        Aceptar
      </button>
    </div>
  );
}
