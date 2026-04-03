import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function GET() {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { data, error } = await supabase.from("progress").select("*").eq("user_id", user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json(data)
}

export async function POST(req: Request) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autenticado" }, { status: 401 })

  const { course_id, lesson_id, progress_percent, completed } = await req.json()
  const { error } = await supabase.from("progress").upsert({
    user_id: user.id,
    course_id,
    lesson_id,
    progress_percent,
    completed,
    updated_at: new Date().toISOString()
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ message: "Progreso guardado" })
}