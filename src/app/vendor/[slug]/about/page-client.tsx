'use client'

import { Star } from 'lucide-react'
import { FollowButton } from '@/components/vendor/FollowButton'
import { format } from 'date-fns'

type Review = {
  id: string
  rating: number
  text: string | null
  customerName: string
  createdAt: string
}

type Props = {
  vendorId: string
  vendorSlug: string
  primaryColor: string
  avgRating: number | null
  reviewCount: number
  reviews: Review[]
}

export function AboutPageClient({
  vendorId,
  vendorSlug,
  primaryColor,
  avgRating,
  reviewCount,
  reviews,
}: Props) {
  return (
    <>
      {/* Follow */}
      <section className="mb-8">
        <FollowButton vendorId={vendorId} primaryColor={primaryColor} />
      </section>

      {/* Reviews */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Reviews</h2>

        {avgRating !== null ? (
          <>
            <div className="mb-4 flex items-center gap-3 rounded-xl bg-gray-50 p-4">
              <div className="text-3xl font-bold text-gray-900">
                {avgRating.toFixed(1)}
              </div>
              <div>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= Math.round(avgRating)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  {reviewCount} review{reviewCount === 1 ? '' : 's'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">
                      {r.customerName}
                    </span>
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3.5 w-3.5 ${
                            star <= r.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {r.text && (
                    <p className="mt-2 text-sm text-gray-600">{r.text}</p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    {format(new Date(r.createdAt), 'dd MMM yyyy')}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">No reviews yet. Be the first to leave a review!</p>
        )}
      </section>

      {/* QR Code */}
      <section className="rounded-2xl bg-gray-50 p-6 text-center">
        <h2 className="mb-2 text-lg font-bold text-gray-900">Share Our Page</h2>
        <p className="mb-4 text-sm text-gray-500">Scan to visit our page</p>
        <div className="mx-auto mb-3 h-40 w-40 overflow-hidden rounded-xl bg-white p-2 shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/qrcode/${vendorSlug}`}
            alt="QR Code"
            className="h-full w-full"
          />
        </div>
      </section>
    </>
  )
}
