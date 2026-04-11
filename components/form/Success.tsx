"use client";

import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { CampApiSuccess } from "@/lib/camp/types";

type SuccessProps = {
  result: CampApiSuccess;
  onReset: () => void;
};

export default function Success({ result, onReset }: SuccessProps) {
  const attendeeName = result.ticket.attendeeName || "Tu registro";

  return (
    <div className="mx-auto w-full max-w-2xl space-y-4">
      <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-200">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Confirmado
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold text-foreground md:text-3xl">
          {attendeeName}
        </h3>
        <p className="text-sm leading-6 text-muted-foreground">Tu registro quedó listo.</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href={result.ticket.ticketUrl}
          className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
        >
          Abrir ticket
        </Link>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-foreground transition hover:bg-white/[0.07]"
        >
          Volver
        </button>
      </div>
    </div>
  );
}
