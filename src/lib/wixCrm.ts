// Browser-side @wix/crm contact writes — shared by the About page contact form
// (Name/Email/Message) and the Shop page's Ultimate Hiring Bundle opt-in (First Name/Email).
// Same pattern as src/lib/wixForms.ts/wixCart.ts: runs client-side with the same anonymous
// visitor OAuthStrategy already used for blog/store/cart data — the Client ID is public,
// not a secret.
//
// Uses `submittedContact.appendOrCreateContact`, NOT `contacts.createContact` — tried the
// latter first (it's the more obvious/literal API for "create a contact") and it 403s from
// a plain visitor token: it's gated behind CONTACTS.MODIFY, an elevated/owner-only
// permission scope our public Client ID doesn't carry. `@wix/crm`'s Notes API
// (`notes.createNote`) is the same story — 403s the same way, confirmed while checking
// whether the About form's message could land as a contact note instead of an extended
// field. `submittedContact.appendOrCreateContact` is the one CRM write path actually built
// for anonymous visitor use (@permissionId CONTACTS.SUBMIT, the same API Wix's own native
// "subscribe"/lead-capture elements use under the hood) — verified working end-to-end.
// It already does what "createContact, deduplicated on email" asks for: per its own docs,
// "To reconcile with an existing contact, a phone or email must be provided... If no
// existing contact can be found, a new contact is created" — an existing contact updates
// instead of duplicating, just via this API surface rather than the literal function name.
//
// A CRM contact has no native free-text "message" field (name/emails/phones/addresses/
// company/jobTitle/labels/extendedFields — that's the whole schema), so the About form's
// message goes into extendedFields under a custom key. Like the newsletter-subscription
// field before it, this is best-effort and unverified against a live dashboard view — the
// contact itself (name + email, the reliable, well-documented part) still lands either way.

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

interface ContactWrite {
  firstName?: string;
  email: string;
  message?: string;
  subscribeToNewsletter?: boolean;
}

async function upsertContact({ firstName, email, message, subscribeToNewsletter }: ContactWrite): Promise<string | undefined> {
  const extendedFields: Record<string, unknown> = {};
  if (message) extendedFields.contactFormMessage = message;
  if (subscribeToNewsletter) extendedFields.emailSubscriptions = { subscriptionStatus: "SUBSCRIBED" };

  const { contactId } = await getClient().submittedContact.appendOrCreateContact({
    info: {
      name: firstName ? { first: firstName } : undefined,
      emails: { items: [{ email, primary: true }] },
      ...(Object.keys(extendedFields).length ? { extendedFields: { items: extendedFields } } : {}),
    },
  });
  return contactId;
}

/** About page contact form. */
export async function submitContactFormMessage(name: string, email: string, message: string): Promise<void> {
  await upsertContact({ firstName: name, email, message });
}

/** Shop page Ultimate Hiring Bundle opt-in. Best-effort marks the contact subscribed to
 * the newsletter (see the module comment above on why that field write is unverified).
 * Emailing the actual download link is a Wix Automation set up in the dashboard, triggered
 * off this contact being created/subscribed — nothing left for the frontend to do there. */
export async function submitHiringBundleLead(firstName: string, email: string): Promise<void> {
  await upsertContact({ firstName, email, subscribeToNewsletter: true });
}
