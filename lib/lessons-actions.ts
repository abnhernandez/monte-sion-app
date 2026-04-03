"use server"

import { getSupabaseServer } from "@/lib/supabase-server"

type Lesson = {
  id: string
  title: string
  href: string
  published_at: string
  views: number
}

type LessonDetails = Lesson

async function getLessonBase(
  options: {
    featured?: boolean
    limit?: number
  } = {}
): Promise<Lesson[]> {
  const supabase = await getSupabaseServer()

  const query = supabase
    .from("lessons")
    .select("id, title, href, published_at, views")
    .eq("published", true)

  if (typeof options.featured === "boolean") {
    query.eq("featured", options.featured)
  }

  const { data: lessons, error: lessonsError } = await query
    .order("position", { ascending: true })
    .order("published_at", { ascending: false })
    .limit(options.limit ?? 100)

  if (lessonsError) throw lessonsError

  if (!lessons || lessons.length === 0) return []

  return lessons
}

export async function getFeaturedLessons(limit = 8): Promise<Lesson[]> {
  return getLessonBase({ featured: true, limit })
}

export async function getLessons(limit = 100): Promise<Lesson[]> {
  return getLessonBase({ limit })
}

export async function recordLessonView(lessonId: string): Promise<boolean> {
  const supabase = await getSupabaseServer()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("Usuario no autenticado")
  }

  try {
    await supabase.from("lesson_views").insert({
      lesson_id: lessonId,
      user_id: user.id,
      viewed_at: new Date().toISOString(),
    })
    return true
  } catch (error) {
    console.error("Error registrando vista de lección:", error)
    return false
  }
}
export async function getLessonByHref(
  href: string
): Promise<LessonDetails | null> {
  const supabase = await getSupabaseServer()

  const { data: lesson, error: lessonError } = await supabase
    .from("lessons")
    .select("id, title, href, published_at, views")
    .eq("published", true)
    .eq("href", href)
    .maybeSingle()

  if (lessonError) throw lessonError
  if (!lesson) return null

  return lesson
}
