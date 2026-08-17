// Browser-side @wix/forms submission for the Webinar registration form (src/pages/webinar.astro)
// — the existing Wix standalone form "Email Marketing Webinar" (id in PUBLIC_WEBINAR_FORM_ID;
// confirmed via scripts/list-wix-forms.mjs + a getForm() lookup).
//
// This is step ONE of a deliberate two-step flow (README § "Webinar > Registration + payment
// flow"): submitting HOLDS the spot and creates/updates the Wix contact, firing the dashboard
// automation that emails "we're holding your spot". It must NOT send the Zoom joining link —
// that goes out only on a SEPARATE automation triggered by Stripe payment, since the webinar
// is paid. Nothing in this code sends email or the join link itself.
//
// Deliberately a separate file from src/lib/wixForms.ts, not a shared schema-driven helper —
// importing `forms` (used there to resolve field targets from the live schema) pulls in
// @wix/auto_sdk_forms_forms, whose ESM entry is ~15MB of source and blew a client bundle out
// to ~12MB last time (see wixHiringBundleForm.ts for the full writeup). Same fix: hardcode the
// field targets, import only the lightweight `submissions` write client.
//
// Field targets confirmed via forms.getForm() from a one-off Node script (not bundled to the
// browser). If this form is ever recreated in the dashboard, Wix regenerates the target
// strings and these need updating the same way (re-run scripts/list-wix-forms.mjs, then a
// form-fields lookup against the new form id). The frequency dropdown's submitted value must
// be one of the form's exact option values — Never / Occasionally / Monthly / Weekly.

import { createClient, OAuthStrategy } from "@wix/sdk";
import { submissions } from "@wix/forms";

export class WixFormConfigError extends Error {}

const FIELD_TARGETS = {
  firstName: "first_name_2865",
  email: "email_aec3",
  businessName: "business_name",
  frequency: "how_often_do_you_email_your_list_right_now",
};

let client: ReturnType<typeof createClient> | null = null;

function getClient() {
  const clientId = import.meta.env.PUBLIC_WIX_DATA_CLIENT_ID;
  if (!clientId) {
    throw new WixFormConfigError("PUBLIC_WIX_DATA_CLIENT_ID is not set (see .env.example)");
  }
  if (!client) {
    client = createClient({
      modules: { submissions },
      auth: OAuthStrategy({ clientId }),
    });
  }
  return client;
}

export async function submitWebinarRegistration(
  firstName: string,
  email: string,
  businessName: string,
  frequency: string
): Promise<void> {
  const formId = import.meta.env.PUBLIC_WEBINAR_FORM_ID;
  if (!formId) {
    throw new WixFormConfigError("PUBLIC_WEBINAR_FORM_ID is not set (see .env.example)");
  }

  // Required fields always; optional ones only when provided (keeps empty values out of the
  // dashboard segmentation the client wants from the frequency dropdown / business name).
  const values: Record<string, string> = {
    [FIELD_TARGETS.firstName]: firstName,
    [FIELD_TARGETS.email]: email,
  };
  if (businessName) values[FIELD_TARGETS.businessName] = businessName;
  if (frequency) values[FIELD_TARGETS.frequency] = frequency;

  await getClient().submissions.createSubmission({ formId, submissions: values });
}
