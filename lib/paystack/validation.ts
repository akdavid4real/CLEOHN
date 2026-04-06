// Input validation utilities for payment processing
export function sanitizeString(input: string, maxLength: number = 255): string {
  return input
    .replace(/[<>\"'&\r\n\t]/g, '') // Remove potentially dangerous characters
    .substring(0, maxLength)
    .trim();
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 254;
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,15}$/;
  return phoneRegex.test(phone);
}

export function validateAmount(amount: number): boolean {
  return Number.isFinite(amount) && amount > 0 && amount <= 10000000; // Max 10M NGN
}

export function validateReference(reference: string): boolean {
  const refRegex = /^[A-Za-z0-9\-_]{1,50}$/;
  return refRegex.test(reference);
}

export function sanitizeMetadata(metadata: Record<string, any>): Record<string, string> {
  const sanitized: Record<string, string> = {};
  
  Object.entries(metadata).forEach(([key, value]) => {
    if (typeof key === 'string' && key.length <= 50) {
      const sanitizedKey = sanitizeString(key, 50);
      const sanitizedValue = sanitizeString(String(value), 255);
      if (sanitizedKey && sanitizedValue) {
        sanitized[sanitizedKey] = sanitizedValue;
      }
    }
  });
  
  return sanitized;
}