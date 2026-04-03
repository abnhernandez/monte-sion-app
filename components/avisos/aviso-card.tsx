"use client"

import { useTransition } from "react"
import { Clock3, PencilLine, Trash2 } from "lucide-react"
import AvisoAttachments from "@/components/avisos/aviso-attachments"
import AvisoCommentsThread from "@/components/avisos/aviso-comments-thread"
import AvisoContent from "@/components/avisos/aviso-content"
import AvisoReactionBar from "@/components/avisos/aviso-reaction-bar"
import { getRoleLabel, type AppRole } from "@/lib/roles"
import { cn } from "@/lib/utils"
import type { AvisoDraft, AvisoRecord, ReactionType } from "@/lib/avisos/types"

function relativeTime(value: string | null) {
  if (!value) return "recién publicado"

  const diff = Date.now() - new Date(value).getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return "hace un momento"
  if (diff < hour) return `hace ${Math.max(1, Math.round(diff / minute))} min`
  if (diff < day) return `hace ${Math.max(1, Math.round(diff / hour))} h`
  return `hace ${Math.max(1, Math.round(diff / day))} d`
}

const typeStyles: Record<AvisoRecord["post_type"], string> = {
  info: "bg-sky-500/10 text-sky-700 dark:text-sky-300",
  aviso: "bg-muted text-muted-foreground",
  advertencia: "bg-amber-500/10 text-amber-700 dark:text-amber-300",
  notificacion: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
}

export default function AvisoCard({
  post,
  currentUserId,
  role,
  canManage,
  onRefresh,
  onEdit,
}: {
  post: AvisoRecord
  currentUserId: string | null
  role: AppRole | null
  canManage: boolean
  onRefresh: () => Promise<void> | void
  onEdit?: (draft: AvisoDraft) => void
}) {
  const [isPending, startTransition] = useTransition()

  async function react(type: ReactionType) {
    const response = await fetch(`/api/avisos/posts/${post.id}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo reaccionar.")
    }

    await onRefresh()
  }

  async function remove() {
    const response = await fetch(`/api/avisos/posts/${post.id}`, {
      method: "DELETE",
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo borrar la publicación.")
    }

    await onRefresh()
  }

  return (
    <article className="overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-sm">
      <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-foreground">{post.titulo}</h3>
              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]", typeStyles[post.post_type])}>
                {post.post_type}
              </span>
              {post.is_pinned ? (
                <span className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  Fijado
                </span>
              ) : null}
            </div>
            {post.summary ? <p className="mt-2 text-sm text-muted-foreground">{post.summary}</p> : null}
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/80">{post.author_name}</span>
              <span className="rounded-full border border-border bg-muted/20 px-2 py-1">
                {getRoleLabel(post.author_role)}
              </span>
              <span className="h-1 w-1 rounded-full bg-muted-foreground/60" />
              <span className="inline-flex items-center gap-1.5">
                <Clock3 className="h-3.5 w-3.5" />
                {relativeTime(post.published_at ?? post.created_at)}
              </span>
            </div>
          </div>

          {canManage ? (
            <div className="flex flex-wrap items-center gap-2">
              {onEdit ? (
                <button
                  type="button"
                  onClick={() =>
                    onEdit({
                      id: post.id,
                      titulo: post.titulo,
                      summary: post.summary,
                      contenido: post.contenido,
                      media_blocks: post.media_blocks,
                      attachments: post.attachments,
                      publicado: post.publicado,
                      audience_roles: post.audience_roles,
                      audience_groups: post.audience_groups,
                      post_type: post.post_type,
                      cover_image_url: post.cover_image_url,
                      is_pinned: post.is_pinned,
                      allow_comments: post.allow_comments,
                      allow_reactions: post.allow_reactions,
                    })
                  }
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground"
                >
                  <PencilLine className="h-3.5 w-3.5" />
                  Editar
                </button>
              ) : null}
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    await remove()
                  })
                }
                className="inline-flex items-center gap-1.5 rounded-full border border-red-300/30 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Eliminar
              </button>
            </div>
          ) : null}
        </div>

        <AvisoContent content={post.contenido} mediaBlocks={post.media_blocks} compact />
        <AvisoAttachments attachments={post.attachments} />

        {post.allow_reactions ? (
          <AvisoReactionBar
            reactions={post.reactions}
            disabled={!currentUserId}
            onReact={react}
          />
        ) : null}

        {post.allow_comments ? (
          <AvisoCommentsThread
            post={post}
            currentUserId={currentUserId}
            role={role}
            onRefresh={onRefresh}
          />
        ) : null}
      </div>
    </article>
  )
}
