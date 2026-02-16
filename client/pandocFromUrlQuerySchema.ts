import { pandocInputFormats } from "@client/pandocFormatsInput"
import { pandocOutputFormats } from "@client/pandocFormatsOutput"
import * as a from "valibot"

export const pandocFromUrlQuerySchema = a.object({
  url: a.string(),
  inputFormat: a.optional(a.picklist(pandocInputFormats)),
  outputFormat: a.optional(a.picklist(pandocOutputFormats)),
  token: a.optional(a.string()),
})

export type PandocFromUrlQueryType = a.InferOutput<typeof pandocFromUrlQuerySchema>
