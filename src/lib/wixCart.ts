// Browser-side @wix/ecom cart + checkout for the Shop page.
//
// Same pattern as src/lib/wixForms.ts: runs client-side, using the same anonymous visitor
// OAuthStrategy as @wix/blog and @wix/stores already use. The Client ID is a public,
// browser-safe identifier by design.
//
// Wix's cart is per-visitor and server-side (tracked via a cookie the SDK manages), so
// "add to cart" / "view cart" work correctly across page loads without us storing anything
// ourselves — getCart() below always reflects the same cart a checkout redirect will use.

import { createClient, OAuthStrategy } from "@wix/sdk";
import { currentCart } from "@wix/ecom";
import { redirects } from "@wix/redirects";

// The Wix Stores app's id, required inside every cart line item's catalogReference so the
// cart knows which catalog a product belongs to. Not project-specific — same value for every
// Wix site's Stores catalog. (Not to be confused with the Stores app *definition* id used for
// checking whether the app is installed — a different value, irrelevant here.)
const STORES_APP_ID = "215238eb-22a5-4c36-9e7b-e7c08025e04e";

export class WixCartConfigError extends Error {}

export interface CartLine {
  lineItemId: string;
  name: string;
  quantity: number;
  lineTotal: string;
}

export interface CartSummary {
  lines: CartLine[];
  count: number;
  subtotal: string;
}

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  const clientId = import.meta.env.PUBLIC_WIX_DATA_CLIENT_ID;
  if (!clientId) {
    throw new WixCartConfigError("PUBLIC_WIX_DATA_CLIENT_ID is not set (see .env.example)");
  }
  if (!client) {
    client = createClient({
      modules: { currentCart, redirects },
      auth: OAuthStrategy({ clientId }),
    });
  }
  return client;
}

// A trimmed-down shape of @wix/ecom's Cart/LineItem — only the fields read below. The
// client-bound SDK method (getClient().currentCart.getCurrentCart()) resolves to an SDK
// wrapper type that doesn't line up with the standalone module's exported function type,
// so this is typed by hand rather than derived from the SDK via typeof/ReturnType.
interface CartLineItemLike {
  _id?: string | null;
  quantity?: number;
  productName?: { original?: string };
  price?: { amount?: string };
  lineItemPrice?: { formattedAmount?: string };
}
interface CartLike {
  lineItems?: CartLineItemLike[];
}

function summarize(cart: CartLike | null | undefined): CartSummary {
  const lines: CartLine[] = (cart?.lineItems ?? []).map((l: CartLineItemLike) => ({
    lineItemId: l._id ?? "",
    name: l.productName?.original ?? "",
    quantity: l.quantity ?? 0,
    // lineItemPrice is the line's total after discounts (price × quantity, pre-computed by
    // Wix) — falls back to a manual price×quantity only if that field is ever missing.
    lineTotal:
      l.lineItemPrice?.formattedAmount ??
      (l.price?.amount ? `$${(Number(l.price.amount) * (l.quantity ?? 0)).toFixed(2)}` : ""),
  }));
  const count = lines.reduce((sum, l) => sum + l.quantity, 0);
  const subtotalAmount = (cart?.lineItems ?? []).reduce(
    (sum: number, l: CartLineItemLike) => sum + Number(l.price?.amount ?? 0) * (l.quantity ?? 0),
    0
  );
  return { lines, count, subtotal: `$${subtotalAmount.toFixed(2)}` };
}

/** Reads the current visitor's cart. Returns an empty summary (not an error) if no cart
 * exists yet — that's the normal state for a first-time visitor, not a failure. */
export async function getCart(): Promise<CartSummary> {
  try {
    const cart = await getClient().currentCart.getCurrentCart();
    return summarize(cart);
  } catch {
    return { lines: [], count: 0, subtotal: "$0.00" };
  }
}

export async function addToCart(productId: string, quantity = 1): Promise<CartSummary> {
  const { cart } = await getClient().currentCart.addToCurrentCart({
    lineItems: [
      {
        quantity,
        catalogReference: { appId: STORES_APP_ID, catalogItemId: productId },
      },
    ],
  });
  return summarize(cart);
}

/** Sets a line's quantity. A quantity of 0 or less removes the line — Wix's own
 * update-quantity endpoint rejects 0, so that case goes through remove instead. */
export async function setLineQuantity(lineItemId: string, quantity: number): Promise<CartSummary> {
  if (quantity <= 0) {
    const { cart } = await getClient().currentCart.removeLineItemsFromCurrentCart([lineItemId]);
    return summarize(cart);
  }
  const { cart } = await getClient().currentCart.updateCurrentCartLineItemQuantity([{ _id: lineItemId, quantity }]);
  return summarize(cart);
}

/** Creates a checkout from the current cart and returns the hosted Wix checkout URL to
 * redirect the buyer to. Throws (rather than returning null) on an empty cart or a failed
 * redirect-session creation, so the caller can surface a real error instead of a silent
 * no-op click. */
export async function getCheckoutUrl(): Promise<string> {
  const cartClient = getClient();
  const { checkoutId } = await cartClient.currentCart.createCheckoutFromCurrentCart({
    channelType: currentCart.ChannelType.WEB,
  });
  if (!checkoutId) throw new Error("Could not create a checkout from the current cart.");

  // postFlowUrl/thankYouPageUrl must be the site's real https:// origin — window.location
  // is correct here since this only ever runs in the browser; reading it from a server
  // request instead resolves to http:// behind Wix's TLS-terminating proxy and 403s on
  // return from the hosted checkout.
  const { redirectSession } = await cartClient.redirects.createRedirectSession({
    ecomCheckout: { checkoutId },
    callbacks: { postFlowUrl: window.location.href, thankYouPageUrl: window.location.origin },
  });
  if (!redirectSession?.fullUrl) throw new Error("Could not create the checkout redirect session.");
  return redirectSession.fullUrl;
}
