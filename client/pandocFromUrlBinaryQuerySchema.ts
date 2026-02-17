import { pandocInputFormats } from "@client/pandocFormatsInput"
import { pandocFormatsOutputBinary } from "@client/pandocFormatsOutput"
import * as a from "valibot"


export const pandocFromUrlBinaryQuerySchema = a.object({
  url: a.pipe(a.string(), a.description("URL of the document to convert (text or binary)")),
  inputFormat: a.optional(
    a.pipe(a.picklist(pandocInputFormats), a.description("Input format (e.g., markdown, pdf, docx)"))
  ),
  outputFormat: a.pipe(a.picklist(pandocFormatsOutputBinary), a.description("Output binary format (e.g., pdf, docx)")),
})

export type PandocFromUrlBinaryQueryType = a.InferOutput<typeof pandocFromUrlBinaryQuerySchema>
