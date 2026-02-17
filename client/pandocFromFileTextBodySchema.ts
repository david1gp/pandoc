import { pandocFormatsInputText } from "@client/pandocFormatsInput"
import { pandocFormatsOutputText } from "@client/pandocFormatsOutput"
import * as a from "valibot"


export const pandocFromFileTextBodySchema = a.object({
  fileBase64: a.pipe(a.string(), a.description("Base64 encoded text file content")),
  inputFormat: a.pipe(a.picklist(pandocFormatsInputText), a.description("Input text format (e.g., markdown, html)")),
  outputFormat: a.pipe(a.picklist(pandocFormatsOutputText), a.description("Output text format (e.g., html, markdown)")),
})

export type PandocFromFileTextBodyType = a.InferOutput<typeof pandocFromFileTextBodySchema>
