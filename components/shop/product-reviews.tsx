"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { StarRatingDisplay } from "./star-rating";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";

interface Review {
  id: string;
  customerName: string;
  rating: number;
  reviewText: string;
  createdAt: string;
}

interface ProductReviewsProps {
  productId: string;
}

export function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({ average: 0, count: 0 });

  useEffect(() => {
    fetchReviews();
  }, [productId]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/products/${productId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      {stats.count > 0 && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold">{stats.average.toFixed(1)}</div>
                <StarRatingDisplay rating={stats.average} showValue={false} size="md" />
                <p className="text-sm text-muted-foreground mt-1">
                  {stats.count} {stats.count === 1 ? "review" : "reviews"}
                </p>
              </div>
              <Separator orientation="vertical" className="h-20" />
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">
                  Based on {stats.count} customer {stats.count === 1 ? "review" : "reviews"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              No reviews yet. Be the first to review this product!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold">{review.customerName}</p>
                    <StarRatingDisplay
                      rating={review.rating}
                      showValue={false}
                      size="sm"
                    />
                  </div>
                  <time className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(review.createdAt), {
                      addSuffix: true,
                    })}
                  </time>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {review.reviewText}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
