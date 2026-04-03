import type { ComponentType } from "react"
import { beforeAll, beforeEach, describe, expect, it, jest } from "@jest/globals"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

type OAuthProvider = "github" | "notion" | "spotify"

type AuthActionsModule = {
  loginAction: jest.Mock<(payload: { email: string; password: string }) => Promise<{ error?: string } | void>>
  getOAuthUrlAction: jest.Mock<(provider: OAuthProvider) => Promise<{ error?: string; url?: string }>>
}

jest.mock("@/lib/auth-actions", () => ({
  loginAction: jest.fn(),
  getOAuthUrlAction: jest.fn(),
}))

const authActions = jest.requireMock("@/lib/auth-actions") as AuthActionsModule
let LoginForm: ComponentType

describe("LoginForm unit", () => {
  beforeAll(async () => {
    const loginFormModule = await import("@/app/components/login")
    LoginForm = loginFormModule.default
  })

  beforeEach(() => {
    jest.resetAllMocks()
  })

  it("muestra error cuando los campos están vacíos", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.click(screen.getByRole("button", { name: /entrar ahora/i }))

    expect(await screen.findByText("Correo inválido")).toBeTruthy()
    expect(await screen.findByText("Contraseña inválida")).toBeTruthy()
  })

  it("muestra error para email inválido", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Correo"), "no-es-email")
    await user.type(screen.getByLabelText("Contraseña"), "123456")
    await user.click(screen.getByRole("button", { name: /entrar ahora/i }))

    expect(await screen.findByText("Correo inválido")).toBeTruthy()
  })

  it("muestra error para password inválido", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Correo"), "test@correo.com")
    await user.type(screen.getByLabelText("Contraseña"), "123")
    await user.click(screen.getByRole("button", { name: /entrar ahora/i }))

    expect(await screen.findByText("Contraseña inválida")).toBeTruthy()
  })

  it("permite login exitoso con credenciales válidas", async () => {
    authActions.loginAction.mockResolvedValue(undefined)
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Correo"), "test@correo.com")
    await user.type(screen.getByLabelText("Contraseña"), "123456")
    await user.click(screen.getByRole("button", { name: /entrar ahora/i }))

    expect(authActions.loginAction).toHaveBeenCalledWith({
      email: "test@correo.com",
      password: "123456",
    })
    expect(screen.queryByRole("alert")).toBeNull()
  })

  it("muestra error de servidor cuando loginAction falla", async () => {
    authActions.loginAction.mockRejectedValue(new Error("boom"))
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Correo"), "test@correo.com")
    await user.type(screen.getByLabelText("Contraseña"), "123456")
    await user.click(screen.getByRole("button", { name: /entrar ahora/i }))

    expect(await screen.findByText("Error de servidor")).toBeTruthy()
  })

  it("muestra botones OAuth visibles", () => {
    render(<LoginForm />)

    expect(screen.getByRole("button", { name: /continuar con github/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /continuar con notion/i })).toBeTruthy()
    expect(screen.getByRole("button", { name: /continuar con spotify/i })).toBeTruthy()
  })

  it("click en OAuth llama la función correcta", async () => {
    const user = userEvent.setup()
    authActions.getOAuthUrlAction.mockResolvedValue({ error: "oauth-fail" })
    render(<LoginForm />)

    const clickOAuth = async (provider: OAuthProvider, label: RegExp) => {
      await user.click(screen.getByRole("button", { name: label }))
      expect(authActions.getOAuthUrlAction).toHaveBeenCalledWith(provider)
    }

    await clickOAuth("github", /continuar con github/i)
    await clickOAuth("notion", /continuar con notion/i)
    await clickOAuth("spotify", /continuar con spotify/i)
  })

  it("bloquea payloads peligrosos desde validación de email", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    await user.type(screen.getByLabelText("Correo"), "<script>alert(1)</script>@mail.com")
    await user.type(screen.getByLabelText("Contraseña"), "123456")
    await user.click(screen.getByRole("button", { name: /entrar ahora/i }))

    expect(await screen.findByText("Correo inválido")).toBeTruthy()
  })
})
