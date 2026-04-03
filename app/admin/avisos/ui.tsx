"use client"

import {
  togglePublicarAviso,
  deleteAviso,
} from "@/lib/avisos-actions"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CalendarClock, Eye, EyeOff, PencilLine, Plus, Sparkles, Trash2, X } from "lucide-react"
import AvisoEditor from "@/components/avisos/aviso-editor"
import AvisoContent from "@/components/avisos/aviso-content"
import type { AvisoRecord } from "@/lib/avisos-types"
import { cn } from "@/lib/utils"
import { getRoleLabel } from "@/lib/roles"

type GroupOption = {
  id: string
  name: string
  description: string | null
}

export default function AvisosAdminClient({
  avisos,
  groups,
  onRequestClose,
}: {
  avisos: AvisoRecord[]
  groups: GroupOption[]
  onRequestClose?: () => void
}) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [selectedAviso, setSelectedAviso] = useState<AvisoRecord | null>(null)
  const [composerOpen, setComposerOpen] = useState(false)

  function audienceSummary(aviso: AvisoRecord) {
    const parts: string[] = []

    const groupNames = new Map(groups.map((group) => [group.id, group.name]))

    if (aviso.audience_roles.length > 0) {
      parts.push(aviso.audience_roles.map((role) => getRoleLabel(role)).join(", "))
    }

    if (aviso.audience_groups.length > 0) {
      parts.push(aviso.audience_groups.map((groupId) => groupNames.get(groupId) ?? groupId).join(", "))
    }

    return parts.length > 0 ? parts.join(" · ") : "Toda la comunidad"
  }

  function handleSelectDraft(aviso: AvisoRecord) {
    setSelectedAviso(aviso)
    setComposerOpen(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  function handleSaved() {
    router.refresh()
    setSelectedAviso(null)
    setComposerOpen(false)
    onRequestClose?.()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border bg-background/80 px-4 py-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Gestión</p>
            <h3 className="text-base font-bold text-foreground">Avisos y publicaciones</h3>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setSelectedAviso(null)
            setComposerOpen((value) => !value)
          }}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary/90"
        >
          <Plus className={cn("h-4 w-4 transition-transform", composerOpen ? "rotate-45" : "")} />
          Nuevo aviso
        </button>
      </div>

      {composerOpen ? (
        <section className="overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-sm">
          <div className="flex items-center justify-between gap-3 border-b border-border/70 bg-gradient-to-r from-primary/10 via-background to-background px-5 py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Editor</p>
              <h4 className="text-lg font-bold text-foreground">{selectedAviso ? "Editar aviso" : "Crear aviso"}</h4>
            </div>
            <button
              type="button"
              onClick={() => setComposerOpen(false)}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition hover:text-foreground"
            >
              <X className="h-3.5 w-3.5" />
              Cerrar
            </button>
          </div>
          <div className="p-4 sm:p-6">
            <AvisoEditor
              groups={groups}
              draft={selectedAviso}
              onSaved={handleSaved}
              onCancelEdit={() => {
                setSelectedAviso(null)
                setComposerOpen(false)
                onRequestClose?.()
              }}
            />
          </div>
        </section>
      ) : null}

      <div className="space-y-3">
        {avisos.length === 0 ? (
          <div className="rounded-[1.75rem] border border-dashed border-border bg-background p-8 text-center shadow-sm">
            <CalendarClock className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-3 text-base font-semibold text-foreground">Todavía no hay avisos</p>
            <p className="mt-1 text-sm text-muted-foreground">Pulsa el botón + para crear el primero.</p>
          </div>
        ) : (
          avisos.map((aviso) => (
            <article key={aviso.id} className="overflow-hidden rounded-[1.75rem] border border-border bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/70 bg-gradient-to-r from-background via-background to-primary/5 px-5 py-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-base font-semibold text-foreground">{aviso.titulo}</h3>
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
                        aviso.publicado
                          ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                          : "bg-amber-500/10 text-amber-700 dark:text-amber-300"
                      )}
                    >
                      {aviso.publicado ? "Publicado" : "Borrador"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{audienceSummary(aviso)}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleSelectDraft(aviso)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/20 px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                  >
                    <PencilLine className="h-3.5 w-3.5" />
                    Editar
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await togglePublicarAviso(aviso.id, !aviso.publicado)
                        router.refresh()
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/30 hover:text-foreground"
                  >
                    {aviso.publicado ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {aviso.publicado ? "Despublicar" : "Publicar"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await deleteAviso(aviso.id)
                        router.refresh()
                      })
                    }
                    className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-600 transition hover:border-red-400/40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="space-y-4 px-5 py-5 sm:px-6">
                <AvisoContent content={aviso.contenido} mediaBlocks={aviso.media_blocks} compact />

                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  {aviso.audience_roles.map((role) => (
                    <span key={role} className="rounded-full border border-border bg-background px-2.5 py-1 font-medium">
                      Rol: {getRoleLabel(role)}
                    </span>
                  ))}
                  {aviso.audience_groups.map((group) => (
                    <span key={group} className="rounded-full border border-border bg-background px-2.5 py-1 font-medium">
                      Grupo: {group}
                    </span>
                  ))}
                  {aviso.audience_roles.length === 0 && aviso.audience_groups.length === 0 ? (
                    <span className="rounded-full border border-border bg-background px-2.5 py-1 font-medium">Audiencia pública</span>
                  ) : null}
                </div>
              </div>
            </article>
          ))
        )}
      </div>
    </div>
  )
}
