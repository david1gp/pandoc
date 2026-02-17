import type { Env } from "@/env/Env"
import { pandocHandlerFile } from "@/server/handlers/pandocHandlerFile"
import { pandocHandlerUrl } from "@/server/handlers/pandocHandlerUrl"
import { pandocResponseSchema } from "@client/pandocConvertResponseSchema"
import { pandocFromFileBodySchema } from "@client/pandocFromFileBodySchema"
import { pandocFromUrlQuerySchema } from "@client/pandocFromUrlQuerySchema"
import type { Hono } from "hono"
import { describeRoute, openAPIRouteHandler, resolver } from "hono-openapi"
import * as a from "valibot"
import { resultErrSchema } from "~utils/result/resultErrSchema"

const packageVersion = "0.1.0"

export function addRoutesOpenapi(app: Hono<{ Bindings: Env }>) {
  const openApiOptions = {
    documentation: {
      info: {
        title: "@adaptive-ds/pandoc - Document Conversion Service",
        version: packageVersion,
        description: `A document conversion service powered by Pandoc.

* **Convert documents** - Transform between various document formats (PDF, Markdown, HTML, etc.)
* **Fast & Simple** - Send base64-encoded files and receive converted output
* **API-first** - Simple REST API for programmatic document conversion

**Quick Links**

- Pandoc Manual: [https://pandoc.org/MANUAL.html](https://pandoc.org/MANUAL.html)
- Pandoc web: [https://pandoc.org/app/](https://pandoc.org/app/)
- code - [https://github.com/david1gp/pandoc](https://github.com/david1gp/pandoc)
- npm - [https://www.npmjs.com/package/@adaptive-ds/pandoc](https://www.npmjs.com/package/@adaptive-ds/pandoc)
`,
      },
    },
  }

  app.get(
    "/openapi",
    describeRoute({
      description: "Get OpenAPI specification",
      tags: ["openapi"],
      security: [],
      responses: {
        200: {
          description: "OpenAPI JSON specification",
          content: {
            "application/json": { schema: resolver(a.string()) },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
      },
    }),
    openAPIRouteHandler(app, openApiOptions),
  )

  app.get(
    "/doc",
    describeRoute({
      description: "Get OpenAPI specification (redirect)",
      tags: ["openapi"],
      security: [],
      responses: {
        200: {
          description: "OpenAPI JSON specification",
          content: {
            "application/json": { schema: resolver(a.string()) },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
      },
    }),
    openAPIRouteHandler(app, openApiOptions),
  )

  addRoutesPandocOpenapi(app)
  addRoutesOpenapiSwagger(app)
}

export function addRoutesOpenapiSwagger(app: Hono<{ Bindings: Env }>) {
  app.get(
    "/",
    describeRoute({
      description: "Swagger UI documentation interface",
      tags: ["openapi"],
      security: [],
      responses: {
        200: {
          description: "Swagger UI HTML page",
          content: {
            "text/html": { schema: resolver(a.string()) },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
      },
    }),
    async (c) => {
      const uiHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Adaptive Pandoc API - Swagger UI</title>

  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.31.0/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.31.0/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "/doc",
      dom_id: "#swagger-ui",
      deepLinking: true,
      presets: [
        SwaggerUIBundle.presets.apis,
        SwaggerUIBundle.SwaggerUIStandalonePreset
      ],
      plugins: [
        SwaggerUIBundle.plugins.DownloadUrl
      ]
    });
  </script>
</body>
</html>`
      return c.html(uiHtml)
    },
  )
}

export function addRoutesPandocOpenapi(app: Hono<{ Bindings: Env }>) {
  app.post(
    "/convert/url",
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
    "/convert/file",
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
