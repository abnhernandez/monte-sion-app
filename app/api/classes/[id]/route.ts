import { NextResponse } from "next/server"
import { saveClassSession } from "@/lib/avisos/mutations"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const result = await saveClassSession({ ...body, id })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo actualizar la clase.",
      },
      { status: 400 }
    )
  }
}
