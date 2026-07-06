import * as a from "valibot"
import { pandocInputFormats } from "./pandocFormatsInput.js"
import { pandocFormatsOutputText } from "./pandocFormatsOutput.js"

export const pandocFromFileTextBodySchema = a.object({
  fileBase64: a.pipe(a.string(), a.description("Base64 encoded text file content")),
  inputFormat: a.pipe(a.picklist(pandocInputFormats), a.description("Input format (e.g., markdown, pdf, docx)")),
  outputFormat: a.pipe(a.picklist(pandocFormatsOutputText), a.description("Output text format (e.g., html, markdown)")),
})

export type PandocFromFileTextBodyType = a.InferOutput<typeof pandocFromFileTextBodySchema>
