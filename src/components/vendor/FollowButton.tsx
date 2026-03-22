'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'

type FollowButtonProps = {
  vendorId: string
  initialFollowing?: boolean
  primaryColor: string
}

export function FollowButton({ vendorId, initialFollowing = false, primaryColor }: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const [loading, setLoading] = useState(false)

  const toggle = async () => {
    setLoading(true)
    try {
      const method = following ? 'DELETE' : 'POST'
      const res = await fetch('/api/follows', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vendorId }),
      })

      if (res.ok) {
        setFollowing(!following)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className="inline-flex items-center gap-2 rounded-full border-2 px-5 py-2 text-sm font-semibold transition-all disabled:opacity-50"
      style={
        following
          ? { backgroundColor: primaryColor, borderColor: primaryColor, color: '#fff' }
          : { borderColor: primaryColor, color: primaryColor, backgroundColor: 'transparent' }
      }
    >
      <Heart className={`h-4 w-4 ${following ? 'fill-current' : ''}`} />
      {following ? 'Following' : 'Follow'}
    </button>
  )
}
