import { apiPandocConvertFromFileText } from "../client/apiPandocConvertFromFileText.js"
import { apiPandocConvertFromFileBinary } from "../client/apiPandocConvertFromFileBinary.js"
import { apiPathPandocFromFile } from "../client/apiPathPandocFromFile.js"
import { describe, expect, test } from "bun:test"
import { BASE_URL } from "./setup.js"

describe("pandoc convert from file", () => {
  describe("client library", () => {
    test("plain text format returns string", async () => {
      const markdown = "# Hello World\n\nThis is a test."
      const base64 = Buffer.from(markdown).toString("base64")

      const result = await apiPandocConvertFromFileText({
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

    test("binary format returns Blob", async () => {
      const markdown = "# Test"
      const base64 = Buffer.from(markdown).toString("base64")

      const result = await apiPandocConvertFromFileBinary({
        fileBase64: base64,
        inputFormat: "markdown",
        outputFormat: "docx",
      }, BASE_URL)

      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data).toBeInstanceOf(Blob)
        expect(result.data.size).toBeGreaterThan(0)
      }
    })

    test("binary input can return text", async () => {
      const markdown = "# Binary Input\n\nThis document should round-trip through docx."
      const inputBase64 = Buffer.from(markdown).toString("base64")

      const docxResult = await apiPandocConvertFromFileBinary({
        fileBase64: inputBase64,
        inputFormat: "markdown",
        outputFormat: "docx",
      }, BASE_URL)

      expect(docxResult.success).toBe(true)
      if (!docxResult.success) return

      const docxBase64 = await docxResult.data.text()

      const markdownResult = await apiPandocConvertFromFileText({
        fileBase64: docxBase64,
        inputFormat: "docx",
        outputFormat: "markdown",
      }, BASE_URL)

      expect(markdownResult.success).toBe(true)
      if (markdownResult.success) {
        expect(markdownResult.data.toLowerCase()).toContain("binary input")
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
