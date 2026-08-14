// Browser-side @wix/forms submission for the About page's contact form — a real Wix
// Forms app form (id in PUBLIC_WIX_CONTACT_FORM_ID; confirmed via scripts/list-wix-forms.mjs:
// form named "Send an Email" in the wix.form_app.form namespace, created after the initial
// build — see src/lib/wixCrm.ts for the interim @wix/crm path this replaces).
//
// Deliberately a separate file from src/lib/wixForms.ts, not a shared schema-driven helper —
// importing `forms` (used there to resolve field targets from the live schema) pulls in
// @wix/auto_sdk_forms_forms, whose ESM entry is ~15MB of source (435MB unpacked) and blew a
// client bundle out to ~12MB when tried for the Shop page's Hiring Bundle form (see
// wixHiringBundleForm.ts for the full writeup). Same fix here: hardcode the field targets,
// import only the lightweight `submissions` write client.
//
// Confirmed real target strings via `forms.getForm()` from a one-off Node script (not
// bundled to the browser) — if this form ever gets recreated in the dashboard, Wix will
// generate new target strings and these will need updating the same way (re-run
// scripts/list-wix-forms.mjs, then a form-fields lookup against the new form id).

import { createClient, OAuthStrategy } from "@wix/sdk";
import { submissions } from "@wix/forms";

export class WixFormConfigError extends Error {}

const FIELD_TARGETS = {
  name: "name",
  email: "email_e81d",
  message: "how_can_we_help",
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

export async function submitContactForm(name: string, email: string, message: string): Promise<void> {
  const formId = import.meta.env.PUBLIC_WIX_CONTACT_FORM_ID;
  if (!formId) {
    throw new WixFormConfigError("PUBLIC_WIX_CONTACT_FORM_ID is not set (see .env.example)");
  }

  await getClient().submissions.createSubmission({
    formId,
    submissions: {
      [FIELD_TARGETS.name]: name,
      [FIELD_TARGETS.email]: email,
      [FIELD_TARGETS.message]: message,
    },
  });
}
