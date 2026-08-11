# The Virtual Helping Hand — Website (Wix Headless)

Astro frontend for thevirtualhelpinghand.com, built self-managed headless against the
client's **existing** Wix site (real contacts, blog, store, and forms live there — this
frontend reads/writes to that same backend via the Wix SDK).

Full design and integration spec: [`design_handoff_vhh_website/README.md`](./design_handoff_vhh_website/README.md).
Read that first — it defines design tokens, page-by-page content, the CMS schema, and the
build order this project follows.

## Stack

- **Astro** — static-first frontend, deployed to Wix hosting via the Wix CLI
- **`@wix/sdk`** + `@wix/blog`, `@wix/stores`, `@wix/forms` — talk to the existing Wix site's content
- Node **v22.12+** required (see `engines` in `package.json`)

## Setup

```sh
npm install
cp .env.example .env   # then fill in WIX_DATA_CLIENT_ID (see below)
npm run dev             # http://localhost:4321
```

### Environment variables

| Var | Value |
|---|---|
| `WIX_DATA_CLIENT_ID` / `PUBLIC_WIX_DATA_CLIENT_ID` | The headless client ID issued on the client's **existing** Wix site (real blog/products/forms) — used by `src/lib/wixClient.ts` and `src/lib/wixForms.ts` to fetch/submit against that site. Never hardcode or commit it — it lives only in `.env` (git-ignored). **Deliberately not named `WIX_CLIENT_ID`**: the Wix-managed hosting adapter (build order step 8) generates its own reserved `WIX_CLIENT_ID` in `.env.local` for the *new* hosting project it provisions, and Vite loads `.env.local` with higher precedence than `.env` — a shared name silently points all our data-fetching code at the wrong (new, empty) site instead of the real one. Keep these distinct. |

Wix OAuth redirect settings already configured for local dev:
- Allowed redirect domain: `http://localhost:3000`
- Authorization redirect URI: `http://localhost:3000/login-callback`
- Login URL: `http://localhost:3000/login`

(Note: Astro's dev server defaults to port `4321`; if wiring the login flow, either run
`astro dev --port 3000` or add `4321` to the Wix redirect settings.)

## Commands

| Command | Action |
|---|---|
| `npm run dev` | Start local dev server |
| `npm run build` | Build production site to `./dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run astro ...` | Run Astro CLI commands (`astro add`, `astro check`, etc.) |

## Project structure

```
design_handoff_vhh_website/   Design reference (source of truth for layout/copy/tokens) — do not deploy
src/
  pages/                      Route-based pages
  components/                 Shared UI (nav, footer, cards, etc.)
public/                       Static assets
```

## Build order

Tracked in [`design_handoff_vhh_website/README.md`](./design_handoff_vhh_website/README.md#build-order).
Current status:

- [x] 1. Scaffold Astro + `@wix/sdk`, add the Client ID to `.env`
- [x] 2. Verify the SDK reads real blog posts and products from the existing site (`npm run verify:wix`)
- [x] 3. Build the shared shell — nav, footer, design tokens as CSS custom properties
- [x] 4. Static pages first: Homepage, About, Business Consulting
- [~] 5. Wire the contact form (`@wix/forms`) — code done, **blocked on a missing Wix form**, see below
- [x] 6. Wire Blog (`@wix/blog`) and Shop (`@wix/stores`)
- [~] 7. Services page built with real content — **CMS collections blocked**, see below
- [ ] 8. Deploy to Wix hosting with the Wix CLI
- [ ] 9. Add production URLs to Wix redirect settings, then repoint the domain last

### ⚠️ Step 5 blocker: no headless-accessible contact form exists yet

The About page's contact form (Name/Email/Message) is fully built and wired to
`@wix/forms` (`src/lib/wixForms.ts`) — it just has nowhere to submit to yet.

The live site's footer "Send an Email" form isn't a Wix Forms app instance: checked
every form namespace active on the site via the API (`npm run wix:forms`) and it isn't
in any of them. It's a native/classic Wix Editor element, which doesn't expose a
queryable form ID or schema through `@wix/forms` — so it can't be wired up headlessly
as-is.

**To unblock:** Danielle needs to create a new form in the site's **Wix Forms app**
(Dashboard → Forms, not the Editor element) with:
- **Name** — text, required
- **Email** — email, required
- **Message** — long answer / paragraph, required
- **CAPTCHA enabled** (README § Contact form spec)

Once it exists, run `npm run wix:forms` to find its ID (Wix doesn't surface form IDs in
the dashboard UI directly), then set `PUBLIC_WIX_CONTACT_FORM_ID` in `.env`. No code
changes needed after that — the submission code resolves field IDs by label at runtime.

Until then, the form works in the browser (validation, states) but submissions are
simulated (`console.warn` fires, nothing is sent) rather than 404ing.

### ⚠️ Step 7 blocker: CMS collections don't exist yet

The Services page (`/services`) is fully built with real content — four pillar
accordions (35 services), search/filter, VOS/social/branding tiers, A-Z index — but it's
**hardcoded**, not CMS-driven. Homepage testimonials, client logos, and credential
badges are also still hardcoded (they were already real content from step 4, just not
yet editable via CMS).

Checked whether the six CMS collections in this README's schema section can be created
via the API: `collections.listDataCollections()` and `collections.createDataCollection()`
(from `@wix/data`, now installed) both 403 under visitor auth — same story as the step-5
form. Creating/managing Wix CMS collections requires Danielle's dashboard access
(Content Manager), not just the headless Client ID.

**To unblock:** Danielle needs to create the six collections in her Wix dashboard's
**Content Manager**, matching the exact field schema in this README's CMS section
(`Testimonials`, `CaseStudies`, `Services`, `FAQs`, `ClientLogos`, `Credentials`). Once
they exist, the pages can be switched from hardcoded arrays to `@wix/data` queries —
straightforward once the collections and their permissions (public read access) are set.
