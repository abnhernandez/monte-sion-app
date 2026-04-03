"use client";

import { useFormContext } from "react-hook-form";
import type { CampRegistrationFormValues } from "@/lib/camp/types";
import {
  getAgeFromBirthDate,
  isMinorFromBirthDate,
} from "@/lib/camp/utils";
import FieldShell from "@/components/form/FieldShell";
import {
  getFieldFeedback,
  getInputClasses,
} from "@/components/form/form-utils";

export default function Step1() {
  const methods = useFormContext<CampRegistrationFormValues>();
  const birthDate = methods.watch("birthDate");
  const age = getAgeFromBirthDate(birthDate);
  const isMinor = isMinorFromBirthDate(birthDate);

  const firstNameFeedback = getFieldFeedback(methods, "firstName");
  const lastNameFeedback = getFieldFeedback(methods, "lastName");
  const birthDateFeedback = getFieldFeedback(methods, "birthDate");
  const churchFeedback = getFieldFeedback(methods, "churchName");
  const cityFeedback = getFieldFeedback(methods, "city");
  const needsTransportFeedback = getFieldFeedback(methods, "needsTransport");
  const baptismFeedback = getFieldFeedback(methods, "interestedInBaptism");

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <FieldShell
          label="Nombre"
          required
          htmlFor="camp-first-name"
          error={firstNameFeedback.error}
          valid={firstNameFeedback.valid}
        >
          <input
            {...methods.register("firstName")}
            id="camp-first-name"
            aria-invalid={firstNameFeedback.invalid ? "true" : "false"}
            placeholder="Ej. Abigail"
            autoComplete="given-name"
            className={getInputClasses(firstNameFeedback)}
          />
        </FieldShell>

        <FieldShell
          label="Apellidos"
          required
          htmlFor="camp-last-name"
          error={lastNameFeedback.error}
          valid={lastNameFeedback.valid}
        >
          <input
            {...methods.register("lastName")}
            id="camp-last-name"
            aria-invalid={lastNameFeedback.invalid ? "true" : "false"}
            placeholder="Ej. Pérez Martínez"
            autoComplete="family-name"
            className={getInputClasses(lastNameFeedback)}
          />
        </FieldShell>

        <FieldShell
          label="Fecha de nacimiento"
          required
          htmlFor="camp-birth-date"
          hint="Usa números. Ejemplo: 03 / 04 / 2008."
          error={birthDateFeedback.error}
          valid={birthDateFeedback.valid}
        >
          <input
            id="camp-birth-date"
            type="date"
            {...methods.register("birthDate")}
            aria-invalid={birthDateFeedback.invalid ? "true" : "false"}
            className={getInputClasses(birthDateFeedback)}
          />
        </FieldShell>

      </div>

      <div className="rounded-[1.25rem] bg-background/60 p-4 md:p-5">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            Perfil detectado
          </span>
          <span className="text-sm text-muted-foreground">
            {age !== null ? `${age} años` : "Ingresa tu fecha de nacimiento"}
          </span>
          <span className="text-sm text-muted-foreground">
            {isMinor ? "Se solicitará carta responsiva." : "No requiere tutor."}
          </span>
        </div>

        <div className="mt-4 grid gap-4">
          <div className="rounded-xl bg-muted/30 px-4 py-3 ring-1 ring-border/70">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Edad calculada</p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {age !== null ? `Edad: ${age} años` : "Edad: pendiente"}
            </p>
          </div>

          <p className="rounded-xl bg-primary/5 px-4 py-3 text-sm text-muted-foreground ring-1 ring-primary/15">
            Registro activo para asistentes del campamento.
          </p>
        </div>
      </div>

      <div className="grid gap-4">
        <FieldShell label="Sexo legal" required>
          <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="Sexo legal">
            {[
              { value: "H", label: "Hombre" },
              { value: "M", label: "Mujer" },
            ].map((option) => {
              const selected = methods.watch("gender") === option.value;

              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center justify-start rounded-xl px-4 py-3 text-sm font-medium transition ${
                    selected
                      ? "bg-primary/12 text-foreground ring-1 ring-primary/20"
                      : "bg-background/70 text-muted-foreground hover:bg-background"
                  }`}
                >
                  <input
                    {...methods.register("gender")}
                    type="radio"
                    value={option.value}
                    className="sr-only"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </FieldShell>

        <FieldShell
          label="Iglesia o comunidad"
          required
          htmlFor="camp-church"
          error={churchFeedback.error}
          valid={churchFeedback.valid}
        >
          <input
            {...methods.register("churchName")}
            id="camp-church"
            aria-invalid={churchFeedback.invalid ? "true" : "false"}
            placeholder="Iglesia Cristiana Monte Sion"
            autoComplete="organization"
            className={getInputClasses(churchFeedback)}
          />
        </FieldShell>

        <FieldShell
          label="Ciudad de origen"
          required
          htmlFor="camp-city"
          error={cityFeedback.error}
          valid={cityFeedback.valid}
        >
          <input
            {...methods.register("city")}
            id="camp-city"
            aria-invalid={cityFeedback.invalid ? "true" : "false"}
            placeholder="Santa María Atzompa, Oaxaca"
            autoComplete="address-level2"
            className={getInputClasses(cityFeedback)}
          />
        </FieldShell>
      </div>

      <div className="grid gap-4">
        <FieldShell
          label="¿Necesitas transporte?"
          required
          error={needsTransportFeedback.error}
          valid={needsTransportFeedback.valid}
        >
          <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="¿Necesitas transporte?">
            {[
              { value: true, label: "Sí" },
              { value: false, label: "No" },
            ].map((option) => {
              const selected = methods.watch("needsTransport") === option.value;

              return (
                <label
                  key={String(option.value)}
                  className={`flex cursor-pointer items-center justify-start rounded-xl px-4 py-3 text-sm font-medium transition ${
                    selected
                      ? "bg-primary/12 text-foreground ring-1 ring-primary/20"
                      : "bg-background/70 text-muted-foreground hover:bg-background"
                  }`}
                >
                  <input
                    type="radio"
                    checked={selected}
                    onChange={() =>
                      methods.setValue("needsTransport", option.value, {
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }
                    className="sr-only"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </FieldShell>

        <FieldShell
          label="¿Te interesa bautizarte?"
          required
          error={baptismFeedback.error}
          valid={baptismFeedback.valid}
        >
          <div className="grid grid-cols-1 gap-2" role="radiogroup" aria-label="¿Te interesa bautizarte?">
            {[
              { value: true, label: "Sí" },
              { value: false, label: "No" },
            ].map((option) => {
              const selected = methods.watch("interestedInBaptism") === option.value;

              return (
                <label
                  key={String(option.value)}
                  className={`flex cursor-pointer items-center justify-start rounded-xl px-4 py-3 text-sm font-medium transition ${
                    selected
                      ? "bg-primary/12 text-foreground ring-1 ring-primary/20"
                      : "bg-background/70 text-muted-foreground hover:bg-background"
                  }`}
                >
                  <input
                    type="radio"
                    checked={selected}
                    onChange={() =>
                      methods.setValue("interestedInBaptism", option.value, {
                        shouldTouch: true,
                        shouldValidate: true,
                      })
                    }
                    className="sr-only"
                  />
                  {option.label}
                </label>
              );
            })}
          </div>
        </FieldShell>
      </div>
    </div>
  );
}
