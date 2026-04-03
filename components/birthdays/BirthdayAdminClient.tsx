"use client"

import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Filter, Shield, Sparkles, Users } from "lucide-react"
import BirthdayCard from "@/components/BirthdayCard"
import BirthdayBaseForm from "@/components/birthdays/BirthdayBaseForm"
import { BirthdayEmptyState, BirthdayHero, BirthdaySection } from "@/components/birthdays/birthday-ui"
import {
  deleteBirthday,
  saveBirthday,
  setBirthdayActive,
} from "@/lib/birthdays/actions"
import type {
  BirthdayAdminData,
  BirthdaySummary,
  SaveBirthdayInput,
} from "@/lib/birthdays/types"

const EMPTY_FORM: SaveBirthdayInput = {
  name: "",
  birthDate: "",
  ministryName: "",
  profileId: "",
  leaderId: "",
  cakeNote: "",
  generalNote: "",
  isActive: true,
}

type ActivityFilter = "all" | "active" | "inactive"
type StatusFilter = "all" | BirthdaySummary["nextOccurrence"]["status"]

export default function BirthdayAdminClient({ data }: { data: BirthdayAdminData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState("")
  const [leaderFilter, setLeaderFilter] = useState("all")
  const [activityFilter, setActivityFilter] = useState<ActivityFilter>("all")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [form, setForm] = useState<SaveBirthdayInput>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const filteredBirthdays = useMemo(() => {
    return data.birthdays.filter((birthday) => {
      const matchesQuery =
        birthday.name.toLowerCase().includes(query.toLowerCase()) ||
        birthday.ministryName.toLowerCase().includes(query.toLowerCase()) ||
        (birthday.leaderName ?? "").toLowerCase().includes(query.toLowerCase())
      const matchesLeader = leaderFilter === "all" || birthday.leaderId === leaderFilter
      const matchesActivity =
        activityFilter === "all" ||
        (activityFilter === "active" ? birthday.isActive : !birthday.isActive)
      const matchesStatus =
        statusFilter === "all" || birthday.nextOccurrence.status === statusFilter

      return matchesQuery && matchesLeader && matchesActivity && matchesStatus
    })
  }, [activityFilter, data.birthdays, leaderFilter, query, statusFilter])

  function resetForm() {
    setForm(EMPTY_FORM)
    setEditingId(null)
  }

  function handleEdit(birthday: BirthdaySummary) {
    setEditingId(birthday.id)
    setForm({
      id: birthday.id,
      profileId: birthday.profileId ?? "",
      name: birthday.name,
      birthDate: birthday.birthDate,
      ministryName: birthday.ministryName,
      leaderId: birthday.leaderId ?? "",
      cakeNote: birthday.cakeNote,
      generalNote: birthday.generalNote,
      isActive: birthday.isActive,
    })

    document.getElementById("birthday-admin-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        await saveBirthday(form)
        setFeedback(editingId ? "Registro actualizado." : "Nuevo cumple agregado.")
        setErrorMessage(null)
        resetForm()
        router.refresh()
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo guardar este registro.")
      }
    })
  }

  function handleToggleActive(birthday: BirthdaySummary) {
    startTransition(async () => {
      try {
        await setBirthdayActive(birthday.id, !birthday.isActive)
        setFeedback(birthday.isActive ? "Registro pausado." : "Registro reactivado.")
        setErrorMessage(null)
        router.refresh()
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo actualizar este registro.")
      }
    })
  }

  function handleDelete(birthday: BirthdaySummary) {
    const confirmed = window.confirm(`Se va a eliminar el registro de ${birthday.name}. Esta acción no se puede deshacer.`)
    if (!confirmed) {
      return
    }

    startTransition(async () => {
      try {
        await deleteBirthday(birthday.id)
        setFeedback("Registro eliminado.")
        setErrorMessage(null)
        if (editingId === birthday.id) {
          resetForm()
        }
        router.refresh()
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "No se pudo eliminar este registro.")
      }
    })
  }

  return (
    <div className="space-y-8">
      <BirthdayHero
        eyebrow="Admin de cumples"
        title="Control total de cumpleaños"
        description="Desde aquí puedes crear, editar, asignar líderes, pausar, reactivar y eliminar registros sin saturar la pantalla."
        tone="gold"
        backHref="/birthdays"
        backLabel="Volver a cumples"
        metrics={[
          { label: "Total", value: data.stats.total },
          { label: "Activos", value: data.stats.active },
          { label: "Inactivos", value: data.stats.inactive },
          { label: "Sin líder", value: data.stats.withoutLeader },
          { label: "Próximos 30 días", value: data.stats.upcoming30 },
          { label: "Líderes disponibles", value: data.leaders.length },
        ]}
      />

      <BirthdayBaseForm
        title={editingId ? "Editar o reasignar" : "Agregar nuevo cumple"}
        description="Define la persona, su fecha y el líder asignado desde un formulario más legible y consistente."
        tone="gold"
        form={form}
        setForm={setForm}
        editingId={editingId}
        isPending={isPending}
        feedback={feedback}
        errorMessage={errorMessage}
        profileOptions={data.profileOptions}
        leaders={data.leaders}
        onSubmit={handleSubmit}
        onCancel={resetForm}
        submitLabel="Crear registro"
        submitEditingLabel="Guardar cambios"
      />

      <BirthdaySection
        eyebrow="Centro de control"
        title="Administrar todos los cumples"
        description="Filtra, edita y corrige sin ruido visual para mantener el control con menos esfuerzo cognitivo."
        tone="gold"
        icon={<Shield size={16} />}
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
            <Sparkles size={16} className="text-[#d9b65d]" />
            Edita, asigna líder, cambia estado o elimina desde aquí
          </div>
        }
      >
        <div className="grid gap-3 xl:grid-cols-[1.4fr_1fr_1fr]">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar nombre, grupo o líder"
            className="rounded-full border border-input bg-background px-4 py-3 text-sm text-foreground outline-none placeholder:text-muted-foreground"
          />
          <select
            value={leaderFilter}
            onChange={(event) => setLeaderFilter(event.target.value)}
            className="rounded-full border border-input bg-background px-4 py-3 text-sm text-foreground outline-none"
          >
            <option value="all">Todos los líderes</option>
            {data.leaders.map((leader) => (
              <option key={leader.id} value={leader.id}>
                {leader.name ?? leader.email ?? "Líder sin nombre"}
              </option>
            ))}
          </select>
          <select
            value={activityFilter}
            onChange={(event) => setActivityFilter(event.target.value as ActivityFilter)}
            className="rounded-full border border-input bg-background px-4 py-3 text-sm text-foreground outline-none"
          >
            <option value="all">Activos e inactivos</option>
            <option value="active">Solo activos</option>
            <option value="inactive">Solo inactivos</option>
          </select>
        </div>

        <div className="mt-3 grid gap-3 md:grid-cols-3">
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
            <Filter size={16} className="text-[#d9b65d]" />
            {filteredBirthdays.length} registros visibles
          </div>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
            className="rounded-full border border-input bg-background px-4 py-3 text-sm text-foreground outline-none"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Por preparar</option>
            <option value="prayed">Ya oramos</option>
            <option value="ready">Todo listo</option>
            <option value="celebrated">Ya se celebró</option>
          </select>
          <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
            <Users size={16} className="text-[#d9b65d]" />
            {data.stats.withoutLeader} sin líder asignado
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {filteredBirthdays.length === 0 ? (
            <BirthdayEmptyState
              title="No encontramos registros"
              description="Ajusta los filtros para volver a ver el listado completo de cumpleaños y sus estados."
            />
          ) : (
            filteredBirthdays.map((birthday) => (
              <BirthdayCard
                key={birthday.id}
                birthday={birthday}
                canManage
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </BirthdaySection>
    </div>
  )
}
