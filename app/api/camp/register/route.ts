import { NextResponse } from "next/server";
import { sendCampConfirmationEmail } from "@/lib/camp/email";
import { createCampRegistration } from "@/lib/camp/repository";
import { buildCampTicketViewModel } from "@/lib/camp/ticket";
import { normalizeCampRegistration } from "@/lib/camp/utils";
import {
  campRegistrationSchema,
  parseCampRegistrationFormData,
} from "@/lib/validation";

function mapFieldIssues(fieldErrors: Record<string, string[] | undefined>) {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([fieldName, messages]) => [
      fieldName,
      messages?.[0],
    ])
  );
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const parsedFormValues = parseCampRegistrationFormData(formData);
    const validation = campRegistrationSchema.safeParse(parsedFormValues);

    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          message: "Revisa los campos marcados antes de continuar.",
          issues: mapFieldIssues(validation.error.flatten().fieldErrors),
        },
        { status: 400 }
      );
    }

    const registration = await createCampRegistration(
      normalizeCampRegistration(validation.data)
    );
    const ticket = await buildCampTicketViewModel(registration);

    let emailStatus: "sent" | "skipped" | "failed" = "skipped";

    try {
      emailStatus = await sendCampConfirmationEmail(ticket);
    } catch {
      emailStatus = "failed";
    }

    return NextResponse.json(
      {
        success: true,
        registration,
        ticket,
        emailStatus,
      },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "No se pudo completar el registro.",
      },
      { status: 500 }
    );
  }
}
