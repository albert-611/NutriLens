"use client"

import * as React from "react"
import { FlipCard } from "./flip-card"

const cards = [
  {
    cardNumber: 1,
    backTitle: "Mount Everest",
    backContent: "Height: 8,849 m · Location: Nepal / Tibet",
    backImage:
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
  },
  {
    cardNumber: 2,
    backTitle: "K2",
    backContent: "Height: 8,611 m · Location: Pakistan / China",
    backImage:
      "https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80",
  },
  {
    cardNumber: 3,
    backTitle: "Kangchenjunga",
    backContent: "Height: 8,586 m · Location: Nepal / India",
    backImage:
      "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&w=600&q=80",
  },
]

function TwentyFirstLogo() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="21st logo"
      className="h-full w-full text-foreground"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M358.333 0C381.345 0 400 18.6548 400 41.6667V295.833C400 298.135 398.134 300 395.833 300H270.833C268.532 300 266.667 301.865 266.667 304.167V395.833C266.667 398.134 264.801 400 262.5 400H41.6667C18.6548 400 0 381.345 0 358.333V304.72C0 301.793 1.54269 299.081 4.05273 297.575L153.76 207.747C157.159 205.708 156.02 200.679 152.376 200.065L151.628 200H4.16667C1.86548 200 6.71103e-08 198.135 0 195.833V104.167C1.07376e-06 101.865 1.86548 100 4.16667 100H162.5C164.801 100 166.667 98.1345 166.667 95.8333V4.16667C166.667 1.86548 168.532 1.00666e-07 170.833 0H358.333ZM170.833 100C168.532 100 166.667 101.865 166.667 104.167V295.833C166.667 298.135 168.532 300 170.833 300H262.5C264.801 300 266.667 298.135 266.667 295.833V104.167C266.667 101.865 264.801 100 262.5 100H170.833Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default function FlipCardDemo() {
  const [flippedCards, setFlippedCards] = React.useState<
    Record<string, boolean>
  >({})

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-background p-6 text-foreground">
      <div className="flex w-full max-w-5xl flex-col items-center gap-8">
        <div className="flex flex-wrap items-center justify-center gap-4">
          {cards.map((card) => (
            <FlipCard
              key={card.cardNumber}
              cardNumber={card.cardNumber}
              backTitle={card.backTitle}
              backContent={card.backContent}
              backImage={card.backImage}
              logo={
                <div className="h-10 w-10">
                  <TwentyFirstLogo />
                </div>
              }
              isFlipped={flippedCards[String(card.cardNumber)] ?? false}
              onFlipChange={(cardNumber, isFlipped) => {
                setFlippedCards((current) => ({
                  ...current,
                  [String(cardNumber)]: isFlipped,
                }))
              }}
            />
          ))}
        </div>
      </div>
    </main>
  )
}

