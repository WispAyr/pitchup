'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'

interface VendorSettings {
  id: string
  slug: string
  name: string
  description: string | null
  cuisineType: string | null
  phone: string | null
  email: string
  website: string | null
  facebook: string | null
  instagram: string | null
  tiktok: string | null
  twitter: string | null
  primaryColor: string
  secondaryColor: string
  preOrderingEnabled: boolean
  stripeAccountId: string | null
  stripeOnboarded: boolean
}

export default function SettingsPage() {
  const params = useParams()
  const slug = params.slug as string

  const [vendor, setVendor] = useState<VendorSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Form state
  const [form, setForm] = useState({
    name: '',
    description: '',
    cuisineType: '',
    phone: '',
    email: '',
    website: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    twitter: '',
    primaryColor: '#F59E0B',
    secondaryColor: '#78350F',
    preOrderingEnabled: true,
    templateId: 'classic',
    customDomain: '',
  })
  const [domainStatus, setDomainStatus] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [domainMessage, setDomainMessage] = useState('')
  const [copied, setCopied] = useState(false)

  // Password change
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  const fetchVendor = useCallback(async () => {
    try {
      const res = await fetch(`/api/vendors/${slug}`)
      if (!res.ok) throw new Error('Failed to load vendor')
      const data = await res.json()
      setVendor(data)
      setForm({
        name: data.name || '',
        description: data.description || '',
        cuisineType: data.cuisineType || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        facebook: data.facebook || '',
        instagram: data.instagram || '',
        tiktok: data.tiktok || '',
        twitter: data.twitter || '',
        primaryColor: data.primaryColor || '#F59E0B',
        secondaryColor: data.secondaryColor || '#78350F',
        preOrderingEnabled: data.preOrderingEnabled ?? true,
        templateId: data.templateId || 'classic',
        customDomain: data.customDomain || '',
      })
      setDomainStatus(data.domainStatus || null)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => {
    fetchVendor()
  }, [fetchVendor])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) {
      setError('Name and email are required')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const res = await fetch(`/api/vendors/${slug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description.trim() || null,
          cuisineType: form.cuisineType.trim() || null,
          phone: form.phone.trim() || null,
          email: form.email.trim(),
          website: form.website.trim() || null,
          facebook: form.facebook.trim() || null,
          instagram: form.instagram.trim() || null,
          tiktok: form.tiktok.trim() || null,
          twitter: form.twitter.trim() || null,
          primaryColor: form.primaryColor,
          secondaryColor: form.secondaryColor,
          preOrderingEnabled: form.preOrderingEnabled,
          templateId: form.templateId,
          customDomain: form.customDomain.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save')
      }
      setSuccess('Settings saved successfully!')
      await fetchVendor()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      setPasswordError('All fields are required')
      return
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters')
      return
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    setSaving(true)
    try {
      const res = await fetch(`/api/vendors/${slug}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to change password')
      }
      setPasswordSuccess('Password changed successfully!')
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err: any) {
      setPasswordError(err.message)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-white" />
      </div>
    )
  }

  if (!vendor) return null

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Settings</h1>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">
          {error}
          <button onClick={() => setError('')} className="ml-2 font-bold">X</button>
        </div>
      )}
      {success && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-600">
          {success}
          <button onClick={() => setSuccess('')} className="ml-2 font-bold">X</button>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Profile */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Business Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Cuisine Type</label>
                <input
                  type="text"
                  value={form.cuisineType}
                  onChange={(e) => setForm({ ...form, cuisineType: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                  placeholder="e.g., Mexican, Thai"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Phone</label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Email *</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-400">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                  placeholder="https://"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Branding */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Branding</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Primary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-200 bg-transparent"
                />
                <input
                  type="text"
                  value={form.primaryColor}
                  onChange={(e) => setForm({ ...form, primaryColor: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Secondary Color</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="h-10 w-14 cursor-pointer rounded border border-gray-200 bg-transparent"
                />
                <input
                  type="text"
                  value={form.secondaryColor}
                  onChange={(e) => setForm({ ...form, secondaryColor: e.target.value })}
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Site Template */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Site Template</h2>
          <p className="mb-4 text-sm text-gray-400">Choose how your public page looks to customers.</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'classic', name: 'Classic', desc: 'Clean, warm, food-truck feel' },
              { id: 'bold', name: 'Bold', desc: 'Dark, punchy, high-contrast' },
              { id: 'minimal', name: 'Minimal', desc: 'Light, spacious, modern' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setForm({ ...form, templateId: t.id })}
                className={`rounded-xl border-2 p-4 text-left transition-all ${
                  form.templateId === t.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="text-sm font-bold text-gray-900">{t.name}</div>
                <div className="text-xs text-gray-500 mt-1">{t.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Social Links */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Social Links</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Facebook</label>
              <input
                type="url"
                value={form.facebook}
                onChange={(e) => setForm({ ...form, facebook: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                placeholder="https://facebook.com/..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Instagram</label>
              <input
                type="url"
                value={form.instagram}
                onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                placeholder="https://instagram.com/..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">TikTok</label>
              <input
                type="url"
                value={form.tiktok}
                onChange={(e) => setForm({ ...form, tiktok: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                placeholder="https://tiktok.com/@..."
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Twitter / X</label>
              <input
                type="url"
                value={form.twitter}
                onChange={(e) => setForm({ ...form, twitter: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                placeholder="https://x.com/..."
              />
            </div>
          </div>
        </div>

        {/* Pre-ordering toggle */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Pre-ordering</h2>
              <p className="text-sm text-gray-400">Allow customers to place orders before you arrive</p>
            </div>
            <button
              type="button"
              onClick={() => setForm({ ...form, preOrderingEnabled: !form.preOrderingEnabled })}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                form.preOrderingEnabled ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  form.preOrderingEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Stripe */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="mb-2 text-lg font-bold text-gray-900">Stripe Payments</h2>
          {vendor.stripeOnboarded ? (
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm text-green-600">Stripe connected</span>
            </div>
          ) : (
            <div>
              <p className="mb-3 text-sm text-gray-400">
                Connect your Stripe account to accept payments from customers.
              </p>
              <a
                href={`/api/stripe/connect?vendorId=${vendor.id}`}
                className="inline-block rounded-lg bg-[#635BFF] px-4 py-2 text-sm font-semibold text-gray-900 transition-opacity hover:opacity-90"
              >
                Connect Stripe
              </a>
            </div>
          )}
        </div>

        {/* Custom Domain */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">Custom Domain</h2>
          <p className="mb-3 text-sm text-gray-400">
            Use your own domain name instead of a PitchUp subdomain.
          </p>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-400">Your Domain</label>
              <input
                type="text"
                value={form.customDomain}
                onChange={(e) => setForm({ ...form, customDomain: e.target.value })}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-amber-400 focus:outline-none"
                placeholder="www.yourdomain.co.uk"
              />
            </div>
            {domainStatus && (
              <div className="flex items-center gap-2">
                <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  domainStatus === 'active' ? 'bg-green-50 text-green-600 border border-green-200' :
                  domainStatus === 'verified' ? 'bg-blue-50 text-blue-600 border border-blue-200' :
                  'bg-yellow-50 text-yellow-600 border border-yellow-200'
                }`}>
                  {domainStatus.charAt(0).toUpperCase() + domainStatus.slice(1)}
                </span>
                {domainStatus !== 'active' && (
                  <button
                    type="button"
                    disabled={verifying}
                    onClick={async () => {
                      setVerifying(true)
                      setDomainMessage('')
                      try {
                        const res = await fetch(`/api/vendor/${slug}/verify-domain`, { method: 'POST' })
                        const data = await res.json()
                        setDomainMessage(data.message || data.error)
                        if (data.status === 'verified') setDomainStatus('verified')
                      } catch { setDomainMessage('Verification failed') }
                      setVerifying(false)
                    }}
                    className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-100"
                  >
                    {verifying ? 'Checking...' : 'Verify DNS'}
                  </button>
                )}
              </div>
            )}
            {domainMessage && (
              <p className="text-xs text-gray-500">{domainMessage}</p>
            )}
            <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
              <p className="text-xs font-medium text-gray-500 mb-1">Setup Instructions:</p>
              <p className="text-xs text-gray-400 mb-2">Add a CNAME record pointing your domain to:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 rounded bg-gray-100 px-2 py-1 text-xs font-mono text-gray-700">
                  pitchup.local-connect.uk
                </code>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('pitchup.local-connect.uk')
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-600 hover:bg-gray-300"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* QR Code */}
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm p-5">
          <h2 className="mb-4 text-lg font-bold text-gray-900">QR Code</h2>
          <div className="flex items-start gap-4">
            <img
              src={`/api/qrcode/${slug}`}
              alt="QR Code"
              className="h-32 w-32 rounded-lg bg-white p-2"
            />
            <div>
              <p className="mb-3 text-sm text-gray-400">
                Customers can scan this to visit your page directly.
              </p>
              <a
                href={`/api/qrcode/${slug}`}
                download={`${slug}-qrcode.png`}
                className="inline-block rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:bg-gray-600"
              >
                Download QR Code
              </a>
            </div>
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-amber-500 py-3 text-sm font-bold text-gray-900 transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      {/* Password change */}
      <div className="mt-6 rounded-xl bg-white border border-gray-100 shadow-sm p-5">
        <h2 className="mb-4 text-lg font-bold text-gray-900">Change Password</h2>
        {passwordError && (
          <div className="mb-3 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600">{passwordError}</div>
        )}
        {passwordSuccess && (
          <div className="mb-3 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-600">{passwordSuccess}</div>
        )}
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Current Password</label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">New Password</label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
              required
              minLength={8}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Confirm New Password</label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-900 focus:border-amber-400 focus:outline-none"
              required
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gray-700 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:bg-gray-600 disabled:opacity-50"
          >
            {saving ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>
    </div>
  )
}
