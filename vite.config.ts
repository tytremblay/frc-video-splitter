// Stub for shadcn framework detection — not used by the actual build (electron.vite.config.ts)
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({ plugins: [react()] })
