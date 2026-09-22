"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";

function VerifyCheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const reference = searchParams.get("reference") || searchParams.get("trxref");

    if (!reference) {
      router.replace("/checkout/cancel?error=missing_reference");
      return;
    }

    const runVerification = async () => {
      try {
        const response = await fetch(
          `/api/checkout/verify?reference=${encodeURIComponent(reference)}&response=json`,
          { method: "GET", cache: "no-store" }
        );

        if (!response.ok) {
          router.replace("/checkout/cancel?error=verification_error");
          return;
        }

        const data = (await response.json()) as { redirectUrl?: string };

        if (!data.redirectUrl) {
          router.replace("/checkout/cancel?error=verification_error");
          return;
        }

        window.location.replace(data.redirectUrl);
      } catch {
        router.replace("/checkout/cancel?error=verification_error");
      }
    };

    runVerification();
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <h1 className="text-2xl font-semibold">Verifying Your Payment</h1>
          <p className="text-muted-foreground">
            Please wait while we confirm your transaction.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function VerifyCheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <VerifyCheckoutContent />
    </Suspense>
  );
}
