"use client";

import { useEffect, useReducer, useRef } from "react";
import { FormProvider } from "react-hook-form";
import { useCampRegistration } from "@/hooks/useCampRegistration";
import Step1 from "@/components/form/Step1";
import Step2 from "@/components/form/Step2";
import Success from "@/components/form/Success";
import type { CampRegistrationFormValues, CampStepId } from "@/lib/camp/types";

const CAMP_DRAFT_KEY = "camp-registration-draft-v1";

type CampRegistrationDraft = {
  values: Partial<CampRegistrationFormValues>;
  currentStep: CampStepId;
  updatedAt: string;
};

const isCampRegistrationDraft = (
  value: unknown,
): value is CampRegistrationDraft => {
  if (!value || typeof value !== "object") {
    return false;
  }

  const draft = value as CampRegistrationDraft;

  return (
    draft.values !== null &&
    typeof draft.values === "object" &&
    typeof draft.updatedAt === "string" &&
    typeof draft.currentStep === "string"
  );
};

type MultiStepFormProps = {
  initialValues?: Partial<CampRegistrationFormValues>;
};

export default function MultiStepForm({
  initialValues,
}: MultiStepFormProps): React.JSX.Element {
  const {
    methods,
    submit,
    result,
    isSubmitting,
    serverError,
    resetFlow,
  } = useCampRegistration(initialValues);
  const [draftStatus, dispatchDraftStatus] = useReducer(
    (_state: "idle" | "restored" | "failed", action: "idle" | "restored" | "failed") => action,
    "idle",
  );
  const hasHydratedDraftRef = useRef(false);

  function persistDraft(values: Partial<CampRegistrationFormValues>) {
    const draft: CampRegistrationDraft = {
      values,
      currentStep: "personal",
      updatedAt: new Date().toISOString(),
    };

    window.localStorage.setItem(CAMP_DRAFT_KEY, JSON.stringify(draft));
  }

  function clearDraft() {
    window.localStorage.removeItem(CAMP_DRAFT_KEY);
  }

  useEffect(() => {
    if (hasHydratedDraftRef.current) {
      return;
    }

    hasHydratedDraftRef.current = true;

    try {
      const rawDraft = window.localStorage.getItem(CAMP_DRAFT_KEY);

      if (!rawDraft) {
        return;
      }

      const parsedDraft = JSON.parse(rawDraft) as unknown;

      if (!isCampRegistrationDraft(parsedDraft)) {
        clearDraft();
        return;
      }

      methods.reset({
        ...methods.getValues(),
        ...parsedDraft.values,
      });
      dispatchDraftStatus("restored");
    } catch {
      dispatchDraftStatus("failed");
    }
  }, [methods]);

  useEffect(() => {
    const subscription = methods.watch((values) => {
      try {
        persistDraft(values);
      } catch {
        dispatchDraftStatus("failed");
      }
    });

    return () => subscription.unsubscribe();
  }, [methods]);

  useEffect(() => {
    if (!result) {
      return;
    }

    clearDraft();
    dispatchDraftStatus("idle");
  }, [result]);

  function handleResetFlow() {
    clearDraft();
    resetFlow();
    dispatchDraftStatus("idle");
  }

  return (
    <section
      id="registro"
      className="space-y-6 rounded-[2rem] border border-white/10 bg-[#0f0f10] p-5 text-foreground shadow-2xl md:p-6"
    >
      <div className="space-y-6">
        {result ? (
          <Success result={result} onReset={handleResetFlow} />
        ) : (
          <FormProvider {...methods}>
            <>
              <form onSubmit={submit} className="space-y-5">
                <header className="space-y-3 rounded-2xl bg-[#151516] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary/80">
                    Registro Campamento Monte Sion
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold text-foreground md:text-3xl">
                    Formulario de registro
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Completa tu registro en un solo formulario, sin pasos extra.
                  </p>
                </header>

                <section className="space-y-4 rounded-[1.5rem] bg-[#151516] p-4 md:p-5">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">Datos personales</h3>
                    <p className="text-sm text-muted-foreground">Te tomará menos de 1 minuto completar este registro.</p>
                  </div>
                  <Step1 />
                </section>

                <section className="space-y-4 rounded-[1.5rem] bg-[#151516] p-4 md:p-5">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">Contacto</h3>
                    <p className="text-sm text-muted-foreground">Solo usaremos esta información para comunicarnos contigo.</p>
                  </div>
                  <Step2 />
                </section>

                <label className="flex items-start gap-3 rounded-[1.25rem] bg-[#151516] p-4">
                  <input
                    {...methods.register("termsAccepted")}
                    type="checkbox"
                    className="mt-1 h-4 w-4 rounded border border-white/20 bg-transparent text-primary"
                  />
                  <span className="text-sm leading-6 text-muted-foreground">
                    Confirmo que los datos son verídicos y acepto las reglas generales del campamento.
                  </span>
                </label>

                {methods.formState.errors.termsAccepted ? (
                  <p className="text-sm text-destructive">
                    {methods.formState.errors.termsAccepted.message}
                  </p>
                ) : null}

                {serverError ? (
                  <div className="rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
                    {serverError}
                  </div>
                ) : null}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex w-full items-center justify-center rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    {isSubmitting ? "Confirmando..." : "Confirmar registro"}
                  </button>
                </div>

                {draftStatus === "restored" ? (
                  <p className="text-center text-xs text-muted-foreground">
                    Recuperamos tu borrador guardado.
                  </p>
                ) : null}

                {draftStatus === "failed" ? (
                  <p className="text-center text-xs text-muted-foreground">
                    No se pudo guardar el borrador en este navegador.
                  </p>
                ) : null}
              </form>
            </>
          </FormProvider>
        )}
      </div>
    </section>
  );
}
