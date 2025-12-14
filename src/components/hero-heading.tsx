import { useState, useEffect } from "react"

export function HeroHeading() {
  const words = [
    "mobile apps",
    "dashboards",
    "UI designs",
    "mockups",
    "landing pages"
  ]

  const [index, setIndex] = useState(0)
  const [part, setPart] = useState("")
  const [forward, setForward] = useState(true)

  useEffect(() => {
    const current = words[index]

    if (forward) {
      if (part.length < current.length) {
        const timeout = setTimeout(() => setPart(current.slice(0, part.length + 1)), 55)
        return () => clearTimeout(timeout)
      }
      const hold = setTimeout(() => setForward(false), 1200)
      return () => clearTimeout(hold)
    } else {
      if (part.length > 0) {
        const timeout = setTimeout(() => setPart(current.slice(0, part.length - 1)), 35)
        return () => clearTimeout(timeout)
      }
      setForward(true)
      setIndex((prev) => (prev + 1) % words.length)
    }
  }, [part, forward, index])

  return (
    <div className="flex flex-col items-center text-center leading-tight mb-12">
      <h1 className="text-5xl md:text-6xl font-bold text-white">
        Design{" "}
        <span className="text-violet-400">
          {part}
          <span className="border-r-2 border-violet-400 animate-pulse ml-0.5"></span>
        </span>{" "}
        in minutes
      </h1>

      <h2 className="text-xl md:text-2xl font-medium text-slate-300 max-w-2xl mt-4">
        Go from idea to beautiful app mockups by chatting with AI
      </h2>
    </div>
  )
}
