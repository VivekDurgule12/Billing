import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defaultInventory } from './src/data/defaultInventory.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const inventoryFile = path.join(__dirname, 'data', 'inventory.json')

const sendJson = (res, statusCode, payload) => {
  res.statusCode = statusCode
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(payload))
}

const readBody = (req) => new Promise((resolve, reject) => {
  let body = ''
  req.on('data', (chunk) => {
    body += chunk
  })
  req.on('end', () => resolve(body))
  req.on('error', reject)
})

const ensureInventoryFile = async () => {
  await fs.mkdir(path.dirname(inventoryFile), { recursive: true })

  try {
    const raw = await fs.readFile(inventoryFile, 'utf8')
    const inventory = JSON.parse(raw)
    if (Array.isArray(inventory)) {
      return inventory
    }
  } catch {
    // Missing or invalid file gets replaced with the default inventory.
  }

  await fs.writeFile(inventoryFile, `${JSON.stringify(defaultInventory, null, 2)}\n`)
  return defaultInventory
}

const installInventoryMiddleware = (middlewares) => {
  middlewares.use('/api/inventory', async (req, res) => {
      try {
        if (req.method === 'GET') {
          sendJson(res, 200, await ensureInventoryFile())
          return
        }

        if (req.method === 'PUT') {
          const inventory = JSON.parse(await readBody(req))
          if (!Array.isArray(inventory)) {
            sendJson(res, 400, { error: 'Inventory must be an array' })
            return
          }

          await fs.mkdir(path.dirname(inventoryFile), { recursive: true })
          await fs.writeFile(inventoryFile, `${JSON.stringify(inventory, null, 2)}\n`)
          sendJson(res, 200, inventory)
          return
        }

        sendJson(res, 405, { error: 'Method not allowed' })
      } catch (error) {
        sendJson(res, 500, { error: error.message })
      }
  })
}

const inventoryApi = () => ({
  name: 'inventory-json-api',
  configureServer(server) {
    installInventoryMiddleware(server.middlewares)
  },
  configurePreviewServer(server) {
    installInventoryMiddleware(server.middlewares)
  },
})

export default defineConfig({
  plugins: [
    inventoryApi(),
    tailwindcss(),
  ],
})
