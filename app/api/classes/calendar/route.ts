import { NextResponse } from "next/server"
import { getAvisosActorContext } from "@/lib/avisos/permissions"
import { getClassItems } from "@/lib/avisos/queries"

export async function GET() {
  try {
    const actor = await getAvisosActorContext()
    const items = await getClassItems(actor)
    return NextResponse.json({ items })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo cargar el calendario.",
      },
      { status: 400 }
    )
  }
}
