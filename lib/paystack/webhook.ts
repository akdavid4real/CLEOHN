import crypto from "crypto";

export function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY!;
  const hash = crypto
    .createHmac("sha512", secretKey)
    .update(payload)
    .digest("hex");

  return hash === signature;
}

export interface PaystackWebhookEvent {
  event: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: Record<string, any>;
    fees?: number;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
  };
}

export function parseWebhookEvent(payload: string): PaystackWebhookEvent {
  return JSON.parse(payload);
}
