"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { MessageSquare, PencilLine, Reply, Send, Trash2, UserCircle2 } from "lucide-react"
import { deleteBirthdayComment, saveBirthdayComment } from "@/lib/birthdays/actions"
import type { BirthdayCommentRecord } from "@/lib/birthdays/types"
import type { AppRole } from "@/lib/roles"
import { canModerateBirthdayComments, getRoleLabel } from "@/lib/roles"
import { BirthdayEmptyState, BirthdaySection } from "@/components/birthdays/birthday-ui"

type Props = {
  birthdayId: string
  currentUserId: string
  role: AppRole
  comments: BirthdayCommentRecord[]
}

type CommentNode = {
  comment: BirthdayCommentRecord
  replies: CommentNode[]
}

export default function BirthdayCommentsThread({
  birthdayId,
  currentUserId,
  role,
  comments,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [content, setContent] = useState("")
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingContent, setEditingContent] = useState("")
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const canWrite = role === "admin" || role === "leader" || role === "staff"

  const activeComment = useMemo(
    () => comments.find((comment) => comment.id === editingCommentId) ?? null,
    [comments, editingCommentId]
  )

  const commentTree = useMemo(() => {
    const childrenByParentId = new Map<string, BirthdayCommentRecord[]>()

    for (const comment of comments) {
      const parentId = comment.parentCommentId ?? "root"
      const group = childrenByParentId.get(parentId) ?? []
      group.push(comment)
      childrenByParentId.set(parentId, group)
    }

    const buildTree = (parentId: string | null): CommentNode[] => {
      const siblings = childrenByParentId.get(parentId ?? "root") ?? []
      return siblings.map((comment) => ({
        comment,
        replies: buildTree(comment.id),
      }))
    }

    return buildTree(null)
  }, [comments])

  function resetEditor() {
    setEditingCommentId(null)
    setEditingContent("")
  }

  function resetReply() {
    setReplyToId(null)
    setReplyContent("")
  }

  function refreshWithFeedback(message: string) {
    setFeedback(message)
    setErrorMessage(null)
    router.refresh()
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        await saveBirthdayComment({
          birthdayId,
          content: editingCommentId ? editingContent : content,
          parentCommentId: null,
          commentId: editingCommentId ?? undefined,
        })

        if (editingCommentId) {
          resetEditor()
          refreshWithFeedback("Comentario actualizado.")
        } else {
          setContent("")
          refreshWithFeedback("Comentario publicado.")
        }
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar el comentario.")
      }
    })
  }

  function handleSubmitReply() {
    if (!replyToId) {
      return
    }

    startTransition(async () => {
      try {
        await saveBirthdayComment({
          birthdayId,
          content: replyContent,
          parentCommentId: replyToId,
        })

        resetReply()
        refreshWithFeedback("Respuesta publicada.")
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar la respuesta.")
      }
    })
  }

  function handleEdit(comment: BirthdayCommentRecord) {
    setEditingCommentId(comment.id)
    setEditingContent(comment.content)
    resetReply()
    setFeedback(null)
    setErrorMessage(null)
  }

  function handleReply(comment: BirthdayCommentRecord) {
    setReplyToId(comment.id)
    setReplyContent("")
    resetEditor()
    setFeedback(null)
    setErrorMessage(null)
  }

  function handleDelete(commentId: string) {
    startTransition(async () => {
      try {
        await deleteBirthdayComment(commentId)

        if (editingCommentId === commentId) {
          resetEditor()
        }

        if (replyToId === commentId) {
          resetReply()
        }

        refreshWithFeedback("Comentario eliminado.")
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar el comentario.")
      }
    })
  }

  function renderCommentNode(node: CommentNode, depth = 0) {
    const comment = node.comment
    const isOwner = comment.authorProfileId === currentUserId
    const canEdit = canModerateBirthdayComments(role) || isOwner
    const canDelete = canModerateBirthdayComments(role) || isOwner

    return (
      <div key={comment.id} className={depth === 0 ? "space-y-3" : ""}>
        <div className={depth === 0 ? "flex gap-3" : "ml-10 flex gap-3"}>
          <div className="flex flex-col items-center pt-1">
            <div className="rounded-full border border-border bg-card p-1.5 text-primary shadow-sm">
              <UserCircle2 size={15} />
            </div>
            {node.replies.length > 0 ? <div className="mt-2 h-full w-px bg-border" /> : null}
          </div>

          <article className="min-w-0 flex-1 rounded-[1.4rem] border border-border bg-background/90 px-4 py-3 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-foreground">
                  <span>{comment.authorName}</span>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {getRoleLabel(comment.authorRole)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(comment.createdAt).toLocaleString("es-MX", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {comment.updatedAt !== comment.createdAt ? " · editado" : ""}
                </p>
              </div>

              {canWrite || canEdit || canDelete ? (
                <div className="flex flex-wrap items-center gap-2">
                  {canWrite ? (
                    <button
                      onClick={() => handleReply(comment)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground disabled:opacity-60"
                    >
                      <Reply size={13} />
                      Responder
                    </button>
                  ) : null}
                  {canEdit ? (
                    <button
                      onClick={() => handleEdit(comment)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground disabled:opacity-60"
                    >
                      <PencilLine size={13} />
                      Editar
                    </button>
                  ) : null}
                  {canDelete ? (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      disabled={isPending}
                      className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-600 transition hover:border-red-400/35 hover:text-red-700 disabled:opacity-60"
                    >
                      <Trash2 size={13} />
                      Eliminar
                    </button>
                  ) : null}
                </div>
              ) : null}
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-foreground">
              {comment.content}
            </p>

            {replyToId === comment.id ? (
                <div className="mt-4 rounded-2xl border border-border bg-muted/20 p-3">
                <textarea
                  value={replyContent}
                  onChange={(event) => setReplyContent(event.target.value)}
                  rows={3}
                  placeholder={`Responder a ${comment.authorName}...`}
                  className="w-full rounded-[1.1rem] border border-input bg-background px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted-foreground"
                />
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <button
                    onClick={resetReply}
                    className="rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground"
                  >
                    Cancelar respuesta
                  </button>
                  <button
                    onClick={handleSubmitReply}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
                  >
                    <Send size={13} />
                    Responder
                  </button>
                </div>
              </div>
            ) : null}
          </article>
        </div>

        {node.replies.length > 0 ? (
          <div className="mt-3 space-y-3 border-l border-border pl-4">
            {node.replies.map((reply) => renderCommentNode(reply, depth + 1))}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <BirthdaySection
      eyebrow="Comentarios"
      title="Conversación del cumple"
      description="Responde, edita o borra con foco en la conversación y sin perder la jerarquía del hilo."
      icon={<MessageSquare size={18} />}
    >
      {canWrite ? (
        <div className="space-y-3 rounded-3xl border border-border bg-muted/20 p-4">
          {editingCommentId ? (
            <div className="flex items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm text-foreground">
              <div>
                <p className="font-medium">Editando comentario</p>
                <p className="text-muted-foreground">
                  {activeComment ? `De ${activeComment.authorName}` : "Solo se actualizará este mensaje."}
                </p>
              </div>
              <button
                onClick={resetEditor}
                className="rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground"
              >
                Cancelar
              </button>
            </div>
          ) : null}

          <textarea
            value={editingCommentId ? editingContent : content}
            onChange={(event) =>
              editingCommentId ? setEditingContent(event.target.value) : setContent(event.target.value)
            }
            rows={4}
            placeholder="Escribe aquí una nota corta, una idea o una coordinación rápida..."
            className="w-full rounded-[1.25rem] border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">Tu rol actual: {getRoleLabel(role)}</p>
            <button
              onClick={handleSubmit}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
            >
              <Send size={14} />
              {editingCommentId ? "Actualizar" : "Enviar"}
            </button>
          </div>
        </div>
      ) : null}

      {feedback ? <p className="mt-3 text-sm text-primary">{feedback}</p> : null}
      {errorMessage ? <p className="mt-3 text-sm text-destructive">{errorMessage}</p> : null}

      <div className="mt-5 space-y-4">
        {comments.length === 0 ? (
          <BirthdayEmptyState
            title="Todavía no hay comentarios"
            description="Cuando alguien agregue una nota, el hilo aparecerá aquí con respuestas anidadas."
          />
        ) : (
          commentTree.map((node) => renderCommentNode(node))
        )}
      </div>
    </BirthdaySection>
  )
}