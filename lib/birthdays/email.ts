import "server-only"

import nodemailer from "nodemailer"

type BirthdayReminderEmailInput = {
  to: string
  recipientName: string
  youngName: string
  birthdayDate: string
  turningAge: number
  daysUntil: number
  scriptureReference: string
  prayerFocus: string
  detailUrl: string
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST ?? process.env.EMAIL_HOST
  const port = Number(process.env.SMTP_PORT ?? process.env.EMAIL_PORT ?? 0)
  const user = process.env.SMTP_USER ?? process.env.EMAIL_USER
  const pass = process.env.SMTP_PASS ?? process.env.EMAIL_PASSWORD

  if (!host || !port || !user || !pass) {
    return null
  }

  return {
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  }
}

export async function sendBirthdayReminderEmail(input: BirthdayReminderEmailInput) {
  const smtpConfig = getSmtpConfig()
  const from =
    process.env.BIRTHDAYS_FROM_EMAIL ??
    process.env.EMAIL_FROM ??
    process.env.SMTP_USER ??
    process.env.EMAIL_USER

  if (!smtpConfig || !from || !input.to) {
    return "skipped" as const
  }

  const transporter = nodemailer.createTransport(smtpConfig)
  const dayLabel =
    input.daysUntil === 0
      ? "hoy"
      : input.daysUntil === 1
      ? "mañana"
      : `en ${input.daysUntil} dias`

  const subject = `Cumple de ${input.youngName}: ${dayLabel}`

  await transporter.sendMail({
    from,
    to: input.to,
    subject,
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#07120c;padding:32px;color:#eef5ee">
        <div style="max-width:640px;margin:0 auto;background:#0d1b13;border:1px solid rgba(217,182,93,.25);border-radius:24px;padding:32px">
          <p style="margin:0 0 12px;color:#d9b65d;letter-spacing:.16em;font-size:11px;text-transform:uppercase">Recordatorio del cumple</p>
          <h1 style="margin:0 0 16px;font-size:30px;line-height:1.1">${input.youngName} cumple ${input.turningAge} años ${dayLabel}</h1>
          <p style="margin:0 0 18px;color:#c9d7cc">Hola ${input.recipientName}, este aviso les ayuda a tener lista la Palabra, la oración y la celebración.</p>
          <div style="border-radius:18px;background:#122016;padding:20px;margin-bottom:20px">
            <p style="margin:0 0 8px;color:#d9b65d;font-size:12px;text-transform:uppercase;letter-spacing:.12em">Fecha</p>
            <p style="margin:0 0 18px;font-size:18px;color:#ffffff">${input.birthdayDate}</p>
            <p style="margin:0 0 8px;color:#d9b65d;font-size:12px;text-transform:uppercase;letter-spacing:.12em">Palabra para compartir</p>
            <p style="margin:0 0 18px;color:#ffffff">${input.scriptureReference || "Aún sin versículo"}</p>
            <p style="margin:0 0 8px;color:#d9b65d;font-size:12px;text-transform:uppercase;letter-spacing:.12em">Motivo para orar</p>
            <p style="margin:0;color:#ffffff">${input.prayerFocus || "Aún sin definir"}</p>
          </div>
          <a href="${input.detailUrl}" style="display:inline-block;padding:14px 22px;border-radius:999px;background:linear-gradient(135deg,#d9b65d,#f0d27a);color:#09120c;font-weight:700;text-decoration:none">Abrir detalle del cumple</a>
        </div>
      </div>
    `,
  })

  return "sent" as const
}
