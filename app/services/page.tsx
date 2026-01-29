'use client'

import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { FileText, Building2, Users, Receipt, Shield, Award, CheckCircle2, Briefcase, Lock, FileCheck, Landmark, Globe, Calculator, Printer, Monitor, type LucideIcon } from 'lucide-react'

interface Package {
  name: string
  price: string
  deliverables: string[]
  delivery: string
}

interface Phase {
  name: string
  cost: string
  detail: string
}

interface ServiceItem {
  icon: LucideIcon
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
  icon: LucideIcon
  services: ServiceItem[]
}

export default function ServicesPage() {
  const WHATSAPP_NUMBER = '2348092697385'

  const getWhatsAppLink = (serviceTitle: string) => {
    const message = `Hello CLEOHN, I am interested in your "${serviceTitle}" service. I'd like to get more information.`
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
  }

  const categories: ServiceCategory[] = [
    // ... existing content (I will keep the data structure but use these helpers in the render)
    {
      id: 'formation',
      label: 'Business Formation',
      icon: Building2,
      services: [
        {
          icon: FileText,
          title: 'Business Name Registration',
          description: 'Register your business name quickly and get official recognition for your enterprise.',
          packages: [
            {
              name: 'Standard Package',
              price: '₦45,000',
              deliverables: [
                'Certificate of Registration',
                'Status Report',
                'FIRS TIN',
                'JTB TIN',
                'TIN Validation'
              ],
              delivery: '1 - 5 working days (Soft copies)'
            },
            {
              name: 'VIP Package',
              price: '₦60,000',
              deliverables: [
                'Certificate of Registration',
                'Status Report',
                'FIRS TIN',
                'JTB TIN',
                'TIN Validation',
                'Framed CAC Certificate',
                'LETTERHEAD (5pcs)',
                'ID CARD',
                'FREE OFFER LETTER',
                'FREE STAFF BIO DATA FORM',
                'FREE GUARANTORS FORM',
                'FREE NON COMPETE AGREEMENT',
                'FREE NON DISCLOSURE AGREEMENT',
                'FREE HARDCOPY OF ALL CAC DOCUMENTS',
                'FREE NATIONWIDE DELIVERY'
              ],
              delivery: '3 - 7 working days'
            }
          ]
        },
        {
          icon: Briefcase,
          title: 'Limited Liability Company (LLC)',
          description: 'Incorporate your limited liability company (1 Million Shares) with complete legal compliance.',
          packages: [
            {
              name: 'Standard Package',
              price: '₦100,000',
              deliverables: [
                'Certificate of Incorporation',
                'Status Report',
                'MEMART',
                'FIRS TIN',
                'JTB TIN',
                'TIN Validation',
                'Framed CAC Certificate',
                'LETTER HEAD (5pcs)',
                'FREE OFFER LETTER',
                'FREE STAFF BIO DATA FORM',
                'FREE GUARANTORS FORM',
                'FREE NON COMPETE AGREEMENT',
                'FREE NON DISCLOSURE AGREEMENT',
                'FREE HARDCOPY OF ALL CAC DOCUMENTS',
                'FREE NATIONWIDE DELIVERY'
              ],
              delivery: '10 - 21 working days'
            },
            {
              name: 'VIP Package',
              price: '₦190,000',
              deliverables: [
                'Certificate of Incorporation',
                'Status Report',
                'MEMART',
                'FIRS TIN',
                'JTB TIN',
                'TIN Validation',
                'SCUML OR TRADEMARK',
                'Framed CAC Certificate',
                'LETTER HEAD (5pcs)',
                'ID Card',
                'Iron Seal',
                'Complimentary card (50pcs)',
                'FREE OFFER LETTER',
                'FREE STAFF BIO DATA FORM',
                'FREE GUARANTORS FORM',
                'FREE NON COMPETE AGREEMENT',
                'FREE HARDCOPY OF ALL CAC DOCUMENTS',
                'FREE NATIONWIDE DELIVERY'
              ],
              delivery: '10 - 21 working days'
            }
          ]
        },
        {
          icon: Users,
          title: 'Incorporated Trustee (NGO/CHURCH)',
          description: 'Register your non-profit organization, church, mosque, or association seamlessly.',
          packages: [
            {
              name: 'Standard Package',
              price: '₦150,000',
              deliverables: [
                'Certificate of Incorporation',
                'Status Report',
                'Constitution',
                'FIRS TIN',
                'JTB TIN',
                'TIN Validation',
                'Framed CAC Certificate',
                'LETTER HEAD (5pcs)',
                'FREE HARDCOPY OF ALL CAC DOCUMENTS',
                'FREE NATIONWIDE DELIVERY'
              ],
              delivery: '6 - 9 weeks (Limited to 4 trustees)'
            },
            {
              name: 'VIP Package',
              price: '₦200,000',
              deliverables: [
                'Certificate of Incorporation',
                'Status Report',
                'Constitution',
                'FIRS TIN',
                'JTB TIN',
                'TIN Validation',
                'SCUML Certificate',
                'Framed CAC Certificate',
                'LETTER HEAD (5pcs)',
                'FREE HARDCOPY OF ALL CAC DOCUMENTS',
                'FREE NATIONWIDE DELIVERY'
              ],
              delivery: '6 - 9 weeks (Limited to 4 trustees)'
            }
          ]
        }
      ]
    },
    {
      id: 'protection',
      label: 'Business Protection',
      icon: Lock,
      services: [
        {
          icon: Award,
          title: 'Trademark Registration',
          description: 'A trademark is a legal protection for your brand identity - the name, logo, slogan, symbol that customers use to recognize your business.',
          info: [
            'Protects your brand from being copied or used by others.',
            'Gives you exclusive rights to use that name or logo in your line of business.',
            'Helps customers distinguish your goods or services from competitors.',
            'Adds value and credibility to your business.'
          ],
          phases: [
            { name: 'Phase 1: Search', cost: '₦10,000', detail: 'Search to ascertain if the name will be accepted. (2-5 working days)' },
            { name: 'Phase 2: Acceptance', cost: '₦60,000', detail: 'Approval, acknowledgement and acceptance letters. (2-4 weeks)' },
            { name: 'Phase 3: Certificate', cost: '₦80,000', detail: 'Official Trademark Certificate (1-2 years, optional)' }
          ]
        },
        {
          icon: Shield,
          title: 'Copyright Registration',
          description: 'Legal protection for creative works - books, music, videos, photos, software, and training materials.',
          info: [
            'Exclusive right to copy, distribute, perform, or sell your work.',
            'Allows you to license or monetize your content.',
            'Proof of ownership in legal disputes.',
            'Protects your income and creative effort.'
          ],
          cost: '₦55,000',
          delivery: '12 weeks'
        }
      ]
    },
    {
      id: 'compliance',
      label: 'Business Compliance',
      icon: FileCheck,
      services: [
        {
          icon: Landmark,
          title: 'Post-Incorporation Changes',
          description: 'Ensure your company’s information with CAC remains accurate, compliant, and legally valid as your business grows.',
          types: [
            'Change of Company Name',
            'Change of Registered Office Address',
            'Change in Directors / Shareholders',
            'Increase or Reduction of Share Capital',
            'Change in Company Secretary',
            'Change in Nature of Business',
            'Allotment of Shares'
          ]
        },
        {
          icon: Receipt,
          title: 'SCUML Registration',
          description: 'Mandatory compliance for businesses considered high-risk for money laundering (Real Estate, Hotels, NGOs, etc.).',
          info: [
            'Required for opening/upgrading corporate bank accounts.',
            'Prevents EFCC sanctions and heavy fines.',
            'Builds credibility with banks and investors.',
            'Demonstrates transparency and legal operation.'
          ]
        },
        {
          icon: Globe,
          title: 'Export License (NEPC)',
          description: 'Official authorization that allows a business to legally export goods from Nigeria to other countries.',
          cost: '₦45,000',
          delivery: '7 working days',
          info: [
            'Legal authorization to export agricultural or manufactured goods.',
            'Access to ports and customs clearance.',
            'Ability to repatriate export proceeds legally.',
            'Eligibility for government export incentives.'
          ]
        },
        {
          icon: Calculator,
          title: 'Tax Compliance & Consultancy',
          description: 'Obtaining Tax Clearance Certificates (TCC) and maintaining full compliance with Nigerian tax laws.',
          info: [
            'End-to-end tax support (preparing and filing returns).',
            'Expert advice on effective tax management.',
            'Retainer services for continuous proactive support.',
            'Assistance with FIRS and JTB TIN validation.'
          ]
        }
      ]
    },
    {
      id: 'digital',
      label: 'Creative & Digital',
      icon: Monitor,
      services: [
        {
          icon: Printer,
          title: 'Printing Services',
          description: 'High-quality printing solutions for your business branding and marketing materials.',
          info: [
            'Business cards and letterheads.',
            'Brochures, flyers, and posters.',
            'Customized corporate gift items.',
            'Large format banners and signage.'
          ]
        },
        {
          icon: Monitor,
          title: 'Website Design & Development',
          description: 'Professional website solutions to establish your online presence and grow your business.',
          info: [
            'Responsive and mobile-friendly designs.',
            'E-commerce and business portfolio websites.',
            'SEO optimization and digital marketing integration.',
            'Website maintenance and technical support.'
          ]
        }
      ]
    }
  ]

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

        <Tabs defaultValue="formation" className="max-w-5xl mx-auto">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-4 h-auto p-1 bg-muted/50 rounded-xl mb-8">
            {categories.map((cat: ServiceCategory) => (
              <TabsTrigger 
                key={cat.id} 
                value={cat.id}
                className="rounded-lg py-2.5 text-sm sm:text-base flex items-center justify-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
              >
                <cat.icon className="h-4 w-4" />
                <span className="truncate">{cat.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map((category: ServiceCategory) => (
            <TabsContent key={category.id} value={category.id} className="space-y-8">
              {category.services.map((service: ServiceItem, index: number) => {
                const Icon = service.icon
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
                                    <span className="text-lg sm:text-xl font-bold">{pkg.price}</span>
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
