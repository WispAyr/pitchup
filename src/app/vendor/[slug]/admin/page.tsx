import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import AdminDashboardClient from './dashboard-client'

export default async function AdminDashboardPage({
  params,
}: {
  params: { slug: string }
}) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect(`/auth/signin?callbackUrl=/vendor/${params.slug}/admin`)
  }

  const vendor = await prisma.vendor.findUnique({
    where: { slug: params.slug },
    include: {
      liveSessions: {
        where: { endedAt: null, cancelled: false },
        include: { location: true, vehicle: true },
      },
      vehicles: { where: { status: 'active' } },
    },
  })

  if (!vendor) return null

  const now = new Date()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(today)
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const thirtyDaysFromNow = new Date(now)
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

  const dayOfWeek = now.getDay()

  const [
    ordersToday, ordersWeek, ordersMonth,
    revenueToday, revenueWeek, revenueMonth,
    pendingPreOrders,
    newEnquiries,
    expiringDocs,
    upcomingMaintenance,
    recentOrders,
    recentEnquiries,
    recentRedemptions,
    todaySchedules,
  ] = await Promise.all([
    prisma.order.count({ where: { vendorId: vendor.id, status: { not: 'cancelled' }, createdAt: { gte: today } } }),
    prisma.order.count({ where: { vendorId: vendor.id, status: { not: 'cancelled' }, createdAt: { gte: weekAgo } } }),
    prisma.order.count({ where: { vendorId: vendor.id, status: { not: 'cancelled' }, createdAt: { gte: monthAgo } } }),
    prisma.order.aggregate({ where: { vendorId: vendor.id, status: 'collected', createdAt: { gte: today } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { vendorId: vendor.id, status: 'collected', createdAt: { gte: weekAgo } }, _sum: { total: true } }),
    prisma.order.aggregate({ where: { vendorId: vendor.id, status: 'collected', createdAt: { gte: monthAgo } }, _sum: { total: true } }),
    prisma.order.findMany({
      where: { vendorId: vendor.id, status: { in: ['pending', 'confirmed'] }, timeSlotStart: { not: null } },
      orderBy: { timeSlotStart: 'asc' },
      take: 10,
    }),
    prisma.enquiry.findMany({
      where: { vendorId: vendor.id, status: 'new' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.document.findMany({
      where: { vendorId: vendor.id, expiresAt: { lte: thirtyDaysFromNow, gte: now } },
      include: { vehicle: true },
      orderBy: { expiresAt: 'asc' },
    }),
    prisma.maintenanceLog.findMany({
      where: { vendorId: vendor.id, nextDueAt: { lte: thirtyDaysFromNow } },
      include: { vehicle: true },
      orderBy: { nextDueAt: 'asc' },
      take: 5,
    }),
    prisma.order.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
    prisma.enquiry.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    prisma.voucherRedemption.findMany({
      where: { voucher: { vendorId: vendor.id } },
      include: { voucher: true },
      orderBy: { redeemedAt: 'desc' },
      take: 5,
    }),
    prisma.schedule.findMany({
      where: { vendorId: vendor.id, dayOfWeek },
      include: { location: true },
      orderBy: { startTime: 'asc' },
    }),
  ])

  // Calculate average order value
  const totalCollectedMonth = revenueMonth._sum.total || 0
  const collectedCountMonth = await prisma.order.count({
    where: { vendorId: vendor.id, status: 'collected', createdAt: { gte: monthAgo } },
  })
  const avgOrderValue = collectedCountMonth > 0 ? Math.round(totalCollectedMonth / collectedCountMonth) : 0

  const dashboardData = {
    vendor: {
      id: vendor.id,
      name: vendor.name,
      slug: vendor.slug,
      primaryColor: vendor.primaryColor,
      secondaryColor: vendor.secondaryColor,
      logo: vendor.logo,
    },
    liveSessions: vendor.liveSessions.map((s: any) => ({
      id: s.id,
      vehicleName: s.vehicle?.name || 'Van',
      vehicleId: s.vehicleId,
      locationName: s.location.name,
      startedAt: s.startedAt.toISOString(),
    })),
    vehicles: vendor.vehicles.map((v: any) => ({
      id: v.id,
      name: v.name,
    })),
    metrics: {
      ordersToday,
      ordersWeek,
      ordersMonth,
      revenueToday: revenueToday._sum.total || 0,
      revenueWeek: revenueWeek._sum.total || 0,
      revenueMonth: revenueMonth._sum.total || 0,
      avgOrderValue,
      pendingPreOrders: pendingPreOrders.length,
    },
    pendingPreOrders: pendingPreOrders.map((o) => ({
      id: o.id,
      customerName: o.customerName,
      total: o.total,
      pickupCode: o.pickupCode,
      timeSlotStart: o.timeSlotStart?.toISOString() || null,
      status: o.status,
    })),
    newEnquiries: newEnquiries.map((e) => ({
      id: e.id,
      name: e.name,
      eventType: e.eventType,
      message: e.message?.slice(0, 100) || '',
      createdAt: e.createdAt.toISOString(),
    })),
    expiringDocs: expiringDocs.map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      vehicleName: d.vehicle?.name || null,
      expiresAt: d.expiresAt?.toISOString() || null,
    })),
    upcomingMaintenance: upcomingMaintenance.map((m) => ({
      id: m.id,
      title: m.title,
      vehicleName: m.vehicle.name,
      nextDueAt: m.nextDueAt?.toISOString() || null,
      type: m.type,
    })),
    recentActivity: [
      ...recentOrders.map((o) => ({
        type: 'order' as const,
        id: o.id,
        title: `Order ${o.pickupCode || '#' + o.id.slice(-4)}`,
        subtitle: `${o.customerName} — £${(o.total / 100).toFixed(2)}`,
        status: o.status,
        timestamp: o.createdAt.toISOString(),
      })),
      ...recentEnquiries.map((e) => ({
        type: 'enquiry' as const,
        id: e.id,
        title: `Enquiry from ${e.name}`,
        subtitle: e.eventType || 'General',
        status: e.status,
        timestamp: e.createdAt.toISOString(),
      })),
      ...recentRedemptions.map((r) => ({
        type: 'voucher' as const,
        id: r.id,
        title: `Voucher ${r.voucher.code} redeemed`,
        subtitle: r.voucher.description,
        status: 'redeemed',
        timestamp: r.redeemedAt.toISOString(),
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 15),
    todaySchedules: todaySchedules.map((s) => ({
      id: s.id,
      locationName: s.location.name,
      startTime: s.startTime,
      endTime: s.endTime,
    })),
  }

  return <AdminDashboardClient data={dashboardData} />
}
