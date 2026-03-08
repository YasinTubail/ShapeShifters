import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { Truck, Clock, Globe, Package } from 'lucide-react'

export const metadata = {
  title: 'Shipping | SHAPESHIFTERS',
  description: 'Learn about SHAPESHIFTERS shipping options, delivery times, and policies.',
}

export default function ShippingPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-2">
              Delivery Info
            </p>
            <h1 className="text-4xl font-bold tracking-tight">Shipping</h1>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Shipping Options */}
            <div className="grid sm:grid-cols-2 gap-6 mb-16">
              {[
                {
                  icon: Truck,
                  title: 'Standart Kargo',
                  time: '3-5 iş günü',
                  price: '₺49 (₺3.000 üzeri ücretsiz)',
                },
                {
                  icon: Clock,
                  title: 'Hızlı Kargo',
                  time: '1-2 iş günü',
                  price: '₺99',
                },
                {
                  icon: Package,
                  title: 'Aynı Gün Teslimat',
                  time: 'Aynı gün (İstanbul)',
                  price: '₺149',
                },
                {
                  icon: Globe,
                  title: 'Tüm Türkiye',
                  time: '3-5 iş günü',
                  price: '₺49',
                },
              ].map((option) => (
                <div key={option.title} className="bg-secondary p-6">
                  <option.icon className="h-8 w-8 text-accent mb-4" />
                  <h3 className="font-bold mb-1">{option.title}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{option.time}</p>
                  <p className="text-sm font-medium text-accent">{option.price}</p>
                </div>
              ))}
            </div>

            {/* FAQ */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
              
              {[
                {
                  q: 'Nereden gönderim yapıyorsunuz?',
                  a: 'Tüm siparişler İstanbul deposundan gönderilmektedir. Aras Kargo, Yurtiçi Kargo ve MNG Kargo ile çalışıyoruz.',
                },
                {
                  q: 'Siparişimi nasıl takip edebilirim?',
                  a: 'Siparişiniz kargoya verildiğinde size takip numarasını içeren bir e-posta göndereceğiz. Ayrıca hesabınızdan veya müşteri hizmetlerimizle iletişime geçerek siparişinizi takip edebilirsiniz.',
                },
                {
                  q: 'Ücretsiz kargo var mı?',
                  a: 'Evet! ₺3.000 ve üzeri tüm siparişlerde Türkiye geneli ücretsiz standart kargo sunuyoruz.',
                },
                {
                  q: 'Tüm Türkiye\'ye gönderim yapıyor musunuz?',
                  a: 'Evet, 81 ile gönderim yapıyoruz. Teslimat süreleri bulunduğunuz şehre göre değişiklik gösterebilir.',
                },
                {
                  q: 'Kargom kaybolur veya hasar görürse ne olur?',
                  a: 'Kargonuz kaybolmuş veya hasarlı gelmiş görünüyorsa hemen bizimle iletişime geçin. Sorunu çözmek için kargo firmasıyla birlikte çalışacağız ve siparişinizi yeniden göndereceğiz veya tam iade yapacağız.',
                },
              ].map((item, i) => (
                <div key={i} className="border-b border-border pb-6">
                  <h3 className="font-bold mb-2">{item.q}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
