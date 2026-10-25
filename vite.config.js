import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolveApiDomain } from './src/constants/apiDomain.js'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // VITE_API_DOMAIN (Vercel project env or .env files) picks the gateway at build time; unset = DEV.
  // Resolved and validated HERE so a bad value fails the build and only the chosen host is inlined
  // into the bundle (a UAT bundle never contains the DEV :8443 host, and vice versa).
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  const apiDomain = resolveApiDomain(env.VITE_API_DOMAIN)
  return {
    plugins: [react()],
    define: {
      __PORTAL_API_DOMAIN__: JSON.stringify(apiDomain),
    },
    server: {
      port: 3001
    },
  }
})
