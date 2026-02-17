import { pandocFormatsInputText } from "@client/pandocFormatsInput"
import { pandocFormatsOutputText } from "@client/pandocFormatsOutput"
import * as a from "valibot"


export const pandocFromUrlTextQuerySchema = a.object({
  url: a.pipe(a.string(), a.description("URL of the text document to convert")),
  inputFormat: a.optional(
    a.pipe(a.picklist(pandocFormatsInputText), a.description("Input text format (e.g., markdown, html)"))
  ),
  outputFormat: a.pipe(a.picklist(pandocFormatsOutputText), a.description("Output text format (e.g., html, markdown)")),
})

export type PandocFromUrlTextQueryType = a.InferOutput<typeof pandocFromUrlTextQuerySchema>
