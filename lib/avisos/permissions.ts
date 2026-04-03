import "server-only"

import { getSupabaseServer } from "@/lib/supabase-server"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getSafeAppRole, type AppRole } from "@/lib/roles"
import type { AvisoPostType } from "@/lib/avisos/types"

export type AvisosActorContext = {
  userId: string | null
  name: string
  role: AppRole | null
  memberGroupIds: string[]
  managedGroupIds: string[]
}

export type AuthenticatedAvisosActorContext = Omit<
  AvisosActorContext,
  "userId" | "role"
> & {
  userId: string
  role: AppRole
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim()
}

export async function getAvisosActorContext(): Promise<AvisosActorContext> {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      userId: null,
      name: "Invitado",
      role: null,
      memberGroupIds: [],
      managedGroupIds: [],
    }
  }

  const [{ data: profile }, { data: members }, managersResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("name, role")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("community_group_members")
      .select("community_group_id")
      .eq("profile_id", user.id),
    supabase
      .from("community_group_managers")
      .select("community_group_id")
      .eq("profile_id", user.id)
      .eq("can_publish", true),
  ])

  const managers = managersResult.error ? [] : managersResult.data ?? []

  return {
    userId: user.id,
    name: normalizeText(profile?.name) || user.email || "Usuario",
    role: getSafeAppRole(profile?.role),
    memberGroupIds: (members ?? [])
      .map((item: { community_group_id: string }) => normalizeText(item.community_group_id))
      .filter(Boolean),
    managedGroupIds: (managers ?? [])
      .map((item: { community_group_id: string }) => normalizeText(item.community_group_id))
      .filter(Boolean),
  }
}

export async function assertAuthenticatedActor(): Promise<AuthenticatedAvisosActorContext> {
  const actor = await getAvisosActorContext()

  if (!actor.userId || !actor.role) {
    throw new Error("No autenticado")
  }

  return actor as AuthenticatedAvisosActorContext
}

export function canReadAvisos(actor: AvisosActorContext) {
  return actor.userId !== null || actor.role === null
}

export function canCommentAvisos(actor: AvisosActorContext) {
  return Boolean(actor.userId)
}

export function canReactAvisos(actor: AvisosActorContext) {
  return Boolean(actor.userId)
}

export function canCreateAvisos(actor: AvisosActorContext) {
  return actor.role === "admin" || actor.role === "leader" || actor.role === "staff"
}

export function canManageAllAvisos(actor: AvisosActorContext) {
  return actor.role === "admin"
}

export function canPinAvisos(actor: AvisosActorContext) {
  return actor.role === "admin" || actor.role === "leader"
}

export function canManageClassSchedule(actor: AvisosActorContext) {
  return actor.role === "admin" || actor.role === "leader"
}

export function canCreateAvisoType(actor: AvisosActorContext, type: AvisoPostType) {
  if (actor.role === "admin") return true
  if (actor.role === "leader") return true
  if (actor.role === "staff") {
    return type === "info" || type === "aviso"
  }

  return false
}

export function ensureManagedGroups(
  actor: AvisosActorContext,
  audienceGroupIds: string[]
) {
  if (actor.role === "admin") {
    return
  }

  const managed = new Set(actor.managedGroupIds)
  const hasUnauthorizedGroup = audienceGroupIds.some((groupId) => !managed.has(groupId))

  if (hasUnauthorizedGroup) {
    throw new Error("No puedes publicar o coordinar grupos no asignados.")
  }
}

export function canModerateComment(params: {
  actor: AvisosActorContext
  commentAuthorId: string | null
  postAuthorId: string | null
}) {
  if (!params.actor.userId) return false
  if (params.actor.role === "admin") return true
  if (params.commentAuthorId && params.commentAuthorId === params.actor.userId) return true
  if (params.postAuthorId && params.postAuthorId === params.actor.userId) return true
  return false
}

export async function canManageAvisoRecord(avisoId: string, actor: AvisosActorContext) {
  if (canManageAllAvisos(actor)) {
    return true
  }

  if (!actor.userId) {
    return false
  }

  const { data, error } = await supabaseAdmin
    .from("avisos")
    .select("author_profile_id, audience_groups")
    .eq("id", avisoId)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data) {
    return false
  }

  if (normalizeText(data.author_profile_id) === actor.userId) {
    return true
  }

  if (actor.role === "leader") {
    const audienceGroups = Array.isArray(data.audience_groups)
      ? data.audience_groups.map((value) => normalizeText(value)).filter(Boolean)
      : []

    return audienceGroups.every((groupId) => actor.managedGroupIds.includes(groupId))
  }

  return false
}
