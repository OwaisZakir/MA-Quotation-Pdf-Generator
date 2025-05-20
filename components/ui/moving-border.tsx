"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export const MovingBorder = ({
  children,
  duration = 2000,
  rx = "30px",
  ry = "30px",
  className,
  containerClassName,
  gradient1 = "from-purple-500 via-indigo-500 to-purple-500",
  gradient2 = "from-indigo-500 via-purple-500 to-indigo-500",
}: {
  children?: React.ReactNode
  duration?: number
  rx?: string
  ry?: string
  className?: string
  containerClassName?: string
  gradient1?: string
  gradient2?: string
}) => {
  const [animationReady, setAnimationReady] = useState(false)

  useEffect(() => {
    setAnimationReady(true)
  }, [])

  return (
    <div className={cn("relative p-[1px] overflow-hidden", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 z-[1]",
          animationReady && "animate-[gradient_2s_linear_infinite]",
          `[background-size:_200%_200%] bg-[linear-gradient(to_right,var(--tw-gradient-stops))]`,
          gradient1,
        )}
        style={{
          borderRadius: `${rx} ${ry}`,
        }}
      />
      <div
        className={cn(
          "absolute inset-0 z-[1] opacity-0 transition-opacity hover:opacity-100 bg-[linear-gradient(to_right,var(--tw-gradient-stops))]",
          animationReady && "animate-[gradient_2s_linear_infinite]",
          `[background-size:_200%_200%]`,
          gradient2,
        )}
        style={{
          borderRadius: `${rx} ${ry}`,
        }}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  )
}
