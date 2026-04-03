import "server-only";

import { CAMP_EVENT } from "@/lib/camp/constants";
import type { CampTicketViewModel } from "@/lib/camp/types";

export async function sendCampConfirmationEmail(ticket: CampTicketViewModel) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail =
    process.env.CAMP_FROM_EMAIL ?? process.env.EMAIL_FROM ?? "";

  if (!resendApiKey || !fromEmail) {
    return "skipped" as const;
  }

  const html = `
    <div style="font-family:Arial,Helvetica,sans-serif;background:#0b160d;padding:32px;color:#f6f1e8">
      <div style="max-width:640px;margin:0 auto;background:#112117;border:1px solid rgba(200,145,42,.25);border-radius:24px;padding:32px">
        <p style="letter-spacing:.18em;font-size:11px;text-transform:uppercase;color:#c8912a;margin:0 0 12px">Registro confirmado</p>
        <h1 style="margin:0 0 12px;font-size:32px;line-height:1.1">${CAMP_EVENT.fullTitle}</h1>
        <p style="margin:0 0 24px;color:#d3c9b7">Tu registro fue recibido correctamente. Ya puedes consultar tu ticket digital y presentarlo el dia del evento.</p>
        <div style="background:#0f1d13;border-radius:18px;padding:20px;margin-bottom:24px">
          <p style="margin:0 0 6px;font-size:12px;color:#cbb682;text-transform:uppercase;letter-spacing:.12em">Ticket</p>
          <p style="margin:0;font-size:24px;font-weight:700">${ticket.ticketId}</p>
          <p style="margin:14px 0 0;color:#d3c9b7">${ticket.attendeeName}</p>
          <p style="margin:6px 0 0;color:#9eb39e">${ticket.eventDateLabel} · ${ticket.location}</p>
        </div>
        <a href="${ticket.ticketUrl}" style="display:inline-block;background:linear-gradient(135deg,#c8912a,#e8a83a);color:#08140a;padding:14px 22px;border-radius:999px;font-weight:700;text-decoration:none">Abrir ticket</a>
        ${
          ticket.responsivaUrl
            ? `<p style="margin:18px 0 0;color:#d3c9b7">Si eres menor de edad, descarga tambien la carta responsiva desde tu ticket o directamente aqui: <a href="${ticket.responsivaUrl}" style="color:#f0c96b">Descargar PDF</a>.</p>`
            : ""
        }
      </div>
    </div>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [ticket.email],
      subject: `${CAMP_EVENT.name}: tu ticket ${ticket.ticketId}`,
      html,
    }),
  });

  if (!response.ok) {
    throw new Error(`Resend respondio con ${response.status}`);
  }

  return "sent" as const;
}
