/**
 * Utility functions for Indian phone number sanitization, comparison, and WhatsApp link generation.
 * Ensures consistent behavior across 10-digit, +91, 91, and leading zero formats.
 */

/**
 * Extracts clean 10-digit Indian mobile number from any raw input string.
 * Examples:
 *   "+91 98765 43210" -> "9876543210"
 *   "919876543210"    -> "9876543210"
 *   "09876543210"     -> "9876543210"
 *   "9876543210"      -> "9876543210"
 */
export function get10DigitMobile(phone?: string | null): string {
  if (!phone) return "";
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  if (digits.length >= 10) {
    return digits.slice(-10);
  }
  return digits;
}

/**
 * Formats a phone number for WhatsApp wa.me links (country code 91 + 10 digits).
 * Output example: "919876543210"
 */
export function formatWhatsAppPhone(phone?: string | null): string {
  const tenDigit = get10DigitMobile(phone);
  if (!tenDigit || tenDigit.length !== 10) return "";
  return `91${tenDigit}`;
}

/**
 * Checks if two phone number strings represent the same 10-digit Indian mobile number.
 */
export function matchIndianPhones(phoneA?: string | null, phoneB?: string | null): boolean {
  const a = get10DigitMobile(phoneA);
  const b = get10DigitMobile(phoneB);
  if (!a || !b) return false;
  return a === b;
}
