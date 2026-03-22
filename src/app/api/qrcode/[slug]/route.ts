import { NextRequest } from 'next/server'
import QRCode from 'qrcode'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { searchParams } = new URL(request.url)
    const size = parseInt(searchParams.get('size') || '300', 10)

    const customText = searchParams.get('text')
    let url: string
    if (customText) {
      url = customText
    } else {
      const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
      const protocol = rootDomain.includes('localhost') ? 'http' : 'https'
      url = `${protocol}://${params.slug}.${rootDomain}`
    }

    const qrBuffer = await QRCode.toBuffer(url, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    })

    return new Response(new Uint8Array(qrBuffer), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400',
        'Content-Disposition': `inline; filename="${params.slug}-qr.png"`,
      },
    })
  } catch (error) {
    console.error('Error generating QR code:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate QR code' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
