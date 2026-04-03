"use server"

import "server-only"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { getAvisosActorContext } from "@/lib/avisos/permissions"
import { getAvisoPosts, getAvisosHubPayload } from "@/lib/avisos/queries"
import {
  deleteAvisoComment,
  deleteAvisoPost,
  saveAvisoComment,
  saveAvisoPost,
  saveClassSession,
  toggleAvisoCommentReaction,
  toggleAvisoReaction,
} from "@/lib/avisos/mutations"

function parseJsonField<T>(value: FormDataEntryValue | null, fallback: T): T {
  if (typeof value !== "string" || !value.trim()) {
    return fallback
  }

  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export async function getAvisosPublicados() {
  const actor = await getAvisosActorContext()
  return getAvisoPosts(actor)
}

export async function getAvisosAdmin() {
  const actor = await getAvisosActorContext()
  return getAvisoPosts({
    ...actor,
    role: "admin",
  })
}

export async function getAvisosHub() {
  const actor = await getAvisosActorContext()
  return getAvisosHubPayload(actor)
}

export async function getPublishedCommunityGroups() {
  const actor = await getAvisosActorContext()
  const payload = await getAvisosHubPayload(actor)
  return payload.groups
}

export async function saveAviso(formData: FormData) {
  return saveAvisoPost({
    id: String(formData.get("id") ?? "").trim() || undefined,
    titulo: String(formData.get("titulo") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    contenido: String(formData.get("contenido") ?? ""),
    publicado: String(formData.get("publicado") ?? "").toLowerCase() === "true",
    audience_roles: parseJsonField(formData.get("audience_roles"), []),
    audience_groups: parseJsonField(formData.get("audience_groups"), []),
    media_blocks: parseJsonField(formData.get("media_blocks"), []),
    attachments: parseJsonField(formData.get("attachments"), []),
    post_type: String(formData.get("post_type") ?? "aviso"),
    cover_image_url: String(formData.get("cover_image_url") ?? "").trim() || null,
    is_pinned: String(formData.get("is_pinned") ?? "").toLowerCase() === "true",
    allow_comments: String(formData.get("allow_comments") ?? "true").toLowerCase() !== "false",
    allow_reactions: String(formData.get("allow_reactions") ?? "true").toLowerCase() !== "false",
  })
}

export async function togglePublicarAviso(id: string, publicado: boolean) {
  const actor = await getAvisosActorContext()

  if (actor.role !== "admin" && actor.role !== "leader" && actor.role !== "staff") {
    throw new Error("No autorizado")
  }

  const { error } = await supabaseAdmin
    .from("avisos")
    .update({
      publicado,
      published_at: publicado ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/avisos")
  revalidatePath("/admin/avisos")
}

export async function deleteAviso(id: string) {
  return deleteAvisoPost(id)
}

export {
  deleteAvisoComment,
  saveAvisoComment,
  saveAvisoPost,
  saveClassSession,
  toggleAvisoCommentReaction,
  toggleAvisoReaction,
}
