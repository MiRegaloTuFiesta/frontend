// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    // Estas se pueden sobreescribir en producción con NUXT_WP_API_URL, etc.
    wpApiUrl: process.env.WP_API_URL || '',
    wpApiUser: process.env.WP_API_USER || '',
    wpApiPass: process.env.WP_API_PASS || '',
    wpSsoSecret: process.env.SSO_SECRET || '',
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:8000'
    }
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
})
