import { serverPortBun } from "../utils/serverPort.js"
import { createApp } from "./hono.js"
import { setHeaderTimingSingleValue } from "./headers/setHeaderTimingSingleValue.js"

const app = createApp()

Bun.serve({
  port: serverPortBun,
  async fetch(req) {
    const startedAt = Date.now()
    const response = await app.fetch(req)
    return setHeaderTimingSingleValue(response, "total", startedAt)
  },
})

console.log("Server running on http://localhost:" + serverPortBun)
