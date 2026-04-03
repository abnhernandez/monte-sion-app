import type { AppRole } from "@/lib/roles"

export type AvisoPostType = "info" | "aviso" | "advertencia" | "notificacion"

export type AvisoAttachmentKind = "image" | "video" | "file" | "embed"

export type ReactionType = "like" | "love" | "laugh" | "wow"

export type AvisoMediaBlock =
  | {
      id: string
      type: "image"
      src: string
      alt: string
      caption: string
    }
  | {
      id: string
      type: "video"
      src: string
      title: string
    }
  | {
      id: string
      type: "quote"
      text: string
      author: string
    }
  | {
      id: string
      type: "callout"
      tone: "info" | "success" | "warning"
      title: string
      text: string
    }
  | {
      id: string
      type: "link"
      href: string
      label: string
      description: string
    }

export type AvisoAttachmentRecord = {
  id: string
  aviso_id: string
  kind: AvisoAttachmentKind
  source_type: "storage" | "external"
  storage_bucket: string | null
  storage_path: string | null
  external_url: string | null
  thumbnail_path: string | null
  title: string
  file_name: string
  mime_type: string
  size_bytes: number | null
  position: number
  metadata: Record<string, unknown>
  resolved_url: string | null
  thumbnail_url: string | null
}

export type AvisoReactionSummary = {
  type: ReactionType
  count: number
  reacted: boolean
}

export type AvisoCommentRecord = {
  id: string
  aviso_id: string
  parent_comment_id: string | null
  author_profile_id: string | null
  author_name: string
  author_role: AppRole
  content: string
  is_deleted: boolean
  created_at: string
  updated_at: string
  reactions: AvisoReactionSummary[]
}

export type AvisoRecord = {
  id: string
  titulo: string
  summary: string
  contenido: string
  media_blocks: AvisoMediaBlock[]
  attachments: AvisoAttachmentRecord[]
  publicado: boolean
  published_at: string | null
  audience_roles: AppRole[]
  audience_groups: string[]
  created_at: string
  updated_at: string | null
  author_profile_id: string | null
  author_name: string
  author_role: AppRole
  post_type: AvisoPostType
  cover_image_url: string | null
  is_pinned: boolean
  allow_comments: boolean
  allow_reactions: boolean
  reactions: AvisoReactionSummary[]
  comments: AvisoCommentRecord[]
}

export type AvisoClassRecord = {
  id: string
  title: string
  subject: string
  teacher: string
  description: string
  start_at: string
  end_at: string | null
  live_link: string | null
  avatar_url: string | null
  cover_image_url: string | null
  tags: string[]
  audience_roles: AppRole[]
  audience_groups: string[]
  feed_pin: boolean
}

export type FeedItem =
  | {
      kind: "post"
      id: string
      sort_at: string
      post: AvisoRecord
    }
  | {
      kind: "class"
      id: string
      sort_at: string
      class_item: AvisoClassRecord
    }

export type GroupOption = {
  id: string
  name: string
  description: string | null
}

export type AvisoNotificationPreview = {
  id: string
  title: string
  message: string
  read: boolean
  created_at: string
}

export type AvisosHubPayload = {
  current_user_id: string | null
  role: AppRole | null
  groups: GroupOption[]
  managed_group_ids: string[]
  posts: AvisoRecord[]
  classes: AvisoClassRecord[]
  feed: FeedItem[]
  notification_count: number
  notifications: AvisoNotificationPreview[]
}

export type AvisoDraft = {
  id?: string
  titulo: string
  summary: string
  contenido: string
  media_blocks: AvisoMediaBlock[]
  attachments: AvisoAttachmentRecord[]
  publicado: boolean
  audience_roles: AppRole[]
  audience_groups: string[]
  post_type: AvisoPostType
  cover_image_url: string | null
  is_pinned: boolean
  allow_comments: boolean
  allow_reactions: boolean
}

export type SaveClassPayload = {
  id?: string
  title: string
  subject: string
  teacher: string
  description?: string
  start_at: string
  end_at?: string | null
  live_link?: string | null
  avatar_url?: string | null
  cover_image_url?: string | null
  tags?: string[]
  audience_roles?: AppRole[]
  audience_groups?: string[]
  feed_pin?: boolean
}
