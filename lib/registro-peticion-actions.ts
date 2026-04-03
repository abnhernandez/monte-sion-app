"use server"

import { createClient } from "@supabase/supabase-js"
import nodemailer from "nodemailer"
import { rateLimit } from "@/lib/rate-limit"
import { headers } from "next/headers"
import crypto from "crypto"
import { createNotificationForAdmins } from "@/lib/notifications"

type RegistroData = {
  nombre: string
  email?: string
  anonimo: boolean

  peticion_cipher: string
  peticion_iv: string
  peticion_key_rsa: string
}

if (
  !process.env.PETICION_AES_KEY ||
  !process.env.PETICION_HMAC_KEY ||
  !process.env.RSA_PRIVATE_KEY
) {
  throw new Error("Faltan claves criptográficas en variables de entorno")
}

const AES_KEY = Buffer.from(process.env.PETICION_AES_KEY, "hex")
const HMAC_KEY = process.env.PETICION_HMAC_KEY
const RSA_PRIVATE_KEY = process.env.RSA_PRIVATE_KEY

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

function sha256(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex")
}

function decryptE2EE(cipherHex: string, ivHex: string, keyHex: string) {
  const privateKey = crypto.createPrivateKey({
    key: RSA_PRIVATE_KEY!,
    format: "pem",
    type: "pkcs8",
  })

  const aesKey = crypto.privateDecrypt(
    {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_OAEP_PADDING,
      oaepHash: "sha256",
    },
    Buffer.from(keyHex, "hex")
  )

  const cipherBuffer = Buffer.from(cipherHex, "hex")
  const authTag = cipherBuffer.slice(cipherBuffer.length - 16)
  const encrypted = cipherBuffer.slice(0, cipherBuffer.length - 16)

  const decipher = crypto.createDecipheriv(
    "aes-256-gcm",
    aesKey,
    Buffer.from(ivHex, "hex")
  )

  decipher.setAuthTag(authTag)

  const decrypted = Buffer.concat([
    decipher.update(encrypted),
    decipher.final(),
  ])

  return decrypted.toString("utf8")
}

function encryptAES(text: string) {
  const iv = crypto.randomBytes(12)
  const cipher = crypto.createCipheriv("aes-256-gcm", AES_KEY, iv)

  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  const tag = cipher.getAuthTag()

  return {
    iv: iv.toString("hex"),
    data: encrypted.toString("hex"),
    tag: tag.toString("hex"),
  }
}

function signHMAC(data: string) {
  return crypto.createHmac("sha256", HMAC_KEY).update(data).digest("hex")
}

function sanitize(text: string) {
  return text.replace(/<[^>]*>?/gm, "").trim()
}

export async function crearRegistro(data: RegistroData) {
  try {
    const h = await headers()

    const ipRaw =
      h.get("x-forwarded-for")?.split(",")[0] ??
      h.get("x-real-ip") ??
      "unknown"

    const ipHash = sha256(ipRaw)

    const country =
      h.get("x-vercel-ip-country") ??
      h.get("cf-ipcountry") ??
      "MX"

    await rateLimit(`ip:${ipHash}`, 5, 60_000)

    if (!data.anonimo && data.email) {
      await rateLimit(`email:${sha256(data.email)}`, 3, 60_000)
    }

    const textoPlano = decryptE2EE(
      data.peticion_cipher,
      data.peticion_iv,
      data.peticion_key_rsa
    )

    const peticionLimpia = sanitize(textoPlano)

    const cipher = encryptAES(peticionLimpia)

    const hmac = signHMAC(cipher.data)

    const emailHash = data.email ? sha256(data.email) : null

    const { error } = await supabase.from("registro").insert({
      nombre: data.anonimo ? null : data.nombre || null,
      apellido: null,

      email_hash: emailHash,

      peticion_cipher: cipher.data,
      peticion_iv: cipher.iv,
      peticion_tag: cipher.tag,
      peticion_hmac: hmac,

      anonimo: data.anonimo,
      ip_hash: ipHash,
      pais: country,
    })

    if (error) {
      console.error("SUPABASE ERROR:", error)
      throw new Error("Error al guardar la petición")
    }

    await createNotificationForAdmins({
      title: "Nueva petición recibida",
      message: "Se ha enviado una nueva petición de oración",
      tone: "attention",
    })

    if (!data.anonimo && data.email) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_FROM,
          to: data.email,
          subject: "🙏 Hemos recibido tu petición de oración",
          html: `
            <h2>Hola, ${data.nombre}</h2>
            <p>Tu petición fue recibida de forma segura y confidencial.</p>
            <p>Estamos orando por ti.</p>
            <p><em>Iglesia Monte Sion</em></p>
          `,
        })
      } catch (mailError) {
        console.error("EMAIL ERROR:", mailError)
      }
    }

    return { ok: true }
  } catch (err: unknown) {
    console.error("🔥 ERROR REAL:", err)
    const message = err instanceof Error ? err.message : String(err)
    return {
      ok: false,
      debug: message,
    }
  }
}