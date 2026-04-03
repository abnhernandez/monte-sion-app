import "server-only"

import { revalidatePath } from "next/cache"
import { supabaseAdmin } from "@/lib/supabase-admin"
import {
  assertAuthenticatedActor,
  canCommentAvisos,
  canCreateAvisoType,
  canCreateAvisos,
  canManageAvisoRecord,
  canManageClassSchedule,
  canModerateComment,
  canPinAvisos,
  canReactAvisos,
  ensureManagedGroups,
  getAvisosActorContext,
} from "@/lib/avisos/permissions"
import {
  saveAvisoCommentSchema,
  saveAvisoSchema,
  saveClassSchema,
  saveReactionSchema,
} from "@/lib/avisos/schemas"
import type { AvisoAttachmentRecord, SaveClassPayload } from "@/lib/avisos/types"

function normalizeText(value: unknown) {
  return String(value ?? "").trim()
}

function unique<T>(values: T[]) {
  return [...new Set(values)]
}

function revalidateAvisosViews() {
  revalidatePath("/avisos")
  revalidatePath("/admin/avisos")
  revalidatePath("/eventos")
}

async function listAudienceRecipientIds(params: {
  audienceRoles: string[]
  audienceGroups: string[]
  excludeUserId?: string | null
}) {
  try {
    if (params.audienceRoles.length === 0 && params.audienceGroups.length === 0) {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id")

      if (error) {
        return [] as string[]
      }

      return (data ?? [])
        .map((row) => normalizeText(row.id))
        .filter((id) => id && id !== params.excludeUserId)
    }

    const candidates = new Set<string>()

    if (params.audienceRoles.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .in("role", params.audienceRoles)

      if (!error) {
        for (const row of data ?? []) {
          const id = normalizeText(row.id)
          if (id && id !== params.excludeUserId) {
            candidates.add(id)
          }
        }
      }
    }

    if (params.audienceGroups.length > 0) {
      const { data, error } = await supabaseAdmin
        .from("community_group_members")
        .select("profile_id")
        .in("community_group_id", params.audienceGroups)

      if (!error) {
        for (const row of data ?? []) {
          const id = normalizeText(row.profile_id)
          if (id && id !== params.excludeUserId) {
            candidates.add(id)
          }
        }
      }
    }

    return [...candidates]
  } catch {
    return [] as string[]
  }
}

async function createNotifications(
  rows: Array<{
    user_id: string
    title: string
    message: string
    role?: string
  }>
) {
  if (rows.length === 0) {
    return
  }

  try {
    const payload = rows.map((row) => ({
      user_id: row.user_id,
      title: row.title,
      message: row.message,
      role: row.role ?? "user",
      tone: "action",
      read: false,
    }))

    await supabaseAdmin.from("notifications").insert(payload)
  } catch {
    // Keep avisos usable even if notifications SQL has not been applied yet.
  }
}

async function createPostNotifications(params: {
  actorId: string
  title: string
  postType: string
  audienceRoles: string[]
  audienceGroups: string[]
}) {
  if (params.postType !== "advertencia" && params.postType !== "notificacion") {
    return
  }

  const recipientIds = await listAudienceRecipientIds({
    audienceRoles: params.audienceRoles,
    audienceGroups: params.audienceGroups,
    excludeUserId: params.actorId,
  })

  await createNotifications(
    recipientIds.map((userId) => ({
      user_id: userId,
      title: "Nuevo aviso importante",
      message: params.title,
    }))
  )
}

async function createCommentNotifications(params: {
  actorId: string
  postAuthorId: string | null
  parentCommentAuthorId: string | null
  postTitle: string
  isReply: boolean
}) {
  const recipients = unique(
    [params.postAuthorId, params.parentCommentAuthorId]
      .map((value) => normalizeText(value))
      .filter(Boolean)
      .filter((id) => id !== params.actorId)
  )

  await createNotifications(
    recipients.map((userId) => ({
      user_id: userId,
      title: params.isReply ? "Nueva respuesta" : "Nuevo comentario",
      message: params.postTitle,
    }))
  )
}

type PersistedAttachmentInput = Omit<
  AvisoAttachmentRecord,
  "resolved_url" | "thumbnail_url"
>

function prepareAttachmentRows(
  avisoId: string,
  attachments: PersistedAttachmentInput[]
) {
  return attachments.map((attachment, index) => ({
    id: attachment.id,
    aviso_id: avisoId,
    kind: attachment.kind,
    source_type: attachment.source_type,
    storage_bucket: attachment.storage_bucket,
    storage_path: attachment.storage_path,
    external_url: attachment.external_url,
    thumbnail_path: attachment.thumbnail_path,
    title: attachment.title,
    file_name: attachment.file_name,
    mime_type: attachment.mime_type,
    size_bytes: attachment.size_bytes,
    position: index,
    metadata: attachment.metadata ?? {},
  }))
}

export async function saveAvisoPost(input: unknown) {
  const actor = await assertAuthenticatedActor()

  if (!canCreateAvisos(actor)) {
    throw new Error("No autorizado para crear publicaciones.")
  }

  const payload = saveAvisoSchema.parse(input)

  if (!canCreateAvisoType(actor, payload.post_type)) {
    throw new Error("Tu rol no puede publicar este tipo de aviso.")
  }

  if (payload.is_pinned && !canPinAvisos(actor)) {
    throw new Error("Tu rol no puede fijar publicaciones.")
  }

  if (actor.role !== "admin" && payload.audience_roles.includes("admin")) {
    throw new Error("No puedes dirigir publicaciones al rol admin.")
  }

  ensureManagedGroups(actor, payload.audience_groups)

  if (!payload.contenido && payload.attachments.length === 0 && payload.media_blocks.length === 0) {
    throw new Error("Agrega contenido, bloques o adjuntos antes de guardar.")
  }

  let existingPublishedAt: string | null = null
  if (payload.id) {
    const canManage = await canManageAvisoRecord(payload.id, actor)
    if (!canManage) {
      throw new Error("No puedes editar esta publicación.")
    }

    const { data, error } = await supabaseAdmin
      .from("avisos")
      .select("published_at")
      .eq("id", payload.id)
      .maybeSingle()

    if (error) {
      throw new Error(error.message)
    }

    existingPublishedAt = data?.published_at ? String(data.published_at) : null
  }

  const now = new Date().toISOString()
  const dbPayload = {
    titulo: payload.titulo,
    summary: payload.summary,
    contenido: payload.contenido,
    media_blocks: payload.media_blocks,
    publicado: payload.publicado,
    audience_roles: payload.audience_roles,
    audience_groups: payload.audience_groups,
    published_at: payload.publicado ? existingPublishedAt ?? now : null,
    updated_at: now,
    author_profile_id: actor.userId,
    author_name: actor.name,
    author_role: actor.role ?? "user",
    post_type: payload.post_type,
    cover_image_url: payload.cover_image_url,
    is_pinned: payload.is_pinned,
    allow_comments: payload.allow_comments,
    allow_reactions: payload.allow_reactions,
  }

  let avisoId = payload.id

  if (payload.id) {
    const { error } = await supabaseAdmin.from("avisos").update(dbPayload).eq("id", payload.id)
    if (error) {
      throw new Error(error.message)
    }
  } else {
    const { data, error } = await supabaseAdmin
      .from("avisos")
      .insert(dbPayload)
      .select("id")
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo crear la publicación.")
    }

    avisoId = String(data.id)
  }

  if (!avisoId) {
    throw new Error("No se pudo identificar la publicación.")
  }

  const attachmentRows = prepareAttachmentRows(avisoId, payload.attachments)

  try {
    await supabaseAdmin.from("aviso_attachments").delete().eq("aviso_id", avisoId)
    if (attachmentRows.length > 0) {
      const { error } = await supabaseAdmin.from("aviso_attachments").insert(attachmentRows)
      if (error) {
        throw new Error(error.message)
      }
    }
  } catch {
    // If the migration is not applied yet, the post can still be saved.
  }

  if (payload.publicado) {
    await createPostNotifications({
      actorId: actor.userId,
      title: payload.titulo,
      postType: payload.post_type,
      audienceRoles: payload.audience_roles,
      audienceGroups: payload.audience_groups,
    })
  }

  revalidateAvisosViews()
  return { ok: true, id: avisoId }
}

export async function deleteAvisoPost(avisoId: string) {
  const actor = await assertAuthenticatedActor()
  const normalizedId = normalizeText(avisoId)

  if (!normalizedId) {
    throw new Error("No se encontró la publicación.")
  }

  const canManage = await canManageAvisoRecord(normalizedId, actor)
  if (!canManage) {
    throw new Error("No puedes eliminar esta publicación.")
  }

  await supabaseAdmin.from("aviso_attachments").delete().eq("aviso_id", normalizedId)
  await supabaseAdmin.from("avisos").delete().eq("id", normalizedId)

  revalidateAvisosViews()
  return { ok: true }
}

export async function toggleAvisoReaction(avisoId: string, input: unknown) {
  const actor = await assertAuthenticatedActor()
  if (!canReactAvisos(actor)) {
    throw new Error("No autorizado.")
  }

  const payload = saveReactionSchema.parse(input)
  const normalizedAvisoId = normalizeText(avisoId)

  const { data: post, error: postError } = await supabaseAdmin
    .from("avisos")
    .select("allow_reactions")
    .eq("id", normalizedAvisoId)
    .maybeSingle()

  if (postError || !post) {
    throw new Error(postError?.message ?? "No se encontró la publicación.")
  }

  if (post.allow_reactions === false) {
    throw new Error("Las reacciones están desactivadas para esta publicación.")
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("aviso_reactions")
    .select("id, type")
    .eq("aviso_id", normalizedAvisoId)
    .eq("profile_id", actor.userId)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existing && normalizeText(existing.type) === payload.type) {
    const { error } = await supabaseAdmin
      .from("aviso_reactions")
      .delete()
      .eq("id", existing.id)

    if (error) {
      throw new Error(error.message)
    }
  } else if (existing) {
    const { error } = await supabaseAdmin
      .from("aviso_reactions")
      .update({ type: payload.type })
      .eq("id", existing.id)

    if (error) {
      throw new Error(error.message)
    }
  } else {
    const { error } = await supabaseAdmin.from("aviso_reactions").insert({
      aviso_id: normalizedAvisoId,
      profile_id: actor.userId,
      type: payload.type,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  revalidateAvisosViews()
  return { ok: true }
}

export async function saveAvisoComment(input: unknown) {
  const actor = await assertAuthenticatedActor()
  if (!canCommentAvisos(actor)) {
    throw new Error("No autorizado.")
  }

  const payload = saveAvisoCommentSchema.parse(input)

  const { data: post, error: postError } = await supabaseAdmin
    .from("avisos")
    .select("id, titulo, author_profile_id, allow_comments")
    .eq("id", payload.aviso_id)
    .maybeSingle()

  if (postError || !post) {
    throw new Error(postError?.message ?? "No se encontró el aviso.")
  }

  if (post.allow_comments === false) {
    throw new Error("Los comentarios están desactivados para esta publicación.")
  }

  let parentComment: {
    id: string
    author_profile_id: string | null
  } | null = null

  if (payload.parent_comment_id) {
    const { data, error } = await supabaseAdmin
      .from("aviso_comments")
      .select("id, aviso_id, author_profile_id")
      .eq("id", payload.parent_comment_id)
      .maybeSingle()

    if (error || !data) {
      throw new Error(error?.message ?? "No se encontró el comentario padre.")
    }

    if (normalizeText(data.aviso_id) !== payload.aviso_id) {
      throw new Error("La respuesta debe pertenecer al mismo aviso.")
    }

    parentComment = {
      id: normalizeText(data.id),
      author_profile_id: normalizeText(data.author_profile_id) || null,
    }
  }

  if (payload.comment_id) {
    const { data: current, error: currentError } = await supabaseAdmin
      .from("aviso_comments")
      .select("id, author_profile_id")
      .eq("id", payload.comment_id)
      .maybeSingle()

    if (currentError || !current) {
      throw new Error(currentError?.message ?? "No se encontró el comentario.")
    }

    const canModerate = canModerateComment({
      actor,
      commentAuthorId: normalizeText(current.author_profile_id) || null,
      postAuthorId: normalizeText(post.author_profile_id) || null,
    })

    if (!canModerate) {
      throw new Error("No puedes editar este comentario.")
    }

    const { error } = await supabaseAdmin
      .from("aviso_comments")
      .update({
        content: payload.content,
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.comment_id)

    if (error) {
      throw new Error(error.message)
    }
  } else {
    const { error } = await supabaseAdmin.from("aviso_comments").insert({
      aviso_id: payload.aviso_id,
      parent_comment_id: payload.parent_comment_id ?? null,
      author_profile_id: actor.userId,
      author_name: actor.name,
      author_role: actor.role ?? "user",
      content: payload.content,
      is_deleted: false,
    })

    if (error) {
      throw new Error(error.message)
    }

    await createCommentNotifications({
      actorId: actor.userId,
      postAuthorId: normalizeText(post.author_profile_id) || null,
      parentCommentAuthorId: parentComment?.author_profile_id ?? null,
      postTitle: normalizeText(post.titulo),
      isReply: Boolean(payload.parent_comment_id),
    })
  }

  revalidateAvisosViews()
  return { ok: true }
}

export async function deleteAvisoComment(commentId: string) {
  const actor = await assertAuthenticatedActor()
  const normalizedCommentId = normalizeText(commentId)

  const { data: comment, error } = await supabaseAdmin
    .from("aviso_comments")
    .select("id, author_profile_id, aviso_id")
    .eq("id", normalizedCommentId)
    .maybeSingle()

  if (error || !comment) {
    throw new Error(error?.message ?? "No se encontró el comentario.")
  }

  const { data: post } = await supabaseAdmin
    .from("avisos")
    .select("author_profile_id")
    .eq("id", String(comment.aviso_id))
    .maybeSingle()

  const canModerate = canModerateComment({
    actor,
    commentAuthorId: normalizeText(comment.author_profile_id) || null,
    postAuthorId: normalizeText(post?.author_profile_id) || null,
  })

  if (!canModerate) {
    throw new Error("No puedes borrar este comentario.")
  }

  const { error: updateError } = await supabaseAdmin
    .from("aviso_comments")
    .update({
      content: "",
      is_deleted: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", normalizedCommentId)

  if (updateError) {
    throw new Error(updateError.message)
  }

  revalidateAvisosViews()
  return { ok: true }
}

export async function toggleAvisoCommentReaction(commentId: string, input: unknown) {
  const actor = await assertAuthenticatedActor()
  if (!canReactAvisos(actor)) {
    throw new Error("No autorizado.")
  }

  const payload = saveReactionSchema.parse(input)
  const normalizedCommentId = normalizeText(commentId)

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("aviso_comment_reactions")
    .select("id, type")
    .eq("comment_id", normalizedCommentId)
    .eq("profile_id", actor.userId)
    .maybeSingle()

  if (existingError) {
    throw new Error(existingError.message)
  }

  if (existing && normalizeText(existing.type) === payload.type) {
    const { error } = await supabaseAdmin
      .from("aviso_comment_reactions")
      .delete()
      .eq("id", existing.id)

    if (error) {
      throw new Error(error.message)
    }
  } else if (existing) {
    const { error } = await supabaseAdmin
      .from("aviso_comment_reactions")
      .update({ type: payload.type })
      .eq("id", existing.id)

    if (error) {
      throw new Error(error.message)
    }
  } else {
    const { error } = await supabaseAdmin.from("aviso_comment_reactions").insert({
      comment_id: normalizedCommentId,
      profile_id: actor.userId,
      type: payload.type,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  revalidateAvisosViews()
  return { ok: true }
}

export async function saveClassSession(input: SaveClassPayload | unknown) {
  const actor = await assertAuthenticatedActor()

  if (!canManageClassSchedule(actor)) {
    throw new Error("No autorizado para gestionar clases.")
  }

  const payload = saveClassSchema.parse(input)
  ensureManagedGroups(actor, payload.audience_groups)
  const normalizedEndAt =
    payload.end_at ??
    new Date(new Date(payload.start_at).getTime() + 60 * 60 * 1000).toISOString()

  const dbPayload = {
    title: payload.title,
    subject: payload.subject,
    teacher: payload.teacher,
    description: payload.description,
    kind: "class",
    start_at: payload.start_at,
    end_at: normalizedEndAt,
    fecha_evento: payload.start_at,
    live_link: payload.live_link ?? null,
    cover_image_url: payload.cover_image_url ?? null,
    audience_roles: payload.audience_roles,
    audience_groups: payload.audience_groups,
    feed_pin: payload.feed_pin,
    tags: payload.tags,
    published: true,
    fecha: payload.start_at.slice(0, 10),
    start_time: new Date(payload.start_at).toISOString().slice(11, 16),
    end_time: new Date(normalizedEndAt).toISOString().slice(11, 16),
  }

  const dbPayloadWithAvatar =
    typeof payload.avatar_url === "undefined"
      ? dbPayload
      : {
          ...dbPayload,
          avatar_url: payload.avatar_url,
        }

  if (payload.id) {
    const { error } = await supabaseAdmin.from("eventos").update(dbPayloadWithAvatar).eq("id", payload.id)
    if (error) {
      throw new Error(error.message)
    }
  } else {
    const { data, error } = await supabaseAdmin
      .from("eventos")
      .insert(dbPayloadWithAvatar)
      .select("id")
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo crear la clase.")
    }

    const recipientIds = await listAudienceRecipientIds({
      audienceRoles: payload.audience_roles,
      audienceGroups: payload.audience_groups,
      excludeUserId: actor.userId,
    })

    await createNotifications(
      recipientIds.map((userId) => ({
        user_id: userId,
        title: "Nueva clase programada",
        message: payload.title,
      }))
    )
  }

  revalidateAvisosViews()
  return { ok: true }
}

export async function getCurrentAvisosActor() {
  return getAvisosActorContext()
}
