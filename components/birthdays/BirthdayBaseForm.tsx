"use client"

import type { Dispatch, SetStateAction } from "react"
import { BirthdaySection } from "@/components/birthdays/birthday-ui"
import type { SaveBirthdayInput } from "@/lib/birthdays/types"

type ProfileOption = {
  id: string
  name: string | null
  email: string | null
  role: string
}

type LeaderOption = {
  id: string
  name: string | null
  email: string | null
}

type BirthdayBaseFormProps = {
  title: string
  description: string
  tone?: "primary" | "gold"
  form: SaveBirthdayInput
  setForm: Dispatch<SetStateAction<SaveBirthdayInput>>
  editingId: string | null
  isPending: boolean
  feedback: string | null
  errorMessage: string | null
  profileOptions: ProfileOption[]
  leaders: LeaderOption[]
  onSubmit: () => void
  onCancel: () => void
  submitLabel: string
  submitEditingLabel: string
}

export default function BirthdayBaseForm({
  title,
  description,
  tone = "primary",
  form,
  setForm,
  editingId,
  isPending,
  feedback,
  errorMessage,
  profileOptions,
  leaders,
  onSubmit,
  onCancel,
  submitLabel,
  submitEditingLabel,
}: BirthdayBaseFormProps) {
  return (
    <BirthdaySection
      eyebrow="Registro base"
      title={title}
      description={description}
      tone={tone}
      action={
        editingId ? (
          <button
            onClick={onCancel}
            className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium text-muted-foreground transition hover:border-primary/35 hover:text-foreground"
          >
            Cancelar edición
          </button>
        ) : null
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Nombre visible"
          className="rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <input
          type="date"
          value={form.birthDate}
          onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))}
          className="rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none"
        />
        <input
          value={form.ministryName}
          onChange={(event) => setForm((current) => ({ ...current, ministryName: event.target.value }))}
          placeholder="Ministerio o grupo"
          className="rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <input
          value={form.cakeNote ?? ""}
          onChange={(event) => setForm((current) => ({ ...current, cakeNote: event.target.value }))}
          placeholder="Pastel o preferencia"
          className="rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
        />
        <select
          value={form.profileId ?? ""}
          onChange={(event) => setForm((current) => ({ ...current, profileId: event.target.value }))}
          className="rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none"
        >
          <option value="">Sin cuenta vinculada</option>
          {profileOptions.map((profile) => (
            <option key={profile.id} value={profile.id}>
              {(profile.name ?? profile.email ?? "Perfil sin nombre")} · {profile.email ?? profile.role}
            </option>
          ))}
        </select>
        <select
          value={form.leaderId ?? ""}
          onChange={(event) => setForm((current) => ({ ...current, leaderId: event.target.value }))}
          className="rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground outline-none"
        >
          <option value="">Aún sin líder asignado</option>
          {leaders.map((leader) => (
            <option key={leader.id} value={leader.id}>
              {leader.name ?? leader.email ?? "Líder sin nombre"}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-3 rounded-2xl border border-input bg-background px-4 py-3 text-sm text-foreground">
          <input
            type="checkbox"
            checked={form.isActive ?? true}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          />
          Registro activo
        </label>
      </div>

      <textarea
        value={form.generalNote ?? ""}
        onChange={(event) => setForm((current) => ({ ...current, generalNote: event.target.value }))}
        rows={4}
        placeholder="Notas generales para recordar detalles importantes"
        className="mt-4 w-full rounded-[1.4rem] border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
      />

      {feedback ? <p className="mt-4 text-sm text-primary">{feedback}</p> : null}
      {errorMessage ? <p className="mt-4 text-sm text-destructive">{errorMessage}</p> : null}

      <div className="mt-5 flex flex-wrap gap-3">
        <button
          onClick={onSubmit}
          disabled={isPending}
          className="rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-60"
        >
          {editingId ? submitEditingLabel : submitLabel}
        </button>
      </div>
    </BirthdaySection>
  )
}