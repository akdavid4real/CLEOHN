"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, Loader2 } from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import Link from "next/link";

function CancelPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    // Countdown redirect to cart
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/cart");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const getErrorMessage = () => {
    switch (error) {
      case "missing_reference":
        return "Payment reference is missing. Please try again.";
      case "verification_failed":
        return "We couldn't verify your payment. Please contact support.";
      case "order_not_found":
        return "Order not found. Please contact support with your payment reference.";
      case "payment_failed":
        return "Your payment was not successful. Please try again.";
      case "verification_error":
        return "An error occurred while verifying your payment. Please contact support.";
      default:
        return "Payment was cancelled or failed. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <main className="flex-1 container mx-auto px-4 py-16 flex items-center justify-center">
        <Card className="max-w-2xl w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <CardTitle className="text-3xl">Payment {error === "payment_failed" ? "Failed" : "Cancelled"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-2">
              <p className="text-muted-foreground">{getErrorMessage()}</p>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="font-semibold text-amber-900 mb-2">What can you do?</h3>
              <ul className="space-y-1 text-sm text-amber-800">
                <li>• Check your payment details and try again</li>
                <li>• Ensure you have sufficient funds in your account</li>
                <li>• Contact your bank if the problem persists</li>
                <li>• Reach out to our support team for assistance</li>
              </ul>
            </div>

            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm text-muted-foreground text-center">
                Need help? Contact us at{" "}
                <a
                  href="mailto:Cleohngroupltd@gmail.com"
                  className="text-primary hover:underline"
                >
                  Cleohngroupltd@gmail.com
                </a>
                {" "}or{" "}
                <a
                  href="https://wa.me/2348092697385"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  WhatsApp us
                </a>
              </p>
            </div>

            <div className="space-y-3">
              <Link href="/cart">
                <Button className="w-full" size="lg">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Return to Cart
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="outline" className="w-full" size="lg">
                  Continue Shopping
                </Button>
              </Link>
              <p className="text-sm text-center text-muted-foreground">
                Redirecting to cart in {countdown} seconds...
              </p>
            </div>
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}

export default function CheckoutCancelPage() {
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
      <CancelPageContent />
    </Suspense>
  );
}
