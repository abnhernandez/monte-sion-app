import { validateLoginInput, type LoginInput } from "@/src/services/auth/input-security"

export type LoginApiSuccess = {
  ok: true
  token: string
}

export type LoginApiFailure = {
  ok: false
  error: string
}

export type LoginApiResult = LoginApiSuccess | LoginApiFailure

export async function loginWithApi(input: LoginInput): Promise<LoginApiResult> {
  const validation = validateLoginInput(input)
  if (!validation.valid) {
    return { ok: false, error: validation.reason }
  }

  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: input.email.trim().toLowerCase(),
      password: input.password,
    }),
  })

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => ({ error: "Error de autenticación" }))) as { error?: string }
    return { ok: false, error: errorBody.error ?? "Error de autenticación" }
  }

  const body = (await response.json()) as { token: string }
  return { ok: true, token: body.token }
}
