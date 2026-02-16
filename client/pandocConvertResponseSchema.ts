import * as a from "valibot"

export const pandocResponseSchema = a.object({
  url: a.string(),
})

export type PandocConvertResponse = a.InferOutput<typeof pandocResponseSchema>
