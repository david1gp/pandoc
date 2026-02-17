import type { Env } from "@/env/Env"
import { addRoutesOpenapi } from "@/server/routes/addRoutesOpenapi"
import { addRoutesServer } from "@/server/routes/addRoutesServer"
import { Hono } from "hono"
import { serveStatic } from "hono/bun"

export function createApp(): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>()

  app.use("/*", async (c, next) => {
    const res = await serveStatic({ root: "./public" })(c, next)
    if (res) {
      // (3 days = 259200 seconds)
      res.headers.set("Cache-Control", "public, max-age=259200, immutable")
    }
    return res
  })

  addRoutesServer(app)
  addRoutesOpenapi(app)

  return app
}
