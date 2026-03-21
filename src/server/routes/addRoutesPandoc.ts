import type { Env } from "../../env/Env.js"
import { pandocHandlerFile } from "../handlers/pandocHandlerFile.js"
import { pandocHandlerUrl } from "../handlers/pandocHandlerUrl.js"
import { resultErrSchema } from "@adaptive-ds/result/resultErrSchema.js"
import { apiPathPandocFromFile } from "../../../client/apiPathPandocFromFile.js"
import { apiPathPandocFromUrl } from "../../../client/apiPathPandocFromUrl.js"
import { binaryFormats, plainTextFormats } from "../../../client/pandocFormatsText.js"
import { pandocFromFileBinaryBodySchema } from "../../../client/pandocFromFileBinaryBodySchema.js"
import { pandocFromFileTextBodySchema } from "../../../client/pandocFromFileTextBodySchema.js"
import { pandocFromUrlBinaryQuerySchema } from "../../../client/pandocFromUrlBinaryQuerySchema.js"
import { pandocFromUrlTextQuerySchema } from "../../../client/pandocFromUrlTextQuerySchema.js"
import type { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import * as a from "valibot"

const pandocFromFileBodySchema = a.union([pandocFromFileTextBodySchema, pandocFromFileBinaryBodySchema])

const pandocFromUrlQuerySchema = a.union([pandocFromUrlTextQuerySchema, pandocFromUrlBinaryQuerySchema])

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
