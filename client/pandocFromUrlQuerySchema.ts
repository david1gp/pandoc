import { pandocInputFormats } from "@client/pandocFormatsInput"
import { pandocOutputFormats } from "@client/pandocFormatsOutput"
import * as a from "valibot"

export const pandocFromUrlQuerySchema = a.object({
  url: a.pipe(a.string(), a.description("URL of the document to convert")),
  inputFormat: a.optional(
    a.pipe(a.picklist(pandocInputFormats), a.description("Input document format (e.g., pdf, docx, html)")),
  ),
  outputFormat: a.pipe(a.picklist(pandocOutputFormats), a.description("Output document format (e.g., markdown, html, pdf)")),
})

export type PandocFromUrlQueryType = a.InferOutput<typeof pandocFromUrlQuerySchema>
