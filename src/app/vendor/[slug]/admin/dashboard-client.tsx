'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Radio, CloudSun, Clock, ShoppingBag, PoundSterling, TrendingUp,
  ClipboardList, MessageSquare, AlertTriangle, Wrench, Zap,
  Share2, Ticket, CalendarPlus, Package, Mail, FileWarning, Timer
} from 'lucide-react'
import { formatPrice } from '@/lib/utils'

type DashboardData = {
  vendor: { id: string; name: string; slug: string; primaryColor: string; secondaryColor: string; logo: string | null }
  liveSessions: { id: string; vehicleName: string; vehicleId: string | null; locationName: string; startedAt: string }[]
  vehicles: { id: string; name: string }[]
  metrics: {
    ordersToday: number; ordersWeek: number; ordersMonth: number
    revenueToday: number; revenueWeek: number; revenueMonth: number
    avgOrderValue: number; pendingPreOrders: number
  }
  pendingPreOrders: { id: string; customerName: string; total: number; pickupCode: string | null; timeSlotStart: string | null; status: string }[]
  newEnquiries: { id: string; name: string; eventType: string | null; message: string; createdAt: string }[]
  expiringDocs: { id: string; title: string; category: string; vehicleName: string | null; expiresAt: string | null }[]
  upcomingMaintenance: { id: string; title: string; vehicleName: string; nextDueAt: string | null; type: string }[]
  recentActivity: { type: 'order' | 'enquiry' | 'voucher'; id: string; title: string; subtitle: string; status: string; timestamp: string }[]
  todaySchedules: { id: string; locationName: string; startTime: string; endTime: string }[]
}

function WeatherWidget({ color }: { color: string }) {
  const [weather, setWeather] = useState<any>(null)
  useEffect(() => {
    fetch('https://wttr.in/?format=j1')
      .then(r => r.json())
      .then(d => {
        const cur = d.current_condition?.[0]
        if (cur) setWeather({
          temp: cur.temp_C,
          desc: cur.weatherDesc?.[0]?.value || '',
          feelsLike: cur.FeelsLikeC,
          humidity: cur.humidity,
          icon: getWeatherEmoji(cur.weatherCode),
        })
      })
      .catch(() => {})
  }, [])

  if (!weather) return null

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2">
        <CloudSun className="h-4 w-4 text-gray-400" />
        <span className="text-xs font-medium text-gray-500 uppercase">Weather</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-3xl">{weather.icon}</span>
        <div>
          <p className="text-2xl font-bold" style={{ color }}>{weather.temp}°C</p>
          <p className="text-xs text-gray-500">{weather.desc} · Feels like {weather.feelsLike}°C</p>
        </div>
      </div>
    </div>
  )
}

function getWeatherEmoji(code: string): string {
  const c = parseInt(code)
  if (c === 113) return '☀️'
  if (c === 116) return '⛅'
  if (c === 119 || c === 122) return '☁️'
  if ([176, 263, 266, 293, 296, 299, 302, 305, 308, 353, 356, 359].includes(c)) return '🌧️'
  if ([200, 386, 389, 392, 395].includes(c)) return '⛈️'
  if ([179, 182, 185, 227, 230, 323, 326, 329, 332, 335, 338, 368, 371, 374, 377].includes(c)) return '🌨️'
  if ([143, 248, 260].includes(c)) return '🌫️'
  return '🌤️'
}

function TimeAgo({ date }: { date: string }) {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return <span>just now</span>
  if (mins < 60) return <span>{mins}m ago</span>
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return <span>{hrs}h ago</span>
  const days = Math.floor(hrs / 24)
  return <span>{days}d ago</span>
}

function DaysUntil({ date }: { date: string }) {
  const diff = new Date(date).getTime() - Date.now()
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
  if (days <= 0) return <span className="text-red-600 font-bold">Overdue!</span>
  if (days <= 7) return <span className="text-orange-600 font-bold">{days} days</span>
  return <span className="text-gray-600">{days} days</span>
}

export default function AdminDashboardClient({ data }: { data: DashboardData }) {
  const { vendor, liveSessions, vehicles, metrics, pendingPreOrders, newEnquiries, expiringDocs, upcomingMaintenance, recentActivity, todaySchedules } = data
  const color = vendor.primaryColor
  const basePath = `/vendor/${vendor.slug}/admin`

  // Find next schedule stop
  const now = new Date()
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
  const nextStop = todaySchedules.find(s => s.startTime > currentTime) || todaySchedules[0]

  // Vans not currently live
  const liveVehicleIds = new Set(liveSessions.map(s => s.vehicleId).filter(Boolean))
  const offlineVehicles = vehicles.filter(v => !liveVehicleIds.has(v.id))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900">Welcome back, {vendor.name}</h1>
        <p className="mt-1 text-gray-500">Here&apos;s what&apos;s happening today.</p>
      </div>

      {/* Top Section — Live Status + Schedule + Weather */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Live Sessions Bar */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="h-4 w-4" style={{ color }} />
            <span className="text-xs font-medium text-gray-500 uppercase">Live Status</span>
          </div>

          {liveSessions.length > 0 ? (
            <div className="space-y-2 mb-3">
              {liveSessions.map(s => (
                <div key={s.id} className="flex items-center justify-between rounded-xl bg-green-50 border border-green-200 px-3 py-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
                    </span>
                    <span className="text-sm font-bold text-green-800">🚐 {s.vehicleName}</span>
                    <span className="text-xs text-green-600">at {s.locationName}</span>
                  </div>
                  <Link href={`${basePath}/live/${s.vehicleId || ''}`}
                    className="text-xs font-bold px-3 py-1 rounded-lg text-white" style={{ backgroundColor: color }}>
                    View KDS
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 mb-3">No vans live right now</p>
          )}

          {offlineVehicles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {offlineVehicles.map(v => (
                <Link key={v.id} href={`${basePath}/go-live`}
                  className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 transition-colors">
                  <Radio className="h-3 w-3" /> Go Live — {v.name}
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Weather + Today's Schedule */}
        <div className="space-y-4">
          <WeatherWidget color={color} />

          {todaySchedules.length > 0 && (
            <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase">Today&apos;s Schedule</span>
              </div>
              <div className="space-y-1.5">
                {todaySchedules.map((s, i) => (
                  <div key={s.id} className={`flex items-center justify-between text-sm ${nextStop?.id === s.id && i === todaySchedules.indexOf(nextStop) ? 'font-bold' : ''}`}>
                    <span className="text-gray-700 truncate">{s.locationName}</span>
                    <span className="text-xs text-gray-500 shrink-0 ml-2">{s.startTime}–{s.endTime}</span>
                  </div>
                ))}
              </div>
              {nextStop && nextStop.startTime > currentTime && (
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-xs" style={{ color }}>
                  <Timer className="h-3 w-3" />
                  Next: {nextStop.locationName} at {nextStop.startTime}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Key Metrics Row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard icon={ShoppingBag} label="Orders" today={metrics.ordersToday} week={metrics.ordersWeek} month={metrics.ordersMonth} color={color} />
        <MetricCard icon={PoundSterling} label="Revenue" today={metrics.revenueToday} week={metrics.revenueWeek} month={metrics.revenueMonth} color={color} isMoney />
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">Avg Order</span>
          </div>
          <p className="text-xl font-bold" style={{ color }}>{formatPrice(metrics.avgOrderValue)}</p>
          <p className="text-xs text-gray-400">This month</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <Package className="h-4 w-4 text-gray-400" />
            <span className="text-xs text-gray-500">Pre-Orders</span>
          </div>
          <p className="text-xl font-bold" style={{ color }}>{metrics.pendingPreOrders}</p>
          <p className="text-xs text-gray-400">Pending</p>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Pending Pre-Orders */}
        <ActionCard
          icon={ClipboardList} title="Pending Pre-Orders" color={color}
          count={pendingPreOrders.length} link={`${basePath}/orders`} linkText="View all orders"
        >
          {pendingPreOrders.length === 0 ? (
            <p className="text-sm text-gray-400">No pending pre-orders</p>
          ) : (
            <div className="space-y-2">
              {pendingPreOrders.slice(0, 4).map(o => (
                <div key={o.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    {o.pickupCode && (
                      <span className="rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-mono font-bold text-white">{o.pickupCode}</span>
                    )}
                    <span className="text-gray-700">{o.customerName}</span>
                  </div>
                  <span className="font-bold text-gray-900">{formatPrice(o.total)}</span>
                </div>
              ))}
            </div>
          )}
        </ActionCard>

        {/* New Enquiries */}
        <ActionCard
          icon={MessageSquare} title="New Enquiries" color={color}
          count={newEnquiries.length} link={`${basePath}/enquiries`} linkText="View all"
        >
          {newEnquiries.length === 0 ? (
            <p className="text-sm text-gray-400">No new enquiries</p>
          ) : (
            <div className="space-y-2">
              {newEnquiries.slice(0, 3).map(e => (
                <div key={e.id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{e.name}</span>
                    <span className="text-xs text-gray-400"><TimeAgo date={e.createdAt} /></span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">{e.message || e.eventType || 'No message'}</p>
                </div>
              ))}
            </div>
          )}
        </ActionCard>

        {/* Expiring Documents */}
        <ActionCard
          icon={AlertTriangle} title="Expiring Documents" color={color}
          count={expiringDocs.length} link={`${basePath}/documents`} linkText="Manage docs"
          warn={expiringDocs.length > 0}
        >
          {expiringDocs.length === 0 ? (
            <p className="text-sm text-gray-400">All documents up to date ✓</p>
          ) : (
            <div className="space-y-2">
              {expiringDocs.slice(0, 3).map(d => (
                <div key={d.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-gray-800">{d.title}</span>
                    {d.vehicleName && <span className="text-xs text-gray-400 ml-1">({d.vehicleName})</span>}
                  </div>
                  {d.expiresAt && <DaysUntil date={d.expiresAt} />}
                </div>
              ))}
            </div>
          )}
        </ActionCard>

        {/* Upcoming Maintenance */}
        <ActionCard
          icon={Wrench} title="Upcoming Maintenance" color={color}
          count={upcomingMaintenance.length} link={`${basePath}/maintenance`} linkText="View all"
        >
          {upcomingMaintenance.length === 0 ? (
            <p className="text-sm text-gray-400">No upcoming maintenance</p>
          ) : (
            <div className="space-y-2">
              {upcomingMaintenance.slice(0, 3).map(m => (
                <div key={m.id} className="flex items-center justify-between text-sm">
                  <div>
                    <span className="font-medium text-gray-800">{m.title}</span>
                    <span className="text-xs text-gray-400 ml-1">({m.vehicleName})</span>
                  </div>
                  {m.nextDueAt && <DaysUntil date={m.nextDueAt} />}
                </div>
              ))}
            </div>
          )}
        </ActionCard>
      </div>

      {/* Quick Actions Bar */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-gray-400" />
          <span className="text-xs font-medium text-gray-500 uppercase">Quick Actions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickAction href={`${basePath}/go-live`} icon={Radio} label="Go Live" color={color} primary />
          <QuickAction href={`${basePath}/social`} icon={Share2} label="Post to Social" color={color} />
          <QuickAction href={`${basePath}/vouchers`} icon={Ticket} label="Create Voucher" color={color} />
          <QuickAction href={`${basePath}/events`} icon={CalendarPlus} label="Add Event" color={color} />
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase">Recent Activity</span>
          </div>
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-gray-400 py-4 text-center">No activity yet. Go live to get started!</p>
        ) : (
          <div className="space-y-0">
            {recentActivity.map((item, i) => (
              <div key={`${item.type}-${item.id}`} className={`flex items-center gap-3 py-2.5 ${i !== recentActivity.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-xs shrink-0 ${
                  item.type === 'order' ? 'bg-blue-50 text-blue-600' :
                  item.type === 'enquiry' ? 'bg-purple-50 text-purple-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  {item.type === 'order' ? <ShoppingBag className="h-3.5 w-3.5" /> :
                   item.type === 'enquiry' ? <Mail className="h-3.5 w-3.5" /> :
                   <Ticket className="h-3.5 w-3.5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                  <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    item.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    item.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    item.status === 'preparing' ? 'bg-amber-100 text-amber-700' :
                    item.status === 'ready' ? 'bg-green-100 text-green-700' :
                    item.status === 'collected' ? 'bg-gray-100 text-gray-600' :
                    item.status === 'new' ? 'bg-purple-100 text-purple-700' :
                    item.status === 'redeemed' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>{item.status}</span>
                  <p className="text-[10px] text-gray-400 mt-0.5"><TimeAgo date={item.timestamp} /></p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function MetricCard({ icon: Icon, label, today, week, month, color, isMoney }: {
  icon: any; label: string; today: number; week: number; month: number; color: string; isMoney?: boolean
}) {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today')
  const val = period === 'today' ? today : period === 'week' ? week : month
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-gray-400" />
          <span className="text-xs text-gray-500">{label}</span>
        </div>
      </div>
      <p className="text-xl font-bold" style={{ color }}>{isMoney ? formatPrice(val) : val}</p>
      <div className="flex gap-1 mt-1.5">
        {(['today', 'week', 'month'] as const).map(p => (
          <button key={p} onClick={() => setPeriod(p)}
            className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium transition-colors ${
              period === p ? 'text-white' : 'text-gray-400 hover:text-gray-600'
            }`}
            style={period === p ? { backgroundColor: color } : undefined}
          >{p}</button>
        ))}
      </div>
    </div>
  )
}

function ActionCard({ icon: Icon, title, color, count, link, linkText, warn, children }: {
  icon: any; title: string; color: string; count: number; link: string; linkText: string; warn?: boolean; children: React.ReactNode
}) {
  return (
    <div className={`rounded-2xl border p-4 shadow-sm ${warn ? 'border-orange-200 bg-orange-50/50' : 'border-gray-100 bg-white'}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4" style={{ color: warn ? '#ea580c' : color }} />
          <span className="text-sm font-bold text-gray-900">{title}</span>
          {count > 0 && (
            <span className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white" style={{ backgroundColor: warn ? '#ea580c' : color }}>{count}</span>
          )}
        </div>
        <Link href={link} className="text-xs font-medium hover:underline" style={{ color }}>{linkText} →</Link>
      </div>
      {children}
    </div>
  )
}

function QuickAction({ href, icon: Icon, label, color, primary }: {
  href: string; icon: any; label: string; color: string; primary?: boolean
}) {
  return (
    <Link href={href}
      className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-opacity hover:opacity-90 ${
        primary ? 'text-white' : 'border border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
      style={primary ? { backgroundColor: color } : undefined}
    >
      <Icon className="h-4 w-4" /> {label}
    </Link>
  )
}
