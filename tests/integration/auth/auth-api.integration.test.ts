/** @jest-environment node */

import { afterAll, afterEach, beforeAll, describe, expect, it, jest } from "@jest/globals"

import { loginWithApi } from "@/src/services/auth/auth-api"

const originalFetch = global.fetch

describe("auth api integration", () => {
  let fetchMock: jest.MockedFunction<typeof fetch>

  beforeAll(() => {
    fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === "string" ? input : input.toString()
      if (url !== "/api/auth/login") {
        return new Response(JSON.stringify({ error: "Not found" }), { status: 404 })
      }

      const body = JSON.parse(String(init?.body ?? "{}")) as {
        email?: string
        password?: string
      }

      if (body.email === "test@correo.com" && body.password === "123456") {
        return new Response(JSON.stringify({ token: "safe-token" }), { status: 200 })
      }

      return new Response(JSON.stringify({ error: "Credenciales inválidas" }), {
        status: 401,
      })
    }) as jest.MockedFunction<typeof fetch>

    global.fetch = fetchMock
  })

  afterEach(() => {
    fetchMock.mockClear()
  })

  afterAll(() => {
    global.fetch = originalFetch
  })

  it("retorna token en login exitoso", async () => {
    const result = await loginWithApi({
      email: "  TEST@CORREO.COM  ",
      password: "123456",
    })

    expect(result).toEqual({ ok: true, token: "safe-token" })
    const requestInit = fetchMock.mock.calls[0][1] as RequestInit
    const payload = JSON.parse(String(requestInit.body)) as {
      email: string
      password: string
    }
    expect(payload.email).toBe("test@correo.com")
  })

  it("retorna error en credenciales inválidas", async () => {
    const result = await loginWithApi({
      email: "test@correo.com",
      password: "wrong-pass",
    })

    expect(result).toEqual({ ok: false, error: "Credenciales inválidas" })
  })

  it("bloquea payload malicioso antes de ir a la API", async () => {
    const result = await loginWithApi({
      email: "<script>alert(1)</script>@mail.com",
      password: "123456",
    })

    expect(result).toEqual({ ok: false, error: "Payload sospechoso" })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("retorna fallback cuando backend no envía campo error", async () => {
    fetchMock.mockImplementationOnce(async () =>
      ({
        ok: false,
        json: async () => ({}),
      }) as unknown as Response
    )

    const result = await loginWithApi({
      email: "test@correo.com",
      password: "123456",
    })

    expect(result).toEqual({ ok: false, error: "Error de autenticación" })
  })

  it("retorna error genérico si el backend responde JSON inválido", async () => {
    fetchMock.mockImplementationOnce(async () =>
      ({
        ok: false,
        json: async () => {
          throw new Error("invalid-json")
        },
      }) as unknown as Response
    )

    const result = await loginWithApi({
      email: "test@correo.com",
      password: "123456",
    })

    expect(result).toEqual({ ok: false, error: "Error de autenticación" })
  })
})
