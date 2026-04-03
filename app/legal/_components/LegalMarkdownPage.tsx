import Link from "next/link"
import { readFile } from "fs/promises"
import path from "path"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

type LegalMarkdownPageProps = {
  title: string
  description: string
  docRelativePath: string
}

export default async function LegalMarkdownPage({
  title,
  description,
  docRelativePath,
}: LegalMarkdownPageProps) {
  const filePath = path.join(process.cwd(), docRelativePath)
  const content = await readFile(filePath, "utf8")

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <header className="space-y-3 rounded-2xl border border-border bg-card p-6">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Centro legal
          </p>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">{description}</p>
          <nav className="flex flex-wrap gap-4 text-sm">
            <Link href="/legal" className="text-primary hover:underline">
              Ver todos los documentos
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              Volver al inicio
            </Link>
          </nav>
        </header>

        <article className="prose prose-neutral max-w-none rounded-2xl border border-border bg-card p-6 dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      </div>
    </main>
  )
}
