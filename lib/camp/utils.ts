import type {
  CampRegistrationFormValues,
  CampRegistrationPayload,
  CampRegistrationRecord,
  CampRole,
  LegalGender,
} from "@/lib/camp/types";
import { CAMP_EVENT } from "@/lib/camp/constants";

const CURP_REGEX =
  /^[A-Z][AEIOUX][A-Z]{2}\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])[HM](AS|BC|BS|CC|CL|CM|CS|CH|DF|DG|GT|GR|HG|JC|MC|MN|MS|NE|NL|NT|OC|PL|QT|QR|SP|SL|SR|TC|TS|TL|VZ|YN|ZS)[B-DF-HJ-NP-TV-Z]{3}[A-Z0-9]\d$/;
const CURP_DICTIONARY = "0123456789ABCDEFGHIJKLMNÑOPQRSTUVWXYZ";

export function normalizeWhitespace(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

export function normalizeCurp(value: string) {
  return value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
}

export function normalizeMexicanPhone(value: string) {
  let digits = value.replace(/\D/g, "");

  if (digits.startsWith("521") && digits.length === 13) {
    digits = digits.slice(3);
  } else if (digits.startsWith("52") && digits.length === 12) {
    digits = digits.slice(2);
  }

  return digits.slice(-10);
}

export function isValidMexicanPhone(value: string) {
  return /^\d{10}$/.test(normalizeMexicanPhone(value));
}

export function formatPhoneForDisplay(value: string) {
  const digits = normalizeMexicanPhone(value);

  if (digits.length !== 10) {
    return value;
  }

  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function extractBirthDateFromCurp(curpValue: string) {
  const curp = normalizeCurp(curpValue);

  if (!CURP_REGEX.test(curp)) {
    return null;
  }

  const year = Number(curp.slice(4, 6));
  const month = Number(curp.slice(6, 8));
  const day = Number(curp.slice(8, 10));
  const discriminator = curp[16];
  const fullYear = /\d/.test(discriminator) ? 1900 + year : 2000 + year;
  const iso = `${String(fullYear).padStart(4, "0")}-${String(month).padStart(
    2,
    "0"
  )}-${String(day).padStart(2, "0")}`;
  const date = new Date(`${iso}T12:00:00`);

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== fullYear ||
    date.getUTCMonth() + 1 !== month ||
    date.getUTCDate() !== day
  ) {
    return null;
  }

  return iso;
}

function getCurpVerifier(curpWithoutDigit: string) {
  let total = 0;

  for (let index = 0; index < 17; index += 1) {
    const char = curpWithoutDigit[index] ?? "";
    const dictionaryIndex = CURP_DICTIONARY.indexOf(char);

    if (dictionaryIndex === -1) {
      return null;
    }

    total += dictionaryIndex * (18 - index);
  }

  return String((10 - (total % 10)) % 10);
}

export function validateMexicanCurp(value: string) {
  const curp = normalizeCurp(value);

  if (!CURP_REGEX.test(curp)) {
    return false;
  }

  const verifier = getCurpVerifier(curp.slice(0, 17));

  return Boolean(verifier && verifier === curp[17]);
}

export function birthDateMatchesCurp(curpValue: string, birthDate: string) {
  const birthDateFromCurp = extractBirthDateFromCurp(curpValue);

  return birthDateFromCurp === birthDate;
}

export function getAgeFromBirthDate(birthDate: string) {
  if (!birthDate) {
    return null;
  }

  const date = new Date(`${birthDate}T12:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const monthDelta = today.getMonth() - date.getMonth();

  if (
    monthDelta < 0 ||
    (monthDelta === 0 && today.getDate() < date.getDate())
  ) {
    age -= 1;
  }

  return age;
}

export function isMinorFromBirthDate(birthDate: string) {
  const age = getAgeFromBirthDate(birthDate);

  return age !== null && age < 18;
}

export function buildFullName(firstName: string, lastName: string) {
  return normalizeWhitespace(`${firstName} ${lastName}`);
}

export function formatRoleLabel(role: CampRole) {
  const labels: Record<CampRole, string> = {
    participant: "Asistente",
    leader: "Lider",
    server: "Servidor",
    guest: "Invitado",
  };

  return labels[role];
}

export function formatGenderLabel(gender: LegalGender) {
  return gender === "H" ? "Hombre" : "Mujer";
}

export function formatHumanDate(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "long",
  }).format(new Date(value));
}

export function formatHumanDateTime(value: string) {
  return new Intl.DateTimeFormat("es-MX", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function buildBaseAppUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(
    /\/$/,
    ""
  );
}

export function buildTicketUrl(ticketId: string) {
  return `${buildBaseAppUrl()}/camp/ticket/${ticketId}`;
}

export function buildResponsivaUrl(ticketId: string) {
  return `${buildBaseAppUrl()}/api/camp/responsiva/${ticketId}`;
}

export function generateTicketId() {
  const entropy = crypto.randomUUID().replace(/-/g, "").slice(0, 10).toUpperCase();
  return `CMS26-${entropy}`;
}

export function extractTicketIdFromQrPayload(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const directMatch = trimmed.match(/CMS26-[A-Z0-9]+/i);

  if (directMatch) {
    return directMatch[0].toUpperCase();
  }

  try {
    const url = new URL(trimmed);
    const segment = url.pathname.split("/").filter(Boolean).at(-1);

    if (segment?.toUpperCase().startsWith("CMS26-")) {
      return segment.toUpperCase();
    }

    const ticketId = url.searchParams.get("ticketId");

    if (ticketId?.toUpperCase().startsWith("CMS26-")) {
      return ticketId.toUpperCase();
    }
  } catch {
    return null;
  }

  return null;
}

export function humanFileSize(size: number) {
  if (size < 1024) {
    return `${size} B`;
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function normalizeCampRegistration(
  values: CampRegistrationFormValues
): CampRegistrationPayload {
  const age = getAgeFromBirthDate(values.birthDate) ?? 0;
  const isMinor = age < 18;

  return {
    ...values,
    firstName: normalizeWhitespace(values.firstName),
    lastName: normalizeWhitespace(values.lastName),
    curp: normalizeCurp(values.curp),
    gender: values.gender as CampRegistrationPayload["gender"],
    attendanceConfirmation:
      values.attendanceConfirmation as CampRegistrationPayload["attendanceConfirmation"],
    needsTransport: Boolean(values.needsTransport),
    interestedInBaptism: Boolean(values.interestedInBaptism),
    churchName: normalizeWhitespace(values.churchName),
    city: normalizeWhitespace(values.city),
    campRole: values.campRole as CampRegistrationPayload["campRole"],
    hasAllergies: values.hasAllergies === true,
    allergiesDetails: values.hasAllergies
      ? normalizeWhitespace(values.allergiesDetails)
      : "",
    email: values.email.trim().toLowerCase(),
    phone: normalizeMexicanPhone(values.phone),
    emergencyName: normalizeWhitespace(values.emergencyName),
    emergencyPhone: normalizeMexicanPhone(values.emergencyPhone),
    emergencyRelationship: normalizeWhitespace(values.emergencyRelationship),
    emergencyAddress: normalizeWhitespace(values.emergencyAddress),
    guardianName: isMinor ? normalizeWhitespace(values.guardianName) : "",
    guardianRelationship: isMinor ? values.guardianRelationship : "",
    guardianCurp: isMinor ? normalizeCurp(values.guardianCurp) : "",
    guardianPhone: isMinor ? normalizeMexicanPhone(values.guardianPhone) : "",
    guardianEmail: isMinor ? values.guardianEmail.trim().toLowerCase() : "",
    guardianSignatureDataUrl: isMinor ? values.guardianSignatureDataUrl : "",
    guardianIdFile: isMinor ? values.guardianIdFile : null,
    age,
    isMinor,
  };
}

export function summarizeRegistrationForSearch(
  registration: CampRegistrationRecord
) {
  return [
    registration.ticketId,
    buildFullName(registration.firstName, registration.lastName),
    registration.email,
    registration.phone,
    registration.churchName,
    registration.city,
  ]
    .join(" ")
    .toLowerCase();
}

export function buildCampMetaDescription() {
  return `${CAMP_EVENT.fullTitle}. Registro digital, ticket QR, carta responsiva y check-in para ${CAMP_EVENT.organizer}.`;
}
