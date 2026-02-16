import type { HonoContext } from "@/utils/HonoContext"
import { pandocFromFileBodySchema } from "@client/pandocFromFileBodySchema"
import * as v from "valibot"
import { createResultError } from "~utils/result/Result"
import { handlePandocConversion } from "./pandocHandlerShared"

const op = "pandocHandlerPut"

export async function pandocHandlerPut(c: HonoContext): Promise<Response> {
  const jsonText = await c.req.text()
  if (!jsonText) {
    const error = createResultError(op, "Missing request body")
    return c.json(error, 400)
  }

  const jsonSchema = v.pipe(v.string(), v.parseJson(), pandocFromFileBodySchema)
  const parseResult = v.safeParse(jsonSchema, jsonText)
  if (!parseResult.success) {
    const errorMessage = v.summarize(parseResult.issues)
    const error = createResultError(op, "Invalid request body", errorMessage)
    return c.json(error, 400)
  }

  const input = parseResult.output
  const outputFormat = input.outputFormat ?? "markdown"
  const inputFormat = input.inputFormat

  if (!input.file) {
    const error = createResultError(op, "File content is empty")
    return c.json(error, 400)
  }

  const decoded = Uint8Array.from(atob(input.file), (ch) => ch.charCodeAt(0))

  return handlePandocConversion(c, decoded, inputFormat, outputFormat)
}
