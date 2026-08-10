// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  // Used to build canonical/OG URLs and sitemap.xml. This is the eventual production
  // domain (README § SEO) — the actual domain repoint happens last (build order step 9),
  // this setting doesn't affect where the site is hosted during development.
  site: 'https://www.thevirtualhelpinghand.com',
});
