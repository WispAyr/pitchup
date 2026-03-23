'use client'

import { useEffect, useState } from 'react'
import { Lock, Sparkles, ArrowRight } from 'lucide-react'

type FeatureGateProps = {
  featureSlug: string
  vendorId: string
  children: React.ReactNode
  fallback?: React.ReactNode
}

type FeatureInfo = {
  name: string
  description: string | null
  monthlyPrice: number | null
  isAddon: boolean
}

export default function FeatureGate({ featureSlug, vendorId, children, fallback }: FeatureGateProps) {
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)
  const [featureInfo, setFeatureInfo] = useState<FeatureInfo | null>(null)

  useEffect(() => {
    async function checkAccess() {
      try {
        const res = await fetch(`/api/features/check?vendorId=${vendorId}&feature=${featureSlug}`)
        const data = await res.json()
        setHasAccess(data.hasAccess)
        if (!data.hasAccess && data.feature) {
          setFeatureInfo(data.feature)
        }
      } catch {
        setHasAccess(true) // fail open
      }
    }
    checkAccess()
  }, [vendorId, featureSlug])

  if (hasAccess === null) return null
  if (hasAccess) return <>{children}</>

  if (fallback) return <>{fallback}</>

  return (
    <div className="rounded-xl border border-gray-200 bg-gradient-to-br from-gray-50 to-white p-6 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100">
        <Lock className="h-6 w-6 text-amber-600" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-gray-900">
        {featureInfo?.name || 'Premium Feature'}
      </h3>
      <p className="mb-4 text-sm text-gray-500">
        {featureInfo?.description || 'Upgrade your plan to unlock this feature.'}
      </p>
      {featureInfo?.isAddon && featureInfo?.monthlyPrice ? (
        <div className="mb-4">
          <span className="text-2xl font-bold text-gray-900">
            £{(featureInfo.monthlyPrice / 100).toFixed(2)}
          </span>
          <span className="text-sm text-gray-500">/month</span>
        </div>
      ) : null}
      <div className="flex flex-col gap-2">
        {featureInfo?.isAddon ? (
          <button
            onClick={() => {
              window.location.href = `/api/stripe/addon-checkout?vendorId=${vendorId}&feature=${featureSlug}`
            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            Add Feature
          </button>
        ) : null}
        <a
          href={`/vendor/${vendorId}/admin/billing`}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          View Plans
          <ArrowRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  )
}
