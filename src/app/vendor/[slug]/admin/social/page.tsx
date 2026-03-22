'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Copy, Check, Instagram, Facebook, Twitter, Sparkles, RefreshCw } from 'lucide-react'

type VendorData = {
  name: string
  cuisineType: string | null
  slug: string
}

type ScheduleInfo = {
  day: string
  startTime: string
  endTime: string
  locationName: string
}

type MenuItem = {
  name: string
  price: number
}

type Template = {
  id: string
  label: string
  platform: 'instagram' | 'facebook' | 'twitter' | 'all'
  generate: (v: VendorData, schedule?: ScheduleInfo, items?: MenuItem[]) => string
}

const EMOJIS = ['🔥', '😍', '🤤', '👀', '💯', '🎉', '⭐', '🙌']
const randomEmoji = () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]

const TEMPLATES: Template[] = [
  {
    id: 'going-live',
    label: 'Going Live',
    platform: 'all',
    generate: (v, s) =>
      s
        ? `We're at ${s.locationName} today ${s.startTime}-${s.endTime}! ${randomEmoji()}\n\nCome grab some amazing ${v.cuisineType || 'food'}! Pre-order on our PitchUp page to skip the queue 👉\n\n#${v.name.replace(/[^a-zA-Z]/g, '')} #StreetFood #${v.cuisineType?.replace(/[^a-zA-Z]/g, '') || 'FoodVan'}`
        : `We're live and serving NOW! ${randomEmoji()}\n\nFind us on PitchUp to see where we are and pre-order!\n\n#${v.name.replace(/[^a-zA-Z]/g, '')} #StreetFood`,
  },
  {
    id: 'schedule-update',
    label: 'Schedule Update',
    platform: 'all',
    generate: (v, s) =>
      s
        ? `📅 ${s.day} - Catch us at ${s.locationName}\n⏰ ${s.startTime} - ${s.endTime}\n\nPre-order on PitchUp to guarantee your food! ${randomEmoji()}\n\n#${v.name.replace(/[^a-zA-Z]/g, '')} #StreetFood`
        : `📅 Check out our updated schedule on PitchUp! New locations and times added this week.\n\n#${v.name.replace(/[^a-zA-Z]/g, '')} #StreetFood`,
  },
  {
    id: 'menu-highlight',
    label: 'Menu Highlight',
    platform: 'instagram',
    generate: (v, _s, items) => {
      const item = items?.[0]
      return item
        ? `Have you tried our ${item.name} yet? ${randomEmoji()}\n\nOnly £${(item.price / 100).toFixed(2)} — grab one next time you see us!\n\nPre-order on PitchUp to skip the queue 👉\n\n#${v.name.replace(/[^a-zA-Z]/g, '')} #FoodPorn #StreetFood`
        : `Our menu is looking 🔥 right now!\n\nCheck it out on our PitchUp page and pre-order ahead!\n\n#${v.name.replace(/[^a-zA-Z]/g, '')} #StreetFood`
    },
  },
  {
    id: 'special-offer',
    label: 'Special Offer',
    platform: 'all',
    generate: (v) =>
      `🎉 SPECIAL OFFER 🎉\n\n[Your offer here]\n\nAvailable today only! Find us on PitchUp to pre-order.\n\n#${v.name.replace(/[^a-zA-Z]/g, '')} #Deal #StreetFood`,
  },
  {
    id: 'twitter-short',
    label: 'Quick Tweet',
    platform: 'twitter',
    generate: (v, s) =>
      s
        ? `📍 ${s.locationName} today ${s.startTime}-${s.endTime}! Come say hi ${randomEmoji()} Pre-order → pitchup.local-connect.uk/vendor/${v.slug}`
        : `We're out and about today! ${randomEmoji()} Find us on PitchUp → pitchup.local-connect.uk/vendor/${v.slug}`,
  },
  {
    id: 'preorder-promo',
    label: 'Pre-Order Promo',
    platform: 'all',
    generate: (v) =>
      `Skip the queue! ${randomEmoji()}\n\nPre-order from ${v.name} on PitchUp:\n✅ Choose your food\n✅ Get a pickup code\n✅ Pay when you collect\n\nNo waiting, no fuss! 🙌\n\n#${v.name.replace(/[^a-zA-Z]/g, '')} #PreOrder #StreetFood`,
  },
]

export default function SocialPage({ params }: { params: { slug: string } }) {
  const { data: session } = useSession()
  const [vendor, setVendor] = useState<VendorData | null>(null)
  const [schedules, setSchedules] = useState<ScheduleInfo[]>([])
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<string>('going-live')
  const [generatedPost, setGeneratedPost] = useState('')
  const [copied, setCopied] = useState(false)
  const [editablePost, setEditablePost] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/vendors/${params.slug}`)
        if (res.ok) {
          const data = await res.json()
          setVendor({ name: data.name, cuisineType: data.cuisineType, slug: data.slug })

          // Extract schedule info
          if (data.schedules) {
            const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            const scheds = data.schedules.map((s: any) => ({
              day: days[s.dayOfWeek],
              startTime: s.startTime,
              endTime: s.endTime,
              locationName: s.location?.name || 'TBC',
            }))
            setSchedules(scheds)
          }

          // Extract menu items
          if (data.menuCategories) {
            const items: MenuItem[] = []
            data.menuCategories.forEach((cat: any) => {
              cat.items?.forEach((item: any) => {
                items.push({ name: item.name, price: item.price })
              })
            })
            setMenuItems(items)
          }
        }
      } catch (e) {
        console.error('Failed to load vendor:', e)
      }
    }
    load()
  }, [params.slug])

  const generatePost = () => {
    if (!vendor) return
    const template = TEMPLATES.find((t) => t.id === selectedTemplate)
    if (!template) return

    const nextSchedule = schedules[0]
    const post = template.generate(vendor, nextSchedule, menuItems)
    setGeneratedPost(post)
    setEditablePost(post)
  }

  useEffect(() => {
    if (vendor) generatePost()
  }, [selectedTemplate, vendor]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = () => {
    navigator.clipboard.writeText(editablePost)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const platformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="h-3.5 w-3.5" />
      case 'facebook': return <Facebook className="h-3.5 w-3.5" />
      case 'twitter': return <Twitter className="h-3.5 w-3.5" />
      default: return <Sparkles className="h-3.5 w-3.5" />
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Social Posts</h1>
      <p className="text-sm text-gray-500 mt-1">
        Generate ready-to-post content for your social media channels.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {/* Template selector */}
        <div>
          <h2 className="text-sm font-bold text-gray-700 mb-3">Choose a Template</h2>
          <div className="space-y-2">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTemplate(t.id)}
                className={`w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                  selectedTemplate === t.id
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-gray-100 bg-white hover:border-gray-200'
                }`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                  selectedTemplate === t.id ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-500'
                }`}>
                  {platformIcon(t.platform)}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{t.label}</p>
                  <p className="text-xs text-gray-500 capitalize">{t.platform === 'all' ? 'All platforms' : t.platform}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Generated post */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-gray-700">Generated Post</h2>
            <button
              onClick={generatePost}
              className="flex items-center gap-1.5 text-xs font-medium text-amber-600 hover:text-amber-700"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Regenerate
            </button>
          </div>

          <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
            <textarea
              value={editablePost}
              onChange={(e) => setEditablePost(e.target.value)}
              rows={10}
              className="w-full rounded-t-xl border-0 p-4 text-sm text-gray-900 focus:outline-none focus:ring-0 resize-none"
              placeholder="Your post will appear here..."
            />
            <div className="flex items-center justify-between border-t border-gray-100 px-4 py-3">
              <span className="text-xs text-gray-400">
                {editablePost.length} characters
                {editablePost.length > 280 && (
                  <span className="text-red-500 ml-1">(too long for Twitter)</span>
                )}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2 text-xs font-semibold text-white hover:bg-gray-800"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5" /> Copied!
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" /> Copy to Clipboard
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick tips */}
          <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-4">
            <h3 className="text-xs font-bold text-amber-800 mb-2">💡 Tips</h3>
            <ul className="text-xs text-amber-700 space-y-1">
              <li>• Edit the post above before copying — make it yours!</li>
              <li>• Add a photo of your food for 3x more engagement</li>
              <li>• Post 30 mins before you go live for best results</li>
              <li>• Use location tags on Instagram and Facebook</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
