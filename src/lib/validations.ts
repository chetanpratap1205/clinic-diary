export function isValidIndianMobileNumber(phone: string): boolean {
  // Must be exactly 10 digits and start with 6, 7, 8, or 9
  if (!/^[6-9]\d{9}$/.test(phone)) {
    return false;
  }

  // Prevent common dummy numbers
  const dummyNumbers = [
    "9999999999",
    "8888888888",
    "7777777777",
    "6666666666",
    "9876543210",
    "9876543211",
    "8765432109",
    "6789012345",
  ];

  if (dummyNumbers.includes(phone)) {
    return false;
  }

  // Prevent repetitive numbers (e.g., 9000000000, 9888888888)
  // Rejects if the same digit appears 7 or more times consecutively
  if (/(.)\1{6,}/.test(phone)) {
    return false;
  }

  return true;
}
