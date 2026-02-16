import * as v from "valibot"
import { pandocOutputFormats } from "@/utils/pandocFormats"

export const inputSchema = v.object({
  url: v.optional(v.string()),
  file: v.optional(v.string()),
  fileName: v.optional(v.string()),
  contentType: v.optional(v.string()),
  outputFormat: v.optional(v.union([v.literal("md"), ...pandocOutputFormats.map((f) => v.literal(f))])),
  token: v.optional(v.string()),
})

export type InputSchema = v.InferOutput<typeof inputSchema>
export type InputSchemaInput = v.InferInput<typeof inputSchema>
