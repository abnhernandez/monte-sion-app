import { NextResponse } from "next/server";
import { CampAuthError, assertCampAdminAccess } from "@/lib/camp/auth";
import { markCampRegistrationCheckedIn } from "@/lib/camp/repository";
import { buildFullName, extractTicketIdFromQrPayload } from "@/lib/camp/utils";

export async function POST(request: Request) {
  try {
    const adminUser = await assertCampAdminAccess();
    const body = (await request.json()) as {
      ticketId?: string;
      qrPayload?: string;
    };

    const directTicketId = body.ticketId?.trim().toUpperCase() ?? "";
    const ticketId =
      directTicketId ||
      (body.qrPayload ? extractTicketIdFromQrPayload(body.qrPayload) : null);

    if (!ticketId) {
      return NextResponse.json(
        {
          success: false,
          message: "Escanea un QR válido o captura un ticket CMS26-...",
        },
        { status: 400 }
      );
    }

    const checkInResult = await markCampRegistrationCheckedIn(
      ticketId,
      adminUser.id
    );

    if (!checkInResult) {
      return NextResponse.json(
        {
          success: false,
          message: "No encontramos ese ticket en Campamento Monte Sion 2026.",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: checkInResult.alreadyCheckedIn,
      message: checkInResult.alreadyCheckedIn
        ? "Este ticket ya había sido registrado en el acceso."
        : "Check-in completado correctamente.",
      registration: {
        ticketId: checkInResult.registration.ticketId,
        checkedInAt: checkInResult.registration.checkedInAt,
        isMinor: checkInResult.registration.isMinor,
        campRole: checkInResult.registration.campRole,
        attendeeName: buildFullName(
          checkInResult.registration.firstName,
          checkInResult.registration.lastName
        ),
      },
    });
  } catch (error) {
    if (error instanceof CampAuthError) {
      return NextResponse.json(
        { success: false, message: error.message },
        { status: error.status }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo registrar el check-in.",
      },
      { status: 500 }
    );
  }
}
