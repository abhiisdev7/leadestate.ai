export function extractEmail(addr: string): string {
  const match = addr.match(/<([^>]+)>/);
  return match ? match[1]!.trim().toLowerCase() : addr.trim().toLowerCase();
}

export function parseNameAndEmail(addr: string): { name: string; email: string } {
  const email = extractEmail(addr);
  const match = addr.match(/^([^<]+)</);
  const name = match ? match[1]!.trim() : email.split("@")[0] ?? "Unknown";
  return { name, email };
}
