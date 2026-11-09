"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { GlowCard } from "./spotlight-card"

export type FlipCardProps = {
  cardNumber?: number | string
  frontTag?: string
  frontTitle?: string
  frontDescription?: string
  frontIcon?: React.ReactNode
  frontContent?: React.ReactNode
  backTag?: string
  backTitle?: string
  backContent?: string | React.ReactNode
  backImage?: string
  backImageAlt?: string
  logoSrc?: string
  logoAlt?: string
  logo?: React.ReactNode
  canFlip?: boolean
  isFlipped?: boolean
  defaultFlipped?: boolean
  onFlipChange?: (cardNumber: number | string, isFlipped: boolean) => void
  className?: string
  children?: React.ReactNode
}

function DefaultLogo() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-10 w-10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M24 4L42 14V34L24 44L6 34V14L24 4Z"
        className="fill-foreground/90"
      />
      <path
        d="M24 12L34 18V30L24 36L14 30V18L24 12Z"
        className="fill-background"
      />
    </svg>
  )
}

export function FlipCard({
  cardNumber = 1,
  frontTag,
  frontTitle,
  frontDescription,
  frontIcon,
  frontContent,
  backTag,
  backTitle = "Título",
  backContent = "Conteúdo",
  backImage = "",
  backImageAlt = "Imagem do conteúdo",
  logoSrc,
  logoAlt = "Logo",
  logo,
  canFlip = true,
  isFlipped,
  defaultFlipped = false,
  onFlipChange,
  className,
}: FlipCardProps) {
  const [internalFlipped, setInternalFlipped] = React.useState(defaultFlipped)

  const isControlled = typeof isFlipped === "boolean"
  const flipped = isControlled ? isFlipped : internalFlipped

  const updateFlipped = React.useCallback(
    (nextValue: boolean) => {
      if (!isControlled) {
        setInternalFlipped(nextValue)
      }

      onFlipChange?.(cardNumber, nextValue)
    },
    [cardNumber, isControlled, onFlipChange]
  )

  const toggleFlip = React.useCallback(() => {
    if (!canFlip) return
    updateFlipped(!flipped)
  }, [canFlip, flipped, updateFlipped])

  const handleClick = React.useCallback(() => {
    toggleFlip()
  }, [toggleFlip])

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== "Enter" && event.key !== " ") return

      event.preventDefault()
      toggleFlip()
    },
    [toggleFlip]
  )

  const hasRichFront = Boolean(frontTitle || frontDescription || frontContent || frontTag)

  return (
    <GlowCard
      glowColor="green"
      customSize
      radius={24}
      onClick={handleClick}
      className={cn(
        "relative mx-auto h-[380px] w-full max-w-[340px] cursor-pointer rounded-3xl text-card-foreground outline-none border border-slate-200 dark:border-forest-border shadow-sm select-none group",
        !canFlip && "cursor-not-allowed opacity-70",
        className
      )}
    >
      <div
        role="button"
        tabIndex={canFlip ? 0 : -1}
        aria-pressed={flipped}
        aria-disabled={!canFlip}
        onKeyDown={handleKeyDown}
        className="w-full h-full"
        style={{ perspective: 1000 }}
      >
        <div
          style={{
            transformStyle: "preserve-3d",
            WebkitTransformStyle: "preserve-3d",
            transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
          }}
          className="relative h-full w-full rounded-3xl transition-transform duration-600 ease-[cubic-bezier(0.16,1,0.3,1)] [transform-style:preserve-3d]"
        >
          {/* FRONT FACE */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              zIndex: flipped ? 0 : 2,
              pointerEvents: flipped ? "none" : "auto",
            }}
            className={cn(
              "absolute inset-0 flex h-full w-full flex-col rounded-3xl bg-white dark:bg-forest-card text-card-foreground shadow-sm hover:border-emerald-500/50 dark:hover:border-emerald-500/50 transition-colors [backface-visibility:hidden]",
              hasRichFront ? "p-6 sm:p-7 justify-between" : "items-center justify-center p-6"
            )}
          >
            {hasRichFront ? (
              <>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {frontIcon ? (
                        <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform duration-200">
                          {frontIcon}
                        </div>
                      ) : (
                        <div className="flex w-9 items-center justify-center">
                          {logo ? logo : logoSrc ? <img src={logoSrc} alt={logoAlt} className="h-full w-full" draggable={false} /> : <DefaultLogo />}
                        </div>
                      )}
                      {frontTag && (
                        <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-forest-card/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-forest-border font-sans">
                          {frontTag}
                        </span>
                      )}
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-500">
                      {typeof cardNumber === "number" ? String(cardNumber).padStart(2, "0") : cardNumber}
                    </span>
                  </div>

                  {frontTitle && (
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {frontTitle}
                    </h3>
                  )}

                  {frontDescription && (
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {frontDescription}
                    </p>
                  )}

                  {frontContent}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-forest-border/60 flex items-center justify-between text-xs font-semibold text-slate-400 dark:text-slate-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                  <span className="font-sans">Click to see evidence</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Flip Card →
                  </span>
                </div>
              </>
            ) : (
              <>
                <span className="absolute right-4 top-4 font-mono text-sm opacity-30">
                  {cardNumber}
                </span>

                <span className="absolute bottom-4 left-4 font-mono text-sm opacity-30">
                  {cardNumber}
                </span>

                <div className="flex w-10 items-center justify-center">
                  {logo ? (
                    logo
                  ) : logoSrc ? (
                    <img
                      src={logoSrc}
                      alt={logoAlt}
                      className="h-full w-full"
                      draggable={false}
                    />
                  ) : (
                    <DefaultLogo />
                  )}
                </div>
              </>
            )}
          </div>

          {/* BACK FACE */}
          <div
            style={{
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
              WebkitTransform: "rotateY(180deg)",
              zIndex: flipped ? 2 : 0,
              pointerEvents: flipped ? "auto" : "none",
            }}
            className="absolute inset-0 flex h-full w-full flex-col justify-between overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-[#072418] to-forest-root text-white shadow-xl [backface-visibility:hidden] [transform:rotateY(180deg)]"
          >
            {backImage ? (
              <div className="relative h-36 w-full shrink-0 overflow-hidden border-b border-emerald-500/20 bg-slate-900">
                <img
                  src={backImage}
                  alt={backImageAlt}
                  className="h-full w-full object-cover"
                  draggable={false}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#072418] via-transparent to-black/30" />
                <div className="absolute top-2.5 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-sm border border-white/20 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
                  {backTag || "Evidence & Grounding"}
                </div>
              </div>
            ) : (
              <div className="flex h-28 w-full items-center justify-center border-b border-emerald-500/20 bg-emerald-950/60 text-xs text-emerald-300/80">
                {backTag || "Evidence Breakdown"}
              </div>
            )}

            <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
              <div className="space-y-2">
                <span className="font-bold text-sm sm:text-base text-white tracking-tight block">
                  {backTitle}
                </span>

                {typeof backContent === "string" ? (
                  <p className="text-xs sm:text-[13px] text-emerald-100/90 leading-relaxed">
                    {backContent}
                  </p>
                ) : (
                  backContent
                )}
              </div>

              <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between text-xs font-semibold text-emerald-300">
                <span className="font-sans text-[11px]">Click to flip back</span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                  Return ←
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </GlowCard>
  )
}

export default FlipCard
