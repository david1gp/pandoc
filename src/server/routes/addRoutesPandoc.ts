import type { Env } from "@/env/Env"
import { pandocHandlerFile } from "@/server/handlers/pandocHandlerFile"
import { pandocHandlerUrl } from "@/server/handlers/pandocHandlerUrl"
import { apiPathPandocFromFile } from "@client/apiPathPandocFromFile"
import { apiPathPandocFromUrl } from "@client/apiPathPandocFromUrl"
import type { Hono } from "hono"

export function addRoutesPandoc(app: Hono<{ Bindings: Env }>) {
  app.post(apiPathPandocFromUrl, pandocHandlerUrl)
  app.put(apiPathPandocFromFile, pandocHandlerFile)
}
