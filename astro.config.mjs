import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// The public address, used for canonical links, RSS, the sitemap and link previews.
export default defineConfig({
  site: process.env.SITE_URL || 'https://www.ammaradam.dev',
  integrations: [react(), tailwind({ applyBaseStyles: false }), sitemap()],
  trailingSlash: 'ignore',
});
