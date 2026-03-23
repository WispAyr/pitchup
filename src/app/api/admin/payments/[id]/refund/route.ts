import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { issueRefund } from '@/lib/stripe'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payment = await prisma.payment.findUnique({ where: { id: params.id } })
    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 })
    }
    if (!payment.stripePaymentId) {
      return NextResponse.json({ error: 'No Stripe payment to refund' }, { status: 400 })
    }

    const { amount, reason } = await request.json()

    const refund = await issueRefund(
      payment.stripePaymentId,
      amount || undefined
    )

    const refundedAmount = (payment.refundedAmount || 0) + (amount || payment.amount)
    const isFullRefund = refundedAmount >= payment.amount

    await prisma.payment.update({
      where: { id: params.id },
      data: {
        refundedAmount,
        status: isFullRefund ? 'refunded' : 'partially_refunded',
        refundId: refund.id,
        metadata: JSON.stringify({
          ...JSON.parse(payment.metadata || '{}'),
          refundReason: reason,
          refundedAt: new Date().toISOString(),
        }),
      },
    })

    return NextResponse.json({ success: true, refund })
  } catch (error: any) {
    console.error('Refund error:', error)
    return NextResponse.json({ error: error.message || 'Refund failed' }, { status: 500 })
  }
}
