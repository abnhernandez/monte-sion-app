"use client"

import { useMemo, useState, useTransition } from "react"
import { MessageSquare, PencilLine, Reply, Send, Trash2, UserCircle2 } from "lucide-react"
import AvisoReactionBar from "@/components/avisos/aviso-reaction-bar"
import { getRoleLabel, type AppRole } from "@/lib/roles"
import type { AvisoCommentRecord, AvisoRecord, ReactionType } from "@/lib/avisos/types"

type CommentNode = {
  comment: AvisoCommentRecord
  replies: CommentNode[]
}

function relativeTime(value: string) {
  const diff = Date.now() - new Date(value).getTime()
  const minute = 60 * 1000
  const hour = 60 * minute
  const day = 24 * hour

  if (diff < minute) return "hace un momento"
  if (diff < hour) return `hace ${Math.max(1, Math.round(diff / minute))} min`
  if (diff < day) return `hace ${Math.max(1, Math.round(diff / hour))} h`
  return `hace ${Math.max(1, Math.round(diff / day))} d`
}

export default function AvisoCommentsThread({
  post,
  currentUserId,
  role,
  onRefresh,
}: {
  post: AvisoRecord
  currentUserId: string | null
  role: AppRole | null
  onRefresh: () => Promise<void> | void
}) {
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState("")
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)

  const commentTree = useMemo(() => {
    const grouped = new Map<string, AvisoCommentRecord[]>()

    for (const comment of post.comments) {
      const key = comment.parent_comment_id ?? "root"
      const group = grouped.get(key) ?? []
      group.push(comment)
      grouped.set(key, group)
    }

    const build = (parentId: string | null): CommentNode[] =>
      (grouped.get(parentId ?? "root") ?? []).map((comment) => ({
        comment,
        replies: build(comment.id),
      }))

    return build(null)
  }, [post.comments])

  const canWrite = Boolean(currentUserId && post.allow_comments)

  function resetEditors() {
    setReplyToId(null)
    setReplyContent("")
    setEditingCommentId(null)
    setEditingContent("")
  }

  async function submitComment(payload: Record<string, unknown>) {
    const response = await fetch(`/api/avisos/posts/${post.id}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo guardar el comentario.")
    }

    setFeedback("Comentario publicado.")
    await onRefresh()
  }

  async function updateComment(commentId: string, nextContent: string) {
    const response = await fetch(`/api/avisos/comments/${commentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        aviso_id: post.id,
        content: nextContent,
      }),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo actualizar el comentario.")
    }

    setFeedback("Comentario actualizado.")
    await onRefresh()
  }

  async function deleteComment(commentId: string) {
    const response = await fetch(`/api/avisos/comments/${commentId}`, {
      method: "DELETE",
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo borrar el comentario.")
    }

    setFeedback("Comentario eliminado.")
    await onRefresh()
  }

  async function reactToComment(commentId: string, type: ReactionType) {
    const response = await fetch(`/api/avisos/comments/${commentId}/reactions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type }),
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error ?? "No se pudo registrar la reacción.")
    }

    await onRefresh()
  }

  function renderNode(node: CommentNode, depth = 0) {
    const comment = node.comment
    const isOwner = Boolean(currentUserId && comment.author_profile_id === currentUserId)
    const isPostOwner = Boolean(currentUserId && post.author_profile_id === currentUserId)
    const canManage = role === "admin" || isOwner || isPostOwner

    return (
      <div key={comment.id} className="space-y-3">
        <div className={depth === 0 ? "flex gap-3" : "ml-8 flex gap-3"}>
          <div className="pt-1 text-primary">
            <UserCircle2 className="h-5 w-5" />
          </div>
          <article className="min-w-0 flex-1 rounded-[1.35rem] border border-border bg-background px-4 py-3 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                  <span>{comment.author_name}</span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {getRoleLabel(comment.author_role)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {relativeTime(comment.created_at)}
                  {comment.updated_at !== comment.created_at ? " · editado" : ""}
                </p>
              </div>

              {(canManage || canWrite) && !comment.is_deleted ? (
                <div className="flex flex-wrap gap-2">
                  {canWrite ? (
                    <button
                      type="button"
                      onClick={() => {
                        setReplyToId(comment.id)
                        setReplyContent("")
                        setEditingCommentId(null)
                        setEditingContent("")
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground"
                    >
                      <Reply className="h-3.5 w-3.5" />
                      Responder
                    </button>
                  ) : null}
                  {canManage ? (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingCommentId(comment.id)
                        setEditingContent(comment.content)
                        setReplyToId(null)
                        setReplyContent("")
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground"
                    >
                      <PencilLine className="h-3.5 w-3.5" />
                      Editar
                    </button>
                  ) : null}
                  {canManage ? (
                    <button
                      type="button"
                      onClick={() =>
                        startTransition(async () => {
                          try {
                            await deleteComment(comment.id)
                            resetEditors()
                          } catch (error) {
                            setFeedback(error instanceof Error ? error.message : "No se pudo borrar el comentario.")
                          }
                        })
                      }
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-300/30 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Borrar
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
              {comment.is_deleted ? "Comentario eliminado." : comment.content}
            </p>

            {!comment.is_deleted ? (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <AvisoReactionBar
                  reactions={comment.reactions}
                  compact
                  disabled={!currentUserId}
                  onReact={async (type) => {
                    await reactToComment(comment.id, type)
                  }}
                />
              </div>
            ) : null}

            {replyToId === comment.id ? (
              <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-3">
                <textarea
                  value={replyContent}
                  onChange={(event) => setReplyContent(event.target.value)}
                  rows={3}
                  placeholder={`Responder a ${comment.author_name}...`}
                  className="w-full rounded-[1.1rem] border border-input bg-background px-3 py-2 text-sm outline-none"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setReplyToId(null)
                      setReplyContent("")
                    }}
                    className="rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          await submitComment({
                            parent_comment_id: comment.id,
                            content: replyContent,
                          })
                          setReplyToId(null)
                          setReplyContent("")
                        } catch (error) {
                          setFeedback(error instanceof Error ? error.message : "No se pudo responder.")
                        }
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Responder
                  </button>
                </div>
              </div>
            ) : null}

            {editingCommentId === comment.id ? (
              <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-3">
                <textarea
                  value={editingContent}
                  onChange={(event) => setEditingContent(event.target.value)}
                  rows={3}
                  className="w-full rounded-[1.1rem] border border-input bg-background px-3 py-2 text-sm outline-none"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCommentId(null)
                      setEditingContent("")
                    }}
                    className="rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() =>
                      startTransition(async () => {
                        try {
                          await updateComment(comment.id, editingContent)
                          setEditingCommentId(null)
                          setEditingContent("")
                        } catch (error) {
                          setFeedback(error instanceof Error ? error.message : "No se pudo actualizar.")
                        }
                      })
                    }
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    <Send className="h-3.5 w-3.5" />
                    Guardar
                  </button>
                </div>
              </div>
            ) : null}
          </article>
        </div>

        {node.replies.length > 0 ? (
          <div className="space-y-3 border-l border-border pl-4">
            {node.replies.map((reply) => renderNode(reply, depth + 1))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <section className="space-y-4 rounded-[1.45rem] border border-border bg-muted/10 p-4">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <h4 className="text-sm font-semibold text-foreground">
          Comentarios ({post.comments.filter((comment) => !comment.parent_comment_id).length})
        </h4>
      </div>

      {canWrite ? (
        <div className="space-y-3 rounded-2xl border border-border bg-background p-3">
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={3}
            placeholder="Comparte una idea, una respuesta o una coordinación rápida..."
            className="w-full rounded-[1.1rem] border border-input bg-background px-3 py-2 text-sm outline-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Tu rol actual: {role ? getRoleLabel(role) : "Invitado"}</p>
            <button
              type="button"
              disabled={isPending}
              onClick={() =>
                startTransition(async () => {
                  try {
                    await submitComment({ content })
                    setContent("")
                  } catch (error) {
                    setFeedback(error instanceof Error ? error.message : "No se pudo publicar el comentario.")
                  }
                })
              }
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Send className="h-3.5 w-3.5" />
              Comentar
            </button>
          </div>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Inicia sesión para comentar y reaccionar.</p>
      )}

      {feedback ? <p className="text-sm text-muted-foreground">{feedback}</p> : null}

      <div className="space-y-4">
        {commentTree.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-background p-4 text-sm text-muted-foreground">
            Todavía no hay comentarios en esta publicación.
          </div>
        ) : (
          commentTree.map((node) => renderNode(node))
        )}
      </div>
    </section>
  )
}
