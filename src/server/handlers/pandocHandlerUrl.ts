import { downloadFileFromUrl } from "@/utils/downloadFileFromUrl"
import type { HonoContext } from "@/utils/HonoContext"
import { isPandocInputFormat } from "@client/pandocFormatsOutput"
import { pandocFromUrlBinaryQuerySchema } from "@client/pandocFromUrlBinaryQuerySchema"
import { pandocFromUrlTextQuerySchema } from "@client/pandocFromUrlTextQuerySchema"
import * as v from "valibot"
import { createResultError } from "~utils/result/Result"
import { handlePandocConversion } from "./pandocHandlerShared"

const op = "pandocHandlerPost"

const pandocFromUrlQuerySchema = v.union([
  pandocFromUrlTextQuerySchema,
  pandocFromUrlBinaryQuerySchema,
])

export async function pandocHandlerUrl(c: HonoContext): Promise<Response> {
  const jsonText = await c.req.text()
  if (!jsonText) {
    const error = createResultError(op, "Missing request body")
    return c.json(error, 400)
  }

  const jsonSchema = v.pipe(v.string(), v.parseJson(), pandocFromUrlQuerySchema)
  const parseResult = v.safeParse(jsonSchema, jsonText)
  if (!parseResult.success) {
    const errorMessage = v.summarize(parseResult.issues)
    const error = createResultError(op, "Invalid request body", errorMessage)
    return c.json(error, 400)
  }

  const input = parseResult.output
  const outputFormat = input.outputFormat ?? "markdown"
  const inputFormat = input.inputFormat ?? getFormatFromUrl(input.url)

  if (!inputFormat) {
    const error = createResultError(
      op,
      "Unable to determine input format. Please provide inputFormat explicitly or ensure the URL contains a file with a recognized extension.",
    )
    return c.json(error, 400)
  }

  const downloadResult = await downloadFileFromUrl(input.url)
  if (!downloadResult.success) {
    const error = createResultError(op, downloadResult.errorMessage)
    return c.json(error, 400)
  }

  const MAX_FILE_SIZE = 100 * 1024 * 1024
  if (downloadResult.data.content.length > MAX_FILE_SIZE) {
    const error = createResultError(
      op,
      "File size exceeds maximum allowed size of 100MB",
      downloadResult.data.content.length.toString(),
    )
    return c.json(error, 413)
  }

  return handlePandocConversion(c, downloadResult.data.content, inputFormat, outputFormat)
}

function getFormatFromUrl(urlString: string): string | undefined {
  try {
    const url = new URL(urlString)
    const pathParts = url.pathname.split("/")
    const fileName = pathParts[pathParts.length - 1]
    if (!fileName) return undefined
    const ext = fileName.split(".").pop()?.toLowerCase()
    if (!ext) return undefined
    if (ext === "md") return "markdown"
    if (isPandocInputFormat(ext)) return ext
    return undefined
  } catch {
    return undefined
  }
}
