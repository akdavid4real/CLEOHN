import { customAlphabet } from "nanoid";

/**
 * Order number / Paystack reference generation.
 *
 * Format: CLE-YYYYMMDD-0001
 *   CLE       – shop prefix
 *   YYYYMMDD  – date the order was placed, in the shop's business timezone
 *   0001      – daily sequence, zero padded
 *
 * The order number is also sent to Paystack as the transaction `reference`, so
 * it is deliberately restricted to uppercase letters, digits and hyphens.
 * Paystack reference rules allow only `-`, `.`, `=` and alphanumerics.
 *
 * Order numbers are NOT a security boundary: they are shown to customers and
 * printed on receipts. Access control for order data is enforced in the admin
 * API routes (session/role checks), not by keeping order numbers secret.
 */

/** Shop's business timezone. Orders must not roll over at UTC midnight. */
export const BUSINESS_TIMEZONE = "Africa/Lagos";

export const ORDER_PREFIX = "CLE";

/** Sequential part width, e.g. 0001. Supports 9,999 orders per day. */
const SEQUENCE_WIDTH = 4;

const DATE_PATTERN = /^\d{8}$/;

/**
 * Returns the current business date as YYYYMMDD.
 * Uses Intl so the result does not depend on the server's local timezone
 * (Vercel serverless functions default to UTC).
 */
export function getBusinessDateString(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: BUSINESS_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);

  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? "";

  return `${get("year")}${get("month")}${get("day")}`;
}

/** Builds a human-readable order number from a date string and sequence. */
export function formatOrderNumber(dateString: string, sequence: number): string {
  if (!DATE_PATTERN.test(dateString)) {
    throw new Error(`Invalid business date format: ${dateString}`);
  }
  if (!Number.isInteger(sequence) || sequence < 1) {
    throw new Error(`Invalid order sequence: ${sequence}`);
  }

  return `${ORDER_PREFIX}-${dateString}-${String(sequence).padStart(SEQUENCE_WIDTH, "0")}`;
}

/** Parses an order number back into its date and sequence parts. */
export function parseOrderNumber(
  orderNumber: string
): { dateString: string; sequence: number } | null {
  const match = new RegExp(
    `^${ORDER_PREFIX}-(\\d{8})-(\\d{${SEQUENCE_WIDTH},})$`
  ).exec(orderNumber);

  if (!match) return null;

  return {
    dateString: match[1],
    sequence: Number.parseInt(match[2], 10),
  };
}

/** SQL LIKE prefix used to find all orders for one business day. */
export function orderNumberPrefixForDate(dateString: string): string {
  return `${ORDER_PREFIX}-${dateString}-`;
}

/**
 * Fallback used only if the database sequence lookup fails unexpectedly. The
 * order still gets a valid, unique-enough readable number instead of the whole
 * checkout failing.
 */
const fallbackSuffix = customAlphabet("0123456789ABCDEFGHJKLMNPQRSTUVWXYZ", 4);

export function generateFallbackOrderNumber(now: Date = new Date()): string {
  return `${ORDER_PREFIX}-${getBusinessDateString(now)}-${fallbackSuffix()}`;
}
