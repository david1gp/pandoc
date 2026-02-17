import { pandocInputFormats } from "@client/pandocFormatsInput"
import { pandocFormatsOutputBinary } from "@client/pandocFormatsOutput"
import * as a from "valibot"


export const pandocFromFileBinaryBodySchema = a.object({
  fileBase64: a.pipe(a.string(), a.description("Base64 encoded file content (text or binary)")),
  inputFormat: a.pipe(a.picklist(pandocInputFormats), a.description("Input format (e.g., markdown, pdf, docx)")),
  outputFormat: a.pipe(a.picklist(pandocFormatsOutputBinary), a.description("Output binary format (e.g., pdf, docx)")),
})

export type PandocFromFileBinaryBodyType = a.InferOutput<typeof pandocFromFileBinaryBodySchema>
