"use client"

import AvisoComposer from "@/components/avisos/aviso-composer"
import type { AvisoDraft, AvisoRecord, GroupOption } from "@/lib/avisos/types"

function toDraft(value?: AvisoRecord | null): AvisoDraft | null {
  if (!value) return null

  return {
    id: value.id,
    titulo: value.titulo,
    summary: value.summary,
    contenido: value.contenido,
    media_blocks: value.media_blocks,
    attachments: value.attachments,
    publicado: value.publicado,
    audience_roles: value.audience_roles,
    audience_groups: value.audience_groups,
    post_type: value.post_type,
    cover_image_url: value.cover_image_url,
    is_pinned: value.is_pinned,
    allow_comments: value.allow_comments,
    allow_reactions: value.allow_reactions,
  }
}

export default function AvisoEditor({
  groups,
  draft,
  onSaved,
  onCancelEdit,
}: {
  groups: GroupOption[]
  draft?: AvisoRecord | null
  onSaved?: () => void
  onCancelEdit?: () => void
}) {
  return (
    <AvisoComposer
      groups={groups}
      managedGroupIds={groups.map((group) => group.id)}
      role="admin"
      currentUserId={null}
      draft={toDraft(draft)}
      onSaved={() => onSaved?.()}
      onCancel={onCancelEdit}
    />
  )
}
