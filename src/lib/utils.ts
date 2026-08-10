import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDoctorName(name: string | null | undefined): string {
  if (!name) return 'Dr. ';
  const cleaned = name.trim().replace(/^dr\.?\s*/i, '');
  return `Dr. ${cleaned}`;
}

export function stripDr(name: string | null | undefined): string {
  if (!name) return '';
  return name.trim().replace(/^dr\.?\s*/i, '');
}