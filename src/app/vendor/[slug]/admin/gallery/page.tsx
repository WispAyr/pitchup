'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Upload, X, Star, GripVertical, Tag } from 'lucide-react'

const ALL_TAGS = ['food', 'van', 'event', 'team', 'location', 'menu', 'award']

interface Media {
  id: string
  url: string
  filename: string
  tags: string[]
  caption: string | null
  sortOrder: number
}

export default function GalleryAdminPage() {
  const params = useParams()
  const slug = params.slug as string
  const [media, setMedia] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editCaption, setEditCaption] = useState('')
  const [editTags, setEditTags] = useState<string[]>([])
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const fetchMedia = useCallback(async () => {
    const res = await fetch(`/api/vendor/${slug}/media`)
    if (res.ok) setMedia(await res.json())
    setLoading(false)
  }, [slug])

  useEffect(() => { fetchMedia() }, [fetchMedia])

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      await fetch(`/api/vendor/${slug}/media`, { method: 'POST', body: fd })
    }
    setUploading(false)
    fetchMedia()
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this photo?')) return
    await fetch(`/api/vendor/${slug}/media/${id}`, { method: 'DELETE' })
    fetchMedia()
  }

  async function handleSetBanner(url: string) {
    const vendorRes = await fetch(`/api/vendors/${slug}`)
    const vendor = await vendorRes.json()
    await fetch(`/api/vendors/${slug}/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ banner: url }),
    })
    alert('Banner updated!')
  }

  async function handleSaveEdit(id: string) {
    await fetch(`/api/vendor/${slug}/media/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: editTags, caption: editCaption || null }),
    })
    setEditingId(null)
    fetchMedia()
  }

  function startEdit(m: Media) {
    setEditingId(m.id)
    setEditCaption(m.caption || '')
    setEditTags([...m.tags])
  }

  if (loading) return <div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-amber-500" /></div>

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Photo Gallery</h1>
        <button onClick={() => fileRef.current?.click()} disabled={uploading} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900 hover:opacity-90 disabled:opacity-50">
          {uploading ? 'Uploading...' : '+ Upload Photos'}
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={(e) => handleUpload(e.target.files)} />
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleUpload(e.dataTransfer.files) }}
        className={`mb-6 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed p-8 transition-colors ${dragOver ? 'border-amber-500 bg-amber-50' : 'border-gray-200 bg-gray-50'}`}
        onClick={() => fileRef.current?.click()}
      >
        <div className="text-center">
          <Upload className="mx-auto mb-2 h-8 w-8 text-gray-400" />
          <p className="text-sm text-gray-500">Drag & drop photos here, or click to browse</p>
        </div>
      </div>

      {/* Grid */}
      {media.length === 0 ? (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-8 text-center">
          <p className="text-gray-500">No photos yet. Upload some to get started!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {media.map((m) => (
            <div key={m.id} className="group relative overflow-hidden rounded-xl bg-white border border-gray-100 shadow-sm">
              <div className="aspect-square">
                <img src={m.url} alt={m.caption || m.filename} className="h-full w-full object-cover" />
              </div>
              {/* Overlay */}
              <div className="absolute inset-0 flex flex-col justify-between bg-black/0 p-2 opacity-0 transition-opacity group-hover:bg-black/40 group-hover:opacity-100">
                <div className="flex justify-end gap-1">
                  <button onClick={() => handleSetBanner(m.url)} className="rounded bg-amber-500 p-1.5 text-xs text-gray-900" title="Set as banner">
                    <Star className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => startEdit(m)} className="rounded bg-white/90 p-1.5 text-xs text-gray-700" title="Edit tags & caption">
                    <Tag className="h-3.5 w-3.5" />
                  </button>
                  <button onClick={() => handleDelete(m.id)} className="rounded bg-red-500 p-1.5 text-xs text-white" title="Delete">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  {m.caption && <p className="text-xs text-white truncate">{m.caption}</p>}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {m.tags.map(t => <span key={t} className="rounded bg-white/20 px-1.5 py-0.5 text-[10px] text-white">{t}</span>)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit modal */}
      {editingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6">
            <h3 className="mb-4 text-lg font-bold text-gray-900">Edit Photo</h3>
            <div className="mb-4">
              <label className="mb-1 block text-sm font-medium text-gray-500">Caption</label>
              <input type="text" value={editCaption} onChange={(e) => setEditCaption(e.target.value)} className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-500 focus:outline-none" />
            </div>
            <div className="mb-4">
              <label className="mb-2 block text-sm font-medium text-gray-500">Tags</label>
              <div className="flex flex-wrap gap-2">
                {ALL_TAGS.map(t => (
                  <button key={t} type="button" onClick={() => setEditTags(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])}
                    className={`rounded-full px-3 py-1 text-xs font-medium ${editTags.includes(t) ? 'bg-amber-500 text-gray-900' : 'bg-gray-100 text-gray-500'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <button onClick={() => setEditingId(null)} className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-600">Cancel</button>
              <button onClick={() => handleSaveEdit(editingId)} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-gray-900">Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
