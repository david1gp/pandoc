import { convertWithPandoc } from "@/pandoc/convertWithPandoc"
import type { HonoContext } from "@/utils/HonoContext"
import { isPandocInputFormat, isPandocOutputFormat } from "@client/pandocFormatsOutput"
import { pandocFormatIsText } from "@client/pandocFormatsText"
import { randomUUID } from "node:crypto"
import { readFile, unlink, writeFile } from "node:fs/promises"
import { createResultError } from "~utils/result/Result"

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

  let inputFilePath: string | null = null
  let outputFilePath: string | null = null

  try {
    const now = new Date()
    const datePrefix = now.toISOString().split("T")[0]!
    const sharedUuid = randomUUID()
    const outputExt = outputFormat === "markdown" ? "md" : outputFormat

    inputFilePath = `/tmp/${datePrefix}_${sharedUuid}-in.${inputFormat}`
    await writeFile(inputFilePath, fileContent)

    outputFilePath = `/tmp/${datePrefix}_${sharedUuid}-out.${outputExt}`

    const conversionResult = await convertWithPandoc(inputFilePath, inputFormat, outputFilePath, outputFormat)
    if (!conversionResult.success) {
      const error = createResultError(op, conversionResult.errorMessage)
      return c.json(error, 500)
    }

    if (pandocFormatIsText(outputFormat)) {
      const outputContent = await readFile(outputFilePath, "utf-8")
      return new Response(outputContent, {
        headers: { "Content-Type": getSpecificTextContentType(outputFormat) },
      })
    }

    const fileContentResult = await readFile(outputFilePath)
    const base64 = btoa(String.fromCharCode(...fileContentResult))
    return new Response(base64, {
      headers: { "Content-Type": "text/plain" },
    })
  } catch (e) {
    const error = createResultError(op, e instanceof Error ? e.message : "Unknown error")
    return c.json(error, 500)
  } finally {
    if (inputFilePath) {
      try {
        await unlink(inputFilePath)
      } catch {
        /* ignore */
      }
    }
    if (outputFilePath) {
      try {
        await unlink(outputFilePath)
      } catch {
        /* ignore */
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
