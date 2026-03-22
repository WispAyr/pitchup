'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

type LiveSession = {
  vehicleName: string | null
  locationName: string
}

type LiveBannerProps = {
  sessions: LiveSession[]
  primaryColor: string
  // Legacy single-session support
  locationName?: string
}

export function LiveBanner({ sessions, primaryColor, locationName }: LiveBannerProps) {
  const [dismissed, setDismissed] = useState(false)
  if (dismissed) return null

  // Legacy fallback
  const allSessions = sessions.length > 0
    ? sessions
    : locationName
    ? [{ vehicleName: null, locationName }]
    : []

  if (allSessions.length === 0) return null

  return (
    <div
      className="flex items-center justify-between gap-2 px-4 py-2.5 text-white"
      style={{ backgroundColor: primaryColor }}
    >
      <div className="flex flex-1 items-center gap-2 overflow-hidden">
        <span className="relative flex h-2.5 w-2.5 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white/60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
        </span>
        <span className="truncate text-sm font-bold">
          {allSessions.length === 1 ? (
            <>
              {allSessions[0].vehicleName
                ? `🚐 ${allSessions[0].vehicleName} is live at ${allSessions[0].locationName}!`
                : `We're live at ${allSessions[0].locationName}!`}
            </>
          ) : (
            <>{allSessions.length} vans serving right now!</>
          )}
        </span>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-white/20 active:bg-white/30"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}
