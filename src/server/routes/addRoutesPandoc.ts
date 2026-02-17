import type { Env } from "@/env/Env"
import { pandocHandlerFile } from "@/server/handlers/pandocHandlerFile"
import { pandocHandlerUrl } from "@/server/handlers/pandocHandlerUrl"
import { apiPathPandocFromFile } from "@client/apiPathPandocFromFile"
import { apiPathPandocFromUrl } from "@client/apiPathPandocFromUrl"
import { pandocResponseSchema } from "@client/pandocConvertResponseSchema"
import { pandocFromFileBodySchema } from "@client/pandocFromFileBodySchema"
import { pandocFromUrlQuerySchema } from "@client/pandocFromUrlQuerySchema"
import type { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import * as a from "valibot"
import { resultErrSchema } from "~utils/result/resultErrSchema"

export function addRoutesPandoc(app: Hono<{ Bindings: Env }>) {
  app.post(
    apiPathPandocFromUrl,
    describeRoute({
      description: "Convert a document using Pandoc (from URL)",
      tags: ["pandoc"],
      security: [],
      requestBody: {
        content: {
          "application/json": { schema: resolver(pandocFromUrlQuerySchema) as any },
        },
      },
      responses: {
        200: {
          description: "Conversion successful",
          content: {
            "text/markdown": { schema: resolver(a.string()) },
            "application/json": { schema: resolver(pandocResponseSchema) as any },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
      },
    }),
    pandocHandlerUrl,
  )

  const pandocConvertFileResponseSchema = a.object({
    fileBase64: a.string(),
  })

  app.put(
    apiPathPandocFromFile,
    describeRoute({
      description: "Convert a document using Pandoc (from base64 file)",
      tags: ["pandoc"],
      security: [],
      requestBody: {
        content: {
          "application/json": { schema: resolver(pandocFromFileBodySchema) as any },
        },
      },
      responses: {
        200: {
          description: "Conversion successful",
          content: {
            "text/markdown": { schema: resolver(a.string()) },
            "application/json": { schema: resolver(pandocConvertFileResponseSchema) as any },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
        500: {
          description: "Internal Server Error",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
      },
    }),
    pandocHandlerFile,
  )
}
