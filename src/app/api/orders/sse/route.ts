import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const vendorId = searchParams.get('vendorId')

  if (!vendorId) {
    return new Response(JSON.stringify({ error: 'vendorId is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const encoder = new TextEncoder()
  let lastCheck = new Date()

  const stream = new ReadableStream({
    async start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
      )

      const interval = setInterval(async () => {
        try {
          const orders = await prisma.order.findMany({
            where: {
              vendorId,
              updatedAt: { gt: lastCheck },
            },
            include: {
              customer: { select: { name: true, email: true } },
            },
            orderBy: { updatedAt: 'desc' },
          })

          lastCheck = new Date()

          if (orders.length > 0) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: 'orders', orders })}\n\n`
              )
            )
          }
        } catch (error) {
          console.error('SSE polling error:', error)
        }
      }, 3000)

      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
