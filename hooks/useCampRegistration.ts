"use client";

import { useDeferredValue, useEffect, useState, useTransition } from "react";
import { useForm as useReactHookForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerCampParticipant } from "@/lib/camp-actions";
import { campRegistrationSchema } from "@/lib/validation";
import {
  campRegistrationDefaults,
  campStepDefinitions,
} from "@/lib/camp/constants";
import type {
  CampApiSuccess,
  CampRegistrationFormValues,
  CampStepId,
} from "@/lib/camp/types";

const stepFields: Record<
  CampStepId,
  Array<keyof CampRegistrationFormValues>
> = {
  personal: [
    "firstName",
    "lastName",
    "needsTransport",
    "interestedInBaptism",
    "churchName",
  ],
  contact: ["phone"],
  guardian: [],
  confirm: ["termsAccepted"],
};

function hasMeaningfulValue(value: unknown) {
  if (typeof value === "boolean") {
    return value;
  }

  if (value instanceof File) {
    return value.size > 0;
  }

  return String(value ?? "").trim().length > 0;
}

export function useCampRegistration(
  initialValues?: Partial<CampRegistrationFormValues>,
) {
  const [defaultValues] = useState<CampRegistrationFormValues>(() => ({
    ...campRegistrationDefaults,
    ...initialValues,
  }));

  const methods = useReactHookForm<CampRegistrationFormValues>({
    resolver: zodResolver(campRegistrationSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues,
  });
  const [currentStep, setCurrentStep] = useState<CampStepId>("personal");
  const [result, setResult] = useState<CampApiSuccess | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, startTransition] = useTransition();
  const [isSubmissionLocked, setIsSubmissionLocked] = useState(false);

  useWatch({
    control: methods.control,
  });

  const values = methods.getValues();
  const deferredValues = useDeferredValue(values);
  const isMinor = false;
  const activeStep = currentStep;
  const steps = campStepDefinitions;
  const currentIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeStep),
  );
  const progress = ((currentIndex + 1) / steps.length) * 100;

  useEffect(() => {
    if (!isMinor) {
      methods.clearErrors([
        "guardianName",
        "guardianRelationship",
        "guardianCurp",
        "guardianPhone",
        "guardianEmail",
        "guardianSignatureDataUrl",
        "guardianIdFile",
      ]);
    }
  }, [isMinor, methods]);

  useEffect(() => {
    if (!methods.getValues("attendanceConfirmation")) {
      methods.setValue("attendanceConfirmation", "yes", {
        shouldTouch: false,
        shouldValidate: false,
      });
    }

    if (!methods.getValues("campRole")) {
      methods.setValue("campRole", "participant", {
        shouldTouch: false,
        shouldValidate: false,
      });
    }

  }, [methods]);

  const currentStepFields = stepFields[activeStep].filter((field) => {
    if (field === "allergiesDetails") {
      return values.hasAllergies;
    }

    if (activeStep === "confirm") {
      return field === "termsAccepted";
    }

    return true;
  });

  const canContinue = currentStepFields.every((field) => {
    const fieldState = methods.getFieldState(field, methods.formState);
    const value = values[field];

    return hasMeaningfulValue(value) && !fieldState.invalid;
  });

  async function next() {
    const valid = await methods.trigger(currentStepFields, {
      shouldFocus: true,
    });

    if (!valid) {
      return;
    }

    const nextStep = steps[currentIndex + 1];

    if (nextStep) {
      setCurrentStep(nextStep.id);
    }
  }

  function back() {
    const previousStep = steps[currentIndex - 1];

    if (previousStep) {
      setCurrentStep(previousStep.id);
    }
  }

  function goToStep(step: CampStepId) {
    setCurrentStep(step);
  }

  const submit = methods.handleSubmit((submittedValues) => {
    if (isSubmissionLocked || isSubmitting) {
      return;
    }

    setIsSubmissionLocked(true);
    setServerError(null);

    startTransition(() => {
      void (async () => {
        const json = await registerCampParticipant(submittedValues);

        if (!json.success) {
          if ("issues" in json && json.issues) {
            for (const [fieldName, message] of Object.entries(json.issues)) {
              if (!message) {
                continue;
              }

              methods.setError(fieldName as keyof CampRegistrationFormValues, {
                type: "server",
                message,
              });
            }
          }

          setServerError(
            "message" in json
              ? json.message
              : "No se pudo completar el registro.",
          );
          return;
        }

        setResult(json);
      })().catch((error: unknown) => {
        setServerError(
          error instanceof Error
            ? error.message
            : "No se pudo completar el registro.",
        );
      }).finally(() => {
          setIsSubmissionLocked(false);
      });
    });
  });

  function resetFlow() {
      setIsSubmissionLocked(false);
    methods.reset(defaultValues);
    setCurrentStep("personal");
    setResult(null);
    setServerError(null);
  }

  return {
    methods,
    currentStep: activeStep,
    currentIndex,
    steps,
    progress,
    isMinor,
    deferredValues,
    canContinue,
    next,
    back,
    goToStep,
    submit,
    result,
    isSubmitting,
    serverError,
    resetFlow,
  };
}

export type UseCampRegistrationResult = ReturnType<typeof useCampRegistration>;
