// Shared @wix/stores Catalog V3 product-fetching for the Shop listing (src/pages/shop.astro)
// and product detail (src/pages/shop/[slug].astro) pages — one source of truth so both stay
// in sync with the real catalog and with each other.
//
// searchProducts (not queryProducts) because it's the call that honors the `fields` option —
// queryProducts' builder has no fields chain, so plainDescription/formatted prices/category
// assignments (all gated behind fields per the API) never come back from it. Two positional
// args: `searchProducts(search, options)` — passing `{ fields }` as the first arg (the
// natural-looking mistake) silently lands it in `search` instead and every gated field comes
// back missing with no error.

import { getWixClient, wixImageUrl } from "./wixClient";

export interface ShopProduct {
  id: string;
  slug: string;
  name: string;
  desc: string;
  price: string;
  amount: number | null;
  compareAtPrice: string | null;
  ribbon: string | null;
  category: string;
  image: string | undefined;
  imageLabel: string;
}

// Editorial category grouping, keyed by slug — same situation as wixClient.ts's blog
// category/tag labels: a real taxonomy exists on this catalog (queried live via
// @wix/categories: "The VA Mastery Hub", "Wix Workshop", "Cards", "Monthly Planners",
// "Stickers", "All Products") but neither real product is assigned to anything beyond the
// default catalog-wide "All Products" category — showing that next to an "All" filter chip
// would be a redundant, meaningless choice (both chips would match the same 100% of
// products). Swap this for `directCategoriesInfo` once Danielle assigns real per-product
// categories in the dashboard; no other code needs to change when that happens.
const PRODUCT_CATEGORY: Record<string, string> = {
  "vhh-email-template-vault": "Templates",
  "vhh-content-vault": "Templates",
};

const stripHtml = (html: string | null | undefined) => (html ?? "").replace(/<[^>]+>/g, "").trim();

let cached: ShopProduct[] | null = null;

/** All visible products, full editorial shape. Memoized per server process — same lifetime
 * as getWixClient()'s own client instance; the catalog is small and shared across every
 * request in this build/process, no need to refetch per page. */
export async function getStoreProducts(): Promise<ShopProduct[]> {
  if (cached) return cached;

  const { products } = await getWixClient().productsV3.searchProducts(
    {},
    { fields: ["PLAIN_DESCRIPTION", "CURRENCY", "DIRECT_CATEGORIES_INFO"] }
  );

  const shaped: ShopProduct[] = (products ?? [])
    .map((p: (typeof products)[number]) => ({
      id: p._id!,
      slug: p.slug!,
      name: p.name ?? "",
      desc: stripHtml(p.plainDescription),
      price: p.actualPriceRange?.minValue?.formattedAmount ?? "",
      amount: p.actualPriceRange?.minValue?.amount != null ? Number(p.actualPriceRange.minValue.amount) : null,
      compareAtPrice: p.compareAtPriceRange?.minValue?.formattedAmount ?? null,
      ribbon: p.ribbon?.name ?? null,
      category: PRODUCT_CATEGORY[p.slug ?? ""] ?? "Templates",
      image: wixImageUrl(p.media?.main?.image),
      imageLabel: `${p.name} cover`,
    }))
    // Match the design's intended order (email vault, then content vault) regardless of
    // whatever order the API happens to return.
    .sort(
      (a: ShopProduct, b: ShopProduct) =>
        Object.keys(PRODUCT_CATEGORY).indexOf(a.slug) - Object.keys(PRODUCT_CATEGORY).indexOf(b.slug)
    );

  cached = shaped;
  return shaped;
}

export async function getStoreProductBySlug(slug: string): Promise<ShopProduct | null> {
  const all = await getStoreProducts();
  return all.find((p) => p.slug === slug) ?? null;
}
