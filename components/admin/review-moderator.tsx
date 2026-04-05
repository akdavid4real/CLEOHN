"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRatingDisplay } from "@/components/shop/star-rating";
import { CheckCircle, XCircle, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

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

interface ReviewModeratorProps {
  reviews: Review[];
  onUpdate: () => void;
}

export function ReviewModerator({ reviews, onUpdate }: ReviewModeratorProps) {
  const handleApprove = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (response.ok) {
        toast.success("Review approved");
        onUpdate();
      } else {
        toast.error("Failed to approve review");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (response.ok) {
        toast.success("Review rejected");
        onUpdate();
      } else {
        toast.error("Failed to reject review");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reviews/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Review deleted");
        onUpdate();
      } else {
        toast.error("Failed to delete review");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejected</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (reviews.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reviews to moderate
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <div
          key={review.id}
          className="bg-card border rounded-lg p-6 space-y-4"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold">{review.productName || "Unknown Product"}</h3>
                {getStatusBadge(review.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                by {review.customerName} ({review.customerEmail})
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(review.createdAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <StarRatingDisplay rating={review.rating} showValue={false} />
          </div>

          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
            {review.reviewText}
          </p>

          <div className="flex items-center gap-2 pt-2">
            {review.status === "pending" && (
              <>
                <Button
                  size="sm"
                  onClick={() => handleApprove(review.id)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Approve
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleReject(review.id)}
                  className="border-red-600 text-red-600 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  Reject
                </Button>
              </>
            )}
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(review.id)}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
