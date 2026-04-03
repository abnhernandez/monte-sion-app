import { getSupabaseServer } from "@/lib/supabase-server";
import {
  campRoles,
  guardianRelationships,
  type CampRole,
  type GuardianRelationship,
} from "@/lib/camp/types";
import { canAccessBirthdays, getSafeAppRole, type AppRole } from "@/lib/roles";

type AccountBirthdayLink = {
  id: string;
  birthDate: string;
  ministryName: string;
} | null;

export type AccountAutofillPreferences = {
  enabled: boolean;
  churchName: string;
  city: string;
  campRole: CampRole;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  emergencyAddress: string;
  guardianName: string;
  guardianRelationship: GuardianRelationship | "";
  guardianPhone: string;
  guardianEmail: string;
};

export type AccountProfile = {
  id: string;
  name: string;
  bio: string;
  avatar_url: string | null;
  email: string | null;
  username: string | null;
  phone: string | null;
  role: AppRole;
  canAccessBirthdays: boolean;
  birthday: AccountBirthdayLink;
  autofill: AccountAutofillPreferences;
  created_at: string | null;
  updated_at: string | null;
};

function readMetadataString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function readMetadataNullableString(value: unknown) {
  const normalized = readMetadataString(value);
  return normalized || null;
}

function getSafeCampRole(value: unknown): CampRole {
  return campRoles.includes(value as CampRole)
    ? (value as CampRole)
    : "participant";
}

function getSafeGuardianRelationship(
  value: unknown,
): GuardianRelationship | "" {
  return guardianRelationships.includes(value as GuardianRelationship)
    ? (value as GuardianRelationship)
    : "";
}

export async function getAccount() {
  const supabase = await getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("id, name, bio, avatar_url, role, created_at, updated_at")
    .eq("id", user.id)
    .maybeSingle();

  const role = getSafeAppRole(data?.role);
  const { data: birthday } = await supabase
    .from("birthdays")
    .select("id, birth_date, ministry_name")
    .eq("profile_id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    name: data?.name ?? "",
    bio: data?.bio ?? "",
    avatar_url: data?.avatar_url ?? null,
    email: user.email ?? null,
    username: readMetadataNullableString(user.user_metadata?.username),
    phone:
      readMetadataNullableString(user.user_metadata?.phone) ??
      (typeof user.phone === "string" && user.phone.trim()
        ? user.phone.trim()
        : null),
    role,
    canAccessBirthdays: canAccessBirthdays(role),
    birthday: birthday
      ? {
          id: String(birthday.id),
          birthDate: String(birthday.birth_date),
          ministryName: String(birthday.ministry_name ?? ""),
        }
      : null,
    autofill: {
      enabled:
        typeof user.user_metadata?.autofillForms === "boolean"
          ? user.user_metadata.autofillForms
          : true,
      churchName: readMetadataString(user.user_metadata?.churchName),
      city: readMetadataString(user.user_metadata?.city),
      campRole: getSafeCampRole(user.user_metadata?.campRole),
      emergencyName: readMetadataString(user.user_metadata?.emergencyName),
      emergencyPhone: readMetadataString(user.user_metadata?.emergencyPhone),
      emergencyRelationship: readMetadataString(
        user.user_metadata?.emergencyRelationship,
      ),
      emergencyAddress: readMetadataString(
        user.user_metadata?.emergencyAddress,
      ),
      guardianName: readMetadataString(user.user_metadata?.guardianName),
      guardianRelationship: getSafeGuardianRelationship(
        user.user_metadata?.guardianRelationship,
      ),
      guardianPhone: readMetadataString(user.user_metadata?.guardianPhone),
      guardianEmail: readMetadataString(user.user_metadata?.guardianEmail),
    },
    created_at: data?.created_at ?? user.created_at ?? null,
    updated_at: data?.updated_at ?? user.updated_at ?? null,
  } satisfies AccountProfile;
}
