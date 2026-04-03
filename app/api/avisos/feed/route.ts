import { NextResponse } from "next/server"
import { getAvisosActorContext } from "@/lib/avisos/permissions"
import { getAvisosHubPayload } from "@/lib/avisos/queries"

export async function GET() {
  try {
    const actor = await getAvisosActorContext()
    const payload = await getAvisosHubPayload(actor)
    return NextResponse.json(payload)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo cargar el feed.",
      },
      { status: 500 }
    )
  }
}
