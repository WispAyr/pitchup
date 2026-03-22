'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { MessageSquare, Mail, Phone, MapPin, Users, Calendar, MessageCircle, Newspaper, UtensilsCrossed, StickyNote } from 'lucide-react'

type Enquiry = {
  id: string
  enquiryType: string
  name: string
  email: string
  phone: string | null
  eventDate: string | null
  eventType: string | null
  guestCount: number | null
  location: string | null
  budget: string | null
  dietary: string | null
  outlet: string | null
  deadline: string | null
  message: string | null
  status: string
  staffNotes: string | null
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  responded: 'bg-amber-100 text-amber-700',
  booked: 'bg-green-100 text-green-700',
  declined: 'bg-gray-100 text-gray-500',
}

const TYPE_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  general: { label: 'General', icon: MessageCircle, color: 'bg-gray-100 text-gray-700' },
  event_booking: { label: 'Event Booking', icon: Calendar, color: 'bg-purple-100 text-purple-700' },
  press: { label: 'Press & Media', icon: Newspaper, color: 'bg-pink-100 text-pink-700' },
  catering: { label: 'Catering', icon: UtensilsCrossed, color: 'bg-orange-100 text-orange-700' },
}

const EVENT_LABELS: Record<string, string> = {
  wedding: '💒 Wedding', corporate: '🏢 Corporate', festival: '🎪 Festival',
  market: '🛒 Market', private_party: '🎉 Private Party', charity: '💝 Charity',
  school: '🏫 School/Fundraiser', other: 'Other',
}

export default function EnquiriesPage() {
  const params = useParams()
  const slug = params.slug as string
  const [enquiries, setEnquiries] = useState<Enquiry[]>([])
  const [statusFilter, setStatusFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [notesId, setNotesId] = useState<string | null>(null)
  const [notesText, setNotesText] = useState('')

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

  const saveNotes = async (id: string) => {
    await fetch(`/api/vendor/${slug}/enquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ staffNotes: notesText }),
    })
    setNotesId(null)
    fetchEnquiries()
  }

  let filtered = enquiries
  if (statusFilter) filtered = filtered.filter(e => e.status === statusFilter)
  if (typeFilter) filtered = filtered.filter(e => e.enquiryType === typeFilter)

  const newCount = enquiries.filter(e => e.status === 'new').length
  const typeCounts = enquiries.reduce((acc, e) => {
    acc[e.enquiryType] = (acc[e.enquiryType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Enquiries {newCount > 0 && <span className="ml-2 rounded-full bg-blue-100 px-2.5 py-0.5 text-sm text-blue-700">{newCount} new</span>}
        </h1>
        <p className="mt-1 text-sm text-gray-500">All contact form submissions</p>
      </div>

      {/* Type filter */}
      <div className="mb-3 flex gap-2 flex-wrap">
        <button onClick={() => setTypeFilter('')} className={`rounded-full px-3 py-1 text-xs font-medium ${typeFilter === '' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          All Types ({enquiries.length})
        </button>
        {Object.entries(TYPE_CONFIG).map(([key, cfg]) => (
          <button key={key} onClick={() => setTypeFilter(typeFilter === key ? '' : key)} className={`rounded-full px-3 py-1 text-xs font-medium ${typeFilter === key ? 'bg-gray-900 text-white' : `${cfg.color} hover:opacity-80`}`}>
            {cfg.label} ({typeCounts[key] || 0})
          </button>
        ))}
      </div>

      {/* Status filter */}
      <div className="mb-4 flex gap-2">
        {['', 'new', 'responded', 'booked', 'declined'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`rounded-full px-3 py-1 text-xs font-medium ${statusFilter === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            {s || 'All Status'}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="py-12 text-center text-gray-400">Loading...</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-white p-12 text-center shadow-sm">
          <MessageSquare className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="font-medium text-gray-500">No enquiries yet</p>
          <p className="mt-1 text-sm text-gray-400">Enquiries from your contact page will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(e => {
            const typeConf = TYPE_CONFIG[e.enquiryType] || TYPE_CONFIG.general
            const TypeIcon = typeConf.icon
            return (
              <div key={e.id} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold text-gray-900">{e.name}</h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[e.status]}`}>{e.status}</span>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${typeConf.color}`}>
                        <TypeIcon className="h-3 w-3" />{typeConf.label}
                      </span>
                      {e.eventType && <span className="text-xs text-gray-500">{EVENT_LABELS[e.eventType] || e.eventType}</span>}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Mail className="h-3 w-3" />{e.email}</span>
                      {e.phone && <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{e.phone}</span>}
                      {e.eventDate && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(e.eventDate).toLocaleDateString('en-GB')}</span>}
                      {e.guestCount && <span className="flex items-center gap-1"><Users className="h-3 w-3" />{e.guestCount} guests</span>}
                      {e.location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{e.location}</span>}
                      {e.outlet && <span className="flex items-center gap-1"><Newspaper className="h-3 w-3" />{e.outlet}</span>}
                      {e.budget && <span className="text-xs">💰 {e.budget}</span>}
                      {e.dietary && <span className="text-xs">🥗 {e.dietary}</span>}
                      {e.deadline && <span className="text-xs text-red-500">⏰ Deadline: {new Date(e.deadline).toLocaleDateString('en-GB')}</span>}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-gray-400">{new Date(e.createdAt).toLocaleDateString('en-GB')}</span>
                </div>

                {e.message && <p className="mb-3 text-sm text-gray-600 bg-gray-50 rounded-lg p-3">{e.message}</p>}

                {/* Staff notes */}
                {e.staffNotes && notesId !== e.id && (
                  <div className="mb-3 text-sm bg-yellow-50 border border-yellow-100 rounded-lg p-3 flex items-start gap-2">
                    <StickyNote className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-semibold text-yellow-600 uppercase">Staff Notes</span>
                      <p className="text-gray-600">{e.staffNotes}</p>
                    </div>
                  </div>
                )}

                {notesId === e.id && (
                  <div className="mb-3">
                    <textarea
                      value={notesText}
                      onChange={(ev) => setNotesText(ev.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 focus:outline-none"
                      placeholder="Internal notes..."
                    />
                    <div className="flex gap-2 mt-1">
                      <button onClick={() => saveNotes(e.id)} className="rounded-lg bg-yellow-100 px-3 py-1 text-xs font-semibold text-yellow-700 hover:bg-yellow-200">Save Notes</button>
                      <button onClick={() => setNotesId(null)} className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-500">Cancel</button>
                    </div>
                  </div>
                )}

                <div className="flex gap-2 flex-wrap">
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
                  <button onClick={() => { setNotesId(e.id); setNotesText(e.staffNotes || '') }} className="rounded-lg bg-yellow-50 px-3 py-1.5 text-xs font-semibold text-yellow-600 hover:bg-yellow-100">
                    <StickyNote className="h-3 w-3 inline mr-1" />Notes
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
