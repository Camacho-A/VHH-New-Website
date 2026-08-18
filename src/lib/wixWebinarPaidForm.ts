// Browser-side @wix/forms submission for the webinar's "Webinar Paid Confirmation" form
// (id in PUBLIC_WEBINAR_PAID_FORM_ID; confirmed via a getForm() lookup). Submitted from the
// post-payment /webinar/confirmed page (soft-gated by Stripe's session_id) to fire the Wix
// Automation that emails the Zoom link — the confirmation email lives entirely in that Wix
// automation, so nothing here sends email itself.
//
// Separate from the registration form (src/lib/wixWebinarForm.ts) on purpose: this form's
// automation is the ONE that sends the Zoom link, distinct from the registration form's
// "holding your spot" note.
//
// Same lightweight pattern as the other form libs: import only `submissions` (never `forms`,
// which pulls in the ~15MB builder API), and hardcode the field targets. Targets confirmed via
// getForm(): first_name_2865 / email_aec3 (Wix reuses the same key shape as the registration
// form). If the form is ever recreated, re-run scripts/list-wix-forms.mjs and update these.

import { createClient, OAuthStrategy } from "@wix/sdk";
import { submissions } from "@wix/forms";

export class WixFormConfigError extends Error {}

const FIELD_TARGETS = {
  firstName: "first_name_2865",
  email: "email_aec3",
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

export async function submitWebinarPaidConfirmation(firstName: string, email: string): Promise<void> {
  const formId = import.meta.env.PUBLIC_WEBINAR_PAID_FORM_ID;
  if (!formId) {
    throw new WixFormConfigError("PUBLIC_WEBINAR_PAID_FORM_ID is not set (see .env.example)");
  }

  await getClient().submissions.createSubmission({
    formId,
    submissions: {
      [FIELD_TARGETS.firstName]: firstName,
      [FIELD_TARGETS.email]: email,
    },
  });
}
