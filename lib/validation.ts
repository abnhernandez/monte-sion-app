import { z } from "zod";
import { guardianIdMaxFileSize } from "@/lib/camp/constants";
import {
  campAttendanceOptions,
  campRoles,
  guardianRelationships,
  legalGenderOptions,
  type CampRegistrationFormValues,
} from "@/lib/camp/types";
import {
  getAgeFromBirthDate,
  isValidMexicanPhone,
  validateMexicanCurp,
} from "@/lib/camp/utils";

const isFileValue = (value: unknown): value is File =>
  typeof File !== "undefined" && value instanceof File;

const fileSchema = z.custom<File | null>(
  (value) => value === null || value === undefined || isFileValue(value),
  {
    message: "Adjunta una identificacion oficial.",
  }
);

export const campRegistrationSchema: z.ZodType<CampRegistrationFormValues> = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "Ingresa el nombre del asistente."),
    lastName: z
      .string()
      .trim()
      .min(2, "Ingresa los apellidos del asistente."),
    birthDate: z.string().min(1, "Selecciona la fecha de nacimiento."),
    curp: z.string().trim(),
    gender: z.union([z.literal(""), z.enum(legalGenderOptions)]),
    attendanceConfirmation: z.union([
      z.literal(""),
      z.enum(campAttendanceOptions),
    ]),
    needsTransport: z.union([z.boolean(), z.null()]),
    interestedInBaptism: z.union([z.boolean(), z.null()]),
    churchName: z
      .string()
      .trim()
      .min(3, "Indica la iglesia o comunidad del asistente."),
    city: z
      .string()
      .trim()
      .min(3, "Indica la ciudad o lugar de procedencia."),
    campRole: z.union([z.literal(""), z.enum(campRoles)]),
    hasAllergies: z.union([z.boolean(), z.null()]),
    allergiesDetails: z.string().trim(),
    email: z
      .string()
      .trim()
      .email("Ingresa un correo electronico valido."),
    phone: z
      .string()
      .trim()
      .refine(isValidMexicanPhone, "Ingresa un telefono mexicano de 10 digitos."),
    emergencyName: z.string().trim(),
    emergencyPhone: z.string().trim(),
    emergencyRelationship: z.string().trim(),
    emergencyAddress: z.string().trim(),
    guardianName: z.string().trim(),
    guardianRelationship: z.union([
      z.literal(""),
      z.enum(guardianRelationships),
    ]),
    guardianCurp: z.string().trim(),
    guardianPhone: z.string().trim(),
    guardianEmail: z.string().trim(),
    guardianSignatureDataUrl: z.string(),
    guardianIdFile: fileSchema,
    termsAccepted: z.boolean(),
  })
  .superRefine((data, context) => {
    const age = getAgeFromBirthDate(data.birthDate);

    if (age === null || age < 5 || age > 99) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["birthDate"],
        message: "Ingresa una fecha de nacimiento valida.",
      });
    }

    if (!data.gender) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["gender"],
        message: "Selecciona el sexo legal del asistente.",
      });
    }

    const attendsCamp = data.attendanceConfirmation !== "no";

    if (attendsCamp && data.needsTransport === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["needsTransport"],
        message: "Indica si necesitas transporte.",
      });
    }

    if (attendsCamp && data.interestedInBaptism === null) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["interestedInBaptism"],
        message: "Indica si te interesa bautizarte.",
      });
    }

    if (data.curp && !validateMexicanCurp(data.curp)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["curp"],
        message: "Si capturas CURP, debe ser valida.",
      });
    }

    if (!data.termsAccepted) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["termsAccepted"],
        message: "Debes aceptar los terminos para completar el registro.",
      });
    }

    if (isFileValue(data.guardianIdFile) && data.guardianIdFile.size > guardianIdMaxFileSize) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["guardianIdFile"],
        message: "La identificacion no puede exceder 5 MB.",
      });
    }
  });

export const formSchema = campRegistrationSchema;

export function parseCampRegistrationFormData(
  formData: FormData
): CampRegistrationFormValues {
  const getString = (key: keyof CampRegistrationFormValues) =>
    String(formData.get(key) ?? "");

  const guardianId = formData.get("guardianIdFile");

  return {
    firstName: getString("firstName"),
    lastName: getString("lastName"),
    birthDate: getString("birthDate"),
    curp: getString("curp"),
    gender: getString("gender") as CampRegistrationFormValues["gender"],
    attendanceConfirmation: getString(
      "attendanceConfirmation"
    ) as CampRegistrationFormValues["attendanceConfirmation"],
    needsTransport:
      getString("needsTransport") === ""
        ? null
        : getString("needsTransport") === "true",
    interestedInBaptism:
      getString("interestedInBaptism") === ""
        ? null
        : getString("interestedInBaptism") === "true",
    churchName: getString("churchName"),
    city: getString("city"),
    campRole: getString("campRole") as CampRegistrationFormValues["campRole"],
    hasAllergies:
      getString("hasAllergies") === ""
        ? null
        : getString("hasAllergies") === "true",
    allergiesDetails: getString("allergiesDetails"),
    email: getString("email"),
    phone: getString("phone"),
    emergencyName: getString("emergencyName"),
    emergencyPhone: getString("emergencyPhone"),
    emergencyRelationship: getString("emergencyRelationship"),
    emergencyAddress: getString("emergencyAddress"),
    guardianName: getString("guardianName"),
    guardianRelationship:
      getString("guardianRelationship") as CampRegistrationFormValues["guardianRelationship"],
    guardianCurp: getString("guardianCurp"),
    guardianPhone: getString("guardianPhone"),
    guardianEmail: getString("guardianEmail"),
    guardianSignatureDataUrl: getString("guardianSignatureDataUrl"),
    guardianIdFile: guardianId instanceof File && guardianId.size > 0 ? guardianId : null,
    termsAccepted: getString("termsAccepted") === "true",
  };
}
