import type { Hono } from "hono"
import type { Env } from "@/env/Env"

export function addRoutesServer(app: Hono<{ Bindings: Env }>) {
  app.get("/memoryUsage", async (c) => {
    const memoryUsageMB = Math.trunc(process.memoryUsage().rss / 1024 / 1024)
    return c.json({ memoryUsageMB })
  })

  app.get("/health", (c) => c.text("OK"))
}
