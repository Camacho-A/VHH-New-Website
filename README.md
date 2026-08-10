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
cp .env.example .env   # then fill in WIX_CLIENT_ID (see below)
npm run dev             # http://localhost:4321
```

### Environment variables

| Var | Value |
|---|---|
| `WIX_CLIENT_ID` | The headless client ID issued on the client's existing Wix site. Never hardcode or commit it — it lives only in `.env` (git-ignored). |

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
- [ ] 3. Build the shared shell — nav, footer, design tokens as CSS custom properties
- [ ] 4. Static pages first: Homepage, About, Business Consulting
- [ ] 5. Wire the contact form (`@wix/forms`)
- [ ] 6. Wire Blog (`@wix/blog`) and Shop (`@wix/stores`)
- [ ] 7. Create CMS collections; wire Services, testimonials, logos, credentials
- [ ] 8. Deploy to Wix hosting with the Wix CLI
- [ ] 9. Add production URLs to Wix redirect settings, then repoint the domain last
