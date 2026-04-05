import { paystackFetch } from "./client";
import { nanoid } from "nanoid";

export interface InitializePaymentParams {
  email: string;
  amount: number; // in kobo (NGN)
  reference?: string;
  callbackUrl?: string;
  metadata?: Record<string, any>;
}

export interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export async function initializePayment(
  params: InitializePaymentParams
): Promise<PaystackInitializeResponse> {
  const reference = params.reference || `CLEOHN-${nanoid(16)}`;

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const callbackUrl = params.callbackUrl || `${baseUrl}/api/checkout/verify`;

  const response = await paystackFetch("/transaction/initialize", {
    method: "POST",
    body: JSON.stringify({
      email: params.email,
      amount: params.amount,
      reference,
      callback_url: callbackUrl,
      metadata: params.metadata || {},
    }),
  });

  return response as PaystackInitializeResponse;
}
