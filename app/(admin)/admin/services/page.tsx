"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Package,
  Layers,
  Star,
  Building2,
  Lock,
  FileCheck,
  Monitor,
  Loader2
} from "lucide-react";
import { toast } from "sonner";

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
  itemCount?: number;
  packageCount?: number;
}

// Icon mapping
const iconMap: Record<string, any> = {
  Building2,
  Lock,
  FileCheck,
  Monitor,
};

export default function ServicesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/services");
      if (response.ok) {
        const data = await response.json();

        // Fetch item and package counts for each category
        const categoriesWithCounts = await Promise.all(
          data.map(async (category: ServiceCategory) => {
            try {
              const itemsRes = await fetch(`/api/admin/services/${category.id}/items`);
              if (itemsRes.ok) {
                const items = await itemsRes.json();
                const itemCount = items.length;
                const packageCount = items.reduce((sum: number, item: any) =>
                  sum + (item.packageCount || 0), 0
                );
                return { ...category, itemCount, packageCount };
              }
            } catch (error) {
              console.error(`Failed to fetch counts for ${category.name}:`, error);
            }
            return category;
          })
        );

        setCategories(categoriesWithCounts);
      } else {
        toast.error("Failed to load service categories");
      }
    } catch (error) {
      toast.error("An error occurred while loading categories");
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return Layers;
    return iconMap[iconName] || Layers;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
            <p className="text-muted-foreground mt-2">
              Manage service categories, items, and pricing packages
            </p>
          </div>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Management</h1>
          <p className="text-muted-foreground mt-2">
            Manage service categories, items, and pricing packages
          </p>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Service Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + (cat.itemCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pricing Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {categories.reduce((sum, cat) => sum + (cat.packageCount || 0), 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Categories */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Service Categories</h2>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/admin/services/new")}
              className="gap-2"
            >
              <Layers className="h-4 w-4" />
              Add New Category
            </Button>
            <Badge variant="outline" className="gap-1">
              <Layers className="h-3 w-3" />
              Click to manage services
            </Badge>
          </div>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Layers className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No service categories found</p>
              <p className="text-sm text-muted-foreground">
                Run the seed script to populate services
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((category) => {
              const Icon = getIcon(category.icon);
              return (
                <Card
                  key={category.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2 hover:border-accent/50"
                  onClick={() => router.push(`/admin/services/category/${category.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                          <Icon className="h-6 w-6 text-accent" />
                        </div>
                        <div className="space-y-1">
                          <CardTitle className="text-lg group-hover:text-accent transition-colors">
                            {category.name}
                          </CardTitle>
                          <CardDescription>{category.description}</CardDescription>
                          <div className="flex items-center gap-3 mt-2">
                            <Badge variant="secondary" className="gap-1">
                              <Layers className="h-3 w-3" />
                              {category.itemCount || 0} services
                            </Badge>
                            <Badge variant="secondary" className="gap-1">
                              <Package className="h-3 w-3" />
                              {category.packageCount || 0} packages
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <Card className="bg-muted/50 border-2 border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>
            Manage your services and pricing
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/services/featured")}
            className="gap-2"
          >
            <Star className="h-4 w-4" />
            Manage Featured Packages
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("/pricing", "_blank")}
            className="gap-2"
          >
            <Monitor className="h-4 w-4" />
            Preview Pricing Page
          </Button>
          <Button
            variant="outline"
            onClick={() => window.open("/services", "_blank")}
            className="gap-2"
          >
            <Layers className="h-4 w-4" />
            Preview Services Page
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
