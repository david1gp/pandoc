import type { Hono } from "hono"
import type { Env } from "@/env/Env"
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

- code - [https://github.com/david1gp/pandoc](https://github.com/david1gp/pandoc)
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
  const pandocInputSchema = a.object({
    url: a.optional(a.string()),
    file: a.optional(a.string()),
    fileName: a.optional(a.string()),
    contentType: a.optional(a.string()),
    outputFormat: a.optional(a.string()),
    token: a.optional(a.string()),
  })

  const pandocOutputSchema = a.object({
    url: a.string(),
  })

  app.post(
    "/pandoc",
    describeRoute({
      description: "Convert a document using Pandoc",
      tags: ["pandoc"],
      security: [],
      requestBody: {
        content: {
          "application/json": { schema: resolver(pandocInputSchema) as any },
        },
      },
      responses: {
        200: {
          description: "Conversion successful",
          content: {
            "text/markdown": { schema: resolver(a.string()) },
            "application/json": { schema: resolver(pandocOutputSchema) as any },
          },
        },
        400: {
          description: "Bad Request",
          content: {
            "application/json": { schema: resolver(resultErrSchema) },
          },
        },
        401: {
          description: "Unauthorized",
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
    (c) => c.text(""),
  )
}
