"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { chatStreamAction } from "@/lib/chat"

type Msg = {
  role: "user" | "assistant"
  content: string
}

const WELCOME_PHRASES = [
  "¿Qué estás pensando?",
  "¿En qué puedo ayudarte?",
  "Pregunta lo que quieras",
  "¿Sobre qué quieres hablar hoy?",
]

export default function ChatBot() {
  const bottomRef = useRef<HTMLDivElement>(null)

  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [phraseIndex, setPhraseIndex] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)

  const assistantBuffer = useRef("")
  const framePending = useRef(false)

  useEffect(() => {
    const id = setInterval(() => {
      setPhraseIndex(i => (i + 1) % WELCOME_PHRASES.length)
    }, 3500)
    return () => clearInterval(id)
  }, [])

  const flushAssistant = useCallback(() => {
    if (framePending.current) return
    framePending.current = true

    requestAnimationFrame(() => {
      setMessages(prev => {
        if (!prev.length) return prev
        const next = [...prev]
        next[next.length - 1] = {
          role: "assistant",
          content: assistantBuffer.current,
        }
        return next
      })
      framePending.current = false
    })
  }, [])

  const sendMessage = useCallback(async () => {
    if (!input.trim() || loading) return

    const userMessage = input
    setInput("")
    setLoading(true)

    assistantBuffer.current = ""
    setHasStarted(false)

    setMessages(prev => [
      ...prev,
      { role: "user", content: userMessage },
      { role: "assistant", content: "" },
    ])

    try {
      const result = await chatStreamAction(userMessage)

      if (result.stream) {
        const reader = result.stream.getReader()
        const decoder = new TextDecoder()

        while (true) {
          const { value, done } = await reader.read()
          if (done) break

          const text = decoder.decode(value)
          const lines = text.split("\n")

          for (const line of lines) {
            if (!line) continue
            const chunk = JSON.parse(line)
            const delta = chunk.choices[0]?.delta?.content
            if (!delta) continue

            setHasStarted(true)
            assistantBuffer.current += delta
            flushAssistant()
          }
        }
      }
    } catch (e) {
      console.error(e)
    }

    setMessages(prev => {
      const next = [...prev]
      next[next.length - 1].content = assistantBuffer.current
      return next
    })

    setLoading(false)
    requestAnimationFrame(() =>
      bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    )
  }, [input, loading, flushAssistant])

  return (
    <div className="flex flex-col w-full h-full rounded-xl overflow-hidden">
      <header className="h-12 flex items-center px-4 shrink-0">
        <p className="font-medium">ChatGPT</p>
        <p className="text-gray-400 ml-2">5.2</p>
      </header>

      <main className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center gap-4">
            <h1 className="text-3xl font-light transition-opacity duration-500">
              {WELCOME_PHRASES[phraseIndex]}
            </h1>
          </div>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed prose prose-invert max-w-none
              prose-h1:text-xl prose-h1:font-semibold
              prose-h2:text-lg prose-h2:font-semibold
              prose-h3:text-base prose-h3:font-medium
              prose-strong:font-semibold
              prose-ul:pl-5 prose-li:my-1
              ${
                msg.role === "user"
                  ? "bg-neutral-800 rounded-br-sm"
                  : "bg-neutral-700/60 backdrop-blur-sm rounded-bl-sm"
              }`}
            >
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {msg.content}
              </ReactMarkdown>

              {loading &&
                msg.role === "assistant" &&
                i === messages.length - 1 &&
                hasStarted && (
                  <span className="inline-block ml-1 animate-pulse">▍</span>
                )}
            </div>
          </div>
        ))}

        <div ref={bottomRef} />
      </main>

      <footer className="p-3 shrink-0">
        <div className="max-w-3xl mx-auto flex items-center gap-2 rounded-full px-4 py-2 bg-neutral-800">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()}
            placeholder="Pregunta lo que quieras"
            className="flex-1 outline-none bg-transparent"
          />

          <button
            onClick={sendMessage}
            className="h-8 w-8 flex items-center justify-center rounded-full bg-white text-black"
          >
            ➤
          </button>
        </div>
      </footer>
    </div>
  )
}