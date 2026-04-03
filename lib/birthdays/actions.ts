"use server"

import { revalidatePath } from "next/cache"
import {
  assertBirthdayAdminAccess,
  assertBirthdayCommentAccess,
  assertBirthdayManagerAccess,
  assertBirthdayTeamAccess,
} from "@/lib/birthdays/auth"
import type {
  BirthdayOccurrenceStatus,
  SaveBirthdayCommentInput,
  SaveBirthdayGiftInput,
  SaveBirthdayInput,
  SaveBirthdayOccurrenceInput,
} from "@/lib/birthdays/types"
import { ensureBirthdayOccurrencesForBirthdayIds } from "@/lib/birthdays/repository"
import { supabaseAdmin } from "@/lib/supabase-admin"
import { canManageBirthdayGifts, canModerateBirthdayComments, isAdminRole } from "@/lib/roles"

function normalizeText(value: string) {
  return value.trim().replace(/\s+/g, " ")
}

function normalizeOptionalText(value: string | null | undefined) {
  const normalized = typeof value === "string" ? normalizeText(value) : ""
  return normalized || null
}

function revalidateBirthdayViews(birthdayId: string) {
  revalidatePath("/birthdays")
  revalidatePath("/birthdays/admin")
  revalidatePath(`/birthdays/${birthdayId}`)
}

export async function saveBirthday(input: SaveBirthdayInput) {
  await assertBirthdayManagerAccess()

  const name = normalizeText(input.name)
  const ministryName = normalizeText(input.ministryName)
  const birthDate = String(input.birthDate ?? "").trim()

  if (name.length < 2) {
    throw new Error("Escribe el nombre de la persona.")
  }

  if (!birthDate) {
    throw new Error("Selecciona la fecha de nacimiento.")
  }

  if (ministryName.length < 2) {
    throw new Error("Indica el ministerio o grupo.")
  }

  const payload = {
    profile_id: normalizeOptionalText(input.profileId),
    name,
    birth_date: birthDate,
    ministry_name: ministryName,
    leader_id: normalizeOptionalText(input.leaderId),
    notes: String(input.cakeNote ?? "").trim(),
    general_note: String(input.generalNote ?? "").trim(),
    is_active: input.isActive ?? true,
    updated_at: new Date().toISOString(),
  }

  let birthdayId = input.id

  if (birthdayId) {
    const { error } = await supabaseAdmin
      .from("birthdays")
      .update(payload)
      .eq("id", birthdayId)

    if (error) {
      throw new Error(error.message)
    }
  } else {
    const { data, error } = await supabaseAdmin
      .from("birthdays")
      .insert(payload)
      .select("id")
      .single()

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo crear el registro.")
    }

    birthdayId = String(data.id)
  }

  await ensureBirthdayOccurrencesForBirthdayIds([birthdayId])
  revalidateBirthdayViews(birthdayId)

  return { ok: true, birthdayId }
}

export async function setBirthdayActive(birthdayId: string, isActive: boolean) {
  await assertBirthdayManagerAccess()

  const { error } = await supabaseAdmin
    .from("birthdays")
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq("id", birthdayId)

  if (error) {
    throw new Error(error.message)
  }

  revalidateBirthdayViews(birthdayId)
  return { ok: true }
}

export async function deleteBirthday(birthdayId: string) {
  await assertBirthdayAdminAccess()

  const normalizedBirthdayId = String(birthdayId ?? "").trim()
  if (!normalizedBirthdayId) {
    throw new Error("No se encontró el registro.")
  }

  const { error } = await supabaseAdmin
    .from("birthdays")
    .delete()
    .eq("id", normalizedBirthdayId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/birthdays")
  revalidatePath("/birthdays/admin")
  revalidatePath(`/birthdays/${normalizedBirthdayId}`)

  return { ok: true }
}

export async function saveBirthdayOccurrence(input: SaveBirthdayOccurrenceInput) {
  await assertBirthdayManagerAccess()

  const payload = {
    scripture_reference: String(input.scriptureReference ?? "").trim(),
    scripture_text: String(input.scriptureText ?? "").trim(),
    prayer_focus: String(input.prayerFocus ?? "").trim(),
    celebration_note: String(input.celebrationNote ?? "").trim(),
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabaseAdmin
    .from("birthday_occurrences")
    .update(payload)
    .eq("id", input.occurrenceId)
    .select("birthday_id")
    .single()

  if (error || !data) {
    throw new Error(error?.message ?? "No se pudo guardar la info de este cumple.")
  }

  revalidateBirthdayViews(String(data.birthday_id))
  return { ok: true }
}

export async function updateBirthdayOccurrenceStatus(
  occurrenceId: string,
  status: BirthdayOccurrenceStatus
) {
  await assertBirthdayManagerAccess()

  const { data: current, error: currentError } = await supabaseAdmin
    .from("birthday_occurrences")
    .select("birthday_id, prayed_at, celebrated_at")
    .eq("id", occurrenceId)
    .single()

  if (currentError || !current) {
    throw new Error(currentError?.message ?? "No se encontró la ocurrencia.")
  }

  const now = new Date().toISOString()
  const payload: Record<string, string | null> = {
    status,
    updated_at: now,
  }

  if (status === "pending") {
    payload.prayed_at = null
    payload.celebrated_at = null
  }

  if (status === "prayed" && !current.prayed_at) {
    payload.prayed_at = now
  }

  if (status === "celebrated" && !current.celebrated_at) {
    payload.celebrated_at = now
    payload.prayed_at = String(current.prayed_at ?? now)
  }

  const { error } = await supabaseAdmin
    .from("birthday_occurrences")
    .update(payload)
    .eq("id", occurrenceId)

  if (error) {
    throw new Error(error.message)
  }

  revalidateBirthdayViews(String(current.birthday_id))
  return { ok: true }
}

export async function saveBirthdayGift(input: SaveBirthdayGiftInput) {
  const actor = await assertBirthdayTeamAccess()
  const title = normalizeText(input.title)

  if (title.length < 2) {
    throw new Error("Escribe el nombre del regalo.")
  }

  const { data: occurrence, error: occurrenceError } = await supabaseAdmin
    .from("birthday_occurrences")
    .select("birthday_id")
    .eq("id", input.occurrenceId)
    .single()

  if (occurrenceError || !occurrence) {
    throw new Error(occurrenceError?.message ?? "No se encontró la ocurrencia.")
  }

  const payload = {
    birthday_occurrence_id: input.occurrenceId,
    title,
    description: String(input.description ?? "").trim(),
    created_by: actor.profileId,
  }

  if (input.giftId) {
    const { data: existing, error: existingError } = await supabaseAdmin
      .from("gifts")
      .select("id, created_by")
      .eq("id", input.giftId)
      .single()

    if (existingError || !existing) {
      throw new Error(existingError?.message ?? "No se encontró el regalo.")
    }

    const canManageAll = canManageBirthdayGifts(actor.role)
    const isOwner = String(existing.created_by ?? "") === actor.profileId

    if (!canManageAll && !isOwner) {
      throw new Error("No puedes editar este regalo.")
    }

    const { error } = await supabaseAdmin
      .from("gifts")
      .update(payload)
      .eq("id", input.giftId)

    if (error) {
      throw new Error(error.message)
    }
  } else {
    const { error } = await supabaseAdmin.from("gifts").insert(payload)

    if (error) {
      throw new Error(error.message)
    }
  }

  revalidateBirthdayViews(String(occurrence.birthday_id))
  return { ok: true }
}

export async function deleteBirthdayGift(giftId: string) {
  const actor = await assertBirthdayTeamAccess()

  const { data: gift, error: giftError } = await supabaseAdmin
    .from("gifts")
    .select("id, birthday_occurrence_id, created_by")
    .eq("id", giftId)
    .single()

  if (giftError || !gift) {
    throw new Error(giftError?.message ?? "No se encontró el regalo.")
  }

  const canManageAll = canManageBirthdayGifts(actor.role)
  const isOwner = String(gift.created_by ?? "") === actor.profileId

  if (!canManageAll && !isOwner) {
    throw new Error("No puedes eliminar este regalo.")
  }

  const { data: occurrence, error: occurrenceError } = await supabaseAdmin
    .from("birthday_occurrences")
    .select("birthday_id")
    .eq("id", String(gift.birthday_occurrence_id))
    .single()

  if (occurrenceError || !occurrence) {
    throw new Error(occurrenceError?.message ?? "No se encontró la ocurrencia.")
  }

  const { error } = await supabaseAdmin
    .from("gifts")
    .delete()
    .eq("id", giftId)

  if (error) {
    throw new Error(error.message)
  }

  revalidateBirthdayViews(String(occurrence.birthday_id))
  return { ok: true }
}

export async function reserveBirthdayGift(giftId: string) {
  const actor = await assertBirthdayTeamAccess()

  const { data: gift, error: giftError } = await supabaseAdmin
    .from("gifts")
    .select("birthday_occurrence_id")
    .eq("id", giftId)
    .single()

  if (giftError || !gift) {
    throw new Error(giftError?.message ?? "No se encontró el regalo.")
  }

  const { data: existingReservations, error: reservationError } = await supabaseAdmin
    .from("gift_reservations")
    .select("gift_id, reserved_by_profile_id")
    .eq("gift_id", giftId)
    .order("created_at", { ascending: true })
    .limit(1)

  if (reservationError) {
    throw new Error(reservationError.message)
  }

  const existing = existingReservations?.[0]
  if (existing?.reserved_by_profile_id && String(existing.reserved_by_profile_id) !== actor.profileId) {
    throw new Error("Este regalo ya fue reservado.")
  }

  if (!existing) {
    const { error } = await supabaseAdmin.from("gift_reservations").insert({
      gift_id: giftId,
      reserved_by_profile_id: actor.profileId,
      reserved_by: actor.name,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  const { data: occurrence, error: occurrenceError } = await supabaseAdmin
    .from("birthday_occurrences")
    .select("birthday_id")
    .eq("id", String(gift.birthday_occurrence_id))
    .single()

  if (occurrenceError || !occurrence) {
    throw new Error(occurrenceError?.message ?? "No se encontró la ocurrencia.")
  }

  revalidateBirthdayViews(String(occurrence.birthday_id))
  return { ok: true }
}

export async function releaseBirthdayGift(giftId: string) {
  const actor = await assertBirthdayTeamAccess()

  const { data: gift, error: giftError } = await supabaseAdmin
    .from("gifts")
    .select("birthday_occurrence_id")
    .eq("id", giftId)
    .single()

  if (giftError || !gift) {
    throw new Error(giftError?.message ?? "No se encontró el regalo.")
  }

  let deleteQuery = supabaseAdmin.from("gift_reservations").delete().eq("gift_id", giftId)
  if (!isAdminRole(actor.role)) {
    deleteQuery = deleteQuery.eq("reserved_by_profile_id", actor.profileId)
  }

  const { error } = await deleteQuery

  if (error) {
    throw new Error(error.message)
  }

  const { data: occurrence, error: occurrenceError } = await supabaseAdmin
    .from("birthday_occurrences")
    .select("birthday_id")
    .eq("id", String(gift.birthday_occurrence_id))
    .single()

  if (occurrenceError || !occurrence) {
    throw new Error(occurrenceError?.message ?? "No se encontró la ocurrencia.")
  }

  revalidateBirthdayViews(String(occurrence.birthday_id))
  return { ok: true }
}

export async function saveBirthdayComment(input: SaveBirthdayCommentInput) {
  const actor = await assertBirthdayCommentAccess()
  const birthdayId = String(input.birthdayId ?? "").trim()
  const content = normalizeText(String(input.content ?? ""))
  const parentCommentId = String(input.parentCommentId ?? "").trim() || null

  if (!birthdayId) {
    throw new Error("No se encontró el cumple.")
  }

  if (content.length < 2) {
    throw new Error("Escribe un comentario breve.")
  }

  if (parentCommentId) {
    const { data: parentComment, error: parentError } = await supabaseAdmin
      .from("birthday_comments")
      .select("id, birthday_id")
      .eq("id", parentCommentId)
      .single()

    if (parentError || !parentComment) {
      throw new Error(parentError?.message ?? "No se encontró el comentario padre.")
    }

    if (String(parentComment.birthday_id) !== birthdayId) {
      throw new Error("La respuesta debe pertenecer al mismo cumple.")
    }
  }

  if (input.commentId) {
    const { data: current, error: currentError } = await supabaseAdmin
      .from("birthday_comments")
      .select("id, birthday_id, author_profile_id")
      .eq("id", input.commentId)
      .single()

    if (currentError || !current) {
      throw new Error(currentError?.message ?? "No se encontró el comentario.")
    }

    const isOwner = String(current.author_profile_id) === actor.profileId
    if (!canModerateBirthdayComments(actor.role) && !isOwner) {
      throw new Error("No puedes editar este comentario.")
    }

    const { error } = await supabaseAdmin
      .from("birthday_comments")
      .update({ content, updated_at: new Date().toISOString() })
      .eq("id", input.commentId)

    if (error) {
      throw new Error(error.message)
    }
  } else {
    const { error } = await supabaseAdmin.from("birthday_comments").insert({
      birthday_id: birthdayId,
      parent_comment_id: parentCommentId,
      author_profile_id: actor.profileId,
      author_name: actor.name,
      author_role: actor.role,
      content,
    })

    if (error) {
      throw new Error(error.message)
    }
  }

  revalidateBirthdayViews(birthdayId)
  return { ok: true }
}

export async function deleteBirthdayComment(commentId: string) {
  const actor = await assertBirthdayCommentAccess()
  const normalizedCommentId = String(commentId ?? "").trim()

  if (!normalizedCommentId) {
    throw new Error("No se encontró el comentario.")
  }

  const { data: current, error: currentError } = await supabaseAdmin
    .from("birthday_comments")
    .select("id, birthday_id, author_profile_id")
    .eq("id", normalizedCommentId)
    .single()

  if (currentError || !current) {
    throw new Error(currentError?.message ?? "No se encontró el comentario.")
  }

  const isOwner = String(current.author_profile_id) === actor.profileId
  if (!canModerateBirthdayComments(actor.role) && !isOwner) {
    throw new Error("No puedes eliminar este comentario.")
  }

  const { error } = await supabaseAdmin
    .from("birthday_comments")
    .delete()
    .eq("id", normalizedCommentId)

  if (error) {
    throw new Error(error.message)
  }

  revalidateBirthdayViews(String(current.birthday_id))
  return { ok: true }
}
