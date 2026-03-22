'use client'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  accentColor?: string
}

export function StatsCard({ title, value, subtitle, accentColor }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p
        className="mt-1 text-2xl font-bold text-gray-900"
        style={accentColor ? { color: accentColor } : undefined}
      >
        {value}
      </p>
      {subtitle && <p className="mt-1 text-xs text-gray-400">{subtitle}</p>}
    </div>
  )
}
