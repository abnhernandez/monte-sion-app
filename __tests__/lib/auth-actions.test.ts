import { describe, expect, it, jest, beforeEach } from "@jest/globals"

const mockGetSupabaseServer = jest.fn() as jest.MockedFunction<
  () => Promise<unknown>
>
const mockGetServerTrackedQueryParams = jest.fn() as jest.MockedFunction<
  () => Promise<unknown>
>

import { loginAction } from "@/lib/auth-actions"

jest.mock("@/lib/supabase-server", () => ({
  getSupabaseServer: mockGetSupabaseServer,
}))

jest.mock("@/lib/query-params-server", () => ({
  getServerTrackedQueryParams: mockGetServerTrackedQueryParams,
}))

jest.mock("@/lib/query-params-audit", () => ({
  logCampaignConversion: jest.fn(),
}))

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}))

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}))

describe("loginAction", () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("devuelve un error genérico cuando las credenciales fallan", async () => {
    const signInWithPassword = jest.fn(async () => ({
      data: { user: null },
      error: { message: "Invalid login" },
    }))

    mockGetSupabaseServer.mockResolvedValue({
      auth: { signInWithPassword },
    })
    mockGetServerTrackedQueryParams.mockResolvedValue({})

    const result = await loginAction({
      email: "demo@correo.com",
      password: "incorrecta",
    })

    expect(result).toEqual({ error: "Credenciales inválidas" })
  })
})