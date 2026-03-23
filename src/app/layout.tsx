import type { Metadata, Viewport } from 'next'
import Providers from './providers'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#F59E0B',
}

export const metadata: Metadata = {
  title: 'PitchUp — Never Miss the Van Again',
  description: 'Find mobile food vendors near you. See their menu, pre-order for collection, skip the queue.',
  openGraph: {
    title: 'PitchUp — Never Miss the Van Again',
    description: 'Find mobile food vendors near you. See their menu, pre-order for collection, skip the queue.',
    url: 'https://pitchup.local-connect.uk',
    siteName: 'PitchUp',
    type: 'website',
    locale: 'en_GB',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PitchUp — Never Miss the Van Again',
    description: 'Find mobile food vendors near you. Pre-order, skip the queue.',
  },
  icons: {
    icon: '/favicon.svg',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-white font-sans">
        <Providers>{children}</Providers>
        <script dangerouslySetInnerHTML={{ __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}` }} />
      </body>
    </html>
  )
}
