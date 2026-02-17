import type { Env } from "@/env/Env"
import { pandocHandlerFile } from "@/server/handlers/pandocHandlerFile"
import { pandocHandlerUrl } from "@/server/handlers/pandocHandlerUrl"
import { apiPathPandocFromFile } from "@client/apiPathPandocFromFile"
import { apiPathPandocFromUrl } from "@client/apiPathPandocFromUrl"
import { binaryFormats, plainTextFormats } from "@client/pandocFormatsText"
import { pandocFromFileBinaryBodySchema } from "@client/pandocFromFileBinaryBodySchema"
import { pandocFromFileTextBodySchema } from "@client/pandocFromFileTextBodySchema"
import { pandocFromUrlBinaryQuerySchema } from "@client/pandocFromUrlBinaryQuerySchema"
import { pandocFromUrlTextQuerySchema } from "@client/pandocFromUrlTextQuerySchema"
import type { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import * as a from "valibot"
import { resultErrSchema } from "~utils/result/resultErrSchema"

const pandocFromFileBodySchema = a.union([
  pandocFromFileTextBodySchema,
  pandocFromFileBinaryBodySchema,
])

const pandocFromUrlQuerySchema = a.union([
  pandocFromUrlTextQuerySchema,
  pandocFromUrlBinaryQuerySchema,
])

export function addRoutesPandoc(app: Hono<{ Bindings: Env }>) {
  const plainTextFormatsDescription = `
**Plain Text Formats** (returned as plain text):
${plainTextFormats.join(", ")}

**Binary Formats** (returned as base64 encoded plain text):
${binaryFormats.join(", ")}
`

  app.post(
    apiPathPandocFromUrl,
    describeRoute({
      description: `Convert a document using Pandoc (from URL)

${plainTextFormatsDescription}`,
      tags: ["pandoc"],
      security: [],
      requestBody: {
        content: {
          "application/json": { schema: resolver(pandocFromUrlQuerySchema) as any },
        },
      },
      responses: {
        200: {
          description: "Conversion successful - returns plain text or base64 encoded content",
          content: {
            "text/plain": { schema: resolver(a.string()) },
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

  app.put(
    apiPathPandocFromFile,
    describeRoute({
      description: `Convert a document using Pandoc (from base64 file)

${plainTextFormatsDescription}`,
      tags: ["pandoc"],
      security: [],
      requestBody: {
        content: {
          "application/json": { schema: resolver(pandocFromFileBodySchema) as any },
        },
      },
      responses: {
        200: {
          description: "Conversion successful - returns plain text or base64 encoded content",
          content: {
            "text/plain": { schema: resolver(a.string()) },
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
