import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function parseGeoCountries(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((c): c is string => typeof c === "string");
  } catch {
    return [];
  }
}

export function generatePublicKey(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return `cko_${Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("")}`;
}
