import { NextRequest, NextResponse } from "next/server"
import { runBirthdayReminderJob } from "@/lib/birthdays/repository"

function isAuthorized(request: NextRequest) {
  const secret = process.env.BIRTHDAYS_CRON_SECRET
  if (!secret) {
    return false
  }

  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "")
  const headerSecret = request.headers.get("x-cron-secret")

  return bearerToken === secret || headerSecret === secret
}

async function handleCron(request: NextRequest) {
  if (!process.env.BIRTHDAYS_CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Falta BIRTHDAYS_CRON_SECRET en variables de entorno." },
      { status: 500 }
    )
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "No autorizado." }, { status: 401 })
  }

  const result = await runBirthdayReminderJob()

  return NextResponse.json({
    ok: true,
    ranAt: new Date().toISOString(),
    ...result,
  })
}

export async function GET(request: NextRequest) {
  return handleCron(request)
}

export async function POST(request: NextRequest) {
  return handleCron(request)
}
