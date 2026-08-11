// One-off verification script — build order step 2.
//
// Confirms the Wix SDK can read REAL data (a blog post, a product) from the
// client's existing live site, using only the headless Client ID (anonymous
// visitor auth — no login required for public content).
//
// Run with: npm run verify:wix

import { createClient, OAuthStrategy } from "@wix/sdk";
import { posts } from "@wix/blog";
import { products } from "@wix/stores";

// WIX_DATA_CLIENT_ID, not WIX_CLIENT_ID — the Wix-managed hosting adapter (build order
// step 8) reserves that name for the new hosting project's own client in .env.local.
const clientId = process.env.WIX_DATA_CLIENT_ID;

if (!clientId) {
  console.error(
    "✗ WIX_DATA_CLIENT_ID is not set. Add it to .env (see .env.example) and re-run with:\n" +
      "  node --env-file=.env scripts/verify-wix.mjs"
  );
  process.exit(1);
}

const wixClient = createClient({
  modules: { posts, products },
  auth: OAuthStrategy({ clientId }),
});

let failed = false;

console.log(`Using WIX_DATA_CLIENT_ID: ${clientId.slice(0, 8)}…`);

console.log("\n— Fetching a blog post (@wix/blog) —");
try {
  const result = await wixClient.posts.queryPosts().limit(1).find();
  const post = result.items[0];
  if (!post) {
    console.warn("⚠ No blog posts returned. The site may have none, or they're unpublished.");
  } else {
    console.log("✓ Got a real post:");
    console.log({
      id: post._id,
      title: post.title,
      slug: post.slug,
      firstPublishedDate: post.firstPublishedDate,
    });
  }
} catch (err) {
  failed = true;
  console.error("✗ Failed to fetch blog posts:", err?.message ?? err);
}

console.log("\n— Fetching a product (@wix/stores) —");
try {
  const result = await wixClient.products.queryProducts().limit(1).find();
  const product = result.items[0];
  if (!product) {
    console.warn("⚠ No products returned. The store may be empty, or products aren't visible.");
  } else {
    console.log("✓ Got a real product:");
    console.log({
      id: product._id,
      name: product.name,
      slug: product.slug,
      price: product.priceData?.formatted?.price,
    });
  }
} catch (err) {
  failed = true;
  console.error("✗ Failed to fetch products:", err?.message ?? err);
}

console.log();
if (failed) {
  console.error("✗ Verification FAILED — stop and fix before building any UI.");
  process.exit(1);
} else {
  console.log("✓ Verification passed — SDK reads real data from the existing site.");
}
