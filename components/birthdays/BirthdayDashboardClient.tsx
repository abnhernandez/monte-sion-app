"use client"

import Link from "next/link"
import { useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { CalendarRange, Filter, Sparkles, Users } from "lucide-react"
import BirthdayCard from "@/components/BirthdayCard"
import BirthdayBaseForm from "@/components/birthdays/BirthdayBaseForm"
import { BirthdayEmptyState, BirthdayHero, BirthdaySection } from "@/components/birthdays/birthday-ui"
import { saveBirthday, setBirthdayActive } from "@/lib/birthdays/actions"
import type {
  BirthdayDashboardData,
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

export default function BirthdayDashboardClient({ data }: { data: BirthdayDashboardData }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [query, setQuery] = useState("")
  const [leaderFilter, setLeaderFilter] = useState("all")
  const [ministryFilter, setMinistryFilter] = useState("all")
  const [form, setForm] = useState<SaveBirthdayInput>(EMPTY_FORM)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const canManageBase = data.role === "admin" || data.role === "leader"
  const isAdmin = data.role === "admin"

  const ministries = useMemo(
    () =>
      [...new Set(data.birthdays.map((birthday) => birthday.ministryName))]
        .filter(Boolean)
        .sort((a, b) => a.localeCompare(b)),
    [data.birthdays]
  )

  const filteredBirthdays = useMemo(() => {
    return data.birthdays.filter((birthday) => {
      const matchesQuery =
        birthday.name.toLowerCase().includes(query.toLowerCase()) ||
        birthday.ministryName.toLowerCase().includes(query.toLowerCase()) ||
        (birthday.leaderName ?? "").toLowerCase().includes(query.toLowerCase())
      const matchesLeader = leaderFilter === "all" || birthday.leaderId === leaderFilter
      const matchesMinistry = ministryFilter === "all" || birthday.ministryName === ministryFilter

      return matchesQuery && matchesLeader && matchesMinistry
    })
  }, [data.birthdays, leaderFilter, ministryFilter, query])

  const upcomingBirthdays = filteredBirthdays.filter(
    (birthday) => birthday.daysUntil >= 0 && birthday.daysUntil <= 30
  )

  const groupedBirthdays = useMemo(() => {
    return filteredBirthdays.reduce<Record<string, BirthdaySummary[]>>((groups, birthday) => {
      groups[birthday.monthLabel] ||= []
      groups[birthday.monthLabel].push(birthday)
      return groups
    }, {})
  }, [filteredBirthdays])

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
  }

  function handleSubmit() {
    startTransition(async () => {
      try {
        await saveBirthday(form)
        setFeedback(editingId ? "Registro actualizado." : "Persona agregada a cumples.")
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

  return (
    <div className="space-y-8">
      <BirthdayHero
        eyebrow="Cumples del grupo"
        title="Todo listo para cada cumple"
        description="Consulta los próximos cumpleaños, la palabra sugerida, los motivos de oración y la información base sin perder tiempo ni contexto."
        tone="primary"
        actions={
          isAdmin ? (
            <Link
              href="/birthdays/admin"
              className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary transition hover:border-primary/35 hover:bg-primary/15"
            >
              Abrir admin de cumples
            </Link>
          ) : null
        }
        metrics={[
          { label: "Activos", value: data.birthdays.length },
          { label: "Próximos 30 días", value: data.upcomingBirthdays.length },
          { label: "Líderes", value: data.leaders.length },
        ]}
      />

      {canManageBase ? (
        <BirthdayBaseForm
          title={editingId ? "Editar registro base" : "Agregar persona al grupo"}
          description="Admin y líder pueden crear, editar y pausar los registros base sin salir de esta vista."
          tone="primary"
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
          submitLabel="Crear ficha"
          submitEditingLabel="Guardar cambios"
        />
      ) : null}

      <BirthdaySection
        eyebrow="Próximos 30 días"
        title="Cumples que ya vienen"
        description="La vista prioriza lo cercano para que la coordinación sea rápida y sin ruido visual."
        icon={<CalendarRange size={16} />}
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
            <Sparkles size={16} className="text-primary" />
            Palabra, oración y detalles en un solo lugar
          </div>
        }
      >
        <div className="grid gap-4 xl:grid-cols-2">
          {upcomingBirthdays.length === 0 ? (
            <BirthdayEmptyState
              title="Sin cumpleaños próximos"
              description="No hay registros que coincidan con los filtros actuales dentro de los próximos 30 días."
            />
          ) : (
            upcomingBirthdays.map((birthday) => (
              <BirthdayCard
                key={birthday.id}
                birthday={birthday}
                canManage={canManageBase}
                onEdit={handleEdit}
                onToggleActive={handleToggleActive}
              />
            ))
          )}
        </div>
      </BirthdaySection>

      <BirthdaySection
        eyebrow="Filtros"
        title="Vista anual por mes"
        description="Busca por persona, grupo o líder y deja la página con menos ruido mental."
        icon={<Filter size={16} />}
        action={
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-sm text-muted-foreground">
            <Users size={16} className="text-primary" />
            {Object.entries(groupedBirthdays).length} grupos visibles
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
            value={ministryFilter}
            onChange={(event) => setMinistryFilter(event.target.value)}
            className="rounded-full border border-input bg-background px-4 py-3 text-sm text-foreground outline-none"
          >
            <option value="all">Todos los ministerios</option>
            {ministries.map((ministry) => (
              <option key={ministry} value={ministry}>
                {ministry}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-8 space-y-8">
          {Object.entries(groupedBirthdays).length === 0 ? (
            <BirthdayEmptyState
              title="No encontramos resultados"
              description="Revisa los filtros activos o limpia la búsqueda para volver a ver los registros agrupados por mes."
            />
          ) : (
            Object.entries(groupedBirthdays).map(([monthLabel, birthdays]) => (
              <div key={monthLabel} className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2 text-primary">
                    <Users size={16} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground sm:text-xl">{monthLabel}</h3>
                    <p className="text-sm text-muted-foreground">{birthdays.length} cumples en este mes</p>
                  </div>
                </div>

                <div className="grid gap-4 xl:grid-cols-2">
                  {birthdays.map((birthday) => (
                    <BirthdayCard
                      key={birthday.id}
                      birthday={birthday}
                      canManage={canManageBase}
                      onEdit={handleEdit}
                      onToggleActive={handleToggleActive}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </BirthdaySection>
    </div>
  )
}
