"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload, X } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface Category {
  id: string;
  name: string;
}

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    price: "",
    compareAtPrice: "",
    sku: "",
    stock: "",
    categoryId: "",
    isActive: true,
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        console.log('Categories response:', data); // Debug log
        setCategories(Array.isArray(data) ? data : data.categories || []);
      } else {
        console.error('Failed to fetch categories:', response.status);
        toast.error('Failed to load categories');
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
      toast.error('Failed to load categories');
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.secure_url);
        } else {
          toast.error(`Failed to upload ${file.name}`);
        }
      }

      setImageUrls((prev) => [...prev, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error("Failed to upload images");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    setImageUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create product first
      const productResponse = await fetch("/api/admin/products", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          compareAtPrice: formData.compareAtPrice
            ? parseFloat(formData.compareAtPrice)
            : null,
          stock: parseInt(formData.stock),
        }),
      });

      if (!productResponse.ok) {
        const data = await productResponse.json();
        toast.error(data.error || "Failed to create product");
        return;
      }

      const { id: productId } = await productResponse.json();

      // Upload images if any
      if (imageUrls.length > 0) {
        for (let i = 0; i < imageUrls.length; i++) {
          await fetch(`/api/admin/products/${productId}/images`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageUrl: imageUrls[i],
              isPrimary: i === 0, // First image is primary
              order: i,
            }),
          });
        }
      }

      toast.success("Product created successfully");
      router.push("/admin/products");
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Product</h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Product Name *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setFormData((prev) => ({
                      ...prev,
                      name,
                      slug: generateSlug(name),
                    }));
                  }}
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  required
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, slug: e.target.value }))
                  }
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="col-span-2">
                <Label>Product Images</Label>
                <div className="space-y-3">
                  {imageUrls.length > 0 && (
                    <div className="grid grid-cols-4 gap-3">
                      {imageUrls.map((url, index) => (
                        <div key={index} className="relative group">
                          <div className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                            <Image
                              src={url}
                              alt={`Product ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          {index === 0 && (
                            <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                              Primary
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      disabled={isUploading}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          {isUploading
                            ? "Uploading..."
                            : "Click to upload images (first image will be primary)"}
                        </p>
                      </div>
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="price">Price (₦) *</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  required
                  value={formData.price}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, price: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="compareAtPrice">Compare At Price (₦)</Label>
                <Input
                  id="compareAtPrice"
                  type="number"
                  step="0.01"
                  value={formData.compareAtPrice}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      compareAtPrice: e.target.value,
                    }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  value={formData.sku}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, sku: e.target.value }))
                  }
                />
              </div>

              <div>
                <Label htmlFor="stock">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  required
                  value={formData.stock}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, stock: e.target.value }))
                  }
                />
              </div>

              <div className="col-span-2">
                <Label htmlFor="categoryId">Category *</Label>
                {categories.length === 0 && (
                  <p className="text-sm text-red-500 mb-2">
                    No categories found. Please create categories first.
                  </p>
                )}
                <select
                  id="categoryId"
                  required
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      categoryId: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {categories.length > 0 && (
                  <p className="text-sm text-green-600 mt-1">
                    Found {categories.length} categories
                  </p>
                )}
              </div>

              <div className="col-span-2">
                <Label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isActive: e.target.checked,
                      }))
                    }
                  />
                  Active (visible in shop)
                </Label>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Product"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
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
