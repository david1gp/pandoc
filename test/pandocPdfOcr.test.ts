import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { chmod, mkdtemp, readdir, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createApp } from "../src/server/hono.js"

const app = createApp()
const environmentNames = [
  "ADAPTIVE_PANDOC_TEMP_DIRECTORY",
  "PANDOC_CONVERSION_TIMEOUT_MS",
  "PANDOC_PROCESS_TIMEOUT_MS",
  "PANDOC_PDFTOTEXT_COMMAND",
  "PANDOC_PDFTOPPM_COMMAND",
  "PANDOC_TESSERACT_COMMAND",
] as const

let testDirectory = ""
let originalEnvironment = new Map<string, string | undefined>()

beforeAll(async () => {
  testDirectory = await mkdtemp(join(tmpdir(), "adaptive-pandoc-ocr-test-"))
  originalEnvironment = new Map(environmentNames.map((name) => [name, process.env[name]]))

  const pdftotextPath = await writeExecutable(
    "pdftotext",
    `const args = process.argv.slice(2)
const inputPath = args[args.length - 2]
const marker = await Bun.file(inputPath).text()
if (marker.includes("FAIL_PDFTOTEXT")) {
  process.stderr.write("fixture pdftotext failure")
  process.exit(17)
}
if (marker.includes("MIXED")) process.stdout.write("Native page\\f\\f\\f")
else if (marker.includes("TEXT")) process.stdout.write("Native PDF text\\f")
else process.stdout.write("\\f")
`,
  )
  const pdftoppmPath = await writeExecutable(
    "pdftoppm",
    `const args = process.argv.slice(2)
const inputPath = args[args.length - 2]
const outputPrefix = args[args.length - 1]
const pageIndex = args.indexOf("-f")
const pageNumber = args[pageIndex + 1]
const dpiIndex = args.indexOf("-r")
if (args[dpiIndex + 1] !== "200") {
  process.stderr.write("fixture pdftoppm resolution mismatch")
  process.exit(18)
}
const marker = await Bun.file(inputPath).text()
await Bun.write(outputPrefix + ".png", marker + " page=" + pageNumber)
`,
  )
  const tesseractPath = await writeExecutable(
    "tesseract",
    `const imagePath = process.argv[2]
const languageIndex = process.argv.indexOf("-l")
if (process.argv[languageIndex + 1] !== "eng+deu") {
  process.stderr.write("fixture tesseract language mismatch")
  process.exit(18)
}
const marker = await Bun.file(imagePath).text()
if (marker.includes("TIMEOUT")) await Bun.sleep(5000)
if (marker.includes("FAIL_OCR")) {
  process.stderr.write("fixture tesseract failure")
  process.exit(19)
}
if (marker.includes("SCANNED_EN")) process.stdout.write("English OCR text")
else if (marker.includes("SCANNED_DE")) process.stdout.write("Deutscher OCR-Text")
else if (marker.includes("MIXED")) process.stdout.write("OCR page " + marker.match(/page=(\\d+)/)?.[1])
else if (marker.includes("TIMEOUT")) process.stdout.write("late OCR")
`,
  )

  process.env.ADAPTIVE_PANDOC_TEMP_DIRECTORY = testDirectory
  process.env.PANDOC_CONVERSION_TIMEOUT_MS = "2000"
  process.env.PANDOC_PROCESS_TIMEOUT_MS = "100"
  process.env.PANDOC_PDFTOTEXT_COMMAND = pdftotextPath
  process.env.PANDOC_PDFTOPPM_COMMAND = pdftoppmPath
  process.env.PANDOC_TESSERACT_COMMAND = tesseractPath
})

afterAll(async () => {
  for (const name of environmentNames) {
    const value = originalEnvironment.get(name)
    if (value === undefined) delete process.env[name]
    else process.env[name] = value
  }
  await rm(testDirectory, { recursive: true, force: true })
})

describe("PDF OCR conversion", () => {
  test("keeps native text PDFs on the normal conversion path", async () => {
    const response = await convertPdf("TEXT")

    expect(response.status).toBe(200)
    expect((await response.text()).toLowerCase()).toContain("native pdf text")
    await expectTemporaryDirectoryToBeClean()
  })

  test("OCRs an English scanned PDF", async () => {
    const response = await convertPdf("SCANNED_EN")

    expect(response.status).toBe(200)
    expect(await response.text()).toContain("English OCR text")
    await expectTemporaryDirectoryToBeClean()
  })

  test("OCRs a German scanned PDF", async () => {
    const response = await convertPdf("SCANNED_DE")

    expect(response.status).toBe(200)
    expect(await response.text()).toContain("Deutscher OCR-Text")
    await expectTemporaryDirectoryToBeClean()
  })

  test("falls back per page for a mixed PDF", async () => {
    const response = await convertPdf("MIXED")

    expect(response.status).toBe(200)
    const output = await response.text()
    expect(output).toContain("Native page")
    expect(output).toContain("OCR page 2")
    expect(output).toContain("OCR page 3")
    await expectTemporaryDirectoryToBeClean()
  })

  test("returns a controlled failure and cleans up when OCR fails", async () => {
    const response = await convertPdf("FAIL_OCR")

    expect(response.status).toBe(500)
    expect(await response.text()).toContain("fixture tesseract failure")
    await expectTemporaryDirectoryToBeClean()
  })

  test("terminates a timed-out OCR process before cleaning up", async () => {
    const startedAt = Date.now()
    const response = await convertPdf("TIMEOUT")

    expect(response.status).toBe(500)
    expect(await response.text()).toContain("timed out")
    expect(Date.now() - startedAt).toBeLessThan(2000)
    await expectTemporaryDirectoryToBeClean()
  })
})

async function convertPdf(marker: string): Promise<Response> {
  const fileBase64 = Buffer.from(`fixture ${marker}`).toString("base64")
  return app.request("/convert/file", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileBase64, inputFormat: "pdf", outputFormat: "markdown" }),
  })
}

async function expectTemporaryDirectoryToBeClean(): Promise<void> {
  const remainingEntries = (await readdir(testDirectory)).filter((entry) => entry.startsWith("adaptive-pandoc-"))
  expect(remainingEntries).toEqual([])
}

async function writeExecutable(name: string, source: string): Promise<string> {
  const path = join(testDirectory, name)
  await Bun.write(path, `#!/usr/bin/env bun\n${source}`)
  await chmod(path, 0o755)
  return path
}
