import { ImageResponse } from "next/og"

export const runtime = "edge"

export const size = {
  width: 1200,
  height: 630,
}

export const contentType = "image/png"

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "100px",
          background: "linear-gradient(135deg, #16261f, #0f1c17)",
          color: "white",
          fontFamily: "serif",
        }}
      >
        <div
          style={{
            fontSize: 26,
            letterSpacing: "6px",
            color: "#d5b466",
            marginBottom: 50,
          }}
        >
          CADA DECISIÓN DEFINE TU FUTURO
        </div>

        <div
          style={{
            fontSize: 72,
            fontWeight: 700,
            lineHeight: 1.05,
            marginBottom: 40,
          }}
        >
          Las decisiones más importantes de tu vida
        </div>

        <div
          style={{
            fontSize: 30,
            color: "#d5b466",
          }}
        >
          Sábado 28 de febrero · 6:00 PM · Oaxaca
        </div>
      </div>
    ),
    size
  )
}