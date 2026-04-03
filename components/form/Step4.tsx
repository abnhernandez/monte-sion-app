"use client";

import { useFormContext } from "react-hook-form";
import type { CampRegistrationFormValues } from "@/lib/camp/types";
import {
  formatHumanDate,
  formatPhoneForDisplay,
  getAgeFromBirthDate,
} from "@/lib/camp/utils";

type Step4Props = {
  deferredValues: CampRegistrationFormValues;
  onEditPersonal?: () => void;
  onEditContact?: () => void;
};

export default function Step4({
  deferredValues,
  onEditPersonal = () => {},
  onEditContact = () => {},
}: Step4Props) {
  const methods = useFormContext<CampRegistrationFormValues>();
  const age = getAgeFromBirthDate(deferredValues.birthDate);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Revisa tu información</h3>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="space-y-3 rounded-2xl bg-background/70 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">Datos personales</p>
            <button
              type="button"
              onClick={onEditPersonal}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-white/15"
            >
              Editar
            </button>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{`${deferredValues.firstName} ${deferredValues.lastName}`.trim() || "—"}</p>
            <p>{deferredValues.birthDate ? formatHumanDate(deferredValues.birthDate) : "—"}</p>
            <p>{age !== null ? `Edad: ${age} años` : "Edad: pendiente"}</p>
            <p>{deferredValues.churchName || "—"}</p>
            <p>{deferredValues.city || "—"}</p>
            <p>Transporte: {deferredValues.needsTransport ? "Sí" : "No"}</p>
            <p>Bautismo: {deferredValues.interestedInBaptism ? "Sí" : "No"}</p>
          </div>
        </article>

        <article className="space-y-3 rounded-2xl bg-background/70 p-4 ring-1 ring-white/10">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-foreground">Contacto</p>
            <button
              type="button"
              onClick={onEditContact}
              className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-foreground transition hover:bg-white/15"
            >
              Editar
            </button>
          </div>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>{deferredValues.email || "—"}</p>
            <p>{deferredValues.phone ? formatPhoneForDisplay(deferredValues.phone) : "—"}</p>
            <p>Contacto de emergencia autogenerado.</p>
          </div>
        </article>
      </div>
      <label className="flex items-start gap-3 rounded-[1.25rem] bg-muted/20 p-5 ring-1 ring-black/5">
        <input
          {...methods.register("termsAccepted")}
          type="checkbox"
          className="mt-1 h-4 w-4 rounded border-0 bg-background text-primary ring-1 ring-black/10"
        />
        <span className="text-sm leading-7 text-muted-foreground">
          Confirmo que los datos son verídicos, autorizo su tratamiento para la
          operación del campamento y acepto las reglas generales de Campamento Monte Sion 2026.
        </span>
      </label>

      {methods.formState.errors.termsAccepted ? (
        <p className="text-sm text-destructive">
          {methods.formState.errors.termsAccepted.message}
        </p>
      ) : null}
    </div>
  );
}
