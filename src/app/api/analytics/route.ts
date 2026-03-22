import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const vendorId = searchParams.get('vendorId')

    if (!vendorId) {
      return NextResponse.json({ error: 'vendorId is required' }, { status: 400 })
    }

    const user = session.user as any
    if (user.role !== 'vendor' || user.id !== vendorId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [allOrders, todayOrders] = await Promise.all([
      prisma.order.findMany({
        where: { vendorId },
        select: {
          id: true,
          total: true,
          status: true,
          items: true,
          customerName: true,
          createdAt: true,
          pickupCode: true,
          paymentMethod: true,
          customer: { select: { name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.order.findMany({
        where: { vendorId, createdAt: { gte: today } },
        select: { total: true, status: true },
      }),
    ])

    // Calculate stats
    const completedStatuses = ['collected']
    const totalOrders = allOrders.length
    const totalRevenue = allOrders
      .filter((o) => completedStatuses.includes(o.status))
      .reduce((sum, o) => sum + o.total, 0)
    const ordersToday = todayOrders.length
    const revenueToday = todayOrders
      .filter((o) => completedStatuses.includes(o.status))
      .reduce((sum, o) => sum + o.total, 0)

    const completedOrders = allOrders.filter((o) => o.status === 'collected').length
    const cancelledOrders = allOrders.filter((o) => o.status === 'cancelled').length
    const noShowOrders = allOrders.filter((o) => o.status === 'no-show').length
    const cashPayments = allOrders.filter((o) => o.paymentMethod === 'cash').length
    const cardPayments = allOrders.filter((o) => o.paymentMethod === 'card').length

    // Popular items
    const itemCounts: Record<string, number> = {}
    for (const order of allOrders) {
      if (order.status === 'cancelled') continue
      const items = order.items as { name: string; quantity: number }[]
      for (const item of items) {
        itemCounts[item.name] = (itemCounts[item.name] || 0) + item.quantity
      }
    }

    const popularItems = Object.entries(itemCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([name, count]) => ({ name, count }))

    // Recent orders (last 20)
    const recentOrders = allOrders.slice(0, 20).map((o) => ({
      id: o.id,
      customerName: o.customerName,
      total: o.total,
      status: o.status,
      createdAt: o.createdAt,
      pickupCode: o.pickupCode,
      paymentMethod: o.paymentMethod,
      customer: o.customer,
    }))

    return NextResponse.json({
      totalOrders,
      totalRevenue,
      ordersToday,
      revenueToday,
      completedOrders,
      cancelledOrders,
      noShowOrders,
      cashPayments,
      cardPayments,
      popularItems,
      recentOrders,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
