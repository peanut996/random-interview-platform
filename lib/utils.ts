import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function cleanupJsonResponse(text: string): string {
  return text.replace(/^```json\s*|```$/g, '').trim();
}

