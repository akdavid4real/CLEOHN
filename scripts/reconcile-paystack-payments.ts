/**
 * Reconcile orders whose payment actually succeeded at Paystack but whose
 * `orders.payment_status` was never updated (e.g. the verify endpoint or the
 * webhook failed after Paystack captured the charge).
 *
 * Usage:
 *   npx tsx scripts/reconcile-paystack-payments.ts            # dry run (default)
 *   npx tsx scripts/reconcile-paystack-payments.ts --apply    # write changes
 *   npx tsx scripts/reconcile-paystack-payments.ts --order ORD-xxxx --apply
 *
 * Safety:
 *   - Only orders that are not already `paid` are considered.
 *   - The reference is re-verified directly with Paystack and must report
 *     `status === "success"` with an amount matching the order total.
 *   - Idempotent: a successful payment transaction is inserted only when one
 *     does not already exist, and stock is decremented only when this script
 *     transitions the order into `paid`.
 */
import { config } from "dotenv";
import path from "path";
config({ path: path.join(process.cwd(), ".env.local") });
config({ path: path.join(process.cwd(), ".env") });

import { neon } from "@neondatabase/serverless";
import crypto from "crypto";

const APPLY = process.argv.includes("--apply");
const orderFlagIndex = process.argv.indexOf("--order");
const ONLY_ORDER = orderFlagIndex !== -1 ? process.argv[orderFlagIndex + 1] : undefined;

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = "https://api.paystack.co";

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is required");
  process.exit(1);
}
if (!PAYSTACK_SECRET_KEY) {
  console.error("❌ PAYSTACK_SECRET_KEY is required");
  process.exit(1);
}

const sql = neon(process.env.DATABASE_URL);

function redact(text: string): string {
  return text.replace(/[\r\n\t]/g, " ").slice(0, 120);
}

function newId(): string {
  // Small dependency-free id; nanoid is also available but this keeps the
  // script runnable even before `bun install`.
  return crypto.randomBytes(16).toString("hex").slice(0, 21);
}

async function paystackVerify(reference: string): Promise<any> {
  const response = await fetch(
    `${PAYSTACK_BASE_URL}/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || `Paystack request failed (${response.status})`);
  }

  return data;
}

async function main() {
  console.log(
    `\n🔍 Reconciling Paystack payments (${APPLY ? "APPLY" : "DRY RUN"} mode)${
      ONLY_ORDER ? ` for order ${ONLY_ORDER}` : ""
    }\n`
  );

  const unconfirmed: any[] = await (ONLY_ORDER
    ? sql`
        SELECT id, order_number, total, status, payment_status
        FROM orders
        WHERE payment_status IS DISTINCT FROM 'paid'
          AND order_number = ${ONLY_ORDER}
        ORDER BY created_at DESC
      `
    : sql`
        SELECT id, order_number, total, status, payment_status
        FROM orders
        WHERE payment_status IS DISTINCT FROM 'paid'
        ORDER BY created_at DESC
      `);

  if (unconfirmed.length === 0) {
    console.log(
      ONLY_ORDER
        ? `✅ Order ${ONLY_ORDER} is not in the unconfirmed set (already paid, or not found).`
        : "✅ No unconfirmed orders found."
    );
    return;
  }

  console.log(`Found ${unconfirmed.length} order(s) not marked as paid. Checking Paystack...\n`);

  let reconciled = 0;
  let skipped = 0;
  let failed = 0;

  for (const order of unconfirmed) {
    const reference: string = order.order_number;
    let verification: any;

    try {
      verification = await paystackVerify(reference);
    } catch (error: any) {
      failed++;
      console.log(`⚠️  ${reference} — Paystack verify error: ${redact(String(error?.message))}`);
      continue;
    }

    const data = verification?.data;
    const paystackStatus = data?.status;

    if (verification?.status !== true || paystackStatus !== "success") {
      skipped++;
      console.log(
        `⏭️  ${reference} — Paystack status: ${redact(String(paystackStatus || "unknown"))} (no change needed)`
      );
      continue;
    }

    const paidAmount = Number(data.amount) / 100;
    if (Math.abs(paidAmount - Number(order.total)) > 0.01) {
      failed++;
      console.log(
        `❌ ${reference} — amount mismatch: order total ${order.total}, Paystack paid ${paidAmount}. Not touching it.`
      );
      continue;
    }

    const [existingTx] = (await sql`
      SELECT id FROM payment_transactions WHERE paystack_reference = ${reference} LIMIT 1
    `) as any[];

    const plan =
      `order ${order.status}→processing, payment pending→paid` +
      (existingTx ? ", transaction already recorded" : ", + record transaction") +
      ", - stock";

    if (!APPLY) {
      console.log(`✅ ${reference} — WOULD RECONCILE (${plan})`);
      reconciled++;
      continue;
    }

    // Only transition if still unpaid (guards against concurrent verify/webhook).
    const updated = (await sql`
      UPDATE orders
      SET payment_status = 'paid',
          status = 'processing',
          updated_at = NOW()
      WHERE id = ${order.id}
        AND payment_status IS DISTINCT FROM 'paid'
      RETURNING id
    `) as any[];

    if (updated.length === 0) {
      skipped++;
      console.log(`⏭️  ${reference} — already updated by another process`);
      continue;
    }

    if (!existingTx) {
      await sql`
        INSERT INTO payment_transactions (
          id, order_id, paystack_reference, amount, status, channel, currency, paid_at, metadata
        ) VALUES (
          ${newId()},
          ${order.id},
          ${data.reference || reference},
          ${paidAmount},
          'success',
          ${data.channel || null},
          ${data.currency || "NGN"},
          ${data.paid_at ? new Date(data.paid_at) : new Date()},
          ${JSON.stringify(data.metadata || {})}
        )
        ON CONFLICT (paystack_reference) DO NOTHING
      `;
    }

    // Decrement stock for order items backed by a product.
    const items = (await sql`
      SELECT product_id, quantity FROM order_items WHERE order_id = ${order.id}
    `) as any[];

    for (const item of items) {
      if (!item.product_id) continue;
      await sql`
        UPDATE products
        SET stock = GREATEST(COALESCE(stock, 0) - ${item.quantity}, 0)
        WHERE id = ${item.product_id}
      `;
    }

    reconciled++;
    console.log(`✅ ${reference} — RECONCILED (${plan})`);
  }

  console.log(
    `\nSummary: ${reconciled} ${APPLY ? "reconciled" : "would reconcile"}, ${skipped} skipped, ${failed} failed.` +
      (APPLY ? "" : "\nRe-run with --apply to write these changes.")
  );
}

main().catch((error) => {
  console.error("Reconciliation script failed:", error);
  process.exit(1);
});
