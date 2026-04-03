import "server-only"

import type { PostgrestError } from "@supabase/supabase-js"
import { getSafeAppRole } from "@/lib/roles"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type {
  AvisoAttachmentRecord,
  AvisoClassRecord,
  AvisoCommentRecord,
  AvisoMediaBlock,
  AvisoNotificationPreview,
  AvisoReactionSummary,
  AvisoRecord,
  AvisosHubPayload,
  FeedItem,
  GroupOption,
  ReactionType,
} from "@/lib/avisos/types"
import type { AvisosActorContext } from "@/lib/avisos/permissions"

const reactionTypes: ReactionType[] = ["like", "love", "laugh", "wow"]

function normalizeText(value: unknown) {
  return String(value ?? "").trim()
}

function normalizeStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => normalizeText(item)).filter(Boolean)
  }

  if (typeof value === "string") {
    const trimmed = value.trim()
    if (!trimmed) return []

    try {
      const parsed = JSON.parse(trimmed)
      return normalizeStringArray(parsed)
    } catch {
      return trimmed
        .split(/[\n,;]/)
        .map((item) => normalizeText(item))
        .filter(Boolean)
    }
  }

  return []
}

function normalizeRoleArray(value: unknown) {
  return normalizeStringArray(value).map((role) => getSafeAppRole(role))
}

function normalizeJsonArray(value: unknown) {
  if (Array.isArray(value)) {
    return value
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  return []
}

function normalizeMediaBlock(value: unknown): AvisoMediaBlock | null {
  if (!value || typeof value !== "object") {
    return null
  }

  const block = value as Record<string, unknown>
  const id = normalizeText(block.id)
  const type = normalizeText(block.type)

  if (!id || !type) {
    return null
  }

  if (type === "image") {
    const src = normalizeText(block.src)
    if (!src) return null

    return {
      id,
      type: "image",
      src,
      alt: normalizeText(block.alt) || "Imagen del aviso",
      caption: normalizeText(block.caption),
    }
  }

  if (type === "video") {
    const src = normalizeText(block.src)
    if (!src) return null

    return {
      id,
      type: "video",
      src,
      title: normalizeText(block.title),
    }
  }

  if (type === "quote") {
    const text = normalizeText(block.text)
    if (!text) return null

    return {
      id,
      type: "quote",
      text,
      author: normalizeText(block.author),
    }
  }

  if (type === "callout") {
    return {
      id,
      type: "callout",
      tone:
        normalizeText(block.tone) === "success"
          ? "success"
          : normalizeText(block.tone) === "warning"
            ? "warning"
            : "info",
      title: normalizeText(block.title),
      text: normalizeText(block.text),
    }
  }

  if (type === "link") {
    const href = normalizeText(block.href)
    const label = normalizeText(block.label)

    if (!href || !label) return null

    return {
      id,
      type: "link",
      href,
      label,
      description: normalizeText(block.description),
    }
  }

  return null
}

function normalizeMediaBlocks(value: unknown) {
  return normalizeJsonArray(value)
    .map((block) => normalizeMediaBlock(block))
    .filter((block): block is AvisoMediaBlock => Boolean(block))
}

function matchesAnyTarget(targetValues: string[], audienceValues: string[]) {
  if (targetValues.length === 0) {
    return true
  }

  const normalizedAudience = new Set(audienceValues.map((value) => value.toLowerCase()))
  return targetValues.some((value) => normalizedAudience.has(value.toLowerCase()))
}

function matchesAudience(actor: AvisosActorContext, row: { audience_roles: string[]; audience_groups: string[] }) {
  if (row.audience_roles.length === 0 && row.audience_groups.length === 0) {
    return true
  }

  if (!actor.role && actor.userId === null) {
    return false
  }

  const matchesRole = matchesAnyTarget(row.audience_roles, actor.role ? [actor.role] : [])
  const matchesGroup = matchesAnyTarget(row.audience_groups, actor.memberGroupIds)
  return matchesRole || matchesGroup
}

function buildReactionSummary(
  rows: Array<{ type: string; profile_id?: string | null }>,
  currentUserId: string | null
): AvisoReactionSummary[] {
  return reactionTypes.map((type) => ({
    type,
    count: rows.filter((row) => row.type === type).length,
    reacted: Boolean(currentUserId && rows.some((row) => row.type === type && row.profile_id === currentUserId)),
  }))
}

async function resolveAttachmentUrl(
  bucket: string | null,
  path: string | null
) {
  if (!bucket || !path) {
    return null
  }

  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, 60 * 60)

  if (error) {
    return null
  }

  return data.signedUrl
}

async function mapAttachmentRow(row: Record<string, unknown>): Promise<AvisoAttachmentRecord> {
  const sourceType = normalizeText(row.source_type) === "storage" ? "storage" : "external"
  const bucket = normalizeText(row.storage_bucket) || null
  const storagePath = normalizeText(row.storage_path) || null
  const thumbnailPath = normalizeText(row.thumbnail_path) || null

  const [resolvedUrl, thumbnailUrl] = await Promise.all([
    sourceType === "storage"
      ? resolveAttachmentUrl(bucket, storagePath)
      : Promise.resolve(normalizeText(row.external_url) || null),
    sourceType === "storage"
      ? resolveAttachmentUrl(bucket, thumbnailPath)
      : Promise.resolve(null),
  ])

  return {
    id: normalizeText(row.id),
    aviso_id: normalizeText(row.aviso_id),
    kind: (normalizeText(row.kind) as AvisoAttachmentRecord["kind"]) || "file",
    source_type: sourceType,
    storage_bucket: bucket,
    storage_path: storagePath,
    external_url: normalizeText(row.external_url) || null,
    thumbnail_path: thumbnailPath,
    title: normalizeText(row.title),
    file_name: normalizeText(row.file_name),
    mime_type: normalizeText(row.mime_type),
    size_bytes:
      typeof row.size_bytes === "number"
        ? row.size_bytes
        : row.size_bytes
          ? Number(row.size_bytes)
          : null,
    position:
      typeof row.position === "number" ? row.position : Number(row.position ?? 0),
    metadata:
      row.metadata && typeof row.metadata === "object"
        ? (row.metadata as Record<string, unknown>)
        : {},
    resolved_url: resolvedUrl,
    thumbnail_url: thumbnailUrl,
  }
}

function toIsoDate(value: unknown) {
  const normalized = normalizeText(value)
  if (!normalized) return null
  const date = new Date(normalized)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function mergeDateAndTime(dateValue: unknown, timeValue: unknown) {
  const datePart = normalizeText(dateValue)
  const timePart = normalizeText(timeValue)

  if (!datePart) return null

  const raw = `${datePart}T${timePart || "00:00"}:00`
  const date = new Date(raw)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

function mapClassRow(row: Record<string, unknown>): AvisoClassRecord {
  return {
    id: normalizeText(row.id),
    title: normalizeText(row.title) || normalizeText(row.nombre) || "Clase",
    subject: normalizeText(row.subject) || normalizeText(row.materia),
    teacher: normalizeText(row.teacher) || normalizeText(row.profesor),
    description: normalizeText(row.description),
    start_at:
      toIsoDate(row.start_at) ??
      toIsoDate(row.fecha_evento) ??
      mergeDateAndTime(row.fecha, row.start_time) ??
      new Date().toISOString(),
    end_at:
      toIsoDate(row.end_at) ??
      mergeDateAndTime(row.fecha, row.end_time) ??
      null,
    live_link: normalizeText(row.live_link) || null,
    avatar_url: normalizeText(row.avatar_url) || null,
    cover_image_url: normalizeText(row.cover_image_url) || null,
    tags: normalizeStringArray(row.tags),
    audience_roles: normalizeRoleArray(row.audience_roles),
    audience_groups: normalizeStringArray(row.audience_groups),
    feed_pin: Boolean(row.feed_pin),
  }
}

async function listPublishedGroups(): Promise<GroupOption[]> {
  const { data, error } = await supabaseAdmin
    .from("community_groups")
    .select("id, name, description")
    .eq("published", true)
    .order("position", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((group) => ({
    id: normalizeText(group.id),
    name: normalizeText(group.name),
    description: group.description ? String(group.description) : null,
  }))
}

async function listNotificationsPreview(actor: AvisosActorContext) {
  if (!actor.userId) {
    return {
      count: 0,
      items: [] as AvisoNotificationPreview[],
    }
  }

  try {
    const [{ data: items, error }, { count, error: countError }] = await Promise.all([
      supabaseAdmin
        .from("notifications")
        .select("id, title, message, read, created_at")
        .eq("user_id", actor.userId)
        .order("created_at", { ascending: false })
        .limit(5),
      supabaseAdmin
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", actor.userId)
        .eq("read", false),
    ])

    if (error || countError) {
      return { count: 0, items: [] as AvisoNotificationPreview[] }
    }

    return {
      count: count ?? 0,
      items: (items ?? []).map((item) => ({
        id: normalizeText(item.id),
        title: normalizeText(item.title),
        message: normalizeText(item.message),
        read: Boolean(item.read),
        created_at: String(item.created_at ?? new Date().toISOString()),
      })),
    }
  } catch {
    return {
      count: 0,
      items: [] as AvisoNotificationPreview[],
    }
  }
}

async function fetchOptionalTable<T>(
  promise: PromiseLike<{ data: T[] | null; error: PostgrestError | null }>
) {
  const { data, error } = await promise
  if (error) {
    return [] as T[]
  }

  return data ?? []
}

export async function getAvisoComments(actor: AvisosActorContext, avisoId: string) {
  const posts = await getAvisoPosts(actor)
  const post = posts.find((item) => item.id === avisoId)
  if (!post) {
    throw new Error("No se encontró el aviso.")
  }

  return post.comments
}

export async function getAvisoPosts(actor: AvisosActorContext): Promise<AvisoRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("avisos")
    .select("*")
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  const postRows = (data ?? []).map((row) => ({
    row,
    audience_roles: normalizeRoleArray(row.audience_roles),
    audience_groups: normalizeStringArray(row.audience_groups),
  }))

  const visiblePosts = postRows.filter(({ row, audience_roles, audience_groups }) => {
    const published = Boolean(row.publicado ?? row.published ?? false)
    if (!published) {
      return (
        actor.role === "admin" ||
        (actor.userId !== null && normalizeText(row.author_profile_id) === actor.userId)
      )
    }

    return matchesAudience(actor, {
      audience_roles,
      audience_groups,
    })
  })

  const postIds = visiblePosts.map(({ row }) => normalizeText(row.id)).filter(Boolean)

  const [attachmentRows, reactionRows, commentRows] = await Promise.all([
    fetchOptionalTable(
      postIds.length > 0
        ? supabaseAdmin
            .from("aviso_attachments")
            .select("*")
            .in("aviso_id", postIds)
            .order("position", { ascending: true })
        : Promise.resolve({ data: [], error: null })
    ),
    fetchOptionalTable(
      postIds.length > 0
        ? supabaseAdmin
            .from("aviso_reactions")
            .select("aviso_id, profile_id, type")
            .in("aviso_id", postIds)
        : Promise.resolve({ data: [], error: null })
    ),
    fetchOptionalTable(
      postIds.length > 0
        ? supabaseAdmin
            .from("aviso_comments")
            .select("*")
            .in("aviso_id", postIds)
            .order("created_at", { ascending: true })
        : Promise.resolve({ data: [], error: null })
    ),
  ])

  const commentIds = commentRows
    .map((row) => normalizeText((row as Record<string, unknown>).id))
    .filter(Boolean)

  const commentReactionRows = await fetchOptionalTable(
    commentIds.length > 0
      ? supabaseAdmin
          .from("aviso_comment_reactions")
          .select("comment_id, profile_id, type")
          .in("comment_id", commentIds)
      : Promise.resolve({ data: [], error: null })
  )

  const attachmentsByPostId = new Map<string, AvisoAttachmentRecord[]>()
  for (const row of attachmentRows as Record<string, unknown>[]) {
    const mapped = await mapAttachmentRow(row)
    const group = attachmentsByPostId.get(mapped.aviso_id) ?? []
    group.push(mapped)
    attachmentsByPostId.set(mapped.aviso_id, group)
  }

  const reactionsByPostId = new Map<string, Array<{ type: string; profile_id?: string | null }>>()
  for (const row of reactionRows as Record<string, unknown>[]) {
    const postId = normalizeText(row.aviso_id)
    const group = reactionsByPostId.get(postId) ?? []
    group.push({
      type: normalizeText(row.type),
      profile_id: normalizeText(row.profile_id) || null,
    })
    reactionsByPostId.set(postId, group)
  }

  const commentReactionsById = new Map<string, Array<{ type: string; profile_id?: string | null }>>()
  for (const row of commentReactionRows as Record<string, unknown>[]) {
    const commentId = normalizeText(row.comment_id)
    const group = commentReactionsById.get(commentId) ?? []
    group.push({
      type: normalizeText(row.type),
      profile_id: normalizeText(row.profile_id) || null,
    })
    commentReactionsById.set(commentId, group)
  }

  const commentsByPostId = new Map<string, AvisoCommentRecord[]>()
  for (const row of commentRows as Record<string, unknown>[]) {
    const postId = normalizeText(row.aviso_id)
    const commentId = normalizeText(row.id)
    const group = commentsByPostId.get(postId) ?? []
    group.push({
      id: commentId,
      aviso_id: postId,
      parent_comment_id: normalizeText(row.parent_comment_id) || null,
      author_profile_id: normalizeText(row.author_profile_id) || null,
      author_name: normalizeText(row.author_name) || "Usuario",
      author_role: getSafeAppRole(row.author_role),
      content: normalizeText(row.content),
      is_deleted: Boolean(row.is_deleted),
      created_at: String(row.created_at ?? new Date().toISOString()),
      updated_at: String(row.updated_at ?? row.created_at ?? new Date().toISOString()),
      reactions: buildReactionSummary(
        commentReactionsById.get(commentId) ?? [],
        actor.userId
      ),
    })
    commentsByPostId.set(postId, group)
  }

  return visiblePosts.map(({ row, audience_roles, audience_groups }) => {
    const id = normalizeText(row.id)

    return {
      id,
      titulo: normalizeText(row.titulo),
      summary: normalizeText(row.summary),
      contenido: String(row.contenido ?? "").trim(),
      media_blocks: normalizeMediaBlocks(row.media_blocks),
      attachments: attachmentsByPostId.get(id) ?? [],
      publicado: Boolean(row.publicado ?? row.published ?? false),
      published_at: row.published_at ? String(row.published_at) : null,
      audience_roles,
      audience_groups,
      created_at: String(row.created_at ?? new Date().toISOString()),
      updated_at: row.updated_at ? String(row.updated_at) : null,
      author_profile_id: normalizeText(row.author_profile_id) || null,
      author_name: normalizeText(row.author_name) || "Admin",
      author_role: getSafeAppRole(row.author_role || "admin"),
      post_type:
        normalizeText(row.post_type) === "info" ||
        normalizeText(row.post_type) === "advertencia" ||
        normalizeText(row.post_type) === "notificacion"
          ? (normalizeText(row.post_type) as AvisoRecord["post_type"])
          : "aviso",
      cover_image_url: normalizeText(row.cover_image_url) || null,
      is_pinned: Boolean(row.is_pinned),
      allow_comments: row.allow_comments === false ? false : true,
      allow_reactions: row.allow_reactions === false ? false : true,
      reactions: buildReactionSummary(reactionsByPostId.get(id) ?? [], actor.userId),
      comments: commentsByPostId.get(id) ?? [],
    } satisfies AvisoRecord
  })
}

export async function getClassItems(actor: AvisosActorContext): Promise<AvisoClassRecord[]> {
  const { data, error } = await supabaseAdmin
    .from("eventos")
    .select("*")
    .eq("published", true)
    .order("fecha_evento", { ascending: true, nullsFirst: false })
    .order("fecha", { ascending: true, nullsFirst: false })

  if (error) {
    return []
  }

  const now = Date.now()

  return (data ?? [])
    .map((row) => mapClassRow(row as Record<string, unknown>))
    .filter((item) => {
      const kind = normalizeText((data ?? []).find((row) => String(row.id) === item.id)?.kind)
      const isClass = !kind || kind === "class"

      if (!isClass) {
        return false
      }

      if (!matchesAudience(actor, item)) {
        return false
      }

      return new Date(item.start_at).getTime() >= now - 1000 * 60 * 60 * 24
    })
}

export async function getAvisosHubPayload(actor: AvisosActorContext): Promise<AvisosHubPayload> {
  const [groups, posts, classes, notifications] = await Promise.all([
    listPublishedGroups(),
    getAvisoPosts(actor),
    getClassItems(actor),
    listNotificationsPreview(actor),
  ])

  const feed: FeedItem[] = [
    ...classes
      .filter((item) => item.feed_pin)
      .map(
        (item) =>
          ({
            kind: "class",
            id: item.id,
            sort_at: item.start_at,
            class_item: item,
          }) satisfies FeedItem
      ),
    ...posts.map(
      (post) =>
        ({
          kind: "post",
          id: post.id,
          sort_at: post.published_at ?? post.created_at,
          post,
        }) satisfies FeedItem
    ),
  ].sort((left, right) => {
    const leftPinned = left.kind === "post" ? left.post.is_pinned : left.class_item.feed_pin
    const rightPinned = right.kind === "post" ? right.post.is_pinned : right.class_item.feed_pin

    if (leftPinned !== rightPinned) {
      return Number(rightPinned) - Number(leftPinned)
    }

    return right.sort_at.localeCompare(left.sort_at)
  })

  return {
    current_user_id: actor.userId,
    role: actor.role,
    groups,
    managed_group_ids: actor.managedGroupIds,
    posts,
    classes,
    feed,
    notification_count: notifications.count,
    notifications: notifications.items,
  }
}
