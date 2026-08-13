// Server/build-side Wix client — used from page frontmatter (top-level await), which
// Astro runs at build time for static output. This is a separate client from
// src/lib/wixForms.ts (browser-side): frontmatter can read the non-PUBLIC_ env var
// directly since it never ships to the client bundle.
//
// Reads WIX_DATA_CLIENT_ID (the EXISTING VHH site's Client ID), deliberately NOT named
// WIX_CLIENT_ID — the Wix-managed hosting adapter (build order step 8) generates its own
// reserved WIX_CLIENT_ID in .env.local for the *new* hosting project, and Vite loads
// .env.local with higher precedence than .env. A shared name would silently point this
// client at the wrong (empty) site instead of the real one.

import { createClient, OAuthStrategy } from "@wix/sdk";
import { posts, categories, tags } from "@wix/blog";
import { productsV3 } from "@wix/stores";

let client: ReturnType<typeof createClient> | null = null;

export function getWixClient() {
  const clientId = import.meta.env.WIX_DATA_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "WIX_DATA_CLIENT_ID is not set (see .env.example) — required to fetch blog/store content at build time."
    );
  }
  if (!client) {
    client = createClient({
      // productsV3, not the legacy V1 `products` module previously here — confirmed this
      // site's Wix Stores catalog is Catalog V3 (a V1 collections read throws "Endpoint
      // belongs to CATALOG_V1, but your site is using CATALOG_V3"). V1 product reads
      // happened to still return basic data, but silently omit plainDescription,
      // formatted prices, and category assignments on this catalog — V3 is the real,
      // correct source. See src/lib/wixProducts.ts.
      modules: { posts, productsV3, categories, tags },
      auth: OAuthStrategy({ clientId }),
    });
  }
  return client;
}

// Category/tag label lookups — Wix posts carry categoryIds/tagIds, not names, so the
// listing and post-detail pages need these to render "Marketing Strategies" instead of an
// opaque id. Memoized per server process (same lifetime as `client` above): both lists are
// small and shared across every page in a single build/request, no need to refetch per page.
let categoryMap: Map<string, string> | null = null;
let tagMap: Map<string, string> | null = null;

export async function getCategoryLabels(): Promise<Map<string, string>> {
  if (!categoryMap) {
    const { categories: items } = await getWixClient().categories.listCategories({ paging: { limit: 100 } });
    categoryMap = new Map((items ?? []).map((c: (typeof items)[number]) => [c._id!, c.label ?? ""]));
  }
  return categoryMap;
}

export async function getTagLabels(): Promise<Map<string, string>> {
  if (!tagMap) {
    const { items } = await getWixClient().tags.queryTags().find();
    tagMap = new Map((items ?? []).map((t: (typeof items)[number]) => [t._id!, t.label ?? ""]));
  }
  return tagMap;
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
