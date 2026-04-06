"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { DeleteConfirmModal } from "@/components/admin/delete-confirm-modal";

interface Category {
  id: string;
  name: string;
}

interface ProductImage {
  id: string;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  order: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  sku: string | null;
  stock: number;
  categoryId: string;
  isActive: boolean;
  images: ProductImage[];
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; imageId: string | null }>({ 
    open: false, 
    imageId: null 
  });
  const [isDeletingImage, setIsDeletingImage] = useState(false);
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
    fetchProduct();
  }, [productId]);

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

  const fetchProduct = async () => {
    try {
      console.log('[Edit] Fetching product:', productId);
      const response = await fetch(`/api/admin/products/${productId}`, {
        cache: 'no-store',
      });
      
      console.log('[Edit] Response status:', response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Edit] Product data:', data);
        const product = data.product;
        
        if (!product) {
          toast.error('Product not found');
          router.push('/admin/products');
          return;
        }
        
        setFormData({
          name: product.name || '',
          slug: product.slug || '',
          description: product.description || "",
          price: product.price?.toString() || '',
          compareAtPrice: product.compareAtPrice?.toString() || "",
          sku: product.sku || "",
          stock: product.stock?.toString() || '0',
          categoryId: product.categoryId || '',
          isActive: product.isActive ?? true,
        });
        setProductImages(product.images || []);
      } else {
        const error = await response.json();
        console.error('[Edit] Failed to fetch product:', error);
        toast.error('Failed to load product');
        router.push('/admin/products');
      }
    } catch (error) {
      console.error("[Edit] Failed to fetch product:", error);
      toast.error("Failed to load product");
      router.push('/admin/products');
    } finally {
      setIsLoading(false);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    console.log('[Client] Starting image upload:', file.name, file.type, file.size);

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('[Client] Invalid file type:', file.type);
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      console.error('[Client] File too large:', file.size);
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingImage(true);

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);

      console.log('[Client] Sending to /api/admin/upload');
      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      console.log('[Client] Upload response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('[Client] Upload successful:', data.secure_url);
        
        // Add image to product
        console.log('[Client] Adding image to product:', productId);
        const addImageResponse = await fetch(`/api/admin/products/${productId}/images`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageUrl: data.secure_url,
            altText: formData.name,
            isPrimary: productImages.length === 0,
          }),
        });

        console.log('[Client] Add image response status:', addImageResponse.status);

        if (addImageResponse.ok) {
          const newImage = await addImageResponse.json();
          console.log('[Client] Image added successfully:', newImage);
          setProductImages(prev => [...prev, newImage]);
          toast.success('Image uploaded successfully');
        } else {
          const errorData = await addImageResponse.json();
          console.error('[Client] Failed to add image:', errorData);
          toast.error('Failed to save image');
        }
      } else {
        const error = await response.json();
        console.error('[Client] Upload failed:', error);
        toast.error(error.error || 'Failed to upload image');
      }
    } catch (error) {
      console.error('[Client] Image upload error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploadingImage(false);
      e.target.value = '';
    }
  };

  const handleDeleteImage = async () => {
    if (!deleteModal.imageId) return;

    const imageId = deleteModal.imageId;
    console.log('[Client] Deleting image:', imageId);
    
    setIsDeletingImage(true);
    
    // Optimistically update UI
    const previousImages = productImages;
    setProductImages(prev => prev.filter(img => img.id !== imageId));
    setDeleteModal({ open: false, imageId: null });
    toast.success('Image deleted successfully');
    
    try {
      const response = await fetch(`/api/admin/products/${productId}/images/${imageId}`, {
        method: 'DELETE',
      });

      console.log('[Client] Delete response status:', response.status);

      if (!response.ok) {
        // Revert on error
        setProductImages(previousImages);
        const error = await response.json();
        console.error('[Client] Delete failed:', error);
        toast.error('Failed to delete image');
      }
    } catch (error) {
      // Revert on error
      setProductImages(previousImages);
      console.error('[Client] Delete error:', error);
      toast.error('Failed to delete image');
    } finally {
      setIsDeletingImage(false);
    }
  };

  const handleSetPrimaryImage = async (imageId: string) => {
    console.log('[Client] Setting primary image:', imageId);
    
    // Optimistically update UI
    const previousImages = productImages;
    setProductImages(prev => 
      prev.map(img => ({ ...img, isPrimary: img.id === imageId }))
    );
    
    try {
      const response = await fetch(`/api/admin/products/${productId}/images/${imageId}/primary`, {
        method: 'PATCH',
      });

      console.log('[Client] Set primary response status:', response.status);

      if (response.ok) {
        toast.success('Primary image updated');
      } else {
        // Revert on error
        setProductImages(previousImages);
        const error = await response.json();
        console.error('[Client] Set primary failed:', error);
        toast.error('Failed to update primary image');
      }
    } catch (error) {
      // Revert on error
      setProductImages(previousImages);
      console.error('[Client] Set primary error:', error);
      toast.error('Failed to update primary image');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: "PATCH",
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

      if (response.ok) {
        toast.success("Product updated successfully");
        router.push("/admin/products");
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to update product");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Product</h1>
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
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
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

      {/* Product Images */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Product Images
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Upload Button */}
            <div>
              <Label htmlFor="image-upload" className="cursor-pointer">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {isUploadingImage ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm font-medium">Click to upload image</span>
                      <span className="text-xs text-gray-500">PNG, JPG, WebP up to 5MB</span>
                    </div>
                  )}
                </div>
              </Label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={isUploadingImage}
              />
            </div>

            {/* Image Grid */}
            {productImages.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {productImages.map((image) => (
                  <div key={image.id} className="relative">
                    <div className="aspect-square relative overflow-hidden rounded-lg border">
                      <Image
                        src={image.imageUrl}
                        alt={image.altText || 'Product image'}
                        fill
                        className="object-cover"
                      />
                      {image.isPrimary && (
                        <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          Primary
                        </div>
                      )}
                    </div>
                    
                    {/* Image Actions - Always Visible */}
                    <div className="absolute top-2 right-2 flex gap-1">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => setDeleteModal({ open: true, imageId: image.id })}
                        className="h-8 w-8 p-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    {!image.isPrimary && (
                      <div className="absolute bottom-2 left-2 right-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleSetPrimaryImage(image.id)}
                          className="w-full text-xs"
                        >
                          Set Primary
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {productImages.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No images uploaded yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <DeleteConfirmModal
        open={deleteModal.open}
        onOpenChange={(open) => setDeleteModal({ open, imageId: null })}
        onConfirm={handleDeleteImage}
        title="Delete Image"
        description="Are you sure you want to delete this image? This action cannot be undone."
        isDeleting={isDeletingImage}
      />
    </div>
  );
}
