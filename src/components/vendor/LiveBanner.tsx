'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

type LiveBannerProps = {
  locationName: string
  primaryColor: string
  onOrderNow?: () => void
}

export function LiveBanner({ locationName, primaryColor, onOrderNow }: LiveBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed) return null

  return (
    <div
      className="relative flex items-center justify-between gap-3 px-4 py-3 text-white sm:justify-center"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-green-500" />
        </span>
        <span className="text-sm font-semibold">
          We&apos;re live at {locationName}!
        </span>
      </div>

      <div className="flex items-center gap-2">
        {onOrderNow && (
          <button
            onClick={onOrderNow}
            className="rounded-full bg-white px-4 py-1 text-xs font-bold transition-transform hover:scale-105"
            style={{ color: primaryColor }}
          >
            Order Now
          </button>
        )}
        <button
          onClick={() => setDismissed(true)}
          className="rounded-full p-1 hover:bg-white/20"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
