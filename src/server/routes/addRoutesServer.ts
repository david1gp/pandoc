import type { Env } from "@/env/Env"
import { packageVersion } from "@/env/packageVersion"
import type { HonoContext } from "@/utils/HonoContext"
import type { Hono } from "hono"
import { describeRoute, resolver } from "hono-openapi"
import * as a from "valibot"

export function addRoutesServer(app: Hono<{ Bindings: Env }>) {
  app.get(
    "/health",
    describeRoute({
      description: "Health check",
      tags: ["service"],
      security: [],
      responses: {
        200: {
          description: "Service is healthy",
          content: {
            "text/plain": { schema: resolver(a.string()) },
          },
        },
      },
    }),
    (c) => c.text("OK", 200, { "Content-Type": "text/plain" }),
  )

  app.get(
    "/version",
    describeRoute({
      description: "Get service version",
      tags: ["service"],
      security: [],
      responses: {
        200: {
          description: "Version string",
          content: {
            "text/plain": { schema: resolver(a.string()) },
          },
        },
      },
    }),
    versionHandler,
  )

  app.get(
    "/memoryUsage",
    describeRoute({
      description: "Get current memory usage",
      tags: ["service"],
      security: [],
      responses: {
        200: {
          description: "Memory usage in MB",
          content: {
            "application/json": {
              schema: resolver(a.object({ memoryUsageMB: a.number() })),
            },
          },
        },
      },
    }),
    async (c) => {
      const memoryUsageMB = Math.trunc(process.memoryUsage().rss / 1024 / 1024)
      return c.json({ memoryUsageMB })
    },
  )
}

async function versionHandler(c: HonoContext): Promise<Response> {
  return c.text(packageVersion, 200, { "Content-Type": "text/plain" })
}
