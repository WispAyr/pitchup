'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

const ALL_TAGS = ['food', 'van', 'event', 'team', 'location', 'menu', 'award']

interface Media {
  id: string
  url: string
  filename: string
  tags: string[]
  caption: string | null
}

export default function GalleryClient({ media, vendorName, primaryColor }: { media: Media[]; vendorName: string; primaryColor: string }) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [lightbox, setLightbox] = useState<Media | null>(null)

  const filtered = activeTag ? media.filter(m => m.tags.includes(activeTag)) : media
  const usedTags = ALL_TAGS.filter(t => media.some(m => m.tags.includes(t)))

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">{vendorName} — Gallery</h1>

        {usedTags.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button onClick={() => setActiveTag(null)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${!activeTag ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
              style={!activeTag ? { backgroundColor: primaryColor } : undefined}>
              All
            </button>
            {usedTags.map(t => (
              <button key={t} onClick={() => setActiveTag(t)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium capitalize transition-colors ${activeTag === t ? 'text-white' : 'bg-gray-100 text-gray-600'}`}
                style={activeTag === t ? { backgroundColor: primaryColor } : undefined}>
                {t}
              </button>
            ))}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-12">No photos to show.</p>
        ) : (
          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4">
            {filtered.map(m => (
              <div key={m.id} className="mb-4 break-inside-avoid cursor-pointer overflow-hidden rounded-xl" onClick={() => setLightbox(m)}>
                <img src={m.url} alt={m.caption || m.filename} className="w-full" loading="lazy" />
                {m.caption && <div className="bg-white px-3 py-2 text-sm text-gray-700">{m.caption}</div>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4" onClick={() => setLightbox(null)}>
          <button className="absolute top-4 right-4 text-white" onClick={() => setLightbox(null)}>
            <X className="h-8 w-8" />
          </button>
          <img src={lightbox.url} alt={lightbox.caption || ''} className="max-h-[90vh] max-w-[90vw] rounded-lg object-contain" onClick={e => e.stopPropagation()} />
          {lightbox.caption && <p className="absolute bottom-8 text-center text-white text-lg">{lightbox.caption}</p>}
        </div>
      )}
    </div>
  )
}
