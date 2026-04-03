import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabase-server"

export async function POST(req: Request) {
  const { lesson_id } = await req.json()

  if (!lesson_id) {
    return NextResponse.json({ error: "lesson_id requerido" }, { status: 400 })
  }

  const supabase = await getSupabaseServer()

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, views")
    .eq("id", lesson_id)
    .maybeSingle()

  if (lessonError || !lesson) {
    return NextResponse.json({ error: "Lección no encontrada" }, { status: 404 })
  }

  const { error: updateError } = await supabase
    .from("lessons")
    .update({ views: (lesson.views ?? 0) + 1 })
    .eq("id", lesson_id)

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true })
}