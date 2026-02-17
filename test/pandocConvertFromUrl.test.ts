import { apiPandocConvertFromUrl } from "@client/apiPandocConvertFromUrl"
import { apiPathPandocFromUrl } from "@client/apiPathPandocFromUrl"
import { describe, expect, test } from "bun:test"
import { BASE_URL } from "./setup"

describe("pandoc convert from url", () => {
  describe("client library", () => {
    test("returns error when url is empty", async () => {
      const result = await apiPandocConvertFromUrl({ url: "", outputFormat: "markdown" }, BASE_URL)

      expect(result.success).toBe(false)
    })
  })

  describe("direct fetch", () => {
    test("returns error when no input provided", async () => {
      const response = await fetch(BASE_URL + apiPathPandocFromUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({}),
      })

      expect(response.status).toBe(400)
      const json = (await response.json()) as { success: boolean }
      expect(json.success).toBe(false)
    })

    test("plain text format returns plain text", async () => {
      const response = await fetch(BASE_URL + apiPathPandocFromUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: "https://raw.githubusercontent.com/david1gp/pandoc/main/README.md",
          inputFormat: "markdown",
          outputFormat: "html",
        }),
      })

      expect(response.status).toBe(200)
      const contentType = response.headers.get("Content-Type")
      expect(contentType).toBe("text/html")

      const text = await response.text()
      expect(text).toContain("<h1")
    })
  })
})
