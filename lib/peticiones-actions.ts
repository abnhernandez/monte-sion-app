"use server"
import "server-only"

import { createClient } from "@supabase/supabase-js"
import { getSupabaseServer } from "@/lib/supabase-server"
import { createNotification, auditLog } from "@/lib/notifications"
import { ESTADOS_PETICION, type EstadoPeticion } from "@/lib/peticiones-types"
import OpenAI from "openai"
import crypto from "crypto"

/* ===============================
   CLIENTES
================================ */
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("SERVICE ROLE KEY NO CARGADA")
}

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL!, // ❗ NO NEXT_PUBLIC en server
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
})

/* ===============================
   CRYPTO
================================ */
const { PETICION_AES_KEY, PETICION_HMAC_KEY } = process.env
if (!PETICION_AES_KEY || !PETICION_HMAC_KEY) {
  throw new Error("Faltan claves criptográficas del servidor")
}

const AES_KEY = Buffer.from(PETICION_AES_KEY, "hex")
const HMAC_KEY = PETICION_HMAC_KEY

const signHMAC = (data: string) =>
  crypto.createHmac("sha256", HMAC_KEY).update(data).digest("hex")

function verifyHMAC(cipher: string, hmac: string) {
  const expected = Buffer.from(signHMAC(cipher), "hex")
  const received = Buffer.from(hmac, "hex")

  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    throw new Error("Integridad comprometida")
  }
}

function decryptAES(cipherHex: string, ivHex: string, tagHex: string) {
  try {
    const decipher = crypto.createDecipheriv(
      "aes-256-gcm",
      AES_KEY,
      Buffer.from(ivHex, "hex")
    )
    decipher.setAuthTag(Buffer.from(tagHex, "hex"))

    return Buffer.concat([
      decipher.update(Buffer.from(cipherHex, "hex")),
      decipher.final(),
    ]).toString("utf8")
  } catch {
    throw new Error("Error al descifrar la petición")
  }
}

/* ===============================
   TYPES
================================ */
const ESTADOS_VALIDOS: EstadoPeticion[] = [...ESTADOS_PETICION]

/* ===============================
   AUTH
================================ */
async function assertAdmin() {
  const supabase = await getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error("No autenticado")
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    throw new Error(error.message)
  }

  if (!data || !["admin", "leader"].includes(data.role)) {
    throw new Error("No autorizado")
  }

  return user
}

/* ===============================
   CREAR PETICIÓN
================================ */
export async function crearPeticion(data: {
  peticion_cipher: string
  peticion_iv: string
  peticion_tag: string
  peticion_hmac: string
}) {
  const { error } = await supabaseAdmin.from("registro").insert({
    ...data,
    estado: "Recibida",
  })

  if (error) {
    throw new Error(error.message)
  }

  await createNotification({
    userId: "admin",
    title: "Nueva petición recibida",
    message: "Se ha enviado una nueva petición de oración",
    tone: "attention",
  })
}

/* ===============================
   OBTENER PETICIONES
================================ */
export async function getPeticiones() {
  await assertAdmin()

  const { data, error } = await supabaseAdmin
    .from("registro")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

/* ===============================
   DESCIFRAR PETICIÓN (🔥 FIX CLAVE)
================================ */
export async function getPeticionDescifrada(id: string) {
  await assertAdmin()

  const { data, error } = await supabaseAdmin
    .from("registro")
    .select("peticion_cipher, peticion_iv, peticion_tag, peticion_hmac")
    .eq("id", id)
    .maybeSingle() // 👈 CLAVE

  if (error) {
    console.error("getPeticionDescifrada:", error)
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error("Petición no encontrada")
  }

  verifyHMAC(data.peticion_cipher, data.peticion_hmac)

  return decryptAES(
    data.peticion_cipher,
    data.peticion_iv,
    data.peticion_tag
  )
}

/* ===============================
   ACTUALIZAR ESTADO
================================ */
export async function updateEstadoPeticion(
  id: string,
  nuevoEstado: EstadoPeticion
) {
  if (!ESTADOS_VALIDOS.includes(nuevoEstado)) {
    throw new Error("Estado inválido")
  }
  const user = await assertAdmin()

  const { data: prev, error: prevError } = await supabaseAdmin
    .from("registro")
    .select("estado")
    .eq("id", id)
    .maybeSingle()

  if (prevError) {
    throw new Error(prevError.message)
  }

  if (!prev) {
    throw new Error("Petición no encontrada")
  }

  const { error } = await supabaseAdmin
    .from("registro")
    .update({ estado: nuevoEstado })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  await auditLog({
    actorId: user.id,
    action: "UPDATE_ESTADO_PETICION",
    entity: "registro",
    entityId: id,
    before: prev.estado,
    after: nuevoEstado,
  })

  await createNotification({
    userId: "admin",
    title: "Estado actualizado",
    message: `Petición pasó de "${prev.estado}" a "${nuevoEstado}"`,
    tone:
      nuevoEstado === "Resuelta" || nuevoEstado === "Completada"
        ? "resolved"
        : "progress",
  })

}

/* ===============================
   ELIMINAR PETICIÓN
================================ */
export async function deletePeticion(id: string) {
  const user = await assertAdmin()

  const { error } = await supabaseAdmin
    .from("registro")
    .delete()
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  await auditLog({
    actorId: user.id,
    action: "DELETE_PETICION",
    entity: "registro",
    entityId: id,
  })

  await createNotification({
    userId: "admin",
    title: "Petición eliminada",
    message: "Una petición fue eliminada por un líder",
    tone: "alert",
  })
}

/* ===============================
   RESUMEN IA
================================ */
export async function generarResumenIA(
  id: string,
  textoPeticion: string
) {
  const user = await assertAdmin()

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Resume esta petición de oración en una sola frase clara.",
      },
      { role: "user", content: textoPeticion },
    ],
    max_tokens: 60,
  })

  const resumen =
    completion.choices[0]?.message?.content?.trim()

  if (!resumen) {
    throw new Error("No se pudo generar el resumen")
  }

  const { error } = await supabaseAdmin
    .from("registro")
    .update({ resumen_ia: resumen })
    .eq("id", id)

  if (error) {
    throw new Error(error.message)
  }

  await auditLog({
    actorId: user.id,
    action: "GENERAR_RESUMEN_IA",
    entity: "registro",
    entityId: id,
  })

  await createNotification({
    userId: "admin",
    title: "Resumen IA generado",
    message: "Se creó un resumen automático para una petición",
    tone: "action",
  })

  return resumen
}

/* ===============================
   TEST DIRECTO
================================ */
export async function testNotificacion() {
  const { error } = await supabaseAdmin
    .from("notifications")
    .insert({
      user_id: "admin",
      title: "TEST",
      message: "Si esto aparece, ya funciona",
      tone: "attention",
      read: false,
      role: "admin",
    })

  if (error) {
    throw new Error(error.message)
  }
}