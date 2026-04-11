"use client";

import { useFormContext } from "react-hook-form";
import type { CampRegistrationFormValues } from "@/lib/camp/types";
import FieldShell from "@/components/form/FieldShell";
import {
  getFieldFeedback,
  getInputClasses,
} from "@/components/form/form-utils";

export default function Step1() {
  const methods = useFormContext<CampRegistrationFormValues>();

  const firstNameFeedback = getFieldFeedback(methods, "firstName");
  const lastNameFeedback = getFieldFeedback(methods, "lastName");
  const churchFeedback = getFieldFeedback(methods, "churchName");
  const needsTransportFeedback = getFieldFeedback(methods, "needsTransport");
  const baptismFeedback = getFieldFeedback(methods, "interestedInBaptism");

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
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

      </div>

      <div className="grid gap-3">
        <FieldShell
          label="Iglesia"
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
      </div>

      <div className="grid gap-3 md:grid-cols-2">
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
                  className={`flex cursor-pointer items-center justify-start rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    selected
                      ? "bg-primary/10 text-foreground ring-1 ring-primary/15"
                      : "bg-background/60 text-muted-foreground hover:bg-background"
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
                  className={`flex cursor-pointer items-center justify-start rounded-xl px-3.5 py-2.5 text-sm font-medium transition ${
                    selected
                      ? "bg-primary/10 text-foreground ring-1 ring-primary/15"
                      : "bg-background/60 text-muted-foreground hover:bg-background"
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
