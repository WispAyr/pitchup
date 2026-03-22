'use client'

import { useState, useEffect } from 'react'
import { Copy, Check, Share2 } from 'lucide-react'

type Props = {
  voucher: {
    code: string; type: string; value: number | null; description: string
    expiresAt: string | null; giftCardBalance: number | null; isActive: boolean
  }
  vendor: { name: string; slug: string; logo: string | null; primaryColor: string; secondaryColor: string }
  isExpired: boolean; isUsedUp: boolean
}

export default function VoucherPageClient({ voucher, vendor, isExpired, isUsedUp }: Props) {
  const [copied, setCopied] = useState(false)
  const [qrUrl, setQrUrl] = useState('')

  const orderUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/vendor/${vendor.slug}/order?voucher=${voucher.code}`
    : ''

  useEffect(() => {
    if (!orderUrl) return
    fetch(`/api/qrcode/${vendor.slug}?text=${encodeURIComponent(orderUrl)}&size=200`)
      .then(r => r.blob())
      .then(b => setQrUrl(URL.createObjectURL(b)))
      .catch(() => {})
  }, [orderUrl, vendor.slug])

  function copyCode() {
    navigator.clipboard.writeText(voucher.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function share() {
    if (navigator.share) {
      navigator.share({
        title: `${getValueText()} at ${vendor.name}`,
        text: `Use code ${voucher.code} for ${voucher.description}`,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  function getValueText(): string {
    switch (voucher.type) {
      case 'percentage': return `${voucher.value}% OFF`
      case 'fixed': return `£${voucher.value?.toFixed(2)} OFF`
      case 'giftCard': return `£${((voucher.giftCardBalance || 0) / 100).toFixed(2)}`
      case 'freeItem': return 'FREE ITEM'
      case 'buyOneGetOne': return 'BUY 1 GET 1 FREE'
      default: return ''
    }
  }

  const invalid = !voucher.isActive || isExpired || isUsedUp

  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg ${invalid ? 'opacity-60 grayscale' : ''}`}>
      {/* Top — brand + value */}
      <div className="p-8 text-center text-white relative"
        style={{ background: `linear-gradient(135deg, ${vendor.primaryColor}, ${vendor.secondaryColor})` }}>
        {invalid && (
          <div className="absolute top-3 right-3 rounded-full bg-white/20 px-3 py-1 text-xs font-bold backdrop-blur-sm">
            {isExpired ? 'Expired' : isUsedUp ? 'Used Up' : 'Inactive'}
          </div>
        )}
        {vendor.logo ? (
          <img src={vendor.logo} alt={vendor.name} className="h-10 mx-auto mb-3 object-contain" />
        ) : (
          <p className="text-lg font-bold mb-2">{vendor.name}</p>
        )}
        <p className="text-5xl font-black">{getValueText()}</p>
        <p className="text-sm opacity-90 mt-2">{voucher.description}</p>
      </div>

      {/* Bottom — code + QR */}
      <div className="bg-white p-6 text-center">
        {/* Dashed separator */}
        <div className="border-t-2 border-dashed border-gray-200 -mt-6 mb-6 mx-4" />

        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="font-mono text-3xl font-black tracking-widest text-gray-900">{voucher.code}</span>
          <button onClick={copyCode} className="text-gray-400 hover:text-gray-600 p-1">
            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>

        {qrUrl && (
          <img src={qrUrl} alt="QR Code" className="mx-auto mb-4" width={180} height={180} />
        )}

        <p className="text-sm text-gray-500">
          Scan or enter code <strong>{voucher.code}</strong> at checkout
        </p>

        {voucher.expiresAt && (
          <p className="text-xs text-gray-400 mt-2">
            Valid until {new Date(voucher.expiresAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        )}

        {voucher.type === 'giftCard' && voucher.giftCardBalance != null && (
          <p className="text-sm font-bold text-purple-700 mt-3">
            Remaining balance: £{(voucher.giftCardBalance / 100).toFixed(2)}
          </p>
        )}

        <button onClick={share}
          className="mt-4 inline-flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50">
          <Share2 className="h-4 w-4" /> Share
        </button>
      </div>
    </div>
  )
}
