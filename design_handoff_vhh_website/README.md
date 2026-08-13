# Handoff: The Virtual Helping Hand — Website Redesign (Wix Headless)

## Overview

A **seven-page** redesign of thevirtualhelpinghand.com, repositioning VHH from a virtual assistant company to a **business growth partner**. The site organizes everything around four service pillars and tells one story: *strategy → digital presence → systems → ongoing support.*

**Target implementation: Wix Headless.** Astro frontend deployed to Wix hosting, with the client's **existing** Wix site as the backend for CMS, blog, store, and forms.

## About the Design Files

The files in `design-source/` are **design references created in HTML** — prototypes showing intended look and behavior, **not production code to copy directly**. They use a custom streaming-template runtime that should not be carried into the real build.

Your task is to **recreate these designs as Astro components**, using the Wix JavaScript SDK for content. Read the HTML for layout, spacing, color, type, and copy — then rebuild it idiomatically.

`rendered-preview/` holds four self-contained pages you can open in a browser to see the intended result (Shop, Blog, and Blog Post aren't in there; read their source directly).

## Fidelity

**High-fidelity.** Final colors, typography, spacing, and copy. Recreate pixel-accurately. Every value below is exact — no interpretation needed.

---

## Design Tokens

Derived from the "Classical" editorial system. Every page uses these and nothing else.

### Colors
| Token | Value | Use |
|---|---|---|
| `--bg` | `#f9f4ea` | Page background (warm cream) |
| `--bg-alt` | `#efe6d3` | Alternating section bands, image mats |
| `--text` | `#2b1f16` | Body and headings (espresso) |
| `--text-muted` | `rgba(43,31,22,0.75)` | Secondary copy, captions, footer |
| `--text-body` | `rgba(43,31,22,0.78)` | Long-form paragraphs |
| `--accent` | `#b68235` | **Borders, rules, icon strokes only** (caramel) |
| `--accent-deep` | `#6b4423` | **All accent-colored text** (warm brown, 7.75:1) |
| `--rule` | `rgba(43,31,22,0.16)` | Hairline dividers and card borders |
| `--rule-soft` | `rgba(43,31,22,0.12)` | Mobile menu item dividers |
| `--accent-tint` | `rgba(182,130,53,0.1)` – `0.12` | Hover fills |

**Critical rule:** `#b68235` is a stroke color. It fails contrast as text. Any accent-colored *text* uses `#6b4423`. Buttons are an accent **border** with `#6b4423` label — never a filled accent background.

### Typography
- **Headings:** `'Cormorant Garamond', serif` — weights 400 (display), 600 (section titles)
- **Body:** `'Lora', serif` — weight 400
- Google Fonts: `Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,500&family=Lora:ital,wght@0,400;0,500;0,600;1,400`

| Role | Size | Weight | Line-height |
|---|---|---|---|
| Page h1 | `clamp(2.6rem, 5vw, 4.2rem)` | 400 | 1.08 |
| Section h2 | `clamp(2rem, 3.8vw, 3rem)` | 400 or 600 | 1.15 |
| Card h3 | `19–23px` | 600 | 1.3 |
| Body | `16–16.5px` | 400 | 1.75–1.8 |
| Small / meta | `13–14.5px` | 400 | 1.6–1.7 |
| Kicker | `11–12px`, `letter-spacing:0.1em–0.14em`, uppercase, `#6b4423` | 600 | — |

Never bold. Emphasis comes from size and italics. Prices set `font-variant-numeric: tabular-nums`.

### Spacing & Shape
- Section padding: `clamp(56px,7vw,110px)` vertical, `clamp(20px,4vw,32px)` horizontal
- Max content width: `1360px`; prose measure caps at `640px`
- Border radius: `4px` (buttons, inputs), `6px` (cards, bordered blocks), `3px` (chips)
- **No drop shadows** except the nav dropdown (`0 12px 32px rgba(60,45,30,0.22)`)
- Photos sit in a "plate": `padding:6px; background:#efe6d3; outline:1px solid var(--rule)`

### Interaction States
- Hover: `background: rgba(182,130,53,0.1)` on outlined controls; links darken to `#2b1f16`
- Focus: `outline: 2px solid #b68235; outline-offset: 2px` — required on every interactive element
- Selection: `::selection { background: rgba(182,130,53,0.3) }`

---

## Pages

### 1. Homepage (`Homepage.dc.html`)
Sections in order:
1. **Hero** — headline "build a business that works as hard as you do.", subcopy, two CTAs (Schedule a Consultation / Explore How We Help), plate photo
2. **Trust strip** — "Strategy + Execution + Ongoing Support"
3. **Four pillars** — numbered editorial rows (I–IV), each with title, description, Learn More deep-linking to `/services#pillar-{key}`
4. **"You don't need more on your plate"** — editorial problem/solution block
5. **How We Work** — 01 Discover / 02 Strategize / 03 Build / 04 Support
6. **Consulting feature** — CTA to Business Consulting page
7. **Digital/website feature** — Wix Partner credibility
8. **Content Concierge** — subscription sub-offer of Pillar II (anchor `#concierge`)
9. **Operations feature**
10. **Testimonials** — one real quote (Miraque Gilbert-Woods)
11. **Honored to Have Worked With** — 4 client logos, centered flex row
12. **Trusted & Recognized By** — 3 credential badges
13. **Free resources** — links to the Hiring Bundle opt-in on the Shop page
14. **Final CTA**

### 2. About (`About.dc.html`)
Hero → How It Started → philosophy ("We Don't Just Complete Tasks") with 5 capability cells → meet Danielle (940px centered block, 360px portrait, no border) → Gandhi quote → contact form + social icons.

### 3. Services (`Services.dc.html`)
Four **collapsible pillar accordions**. Each opens to a list of individual services with name, description, and price. Supports deep links: `#pillar-consulting`, `#pillar-brand`, `#pillar-operations`, `#pillar-support` — the hash **opens** that pillar and scrolls it under the sticky header. Also includes VOS retainer packages ($700 / $950 / $1,450) and add-on services.

### 4. Business Consulting (`Business Consulting.dc.html`)
Flagship page. Hero → "you may need consulting if" recognition list → what we work on → three offers (Strategy Session / Business Growth Intensive / Ongoing Consulting) → process → FAQ → CTA.

### 5. Shop (`Shop.dc.html`)
A **working storefront**, not a link-out to the Wix shop. Contains:

- Category filter chips (derived from product categories — do not hardcode)
- Product grid with cover image, ribbon, name, description, price, compare-at price
- Add to cart, with a slide-out cart drawer: line items, quantity steppers, live subtotal, checkout
- The free Hiring Bundle is **not** in this grid — it's an email opt-in in its own section (see Lead magnet below)

The product objects are shaped to match Wix Stores (`_id`, `slug`, `name`, `description`, `price`, `compareAtPrice`, `ribbon`, `category`) so the array swaps directly for `products.queryProducts()`. Cart state should move to `@wix/ecom` `currentCart`; checkout creates a Wix checkout session.

Each product `<article>` carries `id="{slug}"` for deep links, and the page ships **JSON-LD `Product` structured data** so products rank individually. Preserve both.

### 6. Blog (`Blog.dc.html`)
Hero → featured post → post grid. Cards show real post titles and categories pulled from the live blog, but this page must be wired to `@wix/blog` so it stays current. Card fields map to: `title`, `excerpt`, `category`, `firstPublishedDate`, `minutesToRead`, `coverMedia`.

### 7. Blog Post (`Blog Post.dc.html`)
The single-post template. Contains the real "From Virtual Assistant to Virtual Operations Specialist" post as a worked example — **it is a layout reference, not content to hardcode.** Route as `/post/[slug]`.

Body typography is deliberate and must be preserved: 760px measure, 17px body at 1.85 line-height, 26px between paragraphs, 48px above section headings.

Wix rich-text nodes map onto these block types:

| Wix node | Renders as |
|---|---|
| `PARAGRAPH` | body paragraph |
| `HEADING` (h2/h3) | section heading |
| `BULLETED_LIST` item | rule-marked line |
| `BLOCKQUOTE` | centered italic pull quote |
| `TABLE` | editorial table (see the VA/VOS comparison) |
| `IMAGE` | `.plate`-style matted figure |

Also includes tag row, author block, and a related-posts grid (`@wix/blog` related query).

---

## Global Components

### Navigation
Sticky, `rgba(249,244,234,0.96)` with `backdrop-filter: blur(6px)`, bottom hairline. Items: Home, About, Services, Business Consulting, Portfolio, Shop, Blog + "Schedule a Consultation" button.

**Services dropdown** (desktop): opens on hover, lists the four pillars + Content Concierge + All Services. The menu is positioned at `top:100%` with its own `padding-top:14px` forming an unbroken hover bridge — do not reintroduce a gap between trigger and menu.

**Mobile:** below `1180px`, hamburger toggle, full-width stacked list, 44px+ targets.

### Footer
Four columns — brand blurb, Explore, Resources, Connect. Bottom bar: copyright + "Proudly powered by dependable and loyal military spouses and stay-at-home moms."

Social links open in new tabs:
- Instagram: `https://www.instagram.com/virtualhelpingh`
- LinkedIn: `https://www.linkedin.com/company/the-virtual-helping-hand/`
- Facebook: `https://www.facebook.com/profile.php?id=100091746784096`

---

## Responsive Behavior

Mobile-first fluid, not breakpoint-driven. Grids use `repeat(auto-fit, minmax(min(100%, {N}px), 1fr))` so they collapse naturally. `min(100%, …)` matters — without it, grids overflow on narrow screens.

Single JS breakpoint: **1180px** (desktop nav ↔ hamburger).

---

## Wix Headless Integration

### Architecture

**Self-managed headless against an EXISTING Wix site, deployed to Wix hosting.**

- **Backend:** the client's existing live Wix site (`thevirtualhelpinghand.com`) — already contains real contacts, blog posts, products, forms, and automations
- **Frontend:** built fresh from these designs
- **Hosting:** Wix hosting via the Wix CLI (not Vercel)
- **Framework:** **Astro** — Wix-managed hosting is built around it, and Wix's Astro integration provides automatic authentication and SEO support

### ⚠️ Critical: the existing site is the backend

A headless client has already been created on the client's **existing** Wix site. Its Client ID connects this frontend to that site's live data.

**Do not create a new Wix site or headless project.** The existing site holds real contacts, blog posts, and store products that must not be orphaned. No data migration is needed or wanted — the backend is unchanged and the client keeps using the same Wix dashboard.

The live site stays up and unaffected throughout the build. Only the final domain repoint switches visitors to the new frontend.

### Setup

Already done by the client:
- Headless client created on the existing site
- **Client ID** in hand
- Allowed redirect domain: `http://localhost:3000`
- Authorization redirect URI: `http://localhost:3000/login-callback`
- Login URL: `http://localhost:3000/login`

Still to do:
1. Put the Client ID in `.env` — **never hardcode it**, never commit it
2. Scaffold the Astro project, install `@wix/sdk` and the domain packages needed
3. **Verify the SDK reads real data from the existing site before building any UI** — fetch a blog post and a product and log them. If this fails, stop and fix it; everything downstream depends on it
4. Add production URLs to the Wix redirect settings at launch

### Repository

Use Git from the first commit. Repo lives in the **client's** GitHub account with the developer as a collaborator, so no ownership transfer is needed at handoff.

### Wix modules to wire

| Content | Wix module | Where it appears |
|---|---|---|
| Blog posts | `@wix/blog` | Blog page — featured + grid |
| Products | `@wix/stores` | Shop page |
| Contact form | `@wix/forms` | About page |
| Testimonials | Wix CMS collection | Homepage |
| Case studies | Wix CMS collection | Portfolio |
| Services | Wix CMS collection | Services page |
| FAQs | Wix CMS collection | Business Consulting |
| Bookings | Calendly embed *or* `@wix/bookings` | All CTAs |

**Blog and Stores already hold real content on the existing site** — those pages must render live data. The post titles and the sample article in the design files are real, lifted from the live blog, but they are there to show layout: route them through `@wix/blog` rather than hardcoding.

### Make it client-editable

The client is experienced with Wix but not with code. Push as much as possible into Wix CMS so she can update it herself without a developer: testimonials, client logos, credential badges, service names/descriptions/prices, pillar descriptions, FAQs, and case studies.

The rule of thumb: **if it's a list of similar things, it belongs in the CMS.** Only page structure and layout should require code changes.


### Contact form (About page)

Use **`@wix/forms`**, not a custom CMS write — submissions must land in the client's existing Wix dashboard so their current notifications, Contacts records, and automations keep working.

Fields, exactly as designed:

| Field | `name` | Type | Required | Label |
|---|---|---|---|---|
| Name | `name` | text | yes | "Name" |
| Email | `email` | email | yes | "Email" |
| Message | `message` | textarea, 5 rows | yes | "How can we help?" |

Submit button label is "Submit". Build these states:

- **Idle** — "Submit"
- **Submitting** — "Sending…", button disabled, form inputs disabled
- **Success** — replace the button label with "Thank You, We'll Be in Touch" and show a short confirmation line under the form; keep the submitted values visible rather than clearing them
- **Error** — inline message above the button: "Something went wrong. Please email danielle@thevirtualhelpinghand.com and we'll get right back to you." Button returns to "Submit" so they can retry
- **Validation** — validate on blur, not on keystroke. Invalid fields get a `#6b4423` message below the input; never rely on the browser's default validation bubbles

Enable **CAPTCHA** on the Wix form. A headless endpoint with no spam protection fills with junk quickly.

Styling stays as designed: transparent inputs, `1px solid rgba(43,31,22,0.28)` border, `4px` radius, `12px 13px` padding, Lora 15px. Focus state is the standard `2px solid #b68235` outline with the border switching to `#b68235`.

### Lead magnet: The Ultimate Hiring Bundle

**Not a product — an email opt-in.** It lives in its own section on the Shop page (`#hiring-bundle`), deliberately outside the product grid and cart. Do not route it through checkout; a $0 order defeats the purpose, which is capturing the contact.

Form fields: `firstName` (text, required) and `email` (email, required). Button label "Send Me the Bundle".

On submit, do all three:

1. **Create or update the Wix contact** (`@wix/crm`) with first name and email
2. **Subscribe them to the newsletter list** so they receive future campaigns — this is the actual goal
3. **Email the download link** — a Wix Automation triggered by the submission is the simplest route

States are built into the design: an inline validation message for a missing name or malformed email, then the form is replaced entirely by a "Check your inbox" confirmation panel. Keep that replacement behavior — it confirms success without a page change.

The consent line under the button ("We'll also send occasional tips and updates. Unsubscribe any time.") must stay for compliance.

Footer links labelled "Free Hiring Bundle" across all pages point at `#hiring-bundle` on the Shop page.

### CMS collections to create

**`Testimonials`** — `quote` (text), `authorName` (text), `authorTitle` (text), `featured` (boolean), `order` (number)

**`CaseStudies`** — `title`, `slug`, `client`, `challenge` (rich text), `whatWeDid` (rich text), `solution` (rich text), `outcome` (rich text), `servicesUsed` (tags), `coverImage` (image), `order`

**`Services`** — `name`, `description`, `price` (text — ranges like "From $1,497"), `pillar` (reference/enum: Consulting | Brand | Operations | Support), `order`

**`FAQs`** — `question`, `answer` (rich text), `page` (enum), `order`

**`ClientLogos`** — `name`, `category`, `logo` (image), `order`

**`Credentials`** — `name`, `detail`, `badge` (image), `order`

### Build order
1. Scaffold Astro + `@wix/sdk`, add the Client ID to `.env`
2. **Verify the SDK reads real blog posts and products from the existing site** — do not build UI until this works
3. Build the shared shell — nav, footer, and the design tokens as CSS custom properties
4. Static pages first: Homepage, About, Business Consulting
5. Wire the contact form (`@wix/forms`) and confirm a test submission appears in the client's Wix dashboard
6. Wire Blog (`@wix/blog`) and Shop (`@wix/stores`) against the real existing content
7. Create the CMS collections, then wire Services, testimonials, logos, and credentials
8. Deploy to Wix hosting with the Wix CLI
9. Add production URLs to Wix redirect settings, then repoint the domain **last**

### SEO — do not skip

The existing site has earned rankings. Preserving them is the highest-risk part of this project.

- **Match existing URL slugs** wherever possible: `/about`, `/services`, `/blog`, `/shop`, `/portfolio`
- **301 redirect** every URL that changes. The current site also has `/virtualoperationsspecialist` (VOS packages) and `/ultimatehiringbundle` — map these deliberately
- **Per-page `<title>` and `<meta name="description">`** — the design files specify the intended values in their logic classes
- **`sitemap.xml` and `robots.txt`** — Wix generated these automatically before; now they must be configured
- **Canonical URLs** on every page
- **Open Graph tags** for social sharing
- **Keep the Shop's JSON-LD product schema** (already in `Shop.dc.html`) and add Organization + LocalBusiness schema
- **Blog posts must be statically generated, not client-fetched** — use Astro's static generation with revalidation so crawlers see full HTML

Wix's Astro integration provides built-in SEO support; use it rather than hand-rolling.

### Notes
- Keep the **JSON-LD product schema** on Shop — it's there so products can rank individually
- Set `<title>` and `<meta name="description">` per page; the design files show the intended values in their logic classes
- Images marked `image-slot` are **placeholders**. Real photography goes in these positions; sizes and aspect ratios are specified in each slot.

---

## Assets

In `assets/` — cropped from the client's existing site, usable but low-resolution. Request originals where possible.

- `client-nonprofit.png`, `client-bbb.png`, `client-pcc.png`, `client-author.png` — "Honored to Have Worked With"
- `badge-wix-partner.png`, `badge-influential-women.png`, `badge-alignable.png` — "Trusted & Recognized By"

**Fonts:** Cormorant Garamond + Lora, both Google Fonts, SIL Open Font License.

---

## Content Status

**Real** (from the live site — do not alter): all service names and prices, VOS package tiers, the Miraque Gilbert-Woods testimonial, Danielle's bio, product names and prices, company description, all blog post titles and the full "From Virtual Assistant to Virtual Operations Specialist" article.

**Written for the redesign** (client should review): section headlines, pillar descriptions, process step copy, Business Consulting page copy, Blog page intro copy.

**Placeholder** (must be replaced): all photography. Blog listing excerpts for posts other than the featured one are intentionally empty — they come from Wix.

---

## Files

```
design-source/          The seven page designs — read these for layout, color, type, copy
  Homepage.dc.html
  About.dc.html
  Services.dc.html
  Business Consulting.dc.html
  Shop.dc.html
  Blog.dc.html
  Blog Post.dc.html

rendered-preview/       Open in a browser to see the intended result
  index.html            (Homepage)
  about.html
  services.html
  consulting.html

assets/                 Client logos and credential badges
```

Reading the design source: markup lives between `<x-dc>` tags; repeating content (services, pillars, products) lives in the `<script type="text/x-dc">` block at the bottom of each file as plain JS arrays — that's where prices and copy are easiest to lift. `{{ name }}` are template holes filled from those arrays.
