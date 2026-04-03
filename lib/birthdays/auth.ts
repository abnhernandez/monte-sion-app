import "server-only"

import { getSupabaseServer } from "@/lib/supabase-server"
import {
  canAccessBirthdays,
  canAccessBirthdayComments,
  canManageBirthdayContent,
  getSafeAppRole,
  isAdminRole,
  type AppRole,
} from "@/lib/roles"

export class BirthdayAuthError extends Error {
  constructor(
    message: string,
    public status: 401 | 403 = 401
  ) {
    super(message)
    this.name = "BirthdayAuthError"
  }
}

export type BirthdayActor = {
  userId: string
  profileId: string
  role: AppRole
  name: string
  email: string
}

export async function getBirthdayActor() {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new BirthdayAuthError("No autenticado.", 401)
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, name, email, role")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  const role = getSafeAppRole(profile?.role)
  const name = String(profile?.name ?? user.user_metadata?.name ?? user.email ?? "Usuario").trim()
  const email = String(profile?.email ?? user.email ?? "").trim()

  return {
    userId: user.id,
    profileId: String(profile?.id ?? user.id),
    role,
    name: name || "Usuario",
    email,
  } satisfies BirthdayActor
}

export async function assertBirthdayTeamAccess() {
  const actor = await getBirthdayActor()

  if (!canAccessBirthdays(actor.role)) {
    throw new BirthdayAuthError("No autorizado.", 403)
  }

  return actor
}

export async function assertBirthdayAdminAccess() {
  const actor = await getBirthdayActor()

  if (!isAdminRole(actor.role)) {
    throw new BirthdayAuthError("No autorizado.", 403)
  }

  return actor
}

export async function assertBirthdayManagerAccess() {
  const actor = await getBirthdayActor()

  if (!canManageBirthdayContent(actor.role)) {
    throw new BirthdayAuthError("No autorizado.", 403)
  }

  return actor
}

export async function assertBirthdayCommentAccess() {
  const actor = await getBirthdayActor()

  if (!canAccessBirthdayComments(actor.role)) {
    throw new BirthdayAuthError("No autorizado.", 403)
  }

  return actor
}
