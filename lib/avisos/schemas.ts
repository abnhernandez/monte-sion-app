import { z } from "zod"

const appRoleSchema = z.enum(["admin", "leader", "staff", "user"])

export const avisoPostTypeSchema = z.enum([
  "info",
  "aviso",
  "advertencia",
  "notificacion",
])

export const avisoAttachmentKindSchema = z.enum([
  "image",
  "video",
  "file",
  "embed",
])

export const reactionTypeSchema = z.enum(["like", "love", "laugh", "wow"])

export const avisoMediaBlockSchema = z.discriminatedUnion("type", [
  z.object({
    id: z.string().min(1),
    type: z.literal("image"),
    src: z.string().trim().url(),
    alt: z.string().trim().default("Imagen del aviso"),
    caption: z.string().trim().default(""),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("video"),
    src: z.string().trim().url(),
    title: z.string().trim().default(""),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("quote"),
    text: z.string().trim().min(1),
    author: z.string().trim().default(""),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("callout"),
    tone: z.enum(["info", "success", "warning"]).default("info"),
    title: z.string().trim().default(""),
    text: z.string().trim().default(""),
  }),
  z.object({
    id: z.string().min(1),
    type: z.literal("link"),
    href: z.string().trim().url(),
    label: z.string().trim().min(1),
    description: z.string().trim().default(""),
  }),
])

export const avisoAttachmentSchema = z.object({
  id: z.string().min(1),
  aviso_id: z.string().trim().default(""),
  kind: avisoAttachmentKindSchema,
  source_type: z.enum(["storage", "external"]),
  storage_bucket: z.string().trim().nullable().default(null),
  storage_path: z.string().trim().nullable().default(null),
  external_url: z.string().trim().nullable().default(null),
  thumbnail_path: z.string().trim().nullable().default(null),
  title: z.string().trim().default(""),
  file_name: z.string().trim().default(""),
  mime_type: z.string().trim().default(""),
  size_bytes: z.number().int().nonnegative().nullable().default(null),
  position: z.number().int().nonnegative().default(0),
  metadata: z.record(z.string(), z.unknown()).default({}),
})

export const saveAvisoSchema = z.object({
  id: z.string().trim().optional(),
  titulo: z.string().trim().min(2).max(160),
  summary: z.string().trim().max(240).default(""),
  contenido: z.string().trim().max(20000).default(""),
  media_blocks: z.array(avisoMediaBlockSchema).default([]),
  attachments: z.array(avisoAttachmentSchema).default([]),
  publicado: z.boolean().default(false),
  audience_roles: z.array(appRoleSchema).default([]),
  audience_groups: z.array(z.string().uuid()).default([]),
  post_type: avisoPostTypeSchema.default("aviso"),
  cover_image_url: z.string().trim().nullable().default(null),
  is_pinned: z.boolean().default(false),
  allow_comments: z.boolean().default(true),
  allow_reactions: z.boolean().default(true),
})

export const saveAvisoCommentSchema = z.object({
  aviso_id: z.string().uuid(),
  comment_id: z.string().uuid().optional(),
  parent_comment_id: z.string().uuid().nullable().optional(),
  content: z.string().trim().min(2).max(2500),
})

export const saveReactionSchema = z.object({
  type: reactionTypeSchema,
})

export const saveClassSchema = z.object({
  id: z.string().uuid().optional(),
  title: z.string().trim().min(2).max(140),
  subject: z.string().trim().min(2).max(160),
  teacher: z.string().trim().min(2).max(140),
  description: z.string().trim().max(4000).default(""),
  start_at: z.string().datetime(),
  end_at: z.string().datetime().nullable().optional(),
  live_link: z.string().trim().url().nullable().optional(),
  avatar_url: z.string().trim().url().nullable().optional(),
  cover_image_url: z.string().trim().url().nullable().optional(),
  tags: z.array(z.string().trim().min(1).max(32)).max(12).default([]),
  audience_roles: z.array(appRoleSchema).default([]),
  audience_groups: z.array(z.string().uuid()).default([]),
  feed_pin: z.boolean().default(false),
})

export const uploadIntentSchema = z.object({
  kind: avisoAttachmentKindSchema,
  external_url: z.string().trim().url().optional(),
  title: z.string().trim().max(160).optional(),
})

export const maxUploadSizeByKind: Record<
  z.infer<typeof avisoAttachmentKindSchema>,
  number
> = {
  image: 10 * 1024 * 1024,
  video: 60 * 1024 * 1024,
  file: 15 * 1024 * 1024,
  embed: 0,
}
