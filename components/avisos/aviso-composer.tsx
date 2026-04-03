"use client"

import { useEffect, useMemo, useRef, useState, useTransition, type FormEvent } from "react"
import { Loader2, Paperclip, Plus, UploadCloud, X } from "lucide-react"
import AvisoAttachments from "@/components/avisos/aviso-attachments"
import AvisoContent from "@/components/avisos/aviso-content"
import { getRoleLabel, type AppRole } from "@/lib/roles"
import { cn } from "@/lib/utils"
import type {
  AvisoAttachmentRecord,
  AvisoDraft,
  AvisoMediaBlock,
  AvisoPostType,
  GroupOption,
} from "@/lib/avisos/types"

type BlockDraft = {
  type: "callout" | "quote" | "link"
  tone: "info" | "success" | "warning"
  title: string
  text: string
  author: string
  href: string
  label: string
  description: string
}

const emptyBlockDraft = (): BlockDraft => ({
  type: "callout",
  tone: "info",
  title: "",
  text: "",
  author: "",
  href: "",
  label: "",
  description: "",
})

const baseDraft = (): AvisoDraft => ({
  titulo: "",
  summary: "",
  contenido: "",
  media_blocks: [],
  attachments: [],
  publicado: false,
  audience_roles: [],
  audience_groups: [],
  post_type: "aviso",
  cover_image_url: null,
  is_pinned: false,
  allow_comments: true,
  allow_reactions: true,
})

function toDraft(value?: AvisoDraft | null): AvisoDraft {
  return value ? { ...baseDraft(), ...value } : baseDraft()
}

function createMediaBlock(draft: BlockDraft): AvisoMediaBlock | null {
  const id = crypto.randomUUID()

  if (draft.type === "quote" && draft.text.trim()) {
    return {
      id,
      type: "quote",
      text: draft.text.trim(),
      author: draft.author.trim(),
    }
  }

  if (draft.type === "link" && draft.href.trim() && draft.label.trim()) {
    return {
      id,
      type: "link",
      href: draft.href.trim(),
      label: draft.label.trim(),
      description: draft.description.trim(),
    }
  }

  if (draft.type === "callout" && (draft.title.trim() || draft.text.trim())) {
    return {
      id,
      type: "callout",
      tone: draft.tone,
      title: draft.title.trim(),
      text: draft.text.trim(),
    }
  }

  return null
}

function inferAttachmentKind(file: File) {
  if (file.type.startsWith("image/")) return "image"
  if (file.type.startsWith("video/")) return "video"
  return "file"
}

const toolbarItems = [
  { label: "B", snippet: "**texto**" },
  { label: "I", snippet: "_texto_" },
  { label: "H1", snippet: "# Título\n" },
  { label: "H2", snippet: "## Subtítulo\n" },
  { label: "Lista", snippet: "- Punto\n" },
  { label: "Código", snippet: "```\nCódigo\n```" },
  { label: "Cita", snippet: "> Texto destacado\n" },
  { label: "Link", snippet: "[Texto](https://)" },
]

export default function AvisoComposer({
  groups,
  managedGroupIds,
  role,
  currentUserId,
  draft,
  onSaved,
  onCancel,
}: {
  groups: GroupOption[]
  managedGroupIds: string[]
  role: AppRole | null
  currentUserId: string | null
  draft?: AvisoDraft | null
  onSaved: () => Promise<void> | void
  onCancel?: () => void
}) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [isPending, startTransition] = useTransition()
  const [currentDraft, setCurrentDraft] = useState<AvisoDraft>(() => toDraft(draft))
  const [blockDraft, setBlockDraft] = useState<BlockDraft>(() => emptyBlockDraft())
  const [feedback, setFeedback] = useState<string | null>(null)
  const [embedUrl, setEmbedUrl] = useState("")

  const storageKey = useMemo(
    () => `avisos-composer:${currentUserId ?? "guest"}:${draft?.id ?? "new"}`,
    [currentUserId, draft?.id]
  )

  useEffect(() => {
    const localValue = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null
    if (localValue) {
      try {
        const parsed = JSON.parse(localValue) as AvisoDraft
        setCurrentDraft(toDraft({ ...draft, ...parsed }))
        return
      } catch {
        // ignore bad autosave data
      }
    }

    setCurrentDraft(toDraft(draft))
  }, [draft, storageKey])

  useEffect(() => {
    if (typeof window === "undefined") return

    const timeout = window.setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(currentDraft))
    }, 1500)

    return () => window.clearTimeout(timeout)
  }, [currentDraft, storageKey])

  const availableGroups = useMemo(() => {
    if (role === "admin") return groups
    if (managedGroupIds.length === 0) return []
    return groups.filter((group) => managedGroupIds.includes(group.id))
  }, [groups, managedGroupIds, role])

  const availableTypes: AvisoPostType[] = useMemo(() => {
    if (role === "admin" || role === "leader") {
      return ["info", "aviso", "advertencia", "notificacion"]
    }

    if (role === "staff") {
      return ["info", "aviso"]
    }

    return ["aviso"]
  }, [role])

  function insertSnippet(snippet: string) {
    const textarea = textareaRef.current

    if (!textarea) {
      setCurrentDraft((value) => ({
        ...value,
        contenido: `${value.contenido}${value.contenido ? "\n" : ""}${snippet}`,
      }))
      return
    }

    const value = currentDraft.contenido
    const start = textarea.selectionStart ?? value.length
    const end = textarea.selectionEnd ?? value.length
    const nextValue = `${value.slice(0, start)}${snippet}${value.slice(end)}`

    setCurrentDraft((draftValue) => ({ ...draftValue, contenido: nextValue }))

    requestAnimationFrame(() => {
      const cursor = start + snippet.length
      textarea.focus()
      textarea.setSelectionRange(cursor, cursor)
    })
  }

  function toggleRole(roleValue: AppRole) {
    setCurrentDraft((value) => ({
      ...value,
      audience_roles: value.audience_roles.includes(roleValue)
        ? value.audience_roles.filter((item) => item !== roleValue)
        : [...value.audience_roles, roleValue],
    }))
  }

  function toggleGroup(groupId: string) {
    setCurrentDraft((value) => ({
      ...value,
      audience_groups: value.audience_groups.includes(groupId)
        ? value.audience_groups.filter((item) => item !== groupId)
        : [...value.audience_groups, groupId],
    }))
  }

  function addBlock() {
    const nextBlock = createMediaBlock(blockDraft)
    if (!nextBlock) {
      setFeedback("Completa el bloque antes de agregarlo.")
      return
    }

    setCurrentDraft((value) => ({
      ...value,
      media_blocks: [...value.media_blocks, nextBlock],
    }))
    setBlockDraft(emptyBlockDraft())
    setFeedback(null)
  }

  function removeBlock(blockId: string) {
    setCurrentDraft((value) => ({
      ...value,
      media_blocks: value.media_blocks.filter((block) => block.id !== blockId),
    }))
  }

  async function uploadFile(file: File) {
    const formData = new FormData()
    formData.append("kind", inferAttachmentKind(file))
    formData.append("title", file.name)
    formData.append("file", file)

    const response = await fetch("/api/avisos/uploads", {
      method: "POST",
      body: formData,
    })

    const payload = await response.json()

    if (!response.ok || !payload.attachment) {
      throw new Error(payload.error ?? "No se pudo subir el archivo.")
    }

    setCurrentDraft((value) => ({
      ...value,
      attachments: [...value.attachments, payload.attachment as AvisoAttachmentRecord],
    }))
  }

  async function addEmbed() {
    if (!embedUrl.trim()) return

    const formData = new FormData()
    formData.append("kind", "embed")
    formData.append("external_url", embedUrl.trim())
    formData.append("title", "Video embebido")

    const response = await fetch("/api/avisos/uploads", {
      method: "POST",
      body: formData,
    })
    const payload = await response.json()

    if (!response.ok || !payload.attachment) {
      throw new Error(payload.error ?? "No se pudo agregar el embed.")
    }

    setCurrentDraft((value) => ({
      ...value,
      attachments: [...value.attachments, payload.attachment as AvisoAttachmentRecord],
    }))
    setEmbedUrl("")
  }

  function removeAttachment(attachmentId: string) {
    setCurrentDraft((value) => ({
      ...value,
      attachments: value.attachments.filter((attachment) => attachment.id !== attachmentId),
    }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const url = currentDraft.id
      ? `/api/avisos/posts/${currentDraft.id}`
      : "/api/avisos/posts"
    const method = currentDraft.id ? "PATCH" : "POST"

    startTransition(async () => {
      try {
        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(currentDraft),
        })

        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error ?? "No se pudo guardar la publicación.")
        }

        if (typeof window !== "undefined") {
          localStorage.removeItem(storageKey)
        }

        setCurrentDraft(baseDraft())
        setBlockDraft(emptyBlockDraft())
        setFeedback(null)
        await onSaved()
      } catch (error) {
        setFeedback(error instanceof Error ? error.message : "No se pudo guardar la publicación.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.75rem] border border-border bg-background p-4 shadow-sm sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Composer</p>
          <h3 className="text-lg font-bold text-foreground">
            {currentDraft.id ? "Editar publicación" : "Nueva publicación"}
          </h3>
        </div>

        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
          >
            Cancelar
          </button>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              value={currentDraft.titulo}
              onChange={(event) => setCurrentDraft((value) => ({ ...value, titulo: event.target.value }))}
              placeholder="Título del aviso"
              className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
            />
            <input
              value={currentDraft.summary}
              onChange={(event) => setCurrentDraft((value) => ({ ...value, summary: event.target.value }))}
              placeholder="Resumen corto"
              className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <select
              value={currentDraft.post_type}
              onChange={(event) =>
                setCurrentDraft((value) => ({
                  ...value,
                  post_type: event.target.value as AvisoPostType,
                }))
              }
              className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
            >
              {availableTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => setCurrentDraft((value) => ({ ...value, publicado: !value.publicado }))}
              className={cn(
                "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                currentDraft.publicado
                  ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                  : "border-border bg-background text-muted-foreground"
              )}
            >
              {currentDraft.publicado ? "Publicado" : "Borrador"}
            </button>
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {toolbarItems.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => insertSnippet(item.snippet)}
                  className="rounded-full border border-border bg-muted/20 px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <textarea
              ref={textareaRef}
              rows={10}
              value={currentDraft.contenido}
              onChange={(event) => setCurrentDraft((value) => ({ ...value, contenido: event.target.value }))}
              placeholder="Escribe tu publicación. Puedes usar Markdown y complementar con bloques o adjuntos."
              className="w-full rounded-[1.5rem] border border-input bg-background px-4 py-3 text-sm leading-6 outline-none"
            />
          </div>

          <section className="space-y-3 rounded-[1.5rem] border border-border bg-muted/15 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Adjuntos</p>
                <p className="text-xs text-muted-foreground">Imágenes, video, archivos o YouTube.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-sm">
                <UploadCloud className="h-3.5 w-3.5" />
                Subir
                <input
                  type="file"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0]
                    if (!file) return
                    startTransition(async () => {
                      try {
                        await uploadFile(file)
                        setFeedback(null)
                      } catch (error) {
                        setFeedback(error instanceof Error ? error.message : "No se pudo subir el archivo.")
                      }
                    })
                    event.currentTarget.value = ""
                  }}
                />
              </label>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                value={embedUrl}
                onChange={(event) => setEmbedUrl(event.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="flex-1 rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
              />
              <button
                type="button"
                onClick={() =>
                  startTransition(async () => {
                    try {
                      await addEmbed()
                      setFeedback(null)
                    } catch (error) {
                      setFeedback(error instanceof Error ? error.message : "No se pudo agregar el embed.")
                    }
                  })
                }
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm font-medium text-muted-foreground transition hover:text-foreground"
              >
                Agregar embed
              </button>
            </div>

            {currentDraft.attachments.length > 0 ? (
              <div className="space-y-2">
                <AvisoAttachments attachments={currentDraft.attachments} />
                <div className="flex flex-wrap gap-2">
                  {currentDraft.attachments.map((attachment) => (
                    <button
                      key={attachment.id}
                      type="button"
                      onClick={() => removeAttachment(attachment.id)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-500/5 px-3 py-1.5 text-xs font-medium text-red-600"
                    >
                      <X className="h-3.5 w-3.5" />
                      {attachment.title || attachment.file_name || "Adjunto"}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="space-y-3 rounded-[1.5rem] border border-border bg-muted/15 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">Bloques rápidos</p>
                <p className="text-xs text-muted-foreground">Callouts, citas y links destacados.</p>
              </div>
              <select
                value={blockDraft.type}
                onChange={(event) =>
                  setBlockDraft((value) => ({
                    ...value,
                    type: event.target.value as BlockDraft["type"],
                  }))
                }
                className="rounded-full border border-input bg-background px-3 py-2 text-xs outline-none"
              >
                <option value="callout">Callout</option>
                <option value="quote">Cita</option>
                <option value="link">Enlace</option>
              </select>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {blockDraft.type === "callout" ? (
                <>
                  <input
                    value={blockDraft.title}
                    onChange={(event) => setBlockDraft((value) => ({ ...value, title: event.target.value }))}
                    placeholder="Título del callout"
                    className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                  />
                  <select
                    value={blockDraft.tone}
                    onChange={(event) =>
                      setBlockDraft((value) => ({
                        ...value,
                        tone: event.target.value as BlockDraft["tone"],
                      }))
                    }
                    className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                  >
                    <option value="info">Informativo</option>
                    <option value="success">Positivo</option>
                    <option value="warning">Advertencia</option>
                  </select>
                  <textarea
                    value={blockDraft.text}
                    onChange={(event) => setBlockDraft((value) => ({ ...value, text: event.target.value }))}
                    rows={3}
                    placeholder="Mensaje destacado"
                    className="md:col-span-2 rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                  />
                </>
              ) : null}

              {blockDraft.type === "quote" ? (
                <>
                  <textarea
                    value={blockDraft.text}
                    onChange={(event) => setBlockDraft((value) => ({ ...value, text: event.target.value }))}
                    rows={3}
                    placeholder="Texto de la cita"
                    className="md:col-span-2 rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                  />
                  <input
                    value={blockDraft.author}
                    onChange={(event) => setBlockDraft((value) => ({ ...value, author: event.target.value }))}
                    placeholder="Autor o referencia"
                    className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                  />
                </>
              ) : null}

              {blockDraft.type === "link" ? (
                <>
                  <input
                    value={blockDraft.label}
                    onChange={(event) => setBlockDraft((value) => ({ ...value, label: event.target.value }))}
                    placeholder="Texto del link"
                    className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                  />
                  <input
                    value={blockDraft.href}
                    onChange={(event) => setBlockDraft((value) => ({ ...value, href: event.target.value }))}
                    placeholder="https://..."
                    className="rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                  />
                  <textarea
                    value={blockDraft.description}
                    onChange={(event) => setBlockDraft((value) => ({ ...value, description: event.target.value }))}
                    rows={3}
                    placeholder="Descripción del enlace"
                    className="md:col-span-2 rounded-2xl border border-input bg-background px-4 py-3 text-sm outline-none"
                  />
                </>
              ) : null}
            </div>

            <button
              type="button"
              onClick={addBlock}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
              Agregar bloque
            </button>

            {currentDraft.media_blocks.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {currentDraft.media_blocks.map((block) => (
                  <button
                    key={block.id}
                    type="button"
                    onClick={() => removeBlock(block.id)}
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground"
                  >
                    <Paperclip className="h-3.5 w-3.5" />
                    {block.type}
                  </button>
                ))}
              </div>
            ) : null}
          </section>
        </div>

        <aside className="space-y-4">
          <section className="space-y-3 rounded-[1.5rem] border border-border bg-muted/15 p-4">
            <p className="text-sm font-semibold text-foreground">Audiencia</p>

            <div className="grid grid-cols-2 gap-2">
              {(["admin", "leader", "staff", "user"] as AppRole[]).map((roleValue) => (
                <button
                  key={roleValue}
                  type="button"
                  onClick={() => toggleRole(roleValue)}
                  disabled={role !== "admin" && roleValue === "admin"}
                  className={cn(
                    "rounded-2xl border px-3 py-2 text-left text-sm transition",
                    currentDraft.audience_roles.includes(roleValue)
                      ? "border-primary/30 bg-primary/5 text-foreground"
                      : "border-border bg-background text-muted-foreground",
                    role !== "admin" && roleValue === "admin" ? "cursor-not-allowed opacity-50" : ""
                  )}
                >
                  <span className="block font-medium">{getRoleLabel(roleValue)}</span>
                  <span className="text-[11px] uppercase tracking-[0.16em]">{roleValue}</span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Grupos asignables</p>
              {availableGroups.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-border px-3 py-3 text-xs text-muted-foreground">
                  Puedes publicar en público general o esperar asignación de grupos.
                </p>
              ) : (
                availableGroups.map((group) => (
                  <button
                    key={group.id}
                    type="button"
                    onClick={() => toggleGroup(group.id)}
                    className={cn(
                      "w-full rounded-2xl border px-3 py-3 text-left transition",
                      currentDraft.audience_groups.includes(group.id)
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-background"
                    )}
                  >
                    <span className="block text-sm font-medium text-foreground">{group.name}</span>
                    {group.description ? (
                      <span className="mt-1 block text-xs text-muted-foreground">{group.description}</span>
                    ) : null}
                  </button>
                ))
              )}
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={currentDraft.allow_comments}
                  onChange={(event) =>
                    setCurrentDraft((value) => ({
                      ...value,
                      allow_comments: event.target.checked,
                    }))
                  }
                />
                Permitir comentarios
              </label>
              <label className="flex items-center gap-3 text-sm text-foreground">
                <input
                  type="checkbox"
                  checked={currentDraft.allow_reactions}
                  onChange={(event) =>
                    setCurrentDraft((value) => ({
                      ...value,
                      allow_reactions: event.target.checked,
                    }))
                  }
                />
                Permitir reacciones
              </label>
              {(role === "admin" || role === "leader") ? (
                <label className="flex items-center gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={currentDraft.is_pinned}
                    onChange={(event) =>
                      setCurrentDraft((value) => ({
                        ...value,
                        is_pinned: event.target.checked,
                      }))
                    }
                  />
                  Fijar en el feed
                </label>
              ) : null}
            </div>
          </section>

          <section className="space-y-3 rounded-[1.5rem] border border-border bg-background p-4 shadow-sm">
            <div>
              <p className="text-sm font-semibold text-foreground">Vista previa</p>
              <p className="text-xs text-muted-foreground">Autosave activo cada 1.5 segundos.</p>
            </div>
            <div className="space-y-3 rounded-[1.4rem] border border-border bg-muted/10 p-4">
              <h4 className="text-lg font-bold text-foreground">{currentDraft.titulo || "Título del aviso"}</h4>
              {currentDraft.summary ? (
                <p className="text-sm text-muted-foreground">{currentDraft.summary}</p>
              ) : null}
              <AvisoContent content={currentDraft.contenido} mediaBlocks={currentDraft.media_blocks} compact />
              <AvisoAttachments attachments={currentDraft.attachments} />
            </div>
          </section>
        </aside>
      </div>

      {feedback ? <p className="text-sm text-destructive">{feedback}</p> : null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          {currentDraft.publicado ? "Se publicará al guardar." : "Se guardará como borrador."}
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:opacity-60"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {currentDraft.id ? "Actualizar publicación" : "Guardar publicación"}
        </button>
      </div>
    </form>
  )
}
