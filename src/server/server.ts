import { serverPortBun } from "@/utils/serverPort"
import { createApp } from "@/server/hono"
import { setHeaderTimingSingleValue } from "@/server/headers/setHeaderTimingSingleValue"

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
