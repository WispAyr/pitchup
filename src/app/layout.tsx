import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'PitchUp — Mobile Food, Sorted',
  description: 'Find mobile food vendors near you. Pre-order, skip the queue.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white font-sans">
        {children}
      </body>
    </html>
  )
}
