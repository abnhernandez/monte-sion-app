"use server"

import { CampAuthError, assertCampAdminAccess } from "@/lib/camp/auth"
import { markCampRegistrationCheckedIn } from "@/lib/camp/repository"
import { buildFullName, extractTicketIdFromQrPayload } from "@/lib/camp/utils"
import { createCampRegistration } from "@/lib/camp/repository"
import { buildCampTicketViewModel } from "@/lib/camp/ticket"
import { normalizeCampRegistration } from "@/lib/camp/utils"
import { campRegistrationSchema } from "@/lib/validation"
import { sendCampConfirmationEmail } from "@/lib/camp/email"
import type {
  CampApiError,
  CampApiSuccess,
  CampCheckInResponse as CampCheckInSuccessResponse,
  CampRegistrationFormValues,
} from "@/lib/camp/types"
import { getServerTrackedQueryParams } from "@/lib/query-params-server"
import { logCampaignConversion } from "@/lib/query-params-audit"

export type CampRegistrationResponse = CampApiSuccess | CampApiError

export type CampCheckInResponse =
  | CampCheckInSuccessResponse
  | {
      success: false
      message: string
    }

export async function registerCampParticipant(
  values: CampRegistrationFormValues
): Promise<CampRegistrationResponse> {
  try {
    const validation = campRegistrationSchema.safeParse(values)

    if (!validation.success) {
      return {
        success: false,
        message: "Revisa los campos marcados antes de continuar.",
        issues: Object.fromEntries(
          Object.entries(validation.error.flatten().fieldErrors).map(
            ([fieldName, messages]) => [fieldName, messages?.[0]]
          )
        ),
      }
    }

    const registration = await createCampRegistration(
      normalizeCampRegistration(validation.data)
    )
    const ticket = await buildCampTicketViewModel(registration)

    let emailStatus: "sent" | "skipped" | "failed" = "skipped"

    try {
      emailStatus = await sendCampConfirmationEmail(ticket)
    } catch {
      emailStatus = "failed"
    }

    const trackedParams = await getServerTrackedQueryParams()

    if (Object.keys(trackedParams).length > 0) {
      await logCampaignConversion({
        conversion: "camp_registration",
        pathname: "/camp",
        params: trackedParams,
        metadata: {
          ticketId: ticket.ticketId,
          emailStatus,
        },
      })
    }

    return {
      success: true,
      registration,
      ticket,
      emailStatus,
    }
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo completar el registro.",
    }
  }
}

export async function performCampCheckIn({
  qrPayload,
  ticketId,
}: {
  qrPayload?: string
  ticketId?: string
}): Promise<CampCheckInResponse> {
  try {
    const adminUser = await assertCampAdminAccess()

    const directTicketId = ticketId?.trim().toUpperCase() ?? ""
    const resolvedTicketId =
      directTicketId ||
      (qrPayload ? extractTicketIdFromQrPayload(qrPayload) : null)

    if (!resolvedTicketId) {
      return {
        success: false,
        message: "Escanea un QR válido o captura un ticket CMS26-...",
      }
    }

    const checkInResult = await markCampRegistrationCheckedIn(
      resolvedTicketId,
      adminUser.id
    )

    if (!checkInResult) {
      return {
        success: false,
        message: "No encontramos ese ticket en Campamento Monte Sion 2026.",
      }
    }

      return {
        success: true,
        alreadyCheckedIn: checkInResult.alreadyCheckedIn,
      message: checkInResult.alreadyCheckedIn
        ? "Este ticket ya había sido registrado en el acceso."
        : "Check-in completado correctamente.",
      registration: {
        ticketId: checkInResult.registration.ticketId,
        checkedInAt: checkInResult.registration.checkedInAt || "",
        isMinor: checkInResult.registration.isMinor,
        campRole: checkInResult.registration.campRole,
        attendeeName: buildFullName(
          checkInResult.registration.firstName,
          checkInResult.registration.lastName
        ),
      },
    }
  } catch (error) {
    if (error instanceof CampAuthError) {
      return {
        success: false,
        message: error.message,
      }
    }

    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "No se pudo registrar el check-in.",
    }
  }
}
