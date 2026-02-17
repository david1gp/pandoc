import { pandocInputFormats } from "@client/pandocFormatsInput"
import { pandocOutputFormats } from "@client/pandocFormatsOutput"
import * as a from "valibot"

export const pandocFromFileBodySchema = a.object({
  fileBase64: a.pipe(a.string(), a.description("Base64 encoded file content")),
  contentType: a.optional(a.pipe(a.string(), a.description("MIME type of the input file (e.g., application/pdf)"))),
  inputFormat: a.pipe(a.picklist(pandocInputFormats), a.description("Input document format (e.g., pdf, docx, html)")),
  outputFormat: a.optional(
    a.pipe(a.picklist(pandocOutputFormats), a.description("Output document format (e.g., markdown, html, pdf)")),
  ),
  token: a.optional(a.pipe(a.string(), a.description("Optional authentication token"))),
})

export type PandocFromFileBodyType = a.InferOutput<typeof pandocFromFileBodySchema>
