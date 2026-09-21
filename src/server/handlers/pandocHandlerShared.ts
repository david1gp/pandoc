import { mkdtemp, rm } from "node:fs/promises"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { createResultError } from "@adaptive-ds/result"
import { isPandocInputFormat, isPandocOutputFormat } from "../../../client/pandocFormatsOutput.js"
import { pandocFormatIsText } from "../../../client/pandocFormatsText.js"
import { pandocConvert } from "../../pandoc/pandocConvert.js"
import type { HonoContext } from "../../utils/HonoContext.js"

const op = "pandocHandler"

export async function handlePandocConversion(
  c: HonoContext,
  fileContent: Uint8Array,
  inputFormat: string,
  outputFormat: string,
): Promise<Response> {
  if (outputFormat !== "markdown" && !isPandocOutputFormat(outputFormat)) {
    const error = createResultError(op, `Unsupported output format: ${outputFormat}`)
    return c.json(error, 400)
  }

  if (inputFormat && !isPandocInputFormat(inputFormat)) {
    const error = createResultError(op, `Unsupported input format: ${inputFormat}`)
    return c.json(error, 400)
  }

  let requestTempDirectory: string | null = null

  try {
    const tempFileDirectory = process.env.ADAPTIVE_PANDOC_TEMP_DIRECTORY ?? tmpdir()
    requestTempDirectory = await mkdtemp(join(tempFileDirectory, "adaptive-pandoc-"))
    const inputPath = join(requestTempDirectory, `input.${pandocFormatToExtension(inputFormat)}`)
    const outputPath = join(requestTempDirectory, `output.${pandocFormatToExtension(outputFormat)}`)

    await Bun.write(inputPath, fileContent)

    const conversionResult = await pandocConvert(inputPath, inputFormat, outputPath, outputFormat)
    if (!conversionResult.success) {
      const error = createResultError(op, conversionResult.errorMessage)
      return c.json(error, 500)
    }

    if (pandocFormatIsText(outputFormat)) {
      const outputContent = await Bun.file(outputPath).text()
      return new Response(outputContent, {
        headers: { "Content-Type": getSpecificTextContentType(outputFormat) },
      })
    }

    const outputBytes = await Bun.file(outputPath).arrayBuffer()
    const base64 = Buffer.from(outputBytes).toString("base64")
    return new Response(base64, {
      headers: { "Content-Type": "text/plain" },
    })
  } catch (e) {
    const error = createResultError(op, e instanceof Error ? e.message : "Unknown error")
    return c.json(error, 500)
  } finally {
    if (requestTempDirectory) {
      try {
        await rm(requestTempDirectory, { recursive: true, force: true })
      } catch {
        /* Ignore cleanup failures to preserve the conversion response. */
      }
    }
  }
}

const specificTextContentType: Record<string, string> = {
  markdown: "text/markdown",
  html: "text/html",
  html4: "text/html",
  html5: "text/html",
  json: "application/json",
  ipynb: "application/json",
  latex: "application/x-latex",
  tex: "application/x-tex",
} as const

const getSpecificTextContentType = (format: string): string => specificTextContentType[format] ?? "text/plain"

function pandocFormatToExtension(format: string): string {
  return format === "markdown" ? "md" : format
}
