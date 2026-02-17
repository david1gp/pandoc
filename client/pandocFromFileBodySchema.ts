import { pandocInputFormats } from "@client/pandocFormatsInput"
import { pandocOutputFormats } from "@client/pandocFormatsOutput"
import * as a from "valibot"

export const pandocFromFileBodySchema = a.object({
  fileBase64: a.pipe(a.string(), a.description("Base64 encoded file content")),
  inputFormat: a.pipe(a.picklist(pandocInputFormats), a.description("Input document format (e.g., pdf, docx, html)")),
  outputFormat: a.pipe(a.picklist(pandocOutputFormats), a.description("Output document format (e.g., markdown, html, pdf)")),
})

export type PandocFromFileBodyType = a.InferOutput<typeof pandocFromFileBodySchema>
