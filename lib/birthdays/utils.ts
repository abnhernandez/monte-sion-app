import type {
  BirthdayOccurrenceRecord,
  BirthdayOccurrenceStatus,
  BirthdayRecord,
  BirthdaySummary,
} from "@/lib/birthdays/types"

const TIMEZONE = "America/Mexico_City"
const MONTHS_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const
const MONTHS_SHORT = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const

export function padDate(value: number) {
  return String(value).padStart(2, "0")
}

export function getTodayIsoDate(referenceDate = new Date()) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(referenceDate)
}

export function parseIsoDate(value: string) {
  return new Date(`${value}T12:00:00`)
}

function getIsoDateParts(value: string) {
  const [year, month, day] = value.split("T")[0].split("-").map(Number)

  if (!year || !month || !day) {
    throw new Error("Fecha invalida.")
  }

  return { year, month, day }
}

function getDateTimeParts(value: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date(value))

  const getPart = (type: string) => parts.find((part) => part.type === type)?.value ?? ""

  return {
    year: Number(getPart("year")),
    month: Number(getPart("month")),
    day: Number(getPart("day")),
    hour: getPart("hour"),
    minute: getPart("minute"),
  }
}

export function formatBirthdayDate(value: string) {
  const { year, month, day } = getIsoDateParts(value)
  return `${day} de ${MONTHS_LONG[month - 1]} de ${year}`
}

export function formatBirthdayShortDate(value: string) {
  const { month, day } = getIsoDateParts(value)
  return `${day} ${MONTHS_SHORT[month - 1]}`
}

export function formatBirthdayDateTime(value: string | null) {
  if (!value) {
    return "Aún no"
  }

  const { year, month, day, hour, minute } = getDateTimeParts(value)
  return `${day} ${MONTHS_SHORT[month - 1]} ${year}, ${hour}:${minute}`
}

export function getMonthKey(value: string) {
  const date = parseIsoDate(value)
  const year = date.getUTCFullYear()
  const month = date.getUTCMonth() + 1
  return `${year}-${padDate(month)}`
}

export function getMonthLabel(value: string) {
  const { year, month } = getIsoDateParts(value)
  return `${MONTHS_LONG[month - 1]} ${year}`
}

export function getDaysUntilDate(value: string, referenceDate = getTodayIsoDate()) {
  const start = parseIsoDate(referenceDate)
  const end = parseIsoDate(value)
  const msPerDay = 1000 * 60 * 60 * 24
  return Math.round((end.getTime() - start.getTime()) / msPerDay)
}

export function getDaysUntilLabel(daysUntil: number) {
  if (daysUntil === 0) {
    return "Hoy"
  }

  if (daysUntil === 1) {
    return "Mañana"
  }

  if (daysUntil < 0) {
    return `Hace ${Math.abs(daysUntil)} dias`
  }

  return `En ${daysUntil} dias`
}

export function isLeapYear(year: number) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
}

export function getCelebrationDateForYear(birthDate: string, year: number) {
  const [rawYear, rawMonth, rawDay] = birthDate.split("-").map(Number)
  const month = rawMonth
  const day = rawMonth === 2 && rawDay === 29 && !isLeapYear(year) ? 28 : rawDay

  if (!rawYear || !month || !rawDay) {
    throw new Error("Fecha de nacimiento invalida.")
  }

  return `${year}-${padDate(month)}-${padDate(day)}`
}

export function getTurningAgeForYear(birthDate: string, year: number) {
  const [birthYear] = birthDate.split("-").map(Number)
  if (!birthYear) {
    throw new Error("Fecha de nacimiento invalida.")
  }

  return year - birthYear
}

export function buildOccurrenceSeed(
  birthday: Pick<BirthdayRecord, "id" | "birthDate">,
  year: number
) {
  return {
    birthday_id: birthday.id,
    celebration_year: year,
    birthday_date_for_year: getCelebrationDateForYear(birthday.birthDate, year),
    turning_age: getTurningAgeForYear(birthday.birthDate, year),
  }
}

export function pickUpcomingOccurrence(
  occurrences: BirthdayOccurrenceRecord[],
  referenceDate = getTodayIsoDate()
) {
  const sorted = [...occurrences].sort((a, b) =>
    a.birthdayDateForYear.localeCompare(b.birthdayDateForYear)
  )

  return (
    sorted.find((occurrence) => occurrence.birthdayDateForYear >= referenceDate) ??
    sorted[0] ??
    null
  )
}

export function getOccurrenceStatusLabel(status: BirthdayOccurrenceStatus) {
  const labels: Record<BirthdayOccurrenceStatus, string> = {
    pending: "Por preparar",
    prayed: "Ya oramos",
    ready: "Todo listo",
    celebrated: "Ya se celebró",
  }

  return labels[status]
}

export function getOccurrenceStatusTone(status: BirthdayOccurrenceStatus) {
  const tones: Record<BirthdayOccurrenceStatus, string> = {
    pending: "bg-amber-400/15 text-amber-200 border-amber-400/30",
    prayed: "bg-sky-400/15 text-sky-200 border-sky-400/30",
    ready: "bg-violet-400/15 text-violet-200 border-violet-400/30",
    celebrated: "bg-emerald-400/15 text-emerald-200 border-emerald-400/30",
  }

  return tones[status]
}

export function sortBirthdaysByUpcomingDate(birthdays: BirthdaySummary[]) {
  return [...birthdays].sort((a, b) => {
    if (a.daysUntil === b.daysUntil) {
      return a.name.localeCompare(b.name)
    }

    return a.daysUntil - b.daysUntil
  })
}
