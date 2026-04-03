import "server-only"

import { createNotification } from "@/lib/notifications"
import { supabaseAdmin } from "@/lib/supabase-admin"
import type {
  BirthdayAdminData,
  BirthdayCommentRecord,
  BirthdayDashboardData,
  BirthdayDetailData,
  BirthdayGiftRecord,
  BirthdayLeaderOption,
  BirthdayOccurrenceRecord,
  BirthdayProfileOption,
  BirthdayRecord,
  BirthdaySummary,
} from "@/lib/birthdays/types"
import type { BirthdayActor } from "@/lib/birthdays/auth"
import {
  buildOccurrenceSeed,
  formatBirthdayDate,
  getDaysUntilDate,
  getMonthKey,
  getMonthLabel,
  getTodayIsoDate,
  pickUpcomingOccurrence,
  sortBirthdaysByUpcomingDate,
} from "@/lib/birthdays/utils"
import { sendBirthdayReminderEmail } from "@/lib/birthdays/email"
import { getSafeAppRole } from "@/lib/roles"

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isUuid(value: string) {
  return UUID_PATTERN.test(value)
}

function normalizeBirthdayIds(ids: string[]) {
  return [...new Set(ids.map((id) => id.trim()).filter(isUuid))]
}

function mapBirthdayRow(row: Record<string, unknown>): BirthdayRecord {
  return {
    id: String(row.id),
    profileId: row.profile_id ? String(row.profile_id) : null,
    name: String(row.name ?? ""),
    birthDate: String(row.birth_date ?? ""),
    ministryName: String(row.ministry_name ?? ""),
    leaderId: row.leader_id ? String(row.leader_id) : null,
    cakeNote: String(row.notes ?? row.cake_note ?? ""),
    generalNote: String(row.general_note ?? ""),
    isActive: Boolean(row.is_active ?? true),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  }
}

function mapOccurrenceRow(row: Record<string, unknown>): BirthdayOccurrenceRecord {
  return {
    id: String(row.id),
    birthdayId: String(row.birthday_id),
    celebrationYear: Number(row.celebration_year ?? 0),
    birthdayDateForYear: String(row.birthday_date_for_year ?? ""),
    turningAge: Number(row.turning_age ?? 0),
    scriptureReference: String(row.scripture_reference ?? ""),
    scriptureText: String(row.scripture_text ?? ""),
    prayerFocus: String(row.prayer_focus ?? ""),
    celebrationNote: String(row.celebration_note ?? ""),
    status: String(row.status ?? "pending") as BirthdayOccurrenceRecord["status"],
    prayedAt: row.prayed_at ? String(row.prayed_at) : null,
    celebratedAt: row.celebrated_at ? String(row.celebrated_at) : null,
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  }
}

function mapGiftRow(
  row: Record<string, unknown>,
  reservationByGiftId: Record<string, { profileId: string | null; name: string | null }>
): BirthdayGiftRecord {
  const giftId = String(row.id)
  const reservation = reservationByGiftId[giftId]

  return {
    id: giftId,
    occurrenceId: String(row.birthday_occurrence_id ?? ""),
    title: String(row.title ?? ""),
    description: String(row.description ?? ""),
    reservedByProfileId: reservation?.profileId ?? null,
    reservedByName: reservation?.name ?? null,
    createdByProfileId: row.created_by ? String(row.created_by) : null,
    createdByName: null,
    createdAt: String(row.created_at ?? ""),
  }
}

function mapCommentRow(row: Record<string, unknown>): BirthdayCommentRecord {
  return {
    id: String(row.id),
    birthdayId: String(row.birthday_id),
    parentCommentId: row.parent_comment_id ? String(row.parent_comment_id) : null,
    authorProfileId: String(row.author_profile_id ?? ""),
    authorName: String(row.author_name ?? ""),
    authorRole: getSafeAppRole(row.author_role),
    content: String(row.content ?? ""),
    createdAt: String(row.created_at ?? ""),
    updatedAt: String(row.updated_at ?? ""),
  }
}

async function listProfilesByIds(profileIds: string[]) {
  if (profileIds.length === 0) {
    return new Map<string, BirthdayProfileOption>()
  }

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, name, email, role")
    .in("id", profileIds)

  if (error) {
    throw new Error(error.message)
  }

  return new Map(
    (data ?? []).map((profile) => [
      String(profile.id),
      {
        id: String(profile.id),
        name: profile.name ? String(profile.name) : null,
        email: profile.email ? String(profile.email) : null,
        role: getSafeAppRole(profile.role),
      } satisfies BirthdayProfileOption,
    ])
  )
}

async function listAllProfileOptions() {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, name, email, role")
    .order("name", { ascending: true, nullsFirst: false })

  if (error) {
    throw new Error(error.message)
  }

  const profiles = (data ?? []).map(
    (profile) =>
      ({
        id: String(profile.id),
        name: profile.name ? String(profile.name) : null,
        email: profile.email ? String(profile.email) : null,
        role: getSafeAppRole(profile.role),
      }) satisfies BirthdayProfileOption
  )

  const leaders = profiles.filter(
    (profile) => profile.role === "admin" || profile.role === "leader"
  ) satisfies BirthdayLeaderOption[]

  return {
    profiles,
    leaders,
  }
}

export async function ensureBirthdayOccurrencesForBirthdayIds(birthdayIds: string[]) {
  const ids = normalizeBirthdayIds(birthdayIds)
  if (ids.length === 0) {
    return
  }

  const { data: birthdays, error } = await supabaseAdmin
    .from("birthdays")
    .select("id, birth_date")
    .in("id", ids)

  if (error) {
    throw new Error(error.message)
  }

  const currentYear = Number(getTodayIsoDate().slice(0, 4))
  const years = [currentYear, currentYear + 1]
  const rows = (birthdays ?? []).flatMap((birthday) =>
    years.map((year) =>
      buildOccurrenceSeed(
        {
          id: String(birthday.id),
          birthDate: String(birthday.birth_date),
        },
        year
      )
    )
  )

  if (rows.length === 0) {
    return
  }

  const { error: upsertError } = await supabaseAdmin
    .from("birthday_occurrences")
    .upsert(rows, {
      onConflict: "birthday_id,celebration_year",
      ignoreDuplicates: false,
    })

  if (upsertError) {
    throw new Error(upsertError.message)
  }
}

export async function ensureBirthdayOccurrencesForAllActiveBirthdays() {
  const { data, error } = await supabaseAdmin
    .from("birthdays")
    .select("id")
    .eq("is_active", true)

  if (error) {
    throw new Error(error.message)
  }

  await ensureBirthdayOccurrencesForBirthdayIds((data ?? []).map((row) => String(row.id)))
}

async function listBirthdayRows(options?: { includeInactive?: boolean; ids?: string[] }) {
  let query = supabaseAdmin
    .from("birthdays")
    .select(
      "id, profile_id, name, birth_date, ministry_name, leader_id, notes, general_note, is_active, created_at, updated_at"
    )
    .order("name", { ascending: true })

  if (!options?.includeInactive) {
    query = query.eq("is_active", true)
  }

  if (options?.ids) {
    const ids = normalizeBirthdayIds(options.ids)
    if (ids.length === 0) {
      return [] as BirthdayRecord[]
    }

    query = query.in("id", ids)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapBirthdayRow(row))
}

async function listOccurrencesForBirthdayIds(birthdayIds: string[]) {
  const ids = normalizeBirthdayIds(birthdayIds)
  if (ids.length === 0) {
    return [] as BirthdayOccurrenceRecord[]
  }

  const currentYear = Number(getTodayIsoDate().slice(0, 4))
  const { data, error } = await supabaseAdmin
    .from("birthday_occurrences")
    .select(
      "id, birthday_id, celebration_year, birthday_date_for_year, turning_age, scripture_reference, scripture_text, prayer_focus, celebration_note, status, prayed_at, celebrated_at, created_at, updated_at"
    )
    .in("birthday_id", ids)
    .in("celebration_year", [currentYear, currentYear + 1])
    .order("birthday_date_for_year", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapOccurrenceRow(row))
}

async function listGiftCountsByOccurrenceIds(occurrenceIds: string[]) {
  if (occurrenceIds.length === 0) {
    return new Map<string, { total: number; reserved: number }>()
  }

  const { data: gifts, error: giftsError } = await supabaseAdmin
    .from("gifts")
    .select("id, birthday_occurrence_id")
    .in("birthday_occurrence_id", occurrenceIds)

  if (giftsError) {
    throw new Error(giftsError.message)
  }

  const giftIds = (gifts ?? []).map((gift) => String(gift.id))
  const reservationCounts = new Set<string>()

  if (giftIds.length > 0) {
    const { data: reservations, error: reservationsError } = await supabaseAdmin
      .from("gift_reservations")
      .select("gift_id")
      .in("gift_id", giftIds)

    if (reservationsError) {
      throw new Error(reservationsError.message)
    }

    for (const reservation of reservations ?? []) {
      reservationCounts.add(String(reservation.gift_id))
    }
  }

  const counts = new Map<string, { total: number; reserved: number }>()

  for (const gift of gifts ?? []) {
    const occurrenceId = String(gift.birthday_occurrence_id)
    const current = counts.get(occurrenceId) ?? { total: 0, reserved: 0 }
    current.total += 1

    if (reservationCounts.has(String(gift.id))) {
      current.reserved += 1
    }

    counts.set(occurrenceId, current)
  }

  return counts
}

async function listBirthdayComments(birthdayId: string) {
  const { data, error } = await supabaseAdmin
    .from("birthday_comments")
    .select("id, birthday_id, parent_comment_id, author_profile_id, author_name, author_role, content, created_at, updated_at")
    .eq("birthday_id", birthdayId)
    .order("created_at", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data ?? []).map((row) => mapCommentRow(row))
}

function buildBirthdaySummaries(
  birthdays: BirthdayRecord[],
  occurrences: BirthdayOccurrenceRecord[],
  profilesById: Map<string, BirthdayProfileOption>,
  giftCounts: Map<string, { total: number; reserved: number }>
) {
  const occurrenceMap = new Map<string, BirthdayOccurrenceRecord[]>()

  for (const occurrence of occurrences) {
    const group = occurrenceMap.get(occurrence.birthdayId) ?? []
    group.push(occurrence)
    occurrenceMap.set(occurrence.birthdayId, group)
  }

  const summaries = birthdays
    .map((birthday) => {
      const nextOccurrence = pickUpcomingOccurrence(
        occurrenceMap.get(birthday.id) ?? []
      )

      if (!nextOccurrence) {
        return null
      }

      const counts = giftCounts.get(nextOccurrence.id) ?? { total: 0, reserved: 0 }
      const leader = birthday.leaderId ? profilesById.get(birthday.leaderId) : null

      return {
        id: birthday.id,
        profileId: birthday.profileId,
        name: birthday.name,
        birthDate: birthday.birthDate,
        ministryName: birthday.ministryName,
        leaderId: birthday.leaderId,
        leaderName: leader?.name ?? leader?.email ?? null,
        cakeNote: birthday.cakeNote,
        generalNote: birthday.generalNote,
        isActive: birthday.isActive,
        nextOccurrence,
        daysUntil: getDaysUntilDate(nextOccurrence.birthdayDateForYear),
        monthKey: getMonthKey(nextOccurrence.birthdayDateForYear),
        monthLabel: getMonthLabel(nextOccurrence.birthdayDateForYear),
        giftCount: counts.total,
        reservedGiftCount: counts.reserved,
      } satisfies BirthdaySummary
    })
    .filter(Boolean) as BirthdaySummary[]

  return sortBirthdaysByUpcomingDate(summaries)
}

export async function getBirthdayDashboardData(actor: BirthdayActor): Promise<BirthdayDashboardData> {
  await ensureBirthdayOccurrencesForAllActiveBirthdays()

  const birthdays = await listBirthdayRows()
  const birthdayIds = birthdays.map((birthday) => birthday.id)
  const occurrences = await listOccurrencesForBirthdayIds(birthdayIds)
  const nextOccurrenceIds = buildBirthdaySummaries(
    birthdays,
    occurrences,
    new Map(),
    new Map()
  ).map((summary) => summary.nextOccurrence.id)

  const { profiles, leaders } = await listAllProfileOptions()
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]))
  const giftCounts = await listGiftCountsByOccurrenceIds(nextOccurrenceIds)
  const summaries = buildBirthdaySummaries(birthdays, occurrences, profilesById, giftCounts)

  return {
    role: actor.role,
    currentUserId: actor.profileId,
    birthdays: summaries,
    upcomingBirthdays: summaries.filter((birthday) => birthday.daysUntil >= 0 && birthday.daysUntil <= 30),
    leaders,
    profileOptions: actor.role === "admin" ? profiles : [],
  }
}

export async function getBirthdayAdminData(actor: BirthdayActor): Promise<BirthdayAdminData> {
  await ensureBirthdayOccurrencesForAllActiveBirthdays()

  const birthdays = await listBirthdayRows({ includeInactive: true })
  const birthdayIds = birthdays.map((birthday) => birthday.id)
  const occurrences = await listOccurrencesForBirthdayIds(birthdayIds)
  const nextOccurrenceIds = buildBirthdaySummaries(
    birthdays,
    occurrences,
    new Map(),
    new Map()
  ).map((summary) => summary.nextOccurrence.id)

  const { profiles, leaders } = await listAllProfileOptions()
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]))
  const giftCounts = await listGiftCountsByOccurrenceIds(nextOccurrenceIds)
  const summaries = buildBirthdaySummaries(birthdays, occurrences, profilesById, giftCounts)

  return {
    role: actor.role,
    currentUserId: actor.profileId,
    birthdays: summaries,
    leaders,
    profileOptions: profiles,
    stats: {
      total: summaries.length,
      active: summaries.filter((birthday) => birthday.isActive).length,
      inactive: summaries.filter((birthday) => !birthday.isActive).length,
      upcoming30: summaries.filter((birthday) => birthday.daysUntil >= 0 && birthday.daysUntil <= 30).length,
      withoutLeader: summaries.filter((birthday) => !birthday.leaderId).length,
    },
  }
}

export async function getBirthdayDetailData(
  birthdayId: string,
  actor: BirthdayActor
): Promise<BirthdayDetailData | null> {
  const normalizedBirthdayId = birthdayId.trim()
  if (!isUuid(normalizedBirthdayId)) {
    return null
  }

  await ensureBirthdayOccurrencesForBirthdayIds([normalizedBirthdayId])

  const birthdays = await listBirthdayRows({
    includeInactive: actor.role === "admin",
    ids: [normalizedBirthdayId],
  })

  const birthday = birthdays[0]
  if (!birthday) {
    return null
  }

  const occurrences = await listOccurrencesForBirthdayIds([normalizedBirthdayId])
  const upcomingOccurrence = pickUpcomingOccurrence(occurrences)
  if (!upcomingOccurrence) {
    return null
  }

  const currentYear = Number(getTodayIsoDate().slice(0, 4))
  const currentOccurrence =
    occurrences.find((occurrence) => occurrence.celebrationYear === currentYear) ??
    upcomingOccurrence

  const profileIds = [birthday.leaderId, birthday.profileId].filter(Boolean) as string[]
  const profilesById = await listProfilesByIds(profileIds)
  const linkedProfile = birthday.profileId ? profilesById.get(birthday.profileId) : null
  const leaderProfile = birthday.leaderId ? profilesById.get(birthday.leaderId) : null

  const { data: giftsData, error: giftsError } = await supabaseAdmin
    .from("gifts")
    .select("id, birthday_occurrence_id, title, description, created_by, created_at")
    .eq("birthday_occurrence_id", upcomingOccurrence.id)
    .order("created_at", { ascending: true })

  if (giftsError) {
    throw new Error(giftsError.message)
  }

  const giftIds = (giftsData ?? []).map((gift) => String(gift.id))
  const reservationByGiftId: Record<string, { profileId: string | null; name: string | null }> = {}

  if (giftIds.length > 0) {
    const { data: reservations, error: reservationsError } = await supabaseAdmin
      .from("gift_reservations")
      .select("gift_id, reserved_by, reserved_by_profile_id, created_at")
      .in("gift_id", giftIds)
      .order("created_at", { ascending: true })

    if (reservationsError) {
      throw new Error(reservationsError.message)
    }

    for (const reservation of reservations ?? []) {
      const giftId = String(reservation.gift_id)

      if (!reservationByGiftId[giftId]) {
        reservationByGiftId[giftId] = {
          profileId: reservation.reserved_by_profile_id
            ? String(reservation.reserved_by_profile_id)
            : null,
          name: reservation.reserved_by ? String(reservation.reserved_by) : null,
        }
      }
    }
  }

  const creatorIds = [...new Set((giftsData ?? []).map((gift) => String(gift.created_by ?? "")).filter(Boolean))]
  const creatorProfiles = await listProfilesByIds(creatorIds)

  const gifts = (giftsData ?? []).map((gift) => {
    const mapped = mapGiftRow(gift, reservationByGiftId)
    const creator = mapped.createdByProfileId ? creatorProfiles.get(mapped.createdByProfileId) : null

    return {
      ...mapped,
      createdByName: creator?.name ?? creator?.email ?? null,
    }
  })
  const comments = await listBirthdayComments(birthday.id)

  return {
    role: actor.role,
    currentUserId: actor.profileId,
    currentUserName: actor.name,
    birthday: {
      ...birthday,
      leaderName: leaderProfile?.name ?? leaderProfile?.email ?? null,
      linkedProfileName: linkedProfile?.name ?? null,
      linkedProfileEmail: linkedProfile?.email ?? null,
    },
    currentOccurrence,
    upcomingOccurrence,
    otherOccurrences: occurrences.filter(
      (occurrence) => occurrence.id !== upcomingOccurrence.id
    ),
    gifts,
    comments,
  }
}

function buildReminderKey(daysUntil: number) {
  return `days-${daysUntil}`
}

function buildBirthdayDetailUrl(birthdayId: string) {
  return `${(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/birthdays/${birthdayId}`
}

async function hasReminderLog(params: {
  occurrenceId: string
  reminderKey: string
  channel: "notification" | "email"
  recipientProfileId: string
}) {
  const { data, error } = await supabaseAdmin
    .from("birthday_reminder_logs")
    .select("id")
    .eq("occurrence_id", params.occurrenceId)
    .eq("reminder_key", params.reminderKey)
    .eq("channel", params.channel)
    .eq("recipient_profile_id", params.recipientProfileId)
    .maybeSingle()

  if (error && error.code !== "PGRST116") {
    throw new Error(error.message)
  }

  return Boolean(data)
}

async function createReminderLog(params: {
  occurrenceId: string
  reminderKey: string
  channel: "notification" | "email"
  recipientProfileId: string
}) {
  const { error } = await supabaseAdmin.from("birthday_reminder_logs").insert({
    occurrence_id: params.occurrenceId,
    reminder_key: params.reminderKey,
    channel: params.channel,
    recipient_profile_id: params.recipientProfileId,
  })

  if (error) {
    throw new Error(error.message)
  }
}

export async function runBirthdayReminderJob() {
  await ensureBirthdayOccurrencesForAllActiveBirthdays()

  const birthdays = await listBirthdayRows()
  if (birthdays.length === 0) {
    return {
      candidates: 0,
      notifications: 0,
      emails: 0,
    }
  }

  const occurrences = await listOccurrencesForBirthdayIds(birthdays.map((birthday) => birthday.id))
  const { profiles, leaders } = await listAllProfileOptions()
  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]))
  const giftCounts = new Map<string, { total: number; reserved: number }>()
  const summaries = buildBirthdaySummaries(birthdays, occurrences, profilesById, giftCounts)
  const admins = profiles.filter((profile) => profile.role === "admin")
  const relevant = summaries.filter((summary) => [0, 1, 7].includes(summary.daysUntil))

  let notificationCount = 0
  let emailCount = 0

  for (const summary of relevant) {
    const leader =
      summary.leaderId ? leaders.find((candidate) => candidate.id === summary.leaderId) : null
    const recipients = [...admins, ...(leader ? [leader] : [])].filter(
      (recipient, index, current) =>
        current.findIndex((candidate) => candidate.id === recipient.id) === index
    )

    const reminderKey = buildReminderKey(summary.daysUntil)
    const messageDay =
      summary.daysUntil === 0
        ? "hoy"
        : summary.daysUntil === 1
        ? "mañana"
        : `en ${summary.daysUntil} dias`

    for (const recipient of recipients) {
      const notificationLogged = await hasReminderLog({
        occurrenceId: summary.nextOccurrence.id,
        reminderKey,
        channel: "notification",
        recipientProfileId: recipient.id,
      })

      if (!notificationLogged) {
        await createNotification({
          userId: recipient.id,
          title: `Se viene el cumple de ${summary.name}`,
          message: `${summary.name} cumple ${summary.nextOccurrence.turningAge} años ${messageDay}.`,
          tone: summary.daysUntil === 0 ? "attention" : "action",
          role:
            recipient.role === "admin" || recipient.role === "leader"
              ? recipient.role
              : "user",
        })
        await createReminderLog({
          occurrenceId: summary.nextOccurrence.id,
          reminderKey,
          channel: "notification",
          recipientProfileId: recipient.id,
        })
        notificationCount += 1
      }

      if (!recipient.email) {
        continue
      }

      const emailLogged = await hasReminderLog({
        occurrenceId: summary.nextOccurrence.id,
        reminderKey,
        channel: "email",
        recipientProfileId: recipient.id,
      })

      if (emailLogged) {
        continue
      }

      const result = await sendBirthdayReminderEmail({
        to: recipient.email,
        recipientName: recipient.name ?? "equipo de líderes",
        youngName: summary.name,
        birthdayDate: formatBirthdayDate(summary.nextOccurrence.birthdayDateForYear),
        turningAge: summary.nextOccurrence.turningAge,
        daysUntil: summary.daysUntil,
        scriptureReference: summary.nextOccurrence.scriptureReference,
        prayerFocus: summary.nextOccurrence.prayerFocus,
        detailUrl: buildBirthdayDetailUrl(summary.id),
      })

      if (result === "sent") {
        await createReminderLog({
          occurrenceId: summary.nextOccurrence.id,
          reminderKey,
          channel: "email",
          recipientProfileId: recipient.id,
        })
        emailCount += 1
      }
    }
  }

  return {
    candidates: relevant.length,
    notifications: notificationCount,
    emails: emailCount,
  }
}
