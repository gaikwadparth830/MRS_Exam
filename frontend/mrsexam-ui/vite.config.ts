import fs from 'node:fs'
import path from 'node:path'

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

interface SwaggerDocument {
  servers?: Array<{ url?: string }>
  paths?: Record<string, unknown>
}

const readSwagger = (): SwaggerDocument => {
  const swaggerPath = path.resolve(__dirname, 'root', 'swagger.json')

  if (!fs.existsSync(swaggerPath)) {
    return {}
  }

  const content = fs.readFileSync(swaggerPath, 'utf-8')
  return JSON.parse(content) as SwaggerDocument
}

const extractProxyPrefixes = (paths: Record<string, unknown>): string[] => {
  const prefixes = new Set<string>()

  for (const route of Object.keys(paths)) {
    const firstSegment = route.split('/').filter(Boolean)[0]

    if (!firstSegment) {
      continue
    }

    prefixes.add(`/${firstSegment}`)
  }

  return Array.from(prefixes)
}

const swagger = readSwagger()
const swaggerTarget = swagger.servers?.[0]?.url
const proxyTarget = process.env.VITE_PROXY_TARGET ?? swaggerTarget ?? 'http://localhost:5000'
const pathPrefixes = extractProxyPrefixes(swagger.paths ?? {})

const proxy = pathPrefixes.reduce<Record<string, object>>((acc, prefix) => {
  acc[prefix] = {
    target: proxyTarget,
    changeOrigin: true,
    secure: false,
  }

  return acc
}, {})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy,
  },
})
