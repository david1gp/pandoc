import { serverPortBun } from "@/utils/serverPort"
import { afterAll, beforeAll } from "bun:test"
import { spawn, type ChildProcess } from "node:child_process"

const BASE_URL = `http://localhost:${serverPortBun}`
const HEALTH_URL = BASE_URL + "/health"

let serverProcess: ChildProcess | null = null
let didStartServer = false

async function isServerRunning(): Promise<boolean> {
  try {
    const response = await fetch(HEALTH_URL, { signal: AbortSignal.timeout(1500) })
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

export { BASE_URL }
