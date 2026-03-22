'use client'

import { useState } from 'react'
import { Send, CheckCircle } from 'lucide-react'

const EVENT_TYPES = [
  { value: '', label: 'Select event type' },
  { value: 'wedding', label: 'Wedding' },
  { value: 'corporate', label: 'Corporate Event' },
  { value: 'festival', label: 'Festival' },
  { value: 'market', label: 'Market' },
  { value: 'private_party', label: 'Private Party' },
  { value: 'other', label: 'Other' },
]

export default function EnquiryForm({ vendorSlug, accentColor }: { vendorSlug: string; accentColor: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', eventDate: '', eventType: '', guestCount: '', location: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const res = await fetch(`/api/vendor/${vendorSlug}/enquiries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSubmitting(false)
    if (res.ok) {
      setSubmitted(true)
    } else {
      setError('Something went wrong. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-green-200 bg-green-50 p-8 text-center">
        <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" />
        <h3 className="text-lg font-bold text-green-800">Enquiry Sent!</h3>
        <p className="mt-1 text-sm text-green-600">We&apos;ll get back to you as soon as possible.</p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm" id="enquiry">
      <h3 className="mb-1 text-lg font-bold text-gray-900">Book Us For Your Event</h3>
      <p className="mb-5 text-sm text-gray-500">Fill in the form and we&apos;ll get back to you</p>
      {error && <p className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</p>}
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
        <input required placeholder="Your name *" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
        <input required type="email" placeholder="Email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
        <input type="tel" placeholder="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
        <input type="date" placeholder="Event date" value={form.eventDate} onChange={e => setForm(f => ({ ...f, eventDate: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
        <select value={form.eventType} onChange={e => setForm(f => ({ ...f, eventType: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none">
          {EVENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <input type="number" placeholder="Approx. guests" value={form.guestCount} onChange={e => setForm(f => ({ ...f, guestCount: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none" />
        <input placeholder="Event location" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none sm:col-span-2" />
        <textarea placeholder="Tell us more about your event..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm focus:border-gray-400 focus:outline-none sm:col-span-2" rows={3} />
        <div className="sm:col-span-2">
          <button type="submit" disabled={submitting} className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold text-white disabled:opacity-50" style={{ backgroundColor: accentColor }}>
            <Send className="h-4 w-4" /> {submitting ? 'Sending...' : 'Send Enquiry'}
          </button>
        </div>
      </form>
    </div>
  )
}
