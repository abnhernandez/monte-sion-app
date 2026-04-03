"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { campRoles, guardianRelationships } from "@/lib/camp/types";
import { getSupabaseServer } from "@/lib/supabase-server";

const MAX_USERNAME_LENGTH = 24;
const MAX_LOCATION_LENGTH = 80;
const MAX_RELATIONSHIP_LENGTH = 60;
const MAX_ADDRESS_LENGTH = 160;

function normalizePhone(value: string) {
  return value.replace(/\D/g, "");
}

const usernameSchema = z
  .string()
  .trim()
  .max(
    MAX_USERNAME_LENGTH,
    `Tu username debe tener ${MAX_USERNAME_LENGTH} caracteres o menos.`,
  )
  .regex(
    /^[a-zA-Z0-9._-]*$/,
    "Tu username solo puede usar letras, numeros, punto, guion o guion bajo.",
  )
  .refine(
    (value) => value.length === 0 || value.length >= 3,
    "Tu username debe tener al menos 3 caracteres.",
  );

const optionalPhoneSchema = z
  .string()
  .trim()
  .transform((value) => normalizePhone(value))
  .refine(
    (value) => value.length === 0 || value.length === 10,
    "Ingresa un telefono mexicano de 10 digitos.",
  );

const optionalEmailSchema = z
  .string()
  .trim()
  .transform((value) => value.toLowerCase())
  .refine(
    (value) =>
      value.length === 0 || z.string().email().safeParse(value).success,
    "Ingresa un correo valido para el contacto.",
  );

const accountSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Tu nombre debe tener al menos 2 caracteres.")
    .max(60, "Tu nombre debe tener 60 caracteres o menos."),
  bio: z
    .string()
    .max(140, "Tu descripción debe tener 140 caracteres o menos.")
    .optional()
    .transform((value) => value?.trim() ?? ""),
  avatar_url: z
    .string()
    .url("La imagen de perfil no es válida.")
    .nullable()
    .optional(),
  username: usernameSchema,
  phone: optionalPhoneSchema,
  autofillForms: z.boolean(),
  churchName: z
    .string()
    .trim()
    .max(
      MAX_LOCATION_LENGTH,
      `La iglesia o comunidad debe tener ${MAX_LOCATION_LENGTH} caracteres o menos.`,
    ),
  city: z
    .string()
    .trim()
    .max(
      MAX_LOCATION_LENGTH,
      `La ciudad debe tener ${MAX_LOCATION_LENGTH} caracteres o menos.`,
    ),
  campRole: z.enum(campRoles),
  emergencyName: z
    .string()
    .trim()
    .max(
      MAX_LOCATION_LENGTH,
      `El contacto de emergencia debe tener ${MAX_LOCATION_LENGTH} caracteres o menos.`,
    ),
  emergencyPhone: optionalPhoneSchema,
  emergencyRelationship: z
    .string()
    .trim()
    .max(
      MAX_RELATIONSHIP_LENGTH,
      `La relación debe tener ${MAX_RELATIONSHIP_LENGTH} caracteres o menos.`,
    ),
  emergencyAddress: z
    .string()
    .trim()
    .max(
      MAX_ADDRESS_LENGTH,
      `La dirección debe tener ${MAX_ADDRESS_LENGTH} caracteres o menos.`,
    ),
  guardianName: z
    .string()
    .trim()
    .max(
      MAX_LOCATION_LENGTH,
      `El nombre del tutor debe tener ${MAX_LOCATION_LENGTH} caracteres o menos.`,
    ),
  guardianRelationship: z.union([z.literal(""), z.enum(guardianRelationships)]),
  guardianPhone: optionalPhoneSchema,
  guardianEmail: optionalEmailSchema,
});

export type UpdateAccountInput = {
  name: string;
  bio?: string;
  avatar_url?: string | null;
  username: string;
  phone: string;
  autofillForms: boolean;
  churchName: string;
  city: string;
  campRole: (typeof campRoles)[number];
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelationship: string;
  emergencyAddress: string;
  guardianName: string;
  guardianRelationship: (typeof guardianRelationships)[number] | "";
  guardianPhone: string;
  guardianEmail: string;
};

export async function updateAccount(data: UpdateAccountInput) {
  const parsed = accountSchema.safeParse({
    name: data.name,
    bio: data.bio ?? "",
    avatar_url: data.avatar_url ?? null,
    username: data.username ?? "",
    phone: data.phone ?? "",
    autofillForms: data.autofillForms ?? true,
    churchName: data.churchName ?? "",
    city: data.city ?? "",
    campRole: data.campRole ?? "participant",
    emergencyName: data.emergencyName ?? "",
    emergencyPhone: data.emergencyPhone ?? "",
    emergencyRelationship: data.emergencyRelationship ?? "",
    emergencyAddress: data.emergencyAddress ?? "",
    guardianName: data.guardianName ?? "",
    guardianRelationship: data.guardianRelationship ?? "",
    guardianPhone: data.guardianPhone ?? "",
    guardianEmail: data.guardianEmail ?? "",
  });

  if (!parsed.success) {
    throw new Error(
      parsed.error.issues[0]?.message ??
        "No pudimos validar tu información. Intenta de nuevo.",
    );
  }

  const supabase = await getSupabaseServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("No autenticado");
  }

  const { error: authError } = await supabase.auth.updateUser({
    data: {
      ...user.user_metadata,
      username: parsed.data.username || null,
      phone: parsed.data.phone || null,
      autofillForms: parsed.data.autofillForms,
      churchName: parsed.data.churchName || null,
      city: parsed.data.city || null,
      campRole: parsed.data.campRole,
      emergencyName: parsed.data.emergencyName || null,
      emergencyPhone: parsed.data.emergencyPhone || null,
      emergencyRelationship: parsed.data.emergencyRelationship || null,
      emergencyAddress: parsed.data.emergencyAddress || null,
      guardianName: parsed.data.guardianName || null,
      guardianRelationship: parsed.data.guardianRelationship || null,
      guardianPhone: parsed.data.guardianPhone || null,
      guardianEmail: parsed.data.guardianEmail || null,
    },
  });

  if (authError) {
    throw new Error(
      "No pudimos actualizar los datos vinculados a tu cuenta en este momento.",
    );
  }

  const updated_at = new Date().toISOString();

  const { data: savedProfile, error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        name: parsed.data.name,
        bio: parsed.data.bio,
        avatar_url: parsed.data.avatar_url ?? null,
        updated_at,
      },
      { onConflict: "id" },
    )
    .select("name, bio, avatar_url, updated_at")
    .single();

  if (error) {
    throw new Error("No pudimos guardar tus cambios en este momento.");
  }

  revalidatePath("/account");
  revalidatePath("/camp");
  revalidatePath("/peticion");

  return {
    name: savedProfile?.name ?? parsed.data.name,
    bio: savedProfile?.bio ?? parsed.data.bio,
    avatar_url: savedProfile?.avatar_url ?? parsed.data.avatar_url ?? null,
    username: parsed.data.username || null,
    phone: parsed.data.phone || null,
    autofill: {
      enabled: parsed.data.autofillForms,
      churchName: parsed.data.churchName,
      city: parsed.data.city,
      campRole: parsed.data.campRole,
      emergencyName: parsed.data.emergencyName,
      emergencyPhone: parsed.data.emergencyPhone,
      emergencyRelationship: parsed.data.emergencyRelationship,
      emergencyAddress: parsed.data.emergencyAddress,
      guardianName: parsed.data.guardianName,
      guardianRelationship: parsed.data.guardianRelationship,
      guardianPhone: parsed.data.guardianPhone,
      guardianEmail: parsed.data.guardianEmail,
    },
    updated_at: savedProfile?.updated_at ?? updated_at,
  };
}
