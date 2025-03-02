// @ts-check
import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import galleryIntegration from './src/lib/galleryIntegration';

// https://astro.build/config
export default defineConfig({
  integrations: [tailwind(), react(), galleryIntegration],
});