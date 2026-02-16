import * as v from "valibot"

export const pandocConvertFileResponseSchema = v.object({
  file: v.string(),
})

export type PandocConvertFileResponse = v.InferOutput<typeof pandocConvertFileResponseSchema>
