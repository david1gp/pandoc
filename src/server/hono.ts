import { Hono } from "hono"
import type { Env } from "@/env/Env"
import { addRoutesServer } from "@/server/routes/addRoutesServer"
import { addRoutesOpenapi } from "@/server/routes/addRoutesOpenapi"

export function createApp(): Hono<{ Bindings: Env }> {
  const app = new Hono<{ Bindings: Env }>()

  addRoutesServer(app)
  addRoutesOpenapi(app)

  return app
}
