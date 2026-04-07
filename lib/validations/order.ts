import { z } from "zod";

// Valid order statuses
export const orderStatusSchema = z.enum([
  "pending",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
]);

// Valid payment statuses
export const paymentStatusSchema = z.enum([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

// Order status update validation
export const updateOrderStatusSchema = z.object({
  status: orderStatusSchema,
});

export type OrderStatus = z.infer<typeof orderStatusSchema>;
export type PaymentStatus = z.infer<typeof paymentStatusSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
