"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Star, Package, DollarSign } from "lucide-react";

interface ServicePackage {
  id: string;
  name: string;
  price: number;
  featured: boolean;
  processingTime: string;
  serviceItem: {
    title: string;
    service: {
      name: string;
    };
  };
}

export default function FeaturedServicesPage() {
  const [packages, setPackages] = useState<ServicePackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/admin/services/packages");
      if (response.ok) {
        const data = await response.json();
        setPackages(data);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  const toggleFeatured = async (packageId: string, featured: boolean) => {
    setUpdating(packageId);
    try {
      const response = await fetch(`/api/admin/services/packages/${packageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featured }),
      });

      if (response.ok) {
        setPackages(packages.map(pkg => 
          pkg.id === packageId ? { ...pkg, featured } : pkg
        ));
        toast.success(`Package ${featured ? 'featured' : 'unfeatured'} successfully`);
      } else {
        toast.error("Failed to update package");
      }
    } catch (error) {
      console.error("Error updating package:", error);
      toast.error("Failed to update package");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Featured Services</h1>
        </div>
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const featuredPackages = packages.filter(pkg => pkg.featured);
  const nonFeaturedPackages = packages.filter(pkg => !pkg.featured);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Featured Services</h1>
          <p className="text-muted-foreground">
            Manage which service packages appear as featured on your website
          </p>
        </div>
        <Badge variant="secondary" className="text-sm">
          {featuredPackages.length} Featured
        </Badge>
      </div>

      {/* Featured Packages */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          <h2 className="text-xl font-semibold">Featured Packages</h2>
        </div>
        
        {featuredPackages.length === 0 ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No featured packages yet. Toggle the switch on any package below to feature it.
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {featuredPackages.map((pkg) => (
              <Card key={pkg.id} className="border-yellow-200 bg-yellow-50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          {pkg.serviceItem.service.name}
                        </Badge>
                        <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      </div>
                      <h3 className="font-semibold text-lg">
                        {pkg.serviceItem.title} - {pkg.name}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ₦{pkg.price.toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Package className="h-4 w-4" />
                          {pkg.processingTime}
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={pkg.featured}
                      onCheckedChange={(checked) => toggleFeatured(pkg.id, checked)}
                      disabled={updating === pkg.id}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* All Other Packages */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">All Packages</h2>
        <div className="grid gap-4">
          {nonFeaturedPackages.map((pkg) => (
            <Card key={pkg.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Badge variant="outline">
                      {pkg.serviceItem.service.name}
                    </Badge>
                    <h3 className="font-semibold">
                      {pkg.serviceItem.title} - {pkg.name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        ₦{pkg.price.toLocaleString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <Package className="h-4 w-4" />
                        {pkg.processingTime}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={pkg.featured}
                    onCheckedChange={(checked) => toggleFeatured(pkg.id, checked)}
                    disabled={updating === pkg.id}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}