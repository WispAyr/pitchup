'use client'

import { useVendor } from '@/lib/vendor-context'
import { FollowButton } from '@/components/vendor/FollowButton'

export function VendorHomeClient() {
  const vendor = useVendor()

  const socialLinks = [
    { key: 'facebook', url: vendor.facebook, label: 'Facebook' },
    { key: 'instagram', url: vendor.instagram, label: 'Instagram' },
    { key: 'tiktok', url: vendor.tiktok, label: 'TikTok' },
    { key: 'website', url: vendor.website, label: 'Website' },
    { key: 'twitter', url: vendor.twitter, label: 'Twitter / X' },
  ].filter((s) => s.url)

  return (
    <section className="flex flex-col items-center gap-4 rounded-2xl bg-gray-50 px-6 py-8 text-center">
      <h2 className="text-xl font-bold text-gray-900">Stay Updated</h2>
      <p className="max-w-md text-sm text-gray-500">
        Follow us to get notified when we go live and for menu updates.
      </p>

      <FollowButton vendorId={vendor.id} primaryColor={vendor.primaryColor} />

      {socialLinks.length > 0 && (
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          {socialLinks.map((s) => (
            <a
              key={s.key}
              href={s.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-gray-300 hover:text-gray-900"
            >
              {s.label}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
