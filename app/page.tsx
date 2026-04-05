import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Building2, FileText, Users, Receipt, Shield, Award, CheckCircle2, Clock, HeadphonesIcon, Printer, Monitor } from 'lucide-react'

export default function Home() {
  return (
    <div className="min-h-screen">
      <Nav />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-28">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="https://res.cloudinary.com/dkxelxdai/image/upload/v1775414076/cleohn/hero-background.jpg" 
            alt="Hero Background" 
            fill
            priority
            quality={75}
            sizes="100vw"
            className="object-cover opacity-100"
          />
          <div className="absolute inset-0 bg-linear-to-b from-background/40 via-background/60 to-background" />
        </div>

        <div className="container relative z-10 mx-auto px-3 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold leading-tight text-balance">
              Register Your Business with{' '}
              <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Confidence
              </span>
            </h1>
            <p className="text-lg lg:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto text-pretty">
              Your Compliance Buddy. We help build the legal structure your business needs while keeping you compliant through the years.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/services">
                <Button size="lg" className="rounded-full px-8 py-6 text-lg bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20">
                  Get Started Today
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="rounded-full px-8 py-6 text-lg">
                  Contact Us
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="container mx-auto px-3 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl lg:text-3xl font-bold text-balance">Why Choose CLEOHN?</h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
            We combine expertise, efficiency, and excellent service to make your registration seamless.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-300 bg-linear-to-b from-card to-muted/10 overflow-hidden">
            <CardContent className="p-5 sm:p-6 space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Trusted Expertise</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Years of experience helping businesses navigate CAC registration with complete accuracy.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-300 bg-linear-to-b from-card to-muted/10 overflow-hidden">
            <CardContent className="p-5 sm:p-6 space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 flex items-center justify-center">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">Fast Processing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We handle your registration quickly and efficiently, so you can start your business sooner.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 hover:shadow-lg transition-all duration-300 bg-linear-to-b from-card to-muted/10 overflow-hidden">
            <CardContent className="p-5 sm:p-6 space-y-3 text-center">
              <div className="w-12 h-12 mx-auto rounded-xl bg-accent/10 flex items-center justify-center">
                <HeadphonesIcon className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">24/7 Support</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our dedicated team is always available to answer your questions and provide guidance.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Services Cards Section */}
      <section className="container mx-auto px-3 sm:px-6 lg:px-8 py-10 lg:py-12">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl lg:text-3xl font-bold text-balance">Our Services</h2>
          <p className="text-base lg:text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
            Complete CAC registration services tailored to your business needs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="rounded-2xl border-2 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group overflow-hidden">
            <CardContent className="p-5 sm:p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <FileText className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">CAC Business Name</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Register your business name quickly and get official recognition for your enterprise.
              </p>
              <Link href="/services">
                <Button variant="link" className="text-accent p-0 h-auto text-sm">
                  Learn more →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Building2 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Company (LLC)</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Incorporate your limited liability company with complete legal compliance.
              </p>
              <Link href="/services">
                <Button variant="link" className="text-accent p-0 h-auto text-sm">
                  Learn more →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Users className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">NGO/Trustees</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Register your non-profit organization or board of trustees seamlessly.
              </p>
              <Link href="/services">
                <Button variant="link" className="text-accent p-0 h-auto text-sm">
                  Learn more →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Receipt className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">TIN Registration</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Obtain your Tax Identification Number for tax compliance and operations.
              </p>
              <Link href="/services">
                <Button variant="link" className="text-accent p-0 h-auto text-sm">
                  Learn more →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Shield className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">SCUML Registration</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Register with the Special Control Unit Against Money Laundering.
              </p>
              <Link href="/services">
                <Button variant="link" className="text-accent p-0 h-auto text-sm">
                  Learn more →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Award className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Trademark</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Protect your brand identity with official trademark registration.
              </p>
              <Link href="/services">
                <Button variant="link" className="text-accent p-0 h-auto text-sm">
                  Learn more →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Printer className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Printing Services</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                High-quality printing solutions for your business branding and marketing.
              </p>
              <Link href="/services">
                <Button variant="link" className="text-accent p-0 h-auto text-sm">
                  Learn more →
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-2 hover:shadow-lg hover:border-accent/30 transition-all duration-300 group">
            <CardContent className="p-6 space-y-3">
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                <Monitor className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-lg font-semibold">Website Development</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Professional website solutions to establish and grow your online presence.
              </p>
              <Link href="/services">
                <Button variant="link" className="text-accent p-0 h-auto text-sm">
                  Learn more →
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-3 sm:px-6 lg:px-8 py-10 lg:py-12">
        <Card className="rounded-2xl border-2 bg-linear-to-br from-primary/5 via-accent/5 to-primary/5 max-w-4xl mx-auto overflow-hidden">
          <CardContent className="p-6 sm:p-10 lg:p-12 text-center space-y-6">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance">
              Ready to Register Your Business?
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl mx-auto text-pretty">
              Join thousands of satisfied businesses who trust CLEOHN for their CAC registration needs.
            </p>
            <Link href="/pricing">
              <Button size="lg" className="rounded-full px-8 py-5 text-base bg-accent hover:bg-accent/90 shadow-md shadow-accent/10">
                View Our Pricing
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      <Footer />
    </div>
  )
}
