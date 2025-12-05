import { motion } from "framer-motion"

interface PromptSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void
}

export function PromptSuggestions({ onSuggestionClick }: PromptSuggestionsProps) {
  const suggestions = [
    "Health Tracker (Neo-Brutalism)",
    "Weather Forecast (Glassmorphism)",
    "Pet Manager (Playful Whimsical)",
    "Stopwatch & Timer (Swiss Style)"
  ]

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6 px-2">
      {suggestions.map((text, index) => (
        <motion.button
          key={index}
          onClick={() => onSuggestionClick(text)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 rounded-full bg-black/40 text-slate-300 hover:text-white border border-slate-700 text-sm transition"
        >
          {text}
        </motion.button>
      ))}
    </div>
  )
}
