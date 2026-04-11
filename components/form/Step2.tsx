"use client";

import { useEffect } from "react";
import { useFormContext } from "react-hook-form";
import type { CampRegistrationFormValues } from "@/lib/camp/types";
import { formatPhoneForDisplay } from "@/lib/camp/utils";
import FieldShell from "@/components/form/FieldShell";
import {
  getFieldFeedback,
  getInputClasses,
} from "@/components/form/form-utils";

export default function Step2() {
  const methods = useFormContext<CampRegistrationFormValues>();

  const phoneFeedback = getFieldFeedback(methods, "phone");
  const firstName = methods.watch("firstName");
  const lastName = methods.watch("lastName");
  const phone = methods.watch("phone");

  useEffect(() => {
    const fullName = `${firstName} ${lastName}`.trim();

    methods.setValue("emergencyName", fullName || "No especificado", {
      shouldTouch: false,
      shouldValidate: false,
    });
    methods.setValue("emergencyPhone", phone || "0000000000", {
      shouldTouch: false,
      shouldValidate: false,
    });
    methods.setValue("emergencyRelationship", "Familiar", {
      shouldTouch: false,
      shouldValidate: false,
    });
    methods.setValue("emergencyAddress", "No especificada", {
      shouldTouch: false,
      shouldValidate: false,
    });
  }, [firstName, lastName, methods, phone]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        <FieldShell
          label="Número de contacto"
          required
          htmlFor="camp-phone"
          hint={`Formato esperado: ${formatPhoneForDisplay("9511234567")}`}
          error={phoneFeedback.error}
          valid={phoneFeedback.valid}
        >
          <input
            {...methods.register("phone")}
            id="camp-phone"
            aria-invalid={phoneFeedback.invalid ? "true" : "false"}
            inputMode="tel"
            placeholder="951 123 4567"
            autoComplete="tel"
            className={getInputClasses(phoneFeedback)}
          />
        </FieldShell>

        <p className="rounded-xl bg-muted/15 px-3.5 py-2.5 text-sm leading-5 text-muted-foreground ring-1 ring-black/5">
          Se genera el contacto de emergencia.
        </p>
      </div>
    </div>
  );
}
