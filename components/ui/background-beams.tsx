"use client"
import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export const BackgroundBeams = ({
  className,
  from = "from-purple-500",
  via = "via-indigo-500",
  to = "to-purple-500",
}: {
  className?: string
  from?: string
  via?: string
  to?: string
}) => {
  const backgroundBeamsRef = useRef<HTMLDivElement>(null)
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 })
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
      if (backgroundBeamsRef.current) {
        const rect = backgroundBeamsRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        setCursorPosition({ x, y })
      }
    }

    document.addEventListener("mousemove", handleMouseMove)
    return () => {
      document.removeEventListener("mousemove", handleMouseMove)
    }
  }, [isMobile])

  return (
    <div ref={backgroundBeamsRef} className={cn("absolute inset-0 overflow-hidden -z-10", className)}>
      {!isMobile && (
        <div
          className={cn(
            "absolute top-0 left-0 w-full h-full bg-transparent",
            "[--circle-size:100px] md:[--circle-size:200px]",
            "radial-gradient-circle",
            from,
            via,
            to,
          )}
          style={{
            background: `radial-gradient(var(--circle-size) var(--circle-size) at ${cursorPosition.x}px ${cursorPosition.y}px, var(--tw-gradient-stops))`,
            opacity: 0.3,
          }}
        />
      )}
      <div className={cn("absolute inset-0 bg-gradient-to-b opacity-30", from, to)} />
    </div>
  )
}
