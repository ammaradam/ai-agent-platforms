import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// Change `site` to your real domain before deploying (used for RSS, sitemap and link previews).
export default defineConfig({
  site: process.env.SITE_URL || 'https://ammar-adam.vercel.app',
  integrations: [react(), tailwind({ applyBaseStyles: false }), sitemap()],
  trailingSlash: 'ignore',
});
