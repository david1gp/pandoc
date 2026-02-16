import { describe, expect, test, beforeAll, afterAll } from "bun:test"
import { serverPortBun } from "@/utils/serverPort"
import { spawn, type ChildProcess } from "node:child_process"
import { readFile } from "node:fs/promises"
import { apiPathPandoc } from "@client/apiBasePandoc"

const BASE_URL = `http://localhost:${serverPortBun}`

let serverProcess: ChildProcess | null = null
let didStartServer = false

async function isServerRunning(): Promise<boolean> {
  try {
    const response = await fetch(BASE_URL + "/health", { signal: AbortSignal.timeout(1500) })
    return response.ok
  } catch {
    return false
  }
}

beforeAll(async () => {
  console.log("Checking if server is already running...")

  if (await isServerRunning()) {
    console.log(`Server already running at ${BASE_URL} → skipping start`)
    return
  }

  console.log("No running server detected → starting server...")

  serverProcess = spawn("bun", ["run", "src/server/server.ts"], {
    stdio: "inherit",
    shell: true,
    cwd: "/home/david/Coding/adaptive/pandoc",
  })

  didStartServer = true

  const startTime = Date.now()
  while (Date.now() - startTime < 30000) {
    if (await isServerRunning()) {
      console.log(`Server ready at ${BASE_URL} ✓`)
      return
    }
    await Bun.sleep(400)
  }

  throw new Error("Server failed to become healthy within 30 seconds")
})

afterAll(async () => {
  if (!didStartServer) {
    console.log("We did not start the server → skipping shutdown")
    return
  }

  console.log("Shutting down server...")

  if (serverProcess && !serverProcess.killed) {
    serverProcess.kill("SIGTERM")

    await new Promise<void>((resolve) => {
      serverProcess?.once("exit", () => resolve())
      setTimeout(resolve, 5000)
    })

    console.log("Server shutdown complete.")
  }
})

describe("pandoc service", () => {
  test("health endpoint", async () => {
    const response = await fetch(BASE_URL + "/health")
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("OK")
  })

  test("memoryUsage endpoint", async () => {
    const response = await fetch(BASE_URL + "/memoryUsage")
    expect(response.status).toBe(200)
    const json = await response.json() as { memoryUsageMB: number }
    expect(json).toHaveProperty("memoryUsageMB")
    expect(typeof json.memoryUsageMB).toBe("number")
  })

  test("openapi endpoint returns JSON", async () => {
    const response = await fetch(BASE_URL + "/openapi")
    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("application/json")
    const json = await response.json() as { openapi: string; info: { title: string } }
    expect(json).toHaveProperty("openapi")
    expect(json).toHaveProperty("info")
    expect(json.info.title).toContain("pandoc")
  })

  test("swagger ui endpoint returns HTML", async () => {
    const response = await fetch(BASE_URL + apiPathPandoc)
    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")?.toLowerCase()).toContain("text/html")
    const html = await response.text()
    expect(html).toContain("swagger-ui")
    expect(html).toContain("/doc")
  })

  test("pandoc convert PDF to md with base64 input", async () => {
    const pdfPath = "/home/david/Coding/adaptive/pandoc/data/2022-07-tor-tajikistan-leg.pdf"
    const pdfBuffer = await readFile(pdfPath)
    const base64 = Buffer.from(pdfBuffer).toString("base64")

    const response = await fetch(BASE_URL + apiPathPandoc, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64,
        fileName: "2022-07-tor-tajikistan-leg.pdf",
        outputFormat: "markdown",
      }),
    })

    expect(response.status).toBe(200)
    const contentType = response.headers.get("Content-Type")
    expect(contentType).toBe("text/markdown")

    const text = await response.text()
    expect(text.length).toBeGreaterThan(100)
    expect(text.toLowerCase()).toContain("terms of reference")
  })

  test("pandoc returns error for unsupported format", async () => {
    const pdfPath = "/home/david/Coding/adaptive/pandoc/data/2022-07-tor-tajikistan-leg.pdf"
    const pdfBuffer = await readFile(pdfPath)
    const base64 = Buffer.from(pdfBuffer).toString("base64")

    const response = await fetch(BASE_URL + apiPathPandoc, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        file: base64,
        fileName: "test.pdf",
        outputFormat: "unsupported_format",
      }),
    })

    expect(response.status).toBe(400)
    const json = await response.json() as { success: boolean }
    expect(json.success).toBe(false)
  })

  test("pandoc returns error when no input provided", async () => {
    const response = await fetch(BASE_URL + apiPathPandoc, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)
    const json = await response.json() as { success: boolean }
    expect(json.success).toBe(false)
  })
})
