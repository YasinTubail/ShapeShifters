"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { CartDrawer } from '@/components/cart-drawer'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    category: 'Orders & Shipping',
    questions: [
      {
        q: 'How long does shipping take?',
        a: 'Standard shipping takes 5-7 business days. Express shipping (2-3 days) and next day delivery are also available at checkout.',
      },
      {
        q: 'Do you offer free shipping?',
        a: 'Yes! We offer free standard shipping on all orders over $100 within the United States.',
      },
      {
        q: 'How can I track my order?',
        a: 'Once your order ships, you will receive an email with tracking information. You can also contact our support team with your order number.',
      },
      {
        q: 'Do you ship internationally?',
        a: 'Yes, we currently ship to the United States, Canada, and the United Kingdom. International shipping rates are calculated at checkout.',
      },
    ],
  },
  {
    category: 'Returns & Exchanges',
    questions: [
      {
        q: 'What is your return policy?',
        a: 'We accept returns within 30 days of delivery. Items must be unworn, unwashed, and in original condition with tags attached.',
      },
      {
        q: 'How do I start a return?',
        a: 'Contact our support team at support@shapeshifters.com with your order number. We will send you a prepaid shipping label within 24 hours.',
      },
      {
        q: 'Can I exchange for a different size?',
        a: 'Yes! Contact us to initiate an exchange. We will ship your new size as soon as we receive your return.',
      },
      {
        q: 'How long do refunds take?',
        a: 'Refunds are processed within 5-7 business days after we receive and inspect your return.',
      },
    ],
  },
  {
    category: 'Products & Sizing',
    questions: [
      {
        q: 'How do your clothes fit?',
        a: 'Our hoodies and crewnecks are designed with an oversized, relaxed fit. Tees are true to size. Check our size guide for detailed measurements.',
      },
      {
        q: 'What materials do you use?',
        a: 'We use premium materials including organic cotton, cotton fleece, and cotton twill. Each product page lists specific material composition.',
      },
      {
        q: 'How should I care for my SHAPESHIFTERS items?',
        a: 'Machine wash cold with like colors. Tumble dry low or hang dry. Do not bleach. Iron on low if needed.',
      },
    ],
  },
  {
    category: 'Account & General',
    questions: [
      {
        q: 'Do I need an account to order?',
        a: 'No, you can checkout as a guest. However, creating an account lets you track orders, save addresses, and get early access to drops.',
      },
      {
        q: 'How do I contact customer service?',
        a: 'Email us at support@shapeshifters.com or call 1-800-SHIFTER (Mon-Fri, 9am-6pm EST). We typically respond within 24 hours.',
      },
      {
        q: 'Do you have physical stores?',
        a: 'We are currently online-only, which allows us to offer premium quality at better prices. We occasionally have pop-up events in major cities.',
      },
    ],
  },
]

function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-border">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="font-medium">{question}</span>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <p className="pb-4 text-sm text-muted-foreground leading-relaxed">
          {answer}
        </p>
      )}
    </div>
  )
}

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-primary text-primary-foreground py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <p className="text-accent text-sm font-bold tracking-[0.2em] uppercase mb-2">
              Help Center
            </p>
            <h1 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h1>
          </div>
        </section>

        <section className="py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            {faqs.map((section) => (
              <div key={section.category} className="mb-12">
                <h2 className="text-xl font-bold mb-6 text-accent">{section.category}</h2>
                <div>
                  {section.questions.map((faq) => (
                    <FAQItem key={faq.q} question={faq.q} answer={faq.a} />
                  ))}
                </div>
              </div>
            ))}

            {/* Contact CTA */}
            <div className="bg-secondary p-8 text-center mt-12">
              <h3 className="text-xl font-bold mb-2">Still have questions?</h3>
              <p className="text-muted-foreground mb-6">
                Our team is here to help with anything you need.
              </p>
              <Link
                href="/contact"
                className="inline-block bg-accent text-accent-foreground px-6 py-3 font-bold uppercase tracking-wide hover:bg-accent/90 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
      <CartDrawer />
    </>
  )
}
