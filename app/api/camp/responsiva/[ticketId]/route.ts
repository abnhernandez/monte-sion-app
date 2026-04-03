import { getCampRegistrationByTicketId } from "@/lib/camp/repository";
import { buildResponsivaPdf } from "@/lib/camp/pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketId: string }> }
) {
  const { ticketId } = await params;
  const registration = await getCampRegistrationByTicketId(ticketId);

  if (!registration || !registration.isMinor) {
    return new Response("No se encontró una carta responsiva para este ticket.", {
      status: 404,
    });
  }

  const pdfBytes = await buildResponsivaPdf(registration);

  return new Response(Buffer.from(pdfBytes), {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${registration.ticketId}-responsiva.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
