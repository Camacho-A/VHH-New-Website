// Browser-side @wix/forms submission for the About page contact form.
//
// Runs client-side (not a server endpoint) using the same anonymous visitor
// OAuthStrategy pattern already verified for @wix/blog and @wix/stores in
// scripts/verify-wix.mjs — the Client ID is a public, browser-safe identifier by
// design (it's the same one used in the Wix login/OAuth redirect flow).
//
// Field target IDs (e.g. "first_name_5c9f") are auto-generated per form by Wix and
// unknowable ahead of time, so instead of hardcoding them, resolveFieldTargets() fetches
// the form schema once and matches fields by label/fieldType. This means the form works
// as soon as PUBLIC_WIX_CONTACT_FORM_ID is set, without needing a code change to match
// whatever exact field IDs Wix generated.
//
// (The Shop page's Ultimate Hiring Bundle form does NOT use this module — see
// src/lib/wixHiringBundleForm.ts for why: importing `forms` here to resolve targets pulls
// in @wix/auto_sdk_forms_forms, whose ESM entry is ~15MB of source, and blew that page's
// client bundle out to ~12MB. Hardcoding is the sanctioned approach for a form this fixed
// anyway — this module keeps the schema-driven resolution for the About form specifically
// because it isn't wired to a real form yet, so there are no real target strings to
// hardcode until PUBLIC_WIX_CONTACT_FORM_ID is set; revisit then.)
//
// NOT YET WIRED: CAPTCHA. README § Contact form says to enable CAPTCHA on the Wix form.
// CreateSubmissionOptions accepts an optional captchaToken, but wiring a real token
// requires knowing the form's spam-filter protection level, which we can't test until
// the form exists. Revisit once PUBLIC_WIX_CONTACT_FORM_ID is set.

import { createClient, OAuthStrategy } from "@wix/sdk";
import { forms, submissions } from "@wix/forms";

export class WixFormConfigError extends Error {}

type FieldTargets = { name?: string; email?: string; message?: string };

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  // PUBLIC_WIX_DATA_CLIENT_ID, not PUBLIC_WIX_CLIENT_ID — see src/lib/wixClient.ts for
  // why: avoids colliding with the Wix-managed hosting adapter's own reserved
  // WIX_CLIENT_ID (a different site's client, auto-generated in .env.local).
  const clientId = import.meta.env.PUBLIC_WIX_DATA_CLIENT_ID;
  if (!clientId) {
    throw new WixFormConfigError("PUBLIC_WIX_DATA_CLIENT_ID is not set (see .env.example)");
  }
  if (!client) {
    client = createClient({
      modules: { forms, submissions },
      auth: OAuthStrategy({ clientId }),
    });
  }
  return client;
}

const fieldTargetsCache = new Map<string, Promise<FieldTargets>>();

async function resolveFieldTargets(formId: string): Promise<FieldTargets> {
  let cached = fieldTargetsCache.get(formId);
  if (!cached) {
    cached = getClient()
      .forms.getForm(formId)
      .then((form) => {
        const targets: FieldTargets = {};
        for (const field of form.fields ?? []) {
          const target = (field as { target?: string }).target;
          if (!target) continue;
          const view = (field as { view?: { label?: string; fieldType?: string } }).view ?? {};
          const label = (view.label ?? "").toLowerCase();
          const fieldType = view.fieldType ?? "";

          if (!targets.name && (fieldType === "CONTACTS_FIRST_NAME" || (label.includes("name") && !label.includes("last")))) {
            targets.name = target;
          } else if (!targets.email && (fieldType === "CONTACTS_EMAIL" || label.includes("email"))) {
            targets.email = target;
          } else if (!targets.message && (label.includes("help") || label.includes("message"))) {
            targets.message = target;
          }
        }
        return targets;
      });
    fieldTargetsCache.set(formId, cached);
  }
  return cached;
}

export function isContactFormConfigured(): boolean {
  return Boolean(import.meta.env.PUBLIC_WIX_CONTACT_FORM_ID);
}

export async function submitContactForm(values: { name: string; email: string; message: string }): Promise<void> {
  const formId = import.meta.env.PUBLIC_WIX_CONTACT_FORM_ID;
  if (!formId) {
    throw new WixFormConfigError("PUBLIC_WIX_CONTACT_FORM_ID is not set (see .env.example)");
  }

  const targets = await resolveFieldTargets(formId);
  if (!targets.name || !targets.email || !targets.message) {
    throw new Error(
      `Could not map Name/Email/Message to fields on Wix form "${formId}" ` +
        `(resolved: ${JSON.stringify(targets)}). Check the field labels in the Wix Forms dashboard.`
    );
  }

  await getClient().submissions.createSubmission({
    formId,
    submissions: {
      [targets.name]: values.name,
      [targets.email]: values.email,
      [targets.message]: values.message,
    },
  });
}
