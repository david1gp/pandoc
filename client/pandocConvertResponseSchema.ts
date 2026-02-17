import * as a from "valibot"

export const pandocResponseSchema = a.object({
  fileBase64: a.string(),
})

export type PandocConvertResponse = a.InferOutput<typeof pandocResponseSchema>
