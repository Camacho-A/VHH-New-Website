// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

import react from '@astrojs/react';
import wix from '@wix/astro';
import wixHostingAdapter from '@wix/astro-wix-hosting-adapter';

// https://astro.build/config
export default defineConfig({
  // Used to build canonical/OG URLs and sitemap.xml. This is the eventual production
  // domain (README § SEO) — the actual domain repoint happens last (build order step 9),
  // this setting doesn't affect where the site is hosted during development.
  site: 'https://www.thevirtualhelpinghand.com',

  integrations: [sitemap(), react(), wix()],

  // README § SEO: "301 redirect every URL that changes." Mapped the two explicitly
  // named legacy URLs to their closest equivalent on the new site. Astro emits these as
  // static redirect pages at build time; confirm they resolve as true HTTP 301s once
  // deployed behind Wix hosting (build order step 9) rather than a client-side
  // meta-refresh, since that depends on how Wix's hosting layer serves them.
  redirects: {
    // Was its own page on the old site (VOS retainer packages); now a section on Services.
    '/virtualoperationsspecialist': '/services#packages',
    // Was a dedicated lead-magnet opt-in page; now the Shop's own #hiring-bundle opt-in
    // section (src/pages/shop.astro), which actually captures the contact via @wix/crm —
    // a real functional replacement, not just a safety net for old bookmarks/indexed URLs.
    '/ultimatehiringbundle': '/shop#hiring-bundle',
    // Was its own page (client logos etc.); folded into a homepage section in the redesign.
    '/portfolio': '/#portfolio',
  },

  adapter: wixHostingAdapter(),

  image: {
    domains: ['static.wixstatic.com'],
  },

  output: 'server',
});