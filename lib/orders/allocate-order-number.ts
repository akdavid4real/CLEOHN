import { db } from "@/lib/db/client";
import { orders } from "@/lib/db/schema";
import { like, sql } from "drizzle-orm";
import {
  formatOrderNumber,
  generateFallbackOrderNumber,
  getBusinessDateString,
  orderNumberPrefixForDate,
} from "./order-number";

/** How many times to re-roll the sequence if another order takes the number. */
const MAX_SEQUENCE_ATTEMPTS = 5;

/**
 * Finds the highest sequence already used for a business date.
 * Matches only well-formed `CLE-YYYYMMDD-NNNN` rows so legacy random order
 * numbers (e.g. `ORD-hAwZa6ftHYM0`) can never break the parse.
 */
async function getHighestSequence(dateString: string): Promise<number> {
  const prefix = orderNumberPrefixForDate(dateString);

  const [row] = await db
    .select({
      maxSequence: sql<number>`COALESCE(MAX(
        CASE
          WHEN ${orders.orderNumber} ~ ${`^${prefix.replace(/[-]/g, "\\-")}[0-9]+$`}
          THEN CAST(SUBSTRING(${orders.orderNumber} FROM ${prefix.length + 1}) AS INTEGER)
          ELSE 0
        END
      ), 0)`,
    })
    .from(orders)
    .where(like(orders.orderNumber, `${prefix}%`));

  return Number(row?.maxSequence ?? 0);
}

/**
 * Allocates the next readable order number for today, e.g. `CLE-20261110-0001`.
 *
 * Uniqueness is ultimately guaranteed by the `order_number` UNIQUE constraint;
 * this function only proposes the number and retries with the next sequence
 * when an insert collides.
 */
export function createOrderNumberAllocator(now: Date = new Date()) {
  const dateString = getBusinessDateString(now);
  let nextSequence: number | null = null;

  return {
    dateString,

    /**
     * Returns the next candidate order number. Each call advances the
     * sequence, so simply calling it again after a unique-constraint
     * collision yields the following number.
     */
    async next(): Promise<string> {
      if (nextSequence === null) {
        try {
          nextSequence = (await getHighestSequence(dateString)) + 1;
        } catch (error) {
          console.error("Failed to compute order sequence, using fallback:", error);
          return generateFallbackOrderNumber(now);
        }
      }

      return formatOrderNumber(dateString, nextSequence++);
    },
  };
}

export type OrderNumberAllocator = ReturnType<typeof createOrderNumberAllocator>;

export { MAX_SEQUENCE_ATTEMPTS };
