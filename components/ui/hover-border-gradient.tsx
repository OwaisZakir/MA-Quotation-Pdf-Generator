"use client"
import type React from "react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

type HoverBorderGradientProps = {
  children: React.ReactNode
  containerClassName?: string
  className?: string
  as?: React.ElementType
  duration?: number
  backgroundClassName?: string
  borderClassName?: string
  onClick?: () => void
  disabled?: boolean
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

export const HoverBorderGradient = ({
  children,
  containerClassName,
  className,
  as: Component = "div",
  duration = 500,
  backgroundClassName = "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 to-black",
  borderClassName = "bg-gradient-to-r from-purple-500 to-blue-500",
  onClick,
  disabled = false,
  onMouseEnter,
  onMouseLeave,
}: HoverBorderGradientProps) => {
  const [hover, setHover] = useState(false)

  return (
    <motion.div
      className={cn("p-[1px] rounded-lg relative", containerClassName)}
      onHoverStart={() => {
        setHover(true)
        onMouseEnter?.()
      }}
      onHoverEnd={() => {
        setHover(false)
        onMouseLeave?.()
      }}
      animate={{
        background: hover ? `linear-gradient(to right, hsl(var(--amber-500)), hsl(var(--yellow-500)))` : "none",
      }}
      transition={{ duration: duration / 1000 }}
    >
      <div
        className={cn("absolute inset-0 rounded-lg", borderClassName)}
        style={{
          opacity: hover ? 1 : 0,
          transition: `opacity ${duration / 1000}s ease`,
        }}
      />
      <Component
        className={cn("relative rounded-lg", backgroundClassName, className)}
        onClick={disabled ? undefined : onClick}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
        }}
      >
        {children}
      </Component>
    </motion.div>
  )
}
