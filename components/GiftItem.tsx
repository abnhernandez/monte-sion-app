"use client"

import { Gift, LockKeyhole, PencilLine, Trash2, Undo2 } from "lucide-react"
import type { AppRole } from "@/lib/roles"
import type { BirthdayGiftRecord } from "@/lib/birthdays/types"

type Props = {
  gift: BirthdayGiftRecord
  currentUserId: string
  role: AppRole
  busy: boolean
  canDelete: boolean
  canEdit: boolean
  onReserve: (giftId: string) => void
  onRelease: (giftId: string) => void
  onDelete: (giftId: string) => void
  onEdit: (gift: BirthdayGiftRecord) => void
}

export default function GiftItem({
  gift,
  currentUserId,
  role,
  busy,
  canDelete,
  canEdit,
  onReserve,
  onRelease,
  onDelete,
  onEdit,
}: Props) {
  const reservedByMe = gift.reservedByProfileId === currentUserId
  const canRelease = role === "admin" || reservedByMe

  return (
    <div className="rounded-2xl border border-border bg-background/90 p-4 shadow-sm transition hover:border-primary/20">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-foreground">
            <Gift size={16} className="text-primary" />
            <h4 className="font-semibold">{gift.title}</h4>
          </div>
          {gift.description ? <p className="mt-2 text-sm text-muted-foreground">{gift.description}</p> : null}
          {gift.createdByName ? (
            <p className="mt-2 text-xs text-muted-foreground">
              Creado por {gift.createdByName}
            </p>
          ) : null}
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${
            gift.reservedByProfileId
              ? "bg-primary/10 text-primary"
              : "bg-muted/70 text-muted-foreground"
          }`}
        >
          {gift.reservedByProfileId ? "Reservado" : "Disponible"}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {gift.reservedByProfileId ? (
          <>
            <p className="text-sm text-muted-foreground">
              Reservado por <span className="font-semibold text-foreground">{gift.reservedByName ?? "alguien del equipo"}</span>
            </p>
            {canRelease ? (
              <button
                onClick={() => onRelease(gift.id)}
                disabled={busy}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground disabled:opacity-60"
              >
                <Undo2 size={14} />
                Liberar
              </button>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
                <LockKeyhole size={14} />
                Solo el responsable puede liberar
              </span>
            )}
          </>
        ) : (
          <button
            onClick={() => onReserve(gift.id)}
            disabled={busy}
            className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            Reservar para mí
          </button>
        )}

        {canEdit ? (
          <button
            onClick={() => onEdit(gift)}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground disabled:opacity-60"
          >
            <PencilLine size={14} />
            Editar
          </button>
        ) : null}

        {canDelete ? (
          <button
            onClick={() => onDelete(gift.id)}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full border border-red-400/20 bg-red-500/5 px-3 py-2 text-xs font-medium text-red-600 transition hover:border-red-400/35 hover:text-red-700 disabled:opacity-60"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        ) : null}
      </div>
    </div>
  )
}
