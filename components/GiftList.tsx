"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Gift, Plus } from "lucide-react"
import type { AppRole } from "@/lib/roles"
import { canManageBirthdayGifts } from "@/lib/roles"
import type { BirthdayGiftRecord } from "@/lib/birthdays/types"
import { BirthdayEmptyState, BirthdaySection } from "@/components/birthdays/birthday-ui"
import {
  deleteBirthdayGift,
  releaseBirthdayGift,
  reserveBirthdayGift,
  saveBirthdayGift,
} from "@/lib/birthdays/actions"
import GiftItem from "@/components/GiftItem"

type Props = {
  gifts: BirthdayGiftRecord[]
  occurrenceId: string
  currentUserId: string
  role: AppRole
}

export default function GiftList({ gifts, occurrenceId, currentUserId, role }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [editingGiftId, setEditingGiftId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const canCreateGifts = canManageBirthdayGifts(role)
  const canManageAllGifts = role === "admin" || role === "leader"

  function refreshWithFeedback(successMessage: string) {
    setFeedback(successMessage)
    setErrorMessage(null)
    router.refresh()
  }

  function resetForm() {
    setTitle("")
    setDescription("")
    setEditingGiftId(null)
  }

  function handleAddGift() {
    startTransition(async () => {
      try {
        await saveBirthdayGift({
          giftId: editingGiftId ?? undefined,
          occurrenceId,
          title,
          description,
        })
        const message = editingGiftId ? "Regalo actualizado." : "Regalo agregado."
        resetForm()
        refreshWithFeedback(message)
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo agregar el regalo.")
      }
    })
  }

  function handleReserve(giftId: string) {
    startTransition(async () => {
      try {
        await reserveBirthdayGift(giftId)
        refreshWithFeedback("Regalo reservado.")
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo reservar el regalo.")
      }
    })
  }

  function handleRelease(giftId: string) {
    startTransition(async () => {
      try {
        await releaseBirthdayGift(giftId)
        refreshWithFeedback("Reserva liberada.")
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo liberar la reserva.")
      }
    })
  }

  function handleDelete(giftId: string) {
    startTransition(async () => {
      try {
        await deleteBirthdayGift(giftId)
        refreshWithFeedback("Regalo eliminado.")
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar el regalo.")
      }
    })
  }

  function handleEditGift(gift: BirthdayGiftRecord) {
    setEditingGiftId(gift.id)
    setTitle(gift.title)
    setDescription(gift.description)
    setFeedback(null)
    setErrorMessage(null)
  }

  return (
    <BirthdaySection
      eyebrow="Regalos"
      title="Lista de regalos"
      description="Cada regalo queda ligado al cumple activo para evitar duplicidad y coordinar mejor entre equipo."
      icon={<Gift size={18} />}
    >
      {canCreateGifts ? (
        <div className="grid gap-3 rounded-3xl border border-border bg-muted/20 p-4 lg:grid-cols-[1.1fr_1.4fr_auto]">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Ej. Biblia de estudio"
            className="rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Detalle opcional del regalo"
            className="rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <button
            onClick={handleAddGift}
            disabled={isPending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
          >
            <Plus size={16} />
            {editingGiftId ? "Actualizar" : "Agregar"}
          </button>
          {editingGiftId ? (
            <button
              onClick={resetForm}
              className="rounded-full border border-border px-4 py-3 text-sm font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground lg:col-span-3"
            >
              Cancelar edición
            </button>
          ) : null}
        </div>
      ) : null}

      {feedback ? <p className="mt-3 text-sm text-primary">{feedback}</p> : null}
      {errorMessage ? <p className="mt-3 text-sm text-destructive">{errorMessage}</p> : null}

      <div className="mt-5 space-y-3">
        {gifts.length === 0 ? (
          <BirthdayEmptyState
            title="Todavía no hay ideas de regalos"
            description="Agrega una idea breve y reserva lo necesario desde esta misma vista."
          />
        ) : (
          gifts.map((gift) => (
            <GiftItem
              key={gift.id}
              gift={gift}
              currentUserId={currentUserId}
              role={role}
              busy={isPending}
              canDelete={canManageAllGifts || gift.createdByProfileId === currentUserId}
              canEdit={canManageAllGifts || gift.createdByProfileId === currentUserId}
              onReserve={handleReserve}
              onRelease={handleRelease}
              onDelete={handleDelete}
              onEdit={handleEditGift}
            />
          ))
        )}
      </div>
    </BirthdaySection>
  )
}
