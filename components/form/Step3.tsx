"use client";

import { UploadCloud } from "lucide-react";
import { useFormContext } from "react-hook-form";
import {
  guardianRelationships,
  type CampRegistrationFormValues,
} from "@/lib/camp/types";
import { humanFileSize } from "@/lib/camp/utils";
import FieldShell from "@/components/form/FieldShell";
import {
  getFieldFeedback,
  getInputClasses,
} from "@/components/form/form-utils";
import SignaturePad from "@/components/form/SignaturePad";

export default function Step3() {
  const methods = useFormContext<CampRegistrationFormValues>();
  const guardianFile = methods.watch("guardianIdFile");

  const guardianNameFeedback = getFieldFeedback(methods, "guardianName");
  const guardianRelationshipFeedback = getFieldFeedback(
    methods,
    "guardianRelationship",
  );
  const guardianCurpFeedback = getFieldFeedback(methods, "guardianCurp");
  const guardianPhoneFeedback = getFieldFeedback(methods, "guardianPhone");
  const guardianEmailFeedback = getFieldFeedback(methods, "guardianEmail");
  const signatureFeedback = getFieldFeedback(
    methods,
    "guardianSignatureDataUrl",
  );
  const fileFeedback = getFieldFeedback(methods, "guardianIdFile");

  return (
    <div className="space-y-6">
      <div className="rounded-[1.25rem] bg-primary/10 p-5">
        <p className="text-xs font-semibold text-primary">
          Carta responsiva requerida
        </p>
        <h3 className="mt-3 text-2xl font-semibold text-foreground">
          El asistente es menor de edad
        </h3>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
          Captura los datos del tutor legal, su firma digital y una
          identificación oficial vigente. El PDF final se generará
          automáticamente al concluir el registro.
        </p>
      </div>

      <div className="grid gap-4">
        <FieldShell
          label="Nombre del tutor"
          required
          htmlFor="guardian-name"
          error={guardianNameFeedback.error}
          valid={guardianNameFeedback.valid}
        >
          <input
            {...methods.register("guardianName")}
            id="guardian-name"
            aria-invalid={guardianNameFeedback.invalid ? "true" : "false"}
            placeholder="Como aparece en la identificación"
            autoComplete="section-guardian name"
            className={getInputClasses(guardianNameFeedback)}
          />
        </FieldShell>

        <FieldShell
          label="Parentesco"
          required
          htmlFor="guardian-relationship"
          error={guardianRelationshipFeedback.error}
          valid={guardianRelationshipFeedback.valid}
        >
          <select
            {...methods.register("guardianRelationship")}
            id="guardian-relationship"
            aria-invalid={guardianRelationshipFeedback.invalid ? "true" : "false"}
            className={getInputClasses(guardianRelationshipFeedback)}
          >
            <option value="" className="bg-background text-foreground">
              Selecciona una opción
            </option>
            {guardianRelationships.map((relationship) => (
              <option
                key={relationship}
                value={relationship}
                className="bg-background text-foreground"
              >
                {relationship}
              </option>
            ))}
          </select>
        </FieldShell>

        <FieldShell
          label="CURP del tutor"
          required
          htmlFor="guardian-curp"
          error={guardianCurpFeedback.error}
          valid={guardianCurpFeedback.valid}
        >
          <input
            {...methods.register("guardianCurp", {
              onChange: (event) => {
                methods.setValue(
                  "guardianCurp",
                  event.target.value.toUpperCase(),
                  {
                    shouldValidate: true,
                    shouldTouch: true,
                  },
                );
              },
            })}
            id="guardian-curp"
            aria-invalid={guardianCurpFeedback.invalid ? "true" : "false"}
            placeholder="PEGA750101MOCRRL08"
            maxLength={18}
            autoComplete="off"
            className={getInputClasses(guardianCurpFeedback)}
          />
        </FieldShell>

        <FieldShell
          label="Teléfono del tutor"
          required
          htmlFor="guardian-phone"
          error={guardianPhoneFeedback.error}
          valid={guardianPhoneFeedback.valid}
        >
          <input
            {...methods.register("guardianPhone")}
            id="guardian-phone"
            aria-invalid={guardianPhoneFeedback.invalid ? "true" : "false"}
            inputMode="tel"
            placeholder="951 234 5678"
            autoComplete="section-guardian tel"
            className={getInputClasses(guardianPhoneFeedback)}
          />
        </FieldShell>

        <FieldShell
          label="Correo del tutor"
          required
          htmlFor="guardian-email"
          error={guardianEmailFeedback.error}
          valid={guardianEmailFeedback.valid}
        >
          <input
            {...methods.register("guardianEmail")}
            id="guardian-email"
            aria-invalid={guardianEmailFeedback.invalid ? "true" : "false"}
            type="email"
            placeholder="tutor@email.com"
            autoComplete="section-guardian email"
            className={getInputClasses(guardianEmailFeedback)}
          />
        </FieldShell>
      </div>

      <FieldShell
        label="Firma digital"
        required
        error={signatureFeedback.error}
        valid={signatureFeedback.valid}
      >
        <SignaturePad
          value={methods.watch("guardianSignatureDataUrl")}
          onChange={(value) =>
            methods.setValue("guardianSignatureDataUrl", value, {
              shouldTouch: true,
              shouldValidate: true,
            })
          }
          error={signatureFeedback.error}
        />
      </FieldShell>

      <FieldShell
        label="Identificación oficial"
        required
        hint="Acepta imagen o PDF, máximo 5 MB."
        error={fileFeedback.error}
        valid={fileFeedback.valid}
      >
        <label
          htmlFor="guardian-id-file"
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[1.5rem] px-6 py-10 text-center transition ${
            fileFeedback.error
              ? "bg-destructive/10 ring-1 ring-destructive/40"
              : "bg-background/75 ring-1 ring-black/5 hover:bg-background"
          }`}
        >
          <UploadCloud className="h-8 w-8 text-primary" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-foreground">
              Haz clic para adjuntar la identificación del tutor
            </p>
            <p className="text-xs text-muted-foreground">
              INE, pasaporte o documento oficial legible
            </p>
          </div>
          <input
            id="guardian-id-file"
            type="file"
            accept=".pdf,image/*"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              methods.setValue("guardianIdFile", file, {
                shouldTouch: true,
                shouldValidate: true,
              });
            }}
          />
        </label>

        {guardianFile ? (
          <div className="mt-4 rounded-2xl bg-primary/10 px-4 py-3">
            <p className="text-sm font-medium text-foreground">
              {guardianFile.name}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {humanFileSize(guardianFile.size)}
            </p>
          </div>
        ) : null}
      </FieldShell>
    </div>
  );
}
