import { assetUrl, createClient, type ListOptions, type MapledRecord } from "@mapled/next";
import type { MapledSchema } from "@/mapled-types";

const key = process.env.MAPLED_KEY;
if (!key) {
  throw new Error(
    "MAPLED_KEY is not set. Copy .env.example to .env.local and paste the delivery key from Mapled: project settings → Integrations → Your site.",
  );
}

/** The delivery key: published content only, safe on the server and in the browser. */
export const deliveryKey: string = key;

/** Unset in your site: the client reads https://api.mapled.io. */
export const apiUrl = process.env.MAPLED_API_URL || undefined;

/** One client for the whole site, typed by mapled-types.ts. */
export const mapled = createClient<MapledSchema>({ key: deliveryKey, apiUrl });

/** An image field's value is an asset id: this is its URL, resized on Mapled's side. */
export function imageUrl(id: string, width: number): string {
  return assetUrl(id, { width, apiUrl });
}

/** A one-to-one relation attached with `expand`, or null. */
export function linked<T>(record: MapledRecord<unknown>, field: string): MapledRecord<T> | null {
  const value = record.expanded?.[field];
  return value && !Array.isArray(value) ? (value as MapledRecord<T>) : null;
}

/** A one-to-many relation attached with `expand`. */
export function linkedList<T>(record: MapledRecord<unknown>, field: string): MapledRecord<T>[] {
  const value = record.expanded?.[field];
  return Array.isArray(value) ? (value as MapledRecord<T>[]) : [];
}

/** "2026-01-12" → "January 12, 2026". */
export function formatDate(date: string | null | undefined): string | null {
  if (!date) return null;
  const parsed = new Date(`${date.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

/** Every post the filter matches, newest first, with its author and categories. A list answers at most
    100 records: this reads on, from the same release, until it has them all. */
export async function allPosts(filter: ListOptions["filter"]) {
  const options = { filter, sort: "-published-on", expand: ["author", "categories"], limit: 100 };
  const first = await mapled.getRecords("posts", options);
  const posts = [...first.records];
  while (posts.length < first.total) {
    const next = await mapled.getRecords("posts", { ...options, offset: posts.length, release: first.release });
    if (next.records.length === 0) break;
    posts.push(...next.records);
  }
  return posts;
}
