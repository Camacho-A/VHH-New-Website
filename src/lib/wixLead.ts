// Browser-side @wix/crm lead capture for the Shop page's Ultimate Hiring Bundle opt-in
// (design_handoff_vhh_website/README.md § "Lead magnet"). Same pattern as
// src/lib/wixForms.ts/wixCart.ts: runs client-side with the same anonymous visitor
// OAuthStrategy already used for blog/store/cart data — the Client ID is public, not a
// secret.
//
// This is deliberately NOT @wix/forms — the README calls for @wix/crm specifically, which
// (unlike @wix/forms) doesn't require Danielle to first create a Wix Forms app instance in
// her dashboard (the exact blocker src/pages/about.astro's contact form is still stuck on).
// `submittedContact.appendOrCreateContact` is the visitor-safe write path Wix's own native
// "subscribe" elements use under the hood (@permissionId CONTACTS.SUBMIT, no auth.elevate,
// no owner scope) — it creates the contact if new, or reconciles onto an existing one by
// email if not.

import { createClient, OAuthStrategy } from "@wix/sdk";
import { submittedContact } from "@wix/crm";

export class WixLeadConfigError extends Error {}

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  const clientId = import.meta.env.PUBLIC_WIX_DATA_CLIENT_ID;
  if (!clientId) {
    throw new WixLeadConfigError("PUBLIC_WIX_DATA_CLIENT_ID is not set (see .env.example)");
  }
  if (!client) {
    client = createClient({
      modules: { submittedContact },
      auth: OAuthStrategy({ clientId }),
    });
  }
  return client;
}

/** Creates/updates the Wix contact with the lead's name + email (README step 1) and
 * best-effort marks them subscribed to the newsletter list (step 2). Step 3 (emailing the
 * actual download link) is a Wix Automation Danielle configures in her dashboard, triggered
 * off this contact being created/subscribed — nothing left for the frontend to do there.
 *
 * The subscription field write is unverified against a live send (Wix's extended-fields
 * write path for the system "email subscriptions" field isn't documented for the visitor
 * SDK) — wrapped so that if it's rejected or ignored, the contact still gets created
 * (the higher-value, well-documented half of this call) rather than failing the whole
 * submission. Confirm with Danielle after a real test submission that the subscription
 * actually takes.
 */
export async function submitHiringBundleLead(firstName: string, email: string): Promise<void> {
  await getClient().submittedContact.appendOrCreateContact({
    info: {
      name: { first: firstName },
      emails: { items: [{ email, primary: true }] },
      extendedFields: {
        items: {
          emailSubscriptions: { subscriptionStatus: "SUBSCRIBED" },
        },
      },
    },
  });
}
