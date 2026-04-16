type BibleVersionLike = {
  id?: string
  name?: string
}

const VERSION_LABEL_BY_ID: Record<string, string> = {
  "15": "B21",
  "76": "HPB",
  "89": "LBLA",
  "103": "NBLA",
  "128": "NVI 2022",
  "1637": "NVI",
  "2664": "NVI 2015",
}

function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim()
}

function compactSpacing(value: string): string {
  return value.replace(/\s+/g, " ").trim()
}

export function formatBibleVersionLabel(version: BibleVersionLike): string {
  const versionId = version.id?.trim() ?? ""
  if (versionId && VERSION_LABEL_BY_ID[versionId]) {
    return VERSION_LABEL_BY_ID[versionId]
  }

  const normalizedName = normalize(version.name ?? "")

  if (!normalizedName) {
    return versionId || "Versión"
  }

  if (normalizedName.includes("reina valera 1960") || normalizedName.includes("rvr1960") || normalizedName.includes("rvr 1960")) {
    return "RVR60"
  }

  if (normalizedName.includes("nueva version internacional") || normalizedName.includes("spanish nvi") || normalizedName === "nvi") {
    if (normalizedName.includes("2022")) {
      return "NVI 2022"
    }

    if (normalizedName.includes("2015")) {
      return "NVI 2015"
    }

    return "NVI"
  }

  if (normalizedName.includes("new international version")) {
    return normalizedName.includes("2011") ? "NIV 2011" : "NIV"
  }

  if (normalizedName.includes("biblia de las americas") || normalizedName.includes("la biblia de las americas") || normalizedName.includes("lbla")) {
    return normalizedName.includes("nueva") ? "NBLA" : "LBLA"
  }

  if (normalizedName.includes("bible 21") || normalizedName.includes("biblion")) {
    return "B21"
  }

  if (normalizedName.includes("hawaii pidgin bible")) {
    return "HPB"
  }

  const words = compactSpacing(version.name ?? "").split(" ")
  const initials = words
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()

  return initials.length >= 2 ? initials.slice(0, 6) : compactSpacing(version.name ?? "Versión")
}
