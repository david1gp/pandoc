import * as a from "valibot"

export const pandocResponseSchema = a.object({
  fileBase64: a.pipe(a.string(), a.description("Base64 encoded converted document")),
})

export type PandocConvertResponse = a.InferOutput<typeof pandocResponseSchema>
