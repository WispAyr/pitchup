import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const credits = await prisma.vendorCredit.findMany({
    where: { vendorId: params.id },
    orderBy: { createdAt: 'desc' },
  })

  const balance = credits.reduce((sum, c) => {
    if (!c.appliedToInvoice && (!c.expiresAt || c.expiresAt > new Date())) {
      return sum + c.amount
    }
    return sum
  }, 0)

  return NextResponse.json({ credits, balance })
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { amount, reason, description, expiresAt } = await request.json()

    if (!amount || !reason) {
      return NextResponse.json({ error: 'amount and reason required' }, { status: 400 })
    }

    const credit = await prisma.vendorCredit.create({
      data: {
        vendorId: params.id,
        amount,
        reason,
        description,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy: 'admin',
      },
    })

    return NextResponse.json({ credit })
  } catch (error) {
    console.error('Credit error:', error)
    return NextResponse.json({ error: 'Failed to add credit' }, { status: 500 })
  }
}
