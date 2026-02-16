import { Hono } from "hono"
import type { Env } from "@/env/Env"
import { addRoutesServer } from "@/server/routes/addRoutesServer"
import { addRoutesOpenapi } from "@/server/routes/addRoutesOpenapi"
import { addRoutesPandoc } from "@/server/routes/addRoutesPandoc"

export function createApp(): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>()

  addRoutesServer(app)
  addRoutesOpenapi(app)
  addRoutesPandoc(app)

  return app
}
