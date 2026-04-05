'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Menu, X, MapPin, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CartButton } from '@/components/cart/cart-button'

export function Nav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground py-1.5 text-[10px] sm:text-[12px] border-b border-primary-foreground/10">
        <div className="container mx-auto px-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-1 sm:gap-4">
          <div className="flex items-center text-center sm:text-left">
            <div className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent shrink-0" />
              <span className="leading-tight">1 Anishere Bus-stop, Governor's Road, Ikotun, Lagos</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <a href="mailto:Cleohngroupltd@gmail.com" className="flex items-center gap-1 hover:text-accent transition-colors">
              <Mail className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent shrink-0" />
              <span>Cleohngroupltd@gmail.com</span>
            </a>
            <a href="https://wa.me/2348092697385" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-accent transition-colors">
              <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-accent shrink-0" />
              <span>08092697385</span>
            </a>
          </div>
        </div>
      </div>

      <nav className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center space-x-2">
              <Image src="/logo.png" alt="CLEOHN Logo" width={120} height={40} className="h-10 w-auto rounded" priority />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/">
                <Button variant="ghost" className="rounded-full text-sm h-10 min-w-[80px]">
                  Home
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="ghost" className="rounded-full text-sm h-10 min-w-[80px]">
                  Services
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className="rounded-full text-sm h-10 min-w-[80px]">
                  Pricing
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="ghost" className="rounded-full text-sm h-10 min-w-[80px]">
                  Shop
                </Button>
              </Link>
              <Link href="/videos">
                <Button variant="ghost" className="rounded-full text-sm h-10 min-w-[80px]">
                  Videos
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" className="rounded-full text-sm h-10 min-w-[80px]">
                  Contact
                </Button>
              </Link>
              <CartButton />
            </div>

            {/* Mobile Menu & Cart */}
            <div className="md:hidden flex items-center gap-2">
              <CartButton />
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg hover:bg-muted transition-colors min-w-[48px] min-h-[48px] flex items-center justify-center"
                aria-label={isOpen ? 'Close menu' : 'Open menu'}
              >
                {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden py-3 space-y-2 border-t border-border">
              <Link href="/" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full rounded-lg text-base justify-start h-12 min-h-[48px]">
                  Home
                </Button>
              </Link>
              <Link href="/services" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full rounded-lg text-base justify-start h-12 min-h-[48px]">
                  Services
                </Button>
              </Link>
              <Link href="/pricing" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full rounded-lg text-base justify-start h-12 min-h-[48px]">
                  Pricing
                </Button>
              </Link>
              <Link href="/shop" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full rounded-lg text-base justify-start h-12 min-h-[48px]">
                  Shop
                </Button>
              </Link>
              <Link href="/videos" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full rounded-lg text-base justify-start h-12 min-h-[48px]">
                  Videos
                </Button>
              </Link>
              <Link href="/contact" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full rounded-lg text-base justify-start h-12 min-h-[48px]">
                  Contact
                </Button>
              </Link>
              
              {/* Mobile Contact Info */}
              <div className="pt-3 mt-3 border-t border-border space-y-3 px-3">
                <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span>1 Anishere Bus-stop, Ikotun, Lagos</span>
                </div>
                <a href="mailto:Cleohngroupltd@gmail.com" className="flex items-center gap-2.5 text-[13px] text-muted-foreground hover:text-accent min-h-[48px]">
                  <Mail className="h-4 w-4 text-accent" />
                  <span>Cleohngroupltd@gmail.com</span>
                </a>
                <a href="https://wa.me/2348092697385" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[13px] text-muted-foreground hover:text-accent min-h-[48px]">
                  <Phone className="h-4 w-4 text-accent" />
                  <span>08092697385</span>
                </a>
              </div>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
