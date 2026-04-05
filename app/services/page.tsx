'use client'

import { useEffect, useState } from 'react'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { FileText, Building2, Users, Receipt, Shield, Award, CheckCircle2, Briefcase, Lock, FileCheck, Landmark, Globe, Calculator, Printer, Monitor, type LucideIcon } from 'lucide-react'

interface Package {
  name: string
  price: number
  deliverables: string[]
  delivery: string
}

interface Phase {
  name: string
  cost: string
  detail: string
}

interface ServiceItem {
  icon: string
  title: string
  description: string
  packages?: Package[]
  phases?: Phase[]
  info?: string[]
  types?: string[]
  cost?: string
  delivery?: string
}

interface ServiceCategory {
  id: string
  label: string
  icon: string
  services: ServiceItem[]
}

// Icon mapping
const iconMap: Record<string, LucideIcon> = {
  Building2,
  FileText,
  Briefcase,
  Users,
  Award,
  Lock,
  Shield,
  FileCheck,
  Landmark,
  Receipt,
  Globe,
  Calculator,
  Monitor,
  Printer,
}

export default function ServicesPage() {
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)

  const WHATSAPP_NUMBER = '2348092697385'

  const getWhatsAppLink = (serviceTitle: string) => {
    const message = `Hello CLEOHN, I am interested in your "${serviceTitle}" service. I'd like to get more information.`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }

  // Fetch services from API
  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('/api/services-frontend')
        const data = await response.json()
        setCategories(data.services || [])
      } catch (error) {
        console.error('Error fetching services:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchServices()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading services...</p>
        </div>
      </div>
    )
  }


  return (
    <div className="min-h-screen">
      <Nav />

      <section className="container mx-auto px-3 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="text-center mb-8 space-y-2 max-w-2xl mx-auto">
          <h1 className="text-2xl lg:text-4xl font-bold italic">Our Services</h1>
          <p className="text-base lg:text-lg text-muted-foreground leading-relaxed text-pretty">
            Categorized solutions for your business growth and legal safety.
          </p>
        </div>

        <Tabs defaultValue={categories[0]?.id || "formation"} className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl mb-8">
            {categories.map((category: ServiceCategory) => {
              const CategoryIcon = iconMap[category.icon] || Building2
              return (
                <TabsTrigger
                  key={category.id}
                  value={category.id}
                  className="rounded-lg py-2.5 text-sm sm:text-base flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
                >
                  <CategoryIcon className="h-4 w-4" />
                  <span className="truncate">{category.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

        {categories.map((category: ServiceCategory) => (
          <TabsContent key={category.id} value={category.id} className="space-y-8">
            {category.services.map((service: ServiceItem, index: number) => {
              const Icon = iconMap[service.icon] || FileText
              return (
                <Card key={index} className="rounded-2xl border-2 hover:shadow-lg transition-all duration-300">
                  <CardContent className="p-4 sm:p-6 lg:p-10">
                    <div className="grid lg:grid-cols-[auto_1fr] gap-6 lg:gap-8">
                      <div className="flex justify-center lg:justify-start">
                        <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-2xl bg-accent/10 flex items-center justify-center shrink-0">
                          <Icon className="h-7 w-7 lg:h-8 text-accent" />
                        </div>
                      </div>
                        <div className="space-y-6">
                          <div className="space-y-2 text-center lg:text-left">
                            <h2 className="text-xl sm:text-2xl font-bold text-balance">{service.title}</h2>
                            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto lg:mx-0">
                              {service.description}
                            </p>
                          </div>

                          {service.packages && (
                            <div className="grid md:grid-cols-2 gap-4">
                              {service.packages.map((pkg: Package, i: number) => (
                                <div key={i} className="bg-muted/30 p-4 sm:p-6 rounded-2xl border shadow-sm space-y-3">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-4">
                                    <h4 className="text-base sm:text-lg font-bold text-accent leading-tight">{pkg.name}</h4>
                                    <span className="text-lg sm:text-xl font-bold">₦{pkg.price.toLocaleString()}</span>
                                  </div>                                        
                                  <p className="text-[10px] sm:text-xs text-muted-foreground font-medium italic">Delivery: {pkg.delivery}</p>
                                  <ul className="space-y-1.5">
                                    {pkg.deliverables.slice(0, 5).map((d: string, j: number) => (
                                      <li key={j} className="flex items-start gap-2 text-xs">
                                        <CheckCircle2 className="h-3.5 w-3.5 text-accent mt-0.5 shrink-0" />
                                        <span>{d}</span>
                                      </li>
                                    ))}
                                    {pkg.deliverables.length > 5 && (
                                      <li className="text-xs text-accent font-medium mt-1">
                                        + {pkg.deliverables.length - 5} more deliverables...
                                      </li>
                                    )}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          )}

                          {service.phases && (
                            <div className="space-y-3">
                              <h3 className="text-lg font-bold">Registration Phases:</h3>
                              <div className="grid md:grid-cols-3 gap-3 text-center">
                                {service.phases.map((phase: Phase, i: number) => (
                                  <div key={i} className="bg-muted/30 p-4 rounded-xl border">
                                    <h4 className="font-bold text-accent text-sm mb-1">{phase.name}</h4>
                                    <div className="text-lg font-bold mb-1">{phase.cost}</div>
                                    <p className="text-[10px] text-muted-foreground leading-tight">{phase.detail}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {service.info && (
                            <div className="space-y-3">
                              <h3 className="text-lg font-bold">Why it matters:</h3>
                              <ul className="grid md:grid-cols-2 gap-2">
                                {service.info.map((item: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2.5 text-muted-foreground text-sm">
                                    <CheckCircle2 className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {service.types && (
                            <div className="space-y-3">
                              <h3 className="text-lg font-bold">Common Changes:</h3>
                              <ul className="grid md:grid-cols-2 gap-2">
                                {service.types.map((type: string, i: number) => (
                                  <li key={i} className="flex items-start gap-2.5 text-muted-foreground text-sm">
                                    <div className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                                    <span>{type}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {(service.cost || service.delivery) && !service.packages && (
                            <div className="flex flex-wrap gap-6 pt-3 border-t border-border">
                              {service.cost && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Cost</p>
                                  <p className="text-xl font-bold text-accent">{service.cost}</p>
                                </div>
                              )}
                              {service.delivery && (
                                <div>
                                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-0.5">Processing Time</p>
                                  <p className="text-xl font-bold text-accent">{service.delivery}</p>
                                </div>
                              )}
                            </div>
                          )}

                          <div className="pt-2 flex flex-col sm:flex-row gap-3">
                            {(service.packages || service.phases || service.cost) && (
                              <Link href="/pricing" className="w-full sm:w-auto">
                                <Button className="w-full rounded-full px-6 h-10 bg-accent hover:bg-accent/90 text-sm">
                                  View Pricing
                                </Button>
                              </Link>
                            )}
                            <a 
                              href={getWhatsAppLink(service.title)} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto"
                            >
                              <Button variant="outline" className="w-full rounded-full px-6 h-10 text-sm">
                                Book Now
                              </Button>
                            </a>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </TabsContent>
          ))}
        </Tabs>

        <div className="mt-16 text-center">
          <Card className="rounded-3xl border-2 bg-linear-to-br from-primary/5 via-accent/5 to-primary/5 max-w-3xl mx-auto overflow-hidden">
            <CardContent className="p-10 lg:p-12 space-y-6">
              <h2 className="text-3xl font-bold text-balance">Ready to secure your business?</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Join 5,000+ businesses who trust CLEOHN for their compliance needs. Our experts are ready to handle the heavy lifting for you.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/pricing">
                  <Button size="lg" className="rounded-full px-10 py-6 text-base bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
                    Get Started Now
                  </Button>
                </Link>
                <a 
                  href={getWhatsAppLink('General Inquiry')} 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button size="lg" variant="outline" className="rounded-full px-10 py-6 text-base">
                    Speak to an Expert
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  )
}
