'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Menu, X, MapPin, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'

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
              <img src="/logo.jpeg" alt="CLEOHN Logo" className="h-10 w-auto rounded" />
              <div className="text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
                CLEOHN
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              <Link href="/">
                <Button variant="ghost" className="rounded-full text-sm h-9">
                  Home
                </Button>
              </Link>
              <Link href="/services">
                <Button variant="ghost" className="rounded-full text-sm h-9">
                  Services
                </Button>
              </Link>
              <Link href="/pricing">
                <Button variant="ghost" className="rounded-full text-sm h-9">
                  Pricing
                </Button>
              </Link>
              <Link href="/videos">
                <Button variant="ghost" className="rounded-full text-sm h-9">
                  Videos
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="ghost" className="rounded-full text-sm h-9">
                  Contact
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="md:hidden py-3 space-y-1 border-t border-border">
              <Link href="/" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full rounded-lg text-sm justify-start h-10">
                  Home
                </Button>
              </Link>
              <Link href="/services" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full rounded-lg text-sm justify-start h-10">
                  Services
                </Button>
              </Link>
              <Link href="/pricing" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full rounded-lg text-sm justify-start h-10">
                  Pricing
                </Button>
              </Link>
              <Link href="/videos" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full rounded-lg text-sm justify-start h-10">
                  Videos
                </Button>
              </Link>
              <Link href="/contact" onClick={() => setIsOpen(false)}>
                <Button variant="ghost" className="w-full rounded-lg text-sm justify-start h-10">
                  Contact
                </Button>
              </Link>
              
              {/* Mobile Contact Info */}
              <div className="pt-3 mt-3 border-t border-border space-y-3 px-3">
                <div className="flex items-center gap-2.5 text-[13px] text-muted-foreground">
                  <MapPin className="h-4 w-4 text-accent" />
                  <span>1 Anishere Bus-stop, Ikotun, Lagos</span>
                </div>
                <a href="mailto:Cleohngroupltd@gmail.com" className="flex items-center gap-2.5 text-[13px] text-muted-foreground hover:text-accent">
                  <Mail className="h-4 w-4 text-accent" />
                  <span>Cleohngroupltd@gmail.com</span>
                </a>
                <a href="https://wa.me/2348092697385" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2.5 text-[13px] text-muted-foreground hover:text-accent">
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
