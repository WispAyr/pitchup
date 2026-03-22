'use client'

import { useVendor } from '@/lib/vendor-context'
import { FollowButton } from '@/components/vendor/FollowButton'

export function VendorHomeClient() {
  const vendor = useVendor()

  const socialLinks = [
    { key: 'facebook', url: vendor.facebook, label: 'Facebook', emoji: '📘' },
    { key: 'instagram', url: vendor.instagram, label: 'Instagram', emoji: '📷' },
    { key: 'tiktok', url: vendor.tiktok, label: 'TikTok', emoji: '🎵' },
    { key: 'website', url: vendor.website, label: 'Website', emoji: '🌐' },
    { key: 'twitter', url: vendor.twitter, label: 'X / Twitter', emoji: '𝕏' },
  ].filter((s) => s.url)

  return (
    <section className="rounded-2xl bg-gray-50 px-5 py-6 text-center">
      <h2 className="text-lg font-extrabold text-gray-900">Stay Updated</h2>
      <p className="mx-auto mt-1 max-w-xs text-sm text-gray-500">
        Get notified when we go live and for menu updates.
      </p>

      <div className="mt-4">
        <FollowButton vendorId={vendor.id} primaryColor={vendor.primaryColor} />
      </div>

      {socialLinks.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {socialLinks.map((s) => (
            <a
              key={s.key}
              href={s.url!}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-10 items-center gap-1.5 rounded-full border border-gray-200 px-4 text-sm font-medium text-gray-600 active:bg-gray-100"
            >
              <span>{s.emoji}</span> {s.label}
            </a>
          ))}
        </div>
      )}
    </section>
  )
}
