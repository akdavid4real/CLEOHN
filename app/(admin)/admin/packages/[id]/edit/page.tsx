"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  ChevronRight,
  Loader2,
  Save,
  Trash2,
  Plus,
  GripVertical,
  Star,
  Eye,
  Package as PackageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface Feature {
  id: string;
  feature: string;
  order: number;
}

interface PackageData {
  id: string;
  name: string;
  price: number;
  processingTime?: string;
  featured: boolean;
  displayOrder: number;
  isPopular: boolean;
  pricingDescription?: string;
  serviceItemId: string;
  features: Feature[];
  serviceItem?: {
    id: string;
    title: string;
    serviceId: string;
  };
  category?: {
    id: string;
    name: string;
  };
}

export default function PackageEditPage() {
  const router = useRouter();
  const params = useParams();
  const packageId = params?.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [pkg, setPkg] = useState<PackageData | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [processingTime, setProcessingTime] = useState("");
  const [pricingDescription, setPricingDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState("0");
  const [featured, setFeatured] = useState(false);
  const [isPopular, setIsPopular] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);

  useEffect(() => {
    if (packageId) fetchPackage();
  }, [packageId]);

  const fetchPackage = async () => {
    try {
      const res = await fetch(`/api/admin/packages/${packageId}`);
      if (!res.ok) {
        toast.error("Package not found");
        router.push("/admin/services");
        return;
      }
      const data: PackageData = await res.json();
      setPkg(data);

      // Populate form
      setName(data.name);
      setPrice(data.price.toString());
      setProcessingTime(data.processingTime || "");
      setPricingDescription(data.pricingDescription || "");
      setDisplayOrder((data.displayOrder || 0).toString());
      setFeatured(data.featured);
      setIsPopular(data.isPopular);
      setFeatures(data.features.map((f) => f.feature));
    } catch {
      toast.error("Failed to load package");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Package name is required");
      return;
    }
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      toast.error("Enter a valid price");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/packages/${packageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          price: parsedPrice,
          processingTime: processingTime.trim() || null,
          pricingDescription: pricingDescription.trim() || null,
          displayOrder: parseInt(displayOrder) || 0,
          featured,
          isPopular,
          features: features.filter((f) => f.trim()),
        }),
      });

      if (res.ok) {
        toast.success("Package updated successfully");
        router.push(`/admin/services/item/${pkg?.serviceItemId}`);
      } else {
        toast.error("Failed to update package");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-24">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!pkg) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/services")}
          className="hover:text-accent h-7 px-2"
        >
          Categories
        </Button>
        <ChevronRight className="h-3.5 w-3.5" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(`/admin/services/category/${pkg.category?.id}`)
          }
          className="hover:text-accent h-7 px-2"
        >
          {pkg.category?.name}
        </Button>
        <ChevronRight className="h-3.5 w-3.5" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() =>
            router.push(`/admin/services/item/${pkg.serviceItemId}`)
          }
          className="hover:text-accent h-7 px-2"
        >
          {pkg.serviceItem?.title}
        </Button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium">Edit Package</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Package</h1>
          <p className="text-muted-foreground mt-1">
            {pkg.serviceItem?.title} &mdash; {pkg.name}
          </p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <PackageIcon className="h-4 w-4" />
            Package Info
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Package Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Standard Package"
            />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Price (&#8358;)</label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g., 45000"
                min="0"
                step="1000"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Processing Time</label>
              <Input
                value={processingTime}
                onChange={(e) => setProcessingTime(e.target.value)}
                placeholder="e.g., 1 - 5 working days"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Page Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Pricing Page Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="text-sm font-medium">Show on Pricing Page</p>
              <p className="text-xs text-muted-foreground">
                Featured packages appear on the public /pricing page
              </p>
            </div>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </div>

          {featured && (
            <>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-accent" />
                  <div>
                    <p className="text-sm font-medium">
                      &quot;BEST VALUE&quot; Badge
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Highlights this package on the pricing page
                    </p>
                  </div>
                </div>
                <Switch checked={isPopular} onCheckedChange={setIsPopular} />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Display Order</label>
                  <Input
                    type="number"
                    value={displayOrder}
                    onChange={(e) => setDisplayOrder(e.target.value)}
                    placeholder="0"
                    min="0"
                  />
                  <p className="text-xs text-muted-foreground">
                    Lower numbers appear first on the pricing page
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Pricing Page Description
                </label>
                <Textarea
                  value={pricingDescription}
                  onChange={(e) => setPricingDescription(e.target.value)}
                  placeholder="Short description shown on the pricing page..."
                  rows={2}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Deliverables */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <GripVertical className="h-4 w-4" />
              Deliverables
              <Badge variant="secondary">{features.length}</Badge>
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {features.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No deliverables yet. Add what the customer receives with this
              package.
            </p>
          )}

          {features.map((feature, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-6 text-right tabular-nums">
                {idx + 1}.
              </span>
              <Input
                value={feature}
                onChange={(e) => {
                  const updated = [...features];
                  updated[idx] = e.target.value;
                  setFeatures(updated);
                }}
                placeholder="e.g., Certificate of Registration"
                className="flex-1"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0"
                onClick={() =>
                  setFeatures(features.filter((_, i) => i !== idx))
                }
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          ))}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFeatures([...features, ""])}
            className="gap-2 w-full mt-2"
          >
            <Plus className="h-4 w-4" />
            Add Deliverable
          </Button>
        </CardContent>
      </Card>

      {/* Bottom Save */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button
          variant="outline"
          onClick={() =>
            router.push(`/admin/services/item/${pkg.serviceItemId}`)
          }
        >
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save Changes
        </Button>
      </div>
    </div>
  );
}
