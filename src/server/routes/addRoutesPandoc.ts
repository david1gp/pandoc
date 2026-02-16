import type { Hono } from "hono"
import type { Env } from "@/env/Env"
import { pandocHandler } from "@/server/handlers/pandocHandler"

export function addRoutesPandoc(app: Hono<{ Bindings: Env }>) {
  app.post("/pandoc", pandocHandler)
}
