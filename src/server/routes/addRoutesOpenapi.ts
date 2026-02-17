import type { Env } from "@/env/Env"
import { packageVersion } from "@/env/packageVersion"
import type { Hono } from "hono"
import { describeRoute, openAPIRouteHandler, resolver } from "hono-openapi"
import * as a from "valibot"
import { resultErrSchema } from "~utils/result/resultErrSchema"

export function addRoutesOpenapi(app: Hono<{ Bindings: Env }>) {
  const openApiOptions = {
    documentation: {
      info: {
        title: "@adaptive-ds/pandoc - Document Conversion Service",
        version: packageVersion,
        description: `A document conversion service powered by Pandoc.

* Convert documents - Transform between various document formats (PDF, Markdown, HTML, etc.)
* Fast & Simple - Send base64-encoded files and receive converted output
* API-first - Simple REST API for programmatic document conversion

Quick Links

- code - [https://github.com/david1gp/pandoc](https://github.com/david1gp/pandoc)
- npm - [https://www.npmjs.com/package/@adaptive-ds/pandoc](https://www.npmjs.com/package/@adaptive-ds/pandoc)
- pandoc manual: [https://pandoc.org/MANUAL.html](https://pandoc.org/MANUAL.html)
- pandoc web: [https://pandoc.org/app/](https://pandoc.org/app/)
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

  <link rel="icon" type="image/svg+xml" href="/logo.svg" />
  <link rel="icon" type="image/x-icon" href="/favicon.ico" />

  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5.31.0/swagger-ui.css">
</head>
<body>
  <div id="swagger-ui"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5.31.0/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: "/openapi",
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
