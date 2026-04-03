"use client"

import { useState } from "react"
import Link from "next/link"
import Card from "@/app/components/card"
import Menu from "@/app/components/menu"

type CardItem = {
  title: string
  href: string
}

const CARDS: CardItem[] = [
  { title: "¿Quién es Dios?", href: "/lecciones/clase/789207" },
  { title: "¿Cómo buscar a Dios?", href: "/lecciones/clase/790207" },
  { title: "Unción del Espíritu Santo", href: "/lecciones/clase/791207" },
  { title: "¿Cómo honrar a Dios?", href: "/lecciones/clase/792207" },
  { title: "Id y haced discípulos", href: "/lecciones/clase/793207" },
]

export default function AuthenticatedHomeClient() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-neutral-900">
      <Menu collapsed={collapsed} onToggle={() => setCollapsed((prev) => !prev)} />

      <main className="flex-1 p-6">
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {CARDS.map(({ title, href }) => (
            <Link key={href} href={href} className="block">
              <Card title={title} />
            </Link>
          ))}
        </section>
      </main>
    </div>
  )
}
