'use client'

import { Nav } from '@/components/nav'
import { Footer } from '@/components/footer'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useState } from 'react'
import { CreditCard, Lock } from 'lucide-react'

export default function PaymentPage() {
  const [selectedService, setSelectedService] = useState('')

  const services = [
    { name: 'Business Name - Standard Package', price: '45,000' },
    { name: 'Business Name - VIP Package', price: '60,000' },
    { name: 'Company (LLC) - Standard Package', price: '100,000' },
    { name: 'Company (LLC) - Complete Ownership Package', price: '165,000' },
    { name: 'Company (LLC) - VIP Package', price: '270,000' },
    { name: 'Company (LLC) - Premium Exclusive Package', price: '650,000' },
    { name: 'Incorporated Trustee - Standard Package', price: '150,000' },
    { name: 'Incorporated Trustee - VIP Package', price: '200,000' },
    { name: 'Trademark', price: '70,000' }
  ]

  return (
    <div className="min-h-screen">
      <Nav />

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl lg:text-5xl font-bold">Complete Your Payment</h1>
            <p className="text-lg text-muted-foreground">
              Secure payment powered by Paystack
            </p>
          </div>

          <div className="grid gap-8">
            <Card className="rounded-3xl border-2">
              <CardHeader className="p-8 pb-6">
                <CardTitle className="text-2xl">Select Service</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="service" className="text-base">Choose your service</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger id="service" className="rounded-xl h-12">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.name} value={service.name}>
                          {service.name} - ₦{service.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedService && (
                  <div className="pt-4 border-t border-border">
                    <div className="flex justify-between items-center text-lg">
                      <span className="font-semibold">Total Amount:</span>
                      <span className="text-3xl font-bold text-accent">
                        ₦{services.find(s => s.name === selectedService)?.price}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-2">
              <CardHeader className="p-8 pb-6">
                <CardTitle className="text-2xl">Payment Details</CardTitle>
              </CardHeader>
              <CardContent className="p-8 pt-0 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-base">Full Name</Label>
                  <Input 
                    id="fullName" 
                    placeholder="John Doe" 
                    className="rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-base">Email Address</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="john@example.com" 
                    className="rounded-xl h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    placeholder="+234 800 000 0000" 
                    className="rounded-xl h-12"
                  />
                </div>

                <div className="pt-4">
                  <Button 
                    className="w-full rounded-full py-6 text-lg bg-accent hover:bg-accent/90 shadow-lg shadow-accent/20"
                    disabled={!selectedService}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Proceed to Payment
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Lock className="h-4 w-4" />
                  <span>Secured by Paystack - 256-bit SSL Encryption</span>
                </div>
              </CardContent>
            </Card>

            <div className="text-center text-sm text-muted-foreground">
              <p className="leading-relaxed">
                By proceeding with payment, you agree to our terms of service. 
                All payments are securely processed through Paystack.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
