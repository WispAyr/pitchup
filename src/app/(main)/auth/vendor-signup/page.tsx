'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const CUISINE_OPTIONS = [
  'Fish & Chips',
  'Burgers',
  'Pizza',
  'Mexican',
  'Indian',
  'Chinese',
  'Thai',
  'BBQ',
  'Vegan',
  'Coffee & Cakes',
  'Ice Cream',
  'Crepes',
  'Kebabs',
  'Seafood',
  'Other',
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export default function VendorSignUpPage() {
  const router = useRouter()
  const [businessName, setBusinessName] = useState('')
  const [slug, setSlug] = useState('')
  const [slugEdited, setSlugEdited] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cuisineType, setCuisineType] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'

  // Auto-generate slug from business name
  useEffect(() => {
    if (!slugEdited) {
      setSlug(slugify(businessName))
    }
  }, [businessName, slugEdited])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (!slug) {
      setError('Please provide a valid slug for your URL.')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/vendors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: businessName,
          slug,
          email,
          password,
          cuisineType: cuisineType || undefined,
          description: description || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to create vendor account.')
        return
      }

      // Sign in after successful registration
      const result = await signIn('vendor-login', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Account created but sign-in failed. Please sign in manually.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl bg-white shadow-xl border border-gray-100 p-8">
      <div className="text-center mb-8">
        <Link href="/" className="inline-flex items-center gap-2 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-500 text-white font-bold text-lg">
            P
          </div>
          <span className="text-xl font-bold text-gray-900">
            Pitch<span className="text-brand-500">Up</span>
          </span>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">List your van</h1>
        <p className="text-sm text-gray-500 mt-1">
          Get your own branded page, take pre-orders, and grow your business
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="rounded-lg bg-red-50 border border-red-100 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <div>
          <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-1.5">
            Business Name
          </label>
          <input
            id="businessName"
            type="text"
            required
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="e.g. Dave's Chippy"
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1.5">
            Your URL
          </label>
          <div className="flex items-center rounded-xl border border-gray-200 overflow-hidden focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-100">
            <input
              id="slug"
              type="text"
              required
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value))
                setSlugEdited(true)
              }}
              className="flex-1 border-0 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none"
              placeholder="your-slug"
            />
            <span className="px-3 text-xs text-gray-400 bg-gray-50 py-3 border-l border-gray-200">
              .{rootDomain}
            </span>
          </div>
          {slug && (
            <p className="mt-1.5 text-xs text-gray-400">
              Your site:{' '}
              <span className="font-medium text-brand-600">
                {slug}.{rootDomain}
              </span>
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
            placeholder="At least 8 characters"
          />
        </div>

        <div>
          <label htmlFor="cuisineType" className="block text-sm font-medium text-gray-700 mb-1.5">
            Cuisine Type
          </label>
          <select
            id="cuisineType"
            value={cuisineType}
            onChange={(e) => setCuisineType(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 bg-white"
          >
            <option value="">Select a cuisine type</option>
            {CUISINE_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1.5">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 placeholder:text-gray-400 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100 resize-none"
            placeholder="Tell customers about your food and story..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-brand-500 py-3 text-sm font-semibold text-white hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating your van...' : 'Get Started Free'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500">
          Already registered?{' '}
          <Link href="/auth/signin" className="font-semibold text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
