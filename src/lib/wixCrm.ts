// Browser-side @wix/crm contact write — the About page contact form (Name/Email/Message).
// (The Shop page's Ultimate Hiring Bundle opt-in used to go through here too, but now
// submits to a real Wix Forms app form instead — see src/lib/wixForms.ts's
// submitHiringBundleForm.) Same pattern as src/lib/wixForms.ts/wixCart.ts: runs
// client-side with the same anonymous visitor OAuthStrategy already used for
// blog/store/cart data — the Client ID is public, not a secret.
//
// Uses `submittedContact.appendOrCreateContact`, NOT `contacts.createContact` — tried the
// latter first (it's the more obvious/literal API for "create a contact") and it 403s from
// a plain visitor token: it's gated behind CONTACTS.MODIFY, an elevated/owner-only
// permission scope our public Client ID doesn't carry. `@wix/crm`'s Notes API
// (`notes.createNote`) is the same story — 403s the same way, confirmed while checking
// whether the message could land as a contact note instead of an extended field.
// `submittedContact.appendOrCreateContact` is the one CRM write path actually built for
// anonymous visitor use (@permissionId CONTACTS.SUBMIT, the same API Wix's own native
// "subscribe"/lead-capture elements use under the hood) — verified working end-to-end.
// It already reconciles by email (an existing contact updates instead of duplicating),
// per its own docs: "To reconcile with an existing contact, a phone or email must be
// provided... If no existing contact can be found, a new contact is created."
//
// A CRM contact has no native free-text "message" field (name/emails/phones/addresses/
// company/jobTitle/labels/extendedFields — that's the whole schema), so the message goes
// into extendedFields under a custom key. This is best-effort and unverified against a
// live dashboard view — the contact itself (name + email, the reliable, well-documented
// part) still lands either way.

import { createClient, OAuthStrategy } from "@wix/sdk";
import { submittedContact } from "@wix/crm";

export class WixCrmConfigError extends Error {}

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  const clientId = import.meta.env.PUBLIC_WIX_DATA_CLIENT_ID;
  if (!clientId) {
    throw new WixCrmConfigError("PUBLIC_WIX_DATA_CLIENT_ID is not set (see .env.example)");
  }
  if (!client) {
    client = createClient({
      modules: { submittedContact },
      auth: OAuthStrategy({ clientId }),
    });
  }
  return client;
}

export async function submitContactFormMessage(name: string, email: string, message: string): Promise<void> {
  await getClient().submittedContact.appendOrCreateContact({
    info: {
      name: name ? { first: name } : undefined,
      emails: { items: [{ email, primary: true }] },
      extendedFields: { items: { contactFormMessage: message } },
    },
  });
}
