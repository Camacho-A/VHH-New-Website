// Browser-side @wix/forms submission for the Shop page's Ultimate Hiring Bundle opt-in —
// a real Wix Forms app form (id in PUBLIC_WIX_HIRING_BUNDLE_FORM_ID; confirmed via
// scripts/list-wix-forms.mjs: form named "Ultimate Hiring Bundle" in the wix.form_app.form
// namespace). A Wix dashboard automation on this form handles the PDF delivery and
// newsletter subscription, triggered by the submission landing — nothing else for this
// code to do; it deliberately never sends email itself.
//
// Deliberately a separate file from src/lib/wixForms.ts (the About form), not a shared
// helper — importing `forms` (used there to resolve field targets from the live schema)
// pulls in @wix/auto_sdk_forms_forms, whose ESM entry is ~15MB of source (435MB unpacked;
// the package appears to ship the full form-builder API surface, not a lightweight visitor
// read). Bundled into this page's client script that blew the bundle out to ~12MB
// (426KB gzipped) — caught via the build's chunk-size warning, not something to ship.
//
// This form's two fields are hardcoded here instead: this is exactly the situation
// node_modules/@wix/agent-skills's forms recipe calls out as the one case where
// hardcoding is correct over schema-driven resolution — "a brief that is explicitly
// design-led... the form is a small fixed part of a hand-crafted layout, and
// dashboard-editability is explicitly not a goal." Confirmed real target strings via
// `forms.getForm()` from a one-off Node script (not bundled to the browser) — if this
// form ever gets recreated in the dashboard, Wix will generate new target strings and
// these will need updating the same way (re-run scripts/list-wix-forms.mjs).

import { createClient, OAuthStrategy } from "@wix/sdk";
import { submissions } from "@wix/forms";

export class WixFormConfigError extends Error {}

const FIELD_TARGETS = {
  firstName: "first_name_45f6",
  email: "email_ca48",
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

export async function submitHiringBundleForm(firstName: string, email: string): Promise<void> {
  const formId = import.meta.env.PUBLIC_WIX_HIRING_BUNDLE_FORM_ID;
  if (!formId) {
    throw new WixFormConfigError("PUBLIC_WIX_HIRING_BUNDLE_FORM_ID is not set (see .env.example)");
  }

  await getClient().submissions.createSubmission({
    formId,
    submissions: {
      [FIELD_TARGETS.firstName]: firstName,
      [FIELD_TARGETS.email]: email,
    },
  });
}
