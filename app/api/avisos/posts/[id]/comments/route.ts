import { NextResponse } from "next/server"
import { saveAvisoComment } from "@/lib/avisos/mutations"
import { getAvisosActorContext } from "@/lib/avisos/permissions"
import { getAvisoComments } from "@/lib/avisos/queries"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const actor = await getAvisosActorContext()
    const comments = await getAvisoComments(actor, id)
    return NextResponse.json({ items: comments })
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudieron cargar los comentarios.",
      },
      { status: 400 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const result = await saveAvisoComment({ ...body, aviso_id: id })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "No se pudo guardar el comentario.",
      },
      { status: 400 }
    )
  }
}
