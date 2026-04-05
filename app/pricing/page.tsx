'use client'

import { useEffect, useState } from 'react'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { CheckCircle2, Star, Loader2 } from 'lucide-react'

interface FeaturedPackage {
  id: string
  title: string
  subtitle: string
  price: number
  description: string
  category: string
  features: string[]
  popular: boolean
  processingTime: string
}

export default function PricingPage() {
  const [packages, setPackages] = useState<FeaturedPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const WHATSAPP_NUMBER = '2348092697385'

  const getWhatsAppLink = (planName: string, price: number) => {
    const message = `Hello CLEOHN, I am interested in the "${planName}" package priced at ₦${price.toLocaleString()}. How do I get started?`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }

  useEffect(() => {
    async function fetchPricing() {
      try {
        const response = await fetch('/api/pricing-featured')
        if (!response.ok) {
          throw new Error('Failed to fetch pricing')
        }
        const data = await response.json()
        setPackages(data.packages || [])
      } catch (error) {
        console.error('Error fetching pricing:', error)
        setError('Failed to load pricing. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    fetchPricing()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-accent mx-auto" />
            <p className="text-muted-foreground">Loading pricing packages...</p>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Nav />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center space-y-4">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Nav />

      <section className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-10 space-y-3 max-w-2xl mx-auto">
          <h1 className="text-2xl lg:text-4xl font-bold italic">Pricing & Packages</h1>
          <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
            Investment options to build and protect your business legacy.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {packages.map((plan) => (
            <Card
              key={plan.id}
              className={`rounded-2xl border-2 hover:shadow-xl transition-all duration-500 relative flex flex-col ${
                plan.popular ? 'border-accent shadow-lg scale-102 z-10' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-accent text-accent-foreground px-4 py-1 rounded-full text-[10px] font-bold shadow-lg gap-1 border-none">
                    <Star className="h-3 w-3 fill-current" />
                    BEST VALUE
                  </Badge>
                </div>
              )}
              <CardHeader className="p-4 sm:p-6 pb-2">
                <div className="space-y-0.5">
                  <p className="text-accent font-bold uppercase tracking-wider text-[10px]">{plan.title}</p>
                  <CardTitle className="text-xl font-bold text-balance">{plan.subtitle}</CardTitle>
                </div>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl sm:text-3xl font-bold text-primary">
                    ₦{plan.price.toLocaleString()}
                  </span>
                </div>
                <p className="mt-1.5 text-[11px] sm:text-xs text-muted-foreground italic leading-tight">
                  {plan.description}
                </p>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-2 space-y-5 grow font-sans">
                <div className="space-y-3">
                  <p className="font-semibold text-[10px] uppercase text-muted-foreground tracking-widest">
                    What's Included
                  </p>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                        <span className="text-muted-foreground text-xs leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <a
                  href={getWhatsAppLink(`${plan.title} - ${plan.subtitle}`, plan.price)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block mt-auto"
                >
                  <Button
                    className={`w-full rounded-full py-5 text-base font-bold group ${
                      plan.popular
                        ? 'bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg shadow-accent/20'
                        : 'bg-primary hover:bg-primary/90'
                    }`}
                  >
                    Get Started
                    <CheckCircle2 className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  </Button>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="rounded-3xl border-2 bg-gradient-to-br from-primary/5 via-accent/5 to-primary/5 max-w-3xl mx-auto overflow-hidden">
            <CardContent className="p-10 lg:p-12 space-y-6">
              <h2 className="text-3xl font-bold text-balance">Ready to secure your business?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join 5,000+ businesses who trust CLEOHN for their compliance needs. Our experts are ready to handle the heavy lifting for you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/services">
                  <Button size="lg" className="rounded-full px-10 py-6 text-base bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
                    View All Services
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="rounded-full px-10 py-6 text-base">
                    Contact Us
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
