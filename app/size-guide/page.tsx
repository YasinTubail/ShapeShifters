import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'

export const metadata = {
  title: 'Size Guide | SHAPESHIFTERS',
  description: 'Find your perfect fit with our comprehensive size guide.',
}

export default function SizeGuidePage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-2">
              Find Your Fit
            </p>
            <h1 className="text-4xl font-bold tracking-tight">Size Guide</h1>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* How to Measure */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">How to Measure</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                {[
                  {
                    title: 'Chest',
                    desc: 'Measure around the fullest part of your chest, keeping the tape horizontal.',
                  },
                  {
                    title: 'Waist',
                    desc: 'Measure around your natural waistline, keeping the tape comfortably loose.',
                  },
                  {
                    title: 'Hips',
                    desc: 'Measure around the fullest part of your hips, about 8 inches below the waist.',
                  },
                ].map((item) => (
                  <div key={item.title} className="bg-secondary p-6">
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Tops Size Chart */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Tops (Tees, Hoodies, Crewnecks)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="px-4 py-3 text-left font-bold">Size</th>
                      <th className="px-4 py-3 text-left font-bold">Chest (in)</th>
                      <th className="px-4 py-3 text-left font-bold">Length (in)</th>
                      <th className="px-4 py-3 text-left font-bold">Sleeve (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { size: 'XS', chest: '34-36', length: '27', sleeve: '32' },
                      { size: 'S', chest: '36-38', length: '28', sleeve: '33' },
                      { size: 'M', chest: '38-40', length: '29', sleeve: '34' },
                      { size: 'L', chest: '40-42', length: '30', sleeve: '35' },
                      { size: 'XL', chest: '42-44', length: '31', sleeve: '36' },
                      { size: 'XXL', chest: '44-46', length: '32', sleeve: '37' },
                    ].map((row, i) => (
                      <tr key={row.size} className={i % 2 === 0 ? 'bg-secondary' : ''}>
                        <td className="px-4 py-3 font-medium">{row.size}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.chest}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.length}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.sleeve}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Bottoms Size Chart */}
            <div className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Bottoms (Pants, Joggers, Shorts)</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-primary text-primary-foreground">
                      <th className="px-4 py-3 text-left font-bold">Size</th>
                      <th className="px-4 py-3 text-left font-bold">Waist (in)</th>
                      <th className="px-4 py-3 text-left font-bold">Hip (in)</th>
                      <th className="px-4 py-3 text-left font-bold">Inseam (in)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { size: '28', waist: '28-29', hip: '36-37', inseam: '30' },
                      { size: '30', waist: '30-31', hip: '38-39', inseam: '30' },
                      { size: '32', waist: '32-33', hip: '40-41', inseam: '31' },
                      { size: '34', waist: '34-35', hip: '42-43', inseam: '31' },
                      { size: '36', waist: '36-37', hip: '44-45', inseam: '32' },
                    ].map((row, i) => (
                      <tr key={row.size} className={i % 2 === 0 ? 'bg-secondary' : ''}>
                        <td className="px-4 py-3 font-medium">{row.size}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.waist}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.hip}</td>
                        <td className="px-4 py-3 text-muted-foreground">{row.inseam}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fit Guide */}
            <div className="bg-secondary p-8">
              <h2 className="text-xl font-bold mb-4">Fit Notes</h2>
              <ul className="space-y-3 text-sm text-muted-foreground">
                <li><strong className="text-foreground">Hoodies & Crewnecks:</strong> Designed with an oversized, relaxed fit. If you prefer a slimmer look, size down.</li>
                <li><strong className="text-foreground">Tees:</strong> True to size with a slightly relaxed fit through the body.</li>
                <li><strong className="text-foreground">Joggers:</strong> Relaxed through the thigh with a tapered leg. Elastic waist for comfort.</li>
                <li><strong className="text-foreground">Shorts:</strong> 7-inch inseam with an elastic drawstring waist.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
