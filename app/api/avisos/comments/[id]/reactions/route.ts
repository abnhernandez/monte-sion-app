import { NextResponse } from "next/server"
import { toggleAvisoCommentReaction } from "@/lib/avisos/mutations"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const result = await toggleAvisoCommentReaction(id, body)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo registrar la reacción.",
      },
      { status: 400 }
    )
  }
}
