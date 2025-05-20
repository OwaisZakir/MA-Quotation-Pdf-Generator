"use client"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

type SpotlightProps = {
  className?: string
  fill?: string
}

export function Spotlight({ className = "", fill = "white" }: SpotlightProps) {
  const divRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const [opacity, setOpacity] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768)
    }

    handleResize()
    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  useEffect(() => {
    if (isMobile) return

    const handleMouseMove = (e: MouseEvent) => {
      if (!divRef.current) return
      const div = divRef.current
      const rect = div.getBoundingClientRect()

      const x = e.clientX - rect.left
      const y = e.clientY - rect.top

      setPosition({ x, y })
      setOpacity(1)
    }

    const handleMouseLeave = () => {
      setOpacity(0)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [isMobile])

  const spotlightColor =
    fill === "white"
      ? "bg-white"
      : fill === "blue"
        ? "bg-blue-400"
        : fill === "green"
          ? "bg-green-400"
          : fill === "amber"
            ? "bg-amber-400"
            : "bg-white"

  return (
    <div ref={divRef} className={cn("absolute top-0 left-0 w-full h-full pointer-events-none", className)}>
      <div
        className={cn("absolute inset-0 opacity-0 transition-opacity duration-500", spotlightColor)}
        style={{
          opacity: opacity * 0.1,
          background: `radial-gradient(600px circle at ${position.x}px ${position.y}px, ${fill === "white" ? "rgba(255,255,255,0.1)" : fill === "blue" ? "rgba(96, 165, 250, 0.1)" : fill === "green" ? "rgba(74, 222, 128, 0.1)" : fill === "amber" ? "rgba(245, 158, 11, 0.1)" : "rgba(255,255,255,0.1)"}, transparent 40%)`,
        }}
      />
    </div>
  )
}
