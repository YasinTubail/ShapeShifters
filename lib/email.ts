interface OrderItem {
  name: string
  quantity: number
  price: number
}

interface ShippingAddress {
  line1: string
  line2?: string
  city: string
  state?: string
  postalCode: string
  country: string
}

interface OrderDetails {
  orderId: string
  customerName: string
  customerEmail: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  total: number
  currency: string
  shippingAddress: ShippingAddress | null
  orderDate: string
}

// Format price in Turkish Lira
function formatPrice(amount: number, currency: string = 'TRY'): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

// Generate HTML email template
function generateEmailHTML(order: OrderDetails): string {
  const itemsHTML = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 16px; border-bottom: 1px solid #d0f1ea;">
          <p style="margin: 0; font-weight: 600; color: #01301e;">${item.name}</p>
          <p style="margin: 4px 0 0; font-size: 14px; color: #0b6e4f;">Adet: ${item.quantity}</p>
        </td>
        <td style="padding: 16px; border-bottom: 1px solid #d0f1ea; text-align: right; color: #01301e; font-weight: 600;">
          ${formatPrice(item.price, order.currency)}
        </td>
      </tr>
    `
    )
    .join('')

  const shippingAddressHTML = order.shippingAddress
    ? `
      <div style="margin-top: 32px; padding: 24px; background-color: #f8fdfb; border-radius: 8px;">
        <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #01301e;">Teslimat Adresi</h3>
        <p style="margin: 0; color: #0b6e4f; line-height: 1.6;">
          ${order.shippingAddress.line1}<br>
          ${order.shippingAddress.line2 ? `${order.shippingAddress.line2}<br>` : ''}
          ${order.shippingAddress.postalCode} ${order.shippingAddress.city}<br>
          ${order.shippingAddress.state ? `${order.shippingAddress.state}, ` : ''}${order.shippingAddress.country}
        </p>
      </div>
    `
    : ''

  return `
<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sipariş Onayı - SHAPESHIFTERS</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f5f5f5;">
  <table role="presentation" style="width: 100%; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background-color: #01301e; padding: 40px 32px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; letter-spacing: 0.15em; color: #ffffff;">SHAPESHIFTERS</h1>
              <p style="margin: 12px 0 0; font-size: 14px; color: #53c87a;">Shift Your Reality</p>
            </td>
          </tr>
          
          <!-- Order Confirmation Banner -->
          <tr>
            <td style="background-color: #53c87a; padding: 24px 32px; text-align: center;">
              <p style="margin: 0; font-size: 18px; font-weight: 600; color: #01301e;">
                ✓ Siparişiniz Onaylandı
              </p>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 40px 32px;">
              
              <!-- Greeting -->
              <p style="margin: 0 0 24px; font-size: 16px; color: #01301e;">
                Merhaba <strong>${order.customerName}</strong>,
              </p>
              <p style="margin: 0 0 32px; font-size: 16px; color: #0b6e4f; line-height: 1.6;">
                Siparişiniz için teşekkür ederiz! Siparişinizi aldık ve hazırlamaya başladık. Kargoya verildiğinde size bir takip e-postası göndereceğiz.
              </p>
              
              <!-- Order Details Box -->
              <div style="background-color: #d0f1ea; border-radius: 8px; padding: 20px; margin-bottom: 32px;">
                <table role="presentation" style="width: 100%;">
                  <tr>
                    <td>
                      <p style="margin: 0; font-size: 12px; color: #0b6e4f; text-transform: uppercase; letter-spacing: 0.1em;">Sipariş Numarası</p>
                      <p style="margin: 4px 0 0; font-size: 18px; font-weight: 700; color: #01301e;">${order.orderId}</p>
                    </td>
                    <td style="text-align: right;">
                      <p style="margin: 0; font-size: 12px; color: #0b6e4f; text-transform: uppercase; letter-spacing: 0.1em;">Sipariş Tarihi</p>
                      <p style="margin: 4px 0 0; font-size: 16px; color: #01301e;">${order.orderDate}</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <!-- Order Items -->
              <h3 style="margin: 0 0 16px; font-size: 16px; font-weight: 600; color: #01301e;">Sipariş Detayları</h3>
              <table role="presentation" style="width: 100%; border-collapse: collapse;">
                ${itemsHTML}
              </table>
              
              <!-- Order Summary -->
              <table role="presentation" style="width: 100%; margin-top: 24px;">
                <tr>
                  <td style="padding: 8px 0; color: #0b6e4f;">Ara Toplam</td>
                  <td style="padding: 8px 0; text-align: right; color: #01301e;">${formatPrice(order.subtotal, order.currency)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #0b6e4f;">Kargo</td>
                  <td style="padding: 8px 0; text-align: right; color: #53c87a; font-weight: 600;">${order.shipping === 0 ? 'Ücretsiz' : formatPrice(order.shipping, order.currency)}</td>
                </tr>
                <tr>
                  <td style="padding: 16px 0 0; font-size: 18px; font-weight: 700; color: #01301e; border-top: 2px solid #01301e;">Toplam</td>
                  <td style="padding: 16px 0 0; text-align: right; font-size: 18px; font-weight: 700; color: #53c87a; border-top: 2px solid #01301e;">${formatPrice(order.total, order.currency)}</td>
                </tr>
              </table>
              
              ${shippingAddressHTML}
              
              <!-- CTA Button -->
              <div style="margin-top: 40px; text-align: center;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://shapeshifters.com'}" 
                   style="display: inline-block; padding: 16px 40px; background-color: #01301e; color: #ffffff; text-decoration: none; font-weight: 600; border-radius: 0; font-size: 14px; letter-spacing: 0.1em;">
                  MAĞAZAYA GİT
                </a>
              </div>
              
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #01301e; padding: 32px; text-align: center;">
              <p style="margin: 0 0 16px; font-size: 14px; color: #d0f1ea;">
                Sorularınız mı var? Bize ulaşın:
              </p>
              <p style="margin: 0 0 24px;">
                <a href="mailto:info@shapeshifters.com" style="color: #53c87a; text-decoration: none;">info@shapeshifters.com</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #0b6e4f;">
                © ${new Date().getFullYear()} SHAPESHIFTERS. Tüm hakları saklıdır.
              </p>
            </td>
          </tr>
          
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `
}

// Generate plain text version for email clients that don't support HTML
function generateEmailText(order: OrderDetails): string {
  const itemsList = order.items
    .map((item) => `- ${item.name} (x${item.quantity}): ${formatPrice(item.price, order.currency)}`)
    .join('\n')

  return `
SHAPESHIFTERS - Sipariş Onayı

Merhaba ${order.customerName},

Siparişiniz için teşekkür ederiz! Siparişinizi aldık ve hazırlamaya başladık.

SIPARIŞ DETAYLARI
-----------------
Sipariş Numarası: ${order.orderId}
Sipariş Tarihi: ${order.orderDate}

ÜRÜNLER
-------
${itemsList}

ÖZET
----
Ara Toplam: ${formatPrice(order.subtotal, order.currency)}
Kargo: ${order.shipping === 0 ? 'Ücretsiz' : formatPrice(order.shipping, order.currency)}
Toplam: ${formatPrice(order.total, order.currency)}

${
  order.shippingAddress
    ? `
TESLİMAT ADRESİ
---------------
${order.shippingAddress.line1}
${order.shippingAddress.line2 ? order.shippingAddress.line2 + '\n' : ''}${order.shippingAddress.postalCode} ${order.shippingAddress.city}
${order.shippingAddress.state ? order.shippingAddress.state + ', ' : ''}${order.shippingAddress.country}
`
    : ''
}

Sorularınız mı var? Bize ulaşın: info@shapeshifters.com

© ${new Date().getFullYear()} SHAPESHIFTERS. Tüm hakları saklıdır.
  `.trim()
}

// Send order confirmation email using fetch to a generic email API
// In production, replace with your preferred email service (Resend, SendGrid, etc.)
export async function sendOrderConfirmationEmail(order: OrderDetails): Promise<boolean> {
  const htmlContent = generateEmailHTML(order)
  const textContent = generateEmailText(order)

  // Check if we have an email API configured
  const emailApiKey = process.env.RESEND_API_KEY || process.env.SENDGRID_API_KEY

  if (!emailApiKey) {
    // Log the email content for development/testing
    console.log('=== EMAIL RECEIPT (No email service configured) ===')
    console.log('To:', order.customerEmail)
    console.log('Subject: Sipariş Onayı - ' + order.orderId)
    console.log('Order Details:', JSON.stringify(order, null, 2))
    console.log('================================================')
    
    // In development, we'll just log and return success
    return true
  }

  try {
    // If using Resend
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SHAPESHIFTERS <orders@shapeshifters.com>',
          to: order.customerEmail,
          subject: `Sipariş Onayı - ${order.orderId}`,
          html: htmlContent,
          text: textContent,
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('Resend API error:', error)
        return false
      }

      return true
    }

    // If using SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: order.customerEmail }] }],
          from: { email: 'orders@shapeshifters.com', name: 'SHAPESHIFTERS' },
          subject: `Sipariş Onayı - ${order.orderId}`,
          content: [
            { type: 'text/plain', value: textContent },
            { type: 'text/html', value: htmlContent },
          ],
        }),
      })

      if (!response.ok) {
        const error = await response.text()
        console.error('SendGrid API error:', error)
        return false
      }

      return true
    }

    return false
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

// Export the email template generator for preview purposes
export { generateEmailHTML, generateEmailText }
