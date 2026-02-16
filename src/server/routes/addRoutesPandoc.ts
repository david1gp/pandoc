import type { Hono } from "hono"
import type { Env } from "@/env/Env"
import { pandocHandlerPost } from "@/server/handlers/pandocHandlerPost"
import { pandocHandlerPut } from "@/server/handlers/pandocHandlerPut"

export function addRoutesPandoc(app: Hono<{ Bindings: Env }>) {
  app.post("/", pandocHandlerPost)
  app.put("/", pandocHandlerPut)
}
