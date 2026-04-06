"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, FileText, Briefcase, Users, Award, Shield, Landmark, Receipt, Globe, Calculator, Printer, Monitor } from "lucide-react";
import { toast } from "sonner";

const iconOptions = [
  { value: "FileText", label: "Document", icon: FileText },
  { value: "Briefcase", label: "Business", icon: Briefcase },
  { value: "Users", label: "People", icon: Users },
  { value: "Award", label: "Award", icon: Award },
  { value: "Shield", label: "Protection", icon: Shield },
  { value: "Landmark", label: "Institution", icon: Landmark },
  { value: "Receipt", label: "Receipt", icon: Receipt },
  { value: "Globe", label: "Global", icon: Globe },
  { value: "Calculator", label: "Finance", icon: Calculator },
  { value: "Printer", label: "Print", icon: Printer },
  { value: "Monitor", label: "Digital", icon: Monitor },
];

interface Category {
  id: string;
  name: string;
}

export default function NewServiceItemPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    icon: "FileText",
    cost: "",
    delivery: "",
    order: 0,
  });

  useEffect(() => {
    if (categoryId) {
      fetchCategory();
    }
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/admin/services/${categoryId}`);
      if (response.ok) {
        const data = await response.json();
        setCategory(data);
      }
    } catch (error) {
      console.error("Error fetching category:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/admin/services/${categoryId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          serviceId: categoryId,
        }),
      });

      if (response.ok) {
        toast.success("Service item created successfully!");
        router.push(`/admin/services/category/${categoryId}`);
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to create service item");
      }
    } catch (error) {
      console.error("Error creating service item:", error);
      toast.error("An error occurred while creating the service item");
    } finally {
      setIsSubmitting(false);
    }
  };

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
        <span>/</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/admin/services/category/${categoryId}`)}
          className="hover:text-accent"
        >
          {category?.name}
        </Button>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Add New Service Item</h1>
        <p className="text-muted-foreground mt-2">
          Create a new service item under {category?.name}
        </p>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Service Item Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Service Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Business Name Registration"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of this service"
                rows={4}
                required
              />
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="icon">Icon</Label>
                <Select
                  value={formData.icon}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cost">Cost (Optional)</Label>
                <Input
                  id="cost"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  placeholder="e.g., ₦45,000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delivery">Delivery Time (Optional)</Label>
                <Input
                  id="delivery"
                  value={formData.delivery}
                  onChange={(e) => setFormData(prev => ({ ...prev, delivery: e.target.value }))}
                  placeholder="e.g., 7 working days"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Display Order</Label>
              <Input
                id="order"
                type="number"
                value={formData.order}
                onChange={(e) => setFormData(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                placeholder="0"
                min="0"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Service Item"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push(`/admin/services/category/${categoryId}`)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}