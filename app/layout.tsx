import type { Metadata } from 'next'
import { Orbitron, Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/lib/cart-context'
import './globals.css'

// LUCIDITY-style font for brand headings (geometric, futuristic, all-caps)
const orbitron = Orbitron({
  subsets: ["latin"],
  variable: '--font-display',
  weight: ['400', '500', '600', '700', '800', '900']
});

// Clean sans-serif for body text
const inter = Inter({
  subsets: ["latin"],
  variable: '--font-sans',
});

const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://shapeshifters.com'

export const metadata: Metadata = {
  title: 'SHAPESHIFTERS | Transform Your Style',
  description: 'Bold streetwear for those who dare to stand out. Discover the SHAPESHIFTERS collection.',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
  openGraph: {
    title: 'SHAPESHIFTERS',
    description: 'Drop 01 — Egyptian Collection. 400gsm heavyweight hoodies. Worldwide shipping.',
    url: siteUrl,
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${orbitron.variable} ${inter.variable} font-sans antialiased overflow-x-hidden`}>
        <CartProvider>
          {children}
        </CartProvider>
        <Analytics />
      </body>
    </html>
  )
}
