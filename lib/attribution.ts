export const ATTRIBUTION_PARAM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "campaign_id",
  "adset_id",
  "ad_id",
  "fbclid",
  "gclid",
  "ttclid",
] as const;

export type Attribution = Partial<
  Record<(typeof ATTRIBUTION_PARAM_KEYS)[number], string>
>;

const STORAGE_KEY = "cleohn:attribution";

export function pickAttribution(
  input: Record<string, unknown> | null | undefined
): Attribution {
  if (!input) return {};

  const attribution: Attribution = {};

  for (const key of ATTRIBUTION_PARAM_KEYS) {
    const value = input[key];
    if (typeof value === "string" && value.trim()) {
      attribution[key] = value.trim().slice(0, 255);
    }
  }

  return attribution;
}

export function storeAttribution(attribution: Attribution): void {
  if (typeof window === "undefined") return;
  if (Object.keys(attribution).length === 0) return;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
  } catch {
    // Storage can be unavailable (private mode), attribution is best-effort
  }
}

export function readStoredAttribution(): Attribution | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const attribution = pickAttribution(parsed);

    return Object.keys(attribution).length > 0 ? attribution : null;
  } catch {
    return null;
  }
}
