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
      className="text-foreground"
    >
      <div className="py-2 md:py-3">
        {result ? (
          <Success result={result} onReset={handleResetFlow} />
        ) : (
          <FormProvider {...methods}>
            <>
              <form onSubmit={submit} className="space-y-3">
                <section className="space-y-3">
                  <Step1 />
                </section>

                <section className="space-y-3">
                  <Step2 />
                </section>

                <label className="flex items-start gap-3 rounded-xl bg-white/[0.03] p-3">
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
                  <div className="rounded-xl bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive">
                    {serverError}
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex flex-1 items-center justify-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-45"
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
