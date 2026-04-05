"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Large 404 */}
        <div className="relative">
          <h1 className="text-[10rem] font-black leading-none text-muted-foreground/10 select-none">
            404
          </h1>
          <div className="absolute inset-0 flex items-center justify-center">
            <Search className="h-16 w-16 text-muted-foreground/40" />
          </div>
        </div>

        {/* Message */}
        <div className="space-y-3 -mt-6">
          <h2 className="text-2xl font-bold tracking-tight">
            Page not found
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been
            moved. Let&apos;s get you back on track.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="gap-2 w-full sm:w-auto"
          >
            <ArrowLeft className="h-4 w-4" />
            Go Back
          </Button>
          <Link href="/" className="w-full sm:w-auto">
            <Button className="gap-2 w-full bg-accent hover:bg-accent/90">
              <Home className="h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Quick Links */}
        <div className="pt-6 border-t">
          <p className="text-xs text-muted-foreground mb-3">Quick links</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/services">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                Services
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                Pricing
              </Button>
            </Link>
            <Link href="/shop">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                Shop
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="ghost" size="sm" className="text-xs h-7">
                Contact
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
