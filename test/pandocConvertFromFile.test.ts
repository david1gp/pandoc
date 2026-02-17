import { apiPandocConvertFromFile } from "@client/apiPandocConvertFromFile"
import { apiPathPandocFromFile } from "@client/apiPathPandocFromFile"
import { describe, expect, test } from "bun:test"
import { BASE_URL } from "./setup"

describe("pandoc convert from file", () => {
  describe("client library", () => {
    test("plain text format returns string", async () => {
      const markdown = "# Hello World\n\nThis is a test."
      const base64 = Buffer.from(markdown).toString("base64")

      const result = await apiPandocConvertFromFile({
        fileBase64: base64,
        inputFormat: "markdown",
        outputFormat: "html",
      }, BASE_URL)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data).toBe("string")
        expect(result.data).toContain("<h1 id=\"hello-world\">Hello World</h1>")
      }
    })

    test("binary format returns decoded string", async () => {
      const markdown = "# Test"
      const base64 = Buffer.from(markdown).toString("base64")

      const result = await apiPandocConvertFromFile({
        fileBase64: base64,
        inputFormat: "markdown",
        outputFormat: "docx",
      }, BASE_URL)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(typeof result.data).toBe("string")
        expect(result.data.length).toBeGreaterThan(0)
      }
    })
  })

  describe("direct fetch", () => {
    test("plain text format returns plain text", async () => {
      const markdown = "# Hello World\n\nThis is a test."
      const base64 = Buffer.from(markdown).toString("base64")

      const response = await fetch(BASE_URL + apiPathPandocFromFile, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileBase64: base64,
          inputFormat: "markdown",
          outputFormat: "html",
        }),
      })

      expect(response.status).toBe(200)
      const contentType = response.headers.get("Content-Type")
      expect(contentType).toBe("text/html")

      const text = await response.text()
      expect(text).toContain("<h1 id=\"hello-world\">Hello World</h1>")
    })

    test("binary format returns base64 encoded plain text", async () => {
      const markdown = "# Test"
      const base64 = Buffer.from(markdown).toString("base64")

      const response = await fetch(BASE_URL + apiPathPandocFromFile, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileBase64: base64,
          inputFormat: "markdown",
          outputFormat: "docx",
        }),
      })

      expect(response.status).toBe(200)

      const text = await response.text()
      expect(typeof text).toBe("string")
      expect(text.length).toBeGreaterThan(0)
    })
  })
})
