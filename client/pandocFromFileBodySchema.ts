import { pandocInputFormats } from "@client/pandocFormatsInput"
import { pandocOutputFormats } from "@client/pandocFormatsOutput"
import * as a from "valibot"

export const pandocFromFileBodySchema = a.object({
  file: a.string(),
  contentType: a.optional(a.string()),
  inputFormat: a.picklist(pandocInputFormats),
  outputFormat: a.optional(a.picklist(pandocOutputFormats)),
  token: a.optional(a.string()),
})

export type PandocFromFileBodyType = a.InferOutput<typeof pandocFromFileBodySchema>
