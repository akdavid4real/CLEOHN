"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ReviewModerator } from "@/components/admin/review-moderator";
import { Loader2 } from "lucide-react";

interface Review {
  id: string;
  productId: string;
  productName: string | null;
  customerName: string;
  customerEmail: string;
  rating: number;
  reviewText: string;
  status: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const [allResponse, pendingResponse] = await Promise.all([
        fetch("/api/admin/reviews"),
        fetch("/api/admin/reviews?status=pending"),
      ]);

      if (allResponse.ok) {
        const data = await allResponse.json();
        setAllReviews(data.reviews);
      }

      if (pendingResponse.ok) {
        const data = await pendingResponse.json();
        setPendingReviews(data.reviews);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Reviews</h1>
        <p className="text-muted-foreground">
          Moderate and manage customer reviews
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Moderation</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({pendingReviews.length})
              </TabsTrigger>
              <TabsTrigger value="all">All Reviews ({allReviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="pending" className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ReviewModerator
                  reviews={pendingReviews}
                  onUpdate={fetchReviews}
                />
              )}
            </TabsContent>

            <TabsContent value="all" className="mt-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ReviewModerator reviews={allReviews} onUpdate={fetchReviews} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
