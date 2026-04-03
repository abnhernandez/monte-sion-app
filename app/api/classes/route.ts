import { NextResponse } from "next/server"
import { saveClassSession } from "@/lib/avisos/mutations"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = await saveClassSession(body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo guardar la clase.",
      },
      { status: 400 }
    )
  }
}
