import { NextResponse } from 'next/server'
import { generateEmailHTML } from '@/lib/email'

// This endpoint is for development only - preview email templates
export async function GET() {
  // Sample order data for preview
  const sampleOrder = {
    orderId: 'SS-ABC123XY',
    customerName: 'Ahmet Yılmaz',
    customerEmail: 'ahmet@example.com',
    items: [
      { name: 'Shift Oversized Hoodie - Size: L', quantity: 1, price: 2890 },
      { name: 'Transform Graphic Tee - Size: M', quantity: 2, price: 2900 },
      { name: 'Shift Cap - Size: One Size', quantity: 1, price: 990 },
    ],
    subtotal: 6780,
    shipping: 0,
    total: 6780,
    currency: 'TRY',
    shippingAddress: {
      line1: 'Bağdat Caddesi No: 123',
      line2: 'Daire: 5',
      city: 'Kadıköy',
      state: 'İstanbul',
      postalCode: '34710',
      country: 'Türkiye',
    },
    orderDate: new Date().toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
  }

  const html = generateEmailHTML(sampleOrder)

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  })
}
