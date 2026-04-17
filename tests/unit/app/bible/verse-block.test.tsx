import type { ComponentProps } from "react"
import { beforeEach, describe, expect, it, jest } from "@jest/globals"
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"

jest.mock("@/lib/bible-actions", () => ({
  getBiblePassage: jest.fn(),
}))

jest.mock("@/lib/bible-compare-ai", () => ({
  summarizeBibleComparison: jest.fn(),
}))

jest.mock("sonner", () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}))

import {
  Verse,
  buildDiffSpans,
  calculateSimilarity,
  tokenizeCompareText,
} from "@/app/bible/verse-block"
import { getBiblePassage } from "@/lib/bible-actions"
import { summarizeBibleComparison } from "@/lib/bible-compare-ai"

const mockedGetBiblePassage = getBiblePassage as jest.MockedFunction<typeof getBiblePassage>
const mockedSummarizeBibleComparison =
  summarizeBibleComparison as jest.MockedFunction<typeof summarizeBibleComparison>

const compareVersions = [
  { id: "rvr60", name: "Reina-Valera 1960" },
  { id: "nvi", name: "Nueva Versión Internacional" },
  { id: "tla", name: "Traducción en Lenguaje Actual" },
  { id: "pdt", name: "Palabra de Dios para Todos" },
]

function createPassage(versionId: string, text: string) {
  return {
    reference: `Juan 3:16 ${versionId.toUpperCase()}`,
    text,
    versionId,
    versionName: versionId.toUpperCase(),
  }
}

function renderVerse(
  overrides: Partial<ComponentProps<typeof Verse>> = {}
) {
  return render(
    <Verse
      number={16}
      text="Porque de tal manera amó Dios al mundo"
      sizeClassName="text-base"
      fontClassName="font-serif"
      referenceLabel="Juan 3:16 RVR60"
      storageKey="juan-3-16-rvr60"
      selectionGroupId="group-juan-3"
      selectionSortOrder={0}
      comparePassage="JHN.3.16"
      compareBibleId="rvr60"
      compareVersions={compareVersions}
      {...overrides}
    />
  )
}

function createDeferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (reason?: unknown) => void

  const promise = new Promise<T>((resolvePromise, rejectPromise) => {
    resolve = resolvePromise
    reject = rejectPromise
  })

  return { promise, resolve, reject }
}

describe("Verse comparison modal", () => {
  beforeEach(() => {
    jest.resetAllMocks()
    window.localStorage.clear()

    Object.defineProperty(window, "requestAnimationFrame", {
      configurable: true,
      writable: true,
      value: (callback: FrameRequestCallback) => setTimeout(() => callback(0), 0),
    })

    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      writable: true,
      value: {
        writeText: jest.fn(),
      },
    })
  })

  it("tokeniza ignorando stopwords y acentos", () => {
    const significantWords = tokenizeCompareText("Él es el camino y la verdad")
      .filter((token) => token.significant)
      .map((token) => token.normalized)

    expect(significantWords).toEqual(["camino", "verdad"])
  })

  it("marca reemplazos, agregados y eliminados en el diff", () => {
    const spans = buildDiffSpans(
      "Jesús sana hoy",
      "Cristo sana ahora siempre"
    )

    expect(
      spans.some((span) => span.kind === "replaced" && span.text.includes("Cristo"))
    ).toBe(true)
    expect(
      spans.some((span) => span.kind === "added" && span.text.includes("siempre"))
    ).toBe(true)
    expect(
      spans.some((span) => span.kind === "removed" && span.text.includes("Jesús"))
    ).toBe(true)
  })

  it("calcula similitud por intersección de palabras relevantes", () => {
    expect(
      calculateSimilarity("Canción de adoración", "Cancion adoracion profunda")
    ).toBe(67)
  })

  it("abre el modal, agrega varias versiones y reutiliza cache por versión", async () => {
    mockedGetBiblePassage.mockImplementation(async ({ bibleId = "" }) => {
      if (bibleId === "nvi") {
        return createPassage("nvi", "Porque Dios amó tanto al mundo")
      }

      if (bibleId === "tla") {
        return createPassage("tla", "Dios amó muchísimo a todos en el mundo")
      }

      return createPassage(bibleId, "Texto genérico")
    })

    const user = userEvent.setup()
    const { container } = renderVerse()

    await user.click(screen.getByRole("button", { name: /comparar/i }))

    expect(
      await screen.findByText(/Porque Dios amó tanto al mundo/i)
    ).toBeInTheDocument()
    expect(mockedGetBiblePassage).toHaveBeenCalledTimes(1)
    expect(mockedGetBiblePassage).toHaveBeenCalledWith({
      bibleId: "nvi",
      passage: "JHN.3.16",
    })

    const select = screen.getByRole("combobox")
    await user.selectOptions(select, "tla")
    await user.click(screen.getAllByRole("button", { name: /agregar versión/i })[0])

    expect(
      await screen.findByText(/Dios amó muchísimo a todos en el mundo/i)
    ).toBeInTheDocument()
    expect(mockedGetBiblePassage).toHaveBeenCalledTimes(2)

    const nviColumn = container.querySelector(
      '[data-compare-column="nvi"]'
    ) as HTMLElement

    expect(
      screen.queryByRole("button", { name: /quitar reina-valera 1960/i })
    ).toBeNull()

    await user.click(
      within(nviColumn).getByRole("button", { name: /quitar nueva versión internacional/i })
    )

    expect(
      container.querySelector('[data-compare-column="nvi"]')
    ).toBeNull()

    await user.selectOptions(select, "nvi")
    await user.click(screen.getAllByRole("button", { name: /agregar versión/i })[0])

    expect(
      await screen.findByText(/Porque Dios amó tanto al mundo/i)
    ).toBeInTheDocument()
    expect(mockedGetBiblePassage).toHaveBeenCalledTimes(2)
  })

  it("muestra carga y error por versión", async () => {
    const nviDeferred = createDeferred<ReturnType<typeof createPassage>>()

    mockedGetBiblePassage.mockImplementation(({ bibleId = "" }) => {
      if (bibleId === "nvi") {
        return nviDeferred.promise
      }

      if (bibleId === "tla") {
        return Promise.reject(new Error("boom"))
      }

      return Promise.resolve(createPassage(bibleId, "Texto genérico"))
    })

    const user = userEvent.setup()
    renderVerse()

    await user.click(screen.getByRole("button", { name: /comparar/i }))

    expect(
      await screen.findByText("Cargando comparación...")
    ).toBeInTheDocument()

    nviDeferred.resolve(createPassage("nvi", "Texto NVI cargado"))

    expect(await screen.findByText(/Texto NVI cargado/i)).toBeInTheDocument()

    const select = screen.getByRole("combobox")
    await user.selectOptions(select, "tla")
    await user.click(screen.getAllByRole("button", { name: /agregar versión/i })[0])

    expect(
      await screen.findByText("No se pudo cargar la versión seleccionada.")
    ).toBeInTheDocument()
  })

  it("sincroniza el scroll entre columnas activas", async () => {
    mockedGetBiblePassage.mockImplementation(async ({ bibleId = "" }) => {
      if (bibleId === "nvi") {
        return createPassage("nvi", "Texto de comparación NVI")
      }

      if (bibleId === "tla") {
        return createPassage("tla", "Texto de comparación TLA")
      }

      return createPassage(bibleId, "Texto genérico")
    })

    const user = userEvent.setup()
    const { container } = renderVerse()

    await user.click(screen.getByRole("button", { name: /comparar/i }))
    await screen.findByText(/Texto de comparación NVI/i)

    const select = screen.getByRole("combobox")
    await user.selectOptions(select, "tla")
    await user.click(screen.getAllByRole("button", { name: /agregar versión/i })[0])
    await screen.findByText(/Texto de comparación TLA/i)

    const baseScroll = container.querySelector(
      '[data-compare-scroll="base"]'
    ) as HTMLDivElement
    const nviScroll = container.querySelector(
      '[data-compare-scroll="nvi"]'
    ) as HTMLDivElement
    const tlaScroll = container.querySelector(
      '[data-compare-scroll="tla"]'
    ) as HTMLDivElement

    baseScroll.scrollTop = 140
    fireEvent.scroll(baseScroll)

    await waitFor(() => {
      expect(nviScroll.scrollTop).toBe(140)
      expect(tlaScroll.scrollTop).toBe(140)
    })
  })

  it("solo ejecuta la IA cuando el usuario la solicita", async () => {
    mockedGetBiblePassage.mockResolvedValue(
      createPassage("nvi", "Porque Dios amó tanto al mundo")
    )
    mockedSummarizeBibleComparison.mockResolvedValue({
      summary: "La NVI simplifica el énfasis y mantiene el núcleo del mensaje.",
    })

    const user = userEvent.setup()
    renderVerse()

    await user.click(screen.getByRole("button", { name: /comparar/i }))
    await screen.findByText(/Porque Dios amó tanto al mundo/i)

    expect(mockedSummarizeBibleComparison).not.toHaveBeenCalled()

    await user.click(screen.getByRole("button", { name: /analizar con ia/i }))

    expect(mockedSummarizeBibleComparison).toHaveBeenCalledTimes(1)
    expect(
      await screen.findByText(
        "La NVI simplifica el énfasis y mantiene el núcleo del mensaje."
      )
    ).toBeInTheDocument()
  })

  it("mantiene highlight y copy multi-selección sin romper la selección", async () => {
    mockedGetBiblePassage.mockResolvedValue(
      createPassage("nvi", "Texto NVI")
    )

    const user = userEvent.setup()
    const clipboard = window.navigator.clipboard as unknown as {
      writeText: jest.Mock
    }

    const { rerender } = render(
      <>
        <Verse
          number={16}
          text="Primer versículo"
          sizeClassName="text-base"
          fontClassName="font-serif"
          referenceLabel="Juan 3:16 RVR60"
          storageKey="verse-1"
          selectionGroupId="copy-group"
          selectionSortOrder={0}
          comparePassage="JHN.3.16"
          compareBibleId="rvr60"
          compareVersions={compareVersions}
        />
        <Verse
          number={17}
          text="Segundo versículo"
          sizeClassName="text-base"
          fontClassName="font-serif"
          referenceLabel="Juan 3:17 RVR60"
          storageKey="verse-2"
          selectionGroupId="copy-group"
          selectionSortOrder={1}
          comparePassage="JHN.3.17"
          compareBibleId="rvr60"
          compareVersions={compareVersions}
        />
      </>
    )

    await user.click(screen.getAllByRole("button", { name: /destacar/i })[0])

    expect(window.localStorage.getItem("bible-verse-highlight:verse-1")).toBe("1")

    const firstVerse = screen
      .getByText("Primer versículo")
      .closest('[role="button"]') as HTMLElement
    const secondVerse = screen
      .getByText("Segundo versículo")
      .closest('[role="button"]') as HTMLElement

    await user.click(firstVerse)
    await user.click(secondVerse)
    await user.click(screen.getAllByRole("button", { name: /copiar 2/i })[0])

    expect(clipboard.writeText).toHaveBeenCalledWith(
      "Juan 3:16 RVR60\nPrimer versículo\n\nJuan 3:17 RVR60\nSegundo versículo"
    )

    rerender(
      <Verse
        number={16}
        text="Primer versículo"
        sizeClassName="text-base"
        fontClassName="font-serif"
        referenceLabel="Juan 3:16 RVR60"
        storageKey="verse-1"
        selectionGroupId="copy-group"
        selectionSortOrder={0}
        comparePassage="JHN.3.16"
        compareBibleId="rvr60"
        compareVersions={compareVersions}
      />
    )

    expect(window.localStorage.getItem("bible-verse-highlight:verse-1")).toBe("1")
  })
})
