"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StarRating } from "./star-rating";
import { toast } from "sonner";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    reviewText: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          ...formData,
        }),
      });

      if (response.ok) {
        toast.success("Review submitted successfully! It will be visible after approval.");
        setFormData({
          customerName: "",
          customerEmail: "",
          reviewText: "",
        });
        setRating(5);
        onSuccess?.();
      } else {
        const data = await response.json();
        toast.error(data.error || "Failed to submit review");
      }
    } catch (error) {
      toast.error("An error occurred while submitting your review");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Write a Review</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Your Rating *</Label>
            <div className="mt-2">
              <StarRating
                rating={rating}
                interactive
                onRatingChange={setRating}
                size="lg"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="customerName">Your Name *</Label>
            <Input
              id="customerName"
              required
              value={formData.customerName}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, customerName: e.target.value }))
              }
            />
          </div>

          <div>
            <Label htmlFor="customerEmail">Your Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              required
              value={formData.customerEmail}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, customerEmail: e.target.value }))
              }
            />
            <p className="text-xs text-muted-foreground mt-1">
              Your email will not be published
            </p>
          </div>

          <div>
            <Label htmlFor="reviewText">Your Review *</Label>
            <Textarea
              id="reviewText"
              required
              rows={4}
              minLength={10}
              maxLength={1000}
              value={formData.reviewText}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, reviewText: e.target.value }))
              }
              placeholder="Tell us about your experience with this product..."
            />
            <p className="text-xs text-muted-foreground mt-1">
              {formData.reviewText.length}/1000 characters
            </p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Submitting..." : "Submit Review"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
