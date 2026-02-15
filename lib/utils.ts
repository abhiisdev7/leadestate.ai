import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Format date/time for display. Accepts ISO string or Date. */
export function formatDateTime(value: string | Date): string {
  if (value instanceof Date) return value.toLocaleString()
  const d = new Date(value)
  return isNaN(d.getTime()) ? String(value) : d.toLocaleString()
}

/** Format date+time from separate strings (e.g. "2025-02-18" + "2:00 PM"). */
export function formatDateTimeParts(dateStr: string, timeStr: string): string {
  const iso = `${dateStr}T${timeStr}`
  const d = new Date(iso)
  if (!isNaN(d.getTime())) return d.toLocaleString()
  const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (match) {
    let h = parseInt(match[1]!, 10)
    const m = parseInt(match[2]!, 10)
    const pm = match[3]!.toUpperCase() === "PM"
    if (pm && h !== 12) h += 12
    if (!pm && h === 12) h = 0
    const d2 = new Date(dateStr)
    d2.setHours(h, m, 0, 0)
    return d2.toLocaleString()
  }
  return `${dateStr} at ${timeStr}`
}
