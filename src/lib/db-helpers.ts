// SQLite stores arrays as comma-separated strings and objects as JSON strings.
// These helpers handle serialization/deserialization.

export function parseLanguages(raw: string | string[] | null): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return raw.split(",").filter(Boolean);
}

export function serializeLanguages(languages: string[]): string {
  return languages.join(",");
}

export function parsePhotos(raw: string | string[] | null): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function serializePhotos(photos: string[]): string {
  return JSON.stringify(photos);
}

export function parseAvailability(raw: string | object | null): Record<string, boolean> {
  if (!raw) return {};
  if (typeof raw === "object") return raw as Record<string, boolean>;
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function serializeAvailability(availability: Record<string, boolean>): string {
  return JSON.stringify(availability);
}
