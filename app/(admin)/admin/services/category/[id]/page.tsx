"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Package,
  Star,
  Loader2,
  Info,
  ListChecks,
  Layers,
  DollarSign,
  FileText,
  Briefcase,
  Users,
  Award,
  Shield,
  Landmark,
  Receipt,
  Globe,
  Calculator,
  Printer,
  Monitor
} from "lucide-react";
import { toast } from "sonner";

interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon?: string;
  cost?: string;
  delivery?: string;
  infoPoints?: string;
  types?: string;
  phases?: string;
  packageCount: number;
  featuredCount: number;
  order: number;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

// Icon mapping
const iconMap: Record<string, any> = {
  FileText,
  Briefcase,
  Users,
  Award,
  Shield,
  Landmark,
  Receipt,
  Globe,
  Calculator,
  Printer,
  Monitor,
};

export default function CategoryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (categoryId) {
      fetchCategoryAndItems();
    }
  }, [categoryId]);

  const fetchCategoryAndItems = async () => {
    try {
      // Fetch category details
      const categoryRes = await fetch(`/api/admin/services/${categoryId}`);
      if (categoryRes.ok) {
        const categoryData = await categoryRes.json();
        setCategory(categoryData);
      }

      // Fetch service items
      const itemsRes = await fetch(`/api/admin/services/${categoryId}/items`);
      if (itemsRes.ok) {
        const itemsData = await itemsRes.json();
        setServiceItems(itemsData);
      } else {
        toast.error("Failed to load service items");
      }
    } catch (error) {
      toast.error("An error occurred while loading data");
    } finally {
      setIsLoading(false);
    }
  };

  const getIcon = (iconName?: string) => {
    if (!iconName) return Package;
    return iconMap[iconName] || Package;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/services")}>
            <ChevronLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
        <div className="flex items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/admin/services")}
          className="gap-2 hover:text-accent"
        >
          <ChevronLeft className="h-4 w-4" />
          Service Categories
        </Button>
        <ChevronRight className="h-4 w-4" />
        <span className="text-foreground font-medium">{category?.name}</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{category?.name}</h1>
        <p className="text-muted-foreground mt-2">{category?.description}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Service Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceItems.reduce((sum, item) => sum + item.packageCount, 0)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Featured Packages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {serviceItems.reduce((sum, item) => sum + item.featuredCount, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Items */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Service Items</h2>
          <Badge variant="outline" className="gap-1">
            <Package className="h-3 w-3" />
            Click to manage packages
          </Badge>
        </div>

        {serviceItems.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No service items found</p>
              <p className="text-sm text-muted-foreground">
                Service items should be created via the seed script
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {serviceItems.map((item) => {
              const Icon = getIcon(item.icon);
              return (
                <Card
                  key={item.id}
                  className="hover:shadow-lg transition-all duration-200 cursor-pointer group border-2"
                  onClick={() => router.push(`/admin/services/item/${item.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <div className="p-3 rounded-lg bg-accent/10 group-hover:bg-accent/20 transition-colors">
                          <Icon className="h-6 w-6 text-accent" />
                        </div>
                        <div className="space-y-1 flex-1">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <CardTitle className="text-lg group-hover:text-accent transition-colors">
                                {item.title}
                              </CardTitle>
                              <CardDescription className="mt-1">{item.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-3">
                            {item.packageCount > 0 ? (
                              <Badge variant="secondary" className="gap-1">
                                <Package className="h-3 w-3" />
                                {item.packageCount} package{item.packageCount !== 1 ? 's' : ''}
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="gap-1 text-muted-foreground">
                                <Package className="h-3 w-3" />
                                No packages
                              </Badge>
                            )}
                            {item.featuredCount > 0 && (
                              <Badge variant="default" className="gap-1 bg-accent">
                                <Star className="h-3 w-3 fill-current" />
                                {item.featuredCount} featured
                              </Badge>
                            )}
                            {item.cost && (
                              <Badge variant="secondary" className="gap-1">
                                <DollarSign className="h-3 w-3" />
                                {item.cost}
                              </Badge>
                            )}
                            {item.infoPoints && JSON.parse(item.infoPoints).length > 0 && (
                              <Badge variant="secondary" className="gap-1">
                                <Info className="h-3 w-3" />
                                {JSON.parse(item.infoPoints).length} info points
                              </Badge>
                            )}
                            {item.types && JSON.parse(item.types).length > 0 && (
                              <Badge variant="secondary" className="gap-1">
                                <ListChecks className="h-3 w-3" />
                                {JSON.parse(item.types).length} types
                              </Badge>
                            )}
                            {item.phases && JSON.parse(item.phases).length > 0 && (
                              <Badge variant="secondary" className="gap-1">
                                <Layers className="h-3 w-3" />
                                {JSON.parse(item.phases).length} phases
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
