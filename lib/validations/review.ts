import { z } from "zod";

export const reviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  customerName: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  customerEmail: z
    .string()
    .email("Invalid email address")
    .max(255, "Email must be less than 255 characters"),
  rating: z
    .number()
    .int("Rating must be an integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating must be at most 5"),
  reviewText: z
    .string()
    .min(10, "Review must be at least 10 characters")
    .max(1000, "Review must be less than 1000 characters"),
});

export type ReviewInput = z.infer<typeof reviewSchema>;

export const reviewModerationSchema = z.object({
  status: z.enum(["pending", "approved", "rejected"]),
});

export type ReviewModerationInput = z.infer<typeof reviewModerationSchema>;
