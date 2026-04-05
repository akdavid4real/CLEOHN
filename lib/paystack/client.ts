export const paystackConfig = {
  secretKey: process.env.PAYSTACK_SECRET_KEY!,
  publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
  baseUrl: "https://api.paystack.co",
};

export async function paystackFetch(
  endpoint: string,
  options: RequestInit = {}
) {
  const url = `${paystackConfig.baseUrl}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${paystackConfig.secretKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Paystack request failed");
  }

  return data;
}
