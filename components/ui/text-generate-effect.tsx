"use client"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export const TextGenerateEffect = ({ words }: { words: string }) => {
  const [wordArray, setWordArray] = useState<string[]>([])
  const [completedTyping, setCompletedTyping] = useState(false)

  useEffect(() => {
    const timeout = setTimeout(() => {
      setWordArray(words.split(" "))
      setCompletedTyping(true)
    }, 1000)
    return () => clearTimeout(timeout)
  }, [words])

  return (
    <div className="font-light text-amber-100/80 text-base sm:text-lg md:text-xl">
      {wordArray.map((word, idx) => {
        return (
          <motion.span
            key={`${word}-${idx}`}
            className="inline-block"
            initial={{ opacity: 0 }}
            animate={completedTyping ? { opacity: 1 } : {}}
            transition={{
              duration: 0.2,
              delay: idx * 0.05,
              ease: "easeInOut",
            }}
          >
            {word}{" "}
          </motion.span>
        )
      })}
    </div>
  )
}
