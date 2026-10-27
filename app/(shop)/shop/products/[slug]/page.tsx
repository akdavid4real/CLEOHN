import type { Metadata } from "next";
import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  MessageCircle,
  Package,
  ShieldCheck,
  Star,
  Truck,
} from "lucide-react";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductGallery } from "@/components/shop/product-gallery";
import { OrderNowButton } from "@/components/shop/order-now-button";
import { ProductStickyCta } from "@/components/shop/product-sticky-cta";
import { CampaignTracker } from "@/components/shop/campaign-tracker";
import { ProductReviews } from "@/components/shop/product-reviews";
import { ReviewForm } from "@/components/shop/review-form";
import { getProductBySlug, getProductWithDetails } from "@/lib/queries/products";
import { pickAttribution } from "@/lib/attribution";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "");

const getProductPageData = cache(async (slug: string) => {
  const product = await getProductBySlug(slug);
  if (!product) return null;

  return getProductWithDetails(product.id);
});

interface ProductPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductPageData(slug);

  if (!product) {
    return {
      title: "Product Not Found | CLEOHN",
      robots: { index: false, follow: false },
    };
  }

  const path = `/shop/products/${product.slug}`;
  const description =
    product.description?.replace(/\s+/g, " ").trim().slice(0, 160) ||
    `Buy ${product.name} online from CLEOHN. Fast delivery across Nigeria.`;
  const primaryImage = product.images[0]?.imageUrl;

  return {
    title: `${product.name} | CLEOHN`,
    description,
    alternates: { canonical: path },
    robots: product.isActive
      ? { index: true, follow: true }
      : { index: false, follow: false },
    openGraph: {
      type: "website",
      siteName: "CLEOHN",
      locale: "en_NG",
      url: path,
      title: product.name,
      description,
      images: primaryImage
        ? [{ url: primaryImage, alt: product.name }]
        : undefined,
    },
    twitter: {
      card: primaryImage ? "summary_large_image" : "summary",
      title: product.name,
      description,
      images: primaryImage ? [primaryImage] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
  searchParams,
}: ProductPageProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = await getProductPageData(slug);

  if (!product || !product.isActive) {
    notFound();
  }

  const attribution = pickAttribution(query as Record<string, unknown>);
  const stock = product.stock ?? 0;
  const inStock = stock > 0;

  const formatPrice = (value: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    }).format(value);

  const discount =
    product.compareAtPrice && product.compareAtPrice > 0
      ? Math.round(
          ((product.compareAtPrice - product.price) /
            product.compareAtPrice) *
            100
        )
      : 0;

  const cartItem = {
    id: product.id,
    type: "product" as const,
    productId: product.id,
    name: product.name,
    price: product.price,
    sku: product.sku,
    image: product.images[0]?.imageUrl ?? undefined,
  };

  const productUrl = `${SITE_URL ?? ""}/shop/products/${product.slug}`;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    image: product.images.map((image) => image.imageUrl),
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: "CLEOHN",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "NGN",
      price: product.price,
      availability: inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
    ...(product.reviewCount && product.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: product.rating,
            reviewCount: product.reviewCount,
          },
        }
      : {}),
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <CampaignTracker attribution={attribution} />

      <main className="flex-1 pb-24 lg:pb-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1 text-sm text-muted-foreground mb-6"
          >
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href="/shop" className="hover:text-foreground">
              Shop
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <ProductGallery
              images={product.images}
              name={product.name}
              discount={discount}
            />

            <div className="space-y-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                  {product.name}
                </h1>
                {product.reviewCount && product.reviewCount > 0 ? (
                  <a
                    href="#reviews"
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                  >
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-foreground">
                      {(product.rating ?? 0).toFixed(1)}
                    </span>
                    <span>({product.reviewCount} reviews)</span>
                  </a>
                ) : (
                  product.sku && (
                    <p className="text-sm text-muted-foreground">
                      SKU: {product.sku}
                    </p>
                  )
                )}
              </div>

              <div className="flex flex-wrap items-end gap-3">
                <p className="text-4xl font-bold">{formatPrice(product.price)}</p>
                {product.compareAtPrice && (
                  <>
                    <p className="text-xl text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice)}
                    </p>
                    <span className="bg-red-500 text-white text-sm font-semibold px-2 py-1 rounded">
                      Save {discount}%
                    </span>
                  </>
                )}
              </div>

              {product.description && (
                <p className="text-muted-foreground whitespace-pre-wrap line-clamp-4">
                  {product.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <span
                  className={
                    inStock
                      ? "flex items-center gap-1.5 text-green-600 font-medium"
                      : "flex items-center gap-1.5 text-red-600 font-medium"
                  }
                >
                  {inStock ? (
                    <>
                      <CheckCircle2 className="h-4 w-4" />
                      In Stock
                    </>
                  ) : (
                    <>
                      <Package className="h-4 w-4" />
                      Out of Stock
                    </>
                  )}
                </span>
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  Free delivery in Lagos
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-3">
                  <OrderNowButton
                    item={cartItem}
                    disabled={!inStock}
                    className="flex-1"
                    label={inStock ? "Order Now" : "Out of Stock"}
                  />
                  {inStock && (
                    <AddToCartButton
                      item={cartItem}
                      variant="outline"
                      size="lg"
                      className="sm:w-auto"
                    />
                  )}
                </div>

                <a
                  href="https://wa.me/2348092697385"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                >
                  <MessageCircle className="h-4 w-4" />
                  Questions? Chat with us on WhatsApp
                </a>
              </div>

              <Separator />

              <div className="grid gap-3 sm:grid-cols-2 text-sm">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="h-5 w-5 text-green-600 shrink-0" />
                  <div>
                    <p className="font-medium">Secure checkout</p>
                    <p className="text-muted-foreground">
                      Payments handled by Paystack
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Truck className="h-5 w-5 text-primary shrink-0" />
                  <div>
                    <p className="font-medium">Fast delivery</p>
                    <p className="text-muted-foreground">
                      Nationwide delivery available
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <section className="mt-12 max-w-3xl">
            <h2 className="text-2xl font-bold mb-4">Product Details</h2>
            {product.description ? (
              <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                {product.description}
              </p>
            ) : (
              <p className="text-muted-foreground">
                Contact us for more details about this product.
              </p>
            )}

            <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              {product.sku && (
                <div className="flex justify-between gap-4 border-b py-2">
                  <dt className="text-muted-foreground">SKU</dt>
                  <dd className="font-medium">{product.sku}</dd>
                </div>
              )}
              <div className="flex justify-between gap-4 border-b py-2">
                <dt className="text-muted-foreground">Availability</dt>
                <dd className="font-medium">
                  {inStock ? `${stock} in stock` : "Out of stock"}
                </dd>
              </div>
            </dl>
          </section>

          <section id="reviews" className="mt-12 scroll-mt-24">
            <Tabs defaultValue="reviews" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="reviews">Customer Reviews</TabsTrigger>
                <TabsTrigger value="write-review">Write a Review</TabsTrigger>
              </TabsList>
              <TabsContent value="reviews" className="mt-6">
                <ProductReviews productId={product.id} />
              </TabsContent>
              <TabsContent value="write-review" className="mt-6">
                <div className="max-w-2xl">
                  <ReviewForm productId={product.id} />
                </div>
              </TabsContent>
            </Tabs>
          </section>
        </div>
      </main>

      <ProductStickyCta
        item={cartItem}
        price={product.price}
        compareAtPrice={product.compareAtPrice}
        disabled={!inStock}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <Footer />
    </div>
  );
}
