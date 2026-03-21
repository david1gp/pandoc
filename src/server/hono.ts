import type { Env } from "../env/Env.js"
import { addRoutesOpenapi } from "./routes/addRoutesOpenapi.js"
import { addRoutesPandoc } from "./routes/addRoutesPandoc.js"
import { addRoutesServer } from "./routes/addRoutesServer.js"
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

  addRoutesOpenapi(app)
  addRoutesServer(app)
  addRoutesPandoc(app)

  return app
}
