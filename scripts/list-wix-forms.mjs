// Lists forms on the existing Wix site, across every form namespace active on it.
// Use this to find a form's ID (e.g. the About page contact form once Danielle creates
// it in the Wix Forms app) — the Wix dashboard doesn't surface form IDs directly.
//
// Run with: npm run wix:forms

import { createClient, OAuthStrategy } from "@wix/sdk";
import { forms } from "@wix/forms";

// WIX_DATA_CLIENT_ID, not WIX_CLIENT_ID — the Wix-managed hosting adapter (build order
// step 8) reserves that name for the new hosting project's own client in .env.local.
const clientId = process.env.WIX_DATA_CLIENT_ID;
if (!clientId) {
  console.error("✗ WIX_DATA_CLIENT_ID is not set. Run with: node --env-file=.env scripts/list-wix-forms.mjs");
  process.exit(1);
}

const wixClient = createClient({
  modules: { forms },
  auth: OAuthStrategy({ clientId }),
});

const { configs } = await wixClient.forms.listFormsProvidersConfigs();

let totalFound = 0;
for (const { namespace } of configs) {
  let result;
  try {
    result = await wixClient.forms.listForms(namespace, { paging: { limit: 100 } });
  } catch (err) {
    // Some namespaces (e.g. checkout, quizzes) aren't listable with visitor-level auth —
    // that's expected, not a real failure. Skip and move on.
    console.log(`\n— ${namespace}: skipped (${err?.message || "not accessible with visitor auth"})`);
    continue;
  }
  if (result.forms.length === 0) continue;

  console.log(`\n— ${namespace} (${result.forms.length}) —`);
  for (const f of result.forms) {
    const fieldLabels = (f.fields ?? [])
      .map((field) => field.view?.label ?? field.view?.fieldType)
      .filter(Boolean);
    console.log(`  ${f._id}  "${f.name}"`);
    console.log(`    fields: ${fieldLabels.join(", ")}`);
    totalFound += 1;
  }
}

console.log(`\n${totalFound} form(s) total across ${configs.length} namespaces checked.`);
