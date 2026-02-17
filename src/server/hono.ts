import { Hono } from "hono"
import { serveStatic } from "hono/bun"
import type { Env } from "@/env/Env"
import { addRoutesServer } from "@/server/routes/addRoutesServer"
import { addRoutesOpenapi } from "@/server/routes/addRoutesOpenapi"

export function createApp(): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>()

  app.use("/*", serveStatic({ root: "./public" }))

  addRoutesServer(app)
  addRoutesOpenapi(app)

  return app
}
