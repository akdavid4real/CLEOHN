"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, BadgeCheck, Loader2, PhoneCall, ShieldCheck, Sparkles } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import Link from "next/link";
import { useCart } from "@/hooks/use-cart";

function SuccessPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order");
  const { clearCart } = useCart();
  const [countdown, setCountdown] = useState(25);

  useEffect(() => {
    if (!orderNumber) {
      router.push("/shop");
      return;
    }

    clearCart();

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/services");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [clearCart, orderNumber, router]);

  if (!orderNumber) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background via-background to-secondary/40">
      <Nav />

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-medium">
                <Sparkles className="h-4 w-4" />
                Payment Confirmed
              </div>

              <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                Your Order Is In
                <span className="block text-primary">Safe Hands</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Thank you for choosing CLEOHN Group Ltd. We have received your payment and our team is now
                processing your request.
              </p>

              <div className="mx-auto max-w-xl rounded-2xl border bg-card p-6 shadow-sm">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">Order Number</p>
                <p className="text-2xl sm:text-3xl font-bold font-mono mt-2">{orderNumber}</p>
              </div>
            </div>

            <div className="mt-10 grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl border bg-card p-5">
                <BadgeCheck className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Payment Verified</h3>
                <p className="text-sm text-muted-foreground">Your transaction has been completed successfully.</p>
              </div>
              <div className="rounded-2xl border bg-card p-5">
                <ShieldCheck className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Order In Progress</h3>
                <p className="text-sm text-muted-foreground">Your registration or service request has entered processing.</p>
              </div>
              <div className="rounded-2xl border bg-card p-5">
                <PhoneCall className="h-5 w-5 text-primary mb-3" />
                <h3 className="font-semibold mb-1">Team Follow-up</h3>
                <p className="text-sm text-muted-foreground">We will contact you shortly with next steps and updates.</p>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border bg-card p-6 space-y-2 text-center">
              <h3 className="font-semibold text-lg">Need urgent support?</h3>
              <p className="text-sm text-muted-foreground">
                Email{" "}
                <a href="mailto:Cleohngroupltd@gmail.com" className="text-primary hover:underline">
                  Cleohngroupltd@gmail.com
                </a>{" "}
                or{" "}
                <a
                  href="https://wa.me/2348092697385"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  chat on WhatsApp
                </a>
                .
              </p>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/services">
                <Button size="lg" className="w-full sm:w-auto">
                  Explore More Services
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Contact Support Team
                </Button>
              </Link>
            </div>

            <p className="mt-6 text-sm text-center text-muted-foreground">
              Redirecting to services in {countdown} seconds...
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col">
          <Nav />
          <main className="flex-1 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </main>
          <Footer />
        </div>
      }
    >
      <SuccessPageContent />
    </Suspense>
  );
}
