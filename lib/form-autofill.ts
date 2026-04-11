import type { AccountProfile } from "@/lib/account";
import type { CampRegistrationFormValues } from "@/lib/camp/types";

type PrayerRequestAutofill = {
  nombre: string;
  email: string;
  telefono: string;
};

function splitFullName(name: string) {
  const parts = name.replace(/\s+/g, " ").trim().split(" ").filter(Boolean);

  if (parts.length === 0) {
    return { firstName: "", lastName: "" };
  }

  if (parts.length === 1) {
    return { firstName: parts[0], lastName: "" };
  }

  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}

export function countAutofillEntries(values: Record<string, unknown>) {
  return Object.values(values).filter((value) => {
    if (typeof value === "boolean") {
      return value;
    }

    return String(value ?? "").trim().length > 0;
  }).length;
}

export function buildCampRegistrationAutofill(
  profile: AccountProfile | null,
): Partial<CampRegistrationFormValues> {
  if (!profile?.autofill.enabled) {
    return {};
  }

  const { firstName, lastName } = splitFullName(profile.name);

  return {
    firstName,
    lastName,
    phone: profile.phone ?? "",
    churchName: profile.autofill.churchName,
    campRole: profile.autofill.campRole,
    emergencyName: profile.autofill.emergencyName,
    emergencyPhone: profile.autofill.emergencyPhone,
    emergencyRelationship: profile.autofill.emergencyRelationship,
    emergencyAddress: profile.autofill.emergencyAddress,
    guardianName: profile.autofill.guardianName,
    guardianRelationship: profile.autofill.guardianRelationship,
    guardianPhone: profile.autofill.guardianPhone,
    guardianEmail: profile.autofill.guardianEmail,
  };
}

export function buildPrayerRequestAutofill(
  profile: AccountProfile | null,
): PrayerRequestAutofill {
  if (!profile?.autofill.enabled) {
    return {
      nombre: "",
      email: "",
      telefono: "",
    };
  }

  return {
    nombre: profile.name,
    email: profile.email ?? "",
    telefono: profile.phone ?? "",
  };
}
