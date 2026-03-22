'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MessageSquare, Mail, Phone, MapPin, Users, Calendar } from 'lucide-react'

type Enquiry = {
  id: string
  name: string
  email: string
  phone: string | null
  eventDate: string | null
  eventType: string | null
  guestCount: number | null
  location: string | null
  message: string | null
  status: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  responded: 'bg-amber-100 text-amber-700',
  booked: 'bg-green-100 text-green-700',
  declined: 'bg-gray-100 text-gray-500',
}

const EVENT_LABELS: Record<string, string> = {
  wedding: '💒 Wedding',
  corporate: '🏢 Corporate',
  festival: '🎪 Festival',
  market: '🛒 Market',
  private_party: '🎉 Private Party',
  other: 'Other',
}

export default function EnquiriesPage() {
  const params = useParams()
  const slug = params.slug as string
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [filter, setFilter] = useState('')
  const [loading, setLoading] = useState(true)

  const fetchEnquiries = async () => {
    const res = await fetch(`/api/vendor/${slug}/enquiries`)
    if (res.ok) setEnquiries(await res.json())
    setLoading(false)
  }

  useEffect(() => { fetchEnquiries() }, [])

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/vendor/${slug}/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchEnquiries()
  }

  const filtered = filter ? enquiries.filter(e => e.status === filter) : enquiries
  const newCount = enquiries.filter(e => e.status === 'new').length

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Enquiries {newCount > 0 && <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-sm text-blue-700">{newCount} new</span>}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Event booking requests from your website</p>
      </div>

      <div className="mb-4 flex gap-2">
        {['', 'new', 'responded', 'booked', 'declined'].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`rounded-full px-3 py-1 text-xs font-medium ${filter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">No enquiries yet</p>
          <p className="mt-1 text-sm text-gray-400">Enquiries from your public page will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => (
            <div key={e.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{e.name}</h3>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[e.status]}`}>{e.status}</span>
                    {e.eventType && <span className="text-xs text-gray-500">{EVENT_LABELS[e.eventType] || e.eventType}</span>}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{e.email}</span>
                    {e.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{e.phone}</span>}
                    {e.eventDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(e.eventDate).toLocaleDateString('en-GB')}</span>}
                    {e.guestCount && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{e.guestCount} guests</span>}
                    {e.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-gray-400">{new Date(e.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
              {e.message && <p className="mb-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{e.message}</p>}
              <div className="flex gap-2">
                {e.status === 'new' && (
                  <button onClick={() => updateStatus(e.id, 'responded')} className="rounded-lg bg-amber-100 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-200">Mark Responded</button>
                )}
                {(e.status === 'new' || e.status === 'responded') && (
                  <>
                    <button onClick={() => updateStatus(e.id, 'booked')} className="rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-200">Book</button>
                    <button onClick={() => updateStatus(e.id, 'declined')} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:bg-gray-200">Decline</button>
                  </>
                )}
                <a href={`mailto:${e.email}`} className="rounded-lg bg-blue-100 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-200">Email</a>
                {e.phone && <a href={`tel:${e.phone}`} className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-200">Call</a>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
