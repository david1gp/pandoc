import { describe, expect, test } from "bun:test"
import { BASE_URL } from "./setup"

describe("server", () => {
  test("health", async () => {
    const response = await fetch(BASE_URL + "/health")
    expect(response.status).toBe(200)
    expect(await response.text()).toBe("OK")
  })

  test("memoryUsage", async () => {
    const response = await fetch(BASE_URL + "/memoryUsage")
    expect(response.status).toBe(200)
    const json = (await response.json()) as { memoryUsageMB: number }
    expect(json).toHaveProperty("memoryUsageMB")
    expect(typeof json.memoryUsageMB).toBe("number")
  })

  test("openapi", async () => {
    const response = await fetch(BASE_URL + "/openapi")
    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")).toBe("application/json")
    const json = (await response.json()) as { openapi: string; info: { title: string } }
    expect(json).toHaveProperty("openapi")
    expect(json).toHaveProperty("info")
    expect(json.info.title).toContain("pandoc")
  })

  test("swagger-ui", async () => {
    const response = await fetch(BASE_URL + "/")
    expect(response.status).toBe(200)
    expect(response.headers.get("Content-Type")?.toLowerCase()).toContain("text/html")
    const html = await response.text()
    expect(html).toContain("swagger-ui")
    expect(html).toContain("/doc")
  })
})
