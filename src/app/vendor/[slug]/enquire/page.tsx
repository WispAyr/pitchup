'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle } from 'lucide-react'

export default function EnquirePage() {
  const params = useParams()
  const slug = params.slug as string
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    guestCount: '',
    location: '',
    message: '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/vendor/${slug}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          guestCount: form.guestCount ? parseInt(form.guestCount) : null,
          eventDate: form.eventDate || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to submit')
      }
      setSubmitted(true)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enquiry Sent!</h1>
          <p className="text-gray-500 mb-6">
            Thanks for your enquiry. The vendor will get back to you soon.
          </p>
          <Link
            href={`/vendor/${slug}`}
            className="inline-block rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800"
          >
            Back to Vendor Page
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-lg">
        <Link
          href={`/vendor/${slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Make an Enquiry</h1>
        <p className="text-sm text-gray-500 mb-6">
          Interested in booking for an event? Fill in the form below.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div className="col-span-2 sm:col-span-1">
              <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
              <input
                type="tel" value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Event Type</label>
              <select
                value={form.eventType}
                onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
              >
                <option value="">Select...</option>
                <option value="wedding">Wedding</option>
                <option value="corporate">Corporate</option>
                <option value="festival">Festival</option>
                <option value="market">Market</option>
                <option value="private_party">Private Party</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Event Date</label>
              <input
                type="date" value={form.eventDate}
                onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Guest Count</label>
              <input
                type="number" value={form.guestCount}
                onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
                placeholder="Approx."
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
            <input
              type="text" value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
              placeholder="Where is the event?"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Message</label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
              placeholder="Tell us about your event..."
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Send className="h-4 w-4" />
            {loading ? 'Sending...' : 'Send Enquiry'}
          </button>
        </form>
      </div>
    </div>
  )
}
