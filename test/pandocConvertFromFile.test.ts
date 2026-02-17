import { apiPathPandocFromFile } from "@client/apiPathPandocFromFile"
import { describe, expect, test } from "bun:test"
import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { BASE_URL } from "./setup"

const testDir = import.meta.dirname

describe("pandoc convert from file", () => {
  test("pandoc convert PDF to md with base64 input", async () => {
    const pdfPath = join(testDir, "test.pdf")
    const pdfBuffer = await readFile(pdfPath)
    const base64 = Buffer.from(pdfBuffer).toString("base64")

    const response = await fetch(BASE_URL + apiPathPandocFromFile, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileBase64: base64,
        inputFormat: "pdf",
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

  test("pandoc convert PDF to markdown with test files", async () => {
    const pdfPath = join(testDir, "test.pdf")
    const txtPath = join(testDir, "test.txt")

    const pdfBuffer = await readFile(pdfPath)
    const base64 = Buffer.from(pdfBuffer).toString("base64")

    const txtContent = await readFile(txtPath, "utf-8")
    const expectedText = txtContent.trim().toLowerCase()

    const response = await fetch(BASE_URL + apiPathPandocFromFile, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fileBase64: base64,
        inputFormat: "pdf",
        outputFormat: "markdown",
      }),
    })

    expect(response.status).toBe(200)
    const contentType = response.headers.get("Content-Type")
    expect(contentType).toBe("text/markdown")

    const markdown = await response.text()
    expect(markdown.toLowerCase()).toContain(expectedText)
  })
})
