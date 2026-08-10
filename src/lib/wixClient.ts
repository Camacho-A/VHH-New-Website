// Server/build-side Wix client — used from page frontmatter (top-level await), which
// Astro runs at build time for static output. This is a separate client from
// src/lib/wixForms.ts (browser-side): frontmatter can read the non-PUBLIC_ env var
// directly since it never ships to the client bundle.

import { createClient, OAuthStrategy } from "@wix/sdk";
import { posts } from "@wix/blog";
import { products } from "@wix/stores";

let client: ReturnType<typeof createClient> | null = null;

export function getWixClient() {
  const clientId = import.meta.env.WIX_CLIENT_ID;
  if (!clientId) {
    throw new Error("WIX_CLIENT_ID is not set (see .env.example) — required to fetch blog/store content at build time.");
  }
  if (!client) {
    client = createClient({
      modules: { posts, products },
      auth: OAuthStrategy({ clientId }),
    });
  }
  return client;
}

/** Converts a Wix media ref to a real, directly loadable static.wixstatic.com URL.
 * Format is "wix:image://v1/<fileId>#originWidth=..." or, when the asset has a
 * human-readable name, "wix:image://v1/<fileId>/<friendly-name>.jpg#originWidth=..." —
 * only the fileId (up to the first "/" or "#") is a valid static.wixstatic.com path;
 * including the friendly-name segment 404s. Returns undefined if the ref is missing or
 * unrecognized (callers should fall back to an ImagePlate placeholder in that case). */
export function wixImageUrl(wixMediaRef: string | null | undefined): string | undefined {
  if (!wixMediaRef) return undefined;
  const match = wixMediaRef.match(/^wix:image:\/\/v1\/([^/#]+)/);
  return match ? `https://static.wixstatic.com/media/${match[1]}` : undefined;
}

/** "November 12, 2025" */
export function formatPostDate(iso: string | null | undefined): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}
