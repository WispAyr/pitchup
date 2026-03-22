'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, CheckCircle, MessageCircle, Calendar, Newspaper, UtensilsCrossed } from 'lucide-react'

const FORM_TYPES = [
  { id: 'general', label: 'General', icon: MessageCircle, description: 'Got a question? Drop us a message.' },
  { id: 'event_booking', label: 'Event Booking', icon: Calendar, description: 'Want us at your event? Tell us the details.' },
  { id: 'press', label: 'Press & Media', icon: Newspaper, description: 'Media enquiries and press requests.' },
  { id: 'catering', label: 'Catering Quote', icon: UtensilsCrossed, description: 'Need catering? Let us know what you need.' },
]

export default function ContactPage() {
  const params = useParams()
  const slug = params.slug as string
  const [vendor, setVendor] = useState<any>(null)
  const [activeTab, setActiveTab] = useState('general')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [enabledForms, setEnabledForms] = useState<string[]>([])

  const [form, setForm] = useState({
    name: '', email: '', phone: '', message: '',
    // Event booking
    eventType: '', eventDate: '', guestCount: '', location: '',
    // Press
    outlet: '', deadline: '',
    // Catering
    budget: '', dietary: '',
  })

  useEffect(() => {
    fetch(`/api/vendor/${slug}`)
      .then(r => r.json())
      .then(v => {
        setVendor(v)
        try {
          const forms = JSON.parse(v.contactFormsEnabled || '["general","event_booking","press","catering"]')
          setEnabledForms(forms)
          if (forms.length > 0 && !forms.includes('general')) setActiveTab(forms[0])
        } catch {
          setEnabledForms(['general', 'event_booking', 'press', 'catering'])
        }
      })
      .catch(() => {})
  }, [slug])

  const primaryColor = vendor?.primaryColor || '#F59E0B'
  const visibleTabs = FORM_TYPES.filter(t => enabledForms.includes(t.id))
  const activeForm = FORM_TYPES.find(t => t.id === activeTab)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const body: any = {
        enquiryType: activeTab,
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        message: form.message || null,
      }
      if (activeTab === 'event_booking') {
        body.eventType = form.eventType || null
        body.eventDate = form.eventDate || null
        body.guestCount = form.guestCount ? parseInt(form.guestCount) : null
        body.location = form.location || null
      }
      if (activeTab === 'press') {
        body.outlet = form.outlet || null
        body.deadline = form.deadline || null
      }
      if (activeTab === 'catering') {
        body.eventDate = form.eventDate || null
        body.guestCount = form.guestCount ? parseInt(form.guestCount) : null
        body.location = form.location || null
        body.budget = form.budget || null
        body.dietary = form.dietary || null
      }

      const res = await fetch(`/api/vendor/${slug}/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
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
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Message Sent!</h1>
          <p className="text-gray-500 mb-6">
            Thanks for getting in touch. We&apos;ll get back to you as soon as we can.
          </p>
          <Link
            href={`/vendor/${slug}`}
            className="inline-block rounded-xl px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            style={{ backgroundColor: primaryColor }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/vendor/${slug}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">Get in Touch</h1>
        <p className="text-gray-500 mb-8">
          {vendor?.name ? `Contact ${vendor.name} — choose what you need below.` : 'Choose what you need below.'}
        </p>

        {/* Tabs */}
        {visibleTabs.length > 1 && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4">
            {visibleTabs.map(tab => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); setError('') }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                    isActive
                      ? 'text-white shadow-lg'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-gray-300'
                  }`}
                  style={isActive ? { backgroundColor: primaryColor } : {}}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        )}

        {/* Form description */}
        {activeForm && (
          <p className="text-sm text-gray-500 mb-4">{activeForm.description}</p>
        )}

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          {/* Common fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Name *</label>
              <input
                type="text" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': primaryColor } as any}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={{ '--tw-ring-color': primaryColor } as any}
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Phone</label>
            <input
              type="tel" value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50"
            />
          </div>

          {/* Event Booking fields */}
          {activeTab === 'event_booking' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Event Type</label>
                  <select
                    value={form.eventType}
                    onChange={(e) => setForm({ ...form, eventType: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                  >
                    <option value="">Select...</option>
                    <option value="wedding">Wedding</option>
                    <option value="corporate">Corporate Event</option>
                    <option value="festival">Festival</option>
                    <option value="market">Market / Fair</option>
                    <option value="private_party">Private Party</option>
                    <option value="charity">Charity Event</option>
                    <option value="school">School / Fundraiser</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Event Date</label>
                  <input
                    type="date" value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Guest Count (approx)</label>
                  <input
                    type="number" value={form.guestCount}
                    onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                    placeholder="50"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                    placeholder="Venue or area"
                  />
                </div>
              </div>
            </>
          )}

          {/* Press fields */}
          {activeTab === 'press' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Publication / Outlet</label>
                <input
                  type="text" value={form.outlet}
                  onChange={(e) => setForm({ ...form, outlet: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                  placeholder="e.g. Ayrshire Post"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Response Deadline</label>
                <input
                  type="date" value={form.deadline}
                  onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                />
              </div>
            </div>
          )}

          {/* Catering fields */}
          {activeTab === 'catering' && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Event Date</label>
                  <input
                    type="date" value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Guest Count</label>
                  <input
                    type="number" value={form.guestCount}
                    onChange={(e) => setForm({ ...form, guestCount: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                    placeholder="50"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Location</label>
                  <input
                    type="text" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                    placeholder="Venue or area"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">Budget</label>
                  <input
                    type="text" value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                    placeholder="e.g. £500-£1000"
                  />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Dietary Requirements</label>
                <input
                  type="text" value={form.dietary}
                  onChange={(e) => setForm({ ...form, dietary: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none"
                  placeholder="Allergies, vegetarian options, etc."
                />
              </div>
            </>
          )}

          {/* Message (always shown) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              {activeTab === 'press' ? 'What is your enquiry about?' : 'Message'}
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              rows={4}
              className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50"
              placeholder={
                activeTab === 'general' ? 'How can we help?' :
                activeTab === 'event_booking' ? 'Tell us about your event...' :
                activeTab === 'press' ? 'What would you like to know?' :
                'Any other details about your catering needs...'
              }
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl py-3.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
            style={{ backgroundColor: primaryColor }}
          >
            <Send className="h-4 w-4" />
            {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>

        {/* Contact info */}
        {vendor && (vendor.phone || vendor.email) && (
          <div className="mt-8 text-center text-sm text-gray-500">
            <p className="mb-1">Or reach us directly:</p>
            <div className="flex items-center justify-center gap-4">
              {vendor.phone && <a href={`tel:${vendor.phone}`} className="hover:text-gray-700">{vendor.phone}</a>}
              {vendor.email && <a href={`mailto:${vendor.email}`} className="hover:text-gray-700">{vendor.email}</a>}
            </div>
            <div className="flex items-center justify-center gap-3 mt-3">
              {vendor.facebook && <a href={vendor.facebook} target="_blank" rel="noopener" className="hover:text-gray-700">Facebook</a>}
              {vendor.instagram && <a href={vendor.instagram} target="_blank" rel="noopener" className="hover:text-gray-700">Instagram</a>}
              {vendor.tiktok && <a href={vendor.tiktok} target="_blank" rel="noopener" className="hover:text-gray-700">TikTok</a>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
