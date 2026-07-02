// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// 배포 시 .env 의 PUBLIC_SITE_URL 로 교체된다 (sitemap/RSS/canonical 에 사용)
const site = process.env.PUBLIC_SITE_URL || 'https://laughtale.pages.dev';

export default defineConfig({
  site,
  integrations: [react(), mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: 'night-owl',
      wrap: true,
    },
  },
});
