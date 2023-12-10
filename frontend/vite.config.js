/* eslint-disable no-undef */
import { defineConfig } from 'vite'

import dotenv from 'dotenv'
import fs from 'fs'
import react from '@vitejs/plugin-react'

if (process.env.NODE_ENV !== 'production') {
  dotenv.config()
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    https: {
      key: fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8'),
      cert: fs.readFileSync(process.env.CERTIFICATE_PATH, 'utf8'),
    },
  }
})
